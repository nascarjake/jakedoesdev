import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the landing experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Jacob Clark/);
  assert.match(html, /I BUILD/);
  assert.match(html, /SEE COOL STUFF/);
  assert.match(html, /JOIN DISCORD/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("server-renders the project universe", async () => {
  const response = await render("/universe");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /THE DEVELOPER UNIVERSE/);
  assert.match(html, /Realtime Systems/);
  assert.match(html, /DRAG TO ORBIT/);
});
