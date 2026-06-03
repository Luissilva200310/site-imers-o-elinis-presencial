/* Configuracao dos links comerciais.
   Troque estes valores quando tiver o WhatsApp e Instagram oficiais. */
const WA_NUMBER = "5598999999999";
const WA_MSG = encodeURIComponent("Ola! Quero garantir minha vaga na Imersao Bum Sculp 3D do dia 04 de julho.");
const INVESTMENT_WA_NUMBER = "559891529871";
const INVESTMENT_WA_MSG = encodeURIComponent("Olá, vim pelo site! Tenho Interesse em garantir minha vaga na imersão.");
const IG_URL = "https://instagram.com/";

document.querySelectorAll(".js-wa").forEach((link) => {
  link.href = `https://wa.me/${WA_NUMBER}?text=${WA_MSG}`;
});

document.querySelectorAll(".js-wa-investment").forEach((link) => {
  link.href = `https://wa.me/${INVESTMENT_WA_NUMBER}?text=${INVESTMENT_WA_MSG}`;
});

document.querySelectorAll(".js-ig").forEach((link) => {
  link.href = IG_URL;
});

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
