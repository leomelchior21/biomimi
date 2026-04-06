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
    id: "cycling-safety",
    area: "Mobility",
    problem: "Unsafe everyday cycling routes",
    brief: "A mixed-use district wants more cycling, but intersections, exposure to traffic, and weak shelter make the city route feel risky.",
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
    id: "water-scarcity",
    area: "Water",
    problem: "Water scarcity in fast-growing districts",
    brief: "A growing edge of the city faces irregular rainfall, high demand, and weak local storage, putting everyday water use under pressure.",
  },
  {
    id: "stormwater-canal",
    area: "Water",
    problem: "An aging stormwater canal under pressure",
    brief: "An old city canal edge can no longer slow, clean, and redistribute stormwater effectively as nearby neighborhoods become denser.",
  },
  {
    id: "market-waste",
    area: "Waste",
    problem: "Waste overload in market districts",
    brief: "A busy city market produces food scraps, packaging, and dirty runoff every day, but the district lacks a visible circular waste system.",
  },
  {
    id: "food-logistics",
    area: "Waste",
    problem: "Food waste across downtown deliveries",
    brief: "Restaurants, groceries, and delivery systems lose food through spoilage, bad timing, and disconnected storage across the city center.",
  },
  {
    id: "ewaste-loop",
    area: "Waste",
    problem: "Electronic waste leaving the city unmanaged",
    brief: "Phones, batteries, and small electronics move through the city without a clear repair, reuse, or safe recovery loop.",
  },
  {
    id: "energy-peaks",
    area: "Energy",
    problem: "Energy pressure in apartment towers",
    brief: "Clusters of city apartment towers hit sharp evening electricity peaks, stressing the grid and raising costs for residents.",
  },
  {
    id: "housing-energy",
    area: "Energy",
    problem: "Weak renewable energy access in housing",
    brief: "A housing district wants local power generation and storage, but rooftops, shared infrastructure, and use patterns are poorly coordinated.",
  },
  {
    id: "cooling-demand",
    area: "Energy",
    problem: "Cooling demand is rising in civic buildings",
    brief: "Schools, clinics, and other city facilities are using more and more energy for cooling because envelopes, shading, and ventilation perform poorly.",
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
    id: "tree-survival",
    area: "Biodiversity",
    problem: "Urban trees failing to survive",
    brief: "New planting efforts keep failing because pavement, heat, compaction, and broken water cycles do not support long-term tree growth in the city.",
  },
  {
    id: "public-square-heat",
    area: "Public Space",
    problem: "Unusable public squares during heat waves",
    brief: "A central city square empties out in summer because glare, heat, and dry air make it uncomfortable for staying, gathering, or waiting.",
  },
  {
    id: "underpass-safety",
    area: "Public Space",
    problem: "Unsafe pedestrian underpasses at night",
    brief: "A key city walking route feels exposed after dark because of poor orientation, weak comfort, and little sense of collective safety.",
  },
  {
    id: "vendor-heat",
    area: "Public Space",
    problem: "Street vendors working in extreme heat",
    brief: "Informal vendors need daily income, but the city streets where they work offer little shade, water, or microclimate protection.",
  },
];

function createMission(id, area, cta, problem, brief, questions) {
  return { id, area, cta, problem, brief, questions };
}

function createSimpleMission(challenge) {
  return createMission(
    `simple-${challenge.id}`,
    challenge.area,
    "Starter Mission: identify the city pressure and frame a first biomimicry direction.",
    challenge.problem,
    challenge.brief,
    [
      "What is the real urban pressure driving this city problem, and who feels it first?",
      "What organism, ecosystem behavior, or natural principle could inspire a first response here?",
      "What small change would show that the place is working better for people and the city over time?",
    ],
  );
}

function createMakerMission(challenge) {
  return createMission(
    `maker-${challenge.id}`,
    challenge.area,
    "Maker Mission: invent a city system that can transform this urban condition.",
    challenge.problem,
    challenge.brief,
    [
      "What kind of city system would you design here, and how should it work beyond a single object or building?",
      "How should flows like water, materials, movement, energy, ecology, or housing interact differently once your idea exists?",
      "What would make your proposal feel realistic, teachable, and valuable in daily city life?",
    ],
  );
}

function createBossMission(challenge) {
  return createMission(
    `boss-${challenge.id}`,
    challenge.area,
    "Final Boss: respond fast to a city problem that is already under pressure.",
    challenge.problem,
    challenge.brief,
    [
      "What would you change first if the city needed an urgent but intelligent response right now?",
      "How could your intervention stay useful under tight limits of time, money, space, or infrastructure?",
      "What risk or tradeoff would need the most careful design thinking as the mission scales across the city?",
    ],
  );
}

export const RANDOMIZER_MISSION_POOLS = {
  simple: CITY_CHALLENGES.map(createSimpleMission),
  maker: CITY_CHALLENGES.map(createMakerMission),
  boss: CITY_CHALLENGES.map(createBossMission),
};
