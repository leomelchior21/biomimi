export const STAT_KEYS = [
  "smartStructure",
  "toughness",
  "sustainability",
  "adaptability",
  "realWorldImpact",
  "innovation",
];

export const STAT_LABELS = {
  smartStructure: "Smart Structure",
  toughness: "Toughness",
  sustainability: "Sustainability",
  adaptability: "Adaptability",
  realWorldImpact: "Real World Impact",
  innovation: "Innovation",
};

export const TECHNOLOGY_KEYS = [
  "adaptiveSystems",
  "structuralMaterials",
  "waterManagement",
  "surfaceEngineering",
  "climateControl",
  "livingInfrastructure",
  "networkIntelligence",
  "resilienceSystems",
];

export const TECHNOLOGY_LABELS = {
  adaptiveSystems: "Adaptive Systems",
  structuralMaterials: "Structural Materials",
  waterManagement: "Water Management",
  surfaceEngineering: "Surface Engineering",
  climateControl: "Climate Control",
  livingInfrastructure: "Living Infrastructure",
  networkIntelligence: "Network Intelligence",
  resilienceSystems: "Resilience Systems",
};

export const PROBLEM_KEYS = [
  "waterScarcity",
  "floodRisk",
  "airQuality",
  "materialWaste",
  "energyConsumption",
  "urbanHeat",
  "structuralEfficiency",
  "antibacterialSurfaces",
  "windLoad",
  "impactResistance",
  "moistureControl",
  "carbonFootprint",
  "maintenanceCosts",
  "biodiversityLoss",
  "soilErosion",
  "stormwaterRunoff",
  "thermalRegulation",
  "lightManagement",
  "noisePollution",
  "resourceScarcity",
  "extremeClimate",
  "wasteManagement",
  "habitatDestruction",
  "coastalErosion",
  "occupancyComfort",
];

export const PROBLEM_LABELS = {
  waterScarcity: "Water Scarcity",
  floodRisk: "Flood Risk",
  airQuality: "Air Quality",
  materialWaste: "Material Waste",
  energyConsumption: "Energy Consumption",
  urbanHeat: "Urban Heat",
  structuralEfficiency: "Structural Efficiency",
  antibacterialSurfaces: "Antibacterial Surfaces",
  windLoad: "Wind Load",
  impactResistance: "Impact Resistance",
  moistureControl: "Moisture Control",
  carbonFootprint: "Carbon Footprint",
  maintenanceCosts: "Maintenance Costs",
  biodiversityLoss: "Biodiversity Loss",
  soilErosion: "Soil Erosion",
  stormwaterRunoff: "Stormwater Runoff",
  thermalRegulation: "Thermal Regulation",
  lightManagement: "Light Management",
  noisePollution: "Noise Pollution",
  resourceScarcity: "Resource Scarcity",
  extremeClimate: "Extreme Climate",
  wasteManagement: "Waste Management",
  habitatDestruction: "Habitat Destruction",
  coastalErosion: "Coastal Erosion",
  occupancyComfort: "Occupancy Comfort",
};

export const KINGDOM_COLORS = {
  Animals: "#ef4444",
  Plants: "#22c55e",
  Microorganisms: "#3b82f6",
  Systems: "#eab308",
};

function slugifyName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

const create = (id, name, kingdom, principle, application, description, architectureExample, designTakeaway, story, stats, tags, technology, problems) => ({
  id,
  name,
  category: kingdom,
  kingdom,
  principle,
  application,
  description,
  architectureExample,
  designTakeaway,
  story,
  stats,
  tags,
  technology: technology || null,
  problems: problems || [],
  relatedIds: [],
  imagePath: `./assets/organisms/${id}_${slugifyName(name)}.png`,
});

const RAW_ORGANISMS = [
  create("a1", "Gecko", "Animals", "Dry reversible adhesion", "Adaptive facade maintenance", "Millions of micro-hairs on gecko toes create strong contact without glue, letting the animal grip and release almost instantly.", "Reusable climbing pads for building inspection robots and facade maintenance tools.", "Small surface structures can deliver high performance when geometry does the work instead of chemistry.", "A gecko can sprint across glass because its feet act like tiny forests of flexible hooks that switch on only when needed.", { smartStructure: 91, toughness: 70, sustainability: 79, adaptability: 94, realWorldImpact: 85, innovation: 92 }, ["adhesion", "surface", "robotics", "facade", "maintenance"], "adaptiveSystems", ["maintenanceCosts", "structuralEfficiency", "resourceScarcity"]),
  create("a2", "Shark Skin", "Animals", "Flow control through microtexture", "Antibacterial materials", "Denticle-like riblets cut drag and discourage bacteria from settling, all through surface shape rather than toxic coatings.", "Hospital wall films and transit handrails with micro-patterned antibacterial textures.", "Texture can be a performance tool, not just decoration.", "Under a microscope, shark skin looks more like a disciplined field of tiny blades than smooth leather.", { smartStructure: 84, toughness: 74, sustainability: 76, adaptability: 82, realWorldImpact: 91, innovation: 88 }, ["surface", "antibacterial", "flow", "microtexture", "materials"], "surfaceEngineering", ["antibacterialSurfaces", "energyConsumption", "maintenanceCosts"]),
  create("a3", "Kingfisher Beak", "Animals", "Pressure reduction through form", "Lightweight structure", "The kingfisher's beak transitions smoothly from air to water, reducing splash and pressure shock when diving.", "High-speed train nose cones and low-drag civic mobility shelters.", "Elegant transitions between environments reduce wasted energy.", "Japanese engineers famously studied kingfisher dives to quiet the bullet train.", { smartStructure: 88, toughness: 72, sustainability: 74, adaptability: 78, realWorldImpact: 90, innovation: 87 }, ["flow", "transport", "lightweight", "pressure", "mobility"], "structuralMaterials", ["windLoad", "energyConsumption", "noisePollution"]),
  create("a4", "Humpback Whale Flipper", "Animals", "Turbulence tuning with leading-edge bumps", "Adaptive facade", "The flipper's tubercles keep lift high and stall low, helping a huge animal turn gracefully in water.", "Wind turbine blades, ventilating louvers, and facade fins that stay efficient at changing angles.", "Irregularity can improve stability when it is tuned to flow.", "The bumps on a whale's flipper look awkward until you realize they help a 30-ton body pirouette.", { smartStructure: 89, toughness: 76, sustainability: 80, adaptability: 88, realWorldImpact: 84, innovation: 90 }, ["flow", "adaptive", "facade", "wind", "aerodynamics"], "adaptiveSystems", ["windLoad", "energyConsumption", "thermalRegulation"]),
  create("a5", "Namib Desert Beetle", "Animals", "Selective wetting", "Water harvesting", "Hydrophilic bumps and hydrophobic channels help fog condense, gather, and run toward the beetle's mouth.", "Fog-catching building skins and rooftop mesh harvesters for dry cities.", "Opposing material behaviors can cooperate to move scarce resources.", "At dawn the beetle stands on a dune and lets the air do the plumbing.", { smartStructure: 86, toughness: 68, sustainability: 95, adaptability: 84, realWorldImpact: 86, innovation: 91 }, ["water", "harvesting", "fog", "surface", "desert"], "waterManagement", ["waterScarcity", "moistureControl", "extremeClimate"]),
  create("a6", "Spider Silk", "Animals", "Hierarchical fiber performance", "Lightweight structure", "Spider silk combines crystalline and elastic regions to be both resilient and remarkably strong for its weight.", "Tensile membranes, impact-resistant composites, and lightweight cable systems.", "Performance emerges from layering scales of structure, not from one heroic material property.", "A spider spins a high-performance fiber at room temperature with water-based chemistry.", { smartStructure: 92, toughness: 95, sustainability: 81, adaptability: 82, realWorldImpact: 83, innovation: 93 }, ["fiber", "lightweight", "tension", "materials", "resilience"], "structuralMaterials", ["structuralEfficiency", "materialWaste", "energyConsumption"]),
  create("a7", "Abalone Shell", "Animals", "Toughness through layered fracture paths", "Flood resilience", "Nacre uses stacked mineral plates and soft interfaces to redirect cracks and absorb impacts.", "Flood-barrier cladding, safer coastal shelters, and impact-resilient wall assemblies.", "Break resistance often comes from controlled weakness between layers.", "The shell is made of brittle ingredients, yet together they become famously hard to shatter.", { smartStructure: 90, toughness: 93, sustainability: 72, adaptability: 74, realWorldImpact: 79, innovation: 85 }, ["layered", "impact", "resilience", "coastal", "materials"], "resilienceSystems", ["impactResistance", "coastalErosion", "floodRisk"]),
  create("a8", "Mussel Adhesion", "Animals", "Wet-bond chemistry", "Flood resilience", "Mussels create protein-based byssal threads that anchor to wet, rough surfaces even in turbulent water.", "Underwater repair compounds and damp-site construction sealants.", "Nature often solves impossible edge cases by combining chemistry and structure.", "A mussel stays attached where most human glues fail instantly.", { smartStructure: 85, toughness: 83, sustainability: 78, adaptability: 86, realWorldImpact: 84, innovation: 89 }, ["adhesion", "water", "repair", "coastal", "materials"], "surfaceEngineering", ["coastalErosion", "moistureControl", "maintenanceCosts"]),
  create("a9", "Ant Snap Jaw", "Animals", "Energy storage and snap release", "Adaptive facade", "Fast snapping jaws store elastic energy and release it in a burst, allowing quick response with little constant effort.", "Responsive shading clips and low-energy mechanical release systems.", "Stored energy can replace continuous power.", "Some ant jaws act like tiny spring-loaded machines waiting for the exact moment to fire.", { smartStructure: 82, toughness: 79, sustainability: 76, adaptability: 85, realWorldImpact: 71, innovation: 88 }, ["kinetics", "adaptive", "mechanics", "release", "facade"], "adaptiveSystems", ["energyConsumption", "thermalRegulation", "occupancyComfort"]),
  create("a10", "Woodpecker Skull", "Animals", "Impact diffusion", "Passive cooling", "Layered bone, tongue structure, and beak geometry distribute repeated shock away from the brain.", "Helmet design, equipment casings, and resilient mounting systems for urban sensors.", "Shock management is about pathways, not just padding.", "A woodpecker hits wood all day because its whole head is a coordinated impact system.", { smartStructure: 87, toughness: 92, sustainability: 73, adaptability: 77, realWorldImpact: 78, innovation: 82 }, ["impact", "resilience", "protection", "sensor", "mounting"], "resilienceSystems", ["impactResistance", "extremeClimate", "airQuality"]),
  create("p1", "Lotus Leaf", "Plants", "Self-cleaning through micro-roughness", "Self-cleaning surfaces", "Microscopic wax structures trap air and make water roll off, carrying dirt away.", "Self-cleaning glass, low-maintenance solar panels, and facade coatings.", "A building can stay clean by shaping water behavior instead of scheduling more maintenance.", "The lotus grows in muddy water but presents itself as if polished every morning.", { smartStructure: 82, toughness: 63, sustainability: 94, adaptability: 88, realWorldImpact: 92, innovation: 88 }, ["self-cleaning", "surface", "water", "maintenance", "solar"], "surfaceEngineering", ["maintenanceCosts", "lightManagement", "waterScarcity"]),
  create("p2", "Cactus", "Plants", "Shade plus fog-channeling", "Water harvesting", "Spines reduce heat gain, create tiny shaded zones, and can guide condensed droplets toward the stem.", "Desert canopies, water-guiding facade ribs, and shaded public furniture.", "One element can regulate multiple environmental flows at once.", "What looks like a defensive thorn field is also a climate-control and water-routing system.", { smartStructure: 86, toughness: 77, sustainability: 93, adaptability: 91, realWorldImpact: 81, innovation: 84 }, ["water", "shade", "desert", "cooling", "harvesting"], "waterManagement", ["waterScarcity", "urbanHeat", "extremeClimate"]),
  create("p3", "Pine Cone", "Plants", "Humidity-responsive opening", "Adaptive facade", "Layered fibers expand at different rates, letting scales open and close without muscles or electronics.", "Rain-responsive vents, classroom shutters, and passive air inlets.", "Materials can be programmed to move simply by how they are assembled.", "A pine cone behaves like a tiny weather robot, powered only by moisture.", { smartStructure: 88, toughness: 71, sustainability: 96, adaptability: 87, realWorldImpact: 83, innovation: 90 }, ["adaptive", "humidity", "ventilation", "materials", "facade"], "adaptiveSystems", ["thermalRegulation", "airQuality", "energyConsumption"]),
  create("p4", "Bamboo", "Plants", "Strength with hollow gradients", "Lightweight structure", "Dense fibers near the outside and a hollow core produce excellent stiffness with low material use.", "Lightweight frames, modular classrooms, and tube-based civic structures.", "Putting material where stress is highest creates elegant efficiency.", "Bamboo grows like a fast-built tower, tuned by nature for bending and surviving storms.", { smartStructure: 91, toughness: 86, sustainability: 97, adaptability: 85, realWorldImpact: 89, innovation: 80 }, ["lightweight", "frame", "carbon", "structure", "modular"], "structuralMaterials", ["structuralEfficiency", "carbonFootprint", "materialWaste"]),
  create("p5", "Water Lily", "Plants", "Radial rib networks", "Lightweight structure", "The underside of the giant lily uses crossing ribs to spread loads across a thin floating surface.", "Grid-shell roofs, spanning canopies, and lightweight floor systems.", "Branching support networks outperform flat slabs when they direct force intelligently.", "Victorian engineers looked under a leaf and saw a building system.", { smartStructure: 93, toughness: 74, sustainability: 84, adaptability: 76, realWorldImpact: 86, innovation: 82 }, ["ribs", "span", "grid", "lightweight", "canopy"], "structuralMaterials", ["structuralEfficiency", "lightManagement", "waterScarcity"]),
  create("p6", "Mangrove", "Plants", "Root mesh for wave moderation", "Flood resilience", "Mangrove roots slow water, capture sediment, and create a distributed edge between land and sea.", "Living shorelines, flood-buffer parks, and coastal classroom landscapes.", "Soft distributed systems can outperform hard single-purpose barriers.", "A mangrove forest builds protection by growing a woven wall that also becomes habitat.", { smartStructure: 89, toughness: 88, sustainability: 98, adaptability: 90, realWorldImpact: 94, innovation: 84 }, ["flood", "coastal", "sediment", "resilience", "living-infrastructure"], "livingInfrastructure", ["coastalErosion", "soilErosion", "habitatDestruction"]),
  create("p7", "Baobab", "Plants", "Water storage in structure", "Flood resilience", "Baobabs store huge amounts of water in spongy trunks and survive long dry periods by buffering extremes.", "Urban reservoirs, sponge-city landscapes, and resilient neighborhood water hubs.", "Storage capacity is a form of resilience, not just infrastructure.", "A baobab is part tree, part seasonal water bank.", { smartStructure: 83, toughness: 81, sustainability: 91, adaptability: 87, realWorldImpact: 78, innovation: 79 }, ["storage", "water", "resilience", "sponge-city", "climate"], "waterManagement", ["waterScarcity", "extremeClimate", "soilErosion"]),
  create("p8", "Sunflower Spiral", "Plants", "Packing by growth rules", "Adaptive facade", "Spiral phyllotaxis places seeds at angles that maximize density and even exposure.", "Solar arrays, skylight fields, and optimized seating or planting plans.", "Simple growth rules can organize complex layouts without central oversight.", "A sunflower solves space planning while still making room for every seed.", { smartStructure: 87, toughness: 67, sustainability: 88, adaptability: 83, realWorldImpact: 77, innovation: 86 }, ["pattern", "solar", "layout", "optimization", "adaptive"], "climateControl", ["lightManagement", "thermalRegulation", "urbanHeat"]),
  create("p9", "Venus Flytrap", "Plants", "Snap-through mechanics", "Adaptive facade", "Curved leaves hold elastic energy until a trigger causes a fast geometry flip.", "Rapid-opening vents, safety latches, and low-energy emergency shading systems.", "Fast movement can be created through geometry rather than motors.", "A plant that appears still becomes dramatic once its hidden spring is released.", { smartStructure: 84, toughness: 72, sustainability: 82, adaptability: 79, realWorldImpact: 70, innovation: 91 }, ["kinetics", "release", "responsive", "facade", "mechanics"], "adaptiveSystems", ["occupancyComfort", "airQuality", "thermalRegulation"]),
  create("p10", "Moss", "Plants", "Water-retaining surfaces", "Passive cooling", "Moss communities hold moisture, cool their surroundings, and recover quickly after drying.", "Cooling walls, bioreceptive roofs, and moisture-buffering learning courtyards.", "Living surfaces can act as climate infrastructure at the neighborhood scale.", "Moss works like a tiny sponge blanket, slowing heat and holding onto precious water.", { smartStructure: 78, toughness: 66, sustainability: 95, adaptability: 92, realWorldImpact: 76, innovation: 81 }, ["cooling", "moisture", "living-surface", "roof", "microclimate"], "livingInfrastructure", ["airQuality", "biodiversityLoss", "thermalRegulation"]),
  create("m1", "Diatoms", "Microorganisms", "Porous strength at tiny scales", "Lightweight structure", "These algae build ornate silica shells with precise pores that balance protection, flow, and lightness.", "Porous facade panels, daylight filters, and lightweight shell structures.", "Precision porosity can improve both performance and material efficiency.", "A diatom is like a glass cathedral built by a single cell.", { smartStructure: 95, toughness: 80, sustainability: 83, adaptability: 75, realWorldImpact: 80, innovation: 92 }, ["porous", "shell", "lightweight", "filter", "daylight"], "structuralMaterials", ["lightManagement", "structuralEfficiency", "airQuality"]),
  create("m2", "Mycelium", "Microorganisms", "Networked growth into material", "Antibacterial materials", "Fungal threads bind waste fibers into lightweight, compostable composites and insulation panels.", "Classroom acoustic panels, biodegradable packaging, and low-carbon interior systems.", "Materials can be grown from local waste streams rather than extracted and fired.", "What we call a mushroom is only the fruiting tip of a giant underground maker-space.", { smartStructure: 84, toughness: 74, sustainability: 98, adaptability: 89, realWorldImpact: 91, innovation: 93 }, ["grown-material", "circular", "interior", "acoustic", "biomaterial"], "livingInfrastructure", ["wasteManagement", "materialWaste", "carbonFootprint"]),
  create("m3", "Biofilm", "Microorganisms", "Collective surface intelligence", "Antibacterial materials", "Biofilms coordinate through chemical signaling and build protective matrices that change behavior as conditions shift.", "Distributed sensor coatings and surfaces that detect contamination patterns.", "Collective intelligence can emerge from local chemical conversations.", "A biofilm is less like slime and more like a neighborhood with shared rules.", { smartStructure: 79, toughness: 84, sustainability: 81, adaptability: 92, realWorldImpact: 74, innovation: 90 }, ["collective", "surface", "sensor", "signaling", "antibacterial"], "surfaceEngineering", ["antibacterialSurfaces", "airQuality", "moistureControl"]),
  create("m4", "Cyanobacteria", "Microorganisms", "Solar chemistry as infrastructure", "Passive cooling", "These ancient organisms turn light, water, and carbon dioxide into biomass while reshaping atmospheric conditions.", "Carbon-capturing facade bioreactors and educational living walls.", "Building skins can become productive participants in urban metabolism.", "Cyanobacteria changed the whole planet long before cities existed.", { smartStructure: 76, toughness: 65, sustainability: 97, adaptability: 88, realWorldImpact: 85, innovation: 89 }, ["solar", "carbon", "bioreactor", "living-wall", "cooling"], "climateControl", ["carbonFootprint", "airQuality", "urbanHeat"]),
  create("m5", "Extremophile Archaea", "Microorganisms", "Performance in harsh conditions", "Adaptive facade", "Extremophiles use robust membranes and enzymes that stay functional under heat, salt, or acidity that would destroy most life.", "Materials for desert schools, geothermal districts, and harsh-site protective coatings.", "Designing for extremes means learning from systems that are already comfortable there.", "An extremophile treats boiling springs and acidic pools as ordinary neighborhoods.", { smartStructure: 77, toughness: 93, sustainability: 79, adaptability: 97, realWorldImpact: 78, innovation: 88 }, ["extreme", "desert", "durability", "adaptive", "coating"], "resilienceSystems", ["extremeClimate", "waterScarcity", "resourceScarcity"]),
  create("m6", "Tardigrade Protein Shield", "Microorganisms", "Protective stabilization", "Flood resilience", "Tardigrade proteins can help stabilize biological materials during dehydration and radiation exposure.", "Protective storage systems, resilient medical kits, and robust field-deployment materials.", "Stability can come from molecular guardians rather than heavy hardware.", "The tardigrade survives by turning vulnerability into a temporary pause button.", { smartStructure: 74, toughness: 94, sustainability: 77, adaptability: 98, realWorldImpact: 72, innovation: 90 }, ["protection", "stability", "resilience", "storage", "extreme"], "resilienceSystems", ["extremeClimate", "impactResistance", "thermalRegulation"]),
  create("m7", "Bacterial Cellulose", "Microorganisms", "Self-assembled fiber sheets", "Antibacterial materials", "Certain bacteria grow pure cellulose membranes with high strength, low weight, and tunable transparency.", "Translucent partitions, medical-grade liners, and biodegradable product skins.", "Manufacturing can mean guiding organisms to assemble precision layers for us.", "A culture tray can become a material workshop if the right microbes are invited in.", { smartStructure: 86, toughness: 78, sustainability: 95, adaptability: 84, realWorldImpact: 80, innovation: 87 }, ["fiber", "grown-material", "partition", "biomaterial", "translucent"], "livingInfrastructure", ["materialWaste", "carbonFootprint", "airQuality"]),
  create("m8", "Slime Mould", "Microorganisms", "Routing by feedback", "Adaptive facade", "Slime mould grows efficient networks between food sources and abandons unproductive paths without needing a central planner.", "Transit planning tools, adaptive utility routing, and responsive district networks.", "Efficient systems can emerge by rewarding useful paths and letting the rest fade.", "Give slime mould oats and a maze, and it starts acting like a transport planner.", { smartStructure: 88, toughness: 62, sustainability: 82, adaptability: 94, realWorldImpact: 88, innovation: 96 }, ["network", "routing", "optimization", "adaptive", "urban"], "networkIntelligence", ["resourceScarcity", "energyConsumption", "urbanHeat"]),
  create("m9", "Photosynthetic Algae", "Microorganisms", "Living energy capture", "Water harvesting", "Algae can produce biomass, shade, and environmental feedback while growing in transparent panels or tubes.", "Building-integrated photobioreactors and educational facades that teach circular design.", "Energy systems can also be teaching tools and living habitats.", "An algae panel can shade a classroom while quietly making biomass in the sun.", { smartStructure: 73, toughness: 61, sustainability: 96, adaptability: 86, realWorldImpact: 82, innovation: 91 }, ["energy", "water", "bioreactor", "living-facade", "education"], "climateControl", ["energyConsumption", "airQuality", "urbanHeat"]),
  create("m10", "Quorum Sensing", "Microorganisms", "Threshold-based coordination", "Adaptive facade", "Bacteria use signal molecules to decide collectively when enough neighbors are present to switch behavior.", "Building systems that activate when occupancy or risk reaches a meaningful threshold.", "Smart coordination does not always need a central command center.", "A bacterium does not vote with hands; it votes with chemistry until the room agrees.", { smartStructure: 81, toughness: 71, sustainability: 83, adaptability: 91, realWorldImpact: 79, innovation: 94 }, ["coordination", "threshold", "occupancy", "adaptive", "signals"], "networkIntelligence", ["occupancyComfort", "energyConsumption", "airQuality"]),
  create("s1", "Termite Mound", "Systems", "Passive ventilation loops", "Passive cooling", "Termite mounds use chimney and tunnel networks to manage temperature, airflow, and gas exchange across big daily swings.", "School buildings, offices, and civic centers with passive cooling stacks.", "Climate control can be architectural rather than mechanical.", "A termite city breathes through earth and geometry instead of compressors.", { smartStructure: 92, toughness: 88, sustainability: 96, adaptability: 84, realWorldImpact: 95, innovation: 90 }, ["passive-cooling", "ventilation", "airflow", "school", "climate"], "climateControl", ["thermalRegulation", "energyConsumption", "airQuality"]),
  create("s2", "Coral Reef", "Systems", "Mutualistic habitat building", "Flood resilience", "Coral reefs build complex protective edges that buffer waves while supporting dense ecological diversity.", "Living breakwaters, habitat-rich coastal protection, and regenerative waterfronts.", "Protective infrastructure can double as habitat infrastructure.", "A reef is both a barrier and a city built by countless tiny partners.", { smartStructure: 90, toughness: 83, sustainability: 94, adaptability: 82, realWorldImpact: 89, innovation: 86 }, ["coastal", "habitat", "flood", "living-infrastructure", "reef"], "livingInfrastructure", ["coastalErosion", "biodiversityLoss", "habitatDestruction"]),
  create("s3", "Forest Ecosystem", "Systems", "Layered resilience", "Passive cooling", "Forests regulate water, temperature, nutrient cycles, and biodiversity through stacked layers and exchange networks.", "Climate-buffering urban districts, shaded campuses, and regenerative public spaces.", "Resilience grows when many functions overlap and support each other.", "A forest is not one thing; it is thousands of linked negotiations happening at once.", { smartStructure: 87, toughness: 89, sustainability: 99, adaptability: 93, realWorldImpact: 94, innovation: 84 }, ["cooling", "resilience", "canopy", "district", "biodiversity"], "networkIntelligence", ["biodiversityLoss", "airQuality", "thermalRegulation"]),
  create("s4", "River Delta", "Systems", "Branching overflow management", "Flood resilience", "River deltas spread flow through distributary channels, reducing pressure and rebuilding after disturbance.", "Sponge-city flood plains, urban drainage systems, and flexible waterfront zoning.", "Giving water room to spread is often safer than trying to trap it.", "A delta handles abundance by branching instead of bottlenecking.", { smartStructure: 89, toughness: 85, sustainability: 95, adaptability: 91, realWorldImpact: 90, innovation: 83 }, ["flood", "branching", "drainage", "water", "urban"], "waterManagement", ["floodRisk", "stormwaterRunoff", "soilErosion"]),
  create("s5", "Beaver Wetlands", "Systems", "Slow water to build resilience", "Flood resilience", "Beavers create distributed dams that store water, reduce flash flooding, and expand habitat complexity.", "Constructed wetland parks and stormwater landscapes that store and clean runoff.", "Infrastructure can become richer as it becomes slower.", "Beavers turn streams into sponge landscapes with nothing but persistence and logs.", { smartStructure: 85, toughness: 81, sustainability: 97, adaptability: 90, realWorldImpact: 88, innovation: 82 }, ["wetland", "stormwater", "flood", "storage", "habitat"], "waterManagement", ["stormwaterRunoff", "floodRisk", "habitatDestruction"]),
  create("s6", "Swarm Intelligence", "Systems", "Coordination through local rules", "Adaptive facade", "Swarms adapt to change quickly because each participant follows a few simple rules and responds to neighbors.", "Responsive traffic systems, modular robots, and adaptive classroom layouts.", "Distributed coordination can be more robust than central control.", "A swarm stays flexible because nobody waits for one master instruction.", { smartStructure: 84, toughness: 76, sustainability: 86, adaptability: 96, realWorldImpact: 87, innovation: 94 }, ["swarm", "adaptive", "coordination", "robotics", "mobility"], "adaptiveSystems", ["energyConsumption", "resourceScarcity", "urbanHeat"]),
  create("s7", "Immune System", "Systems", "Layered defense", "Antibacterial materials", "The immune system combines barriers, rapid response, and memory to detect threats and adapt over time.", "Healthy-building sensor stacks, layered hygiene systems, and resilient public-space protocols.", "Strong protection comes from multiple linked defenses with learning built in.", "Your body runs a three-layer security system before breakfast.", { smartStructure: 90, toughness: 87, sustainability: 85, adaptability: 95, realWorldImpact: 84, innovation: 91 }, ["defense", "layered", "health", "sensor", "antibacterial"], "resilienceSystems", ["antibacterialSurfaces", "airQuality", "extremeClimate"]),
  create("s8", "Nutrient Cycle", "Systems", "Circular metabolism", "Antibacterial materials", "Mature ecosystems route waste from one process into food for another, reducing loss and increasing value.", "Circular material loops, zero-waste campuses, and reuse networks for city districts.", "Waste is often a design failure, not an inevitability.", "In nature, leftovers are usually invitations for another process to begin.", { smartStructure: 82, toughness: 80, sustainability: 99, adaptability: 86, realWorldImpact: 92, innovation: 80 }, ["circular", "waste", "district", "materials", "reuse"], "livingInfrastructure", ["wasteManagement", "materialWaste", "carbonFootprint"]),
  create("s9", "Mangrove Estuary", "Systems", "Edge conditions as opportunity", "Water harvesting", "Estuaries process sediment, salinity, and water movement by embracing mixing zones instead of resisting them.", "Hybrid freshwater infrastructure and soft-edge urban waterfronts.", "Productive boundaries are often hybrid, not cleanly separated.", "Where river meets sea, nature builds a laboratory of negotiation and filtering.", { smartStructure: 86, toughness: 84, sustainability: 95, adaptability: 92, realWorldImpact: 83, innovation: 81 }, ["edge", "water", "filter", "coastal", "hybrid"], "waterManagement", ["waterScarcity", "coastalErosion", "biodiversityLoss"]),
  create("s10", "Lichen Partnership", "Systems", "Collaboration across species", "Antibacterial materials", "Lichen combines fungus and algae or cyanobacteria into a single cooperative system that survives tough surfaces and climates.", "Collaborative material systems, bioreceptive finishes, and restorative urban surfaces.", "Some of the smartest designs are partnerships rather than standalone products.", "Lichen is a quiet reminder that teamwork can become a new organism.", { smartStructure: 80, toughness: 78, sustainability: 94, adaptability: 89, realWorldImpact: 75, innovation: 85 }, ["partnership", "surface", "collaboration", "bioreceptive", "materials"], "surfaceEngineering", ["soilErosion", "biodiversityLoss", "extremeClimate"]),
];

function buildRelatedIds(card, cards) {
  return cards
    .filter((candidate) => candidate.id !== card.id)
    .map((candidate) => {
      const sharedTags = candidate.tags.filter((tag) => card.tags.includes(tag)).length;
      const sameCategory = candidate.category === card.category ? 1 : 0;
      const sameApplication = candidate.application === card.application ? 1 : 0;
      return { id: candidate.id, score: sharedTags + sameCategory + sameApplication };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => item.id);
}

export const ORGANISMS = RAW_ORGANISMS.map((card, _, cards) => ({
  ...card,
  relatedIds: buildRelatedIds(card, cards),
}));
