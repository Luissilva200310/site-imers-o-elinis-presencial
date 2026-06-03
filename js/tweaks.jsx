// tweaks.jsx — Tweaks for the Bum Sculp 3D immersion page
const { useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "hero": "Dramático",
  "gold": "#c6a04e",
  "titleFont": "Cormorant"
}/*EDITMODE-END*/;

function ensurePlayfair() {
  if (document.getElementById("pf-font")) return;
  const l = document.createElement("link");
  l.id = "pf-font";
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600&display=swap";
  document.head.appendChild(l);
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // hero direction
  useEffect(() => {
    const hero = document.querySelector(".hero");
    if (hero) hero.setAttribute("data-hero", t.hero === "Editorial" ? "a" : "b");
  }, [t.hero]);

  // gold accent tone
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", t.gold);
  }, [t.gold]);

  // heading font
  useEffect(() => {
    if (t.titleFont === "Playfair") {
      ensurePlayfair();
      document.documentElement.style.setProperty("--serif", "'Playfair Display', Georgia, serif");
    } else {
      document.documentElement.style.setProperty("--serif", "'Cormorant Garamond', Georgia, serif");
    }
  }, [t.titleFont]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Hero" />
      <TweakRadio
        label="Direção visual"
        value={t.hero}
        options={["Dramático", "Editorial"]}
        onChange={(v) => setTweak("hero", v)}
      />
      <TweakSection label="Identidade" />
      <TweakColor
        label="Tom do dourado"
        value={t.gold}
        options={["#c6a04e", "#d9bd76", "#b8842f", "#caa86a"]}
        onChange={(v) => setTweak("gold", v)}
      />
      <TweakRadio
        label="Fonte dos títulos"
        value={t.titleFont}
        options={["Cormorant", "Playfair"]}
        onChange={(v) => setTweak("titleFont", v)}
      />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("tweaks-root")).render(<App />);
