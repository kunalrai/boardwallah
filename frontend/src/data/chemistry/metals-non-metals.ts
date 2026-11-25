import type { PhysicsLessonConfig } from "../../physics-engine/types/lesson";

export const metalsNonMetalsLesson: PhysicsLessonConfig = {
  id: "metals-non-metals",
  class: 10,
  subject: "Chemistry",
  chapter: "Metals and Non-metals",
  title: "3D Ionic Bonding, Electron Transfer & Crystal Lattice",
  subtitle: "Watch valence electron transfer from Sodium/Magnesium to Chlorine and rotate the 3D Na⁺Cl⁻ cubic ionic crystal lattice.",
  slug: "/class-10/science/chemistry/metals-non-metals/",
  simulation: "chemistry-ionic",
  model: "/assets/chemistry/ionic/nacl-lattice.glb",
  usesProceduralFallback: true,
  proceduralFallbackNote: "Interactive 3D Ionic Electron Transfer & NaCl Crystal Lattice active.",
  sceneConfig: { backgroundColor: 0xf4f7fb, showGrid: false, cameraPosition: { x: 0, y: 1.5, z: 7.2 }, cameraTarget: { x: 0, y: 0, z: 0 }, minDistance: 3.5, maxDistance: 16 },
  cameraPresets: [
    { id: "front", label: "Front View", position: { x: 0, y: 1.5, z: 7.2 }, target: { x: 0, y: 0, z: 0 } },
    { id: "iso", label: "3D Isometric Lattice", position: { x: 4.5, y: 3.8, z: 5.5 }, target: { x: 0, y: 0, z: 0 } },
  ],
  features: { rotation: true, zoom: true, pan: true, labels: true, animation: true, fullscreen: true },
  parameters: { compound: "nacl-transfer" },
  parameterControls: [
    {
      key: "compound",
      label: "Ionic Structure / Process",
      type: "select",
      options: [
        { value: "nacl-transfer", label: "Na + Cl → Na⁺Cl⁻ (Electron Transfer)" },
        { value: "mgcl2-transfer", label: "Mg + 2Cl → MgCl₂ (Electron Transfer)" },
        { value: "nacl-lattice", label: "NaCl 3D Crystal Lattice" },
      ],
      defaultValue: "nacl-transfer",
    },
  ],
  animationClips: [{ id: "transfer", label: "Electron Transfer", duration: 4.0 }],
  learningSteps: [
    { stepNumber: 1, title: "Formation of Sodium Chloride (NaCl)", description: "Sodium (2,8,1) transfers 1 valence electron to Chlorine (2,8,7) so both achieve stable noble gas octets.", focusObject: "ValenceElectron", simulationParams: { compound: "nacl-transfer" } },
    { stepNumber: 2, title: "Formation of Magnesium Chloride (MgCl₂)", description: "Magnesium (2,8,2) donates 2 valence electrons (one to each Chlorine atom) to form Mg²⁺ and 2Cl⁻.", focusObject: "Cation_Metal", simulationParams: { compound: "mgcl2-transfer" } },
    { stepNumber: 3, title: "3D Ionic Crystal Lattice", description: "Alternating Na⁺ and Cl⁻ ions pack into a rigid 3D lattice with high melting and boiling points.", focusObject: "NaClLattice", simulationParams: { compound: "nacl-lattice" } },
  ],
  objects: [
    { id: "cation", meshName: "Cation_Metal", name: "Metal Cation (Na⁺ / Mg²⁺)", description: "Positively charged metal ion formed by losing valence electrons.", function: "Electrostatic attraction partner in ionic solids.", labelOffset: { x: -1.8, y: 1.2, z: 0 } },
    { id: "anion", meshName: "Anion_Chloride", name: "Non-Metal Anion (Cl⁻)", description: "Negatively charged chloride ion formed by gaining an electron.", function: "Completes stable octet (2,8,8).", labelOffset: { x: 1.8, y: 1.2, z: 0 } },
    { id: "electron", meshName: "ValenceElectron", name: "Transferred Valence Electron", description: "Outer-shell electron moving from metal to non-metal.", function: "Forms electrovalent (ionic) bond.", labelOffset: { x: 0, y: 1.2, z: 0 } },
    { id: "lattice", meshName: "NaClLattice", name: "NaCl Cubic Lattice", description: "3D repeating crystal array of alternating Na⁺ and Cl⁻ ions.", function: "Accounts for hardness, brittleness, and high melting point (801 °C).", labelOffset: { x: 0, y: 2.0, z: 0 } },
  ],
  formulas: [
    { id: "thermite", name: "Thermite Reaction (Joining Railway Tracks)", expression: "Fe₂O₃(s) + 2Al(s) → 2Fe(l) + Al₂O₃(s) + Heat", variables: "Highly exothermic displacement reaction" },
    { id: "roasting-calc", name: "Roasting vs Calcination", expression: "2ZnS + 3O₂ → 2ZnO + 2SO₂  |  ZnCO₃ → ZnO + CO₂", variables: "Roasting (excess air for sulphides) vs Calcination (limited air for carbonates)" },
  ],
  cbseExamNotes: [
    "Ionic compounds conduct electricity ONLY in molten state or aqueous solution because ions are free to move, not in solid state.",
    "Amphoteric oxides (e.g. Al₂O₃ and ZnO) react with both acids AND bases to form salt and water.",
  ],
  quiz: [
    { id: "met-q1", question: "Why do ionic compounds have high melting and boiling points?", options: ["They contain weak covalent bonds", "Strong electrostatic forces hold oppositely charged ions together", "They are soft solids", "They dissolve in kerosene"], correctIndex: 1, explanation: "A large amount of thermal energy is needed to overcome strong inter-ionic electrostatic attractions.", marks: 1 },
    { id: "met-q2", question: "Which pair of oxides are amphoteric in nature?", options: ["Na₂O and K₂O", "Al₂O₃ and ZnO", "CO₂ and SO₂", "CaO and MgO"], correctIndex: 1, explanation: "Aluminium oxide (Al₂O₃) and Zinc oxide (ZnO) show both acidic and basic behaviour.", marks: 1 },
  ],
};
