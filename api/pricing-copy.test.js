const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

test("page hides immersion price and payment terms from public copy", () => {
  const hiddenOfferTerms = [
    /R\$ 3\.500/,
    /R\$ 1\.750/,
    /Op(?:ç|&ccedil;)ão 50 \/ 50/i,
    /Valor da forma(?:ç|&ccedil;)ão/i,
    /Valor total da forma(?:ç|&ccedil;)ão/i,
    /Parcelamento/i,
    /Parcele em até/i,
    /parcela em até/i,
    /paga R\$ 1\.750/i,
  ];

  for (const term of hiddenOfferTerms) {
    assert.doesNotMatch(html, term);
  }

  assert.match(html, /R\$ 2\.200/);
  assert.match(html, /R\$ 4\.400/);
});
