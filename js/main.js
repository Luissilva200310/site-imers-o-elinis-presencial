/* Links comerciais. */
const WA_NUMBER = "5598991529871";
const WA_MSG = encodeURIComponent(
  "Olá, Tenho Interesse em fazer parte da turma presencial do curso bum sculp."
);
const WA_URL = `https://wa.me/${WA_NUMBER}?text=${WA_MSG}`;
const IG_URL = "https://instagram.com/";
const META_PIXEL_ID = "2513479689152997";
let leadTracked = false;

const trackLeadClick = () => {
  if (leadTracked || typeof window.fbq !== "function") return;

  leadTracked = true;
  window.fbq("trackSingle", META_PIXEL_ID, "Lead", {
    content_name: "Curso Presencial Bum Sculp 3D - São Paulo",
    content_category: "WhatsApp",
  });
};

document.querySelectorAll(".js-wa, .js-lead-trigger").forEach((link) => {
  link.href = WA_URL;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.addEventListener("click", trackLeadClick);
});

document.querySelectorAll(".js-ig").forEach((link) => {
  link.href = IG_URL;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
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
