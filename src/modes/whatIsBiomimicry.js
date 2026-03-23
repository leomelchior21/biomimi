import { ORGANISMS } from "../data/organisms.js";
import { MISSIONS } from "../data/missions.js";
import { t, subscribeLanguage } from "../i18n.js";

const EXAMPLE_IMAGES = [
  "./assets/organisms/a3_kingfisher_beak.png",
  "./assets/organisms/p1_lotus_leaf.png",
  "./assets/organisms/s1_termite_mound.png",
];
const EXAMPLE_COLORS = ["#ef4444", "#22c55e", "#eab308"];

export function renderWhatIsBiomimicry(root) {
  let countObserver = null;
  let revealObserver = null;

  function render() {
    const animalCount  = ORGANISMS.filter((o) => o.category === "Animals").length;
    const plantCount   = ORGANISMS.filter((o) => o.category === "Plants").length;
    const microCount   = ORGANISMS.filter((o) => o.category === "Microorganisms").length;
    const systemsCount = ORGANISMS.filter((o) => o.category === "Systems").length;

    const KINGDOMS = [
      { label: t("whatKAnimals"),  color: "#ef4444", count: animalCount,  desc: t("whatKAnimalsDesc") },
      { label: t("whatKPlants"),   color: "#22c55e", count: plantCount,   desc: t("whatKPlantsDesc") },
      { label: t("whatKMicro"),    color: "#3b82f6", count: microCount,   desc: t("whatKMicroDesc") },
      { label: t("whatKSystems"),  color: "#eab308", count: systemsCount, desc: t("whatKSystemsDesc") },
    ];

    const PRINCIPLES = [
      { icon: "◎", title: t("whatP1Title"), body: t("whatP1Body"), example: t("whatP1Example") },
      { icon: "⟷", title: t("whatP2Title"), body: t("whatP2Body"), example: t("whatP2Example") },
      { icon: "◈", title: t("whatP3Title"), body: t("whatP3Body"), example: t("whatP3Example") },
    ];

    const EXAMPLES = [
      {
        kingdom: t("whatEx1Kingdom"), organism: t("whatEx1Organism"),
        principle: t("whatEx1Principle"), imagePath: EXAMPLE_IMAGES[0], color: EXAMPLE_COLORS[0],
        designTitle: t("whatEx1DesignTitle"), designBody: t("whatEx1DesignBody"), tag: t("whatEx1Tag"),
      },
      {
        kingdom: t("whatEx2Kingdom"), organism: t("whatEx2Organism"),
        principle: t("whatEx2Principle"), imagePath: EXAMPLE_IMAGES[1], color: EXAMPLE_COLORS[1],
        designTitle: t("whatEx2DesignTitle"), designBody: t("whatEx2DesignBody"), tag: t("whatEx2Tag"),
      },
      {
        kingdom: t("whatEx3Kingdom"), organism: t("whatEx3Organism"),
        principle: t("whatEx3Principle"), imagePath: EXAMPLE_IMAGES[2], color: EXAMPLE_COLORS[2],
        designTitle: t("whatEx3DesignTitle"), designBody: t("whatEx3DesignBody"), tag: t("whatEx3Tag"),
      },
    ];

    const ctaBody = t("whatCtaBody")
      .replace("{organisms}", ORGANISMS.length)
      .replace("{missions}", MISSIONS.length);

    root.innerHTML = `
      <section class="what-page">

        <div class="what-hero">
          <div class="what-hero-orb what-hero-orb-a"></div>
          <div class="what-hero-orb what-hero-orb-b"></div>
          <div class="what-hero-orb what-hero-orb-c"></div>
          <p class="eyebrow">${t("exploreEyebrow")}</p>
          <h2 class="what-hero-title">${t("whatHeroTitle")}</h2>
          <p class="what-hero-sub">${t("whatHeroSub")}</p>
          <div class="what-stats-row">
            <div class="what-stat">
              <span class="what-stat-num" data-target="${ORGANISMS.length}">0</span>
              <span>${t("whatStatOrganisms")}</span>
            </div>
            <div class="what-stat">
              <span class="what-stat-num" data-target="4">0</span>
              <span>${t("whatStatKingdoms")}</span>
            </div>
            <div class="what-stat">
              <span class="what-stat-num" data-target="${MISSIONS.length}">0</span>
              <span>${t("whatStatMissions")}</span>
            </div>
          </div>
        </div>

        <section class="what-section what-reveal">
          <p class="what-section-label">${t("whatDefSection")}</p>
          <div class="what-definition-grid">
            <div class="what-pull-quote">
              <p>"${t("whatDefQuote")}"</p>
            </div>
            <div class="what-definition-body">
              <p>${t("whatDefBody1")}</p>
              <p>${t("whatDefBody2")}</p>
            </div>
          </div>
        </section>

        <section class="what-section what-reveal">
          <p class="what-section-label">${t("whatHowSection")}</p>
          <h3 class="what-section-title">${t("whatHowTitle")}</h3>
          <div class="what-tabs" role="tablist">
            ${PRINCIPLES.map((p, i) => `
              <button class="what-tab${i === 0 ? " active" : ""}" data-tab="${i}" role="tab" aria-selected="${i === 0}">${p.title}</button>
            `).join("")}
          </div>
          <div class="what-tab-panels">
            ${PRINCIPLES.map((p, i) => `
              <div class="what-tab-panel${i === 0 ? " active" : ""}" data-panel="${i}" role="tabpanel">
                <div class="what-tab-icon" aria-hidden="true">${p.icon}</div>
                <h4>${p.title}</h4>
                <p>${p.body}</p>
                <div class="what-tab-example">${p.example}</div>
              </div>
            `).join("")}
          </div>
        </section>

        <section class="what-section what-reveal">
          <p class="what-section-label">${t("whatExSection")}</p>
          <h3 class="what-section-title">${t("whatExTitle")}</h3>
          <div class="what-examples-grid">
            ${EXAMPLES.map((ex, i) => `
              <div class="what-example-card" data-example="${i}" tabindex="0" role="button" aria-label="${ex.organism} → ${ex.designTitle}">
                <div class="what-example-front">
                  <div class="what-example-img" style="background: ${ex.color}20; border: 1px solid ${ex.color}30">
                    <img src="${ex.imagePath}" alt="${ex.organism}" loading="lazy">
                  </div>
                  <div class="what-example-info">
                    <span class="what-example-kingdom">${ex.kingdom}</span>
                    <h4>${ex.organism}</h4>
                    <p>${ex.principle}</p>
                  </div>
                  <span class="what-example-hint">${t("whatExHint")}</span>
                </div>
                <div class="what-example-back" style="--ex-color: ${ex.color}">
                  <div class="what-example-back-header">
                    <span class="what-example-arrow" aria-hidden="true">→</span>
                    <h4>${ex.designTitle}</h4>
                  </div>
                  <p>${ex.designBody}</p>
                  <span class="what-example-tag">${ex.tag}</span>
                </div>
              </div>
            `).join("")}
          </div>
        </section>

        <section class="what-section what-reveal">
          <p class="what-section-label">${t("whatKSection")}</p>
          <h3 class="what-section-title">${t("whatKTitle")}</h3>
          <div class="what-kingdoms-grid">
            ${KINGDOMS.map((k) => `
              <div class="what-kingdom-card" style="--k-color: ${k.color}">
                <span class="what-kingdom-count">${k.count}</span>
                <h4>${k.label}</h4>
                <p>${k.desc}</p>
              </div>
            `).join("")}
          </div>
        </section>

        <section class="what-cta what-reveal">
          <div class="what-cta-orb"></div>
          <h3>${t("whatCtaTitle")}</h3>
          <p>${ctaBody}</p>
          <a href="#/explore" class="btn what-cta-btn">${t("whatCtaBtn")}</a>
        </section>

      </section>
    `;

    // Tab switching
    const tabs = root.querySelectorAll(".what-tab");
    const panels = root.querySelectorAll(".what-tab-panel");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const idx = Number(tab.dataset.tab);
        tabs.forEach((t) => { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
        panels.forEach((p) => p.classList.remove("active"));
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");
        panels[idx].classList.add("active");
      });
    });

    // Example card flip
    root.querySelectorAll(".what-example-card").forEach((card) => {
      const toggle = () => card.classList.toggle("flipped");
      card.addEventListener("click", toggle);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
      });
    });

    // Animated counters
    if (countObserver) countObserver.disconnect();
    countObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        let current = 0;
        const step = () => {
          current = Math.min(current + Math.ceil(target / 18), target);
          el.textContent = current;
          if (current < target) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        countObserver.unobserve(el);
      });
    }, { threshold: 0.5 });
    root.querySelectorAll(".what-stat-num").forEach((c) => countObserver.observe(c));

    // Scroll reveal
    if (revealObserver) revealObserver.disconnect();
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    root.querySelectorAll(".what-reveal").forEach((el) => revealObserver.observe(el));
  }

  render();
  const unsubscribe = subscribeLanguage(() => render());

  return () => {
    unsubscribe();
    countObserver?.disconnect();
    revealObserver?.disconnect();
  };
}
