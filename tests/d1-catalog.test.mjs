import assert from "node:assert/strict";
import test from "node:test";
import { ACCOUNT_ID, DATABASE_ID, assertD1AuthMode, listGames, queryD1, readGame, safeReceipts, updateGame, validateChanges } from "../scripts/d1-catalog.mjs";

const TOKEN = "mock-secret-value-never-output";
const row = { id: "reflex", title: "REFLEX", tagline: "old", description: "old description", controls_hint: null, version: 3 };

function mockFetch(rows) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init, body: JSON.parse(init.body) });
    const sql = calls.at(-1).body.sql;
    let result = [];
    if (sql.startsWith("SELECT * FROM games")) result = [structuredClone(rows.current)];
    else if (sql.startsWith("UPDATE games")) {
      const params = calls.at(-1).body.params;
      const version = params.at(-1);
      if (rows.current.version === version) {
        const fields = sql.slice("UPDATE games SET ".length, sql.indexOf(", version =")).split(", ");
        fields.forEach((field, index) => { rows.current[field.split(" = ")[0]] = params[index]; });
        rows.current.version += 1;
      }
      result = [{ meta: { changes: 1 } }];
    } else result = [structuredClone(rows.current)];
    return { ok: true, status: 200, json: async () => ({ success: true, result: [{ success: true, results: result }] }) };
  };
  return { fetchImpl, calls };
}

test("Cloudflare target and SQL are fixed to the personal account, D1 and games table", async () => {
  const { fetchImpl, calls } = mockFetch({ current: structuredClone(row) });
  const games = await listGames({ authMode: "api-token", token: TOKEN, fetchImpl });
  assert.equal(games[0].id, row.id);
  assert.equal(calls[0].url, `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`);
  assert.match(calls[0].body.sql, /FROM games/);
  assert.deepEqual(calls[0].body.params, []);
});

test("D1 token mode is explicit and refuses Wrangler or generic Cloudflare credentials", () => {
  assert.throws(() => assertD1AuthMode("profile", {}), /D1_CATALOG_AUTH_MODE=api-token/);
  assert.throws(() => assertD1AuthMode("api-token", { CLOUDFLARE_AUTH_MODE: "profile" }), /refuses Wrangler profile/);
  assert.throws(() => assertD1AuthMode("api-token", { CLOUDFLARE_API_TOKEN: "mock" }), /refuses Wrangler profile/);
  assert.doesNotThrow(() => assertD1AuthMode("api-token", {}));
});

test("reads require one exact safe id and token without exposing token in failures", async () => {
  await assert.rejects(readGame("reflex; DROP TABLE games", { authMode: "api-token", token: TOKEN, fetchImpl: async () => { throw new Error(TOKEN); } }), /valid catalog game id/);
  await assert.rejects(queryD1("SELECT 1", [], { authMode: "api-token", token: "" }), /CLOUDFLARE_D1_API_TOKEN/);
  await assert.rejects(queryD1("SELECT 1", [], { token: TOKEN }), /Set D1_CATALOG_AUTH_MODE=api-token/);
  const { fetchImpl } = mockFetch({ current: structuredClone(row) });
  const actual = await readGame("reflex", { authMode: "api-token", token: TOKEN, fetchImpl });
  assert.equal(actual.id, "reflex");
});

test("updates allow only bounded description fields and reject SQL injection-shaped fields", () => {
  assert.deepEqual(validateChanges({ description: "A game description." }), { description: "A game description." });
  const copy = "First paragraph.\n\nSecond paragraph.\n\nFeatures:\n- Browser play\n- Score tracking";
  assert.equal(validateChanges({ description: copy }).description, copy);
  assert.throws(() => validateChanges({ "description = 'x' --": "bad" }), /Only tagline/);
  assert.throws(() => validateChanges({ published: 1 }), /Only tagline/);
  assert.throws(() => validateChanges({ description: "x".repeat(10_001) }), /no longer than/);
});

test("targeted update snapshots before writing and checks optimistic version plus readback", async (t) => {
  const data = { current: structuredClone(row) };
  const { fetchImpl, calls } = mockFetch(data);
  const backupDir = `/tmp/d1-catalog-test-${process.pid}`;
  t.after(async () => (await import("node:fs/promises")).rm(backupDir, { recursive: true, force: true }));
  const description = "Paragraph one.\n\nParagraph two.\n\nFeatures:\n- Keyboard controls\n- Repeatable score chase";
  const result = await updateGame({ id: "reflex", expectedVersion: 3, changes: { description }, token: TOKEN, fetchImpl, backupDir });
  assert.equal(result.version, 4);
  assert.deepEqual(result.changedFields, ["description"]);
  assert.equal(calls.filter(({ body }) => body.sql.startsWith("SELECT * FROM games")).length, 2);
  assert.equal(calls.filter(({ body }) => body.sql.startsWith("UPDATE games")).length, 1);
  assert.match(calls.find(({ body }) => body.sql.startsWith("UPDATE games")).body.sql, /WHERE id = \? AND version = \?/);
  const revision = calls.find(({ body }) => body.sql.startsWith("INSERT INTO game_revisions"));
  assert.ok(revision, "write must save the private in-D1 before-image before changing the game");
  const snapshot = JSON.parse(revision.body.params[3]);
  assert.equal(snapshot.description, "old description");
  assert.equal(snapshot.version, 3);
  assert.equal(result.revisionSaved, true);
  assert.equal(result.verified, true);
  assert.equal(data.current.description, description);
});

test("public receipts never contain raw catalog copy", () => {
  const [receipt] = safeReceipts([{ ...row, published: 1, availability: "playable", description: "Paragraphs\n\nFeatures:\n- secret draft text" }]);
  assert.equal(receipt.hasFeaturesSection, true);
  assert.equal(receipt.descriptionLength, "Paragraphs\n\nFeatures:\n- secret draft text".length);
  assert.equal(Object.hasOwn(receipt, "description"), false);
  assert.equal(JSON.stringify(receipt).includes("secret draft text"), false);
});

test("version mismatch makes no writes", async () => {
  const { fetchImpl, calls } = mockFetch({ current: structuredClone(row) });
  await assert.rejects(updateGame({ id: "reflex", expectedVersion: 2, changes: { tagline: "new" }, token: TOKEN, fetchImpl }), /changed since it was reviewed/);
  assert.equal(calls.some(({ body }) => body.sql.startsWith("UPDATE")), false);
});
