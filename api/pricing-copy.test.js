const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

test("page hides prices and routes first-lot interest to WhatsApp", () => {
  assert.doesNotMatch(html, /R\$/);
  assert.doesNotMatch(html, /saldo de/i);
  assert.match(html, /1º lote disponível/i);
  assert.match(html, /condição de abertura da turma/i);
  assert.match(html, /Quero receber a condição no WhatsApp/i);
  assert.doesNotMatch(html, /Ticket médio por atendimento/i);
  assert.doesNotMatch(html, /Plano Lucro Rápido/i);
});
