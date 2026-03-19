import { MISSIONS } from "../data/missions.js";
import { ORGANISMS, STAT_LABELS, KINGDOM_COLORS } from "../data/organisms.js";
import { getLanguage, subscribeLanguage, t } from "../i18n.js";

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function findOrganism(id) {
  return ORGANISMS.find((organism) => organism.id === id);
}

function formatCategory(category) {
  return category
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function escapeAttr(value) {
  return String(value).replace(/"/g, "&quot;");
}

function getMissionOrganisms(mission) {
  return (mission?.suggestedOrganisms || [])
    .map(findOrganism)
    .filter(Boolean)
    .slice(0, 4);
}

function getTimeEstimate(difficulty) {
  if (getLanguage() === "pt-BR") {
    if (difficulty === "Observation") return "20 min";
    if (difficulty === "Design") return "35 min";
    return "45 min";
  }
  if (difficulty === "Observation") return "20 min";
  if (difficulty === "Design") return "35 min";
  return "45 min";
}

function getGroupSize(difficulty) {
  if (getLanguage() === "pt-BR") {
    if (difficulty === "Observation") return "Individual ou dupla";
    if (difficulty === "Design") return "Duplas ou equipes";
    return "Equipes de 3-4";
  }
  if (difficulty === "Observation") return "Solo or pairs";
  if (difficulty === "Design") return "Pairs or teams";
  return "Teams of 3-4";
}

function getLens(mission) {
  const map = {
    architecture: "Built form",
    surface: "Material intelligence",
    water: "Resource systems",
    materials: "Structural translation",
    "city systems": "Urban metabolism",
  };
  return map[mission.category] || "Biomimicry";
}

function getInquiryPrompt(mission) {
  if (getLanguage() === "pt-BR") {
    return `Como ${mission.statFocusLabel.toLowerCase()} aparece na natureza, e quais organismos podem ajudar você a transformar essa estratégia em uma resposta de design?`;
  }
  return `How does ${mission.statFocusLabel.toLowerCase()} appear in nature, and which organisms could help you translate that strategy into a design response?`;
}

function getDeliverable(mission) {
  if (getLanguage() === "pt-BR") {
    if (mission.difficulty === "Observation") return "1 sketch anotado + 3 notas de evidência";
    if (mission.difficulty === "Design") return "1 concept board + 1 movimento de design traduzido";
    return "1 diagrama de sistema + 1 proposta em equipe";
  }
  if (mission.difficulty === "Observation") return "1 annotated concept sketch + 3 evidence notes";
  if (mission.difficulty === "Design") return "1 concept board + 1 translated design move";
  return "1 systems diagram + 1 team proposal statement";
}

function getStudentOutcome(mission) {
  if (getLanguage() === "pt-BR") {
    if (mission.difficulty === "Observation") return "Mostre o que você observou, quais padrões se repetem e qual movimento de design parece mais promissor.";
    if (mission.difficulty === "Design") return "Proponha um conceito, explique a evidência biológica e defenda por que sua estratégia combina com o desafio.";
    return "Combine mais de uma estratégia de organismo e explique como o sistema completo funcionaria ao longo do tempo.";
  }
  if (mission.difficulty === "Observation") return "Show what you noticed, what patterns repeat, and what design move seems most promising.";
  if (mission.difficulty === "Design") return "Propose a concept, explain the biological evidence, and defend why your strategy fits the challenge.";
  return "Combine more than one organism strategy and explain how the full system would work together over time.";
}

function getInquiryQuestions(mission) {
  if (getLanguage() === "pt-BR") {
    return [
      `O que a natureza está fazendo aqui que pode ajudar a resolver "${mission.title}"?`,
      `Quais organismos mostram ${mission.statFocusLabel.toLowerCase()} com força, e como eles conseguem isso?`,
      `Que movimento de design você pode pegar, adaptar ou combinar na sua solução?`,
    ];
  }
  return [
    `What is nature doing here that helps solve "${mission.title}"?`,
    `Which organisms show strong ${mission.statFocusLabel.toLowerCase()}, and how do they achieve it?`,
    `What design move could you borrow, adapt, or combine for your own solution?`,
  ];
}

function getSketchbookPlan(mission) {
  const ptBR = getLanguage() === "pt-BR";
  return [
    {
      step: "01",
      title: ptBR ? "Cace as pistas na natureza" : "Hunt for clues in nature",
      copy: ptBR
        ? `Abra as cartas BioMimi e procure 2 ou 3 organismos que são craques em ${mission.statFocusLabel.toLowerCase()}. Escreva os nomes deles e anote um truque especial que cada um usa.`
        : `Open the BioMimi cards and find 2 or 3 organisms that are champions at ${mission.statFocusLabel.toLowerCase()}. Write their names and note one special trick each one uses.`,
    },
    {
      step: "02",
      title: ptBR ? "Copie a melhor ideia — da natureza!" : "Borrow the best trick — from nature!",
      copy: ptBR
        ? `Escolha o truque favorito de um organismo. Agora pense: como essa mesma ideia poderia funcionar em um edifício, material ou sistema real? Faça um esboço — quanto mais ideias, melhor!`
        : `Pick your favourite organism's trick. Now ask yourself: how could that same idea work on a real building, material, or city system? Sketch it out — the messier and bolder, the better!`,
    },
    {
      step: "03",
      title: ptBR ? "Mostre o que você descobriu" : "Show what you discovered",
      copy: ptBR
        ? `Faça seu desenho final com legenda e escreva duas frases: uma explicando o que a natureza faz, e outra explicando como você usou essa ideia. Pronto — você acabou de fazer biomimética!`
        : `Draw your final concept with labels and write two sentences: one about what nature does, and one about how you used that idea. That's it — you just did biomimicry design!`,
    },
  ];
}

function getMissionSnapshot(mission) {
  if (getLanguage() === "pt-BR") {
    return {
      challenge: "Desafio",
      challengeCopy: "Projete uma resposta clara para o problema sem copiar a natureza literalmente.",
      designGoal: "Meta de design",
      designGoalCopy: `Priorize ${mission.statFocusLabel.toLowerCase()} enquanto você transforma pistas biológicas em uma ideia aplicável.`,
      realWorld: "Conexão com o mundo real",
      realWorldCopy: mission.insightTemplate,
    };
  }
  return {
    challenge: "Challenge",
    challengeCopy: "Build a clear response to the problem without copying nature literally.",
    designGoal: "Design goal",
    designGoalCopy: `Prioritize ${mission.statFocusLabel.toLowerCase()} as you turn biological clues into an applied concept.`,
    realWorld: "Real-world link",
    realWorldCopy: mission.insightTemplate,
  };
}

export function generateMission(previousId = null) {
  const pool = MISSIONS.filter((mission) => mission.id !== previousId);
  const mission = randomItem(pool.length ? pool : MISSIONS);
  return {
    ...mission,
    statFocusLabel: STAT_LABELS[mission.statFocus],
  };
}

function withDerivedMissionFields(mission) {
  return {
    ...mission,
    statFocusLabel: mission.statFocusLabel || STAT_LABELS[mission.statFocus],
  };
}

function createHeroPreviewCards() {
  const ptBR = getLanguage() === "pt-BR";
  return MISSIONS.slice(0, 3)
    .map(
      (mission) => `
        <div class="mission-hero-sample-card">
          <p class="mission-micro-label">${mission.difficulty}</p>
          <strong>${mission.title}</strong>
          <span>${formatCategory(mission.category)}</span>
        </div>
      `,
    )
    .join("");
}

function createSuggestedOrganismCards(mission) {
  return getMissionOrganisms(mission)
    .map((organism) => `
      <article class="mission-organism-card" style="--mission-organism-accent: ${KINGDOM_COLORS[organism.category]};">
        <img src="${escapeAttr(organism.imagePath)}" alt="${escapeAttr(organism.name)}" loading="lazy" decoding="async">
        <div class="mission-organism-copy">
          <p>${organism.category}</p>
          <strong>${organism.name}</strong>
          <span>${organism.designTakeaway}</span>
        </div>
      </article>
    `)
    .join("");
}

function createMetaRow(mission) {
  return `
    <div class="mission-meta-row fade-in">
      <span class="mission-meta-chip">${mission.difficulty}</span>
      <span class="mission-meta-chip">${formatCategory(mission.category)}</span>
      <span class="mission-meta-chip">${mission.statFocusLabel}</span>
      <span class="mission-meta-chip">${getTimeEstimate(mission.difficulty)}</span>
      <span class="mission-meta-chip">${getLens(mission)}</span>
    </div>
  `;
}

function getDifficultyPips(difficulty) {
  const levels = { Observation: 1, Design: 2, Systems: 3 };
  const count = levels[difficulty] || 1;
  return [1, 2, 3].map((n) => `<span class="mission-diff-pip${n <= count ? " lit" : ""}"></span>`).join("");
}

function createMissionReveal(mission) {
  const snapshot = getMissionSnapshot(mission);
  const steps = getSketchbookPlan(mission);
  const ptBR = getLanguage() === "pt-BR";

  return `
    <section class="mission-feature-grid fade-in">
      <article class="mission-feature-panel mission-feature-story">

        <div class="mission-unlocked-head">
          <span class="mission-unlocked-badge">${ptBR ? "Missão desbloqueada" : "Mission unlocked"}</span>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <span class="mission-meta-chip">${getTimeEstimate(mission.difficulty)}</span>
            <span class="mission-meta-chip">${getLens(mission)}</span>
            <button class="mission-inline-action" type="button" id="next-mission">${t("generateAgain")}</button>
          </div>
        </div>

        <h2 class="mission-feature-title">${mission.title}</h2>
        <p class="mission-story-intro">${mission.insightTemplate}</p>

        <div class="mission-quest-steps">
          ${steps.map((step) => `
            <div class="mission-quest-step">
              <div class="mission-quest-num">${step.step}</div>
              <div class="mission-quest-step-body">
                <strong>${step.title}</strong>
                <p>${step.copy}</p>
              </div>
            </div>
          `).join("")}
        </div>

        <div class="mission-nature-hints">
          <p class="mission-micro-label">${ptBR ? "Pistas da natureza — comece por aqui" : "Nature's hints — start here"}</p>
          <div class="mission-organism-rail">
            ${createSuggestedOrganismCards(mission)}
          </div>
        </div>

      </article>

      <aside class="mission-feature-panel mission-feature-aside">
        <div class="mission-aside-card">
          <p class="mission-micro-label">${ptBR ? "Nível" : "Difficulty"}</p>
          <strong>${mission.difficulty}</strong>
          <div class="mission-difficulty-bar">${getDifficultyPips(mission.difficulty)}</div>
          <span>${getGroupSize(mission.difficulty)}</span>
        </div>
        <div class="mission-aside-card">
          <p class="mission-micro-label">${t("showThinking")}</p>
          <strong>${getDeliverable(mission)}</strong>
          <span>${ptBR ? "Visual, conciso e sustentado por evidências biológicas." : "Visual, concise, and backed by biological evidence."}</span>
        </div>
        <div class="mission-aside-card">
          <p class="mission-micro-label">${t("inquiryFocus")}</p>
          <span>${getInquiryPrompt(mission)}</span>
        </div>
        <div class="mission-aside-card">
          <p class="mission-micro-label">${snapshot.realWorld}</p>
          <strong>${snapshot.realWorldCopy}</strong>
        </div>
        <div class="mission-aside-card">
          <p class="mission-micro-label">${t("usefulLenses")}</p>
          <div class="mission-tag-cloud">
            ${mission.tags.map((tag) => `<span class="mission-soft-chip">${formatCategory(tag)}</span>`).join("")}
          </div>
        </div>
      </aside>
    </section>
  `;
}

function createSupportSections(activeMission) {
  const ptBR = getLanguage() === "pt-BR";
  return `
    <section class="mission-support-grid">
      <article class="mission-support-panel">
        <p class="mission-eyebrow">${t("useSketchbook")}</p>
        <h3>${t("useSketchbookTitle")}</h3>
        <div class="mission-support-rule-list">
          <div class="mission-support-rule">
            <span class="mission-support-rule-num">01</span>
            <div>
              <strong>${t("readUnderline")}</strong>
              <p>${t("readUnderlineCopy")}</p>
            </div>
          </div>
          <div class="mission-support-rule">
            <span class="mission-support-rule-num">02</span>
            <div>
              <strong>${t("sketchFromCards")}</strong>
              <p>${t("sketchFromCardsCopy")}</p>
            </div>
          </div>
          <div class="mission-support-rule">
            <span class="mission-support-rule-num">03</span>
            <div>
              <strong>${t("proposeIdea")}</strong>
              <p>${t("proposeIdeaCopy")}</p>
            </div>
          </div>
        </div>
      </article>

      <article class="mission-support-panel mission-support-panel-soft">
        <p class="mission-eyebrow">${t("handIn")}</p>
        <h3>${t("handInTitle")}</h3>
        <div class="mission-practice-list">
          <div><strong>${t("oneAnnotated")}</strong><span>${t("oneAnnotatedCopy")}</span></div>
          <div><strong>${t("twoEvidence")}</strong><span>${t("twoEvidenceCopy")}</span></div>
          <div><strong>${t("oneExplanation")}</strong><span>${t("oneExplanationCopy")}</span></div>
        </div>
        ${activeMission ? `
          <div class="mission-support-cta">
            <button class="btn mission-support-regen" type="button" id="support-regen">
              ${ptBR ? "Nova missão" : "New mission"}
            </button>
            <span class="mission-soft-note">${ptBR ? "Gere uma missão diferente a qualquer momento." : "Generate a different mission anytime."}</span>
          </div>
        ` : ""}
      </article>
    </section>
  `;
}

function createMissionTeaser() {
  const ptBR = getLanguage() === "pt-BR";
  const teaserMissions = MISSIONS.slice(0, 4);
  return `
    <section class="mission-teaser-block fade-in">
      <div class="mission-teaser-copy">
        <p class="mission-eyebrow">${ptBR ? "Aguardando seu comando" : "Waiting for your command"}</p>
        <h2 class="mission-teaser-title">${ptBR ? "Seu próximo desafio está a um toque." : "Your next challenge is one tap away."}</h2>
        <p class="mission-teaser-sub">${ptBR
          ? "Cada missão é um problema real que a natureza já resolveu em algum lugar. Seu trabalho: encontrar a pista e trazer a ideia para a vida."
          : "Each mission is a real design problem that nature has already solved somewhere. Your job: find the clue and bring the idea to life."
        }</p>
        <div class="mission-teaser-tags">
          ${["Passive cooling", "Coastal defense", "Water harvesting", "Self-cleaning surfaces", "Fracture resistance", "Urban systems"].map((tag) => `<span class="mission-soft-chip">${tag}</span>`).join("")}
        </div>
      </div>
      <div class="mission-teaser-cards">
        ${teaserMissions.map((mission, i) => `
          <div class="mission-teaser-card" style="--card-delay:${i * 55}ms">
            <p class="mission-micro-label">${mission.difficulty}</p>
            <strong>${mission.title}</strong>
            <span>${formatCategory(mission.category)}</span>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

export function renderMissionGenerator(root) {
  const state = {
    mission: null,
  };

  function render() {
    root.innerHTML = `
      <section class="mode-page mission-editorial-page">
        <section class="mission-hero-shell">
          <div class="mission-hero-glow mission-hero-glow-1"></div>
          <div class="mission-hero-glow mission-hero-glow-2"></div>
          <div class="mission-hero-grid">
            <div class="mission-hero-copy">
              <p class="mission-eyebrow">${t("missionGenerator")}</p>
              <h1 class="mission-hero-title">${t("missionHeroTitle")}</h1>
              <p class="mission-hero-support">${t("missionHeroSupport")}</p>
              <div class="mission-hero-actions">
                <button class="btn mission-editorial-primary" type="button" id="generate-mission">${t("missionCTA")}</button>
              </div>
              <div class="mission-hero-pills">
                <span class="mission-soft-chip">${t("missionPillInquiry")}</span>
                <span class="mission-soft-chip">${t("missionPillVisual")}</span>
                <span class="mission-soft-chip">${t("missionPillNature")}</span>
              </div>
            </div>

            <aside class="mission-hero-aside">
              <div class="mission-hero-sample-list">
                <p class="mission-micro-label" style="color:rgba(56,71,104,0.6);margin-bottom:10px;">${getLanguage() === "pt-BR" ? "Exemplos de missão" : "Sample missions"}</p>
                ${createHeroPreviewCards()}
              </div>
            </aside>
          </div>
        </section>

        ${state.mission ? createMissionReveal(state.mission) : createMissionTeaser()}

        ${createSupportSections(state.mission)}
      </section>
    `;

    root.querySelector("#generate-mission")?.addEventListener("click", () => {
      state.mission = generateMission(state.mission?.id ?? null);
      render();
    });

    root.querySelector("#next-mission")?.addEventListener("click", () => {
      state.mission = generateMission(state.mission?.id ?? null);
      render();
    });
    root.querySelector("#support-regen")?.addEventListener("click", () => {
      state.mission = generateMission(state.mission?.id ?? null);
      render();
    });
  }

  render();
  const unsubscribe = subscribeLanguage(() => render());
  return () => unsubscribe();
}
