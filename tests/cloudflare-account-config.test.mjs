import assert from "node:assert/strict";
import test from "node:test";
import {
  EXPECTED_ACCOUNT_ID,
  PROFILE,
  projectConfig,
} from "../scripts/verify-cloudflare-account.mjs";

test("Cloudflare release guard pins the personal profile, account, and D1 database", () => {
  assert.equal(PROFILE, "jakedoesdev-personal");
  const config = projectConfig();
  assert.equal(config.accountId, EXPECTED_ACCOUNT_ID);
  assert.match(config.databaseId, /^[0-9a-f-]{36}$/i);
});
