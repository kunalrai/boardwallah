import type { PhysicsLessonConfig } from "../../physics-engine/types/lesson";

const SST_ECON_SCENE: Partial<PhysicsLessonConfig> = {
  class: 10, subject: "Economics", simulation: "sst-economics", model: "/assets/sst/economics/scene.glb",
  usesProceduralFallback: true,
  sceneConfig: { backgroundColor: 0xfff7ed, showGrid: false, cameraPosition: { x: 0, y: 3, z: 11 }, cameraTarget: { x: 0, y: 0, z: 0 }, minDistance: 4, maxDistance: 20 },
  cameraPresets: [
    { id: "front", label: "Front View", position: { x: 0, y: 3, z: 11 }, target: { x: 0, y: 0, z: 0 } },
    { id: "top", label: "Top-Down", position: { x: 0, y: 12, z: 3 }, target: { x: 0, y: 0, z: 0 } },
  ],
  features: { rotation: true, zoom: true, pan: true, labels: true, animation: true, fullscreen: true },
  animationClips: [{ id: "data", label: "Economic Data Animation", duration: 4.0 }],
};

export const economicsLessons: PhysicsLessonConfig[] = [
  {
    ...SST_ECON_SCENE as PhysicsLessonConfig,
    id: "sst-development", chapter: "Development",
    title: "3D HDI Comparison — What is Development? (GDP vs HDI)",
    subtitle: "Compare development across countries using 3D HDI and income bars: Germany (HDI 0.942), Sri Lanka (0.782), India (0.633). Understand why per capita income alone is insufficient — infant mortality, literacy, and other indicators matter.",
    slug: "/class-10/sst/economics/development/",
    proceduralFallbackNote: "Interactive 3D HDI & Development Indicator Comparison active.",
    parameters: { chapterId: "development", indicator: "hdi", year: 2022 },
    parameterControls: [
      { key: "indicator", label: "Development Indicator", type: "select", options: [{ value: "hdi", label: "Human Development Index (HDI)" }, { value: "income", label: "Per Capita Income (USD)" }, { value: "infant", label: "Infant Mortality Rate (per 1000)" }, { value: "literacy", label: "Adult Literacy Rate (%)" }], defaultValue: "hdi" },
    ],
    learningSteps: [
      { stepNumber: 1, title: "Development = More Than Income", description: "Development is not just about money! Key insight: Punjab (rich state) has higher per capita income than Kerala — but Kerala has better health, literacy, gender equality. Kerala model: investing in human capital. Income alone does not explain quality of life.", focusObject: "HDI_Germany", simulationParams: { indicator: "hdi" } },
      { stepNumber: 2, title: "HDI — Human Development Index", description: "UNDP's HDI combines 3 dimensions: 1) Long and healthy life (Life expectancy at birth), 2) Knowledge (Mean years of schooling + Expected years of schooling), 3) Decent standard of living (GNI per capita PPP). Scale: 0 (lowest) to 1 (highest). India: 0.633 (Medium Human Development).", focusObject: "HDI_India", simulationParams: { indicator: "hdi" } },
      { stepNumber: 3, title: "Infant Mortality Rate — Powerful Development Indicator", description: "IMR = Number of children per 1,000 live births who die before age 1. India's IMR: 32 (2020). Sri Lanka: 7 (much better health system). Germany: 3. High IMR indicates: poor nutrition, lack of healthcare, poverty. Kerala's IMR (12) much better than Bihar (44) — same country, different priorities.", focusObject: "IMR_Bar", simulationParams: { indicator: "infant" } },
    ],
    objects: [
      { id: "germany-hdi", meshName: "HDI_Germany", name: "Germany — HDI 0.942 (Very High)", description: "Germany: Per capita income ~$54,000, Life expectancy 81 years, Literacy 99%.", function: "Benchmark for high human development — strong education, healthcare, income.", cbseNote: "HDI above 0.80 = Very High Human Development. Germany, Norway, Switzerland top the list.", labelOffset: { x: -2.5, y: 2, z: 0 } },
      { id: "india-hdi", meshName: "HDI_India", name: "India — HDI 0.633 (Medium)", description: "India: Per capita income ~$7,333 (PPP), Life expectancy 70 years, Literacy 77.7%.", function: "Shows India's progress but also gaps — especially in health and income distribution.", cbseNote: "India ranks 132nd in HDI (2022). Medium Human Development (0.550–0.699). Goal: reach 0.700+ (High HD).", labelOffset: { x: 2.5, y: 2, z: 0 } },
    ],
    formulas: [
      { id: "hdi", name: "Human Development Index (HDI)", expression: "HDI = ∛(Life Expectancy Index × Education Index × Income Index)", variables: "UNDP publishes annually. India 2022: 0.633 (rank 132/191). Norway: 0.961 (rank 1)" },
      { id: "imr", name: "Infant Mortality Rate", expression: "IMR = (Deaths under age 1 / Live Births) × 1000", variables: "India IMR: 32 (2020). Kerala: 12. Bihar: 44. Sri Lanka: 7. Germany: 3" },
    ],
    cbseExamNotes: [
      "Per capita income = Total national income / Population. Average — does NOT show distribution (rich-poor gap).",
      "Kerala paradox: Lower per capita income than Punjab, but better health, literacy, gender ratio — because of public investment in education and health.",
      "Sustainable Development: Development that meets present needs without compromising future generations' ability to meet their needs (Brundtland Commission, 1987).",
    ],
    quiz: [
      { id: "e1-q1", question: "HDI (Human Development Index) is published by:", options: ["World Bank", "IMF", "UNDP", "WHO"], correctIndex: 2, explanation: "HDI is published annually by UNDP (United Nations Development Programme) in the Human Development Report." },
      { id: "e1-q2", question: "Infant Mortality Rate (IMR) measures deaths per 1,000 live births of children below age:", options: ["5 years", "2 years", "1 year", "10 years"], correctIndex: 2, explanation: "IMR measures number of children dying before age 1 (one year) per 1,000 live births. It's a key development indicator — reflects nutrition, healthcare quality, and poverty levels." },
    ],
  },
  {
    ...SST_ECON_SCENE as PhysicsLessonConfig,
    id: "sst-sectors-economy", chapter: "Sectors of the Indian Economy",
    title: "3D Sector Bars — Primary, Secondary & Tertiary Sectors of India",
    subtitle: "Compare India's 3 economic sectors in 3D — GDP share vs employment share. See the structural paradox: Tertiary sector = 57% of GDP but only 28% employment; Primary sector = only 17% GDP but 50% employment. Understand organised vs unorganised sectors.",
    slug: "/class-10/sst/economics/sectors-economy/",
    proceduralFallbackNote: "Interactive 3D India Economic Sectors visualization active.",
    parameters: { chapterId: "sectors-economy", indicator: "gdp", year: 2022 },
    parameterControls: [
      { key: "indicator", label: "Show Data For", type: "select", options: [{ value: "gdp", label: "GDP Share by Sector (%)" }, { value: "employment", label: "Employment by Sector (%)" }, { value: "comparison", label: "GDP vs Employment Comparison (Structural Paradox)" }], defaultValue: "comparison" },
    ],
    learningSteps: [
      { stepNumber: 1, title: "3 Sectors of Economic Activity", description: "Primary: Activities using natural resources directly — Agriculture, Fishing, Mining, Forestry. Secondary: Processing/manufacturing — Factories, Construction, Electricity. Tertiary: Services — Banking, Transport, Communication, Trade, Education, Health. Historically, as economies develop, they shift from Primary to Tertiary.", focusObject: "PrimaryBar", simulationParams: { indicator: "gdp" } },
      { stepNumber: 2, title: "India's Structural Paradox", description: "India's paradox: Tertiary (Services) sector = 57% of GDP but employs only 28% of workers! Primary (Agriculture) = only 17% of GDP but employs 50% of workers! This means agriculture is overcrowded — too many people in low-productivity farming. Solution: Create more secondary/tertiary jobs.", focusObject: "ParadoxBars", simulationParams: { indicator: "comparison" } },
      { stepNumber: 3, title: "Organised vs Unorganised Sector", description: "Organised sector: Registered enterprises, formal contracts, ESI/PF benefits, fixed hours, minimum wages. Unorganised sector: Small enterprises, no formal contracts, no benefits, irregular work. 93% of India's workforce is in UNORGANISED sector — no job security, low wages, no protection.", focusObject: "OrgUnorgBar", simulationParams: { indicator: "employment" } },
    ],
    objects: [
      { id: "primary", meshName: "PrimaryBar", name: "Primary Sector (Agriculture, Mining)", description: "Uses natural resources. India: 17% GDP but 50% of employment.", function: "Provides raw materials for industry; food for population.", cbseNote: "CBSE: Primary includes agriculture, dairying, forestry, fishing, mining, quarrying. Employs 50% but contributes only 17% to GDP → underemployment.", labelOffset: { x: -2.5, y: 2, z: 0 } },
      { id: "tertiary", meshName: "TertiaryBar", name: "Tertiary Sector (Services)", description: "Services sector: 57% of India's GDP, 28% of employment.", function: "Fastest growing sector — IT, banking, telecom, education, health.", cbseNote: "India's IT/software exports: ~$220 billion (2023). India is global leader in IT services.", labelOffset: { x: 2.5, y: 2, z: 0 } },
    ],
    formulas: [
      { id: "gdp-sectors", name: "India GDP by Sector (2022-23)", expression: "Primary: 17% + Secondary: 26% + Tertiary: 57% = GDP (₹273 lakh crore)", variables: "Employment: Primary 50% + Secondary 22% + Tertiary 28% = 100% workforce" },
      { id: "gdp-def", name: "GDP Definition", expression: "GDP = C (Consumption) + I (Investment) + G (Government) + NX (Net Exports)", variables: "India's GDP growth target: 7-8% annually. GDP per capita ≈ ₹1.73 lakh (2022-23)" },
    ],
    cbseExamNotes: [
      "MNREGA (Mahatma Gandhi National Rural Employment Guarantee Act, 2005): 100 days of guaranteed employment to rural households — addresses disguised unemployment.",
      "Disguised unemployment: When more people work than actually needed. Common in Indian agriculture — removing some people won't reduce output.",
      "Public sector: Govt-owned enterprises (ONGC, SAIL, Indian Railways). Private sector: Tata, Reliance, Infosys.",
    ],
    quiz: [
      { id: "e2-q1", question: "Which sector of India's economy employs the MOST people but contributes the LEAST to GDP?", options: ["Tertiary (Services)", "Secondary (Industry)", "Primary (Agriculture)", "Equal contribution from all"], correctIndex: 2, explanation: "Primary sector (Agriculture, Fishing, Mining) employs ~50% of India's workforce but contributes only ~17% to GDP — indicating massive underemployment and low productivity in agriculture." },
    ],
  },
  {
    ...SST_ECON_SCENE as PhysicsLessonConfig,
    id: "sst-money-credit", chapter: "Money and Credit",
    title: "3D Credit Flow — Money, Banking & Formal vs Informal Credit",
    subtitle: "Visualise India's credit system in 3D: formal sector (banks, RBI) vs informal sector (moneylenders, 33% of rural credit). See interest rate comparison (formal 10% vs informal 40-120%), and understand why financial inclusion matters.",
    slug: "/class-10/sst/economics/money-credit/",
    proceduralFallbackNote: "Interactive 3D Money & Credit Flow visualization active.",
    parameters: { chapterId: "money-credit", indicator: "credit", year: 2022 },
    parameterControls: [
      { key: "indicator", label: "Credit Dimension", type: "select", options: [{ value: "credit", label: "Formal vs Informal Credit Share" }, { value: "interest", label: "Interest Rate Comparison" }, { value: "flow", label: "Banking & RBI Credit Flow" }], defaultValue: "credit" },
    ],
    learningSteps: [
      { stepNumber: 1, title: "Money — Medium of Exchange", description: "Before money: Barter system (double coincidence of wants problem). Money solves this. Modern money: Currency (coins/notes issued by RBI), Demand deposits (cheques), Digital money. RBI (Reserve Bank of India) = central bank, issues currency, regulates banking, maintains reserves.", focusObject: "MoneyFlow", simulationParams: { indicator: "flow" } },
      { stepNumber: 2, title: "Formal vs Informal Credit", description: "Formal credit (40%): Banks, cooperative banks, NBFCs, SHGs. Regulated by RBI. Interest: 8-15%. Informal credit (60%): Moneylenders (most common, 33%), traders, employers, relatives. Unregulated. Interest: 40-120% — exploitative. Rich get bank loans; poor are forced to informal sector.", focusObject: "FormalBar", simulationParams: { indicator: "credit" } },
      { stepNumber: 3, title: "Self-Help Groups (SHGs) — Empowering Rural Poor", description: "SHGs: Groups of 15-20 rural women who save regularly (₹25-100/month) and lend to members at affordable rates (10-15%). Grameen Bank (Bangladesh, Muhammad Yunus — Nobel Peace Prize 2006) model. India: 12+ million SHGs. SHGs reduced dependence on moneylenders significantly.", focusObject: "SHGNode", simulationParams: { indicator: "credit" } },
    ],
    objects: [
      { id: "rbi", meshName: "MoneyFlow", name: "RBI — Central Bank & Banking Regulator", description: "Reserve Bank of India: Issues currency, regulates banks, manages monetary policy.", function: "Controls money supply, inflation, credit flow in the economy.", cbseNote: "RBI (est. 1935) is lender of last resort, banker's bank, government's bank. CRR = % of deposits banks must keep with RBI.", labelOffset: { x: 0, y: 2, z: 0 } },
      { id: "shg", meshName: "SHGNode", name: "Self-Help Groups (SHGs)", description: "Rural women's savings groups providing microfinance at affordable rates.", function: "Financial inclusion — brings credit to those excluded from formal banking.", cbseNote: "Grameen Bank model (Bangladesh, Muhammad Yunus). India has 12+ million SHGs covering 100+ million poor households.", labelOffset: { x: 2.5, y: 1.5, z: 0 } },
    ],
    formulas: [
      { id: "credit-share", name: "India Rural Credit Sources", expression: "Moneylenders: 33% + Agricultural banks: 25% + Cooperatives: 20% + Others: 22% = Rural Credit", variables: "Formal sector provides only 40% of total credit. Informal sector: 60% (exploitative rates)" },
    ],
    cbseExamNotes: [
      "Double coincidence of wants: Both parties must want what the other has — problem with barter system solved by money.",
      "CRR (Cash Reserve Ratio): % of deposits commercial banks must keep with RBI. Used to control money supply.",
      "Muhammad Yunus: Founder of Grameen Bank, Bangladesh. Nobel Peace Prize 2006. Pioneered microcredit/microfinance.",
    ],
    quiz: [
      { id: "e3-q1", question: "The Reserve Bank of India (RBI) was established in:", options: ["1947", "1935", "1950", "1944"], correctIndex: 1, explanation: "RBI was established in 1935 (during British rule). It is India's central bank — issues currency, regulates commercial banks, manages monetary policy." },
      { id: "e3-q2", question: "Self-Help Groups (SHGs) primarily serve:", options: ["Large corporations", "Rich farmers", "Rural poor — especially women", "Urban professionals"], correctIndex: 2, explanation: "SHGs serve rural poor — typically groups of 15-20 women who save regularly and lend to each other at affordable rates (10-15%), reducing dependence on exploitative moneylenders." },
    ],
  },
  {
    ...SST_ECON_SCENE as PhysicsLessonConfig,
    id: "sst-globalisation", chapter: "Globalisation and the Indian Economy",
    title: "3D Trade Network — Globalisation & the Indian Economy",
    subtitle: "Visualise global trade networks, MNC operations, and India's integration into the global economy through 3D arcs and nodes. Understand how globalisation creates winners and losers — and India's experience from 1991 liberalisation onwards.",
    slug: "/class-10/sst/economics/globalisation/",
    proceduralFallbackNote: "Interactive 3D Globalisation & Trade Network visualization active.",
    parameters: { chapterId: "globalisation", indicator: "trade", year: 2022 },
    parameterControls: [
      { key: "indicator", label: "Globalisation Dimension", type: "select", options: [{ value: "trade", label: "India Trade Network (Exports/Imports)" }, { value: "mnc", label: "MNC Operations in India" }, { value: "reform", label: "1991 Liberalisation Impact" }], defaultValue: "trade" },
    ],
    learningSteps: [
      { stepNumber: 1, title: "What is Globalisation?", description: "Globalisation: Rapid integration of countries through trade, investment, technology, and people. Driven by: 1) Reduction of trade barriers (WTO), 2) Technology — cheaper transport (containers), internet (services trade), 3) MNCs seeking cheap labour/resources globally. World trade: 1990 = $7 trillion → 2022 = $32 trillion.", focusObject: "TradeNetwork", simulationParams: { indicator: "trade" } },
      { stepNumber: 2, title: "MNCs — Engines of Globalisation", description: "MNCs (Multinational Corporations): Companies operating in multiple countries. Strategy: Produce where labour/raw materials are cheapest; sell where prices are highest. Examples in India: Ford, Samsung, McDonald's, Suzuki. Indian MNCs abroad: Tata (Jaguar Land Rover, UK), Infosys (USA). MNCs control 1/3 of world trade.", focusObject: "MNCNodes", simulationParams: { indicator: "mnc" } },
      { stepNumber: 3, title: "1991 Liberalisation — India Opens Up", description: "1991 Balance of Payments Crisis → India accepted IMF conditions: Liberalisation (remove licence raj), Privatisation (sell PSUs), Globalisation (open to FDI/trade). Results: GDP growth 7-8%, IT boom, FDI inflow, mobile revolution. But: Inequality increased, small industries suffered, agricultural crisis.", focusObject: "Reform1991", simulationParams: { indicator: "reform" } },
    ],
    objects: [
      { id: "trade-net", meshName: "TradeNetwork", name: "India's Global Trade Network", description: "India's trade: Exports $450B + Imports $700B = $1.15 trillion (2022-23).", function: "Shows India's integration into global economy and trade partners.", cbseNote: "India's top exports: IT services, Pharmaceuticals, Petroleum products, Textiles. Top imports: Crude oil, Electronics, Gold.", labelOffset: { x: 0, y: 2, z: 0 } },
      { id: "mnc", meshName: "MNCNodes", name: "MNC Operations in India", description: "MNCs: Ford, Samsung, McDonald's, Suzuki, Nestlé operate in India.", function: "Bring capital, technology, management skills — but also raise competition for domestic firms.", cbseNote: "Indian MNCs abroad: Tata Motors (Jaguar Land Rover, UK), Infosys (200+ offices globally), Wipro.", labelOffset: { x: 2.5, y: 1.5, z: 0 } },
    ],
    formulas: [
      { id: "trade-balance", name: "India Trade Balance (2022-23)", expression: "Exports: ~$450B + Services: ~$300B | Imports: ~$700B + Services: ~$150B → Trade Deficit: ~$100B", variables: "Current Account Deficit (CAD): Total exports minus total imports including services" },
    ],
    cbseExamNotes: [
      "WTO (World Trade Organisation, 1995): Replaced GATT. 164 member countries. Promotes free trade by reducing tariffs and trade barriers.",
      "LPG reforms (1991): Liberalisation + Privatisation + Globalisation. Dr Manmohan Singh as Finance Minister implemented these.",
      "Fair globalisation: Ensuring benefits reach poor nations and workers, not just corporations — CBSE question on 'Is globalisation fair?'",
    ],
    quiz: [
      { id: "e4-q1", question: "The WTO (World Trade Organisation) was established in:", options: ["1947", "1991", "1995", "2001"], correctIndex: 2, explanation: "WTO was established in 1995, replacing GATT (General Agreement on Tariffs and Trade, 1947). It has 164 members and promotes free trade globally." },
      { id: "e4-q2", question: "India's 1991 economic reforms are known as:", options: ["Green Revolution", "LPG Reforms (Liberalisation, Privatisation, Globalisation)", "White Revolution", "New Economic Policy alone"], correctIndex: 1, explanation: "India's 1991 reforms under Finance Minister Dr Manmohan Singh are called LPG reforms: Liberalisation (removing licence raj), Privatisation (PSU disinvestment), and Globalisation (opening to FDI/trade)." },
    ],
  },
  {
    ...SST_ECON_SCENE as PhysicsLessonConfig,
    id: "sst-consumer-rights", chapter: "Consumer Rights",
    title: "3D Rights Pyramid — Consumer Rights & Protection in India",
    subtitle: "Visualise India's 6 consumer rights as a 3D pyramid and the 3-tier Consumer Court system (District → State → National NCDRC). Understand how to file a consumer complaint and landmark cases like ISI/Agmark standards.",
    slug: "/class-10/sst/economics/consumer-rights/",
    proceduralFallbackNote: "Interactive 3D Consumer Rights Pyramid active.",
    parameters: { chapterId: "consumer-rights", indicator: "rights", year: 2022 },
    parameterControls: [
      { key: "indicator", label: "Consumer Protection Aspect", type: "select", options: [{ value: "rights", label: "6 Consumer Rights Pyramid" }, { value: "courts", label: "3-Tier Consumer Court System" }, { value: "standards", label: "Quality Standards (ISI, Agmark, BIS)" }], defaultValue: "rights" },
    ],
    learningSteps: [
      { stepNumber: 1, title: "6 Consumer Rights (COPRA 1986)", description: "COPRA (Consumer Protection Act, 1986) gives 6 rights: 1) Right to Safety (from hazardous goods), 2) Right to Information (quality, quantity, price), 3) Right to Choose (variety, competition), 4) Right to Representation (redressal forums), 5) Right to Redressal (compensation), 6) Right to Consumer Education.", focusObject: "RightsPyramid", simulationParams: { indicator: "rights" } },
      { stepNumber: 2, title: "3-Tier Consumer Courts in India", description: "COPRA established 3-tier dispute redressal: 1) District Forum: Claims up to ₹1 crore. 2) State Commission: ₹1 crore to ₹10 crore. 3) National Commission (NCDRC, Delhi): Above ₹10 crore, appeals from State Commissions. No lawyer needed — consumers can represent themselves. Time limit: 3 months.", focusObject: "CourtPyramid", simulationParams: { indicator: "courts" } },
      { stepNumber: 3, title: "Quality Standards — ISI, Agmark, BIS, Hallmark", description: "Quality marks protect consumers: ISI Mark (Bureau of Indian Standards) for electrical, electronics goods. Agmark (Agriculture Products) for food. Hallmark (BIS) for gold jewellery purity. FPO (Fruit Products Order) for processed foods. These are CBSE board favourite questions — know which mark applies to what.", focusObject: "QualityStandards", simulationParams: { indicator: "standards" } },
    ],
    objects: [
      { id: "rights", meshName: "RightsPyramid", name: "6 Consumer Rights (COPRA 1986)", description: "Safety + Information + Choice + Representation + Redressal + Education = Consumer Rights.", function: "Legal entitlements for every consumer in India — enforceable through Consumer Courts.", cbseNote: "COPRA 1986 → Consumer Protection Act 2019 (enhanced protection, e-commerce covered, ₹1 crore district forum limit).", labelOffset: { x: 0, y: 3, z: 0 } },
      { id: "courts", meshName: "CourtPyramid", name: "3-Tier Consumer Court System", description: "District (up to ₹1Cr) → State (₹1-10Cr) → National NCDRC (above ₹10Cr).", function: "Provides accessible, affordable, speedy justice to cheated consumers.", cbseNote: "NCDRC: National Consumer Disputes Redressal Commission, New Delhi. No court fee for claims up to ₹10 lakh.", labelOffset: { x: 0, y: 1, z: 0 } },
    ],
    formulas: [
      { id: "consumer-rights", name: "6 Consumer Rights (Mnemonic: SICHRE)", expression: "Safety + Information + Choice + (to be) Heard (Representation) + Redressal + Education = SICHRE", variables: "COPRA 1986 gave legal status. Consumer Protection Act 2019 updated and strengthened these rights." },
      { id: "court-jurisdiction", name: "Consumer Court Jurisdiction", expression: "District Forum: ≤₹1Cr | State Commission: ₹1Cr–₹10Cr | NCDRC: >₹10Cr", variables: "Any consumer can file without lawyer. Time limit: 3 months from cause of action." },
    ],
    cbseExamNotes: [
      "COPRA = Consumer Protection Act, 1986. Updated by Consumer Protection Act, 2019.",
      "ISI Mark: Bureau of Indian Standards (BIS) certification for manufactured goods (electrical, LPG cylinders).",
      "Agmark: Agriculture Produce (Grading and Marking) Act — for grains, spices, vegetable oils.",
      "Hallmark: BIS certification for purity of gold jewellery. 916 Hallmark = 22 karat gold (91.6% pure).",
      "World Consumer Rights Day: March 15 (chosen by COPRA, 1986 — President Kennedy's Consumer Rights speech, March 15, 1962).",
    ],
    quiz: [
      { id: "e5-q1", question: "The Consumer Protection Act (COPRA) in India was first enacted in:", options: ["1947", "1975", "1986", "1991"], correctIndex: 2, explanation: "COPRA (Consumer Protection Act) was enacted in 1986. It established the 3-tier consumer court system and gave consumers 6 legal rights." },
      { id: "e5-q2", question: "World Consumer Rights Day is celebrated on:", options: ["January 15", "March 15", "June 5", "October 2"], correctIndex: 1, explanation: "World Consumer Rights Day: March 15 (since 1983). Chosen because US President JF Kennedy addressed Congress on Consumer Rights on March 15, 1962." },
      { id: "e5-q3", question: "Which quality mark certifies the purity of gold jewellery in India?", options: ["ISI Mark", "Agmark", "Hallmark (BIS)", "FPO"], correctIndex: 2, explanation: "BIS Hallmark certifies gold jewellery purity. 916 Hallmark = 22 karat (91.6% pure gold). Mandatory for gold jewellery in India since 2021." },
    ],
  },
];
