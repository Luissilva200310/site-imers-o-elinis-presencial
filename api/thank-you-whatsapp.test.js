const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const html = fs.readFileSync(path.join(__dirname, "..", "obrigado.html"), "utf8");
const mainJs = fs.readFileSync(path.join(__dirname, "..", "js", "main.js"), "utf8");

test("thank-you page points confirmation WhatsApp to the current number", () => {
  assert.match(html, /const confirmationNumber = "559891631745"/);
  assert.doesNotMatch(html, /559891529871/);
  assert.match(mainJs, /const CONFIRMATION_WA_NUMBER = "559891631745"/);
  assert.doesNotMatch(mainJs, /559891529871/);
});
