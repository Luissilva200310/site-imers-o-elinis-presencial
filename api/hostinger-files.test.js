const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.join(__dirname, "..");

test("Hostinger package source has a static index", () => {
  for (const relativePath of [
    "index.html",
    ".htaccess",
    "css/styles.css",
    "js/main.js",
  ]) {
    assert.equal(fs.existsSync(path.join(projectRoot, relativePath)), true, `${relativePath} ausente`);
  }
});

test("deployment script builds a static package without the old API", () => {
  const buildScript = fs.readFileSync(
    path.join(projectRoot, "scripts", "build-hostinger.ps1"),
    "utf8"
  );

  assert.doesNotMatch(buildScript, /stageApi/);
  assert.doesNotMatch(buildScript, /settings\.example\.php/);
  assert.doesNotMatch(buildScript, /obrigado\.html/);
});
