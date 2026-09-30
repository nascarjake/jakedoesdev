import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("publishing and unpublishing explain the static sync delay", () => {
  const source = readFileSync(
    new URL("../app/components/admin/UpdatesStudio.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /after the next static sync/);
  assert.doesNotMatch(source, /Approved and published on \/updates/);
  assert.match(source, /will be removed from \/updates after the next static sync/);
});
