const STORAGE_KEY = "biomimi-language";

const translations = {
  en: {
    navExplore: "Explore Cards",
    navMission: "Mission Generator",
    navBattle: "Ecosystem Design Battle",
    langEnglish: "English",
    langPortuguese: "PT-BR",
    missionGenerator: "Mission Generator",
    missionHeroTitle: "Ask. Explore. Design.",
    missionHeroSupport: "Get a mission, study how nature solves it, and sketch your own idea.",
    missionCTA: "Give me my mission!",
    missionPillInquiry: "Inquiry based",
    missionPillVisual: "Visual thinking",
    missionPillNature: "Nature to design",
    inquiryPreview: "Inquiry preview",
    generatePreviewTitle: "Generate a brief to reveal the live challenge.",
    generatePreviewCopy: "The generator serves a real problem, a focus lens, and a starting path for investigation.",
    yourMission: "Your Mission",
    generateChallengeTitle: "Generate a challenge to begin the investigation.",
    generateChallengeCopy: "When a mission appears, BioMimi opens a student-facing brief with inquiry questions, suggested organisms, and clues for where to start looking.",
    generateAgain: "Generate again",
    inquiryFocus: "Inquiry focus",
    sketchbookOutcome: "Sketchbook outcome",
    planLabel: "3-step sketchbook plan",
    planHint: "Observe -> compare -> propose",
    cardsToStart: "Cards to start with",
    evidenceHint: "Look for evidence, not just answers",
    workMode: "Work mode",
    showThinking: "Show your thinking",
    usefulLenses: "Useful lenses",
    useSketchbook: "Use your sketchbook",
    useSketchbookTitle: "Keep the work visual, quick, and evidence-based.",
    handIn: "What to hand in",
    handInTitle: "A short, visual response students can finish in class.",
    readUnderline: "Read and underline",
    readUnderlineCopy: "Mark the key problem words in the mission so you know what kind of solution you are hunting for.",
    sketchFromCards: "Sketch from the cards",
    sketchFromCardsCopy: "Draw simple diagrams of the organisms you think matter. Label the part or behavior that could help.",
    proposeIdea: "Propose your idea",
    proposeIdeaCopy: "Turn your notes into one concept sketch and explain why that natural strategy fits the mission best.",
    oneAnnotated: "One annotated sketch",
    oneAnnotatedCopy: "Show the main idea clearly with labels.",
    twoEvidence: "Two pieces of evidence",
    twoEvidenceCopy: "Name the organisms or principles that inspired your solution.",
    oneExplanation: "One short explanation",
    oneExplanationCopy: "Explain why your design could work in the real challenge.",
    clickAgain: "Click again to open",
    tapAgain: "Tap again to open",
  },
  "pt-BR": {
    navExplore: "Explorar Cartas",
    navMission: "Gerador de Missões",
    navBattle: "Batalha de Ecossistemas",
    langEnglish: "English",
    langPortuguese: "PT-BR",
    missionGenerator: "Gerador de Missões",
    missionHeroTitle: "Pergunte. Explore. Crie.",
    missionHeroSupport: "Receba uma missão, veja como a natureza resolve isso e esboce sua própria ideia.",
    missionCTA: "Me dê minha missão!",
    missionPillInquiry: "Aprendizagem investigativa",
    missionPillVisual: "Pensamento visual",
    missionPillNature: "Natureza para design",
    inquiryPreview: "Prévia da investigação",
    generatePreviewTitle: "Gere um desafio para revelar a missão da vez.",
    generatePreviewCopy: "O gerador entrega um problema real, uma lente de foco e um ponto de partida para investigar.",
    yourMission: "Sua Missão",
    generateChallengeTitle: "Gere um desafio para começar a investigação.",
    generateChallengeCopy: "Quando uma missão aparece, o BioMimi abre um briefing com perguntas investigativas, organismos sugeridos e pistas de onde começar.",
    generateAgain: "Gerar outra",
    inquiryFocus: "Foco da investigação",
    sketchbookOutcome: "Resultado no sketchbook",
    planLabel: "Plano de 3 passos no sketchbook",
    planHint: "Observar -> comparar -> propor",
    cardsToStart: "Cartas para começar",
    evidenceHint: "Procure evidências, não respostas prontas",
    workMode: "Modo de trabalho",
    showThinking: "Mostre seu raciocínio",
    usefulLenses: "Lentes úteis",
    useSketchbook: "Use seu sketchbook",
    useSketchbookTitle: "Mantenha o trabalho visual, rápido e baseado em evidências.",
    handIn: "O que entregar",
    handInTitle: "Uma resposta visual curta que pode ser feita em aula.",
    readUnderline: "Leia e sublinhe",
    readUnderlineCopy: "Marque as palavras-chave do problema para saber que tipo de solução você está procurando.",
    sketchFromCards: "Esboce a partir das cartas",
    sketchFromCardsCopy: "Desenhe diagramas simples dos organismos que parecem importantes. Identifique a parte ou o comportamento que pode ajudar.",
    proposeIdea: "Proponha sua ideia",
    proposeIdeaCopy: "Transforme suas anotações em um conceito e explique por que essa estratégia natural combina com a missão.",
    oneAnnotated: "Um sketch anotado",
    oneAnnotatedCopy: "Mostre a ideia principal com rótulos claros.",
    twoEvidence: "Duas evidências",
    twoEvidenceCopy: "Nomeie os organismos ou princípios que inspiraram sua solução.",
    oneExplanation: "Uma explicação curta",
    oneExplanationCopy: "Explique por que seu design pode funcionar no desafio real.",
    clickAgain: "Clique novamente para abrir",
    tapAgain: "Toque novamente para abrir",
  },
};

let currentLanguage = localStorage.getItem(STORAGE_KEY) || "en";
const listeners = new Set();

export function getLanguage() {
  return currentLanguage;
}

export function t(key) {
  return translations[currentLanguage][key] || translations.en[key] || key;
}

export function setLanguage(language) {
  if (!translations[language]) return;
  currentLanguage = language;
  localStorage.setItem(STORAGE_KEY, language);
  document.documentElement.lang = language === "pt-BR" ? "pt-BR" : "en";
  document.body?.setAttribute("data-language", currentLanguage);
  listeners.forEach((listener) => listener(currentLanguage));
}

export function subscribeLanguage(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function initLanguageUI() {
  const toggle = document.querySelector("[data-language-toggle]");
  if (!toggle) return;

  function renderHeaderLanguage() {
    document.querySelector("[data-i18n='navExplore']")?.replaceChildren(document.createTextNode(t("navExplore")));
    document.querySelector("[data-i18n='navMission']")?.replaceChildren(document.createTextNode(t("navMission")));
    document.querySelector("[data-i18n='navBattle']")?.replaceChildren(document.createTextNode(t("navBattle")));

    toggle.querySelectorAll("button").forEach((button) => {
      const isActive = button.dataset.lang === currentLanguage;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  toggle.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      setLanguage(button.dataset.lang);
    });
  });

  renderHeaderLanguage();
  subscribeLanguage(renderHeaderLanguage);
  setLanguage(currentLanguage);
}
