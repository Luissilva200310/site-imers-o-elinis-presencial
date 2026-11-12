const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const mainJs = fs.readFileSync(path.join(__dirname, "..", "js", "main.js"), "utf8");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

test("all lead buttons point directly to WhatsApp", () => {
  assert.match(mainJs, /document\.querySelectorAll\("\.js-wa, \.js-lead-trigger"\)/);
  assert.match(mainJs, /https:\/\/wa\.me\/\$\{WA_NUMBER\}\?text=\$\{WA_MSG\}/);
  assert.match(mainJs, /link\.target = "_blank"/);
  assert.doesNotMatch(mainJs, /fetch\(/);
});

test("WhatsApp uses the requested message and current number", () => {
  assert.match(mainJs, /const WA_NUMBER = "5598991529871"/);
  assert.match(
    mainJs,
    /Olá, Tenho Interesse em fazer parte da turma presencial do curso bum sculp\./
  );
});

test("Meta Pixel records page views and lead clicks", () => {
  assert.match(html, /fbq\('init','2513479689152997'\)/);
  assert.match(html, /fbq\('track','PageView'\)/);
  assert.match(html, /facebook\.com\/tr\?id=2513479689152997/);

  assert.match(mainJs, /const META_PIXEL_ID = "2513479689152997"/);
  assert.match(mainJs, /window\.fbq\("trackSingle", META_PIXEL_ID, "Lead"/);
  assert.match(mainJs, /link\.addEventListener\("click", trackLeadClick\)/);
});
