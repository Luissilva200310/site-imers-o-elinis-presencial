const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const mainJs = fs.readFileSync(path.join(__dirname, "..", "js", "main.js"), "utf8");

test("lead submit handles non-json API responses with a friendly message", () => {
  assert.match(mainJs, /Content-Type/i);
  assert.match(mainJs, /servidor local/i);
  assert.doesNotMatch(mainJs, /const result = await response\.json\(\);/);
});
