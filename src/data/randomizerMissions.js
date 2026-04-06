const CITY_CHALLENGES = [
  {
    id: "housing-heat",
    problem: "Overheating in social housing blocks",
    brief: "A dense housing district is trapping heat through dark roofs, poor airflow, and low tree cover, making indoor life harder during long hot seasons.",
  },
  {
    id: "bus-corridor",
    problem: "Crowded and slow bus corridors",
    brief: "A major mobility corridor is overloaded, leaving bus riders with long waits, unreliable journeys, and stressful boarding conditions.",
  },
  {
    id: "flooding-streets",
    problem: "Flash flooding in low-lying streets",
    brief: "A neighborhood floods after intense rain because runoff moves too fast, drainage is overwhelmed, and public space cannot recover quickly.",
  },
  {
    id: "market-waste",
    problem: "Waste overload in market districts",
    brief: "A busy market zone generates food scraps, packaging, and dirty runoff every day, but the district has no visible circular system to manage it.",
  },
  {
    id: "energy-peaks",
    problem: "Energy pressure in apartment towers",
    brief: "Clusters of residential towers hit sharp electricity peaks in the evening, stressing the grid and raising costs for residents.",
  },
  {
    id: "biodiversity-gap",
    problem: "Broken biodiversity corridors",
    brief: "Roads and hard development have cut off movement between two urban green areas, weakening habitat and ecological resilience.",
  },
  {
    id: "cycling-safety",
    problem: "Unsafe everyday cycling routes",
    brief: "A mixed-use district wants more cycling, but unsafe intersections, poor shelter, and conflict with traffic make the route feel risky.",
  },
  {
    id: "housing-noise",
    problem: "Noise stress in compact housing",
    brief: "Residents in tightly packed housing live with traffic noise, poor privacy, and little acoustic relief in shared spaces.",
  },
  {
    id: "water-scarcity",
    problem: "Water scarcity in growing districts",
    brief: "A fast-growing urban edge faces irregular rainfall, high demand, and weak local storage, creating pressure on daily water use.",
  },
  {
    id: "food-logistics",
    problem: "Food waste across downtown deliveries",
    brief: "Restaurants, grocery points, and delivery systems are losing food through spoilage, bad timing, and disconnected storage across the city center.",
  },
  {
    id: "public-square-heat",
    problem: "Unusable public squares during heat waves",
    brief: "A central square empties out in summer because glare, heat, and dry air make it uncomfortable for staying, gathering, or waiting.",
  },
  {
    id: "stormwater-canal",
    problem: "Aging stormwater canal under pressure",
    brief: "An old canal edge is struggling to slow, clean, and redistribute stormwater as nearby neighborhoods become denser.",
  },
  {
    id: "underpass-safety",
    problem: "Unsafe pedestrian underpasses at night",
    brief: "A key walking route feels exposed after dark because of poor orientation, weak comfort, and little sense of collective safety.",
  },
  {
    id: "housing-energy",
    problem: "Weak renewable energy access in housing",
    brief: "A housing district wants local energy generation and storage, but rooftops, shared infrastructure, and use patterns are poorly coordinated.",
  },
  {
    id: "river-edge",
    problem: "Polluted and lifeless river edges",
    brief: "A river running through the city is lined with hard edges, poor water quality, and very little habitat for either people or urban species.",
  },
  {
    id: "vacant-lots",
    problem: "Vacant lots failing to support housing need",
    brief: "Empty urban lots remain fenced and inactive even as the city needs affordable, adaptable living space close to transport and services.",
  },
  {
    id: "ewaste-loop",
    problem: "Electronic waste leaving the city unmanaged",
    brief: "Phones, batteries, and small electronics move through the city without a clear reuse, repair, or safe recovery loop.",
  },
  {
    id: "transit-access",
    problem: "Transit interchanges that block accessibility",
    brief: "A major transfer point is difficult for older adults, children, and people with disabilities because movement is fragmented and tiring.",
  },
  {
    id: "vendor-heat",
    problem: "Street vendors working in extreme heat",
    brief: "Informal vendors need daily income, but the streets where they work offer little shade, water, or microclimate protection.",
  },
  {
    id: "tree-survival",
    problem: "Urban trees failing to survive",
    brief: "New planting efforts keep failing because pavement, heat, compaction, and broken water cycles do not support long-term tree growth.",
  },
];

function createMission(id, cta, problem, brief, questions) {
  return { id, cta, problem, brief, questions };
}

function createSimpleMission(challenge) {
  return createMission(
    `simple-${challenge.id}`,
    `Starter Mission: identify the city pressure and frame a first design direction.`,
    challenge.problem,
    challenge.brief,
    [
      "What is the real urban pressure driving this problem, and who is affected first?",
      "What natural strategy or behavior could inspire a first response to this city condition?",
      "How would you know the place is performing better for people and the city over time?",
    ],
  );
}

function createMakerMission(challenge) {
  return createMission(
    `maker-${challenge.id}`,
    `Maker Mission: invent a city system that can transform this condition.`,
    challenge.problem,
    challenge.brief,
    [
      "What kind of system would you design here, and how should it operate across the city rather than as one isolated object?",
      "How should materials, movement, water, energy, ecology, or housing interact differently once your system is in place?",
      "What would make your proposal feel realistic, teachable, and valuable in daily urban life?",
    ],
  );
}

function createBossMission(challenge) {
  return createMission(
    `boss-${challenge.id}`,
    `Final Boss: respond fast to a city problem that is already under pressure.`,
    challenge.problem,
    challenge.brief,
    [
      "What would you change first if the city needed an urgent but intelligent response?",
      "How could your intervention stay useful under tight limits of time, space, money, or infrastructure?",
      "What tradeoff or risk would need the most careful design thinking as the mission scales up?",
    ],
  );
}

export const RANDOMIZER_MISSION_POOLS = {
  simple: CITY_CHALLENGES.map(createSimpleMission),
  maker: CITY_CHALLENGES.map(createMakerMission),
  boss: CITY_CHALLENGES.map(createBossMission),
};
