import type { PhysicsLessonConfig } from "../../physics-engine/types/lesson";

const SST_GEO_SCENE: Partial<PhysicsLessonConfig> = {
  class: 10, subject: "Geography", simulation: "sst-geography", model: "/assets/sst/geography/scene.glb",
  usesProceduralFallback: true,
  sceneConfig: { backgroundColor: 0xf0fdf4, showGrid: false, cameraPosition: { x: 0, y: 4, z: 12 }, cameraTarget: { x: 0, y: 0, z: 0 }, minDistance: 4, maxDistance: 22 },
  cameraPresets: [
    { id: "front", label: "Front View", position: { x: 0, y: 4, z: 12 }, target: { x: 0, y: 0, z: 0 } },
    { id: "top", label: "Bird's-Eye", position: { x: 0, y: 14, z: 3 }, target: { x: 0, y: 0, z: 0 } },
  ],
  features: { rotation: true, zoom: true, pan: true, labels: true, animation: true, fullscreen: true },
  animationClips: [{ id: "data", label: "Data Animation", duration: 4.0 }],
};

export const geographyLessons: PhysicsLessonConfig[] = [
  {
    ...SST_GEO_SCENE as PhysicsLessonConfig,
    id: "sst-resources-development", chapter: "Resources and Development",
    title: "3D Land Use — Resources & Development (India's Land Resources)",
    subtitle: "Visualise India's 7 land-use categories as 3D bar charts: Net Sown Area, Fallow, Forest, Pastures, Culturable Waste, and Barren land. Explore resource classification, planning, and sustainable development.",
    slug: "/class-10/sst/geography/resources-development/",
    proceduralFallbackNote: "Interactive 3D India Land-Use Bar Chart active.",
    parameters: { chapterId: "resources-development", layer: 0, showData: true },
    parameterControls: [
      { key: "layer", label: "Show Land-Use Category", type: "select", options: [{ value: "0", label: "All Categories" }, { value: "1", label: "Net Sown Area (46%)" }, { value: "2", label: "Forest Cover (23%)" }, { value: "3", label: "Fallow Land (7%)" }, { value: "4", label: "Culturable Waste (6%)" }, { value: "5", label: "Barren/Rocky Land (14%)" }], defaultValue: "0" },
    ],
    learningSteps: [
      { stepNumber: 1, title: "Classification of Resources", description: "Resources classified by: Origin (Biotic/Abiotic), Exhaustibility (Renewable/Non-renewable), Ownership (Individual/Community/National/International), Status (Potential/Developed/Stock/Reserve). India has vast resources but uneven distribution and development.", focusObject: "LandBar_Forest", simulationParams: { layer: 2 } },
      { stepNumber: 2, title: "India's Land-Use Pattern", description: "India's total land area: 32.87 lakh sq km. Net Sown Area: 46% (largest category). Forest: 23% (should be 33% per National Forest Policy). Fallow + Culturable Waste: 13% — potential for agriculture. Barren land: 14% — deserts, mountains.", focusObject: "LandBar_NetSown", simulationParams: { layer: 1 } },
      { stepNumber: 3, title: "Soil Erosion — Major Threat to Land Resources", description: "Types of erosion: Sheet (rain washes topsoil uniformly), Gully (running water cuts channels — 'ravines' in Chambal), Wind (desert areas), Deforestation erosion. Ravines of Chambal (MP/Rajasthan) and Shiwalik degraded land — badlands. Soil conservation: Contour ploughing, Terrace farming, Shelterbelts.", focusObject: "ErosionVisual", simulationParams: { layer: 0 } },
    ],
    objects: [
      { id: "netsown", meshName: "LandBar_NetSown", name: "Net Sown Area (46%)", description: "Land sown with crops at least once a year — India's agricultural heartland.", function: "Largest land-use category — supports India's food security.", cbseNote: "Net Sown Area + Fallow = Gross Cropped Area. India's NSA: ~141 million hectares.", labelOffset: { x: -2, y: 1.5, z: 0 } },
      { id: "forest", meshName: "LandBar_Forest", name: "Forest Cover (23%)", description: "India's recorded forest area — target is 33% as per National Forest Policy 1952.", function: "Biodiversity, climate regulation, watershed protection.", cbseNote: "India's forest cover is only 23% vs 33% target. High forest states: Arunachal Pradesh, Madhya Pradesh.", labelOffset: { x: 0, y: 1.5, z: 0 } },
    ],
    formulas: [
      { id: "land-use", name: "India Land-Use Categories", expression: "Total Land = NSA(46%) + Forest(23%) + Fallow(7%) + Culturable Waste(6%) + Barren(14%) + Other(4%)", variables: "NSA = Net Sown Area (land under cultivation at least once annually)" },
      { id: "soil-types", name: "India's Soil Types (6 Major)", expression: "Alluvial(43%) + Red/Yellow(18%) + Black/Regur(15%) + Laterite(8%) + Arid(4%) + Forest(8%)", variables: "Alluvial: Most fertile, N/NW India. Black: Cotton soil, Deccan. Laterite: Leached, Kerala/Odisha" },
    ],
    cbseExamNotes: [
      "Agenda 21 (1992 Rio Earth Summit): Sustainable development blueprint — balance environment with development.",
      "Rio de Janeiro Earth Summit 1992 → Agenda 21 → pattern for CBSE questions on sustainable development.",
      "Alluvial soil = most widespread and fertile → found in great plains of North India (Khadar = new alluvial, Bhangar = old alluvial).",
      "Black soil / Regur = ideal for cotton. Deccan Plateau. Self-ploughing ability — swells in moisture, cracks in dry season.",
      "Laterite soil = leached by high rainfall. Kerala, Karnataka, Tamil Nadu, Meghalaya. Suitable for tea and coffee.",
    ],
    quiz: [
      { id: "g1-q1", question: "India's National Forest Policy (1952) recommends forest cover of:", options: ["23%", "27%", "33%", "40%"], correctIndex: 2, explanation: "National Forest Policy 1952 recommends 33% forest cover for plains, 60% for hilly regions. India currently has only ~23%." },
      { id: "g1-q2", question: "Which soil is called 'regur' and is ideal for cotton cultivation?", options: ["Alluvial soil", "Red soil", "Black soil", "Laterite soil"], correctIndex: 2, explanation: "Black/Regur soil is ideal for cotton cultivation. Found in Deccan Plateau (Maharashtra, MP, Gujarat). Has high moisture retention." },
    ],
  },
  {
    ...SST_GEO_SCENE as PhysicsLessonConfig,
    id: "sst-forest-wildlife", chapter: "Forest and Wildlife Resources",
    title: "3D Biodiversity — Forest & Wildlife Resources of India",
    subtitle: "Explore India's forest types, wildlife reserves, and biodiversity through 3D visualization. See Reserved vs Protected forests, Project Tiger, Biosphere Reserves, and understand why India is a mega-biodiversity hotspot.",
    slug: "/class-10/sst/geography/forest-wildlife/",
    proceduralFallbackNote: "Interactive 3D India Forest & Wildlife visualization active.",
    parameters: { chapterId: "forest-wildlife", layer: 0, showData: true },
    parameterControls: [
      { key: "layer", label: "Forest Type / Conservation Zone", type: "select", options: [{ value: "0", label: "All Forest Types" }, { value: "1", label: "Reserved Forests (53%)" }, { value: "2", label: "Protected Forests (29%)" }, { value: "3", label: "Unclassed Forests (18%)" }], defaultValue: "0" },
    ],
    learningSteps: [
      { stepNumber: 1, title: "India's Forest Types by Legal Status", description: "Reserved Forests (53%): Most protected — no rights to local communities, fully under Forest Dept. Protected Forests (29%): Community rights limited. Unclassed Forests (18%): Mostly in NE states, Odisha — community forests. MP has largest reserved forests.", focusObject: "ForestBar_Reserved", simulationParams: { layer: 1 } },
      { stepNumber: 2, title: "India as a Mega-Biodiversity Hotspot", description: "India has 8% of world's biodiversity on 2.4% of world's land! 47,000 plant species, 90,000 animal species. 4 biodiversity hotspots: Eastern Himalayas, Western Ghats, Indo-Burma, Nicobar Islands. India has 10% of world's flowering plants.", focusObject: "BiodiversityBar", simulationParams: { layer: 0 } },
      { stepNumber: 3, title: "Conservation — Project Tiger, Biosphere Reserves", description: "Project Tiger (1973): Started with 9 tiger reserves (now 54). Tiger population: 1973 → 1,827 tigers; 2022 → 3,167 tigers. Biosphere Reserves: 18 in India (5 UNESCO World Network). UNESCO sites: Nilgiri, Gulf of Mannar, Sundarbans, Nanda Devi, Pachmarhi.", focusObject: "TigerReserve", simulationParams: { layer: 0 } },
    ],
    objects: [
      { id: "reserved", meshName: "ForestBar_Reserved", name: "Reserved Forests (53% of forest area)", description: "Most protected category — no community rights, full Forest Dept control.", function: "Protects biodiversity hotspots and watershed forests.", cbseNote: "MP has the highest percentage of reserved forests. Himachal Pradesh, Uttarakhand also major.", labelOffset: { x: -2, y: 1.5, z: 0 } },
      { id: "tiger", meshName: "TigerReserve", name: "Project Tiger Reserve", description: "Project Tiger launched 1973 to protect Bengal tiger from extinction.", function: "India's most successful wildlife conservation programme.", cbseNote: "Project Tiger: 1973 → 9 reserves; now 54 reserves. Tiger numbers: 2022 → 3,167 (up from 1,827 in 1973).", labelOffset: { x: 2, y: 1.5, z: 0 } },
    ],
    formulas: [
      { id: "forest-types", name: "India Forest Classification", expression: "Reserved (53%) + Protected (29%) + Unclassed (18%) = Total Forest Area", variables: "Only 23% of India's total geographic area is under forest (target: 33%)" },
    ],
    cbseExamNotes: [
      "India has 10% of world's flowering plants, 8% of reptiles, 13% of birds, 7.4% of mammals.",
      "Chipko Movement (1970s, Uttarakhand): Women hugged trees to prevent felling — inspired global environmental movements.",
      "Joint Forest Management (JFM): Community participation in forest management — started 1988 in Odisha.",
    ],
    quiz: [
      { id: "g2-q1", question: "Project Tiger was launched in:", options: ["1960", "1965", "1973", "1980"], correctIndex: 2, explanation: "Project Tiger was launched in 1973 by Mrs. Indira Gandhi with 9 tiger reserves. India's most successful wildlife conservation programme." },
    ],
  },
  {
    ...SST_GEO_SCENE as PhysicsLessonConfig,
    id: "sst-water-resources", chapter: "Water Resources",
    title: "3D Dam Cross-Section — Water Resources of India",
    subtitle: "Explore a 3D dam cross-section (Bhakra Nangal style), see India's multipurpose river valley projects, understand rainwater harvesting, and analyse why freshwater is a critical resource for India's 1.4 billion people.",
    slug: "/class-10/sst/geography/water-resources/",
    proceduralFallbackNote: "Interactive 3D Dam & Water Cycle visualization active.",
    parameters: { chapterId: "water-resources", layer: 0, showData: true },
    parameterControls: [
      { key: "layer", label: "Water Resource Type", type: "select", options: [{ value: "0", label: "All Water Resources" }, { value: "1", label: "Multipurpose River Projects" }, { value: "2", label: "Rainfall Distribution by Region" }, { value: "3", label: "Rainwater Harvesting Techniques" }], defaultValue: "0" },
    ],
    learningSteps: [
      { stepNumber: 1, title: "India's Freshwater Resources", description: "India has 4% of world's freshwater on 2.4% of land. But distribution is very uneven! Cherrapunji (11,000mm/yr) vs Jaisalmer (100mm/yr). 96% of usable water is in rivers; groundwater rapidly depleting. Per capita availability declining as population grows.", focusObject: "WaterReservoir", simulationParams: { layer: 0 } },
      { stepNumber: 2, title: "Multipurpose River Valley Projects", description: "Nehru called dams 'temples of modern India'. Major projects: Bhakra Nangal (Sutlej, Punjab/HP), Hirakud (Mahanadi, Odisha, longest earthen dam 25.8km), Damodar Valley Corporation (DVC), Nagarjuna Sagar (Andhra Pradesh). Functions: Irrigation, power, flood control, navigation, fish farming.", focusObject: "DamStructure", simulationParams: { layer: 1 } },
      { stepNumber: 3, title: "Critique of Large Dams — Narmada Bachao Andolan", description: "Sardar Sarovar Dam (Narmada, Gujarat/MP): Opposition from Narmada Bachao Andolan led by Medha Patkar. Issues: 1) Displacement of tribal/rural communities (over 1 lakh people displaced). 2) Submergence of forests. 3) Uneven benefit distribution. 4) Silting reduces dam life.", focusObject: "ConflictZone", simulationParams: { layer: 1 } },
      { stepNumber: 4, title: "Rainwater Harvesting — Traditional Wisdom", description: "India's ancient rainwater harvesting: Kunds (Rajasthan — underground circular tanks), Kuls (HP — channels from glaciers to fields), Tankas (rooftop collection), Johads (Rajasthan — village ponds), Surangams (Kerala), Zings (Ladakh — glacier meltwater tanks). Gendathur village (Karnataka) achieved water sufficiency through rooftop collection.", focusObject: "RainwaterHarvest", simulationParams: { layer: 3 } },
    ],
    objects: [
      { id: "dam", meshName: "DamStructure", name: "Multipurpose Dam (Bhakra Nangal)", description: "India's largest multipurpose river valley project on River Sutlej.", function: "Irrigation, hydropower, flood control, navigation, fisheries.", cbseNote: "Bhakra Nangal: Sutlej River, Punjab/Himachal Pradesh. Nehru: 'Temples of modern India'. CBSE: Know at least 5 dams and their rivers.", labelOffset: { x: 0, y: 2, z: 0 } },
      { id: "harvest", meshName: "RainwaterHarvest", name: "Rainwater Harvesting — Kund/Tanka", description: "Traditional rainwater collection techniques used across India for centuries.", function: "Sustainable water management — especially in water-scarce regions.", cbseNote: "CBSE favourite: Tankas (Rajasthan, Bikaner area rooftop tanks), Kunds (underground cisterns), Johads (Rajasthan village ponds — Alwar revival).", labelOffset: { x: 2, y: 1.5, z: 0 } },
    ],
    formulas: [
      { id: "water-stress", name: "Water Stress Threshold", expression: "Per capita water availability < 1,700 m³/year → Water Stress | < 1,000 m³/year → Water Scarcity", variables: "India's per capita availability declining: 1951 → 5,177 m³; 2011 → 1,545 m³" },
    ],
    cbseExamNotes: [
      "Hirakud Dam: River Mahanadi, Odisha. Longest earthen dam in world: 25.8 km.",
      "Damodar River = 'Sorrow of Bengal' before DVC. DVC (Damodar Valley Corporation) modelled on Tennessee Valley Authority (USA).",
      "Medha Patkar led Narmada Bachao Andolan. Sardar Sarovar Dam (SSP) on Narmada River, Gujarat.",
    ],
    quiz: [
      { id: "g3-q1", question: "Hirakud Dam is built on which river?", options: ["Godavari", "Mahanadi", "Damodar", "Krishna"], correctIndex: 1, explanation: "Hirakud Dam is built on River Mahanadi in Odisha. It is the longest earthen dam in the world (25.8 km)." },
      { id: "g3-q2", question: "'Tankas' are traditional rainwater harvesting structures found in:", options: ["Kerala", "Assam", "Rajasthan", "Uttarakhand"], correctIndex: 2, explanation: "Tankas are underground cylindrical rainwater storage tanks found in Rajasthan (especially Bikaner area). Water collected from rooftops and stored in Tankas." },
    ],
  },
  {
    ...SST_GEO_SCENE as PhysicsLessonConfig,
    id: "sst-agriculture", chapter: "Agriculture",
    title: "3D Crop Calendar — Agriculture in India (Kharif, Rabi, Zaid Seasons)",
    subtitle: "Compare Kharif vs Rabi crops in 3D bar charts, visualise major crop distributions (rice, wheat, cotton, jute, sugarcane), and understand the Green Revolution, irrigation systems, and India's agricultural challenges.",
    slug: "/class-10/sst/geography/agriculture/",
    proceduralFallbackNote: "Interactive 3D India Crop Calendar visualization active.",
    parameters: { chapterId: "agriculture", layer: 0, showData: true },
    parameterControls: [
      { key: "layer", label: "Crop Season / Category", type: "select", options: [{ value: "0", label: "All Crops — Kharif + Rabi" }, { value: "1", label: "Kharif Crops (June–September)" }, { value: "2", label: "Rabi Crops (October–March)" }, { value: "3", label: "Irrigation Types Distribution" }], defaultValue: "0" },
    ],
    learningSteps: [
      { stepNumber: 1, title: "Kharif Crops — Sown in June, Harvested in September", description: "Kharif crops: sown with onset of monsoon (June), harvested in September/October. Major crops: Rice (WB, AP, UP), Maize (Karnataka, MP), Cotton (Punjab, Haryana, Maharashtra), Jute (WB — 'Golden Fibre'), Groundnut, Bajra, Jowar.", focusObject: "KharifBar_Rice", simulationParams: { layer: 1 } },
      { stepNumber: 2, title: "Rabi Crops — Sown in October, Harvested in March", description: "Rabi crops: sown in October/November (winter), harvested March/April. Major crops: Wheat (Punjab, Haryana, UP — Green Revolution belt), Barley, Peas, Gram, Mustard/Rapeseed (Rajasthan, UP). Rabi crops depend on winter rainfall or irrigation.", focusObject: "RabiBar_Wheat", simulationParams: { layer: 2 } },
      { stepNumber: 3, title: "Green Revolution — Food Security Achieved", description: "Green Revolution (1960s): HYV (High Yielding Variety) seeds + Fertilisers + Irrigation = Dramatic wheat/rice production increase. Punjab, Haryana, UP became food surplus states. India went from famine-prone to food exporter. Challenges: Groundwater depletion, soil degradation, regional inequality.", focusObject: "GreenRevolution", simulationParams: { layer: 0 } },
    ],
    objects: [
      { id: "rice", meshName: "KharifBar_Rice", name: "Rice (Kharif) — West Bengal, AP, UP", description: "India's most important Kharif food crop. Requires 100cm+ rainfall.", function: "Staple food for most of India — especially eastern and southern states.", cbseNote: "India is 2nd largest rice producer globally. WB leads in area, but Punjab leads in productivity.", labelOffset: { x: -3, y: 1.5, z: 0 } },
      { id: "wheat", meshName: "RabiBar_Wheat", name: "Wheat (Rabi) — Punjab, Haryana, UP", description: "India's major Rabi food crop. HYV wheat seeds drove Green Revolution.", function: "Staple food for northern India — requires cool winters and warm summers.", cbseNote: "Wheat production: 1960s = 11 MT → now = 110+ MT (Green Revolution impact). Punjab = 'Granary of India'.", labelOffset: { x: 3, y: 1.5, z: 0 } },
    ],
    formulas: [
      { id: "crop-seasons", name: "India's Crop Seasons", expression: "Kharif: June–Sept (Monsoon crops) | Rabi: Oct–March (Winter crops) | Zaid: March–June (Summer crops)", variables: "Zaid crops: Watermelon, Musk melon, Cucumber — grown between Rabi and Kharif" },
    ],
    cbseExamNotes: [
      "Jute = 'Golden Fibre'. West Bengal produces 75% of India's jute. Requires high temperature, heavy rainfall, waterlogged soil.",
      "Cotton = 'White Gold'. Maharashtra, Gujarat, Punjab lead. Requires 210 frost-free days. Grown in Black/Regur soil.",
      "Rubber: Kerala produces 90% of India's rubber. Requires >200cm rainfall, >25°C temperature year-round.",
    ],
    quiz: [
      { id: "g4-q1", question: "Jute is known as 'Golden Fibre' and is mainly cultivated in:", options: ["Maharashtra", "West Bengal", "Punjab", "Gujarat"], correctIndex: 1, explanation: "West Bengal produces about 75% of India's jute. Jute requires hot and humid climate with high rainfall — ideal in Ganga-Brahmaputra delta region." },
      { id: "g4-q2", question: "Rabi crops are sown in:", options: ["June–July", "October–November", "March–April", "December–January"], correctIndex: 1, explanation: "Rabi crops are sown in October–November (beginning of winter) and harvested in March–April. Examples: Wheat, Barley, Peas, Gram, Mustard." },
    ],
  },
  {
    ...SST_GEO_SCENE as PhysicsLessonConfig,
    id: "sst-minerals-energy", chapter: "Minerals and Energy Resources",
    title: "3D Energy Mix — Minerals & Energy Resources of India",
    subtitle: "Visualise India's mineral distribution and energy mix in 3D: conventional energy (coal 55%, oil 35%, gas 10%) vs non-conventional (solar, wind, hydro, biogas). Explore ferrous, non-ferrous, and non-metallic minerals.",
    slug: "/class-10/sst/geography/minerals-energy/",
    proceduralFallbackNote: "Interactive 3D India Minerals & Energy Mix visualization active.",
    parameters: { chapterId: "minerals-energy", layer: 0, showData: true },
    parameterControls: [
      { key: "layer", label: "Resource Category", type: "select", options: [{ value: "0", label: "Full Energy Mix" }, { value: "1", label: "Conventional Energy (Coal, Oil, Gas)" }, { value: "2", label: "Non-Conventional Energy (Solar, Wind, Hydro)" }, { value: "3", label: "Mineral Types (Ferrous, Non-ferrous, Non-metallic)" }], defaultValue: "0" },
    ],
    learningSteps: [
      { stepNumber: 1, title: "Mineral Resources — Classification", description: "Minerals classified as: Metallic (Ferrous: Iron, Manganese, Nickel; Non-ferrous: Copper, Bauxite, Gold, Silver) and Non-metallic (Mica, Salt, Limestone, Potash). India is rich in ferrous minerals — Chota Nagpur plateau (Jharkhand/Odisha/Chhattisgarh) = 'Mineral Heartland'.", focusObject: "MineralBars", simulationParams: { layer: 3 } },
      { stepNumber: 2, title: "Conventional Energy — Coal, Oil, Natural Gas", description: "Coal: India 4th largest producer globally. Major fields: Jharia, Raniganj, Korba. Petroleum: Mumbai High (offshore, 63% of production), Gujarat, Assam. Natural Gas: KG basin (AP-Krishna-Godavari), Gujarat. These non-renewable resources are rapidly depleting.", focusObject: "EnergyBar_Coal", simulationParams: { layer: 1 } },
      { stepNumber: 3, title: "Non-Conventional Energy — Sustainable Future", description: "India's targets by 2030: 500 GW renewable energy capacity. Solar: Rajasthan leads (900 MW Bhadla Solar Park, world's largest). Wind: Tamil Nadu leads (Gulf of Khambhat). Biogas: 5 lakh biogas plants in India. Tidal energy: Gulf of Kutch potential.", focusObject: "RenewableBar", simulationParams: { layer: 2 } },
    ],
    objects: [
      { id: "coal", meshName: "EnergyBar_Coal", name: "Coal — India's Primary Energy Source (55%)", description: "Coal provides 55% of India's energy. 4th largest producer globally.", function: "Thermal power (70% of India's electricity), steel production, industrial fuel.", cbseNote: "Gondwana coalfields: 98% of India's coal. Bituminous coal most common. Tertiary coalfields: NE India (lignite/brown coal).", labelOffset: { x: -2, y: 1.5, z: 0 } },
      { id: "solar", meshName: "RenewableBar", name: "Solar & Wind Energy (Non-Conventional)", description: "India targeting 500 GW renewable capacity by 2030.", function: "Clean, inexhaustible energy for sustainable development.", cbseNote: "Bhadla Solar Park (Rajasthan) = world's largest solar park at 2,245 MW. India 4th largest wind energy producer globally.", labelOffset: { x: 2, y: 1.5, z: 0 } },
    ],
    formulas: [
      { id: "energy-mix", name: "India's Energy Mix (Conventional)", expression: "Coal (55%) + Oil (35%) + Natural Gas (10%) = Conventional Energy | Total = ~80% of India's energy", variables: "Non-conventional (20%): Hydro, Solar, Wind, Biogas, Nuclear" },
    ],
    cbseExamNotes: [
      "Mica: India produces 80% of world's mica. Jharkhand, Bihar, Rajasthan. Used in electrical equipment.",
      "Iron ore: India 4th largest producer. Odisha, Jharkhand, Chhattisgarh. Types: Magnetite (best quality), Haematite (commercial mining).",
      "NTPC (National Thermal Power Corporation) = largest power company. NHPC = hydro. NPCIL = nuclear.",
    ],
    quiz: [
      { id: "g5-q1", question: "India's 'Mineral Heartland' — Chota Nagpur plateau — is rich in:", options: ["Petroleum and natural gas", "Iron ore, coal, manganese, mica", "Bauxite and gold", "Salt and limestone"], correctIndex: 1, explanation: "Chota Nagpur plateau (Jharkhand, Odisha, Chhattisgarh) = India's mineral heartland, rich in iron ore, coal, manganese, mica, and other minerals." },
    ],
  },
  {
    ...SST_GEO_SCENE as PhysicsLessonConfig,
    id: "sst-manufacturing", chapter: "Manufacturing Industries",
    title: "3D Industrial Map — Manufacturing Industries of India",
    subtitle: "Explore India's major manufacturing clusters in 3D: Cotton/Textile (Mumbai-Ahmedabad), Iron & Steel (Chota Nagpur), IT/Software (Bengaluru), Automobiles (Chennai/Pune), and understand industrial location factors.",
    slug: "/class-10/sst/geography/manufacturing/",
    proceduralFallbackNote: "Interactive 3D India Manufacturing Cluster visualization active.",
    parameters: { chapterId: "manufacturing", layer: 0, showData: true },
    parameterControls: [
      { key: "layer", label: "Industry Sector", type: "select", options: [{ value: "0", label: "All Industries" }, { value: "1", label: "Cotton/Textile — Mumbai, Ahmedabad" }, { value: "2", label: "Iron & Steel — Jamshedpur, Rourkela" }, { value: "3", label: "IT/Software — Bengaluru, Hyderabad" }, { value: "4", label: "Chemicals — Gujarat coast" }], defaultValue: "0" },
    ],
    learningSteps: [
      { stepNumber: 1, title: "Cotton Textile Industry — 'Manchester of India'", description: "Mumbai = 'Manchester of India' (now called incorrectly — Ahmedabad had that title first). Cotton mills: 1854 Cowasji Nanabhai Davar. Western India dominates: Maharashtra, Gujarat. Cheap power, port access, humid climate (reduces thread breakage), raw cotton from Deccan. Now challenged by power loom/handloom sectors.", focusObject: "TextileCluster", simulationParams: { layer: 1 } },
      { stepNumber: 2, title: "Iron & Steel Industry — Chota Nagpur Belt", description: "India's steel industry: Jamshedpur (Tata Steel, 1907 — 1st integrated plant), Bhilai (MP, Soviet-aided), Rourkela (Odisha, German-aided), Durgapur (WB, British-aided). Location factors: Iron ore (Odisha), Coal (Jharkhand), Limestone, Water (Damodar/Subarnarekha), Labour. SAIL (Steel Authority of India Limited) = major public sector.", focusObject: "SteelCluster", simulationParams: { layer: 2 } },
      { stepNumber: 3, title: "Chemical Industry — Gujarat's 'Chemical Corridor'", description: "Gujarat coast = India's largest chemical manufacturing zone. Chemicals: Petrochemicals (Vadodara, Surat), Pharmaceuticals (Ahmedabad), Fertilisers (Bharuch). Chemical industry: ~16% of India's industrial production. IPCL, Reliance Industries, GSFC are major players.", focusObject: "ChemCluster", simulationParams: { layer: 4 } },
    ],
    objects: [
      { id: "textile", meshName: "TextileCluster", name: "Cotton Textile Cluster (Mumbai-Ahmedabad)", description: "India's oldest and largest organised industry — 1700+ mills.", function: "Employs 45 million people — largest industrial employer after agriculture.", cbseNote: "Ahmedabad = 'Manchester of India' (historically). Now challenged by decentralised power loom sector.", labelOffset: { x: -2, y: 1.5, z: 0 } },
      { id: "steel", meshName: "SteelCluster", name: "Iron & Steel — Jamshedpur, Bhilai, Rourkela", description: "India's iron and steel plants cluster near Damodar-Subarnarekha basin.", function: "Steel = 'Mother of all industries' — foundation for all other manufacturing.", cbseNote: "Tata Iron and Steel Company (TISCO), Jamshedpur (1907) = first integrated steel plant by an Indian private company.", labelOffset: { x: 2, y: 1.5, z: 0 } },
    ],
    formulas: [
      { id: "location", name: "Industrial Location Factors", expression: "Raw Materials + Power + Water + Labour + Transport + Market + Capital = Industrial Location", variables: "Weber's Least Cost Theory: Industries locate where transport costs are minimum" },
    ],
    cbseExamNotes: [
      "TISCO (Tata Iron and Steel Co.), Jamshedpur: Established 1907 by Jamshedji Nusserwanji Tata. First private integrated steel plant.",
      "Bhilai Steel Plant: Soviet Union assisted. Durgapur: British assisted. Rourkela: German assisted.",
      "National Chemical Laboratory (NCL), Pune; DRDO; ISRO Bengaluru — scientific institutions boosting industry.",
    ],
    quiz: [
      { id: "g6-q1", question: "India's first integrated iron and steel plant was established at Jamshedpur in:", options: ["1875", "1907", "1925", "1947"], correctIndex: 1, explanation: "Tata Iron and Steel Company (TISCO) established the first integrated iron and steel plant at Jamshedpur (Jharkhand) in 1907." },
    ],
  },
  {
    ...SST_GEO_SCENE as PhysicsLessonConfig,
    id: "sst-lifelines", chapter: "Lifelines of National Economy",
    title: "3D Transport Network — Lifelines of India's National Economy",
    subtitle: "Compare India's transport modes in 3D: Road network (63.86 lakh km), Railways (67,956 km), Inland waterways, Air transport, and Pipelines. Understand how transport and communication are the 'lifelines' of India's economy.",
    slug: "/class-10/sst/geography/lifelines/",
    proceduralFallbackNote: "Interactive 3D India Transport Network visualization active.",
    parameters: { chapterId: "lifelines", layer: 0, showData: true },
    parameterControls: [
      { key: "layer", label: "Transport Mode", type: "select", options: [{ value: "0", label: "All Transport Modes" }, { value: "1", label: "Road Network (63.86 lakh km)" }, { value: "2", label: "Railways (67,956 km)" }, { value: "3", label: "Air Transport" }, { value: "4", label: "Inland Waterways (3 National)" }], defaultValue: "0" },
    ],
    learningSteps: [
      { stepNumber: 1, title: "Road Transport — India's Primary Transport Mode", description: "India has 2nd largest road network in world: 63.86 lakh km. Types: NH (National Highways, 1.01 lakh km, 40% of road traffic), SH (State Highways), District Roads, Village roads. Golden Quadrilateral: Delhi-Mumbai-Chennai-Kolkata (5,846 km). North-South & East-West Corridors (NSEW, 7,142 km).", focusObject: "RoadNetwork", simulationParams: { layer: 1 } },
      { stepNumber: 2, title: "Railways — Largest in Asia", description: "Indian Railways: 67,956 km — 4th largest network, largest in Asia. Runs 23 million passengers/day! Divided into 18 zones. Broad gauge (1.676m) = 92% of network. Metro rail in 15+ cities. Konkan Railway: 760 km along Sahyadri — engineering marvel through mountains.", focusObject: "RailNetwork", simulationParams: { layer: 2 } },
      { stepNumber: 3, title: "Inland Waterways, Pipelines & Air Transport", description: "3 National Waterways: NW1 (Ganga, Prayagraj-Haldia 1,620 km), NW2 (Brahmaputra, Sadiya-Dhubri 891 km), NW3 (Kerala backwaters 205 km). Air: 464 airports, Air India + IndiGo + SpiceJet. Pipelines: HBJ (Hazira-Bijapur-Jagdishpur) for natural gas; Salaya-Mathura for petroleum.", focusObject: "WaterwayRoute", simulationParams: { layer: 4 } },
    ],
    objects: [
      { id: "road", meshName: "RoadNetwork", name: "Golden Quadrilateral & NH Network", description: "India's 63.86 lakh km road network with Golden Quadrilateral as flagship project.", function: "Road transport carries 70% of freight, 85% of passengers in India.", cbseNote: "Golden Quadrilateral (GQ): Delhi-Mumbai-Chennai-Kolkata, 5,846 km, 4/6-lane expressway. NHDP (National Highway Development Project) is implementing.", labelOffset: { x: -2, y: 1.5, z: 0 } },
      { id: "rail", meshName: "RailNetwork", name: "Indian Railways (67,956 km)", description: "Asia's largest rail network — connects the entire country.", function: "Integrates national economy — moves bulk goods, passengers cheaply.", cbseNote: "Indian Railways: 18 zones, 7,172 stations, 23 million passengers/day. Broad gauge (5ft 6in) = 92% of network.", labelOffset: { x: 2, y: 1.5, z: 0 } },
    ],
    formulas: [
      { id: "transport", name: "India's Transport Network", expression: "Road: 63.86L km | Rail: 67,956 km | NW (Inland): 14,500 km usable | Air: 464 airports", variables: "Road carries 85% passengers, 70% freight; Rail carries remaining bulk cargo" },
    ],
    cbseExamNotes: [
      "Konkan Railway: 760 km from Roha (Maharashtra) to Mangaluru (Karnataka). Crosses 2,000 bridges, 91 tunnels through Sahyadri/Western Ghats.",
      "CONCOR (Container Corporation of India): Runs container trains for freight.",
      "NW-1: Ganga (Prayagraj–Haldia, 1620 km). NW-2: Brahmaputra (Sadiya–Dhubri, 891 km). NW-3: Kerala backwaters (205 km).",
    ],
    quiz: [
      { id: "g7-q1", question: "The Golden Quadrilateral super highway connects:", options: ["Delhi-Kolkata-Mumbai-Pune", "Delhi-Mumbai-Chennai-Kolkata", "Delhi-Jaipur-Ahmedabad-Mumbai", "Mumbai-Pune-Hyderabad-Bengaluru"], correctIndex: 1, explanation: "Golden Quadrilateral connects Delhi-Mumbai-Chennai-Kolkata in a quadrilateral shape, covering 5,846 km. Part of NHDP (National Highway Development Project)." },
      { id: "g7-q2", question: "Indian Railways is the _____ largest rail network in the world:", options: ["2nd", "3rd", "4th", "5th"], correctIndex: 2, explanation: "Indian Railways (67,956 km) is the 4th largest rail network in the world (after USA, Russia, China). It is the largest in Asia." },
    ],
  },
];
