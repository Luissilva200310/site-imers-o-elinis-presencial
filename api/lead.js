const crypto = require("node:crypto");

const CLICKUP_LIST_ID = process.env.CLICKUP_LIST_ID || "901327452649";
const META_API_VERSION = process.env.META_API_VERSION || "v25.0";
const REQUIRED_FIELDS = ["nome", "whatsapp", "formacao", "objetivo", "faturamentoMedio"];

function json(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function cleanText(value) {
  return String(value || "").trim();
}

function normalizePhone(value) {
  const digits = cleanText(value).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("55")) return digits;
  return `55${digits}`;
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function validateLead(payload) {
  const missing = REQUIRED_FIELDS.some((field) => !cleanText(payload && payload[field]));
  if (missing) {
    return { ok: false, error: "Preencha todos os campos obrigatorios." };
  }

  const phone = normalizePhone(payload.whatsapp);
  if (phone.length < 12) {
    return { ok: false, error: "Informe um WhatsApp valido com DDD." };
  }

  return { ok: true };
}

function buildClickUpTask(payload) {
  const phone = normalizePhone(payload.whatsapp);
  const pageUrl = cleanText(payload.pageUrl || payload.url);
  const createdAt = new Date().toISOString();

  return {
    name: `Lead - ${cleanText(payload.nome)}`,
    markdown_description: [
      `**Nome:** ${cleanText(payload.nome)}`,
      `**WhatsApp:** ${phone}`,
      `**Formacao:** ${cleanText(payload.formacao)}`,
      `**Objetivo:** ${cleanText(payload.objetivo)}`,
      `**Faturamento medio:** ${cleanText(payload.faturamentoMedio)}`,
      `**Origem:** ${pageUrl || "Pagina da imersao"}`,
      `**Meta event_id:** ${cleanText(payload.eventId) || "nao informado"}`,
      `**Criado em:** ${createdAt}`,
    ].join("\n"),
  };
}

function buildMetaEvent(payload, requestMeta = {}) {
  const phone = normalizePhone(payload.whatsapp);
  const pageUrl = cleanText(payload.pageUrl || payload.url);
  const userData = {
    ph: sha256(phone),
    client_ip_address: requestMeta.ip,
    client_user_agent: requestMeta.userAgent,
  };

  if (cleanText(payload.fbp)) userData.fbp = cleanText(payload.fbp);
  if (cleanText(payload.fbc)) userData.fbc = cleanText(payload.fbc);

  Object.keys(userData).forEach((key) => {
    if (!userData[key]) delete userData[key];
  });

  return {
    event_name: "Lead",
    event_time: Math.floor(Date.now() / 1000),
    event_id: cleanText(payload.eventId) || crypto.randomUUID(),
    action_source: "website",
    event_source_url: pageUrl,
    user_data: userData,
    custom_data: {
      content_name: "Imersao Bum Sculp 3D",
      formacao: cleanText(payload.formacao),
      objetivo: cleanText(payload.objetivo),
      faturamento_medio: cleanText(payload.faturamentoMedio),
    },
  };
}

async function createClickUpTask(payload) {
  if (!process.env.CLICKUP_TOKEN) {
    throw new Error("CLICKUP_TOKEN nao configurado.");
  }

  const response = await fetch(`https://api.clickup.com/api/v2/list/${CLICKUP_LIST_ID}/task`, {
    method: "POST",
    headers: {
      Authorization: process.env.CLICKUP_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildClickUpTask(payload)),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ClickUp falhou: ${response.status} ${text}`);
  }

  return response.json();
}

async function sendMetaLead(payload, req) {
  if (!process.env.META_PIXEL_ID || !process.env.META_CAPI_TOKEN) return null;

  const event = buildMetaEvent(payload, {
    ip: req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress,
    userAgent: req.headers["user-agent"],
  });

  const response = await fetch(
    `https://graph.facebook.com/${META_API_VERSION}/${process.env.META_PIXEL_ID}/events?access_token=${encodeURIComponent(process.env.META_CAPI_TOKEN)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [event] }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Meta CAPI falhou: ${response.status} ${text}`);
  }

  return response.json();
}

async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { ok: false, error: "Metodo nao permitido." });
  }

  try {
    const payload = req.body || {};
    const validation = validateLead(payload);
    if (!validation.ok) return json(res, 400, validation);

    const clickupTask = await createClickUpTask(payload);
    let metaResult = null;

    try {
      metaResult = await sendMetaLead(payload, req);
    } catch (metaError) {
      console.error("Meta CAPI falhou depois do cadastro no ClickUp:", metaError);
    }

    return json(res, 200, {
      ok: true,
      taskId: clickupTask.id,
      taskUrl: clickupTask.url,
      metaSent: Boolean(metaResult),
    });
  } catch (error) {
    return json(res, 500, {
      ok: false,
      error: "Nao foi possivel registrar seu cadastro agora.",
      detail: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

module.exports = handler;
module.exports.buildClickUpTask = buildClickUpTask;
module.exports.buildMetaEvent = buildMetaEvent;
module.exports.normalizePhone = normalizePhone;
module.exports.validateLead = validateLead;
