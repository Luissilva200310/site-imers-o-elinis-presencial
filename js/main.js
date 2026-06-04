/* Links comerciais. Tokens e chaves sensiveis ficam nas variaveis da Vercel. */
const WA_NUMBER = "5598999999999";
const WA_MSG = encodeURIComponent("Ola! Quero garantir minha vaga na Imersao Bum Sculp 3D do dia 04 de julho.");
const CONFIRMATION_WA_NUMBER = "559891529871";
const CONFIRMATION_WA_MSG = encodeURIComponent("Ola, fiz meu cadastro pelo site da Imersao Bum Sculp 3D e quero falar com a equipe.");
const IG_URL = "https://instagram.com/";

document.querySelectorAll(".js-wa").forEach((link) => {
  link.href = `https://wa.me/${WA_NUMBER}?text=${WA_MSG}`;
});

document.querySelectorAll(".js-ig").forEach((link) => {
  link.href = IG_URL;
});

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

function buildEventId() {
  if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
  return `lead-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function installMetaPixel(pixelId) {
  if (!pixelId || window.fbq) return;

  (function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

  window.fbq("init", pixelId);
  window.fbq("track", "PageView");
}

async function loadMarketingConfig() {
  try {
    const response = await fetch("/api/config");
    if (!response.ok) return;
    const config = await response.json();
    installMetaPixel(config.metaPixelId);
  } catch (error) {
    // Opening index.html directly will not have Vercel API routes available.
  }
}

loadMarketingConfig();

const topbar = document.getElementById("topbar");
const syncTopbar = () => {
  if (topbar) topbar.classList.toggle("stuck", window.scrollY > 40);
};

syncTopbar();
window.addEventListener("scroll", syncTopbar, { passive: true });

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
);

document.querySelectorAll(".rv").forEach((element) => {
  revealObserver.observe(element);
});

const leadModal = document.getElementById("leadModal");
const leadForm = document.getElementById("leadForm");
const leadFormStatus = document.getElementById("leadFormStatus");
const leadTriggers = document.querySelectorAll(".js-lead-trigger");

function setLeadStatus(message, isError = false) {
  if (!leadFormStatus) return;
  leadFormStatus.textContent = message;
  leadFormStatus.classList.toggle("is-error", isError);
}

function openLeadModal(event) {
  if (event) event.preventDefault();
  if (!leadModal) return;
  leadModal.classList.add("is-open");
  leadModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("lead-modal-open");
  setLeadStatus("");
  const firstInput = leadModal.querySelector("input");
  if (firstInput) firstInput.focus();
}

function closeLeadModal() {
  if (!leadModal) return;
  leadModal.classList.remove("is-open");
  leadModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lead-modal-open");
}

function syncOtherInput(radio) {
  const group = radio.closest("[data-option-group]");
  if (!group) return;

  const otherInput = group.querySelector(".option-other");
  if (!otherInput) return;

  const selected = group.querySelector('input[type="radio"]:checked');
  const isOther = selected && selected.value === "Outro";
  otherInput.hidden = !isOther;
  otherInput.required = Boolean(isOther);
  if (!isOther) otherInput.value = "";
}

function resolveOptionValue(formData, fieldName) {
  const selectedValue = String(formData.get(fieldName) || "").trim();
  if (selectedValue !== "Outro") return selectedValue;
  return String(formData.get(`${fieldName}Outro`) || "").trim();
}

async function readLeadResponse(response) {
  const contentType = response.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) return response.json();

  throw new Error("Este servidor local nao envia cadastros. Para testar o envio real, rode pela Vercel com as variaveis configuradas.");
}

leadTriggers.forEach((trigger) => trigger.addEventListener("click", openLeadModal));
document.querySelectorAll("[data-close-lead]").forEach((button) => {
  button.addEventListener("click", closeLeadModal);
});

document.querySelectorAll('.option-group input[type="radio"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    syncOtherInput(radio);
    const otherInput = radio.closest("[data-option-group]")?.querySelector(".option-other");
    if (radio.value === "Outro" && otherInput) otherInput.focus();
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && leadModal && leadModal.classList.contains("is-open")) {
    closeLeadModal();
  }
});

if (leadForm) {
  leadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = leadForm.querySelector('button[type="submit"]');
    const formData = new FormData(leadForm);
    const eventId = buildEventId();
    const payload = {
      nome: formData.get("nome"),
      whatsapp: formData.get("whatsapp"),
      formacao: resolveOptionValue(formData, "formacao"),
      objetivo: resolveOptionValue(formData, "objetivo"),
      faturamentoMedio: resolveOptionValue(formData, "faturamentoMedio"),
      eventId,
      fbp: getCookie("_fbp"),
      fbc: getCookie("_fbc"),
      pageUrl: window.location.href,
    };

    if (!payload.formacao || !payload.objetivo || !payload.faturamentoMedio) {
      setLeadStatus("Selecione ou preencha todas as opcoes do cadastro.", true);
      leadForm.reportValidity();
      return;
    }

    if (submitButton) submitButton.disabled = true;
    setLeadStatus("Enviando seu cadastro...");

    if (window.fbq) {
      window.fbq("track", "Lead", { content_name: "Imersao Bum Sculp 3D" }, { eventID: eventId });
    }

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await readLeadResponse(response);

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Nao foi possivel enviar seu cadastro.");
      }

      window.location.href = `obrigado.html?event_id=${encodeURIComponent(eventId)}`;
    } catch (error) {
      setLeadStatus(error.message || "Nao foi possivel enviar seu cadastro agora.", true);
      if (submitButton) submitButton.disabled = false;
    }
  });
}
