const CITY_CHALLENGES = [
  {
    id: "housing-heat",
    area: "Housing",
    problem: "Overheating in social housing blocks",
    brief: "A dense city housing district traps heat through dark roofs, sealed interiors, and too little tree cover, making daily life harder during long hot periods.",
  },
  {
    id: "affordable-infill",
    area: "Housing",
    problem: "Vacant lots failing to support affordable housing",
    brief: "Small empty lots sit unused across the city even though nearby communities need adaptable homes close to work, transit, and schools.",
  },
  {
    id: "bus-corridor",
    area: "Mobility",
    problem: "Crowded and slow bus corridors",
    brief: "One of the city's main bus corridors is overloaded, leaving riders with unreliable travel times, stressful stops, and inefficient boarding.",
  },
  {
    id: "transit-access",
    area: "Mobility",
    problem: "Transit interchanges that block accessibility",
    brief: "A major city transfer point is exhausting for older adults, children, and people with disabilities because movement is fragmented and tiring.",
  },
  {
    id: "flooding-streets",
    area: "Water",
    problem: "Flash flooding in low-lying streets",
    brief: "A city neighborhood floods after intense rain because runoff moves too fast, drains are overwhelmed, and public space cannot recover quickly.",
  },
  {
    id: "market-waste",
    area: "Waste",
    problem: "Waste overload in market districts",
    brief: "A busy city market produces food scraps, packaging, and dirty runoff every day, but the district lacks a visible circular waste system.",
  },
  {
    id: "energy-peaks",
    area: "Energy",
    problem: "Energy pressure in apartment towers",
    brief: "Clusters of city apartment towers hit sharp evening electricity peaks, stressing the grid and raising costs for residents.",
  },
  {
    id: "biodiversity-gap",
    area: "Biodiversity",
    problem: "Broken biodiversity corridors",
    brief: "Roads and hard development have cut off movement between two urban green areas, weakening habitat and ecological resilience across the city.",
  },
  {
    id: "river-edge",
    area: "Biodiversity",
    problem: "Polluted and lifeless river edges",
    brief: "A river running through the city has hard edges, poor water quality, and very little habitat for urban species or people.",
  },
  {
    id: "public-square-heat",
    area: "Public Space",
    problem: "Unusable public squares during heat waves",
    brief: "A central city square empties out in summer because glare, heat, and dry air make it uncomfortable for staying, gathering, or waiting.",
  },
  {
    id: "air-school",
    area: "Air",
    problem: "Toxic air peaks at school entrances",
    brief: "Children arrive at urban schools through corridors of vehicle exhaust, idling engines, and ground-level particulate that spikes during morning drop-off.",
  },
  {
    id: "air-canyon",
    area: "Air",
    problem: "Trapped pollution in dense street canyons",
    brief: "Tall buildings on both sides of narrow city streets block wind flow, allowing vehicle exhaust and heating emissions to concentrate at pedestrian height throughout the day.",
  },
];

const MAKER_AREAS = new Set(["Energy", "Mobility", "Water", "Waste", "Biodiversity", "Air"]);
const MAKER_CHALLENGES = CITY_CHALLENGES.filter((c) => MAKER_AREAS.has(c.area));

function createMission(id, area, cta, problem, brief, questions) {
  return { id, area, cta, problem, brief, questions };
}

function createSimpleMission(challenge) {
  return createMission(
    `simple-${challenge.id}`,
    challenge.area,
    "Open a city challenge, choose a BioMimi guide, and frame your first design direction.",
    challenge.problem,
    challenge.brief,
    [
      "What is the real urban pressure driving this city problem, and who feels it first?",
      "How does your chosen BioMimi's strategy translate into a concrete response for this place?",
      "What small change would show that the place is working better for people and the city over time?",
    ],
  );
}

function createMakerMission(challenge) {
  return createMission(
    `maker-${challenge.id}`,
    challenge.area,
    "Design a city system that can transform this urban condition.",
    challenge.problem,
    challenge.brief,
    [
      "What kind of city system would you design here, and how should it work beyond a single object?",
      `How should ${challenge.area.toLowerCase()} flows interact differently once your idea exists?`,
      "What would make your proposal feel realistic, teachable, and valuable in daily city life?",
    ],
  );
}

function createBossMission(challenge) {
  return createMission(
    `boss-${challenge.id}`,
    challenge.area,
    "Respond fast to a city problem that is already under pressure.",
    challenge.problem,
    challenge.brief,
    [
      "What would you change first if the city needed an urgent but intelligent response right now?",
      "How could your intervention stay useful under tight limits of time, money, space, or infrastructure?",
      "What risk or tradeoff would need the most careful design thinking as the mission scales?",
    ],
  );
}

export const RANDOMIZER_MISSION_POOLS = {
  simple: CITY_CHALLENGES.map(createSimpleMission),
  maker: MAKER_CHALLENGES.map(createMakerMission),
  boss: CITY_CHALLENGES.map(createBossMission),
};
