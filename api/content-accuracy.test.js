const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

test("method copy follows the Mapa 3D and three-pillar positioning", () => {
  assert.match(html, /Mapa 3D e os <span class="it gold">segredos da Fada/);
  assert.match(html, /Lift/);
  assert.match(html, /Projeção/);
  assert.match(html, /Hip Dips/);
  assert.doesNotMatch(html, /Plano Lucro Rápido/i);
});

test("event date and schedule match the December presentation", () => {
  assert.match(html, /12 de dezembro de 2026/i);
  assert.match(html, /9h às 20h/i);
  assert.doesNotMatch(html, /07 de novembro/i);
});

test("edition deliverables include the items promised in the presentation", () => {
  assert.match(html, /scrub/i);
  assert.match(html, /gorro/i);
  assert.match(html, /coffee break/i);
  assert.match(html, /certificado de conclusão/i);
});

test("enrollment includes immediate access to the online preparation", () => {
  assert.match(html, /Acesso imediato/i);
  assert.match(html, /Método Bum Sculp Online/i);
  assert.match(html, /Acesso liberado automaticamente/i);
  assert.match(html, /Seu preparo começa <span class="it gold">antes do presencial/i);
  assert.match(html, /assets\/metodo-bum-sculp-online\.png/);
});

test("audience excludes dentists and scarcity has no fixed quantity", () => {
  assert.doesNotMatch(html, /dentist/i);
  assert.doesNotMatch(html, /\b\d+\s+vagas/i);
  assert.doesNotMatch(html, /grupo de (?:apenas )?\d+ profissionais/i);
  assert.match(html, /vagas (?:são )?limitadas/i);
});

test("results gallery uses nine optimized and lazy-loaded images", () => {
  const resultImages = html.match(/<img src="assets\/resultado-\d{2}\.webp"[^>]*>/g) || [];

  assert.equal(resultImages.length, 9);
  for (const image of resultImages) {
    assert.match(image, /width="1600" height="1600"/);
    assert.match(image, /loading="lazy"/);
    assert.match(image, /decoding="async"/);
  }
  assert.doesNotMatch(html, /assets\/ba-[1-6]\.png/);
});

test("investment section sends first-lot interest to WhatsApp without prices", () => {
  assert.match(html, /1º lote disponível/i);
  assert.match(html, /Quero receber a condição no WhatsApp/i);
  assert.doesNotMatch(html, /R\$/);
});

test("event location shows the complete Jardim Paulista address", () => {
  assert.match(html, /Alameda Joaquim Eugênio de Lima, 739/);
  assert.match(html, /11º andar · Jardim Paulista · São Paulo — SP/);
  assert.match(html, /<address class="event-address">/);
});
