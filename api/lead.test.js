const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildClickUpTask,
  buildMetaEvent,
  normalizePhone,
  validateLead,
} = require("./lead");
const handler = require("./lead");

function createJsonResponse() {
  return {
    statusCode: 0,
    headers: {},
    body: "",
    setHeader(name, value) {
      this.headers[name] = value;
    },
    end(body) {
      this.body = body;
    },
  };
}

test("validateLead requires all lead fields", () => {
  const result = validateLead({
    nome: "Elis",
    whatsapp: "98 91529-871",
    formacao: "",
    objetivo: "Quero captar mais pacientes",
    faturamentoMedio: "R$ 10 mil",
  });

  assert.equal(result.ok, false);
  assert.equal(result.error, "Preencha todos os campos obrigatorios.");
});

test("normalizePhone keeps Brazilian phone digits with country code", () => {
  assert.equal(normalizePhone("(98) 91529-871"), "559891529871");
  assert.equal(normalizePhone("+55 98 91529-871"), "559891529871");
});

test("buildClickUpTask creates a qualified lead task", () => {
  const task = buildClickUpTask({
    nome: "Maria Silva",
    whatsapp: "(98) 91529-871",
    formacao: "Biomedica",
    objetivo: "Aprender harmonizacao glutea",
    faturamentoMedio: "R$ 8.000",
    pageUrl: "https://example.com/",
  });

  assert.equal(task.name, "Lead - Maria Silva");
  assert.match(task.markdown_description, /WhatsApp:\*\* 559891529871/);
  assert.match(task.markdown_description, /Formacao:\*\* Biomedica/);
  assert.match(task.markdown_description, /Origem:\*\* https:\/\/example.com\//);
});

test("buildMetaEvent includes dedupe event id and hashed phone", () => {
  const event = buildMetaEvent(
    {
      nome: "Maria Silva",
      whatsapp: "(98) 91529-871",
      formacao: "Biomedica",
      objetivo: "Aprender harmonizacao glutea",
      faturamentoMedio: "R$ 8.000",
      eventId: "lead-123",
      fbp: "fb.1.123",
      fbc: "fb.1.click",
      pageUrl: "https://example.com/",
    },
    {
      ip: "203.0.113.1",
      userAgent: "Unit Test",
    }
  );

  assert.equal(event.event_name, "Lead");
  assert.equal(event.event_id, "lead-123");
  assert.equal(event.action_source, "website");
  assert.equal(event.event_source_url, "https://example.com/");
  assert.equal(event.user_data.ph, "ceae0690a81467e56766dd9d30b55045f38fa6d82eda7d720841990ab1c9241e");
  assert.equal(event.user_data.fbp, "fb.1.123");
  assert.equal(event.user_data.fbc, "fb.1.click");
});

test("handler registers lead when Meta CAPI fails after ClickUp succeeds", async () => {
  const originalEnv = { ...process.env };
  const originalFetch = global.fetch;
  const originalConsoleError = console.error;

  process.env.CLICKUP_TOKEN = "clickup-token";
  process.env.CLICKUP_LIST_ID = "list-123";
  process.env.META_PIXEL_ID = "pixel-123";
  process.env.META_CAPI_TOKEN = "bad-token";
  process.env.NODE_ENV = "production";

  global.fetch = async (url) => {
    if (String(url).includes("api.clickup.com")) {
      return {
        ok: true,
        json: async () => ({ id: "task-123", url: "https://clickup.example/task-123" }),
      };
    }

    return {
      ok: false,
      status: 401,
      text: async () => "Invalid OAuth access token",
    };
  };
  console.error = () => {};

  const req = {
    method: "POST",
    body: {
      nome: "Maria Silva",
      whatsapp: "(98) 91529-871",
      formacao: "Biomedica",
      objetivo: "Aprender a tecnica",
      faturamentoMedio: "R$ 8.000",
      pageUrl: "https://example.com/",
    },
    headers: { "user-agent": "Unit Test" },
    socket: { remoteAddress: "203.0.113.1" },
  };
  const res = createJsonResponse();

  try {
    await handler(req, res);
  } finally {
    process.env = originalEnv;
    global.fetch = originalFetch;
    console.error = originalConsoleError;
  }

  assert.equal(res.statusCode, 200);
  assert.deepEqual(JSON.parse(res.body), {
    ok: true,
    taskId: "task-123",
    taskUrl: "https://clickup.example/task-123",
    metaSent: false,
  });
});
