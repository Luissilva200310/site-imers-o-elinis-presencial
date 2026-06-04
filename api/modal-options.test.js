const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test("lead modal uses clickable options for qualification fields", () => {
  const expectedOptions = [
    "Biomédica ou Dentista",
    "Enfermeira",
    "Farmacêutica",
    "Esteticista",
    "Dominar a técnica do zero",
    "Aumentar meu faturamento",
    "Oferecer um serviço premium",
    "Me posicionar como referência",
    "Até R$ 3 mil por mês",
    "De R$ 3 mil a R$ 8 mil por mês",
    "De R$ 8 mil a R$ 15 mil por mês",
    "Acima de R$ 15 mil por mês",
  ];

  for (const option of expectedOptions) {
    assert.match(html, new RegExp(`value="${escapeRegExp(option)}"`));
  }

  for (const field of ["formacao", "objetivo", "faturamentoMedio"]) {
    assert.match(html, new RegExp(`name="${field}" type="radio"`));
    assert.match(html, new RegExp(`name="${field}Outro"`));
  }
});
