import type { PhysicsLessonConfig } from "../../physics-engine/types/lesson";

export const chemicalReactionsLesson: PhysicsLessonConfig = {
  id: "chemical-reactions",
  class: 10,
  subject: "Chemistry",
  chapter: "Chemical Reactions and Equations",
  title: "3D Chemical Reactions, Thermal Decomposition & Precipitation",
  subtitle: "Observe classic CBSE Class 10 board reactions with live colour transitions, Bunsen burner heating, gas evolution, and precipitate formation.",
  slug: "/class-10/science/chemistry/chemical-reactions/",
  simulation: "chemistry-reaction",
  model: "/assets/chemistry/reactions/reaction-vessel.glb",
  usesProceduralFallback: true,
  proceduralFallbackNote: "Interactive 3D Chemistry reaction vessel & stoichiometry visualizer active.",
  sceneConfig: { backgroundColor: 0xf4f7fb, showGrid: false, cameraPosition: { x: 0, y: 1.0, z: 7.4 }, cameraTarget: { x: 0, y: 0, z: 0 }, minDistance: 3.5, maxDistance: 16 },
  cameraPresets: [
    { id: "front", label: "Vessel Front View", position: { x: 0, y: 1.0, z: 7.4 }, target: { x: 0, y: 0, z: 0 } },
    { id: "top", label: "Top Inspection", position: { x: 2.2, y: 4.5, z: 5.5 }, target: { x: 0, y: 0, z: 0 } },
  ],
  features: { rotation: true, zoom: true, pan: true, labels: true, animation: true, fullscreen: true },
  parameters: { reactionId: "feso4-decomp", reactionProgress: 0.65, heatingOn: true },
  parameterControls: [
    {
      key: "reactionId",
      label: "CBSE Board Reaction",
      type: "select",
      options: [
        { value: "feso4-decomp", label: "FeSO₄ Thermal Decomposition (Green → Brown)" },
        { value: "pbno3-decomp", label: "Pb(NO₃)₂ Thermal Decomposition (Brown NO₂)" },
        { value: "fe-cuso4", label: "Fe + CuSO₄ Displacement (Blue → Green)" },
        { value: "ba-precip", label: "Na₂SO₄ + BaCl₂ Precipitation (White BaSO₄)" },
      ],
      defaultValue: "feso4-decomp",
    },
    { key: "reactionProgress", label: "Reaction Progress", type: "range", min: 0, max: 1, step: 0.05, unit: "", defaultValue: 0.65 },
    { key: "heatingOn", label: "Bunsen Burner Heat (Δ)", type: "toggle", defaultValue: true },
  ],
  animationClips: [{ id: "react", label: "Gas & Heat Animation", duration: 4.0 }],
  learningSteps: [
    { stepNumber: 1, title: "Ferrous Sulphate Decomposition", description: "Green FeSO₄·7H₂O loses water and decomposes on heating into reddish-brown Fe₂O₃ + SO₂ + SO₃ gases.", focusObject: "ReactantMedium", simulationParams: { reactionId: "feso4-decomp", reactionProgress: 0.85, heatingOn: true } },
    { stepNumber: 2, title: "Lead Nitrate Brown Fumes", description: "White Pb(NO₃)₂ decomposes on heating to yield yellow PbO and reddish-brown NO₂ fumes.", focusObject: "EvolvedGas", simulationParams: { reactionId: "pbno3-decomp", reactionProgress: 0.85, heatingOn: true } },
    { stepNumber: 3, title: "Iron Nail in CuSO₄ (Displacement)", description: "Iron displaces Copper from blue CuSO₄, turning the solution pale green (FeSO₄) with brown Cu coating.", focusObject: "IronNail", simulationParams: { reactionId: "fe-cuso4", reactionProgress: 0.9, heatingOn: false } },
    { stepNumber: 4, title: "White BaSO₄ Precipitate", description: "Double displacement between Na₂SO₄ and BaCl₂ forms an insoluble white precipitate of BaSO₄.", focusObject: "Precipitate", simulationParams: { reactionId: "ba-precip", reactionProgress: 0.9, heatingOn: false } },
  ],
  objects: [
    { id: "vessel", meshName: "ReactionVessel", name: "Borosilicate Vessel", description: "Heat-resistant reaction tube/beaker.", function: "Holds reactants safely during heating or mixing.", labelOffset: { x: 1.4, y: 1.5, z: 0 } },
    { id: "medium", meshName: "ReactantMedium", name: "Reactant / Product Medium", description: "Solid crystals or aqueous solution undergoing chemical change.", function: "Visualizes colour change from reactants to products.", labelOffset: { x: -1.4, y: -0.4, z: 0 } },
    { id: "gas", meshName: "EvolvedGas", name: "Evolved Gas / Fumes", description: "Gaseous products (SO₂, SO₃, or brown NO₂) escaping upward.", function: "Confirms thermal decomposition.", labelOffset: { x: 1.2, y: 1.9, z: 0 } },
    { id: "precip", meshName: "Precipitate", name: "Insoluble Precipitate", description: "Solid deposit settling at the bottom.", function: "Identifies double displacement / displacement products.", labelOffset: { x: -1.3, y: -1.2, z: 0 } },
  ],
  formulas: [
    { id: "eq-feso4", name: "Ferrous Sulphate Decomposition", expression: "2FeSO₄(s) —Δ→ Fe₂O₃(s) + SO₂(g) + SO₃(g)", variables: "Green → Reddish-brown solid" },
    { id: "eq-pbno3", name: "Lead Nitrate Decomposition", expression: "2Pb(NO₃)₂(s) —Δ→ 2PbO(s) + 4NO₂(g) + O₂(g)", variables: "White → Yellow PbO + Brown NO₂ fumes" },
    { id: "eq-disp", name: "Displacement of Copper", expression: "Fe(s) + CuSO₄(aq) → FeSO₄(aq) + Cu(s)", variables: "Blue solution → Pale green + Reddish-brown Cu" },
  ],
  cbseExamNotes: [
    "Always balance chemical equations and include physical state symbols (s), (l), (g), (aq) for full CBSE marks.",
    "Remember: Rancidity is prevented by flushing chip packets with Nitrogen (inert gas) and storing in airtight containers.",
  ],
  quiz: [
    { id: "chem1-q1", question: "What is the colour of the gas evolved when Lead Nitrate is heated strongly?", options: ["Colourless", "Greenish-yellow", "Reddish-brown (NO₂)", "Violet"], correctIndex: 2, explanation: "Lead nitrate decomposes to give yellow PbO, oxygen gas, and reddish-brown fumes of Nitrogen Dioxide (NO₂).", marks: 1 },
    { id: "chem1-q2", question: "When an iron nail is dipped in blue CuSO₄ solution, what colour does the solution turn?", options: ["Deep red", "Pale green (FeSO₄)", "Colourless", "Bright yellow"], correctIndex: 1, explanation: "Iron is more reactive than copper and forms Ferrous Sulphate (FeSO₄), which is pale green.", marks: 1 },
  ],
};
