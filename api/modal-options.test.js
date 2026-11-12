const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

test("the qualification form and modal were removed", () => {
  assert.doesNotMatch(html, /id="leadModal"/);
  assert.doesNotMatch(html, /id="leadForm"/);
  assert.doesNotMatch(html, /Preencher formul[aá]rio/i);
});

test("every enrollment CTA has a direct WhatsApp fallback", () => {
  const ctas = html.match(/<a[^>]+class="[^"]*js-lead-trigger[^"]*"[^>]*>/g) || [];
  assert.ok(ctas.length >= 4);

  for (const cta of ctas) {
    assert.match(cta, /href="https:\/\/wa\.me\/5598991529871\?text=/);
    assert.match(cta, /target="_blank"/);
    assert.match(cta, /rel="noopener noreferrer"/);
  }
});
