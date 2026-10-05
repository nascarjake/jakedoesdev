import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("publishing and unpublishing explain the publishing sync delay", () => {
  const source = readFileSync(
    new URL("../app/components/admin/UpdatesStudio.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /Approved. It will appear on \/updates after the next publishing sync/);
  assert.match(source, /removed from \/updates after the next publishing sync/);
});
