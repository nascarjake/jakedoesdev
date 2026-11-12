import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
const code = ts.transpileModule(readFileSync(new URL("../worker/projects-api.ts", import.meta.url), "utf8"), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText;
const { handleProjectMedia } = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);
const object = () => ({ size: 4, httpEtag: '"test"', body: "test", writeHttpMetadata(headers) {
  // Simulate stale object metadata: response policy must override it.
  headers.set("cache-control", "public, max-age=31536000, immutable");
} });
const env = { PROJECT_MEDIA: { head: async () => object(), get: async () => object() } };
test("latest manifests revalidate for GET and HEAD, including cache-busting queries", async () => {
  for (const method of ["GET", "HEAD"]) for (const slug of ["stream-dj", "markdown-podcast-studio"]) {
    const response = await handleProjectMedia(new Request(`https://jakedoesdev.com/api/media/projects/releases/${slug}/latest.json?t=123`, { method }), env);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-cache, max-age=0, must-revalidate");
    assert.equal(response.headers.get("etag"), '"test"');
  }
});
test("versioned ZIPs, checksums, and existing media stay immutable", async () => {
  for (const method of ["GET", "HEAD"]) for (const key of ["projects/releases/stream-dj/0.1.7/Stream-DJ-0.1.7-mac-arm64.zip", "projects/releases/stream-dj/0.1.7/SHA256SUMS.txt", "projects/stream-dj/studio.webp"]) {
    const response = await handleProjectMedia(new Request(`https://jakedoesdev.com/api/media/${key}`, { method }), env);
    assert.equal(response.headers.get("cache-control"), "public, max-age=31536000, immutable");
    assert.equal(response.headers.get("accept-ranges"), "bytes");
  }
});
