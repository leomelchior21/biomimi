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
  const questions = getInquiryQuestions(mission);
  return [
    {
      step: "01",
      title: getLanguage() === "pt-BR" ? "Observe e colete" : "Observe and collect",
      copy: getLanguage() === "pt-BR"
        ? `${questions[0]} No seu sketchbook, anote 2-3 estratégias naturais que pareçam relevantes.`
        : `${questions[0]} In your sketchbook, jot down 2-3 natural strategies that seem relevant.`,
    },
    {
      step: "02",
      title: getLanguage() === "pt-BR" ? "Compare e traduza" : "Compare and translate",
      copy: getLanguage() === "pt-BR"
        ? `${questions[1]} Esboce como uma ideia biológica pode virar um movimento de edifício, material ou sistema.`
        : `${questions[1]} Sketch how one biological idea could become a building, material, or system move.`,
    },
    {
      step: "03",
      title: getLanguage() === "pt-BR" ? "Proponha e explique" : "Propose and explain",
      copy: getLanguage() === "pt-BR"
        ? `${questions[2]} Termine com um sketch conceitual legendado e uma defesa curta por escrito.`
        : `${questions[2]} Finish with one labeled concept sketch and a short written defense.`,
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
  return MISSIONS.slice(0, 3)
    .map(
      (mission, index) => `
        <article class="mission-floating-card mission-floating-card-${index + 1}">
          <p>${mission.difficulty}</p>
          <strong>${mission.title}</strong>
          <span>${formatCategory(mission.category)}</span>
        </article>
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

function createMissionReveal(mission) {
  const snapshot = getMissionSnapshot(mission);
  return `
    <section class="mission-feature-grid fade-in">
      <article class="mission-feature-panel mission-feature-story">
        <div class="mission-section-head">
          <p class="mission-eyebrow">${t("yourMission")}</p>
          <button class="mission-inline-action" type="button" id="next-mission">${t("generateAgain")}</button>
        </div>
        <h2 class="mission-feature-title">${mission.title}</h2>
        <p class="mission-feature-copy">${mission.description}</p>
        ${createMetaRow(mission)}

        <div class="mission-context-grid">
          <div class="mission-context-card">
            <p class="mission-micro-label">${t("inquiryFocus")}</p>
            <strong>${getInquiryPrompt(mission)}</strong>
          </div>
          <div class="mission-context-card">
            <p class="mission-micro-label">${t("sketchbookOutcome")}</p>
            <strong>${getStudentOutcome(mission)}</strong>
          </div>
          <div class="mission-context-card">
            <p class="mission-micro-label">${snapshot.challenge}</p>
            <strong>${snapshot.challengeCopy}</strong>
          </div>
          <div class="mission-context-card">
            <p class="mission-micro-label">${snapshot.designGoal}</p>
            <strong>${snapshot.designGoalCopy}</strong>
          </div>
        </div>

        <div class="mission-inquiry-panel">
          <div class="mission-section-head">
            <p class="mission-micro-label">${t("planLabel")}</p>
            <span class="mission-soft-note">${t("planHint")}</span>
          </div>
          <div class="mission-steps-grid mission-steps-grid-tight">
            ${getSketchbookPlan(mission)
              .map((item) => `
                <div class="mission-step-card mission-step-card-compact">
                  <span>${item.step}</span>
                  <strong>${item.title}</strong>
                  <p>${item.copy}</p>
                </div>
              `)
              .join("")}
          </div>
        </div>

        <div class="mission-inspiration-block">
          <div class="mission-section-head">
            <p class="mission-micro-label">${t("cardsToStart")}</p>
            <span class="mission-soft-note">${t("evidenceHint")}</span>
          </div>
          <div class="mission-organism-rail">
            ${createSuggestedOrganismCards(mission)}
          </div>
        </div>
      </article>

      <aside class="mission-feature-panel mission-feature-aside">
        <div class="mission-aside-card">
          <p class="mission-micro-label">${t("workMode")}</p>
          <strong>${getGroupSize(mission.difficulty)}</strong>
          <span>${getLanguage() === "pt-BR" ? "Compare ideias, questione evidências e explique por que seus organismos escolhidos pertencem à mesma família de estratégias." : "Compare ideas, question evidence, and explain why your chosen organisms belong in the same strategy family."}</span>
        </div>
        <div class="mission-aside-card">
          <p class="mission-micro-label">${t("showThinking")}</p>
          <strong>${getDeliverable(mission)}</strong>
          <span>${getLanguage() === "pt-BR" ? "Deixe sua resposta visual, concisa e sustentada por evidências biológicas." : "Make your response visual, concise, and supported by biological evidence."}</span>
        </div>
        <div class="mission-aside-card">
          <p class="mission-micro-label">${t("usefulLenses")}</p>
          <div class="mission-tag-cloud">
            ${mission.tags.map((tag) => `<span class="mission-soft-chip">${formatCategory(tag)}</span>`).join("")}
          </div>
        </div>
        <div class="mission-aside-card">
          <p class="mission-micro-label">${snapshot.realWorld}</p>
          <strong>${snapshot.realWorldCopy}</strong>
        </div>
      </aside>
    </section>
  `;
}

function createSupportSections(activeMission) {
  return `
    <section class="mission-support-grid">
      <article class="mission-support-panel">
        <p class="mission-eyebrow">${t("useSketchbook")}</p>
        <h3>${t("useSketchbookTitle")}</h3>
        <div class="mission-steps-grid">
          <div class="mission-step-card">
            <span>01</span>
            <strong>${t("readUnderline")}</strong>
            <p>${t("readUnderlineCopy")}</p>
          </div>
          <div class="mission-step-card">
            <span>02</span>
            <strong>${t("sketchFromCards")}</strong>
            <p>${t("sketchFromCardsCopy")}</p>
          </div>
          <div class="mission-step-card">
            <span>03</span>
            <strong>${t("proposeIdea")}</strong>
            <p>${t("proposeIdeaCopy")}</p>
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
      </article>
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
              <div class="mission-hero-stack">
                <div class="mission-preview-panel">
                  <p class="mission-micro-label">${t("inquiryPreview")}</p>
                  <strong>${state.mission ? state.mission.title : t("generatePreviewTitle")}</strong>
                  <span>${state.mission ? getInquiryPrompt(state.mission) : t("generatePreviewCopy")}</span>
                </div>
                <div class="mission-floating-stack">
                  ${createHeroPreviewCards()}
                </div>
              </div>
            </aside>
          </div>
        </section>

        ${state.mission ? createMissionReveal(state.mission) : `
          <section class="mission-placeholder-block fade-in">
            <div class="mission-placeholder-copy">
              <p class="mission-eyebrow">${t("yourMission")}</p>
              <h2>${t("generateChallengeTitle")}</h2>
              <p>${t("generateChallengeCopy")}</p>
            </div>
          </section>
        `}

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
  }

  render();
  const unsubscribe = subscribeLanguage(() => render());
  return () => unsubscribe();
}
