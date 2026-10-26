import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const code = ts.transpileModule(readFileSync(new URL("../worker/desktop-assets.ts", import.meta.url), "utf8"), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText;
const { handleRedirectedDesktopScreenshot } = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);

test("cached screenshot redirect targets serve bytes directly rather than redirecting into a loop", async () => {
  const calls = [];
  const env = { ASSETS: { async fetch(request) {
    calls.push({ url: request.url, method: request.method, range: request.headers.get("range") });
    return new Response("image fixture", { headers: { "content-type": "image/webp" } });
  } } };
  for (const path of ["stream-dj/studio", "stream-dj/programming", "markdown-podcast-studio/studio"]) {
    const response = await handleRedirectedDesktopScreenshot(new Request(`https://jakedoesdev.com/projects/${path}.webp/?v=1`, { headers: { range: "bytes=0-3" } }), env);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("location"), null);
    assert.equal(response.headers.get("content-type"), "image/webp");
    assert.deepEqual(calls.at(-1), { url: `https://jakedoesdev.com/projects/${path}.webp?v=1`, method: "GET", range: "bytes=0-3" });
  }
  await handleRedirectedDesktopScreenshot(new Request("https://jakedoesdev.com/projects/stream-dj/studio.webp/", { method: "HEAD" }), env);
  assert.equal(calls.at(-1).method, "HEAD");
});

test("the compatibility path cannot intercept other assets, API routes or writes", () => {
  const env = { ASSETS: { fetch() { throw new Error("Unexpected asset interception"); } } };
  for (const path of ["/projects/stream-dj/studio.webp", "/projects/stream-dj/unknown.webp/", "/projects/other/studio.webp/", "/api/admin/updates/", "/projects/stream-dj/../private.webp/"]) {
    assert.equal(handleRedirectedDesktopScreenshot(new Request(`https://jakedoesdev.com${path}`), env), null);
  }
  assert.equal(handleRedirectedDesktopScreenshot(new Request("https://jakedoesdev.com/projects/stream-dj/studio.webp/", { method: "POST" }), env), null);
});
