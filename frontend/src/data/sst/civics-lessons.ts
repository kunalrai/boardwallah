import type { PhysicsLessonConfig } from "../../physics-engine/types/lesson";

const SST_CIVICS_SCENE: Partial<PhysicsLessonConfig> = {
  class: 10, subject: "Political Science", simulation: "sst-civics", model: "/assets/sst/civics/scene.glb",
  usesProceduralFallback: true,
  sceneConfig: { backgroundColor: 0xfef3f2, showGrid: false, cameraPosition: { x: 0, y: 3, z: 11 }, cameraTarget: { x: 0, y: 0, z: 0 }, minDistance: 4, maxDistance: 20 },
  cameraPresets: [
    { id: "front", label: "Front View", position: { x: 0, y: 3, z: 11 }, target: { x: 0, y: 0, z: 0 } },
    { id: "top", label: "Top-Down", position: { x: 0, y: 12, z: 3 }, target: { x: 0, y: 0, z: 0 } },
  ],
  features: { rotation: true, zoom: true, pan: true, labels: true, animation: true, fullscreen: true },
  animationClips: [{ id: "structure", label: "Structure Animation", duration: 4.0 }],
};

export const civicsLessons: PhysicsLessonConfig[] = [
  {
    ...SST_CIVICS_SCENE as PhysicsLessonConfig,
    id: "sst-power-sharing", chapter: "Power Sharing",
    title: "3D Comparison — Power Sharing: Belgium vs Sri Lanka",
    subtitle: "Visualise the Belgium power-sharing model (3 communities, 3 governments) versus Sri Lanka's majoritarian model that led to civil war. Understand why power sharing is essential for democracy and social peace.",
    slug: "/class-10/sst/civics/power-sharing/",
    proceduralFallbackNote: "Interactive 3D Power Sharing Comparison active.",
    parameters: { chapterId: "power-sharing", showComparison: true, highlight: 0 },
    parameterControls: [
      { key: "highlight", label: "Focus", type: "select", options: [{ value: "0", label: "Belgium vs Sri Lanka Comparison" }, { value: "1", label: "Belgium — Power Sharing Model" }, { value: "2", label: "Sri Lanka — Majoritarian Model" }, { value: "3", label: "Forms of Power Sharing" }], defaultValue: "0" },
    ],
    learningSteps: [
      { stepNumber: 1, title: "Belgium — A Complex Power Sharing Model", description: "Belgium: 59% Dutch (Flemish), 40% French, 1% German. Despite Dutch majority, equal representation in government! 3 types of government: Central, Regional (Flemish/Walloon/Brussels), Community (Dutch/French/German community). This complex model PREVENTED ethnic conflict.", focusObject: "Belgium_Model", simulationParams: { highlight: 1 } },
      { stepNumber: 2, title: "Sri Lanka — Majoritarianism Led to Civil War", description: "Sri Lanka: 74% Sinhalese, 18% Tamil. After independence, Sinhalese majority passed: Sinhala-Only Act (1956), Buddhist preference, Sinhalese university quotas. Tamils felt excluded → Tamil Tigers → Civil War (1983–2009). 100,000+ deaths. Majoritarianism vs power sharing.", focusObject: "SriLanka_Model", simulationParams: { highlight: 2 } },
      { stepNumber: 3, title: "4 Forms of Power Sharing", description: "Power sharing takes 4 forms: 1) Horizontal (between organs — Legislature, Executive, Judiciary), 2) Vertical (between levels — Centre, State, Local), 3) Among social groups (representation of minorities, women), 4) Political parties, pressure groups, movements. All are essential for genuine democracy.", focusObject: "PowerForms", simulationParams: { highlight: 3 } },
    ],
    objects: [
      { id: "belgium", meshName: "Belgium_Model", name: "Belgium — Power Sharing Model", description: "3-tier government: Central + Regional (Flemish/Walloon/Brussels) + Community governments.", function: "Equal power despite numerical minority — prevents majoritarian tyranny.", cbseNote: "Brussels: 80% French but governed by equal Dutch-French council. This is called 'consociational democracy'.", labelOffset: { x: -2.5, y: 1.5, z: 0 } },
      { id: "sri-lanka", meshName: "SriLanka_Model", name: "Sri Lanka — Majoritarian Model", description: "Sinhalese majority imposed Sinhala-Only Act (1956), excluding Tamils from public life.", function: "Shows how majoritarianism leads to conflict — negative example.", cbseNote: "Sinhala Only Act 1956 = made Sinhala sole official language, excluding Tamil speakers from government jobs.", labelOffset: { x: 2.5, y: 1.5, z: 0 } },
    ],
    formulas: [
      { id: "power-forms", name: "4 Forms of Power Sharing", expression: "Horizontal (organs) + Vertical (levels) + Social Groups (minorities) + Civil Society (parties, movements) = Power Sharing", variables: "Belgium practices all 4 forms. Sri Lanka lacked even basic horizontal sharing." },
    ],
    cbseExamNotes: [
      "Prudential reason for power sharing: Reduces conflict, ensures stability — practical argument.",
      "Moral reason for power sharing: Democracy = rule of/by/for people — power sharing is democracy's very spirit.",
      "Majoritarianism: belief that majority community gets to rule without limits — antithesis of power sharing.",
    ],
    quiz: [
      { id: "c1-q1", question: "The Sinhala Only Act (1956) in Sri Lanka made Sinhala the:", options: ["National sport language", "Sole official language excluding Tamil", "Second language after English", "Language for religious purposes only"], correctIndex: 1, explanation: "Sinhala Only Act (1956) made Sinhala the sole official language, excluding Tamil speakers from government jobs — a key cause of the ethnic conflict." },
      { id: "c1-q2", question: "In Belgium, Brussels city has 80% French speakers but the government is:", options: ["Fully French-controlled", "Fully Dutch-controlled", "Equal Dutch-French representation", "English-speaking neutral government"], correctIndex: 2, explanation: "Despite 80% French speakers in Brussels, the city government has equal Dutch and French representation — a unique power-sharing arrangement." },
    ],
  },
  {
    ...SST_CIVICS_SCENE as PhysicsLessonConfig,
    id: "sst-federalism", chapter: "Federalism",
    title: "3D Federal Structure — Federalism in India (3-Tier Government)",
    subtitle: "Visualise India's 3-tier federal structure: Central Government (Union List 97 subjects), State Governments (State List 66 subjects), and Local Governments (Panchayats/Municipalities). Explore India's unique 'Holding Together' federalism.",
    slug: "/class-10/sst/civics/federalism/",
    proceduralFallbackNote: "Interactive 3D India Federal Structure active.",
    parameters: { chapterId: "federalism", showComparison: false, highlight: 0 },
    parameterControls: [
      { key: "highlight", label: "Focus Level", type: "select", options: [{ value: "0", label: "Full 3-Tier Structure" }, { value: "1", label: "Union Government (Central)" }, { value: "2", label: "State Governments (28+8)" }, { value: "3", label: "Local Bodies (Panchayati Raj)" }], defaultValue: "0" },
    ],
    learningSteps: [
      { stepNumber: 1, title: "India's Federal Structure — 'Holding Together' Federalism", description: "India is a 'Holding Together' federation (like Spain, Belgium) — a large country divided into states that hold together. NOT a 'Coming Together' federation (like USA, Australia) where independent states merged. India's features: Written constitution, independent judiciary, bicameral Parliament, 3 legislative lists.", focusObject: "FederalPyramid", simulationParams: { highlight: 0 } },
      { stepNumber: 2, title: "Three Legislative Lists — Union, State, Concurrent", description: "Union List (97 subjects): Defence, Foreign affairs, Banking, Railways, Nuclear energy — Centre has exclusive power. State List (66 subjects): Police, Agriculture, Trade, Irrigation — States have power. Concurrent List (47 subjects): Education, Forests, Marriage, Adoption — BOTH Centre and State, Centre prevails in conflict.", focusObject: "UnionList", simulationParams: { highlight: 1 } },
      { stepNumber: 3, title: "Linguistic Reorganisation of States (1956)", description: "States Reorganisation Act (1956): India reorganised states along linguistic lines — Tamil Nadu, Karnataka, Andhra Pradesh, Kerala created. Demand started with Potti Sriramulu's fast-unto-death for Andhra Pradesh (1952). This was a democratic response to linguistic nationalism.", focusObject: "StateMap", simulationParams: { highlight: 2 } },
      { stepNumber: 4, title: "Panchayati Raj — 3rd Tier (1992, 73rd Amendment)", description: "73rd Amendment (1992): Made Panchayati Raj constitutional. 3-tier: Gram Panchayat (village), Panchayat Samiti (block), Zila Parishad (district). 1/3 seats reserved for women. Scheduled Caste/Tribe reservations. Gram Sabha = all adult voters of a village.", focusObject: "PanchayatSystem", simulationParams: { highlight: 3 } },
    ],
    objects: [
      { id: "union", meshName: "UnionList", name: "Union List (97 Subjects)", description: "Central government exclusive subjects: Defence, Nuclear energy, Foreign policy, Railways.", function: "Subjects requiring national uniformity — handled exclusively by Centre.", cbseNote: "Union List originally 97, now slightly more. Residuary powers with Centre (unlike USA where residuary is with States).", labelOffset: { x: -2, y: 2, z: 0 } },
      { id: "panchayat", meshName: "PanchayatSystem", name: "Panchayati Raj (73rd Amendment, 1992)", description: "India's 3rd tier of government — grassroots democracy.", function: "Decentralises power to village/district level — real people's governance.", cbseNote: "73rd Amendment (1992): Panchayati Raj, 74th Amendment: Municipal bodies (Nagarpalika). Both require 1/3 women reservation.", labelOffset: { x: 2, y: 2, z: 0 } },
    ],
    formulas: [
      { id: "legislative-lists", name: "Legislative Lists", expression: "Union List (97) + State List (66) + Concurrent List (47) = Constitutional Division of Powers", variables: "Conflict: Concurrent List → Centre prevails. Residuary powers → Centre (unlike USA)" },
    ],
    cbseExamNotes: [
      "India is described as 'quasi-federal' — federal structure with a unilateral bias (Centre stronger than states).",
      "Coalition governments (1989 onwards): Increased bargaining power of states → more federal in practice.",
      "Decentralisation: 73rd (Panchayats) and 74th (Municipalities) Amendments of 1992 added 3rd tier to Indian federalism.",
    ],
    quiz: [
      { id: "c2-q1", question: "The Concurrent List in India's Constitution contains approximately:", options: ["37 subjects", "47 subjects", "57 subjects", "67 subjects"], correctIndex: 1, explanation: "Concurrent List has 47 subjects (originally 47, slightly changed). Both Centre and States can legislate — but Centre's law prevails in case of conflict." },
      { id: "c2-q2", question: "The 73rd Constitutional Amendment (1992) relates to:", options: ["Linguistic reorganisation of states", "Panchayati Raj system", "Emergency provisions", "Fundamental rights"], correctIndex: 1, explanation: "73rd Amendment (1992) gave constitutional status to Panchayati Raj (rural local government). 74th Amendment gave constitutional status to Urban local bodies (Municipalities)." },
    ],
  },
  {
    ...SST_CIVICS_SCENE as PhysicsLessonConfig,
    id: "sst-democracy-diversity", chapter: "Democracy and Diversity",
    title: "3D Social Diagram — Democracy and Diversity",
    subtitle: "Visualise how social divisions (race, religion, caste, language) can either strengthen or weaken democracy through 3D overlapping spheres and outcome bars. Study the USA civil rights movement and India's social diversity.",
    slug: "/class-10/sst/civics/democracy-diversity/",
    proceduralFallbackNote: "Interactive 3D Democracy & Diversity diagram active.",
    parameters: { chapterId: "democracy-diversity", showComparison: true, highlight: 0 },
    parameterControls: [
      { key: "highlight", label: "Focus", type: "select", options: [{ value: "0", label: "Full Social Diversity Map" }, { value: "1", label: "USA Civil Rights Movement (1960s)" }, { value: "2", label: "Three Factors Determining Outcomes" }], defaultValue: "0" },
    ],
    learningSteps: [
      { stepNumber: 1, title: "Social Differences — Natural or Created?", description: "Some social differences are natural (gender, skin colour, birthplace) but most are socially created (caste, class, religion). Social differences become social divisions when one type of difference (e.g., religion) aligns with another (e.g., economic class). This overlapping is dangerous for democracy.", focusObject: "DivisionOverlap", simulationParams: { highlight: 0 } },
      { stepNumber: 2, title: "USA Civil Rights Movement — Democracy's Response", description: "1968 Mexico Olympics: Black athletes Tommie Smith and John Carlos raised black-gloved fist on podium — protest against racial discrimination. Peter Norman (Australia) wore OPHR badge in solidarity. All three were ostracised. This shows how social movements use democratic space to fight discrimination.", focusObject: "CivilRights", simulationParams: { highlight: 1 } },
      { stepNumber: 3, title: "Three Factors That Determine Outcome", description: "Whether social divisions strengthen or weaken democracy depends on: 1) If political parties make political demands around only ONE identity → dangerous. 2) Government repression of demands → conflict escalates. 3) If minorities feel they can live with dignity → peaceful. Northern Ireland conflict shows danger of overlapping identities.", focusObject: "OutcomeFactors", simulationParams: { highlight: 2 } },
    ],
    objects: [
      { id: "overlap", meshName: "DivisionOverlap", name: "Overlapping vs Cross-Cutting Divisions", description: "Overlapping divisions: same group disadvantaged in multiple ways (poor + minority + low caste). Cross-cutting: divisions offset each other (high caste but poor).", function: "Overlapping divisions lead to conflict; cross-cutting lead to peaceful accommodation.", cbseNote: "Netherlands (Catholic vs Protestant) + (rich vs poor) cross-cut = peaceful. Northern Ireland: Catholic = poor; Protestant = rich = overlapping = conflict.", labelOffset: { x: 0, y: 2, z: 0 } },
    ],
    formulas: [
      { id: "outcome", name: "Social Division Outcome Formula", expression: "Overlapping Identities + Single-Issue Politics + Government Repression → Conflict and Instability", variables: "Cross-cutting identities + Multiple demands + Accommodation → Democratic stability" },
    ],
    cbseExamNotes: [
      "CBSE: Tommie Smith and John Carlos — 1968 Olympics Black Power salute. Suspended from US team, ostracised in America.",
      "Race in USA is a 'social' construct — not biological. Social differences that become divisions when linked to power/resources.",
      "India: Caste is a social hierarchy. Northern Ireland: Catholic vs Protestant overlaps with class → violent conflict.",
    ],
    quiz: [
      { id: "c3-q1", question: "The 1968 Mexico Olympics incident involved Black Power salute by athletes from:", options: ["Kenya and Ethiopia", "USA — Tommie Smith and John Carlos", "South Africa", "Jamaica"], correctIndex: 1, explanation: "Tommie Smith and John Carlos (USA), gold and bronze medalists in 200m, raised black-gloved fists during national anthem in protest against racial discrimination in the USA." },
    ],
  },
  {
    ...SST_CIVICS_SCENE as PhysicsLessonConfig,
    id: "sst-gender-religion-caste", chapter: "Gender, Religion and Caste",
    title: "3D Inequality Charts — Gender, Religion & Caste in Democracy",
    subtitle: "Visualise gender inequality (wage gap, political representation), religious diversity in politics, and caste discrimination in 3D comparative bar charts. Understand how democracy must address these social inequalities.",
    slug: "/class-10/sst/civics/gender-religion-caste/",
    proceduralFallbackNote: "Interactive 3D Gender, Religion & Caste Inequality visualization active.",
    parameters: { chapterId: "gender-religion-caste", showComparison: true, highlight: 0 },
    parameterControls: [
      { key: "highlight", label: "Inequality Type", type: "select", options: [{ value: "0", label: "All — Gender + Religion + Caste" }, { value: "1", label: "Gender Inequality" }, { value: "2", label: "Caste Inequality" }], defaultValue: "0" },
    ],
    learningSteps: [
      { stepNumber: 1, title: "Gender and Politics — Women's Underrepresentation", description: "Women: 48% of India's population but only ~15% of Parliament (Lok Sabha). Global: Nordic countries lead (40%+ women in Parliament). Demands: 1/3 reservation for women in Parliament (Women's Reservation Bill). India has had female PM (Indira Gandhi) but structural gender inequality persists.", focusObject: "GenderBar", simulationParams: { highlight: 1 } },
      { stepNumber: 2, title: "Communalism — When Religion Becomes Political", description: "Communalism: treating religion as the basis for political community. 3 forms: 1) Most people follow own religion most correctly, 2) Political domination of one's community, 3) Nation = one religious community. Communal violence is the extreme. India: secular state — equal respect for all religions.", focusObject: "ReligionDiagram", simulationParams: { highlight: 0 } },
      { stepNumber: 3, title: "Caste and Politics in India", description: "India's Constitution abolished untouchability (Article 17). Reservations: SC (15%), ST (7.5%), OBC (27%). Caste politics: Parties align with caste groups. Caste can mobilise voters but also causes divisions. Positive use: oppressed castes use caste identity to demand rights and representation.", focusObject: "CasteBar", simulationParams: { highlight: 2 } },
    ],
    objects: [
      { id: "gender", meshName: "GenderBar", name: "Gender Political Representation Gap", description: "Women: 48% of population but ~15% of Lok Sabha (Parliament).", function: "Shows under-representation of women in political decision-making.", cbseNote: "India's 108th constitutional Amendment Bill proposed 33% reservation for women in Parliament — not yet passed.", labelOffset: { x: -2, y: 1.5, z: 0 } },
      { id: "caste", meshName: "CasteBar", name: "Caste Reservations in India", description: "Constitutional SC (15%) + ST (7.5%) + OBC (27%) = 49.5% reservation in govt jobs/education.", function: "Affirmative action to correct centuries of caste-based discrimination.", cbseNote: "Article 17: Abolishes untouchability. Mandal Commission (1980) recommended 27% OBC reservation — implemented 1990.", labelOffset: { x: 2, y: 1.5, z: 0 } },
    ],
    formulas: [
      { id: "gender-gap", name: "India Gender Political Gap", expression: "Women = 48% of Population | Women in Lok Sabha = ~15% | Women in State Assemblies = ~10%", variables: "Nordic countries: 40%+ female representation. India: Improving but far from equal." },
    ],
    cbseExamNotes: [
      "Feminist movements: Demanded equal wages, equal opportunity, right to vote, end to sexual harassment, domestic violence laws.",
      "Sexual division of labour: Women's work (cooking, cleaning, care) considered 'natural' and unpaid — CBSE frequently asks this.",
      "Communalism is different from communal harmony. Secular state = no official religion, equal respect for all faiths.",
    ],
    quiz: [
      { id: "c4-q1", question: "Article 17 of the Indian Constitution:", options: ["Provides right to education", "Abolishes untouchability", "Guarantees freedom of religion", "Provides reservation for women"], correctIndex: 1, explanation: "Article 17 of the Indian Constitution abolishes untouchability in any form and forbids its practice." },
    ],
  },
  {
    ...SST_CIVICS_SCENE as PhysicsLessonConfig,
    id: "sst-struggles-movements", chapter: "Popular Struggles and Movements",
    title: "3D Timeline — Popular Struggles & Democracy Movements",
    subtitle: "Visualise key democratic struggles: Bolivian Water War (2000), Nepal's Democracy Movement (2006), and India's Narmada Bachao Andolan — understand how popular mobilisation deepens democracy through pressure groups and movements.",
    slug: "/class-10/sst/civics/struggles-movements/",
    proceduralFallbackNote: "Interactive 3D Popular Struggles Timeline active.",
    parameters: { chapterId: "struggles-movements", showComparison: false, highlight: 0 },
    parameterControls: [
      { key: "highlight", label: "Struggle / Movement", type: "select", options: [{ value: "0", label: "All Movements" }, { value: "1", label: "Bolivia Water War (2000)" }, { value: "2", label: "Nepal Democracy Movement (2006)" }, { value: "3", label: "Pressure Groups & Movements" }], defaultValue: "0" },
    ],
    learningSteps: [
      { stepNumber: 1, title: "Bolivia Water War (2000) — Cochabamba", description: "Bolivia's government privatised Cochabamba's water supply to MNC Bechtel Corp. Prices rose 200%. Mass protests: workers, farmers, street children united. Government declared martial law. Eventually Bechtel evicted, water supply returned to public control. Victory of popular struggle over corporate power.", focusObject: "BoliviaProtest", simulationParams: { highlight: 1 } },
      { stepNumber: 2, title: "Nepal's Democracy Movement (2006)", description: "King Gyanendra seized power (2005), dismissed parliament. 7 political parties + Maoists formed SPA (Seven Party Alliance). Mass protests across Nepal. King restored parliament (April 24, 2006). Parliament abolished monarchy (2008). Nepal became a democratic republic — people's power works.", focusObject: "NepalMovement", simulationParams: { highlight: 2 } },
      { stepNumber: 3, title: "Pressure Groups vs Political Movements", description: "Pressure Groups: Well-organised groups with specific interests (FICCI = industry, BKU = farmers, BAMCEF = Dalit). Don't contest elections but influence parties. Movements: Loose networks, broader social goals (Narmada Bachao Andolan, feminist movements, environmental groups). Both are essential for democracy.", focusObject: "PressureGroups", simulationParams: { highlight: 3 } },
    ],
    objects: [
      { id: "bolivia", meshName: "BoliviaProtest", name: "Bolivian Water War (Cochabamba, 2000)", description: "Popular struggle against water privatisation — people united across class lines.", function: "Shows how democratic mobilisation can win against corporate power.", cbseNote: "Cochabamba: Bolivia's 3rd largest city. Bechtel Corporation given monopoly over water. Prices rose 200%. Mass protests → Bechtel expelled.", labelOffset: { x: -2, y: 1.5, z: 0 } },
      { id: "nepal", meshName: "NepalMovement", name: "Nepal Democracy Movement (2006)", description: "7-party alliance + Maoists restored democracy from Royal dictatorship.", function: "Classic example of popular movement restoring and deepening democracy.", cbseNote: "SPA (Seven Party Alliance) + CPN-Maoist → mass protests → King surrenders → Constituent Assembly → Federal Democratic Republic (2008).", labelOffset: { x: 2, y: 1.5, z: 0 } },
    ],
    formulas: [
      { id: "movement-types", name: "Types of Pressure Groups", expression: "Interest Groups (FICCI, INTUC) + Issue-based Movements (NBA, NAPM) + Generic Movements (women, environment) = Civil Society", variables: "All strengthen democracy by keeping governments accountable between elections" },
    ],
    cbseExamNotes: [
      "BAMCEF: Backward and Minority Communities Employees' Federation — Dalit employees' pressure group.",
      "Narmada Bachao Andolan (NBA): Led by Medha Patkar. Against Sardar Sarovar Dam — displacement of tribals.",
      "Political parties and pressure groups differ: Parties contest elections; pressure groups influence parties.",
    ],
    quiz: [
      { id: "c5-q1", question: "The Bolivian Water War (2000) in Cochabamba was against:", options: ["Oil company nationalisation", "Water supply privatisation to Bechtel Corp", "Forest rights denial", "Agricultural land acquisition"], correctIndex: 1, explanation: "Bolivia's government privatised Cochabamba's water supply to Bechtel Corporation, causing prices to rise 200%. Mass popular protests led to Bechtel's expulsion." },
    ],
  },
  {
    ...SST_CIVICS_SCENE as PhysicsLessonConfig,
    id: "sst-political-parties", chapter: "Political Parties",
    title: "3D Party System — Political Parties in Indian Democracy",
    subtitle: "Visualise India's multi-party system in 3D: National parties (BJP, INC, BSP, NCP), State parties, and regional parties. Understand party functions, challenges (money power, dynasties, criminalisation) and reform measures.",
    slug: "/class-10/sst/civics/political-parties/",
    proceduralFallbackNote: "Interactive 3D India Political Party System active.",
    parameters: { chapterId: "political-parties", showComparison: false, highlight: 0 },
    parameterControls: [
      { key: "highlight", label: "Party Type", type: "select", options: [{ value: "0", label: "All Party Types" }, { value: "1", label: "National Parties (INC, BJP, BSP, NCP)" }, { value: "2", label: "State Parties (SAD, DMK, TDP)" }, { value: "3", label: "Party Challenges & Reforms" }], defaultValue: "0" },
    ],
    learningSteps: [
      { stepNumber: 1, title: "Functions of Political Parties", description: "Political parties: 1) Contest elections, 2) Put forward policies/programmes, 3) Make laws (ruling party), 4) Form governments, 5) Play opposition role, 6) Shape public opinion, 7) Provide access to government machinery. Without parties, democracy cannot function — parties link people to government.", focusObject: "PartyFunctions", simulationParams: { highlight: 0 } },
      { stepNumber: 2, title: "National vs State Parties — Recognition Criteria", description: "National Party: 6% votes in 4+ states OR 2% LS seats from 3+ states. State Party: 6% votes in state + 2 seats OR 3% state assembly seats. India has 6 national parties (BJP, INC, BSP, NCP, CPI, CPM), 50+ state parties. Recognition gives: official symbol, free airtime, campaign materials.", focusObject: "NationalParties", simulationParams: { highlight: 1 } },
      { stepNumber: 3, title: "Challenges to Parties — Criminalisation & Dynasties", description: "3 major challenges: 1) Internal democracy deficit — leaders choose candidates, not members. 2) Dynastic succession — politician families dominate (Gandhi family, Thackeray family). 3) Money power + criminal elements — 30%+ Lok Sabha MPs have criminal cases. Reform: RTI, candidate declaration of assets/criminal records.", focusObject: "PartyChallenges", simulationParams: { highlight: 3 } },
    ],
    objects: [
      { id: "national", meshName: "NationalParties", name: "National Parties (BJP, INC, BSP, etc.)", description: "6 recognised national parties with presence in 4+ states.", function: "Contesting national elections, forming union government, shaping national policy.", cbseNote: "National party recognition: 6% votes in 4+ Lok Sabha elections OR 2% LS seats from 3+ states. Currently: BJP, INC, BSP, NCP, CPI, CPM.", labelOffset: { x: 0, y: 2, z: 0 } },
    ],
    formulas: [
      { id: "party-recognition", name: "Political Party Recognition (ECI Criteria)", expression: "National: 6% votes in 4+ states + 4 LS seats | State: 6% state votes + 2 seats", variables: "Election Commission of India recognises parties and allocates symbols" },
    ],
    cbseExamNotes: [
      "India's first general election (1952): Congress dominant party. 1977: Janata Party victory — first non-Congress govt.",
      "NOTA (None of the Above): Introduced in 2013 — voters can reject all candidates.",
      "RTI Act (2005): Citizens can demand information from parties — increasing transparency.",
    ],
    quiz: [
      { id: "c6-q1", question: "A political party is recognised as a 'National Party' in India if it secures:", options: ["4% votes in any 2 states", "6% votes in 4 or more states + 4 Lok Sabha seats", "10% votes in any state", "50 seats in Lok Sabha"], correctIndex: 1, explanation: "ECI recognition as National Party requires: 6% votes in 4+ states + 4 Lok Sabha seats, OR 2% of Lok Sabha seats from 3+ different states." },
    ],
  },
  {
    ...SST_CIVICS_SCENE as PhysicsLessonConfig,
    id: "sst-outcomes-democracy", chapter: "Outcomes of Democracy",
    title: "3D Outcome Bars — What Democracy Delivers",
    subtitle: "Visualise democracy's outcomes across 5 dimensions in 3D bar charts: political equality, economic welfare, social dignity, accountability, and freedoms. Compare democracies vs dictatorships on each metric.",
    slug: "/class-10/sst/civics/outcomes-democracy/",
    proceduralFallbackNote: "Interactive 3D Democracy Outcomes visualization active.",
    parameters: { chapterId: "outcomes-democracy", showComparison: true, highlight: 0 },
    parameterControls: [
      { key: "highlight", label: "Outcome Dimension", type: "select", options: [{ value: "0", label: "All Outcomes" }, { value: "1", label: "Political Equality & Accountability" }, { value: "2", label: "Economic Development" }, { value: "3", label: "Social Dignity & Minority Rights" }], defaultValue: "0" },
    ],
    learningSteps: [
      { stepNumber: 1, title: "Accountability — Democracy vs Dictatorship", description: "Democracy provides mechanisms of accountability that dictatorships lack: Free press, Opposition parties, Judiciary, RTI, Elections. Regular elections force rulers to be accountable. Dictators are not removed — decisions may be faster but can be disastrously wrong. Democracy is slower but corrective.", focusObject: "AccountabilityBar", simulationParams: { highlight: 1 } },
      { stepNumber: 2, title: "Economic Development — Mixed Record", description: "Dictatorships have slightly higher average economic growth than democracies (but very variable). Poor countries: Democracies don't automatically eliminate poverty — India still has 20%+ in poverty. BUT: No major famine has occurred in a democracy (Amartya Sen). Democracy is better at distributing growth.", focusObject: "EconBar", simulationParams: { highlight: 2 } },
      { stepNumber: 3, title: "Social Dignity & Non-Discrimination", description: "Democracy's most important outcome: Dignity of citizens. Even if poorest person — democracy gives equal political rights, freedom of speech, right to vote. Social equality: Removes legal discrimination (caste, gender). India: SC/ST rights, RTI, Anti-discrimination laws all products of democratic pressure.", focusObject: "DignityBar", simulationParams: { highlight: 3 } },
    ],
    objects: [
      { id: "account", meshName: "AccountabilityBar", name: "Political Accountability (Democracy's Strength)", description: "Free elections + Independent judiciary + Free press = Accountability mechanisms.", function: "Forces rulers to justify decisions — corrects mistakes before they become catastrophes.", cbseNote: "Transparent decision-making is democracy's key strength vs authoritarian speed. No major famine in democracy (Amartya Sen).", labelOffset: { x: -2, y: 1.5, z: 0 } },
      { id: "dignity", meshName: "DignityBar", name: "Social Dignity — Democracy's Core Outcome", description: "Equal political rights for all citizens regardless of class, caste, gender, religion.", function: "Protects minorities, provides recourse against discrimination.", cbseNote: "India: Scheduled Caste/Tribe protection, Women's reservation, Minority Rights Act — all democracy outcomes.", labelOffset: { x: 2, y: 1.5, z: 0 } },
    ],
    formulas: [
      { id: "democracy-outcomes", name: "Democracy's 5 Core Outcomes", expression: "Political Equality + Accountability + Economic Development + Social Dignity + Freedoms = Democratic Outcomes", variables: "Democracy doesn't automatically guarantee all 5 — requires active citizenry and strong institutions" },
    ],
    cbseExamNotes: [
      "Amartya Sen (Nobel Laureate): 'No famine has ever taken place in the history of the world in a functioning democracy.' (Great Bengal Famine 1943 under British rule).",
      "Democracy takes more time for decisions, may be less efficient — but is more legitimate and self-correcting.",
      "Zimbabwe under Mugabe — formally democratic but rulers made themselves unaccountable = democracy without democratic outcomes.",
    ],
    quiz: [
      { id: "c7-q1", question: "Which Nobel Laureate stated that 'No major famine has occurred in a democracy'?", options: ["Rabindranath Tagore", "Mother Teresa", "Amartya Sen", "C.V. Raman"], correctIndex: 2, explanation: "Amartya Sen (Nobel Prize in Economics, 1998) famously argued that no major famine has occurred in a functioning democracy — democratic accountability forces governments to respond to food crises." },
    ],
  },
  {
    ...SST_CIVICS_SCENE as PhysicsLessonConfig,
    id: "sst-challenges-democracy", chapter: "Challenges to Democracy",
    title: "3D Reform Map — Challenges & Reform of Democracy",
    subtitle: "Visualise democracy's 3 challenge categories — Foundational, Deepening, and Expansion — with reform measures in 3D. Understand how Indian democracy can be reformed through legal, political, and social changes.",
    slug: "/class-10/sst/civics/challenges-democracy/",
    proceduralFallbackNote: "Interactive 3D Democracy Challenges & Reforms visualization active.",
    parameters: { chapterId: "challenges-democracy", showComparison: false, highlight: 0 },
    parameterControls: [
      { key: "highlight", label: "Challenge Type", type: "select", options: [{ value: "0", label: "All Challenge Types" }, { value: "1", label: "Foundational Challenge" }, { value: "2", label: "Challenge of Expansion" }, { value: "3", label: "Deepening of Democracy" }], defaultValue: "0" },
    ],
    learningSteps: [
      { stepNumber: 1, title: "3 Challenges to Democracy Globally", description: "Countries face different challenges based on their democratic stage: 1) Foundational: Countries just making transition to democracy (establish institutions, constitution). 2) Expansion: Extending democratic rights to more groups, regions, subjects. 3) Deepening: Making institutions more accountable, responsive, reducing elite capture.", focusObject: "ChallengeTypes", simulationParams: { highlight: 0 } },
      { stepNumber: 2, title: "India's Specific Democratic Challenges", description: "India's major challenges: 1) Criminalisation of politics (30%+ MPs with criminal cases). 2) Money power in elections. 3) Dynastic politics. 4) Communal violence. 5) Inequality limiting real democratic participation. 6) Low female representation. 7) Central-State tensions.", focusObject: "IndiaChallenge", simulationParams: { highlight: 3 } },
      { stepNumber: 3, title: "Democratic Reforms — What Can Be Done?", description: "Legal reforms: RTE, RTI, Anti-defection law. Electoral reforms: EVM, NOTA, Voter ID, campaign finance disclosure. Political reforms: Right of voters to recall, inner-party democracy. Social reforms: Education, women's empowerment, reducing inequality. The most important reform: Active, vigilant citizenry.", focusObject: "ReformBlocks", simulationParams: { highlight: 0 } },
    ],
    objects: [
      { id: "challenge", meshName: "ChallengeTypes", name: "3 Types of Democratic Challenges", description: "Foundational + Expansion + Deepening = Three phases of democratic challenge globally.", function: "Helps diagnose which reforms are needed based on country's democratic stage.", cbseNote: "India faces primarily Deepening challenges (reforming existing institutions) + some Expansion (women, tribals, rural areas).", labelOffset: { x: 0, y: 2, z: 0 } },
      { id: "reform", meshName: "ReformBlocks", name: "Democratic Reform Measures", description: "Legal, electoral, political, and social reforms to strengthen Indian democracy.", function: "Makes democracy more responsive, accountable, and inclusive.", cbseNote: "RTI Act (2005) = most powerful democratic reform tool. Citizens can demand ANY information from government.", labelOffset: { x: 0, y: -1, z: 0 } },
    ],
    formulas: [
      { id: "reform-formula", name: "Democratic Reform Framework", expression: "Legal Reform + Electoral Reform + Political Reform + Social Reform = Stronger Democracy", variables: "No reform works without active, informed citizenry. Democracy cannot be imposed from outside." },
    ],
    cbseExamNotes: [
      "Anti-defection law: If a legislator votes against party whip → loses seat. Reduces 'floor crossing' but reduces legislative independence too.",
      "NOTA (None of the Above): 2013. Voters can register dissatisfaction. No electoral impact — party with most votes still wins.",
      "Right to Recall: Some state governments allow voters to remove elected representatives before term ends.",
    ],
    quiz: [
      { id: "c8-q1", question: "RTI Act (Right to Information) in India was passed in:", options: ["1998", "2000", "2003", "2005"], correctIndex: 3, explanation: "RTI Act was passed in 2005. It allows any Indian citizen to request information from any public authority. It is considered the most powerful tool for democratic accountability and transparency." },
    ],
  },
];
