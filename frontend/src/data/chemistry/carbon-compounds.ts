import type { PhysicsLessonConfig } from "../../physics-engine/types/lesson";

export const carbonCompoundsLesson: PhysicsLessonConfig = {
  id: "carbon-compounds",
  class: 10,
  subject: "Chemistry",
  chapter: "Carbon and Its Compounds",
  title: "3D Carbon Molecules, Covalent Bonds & Functional Groups",
  subtitle: "Rotate 3D ball-and-stick models of Methane, Ethene, Ethyne, Ethanol, Ethanoic Acid, and Benzene to inspect single, double, and triple bonds.",
  slug: "/class-10/science/chemistry/carbon-compounds/",
  simulation: "chemistry-molecule",
  model: "/assets/chemistry/molecules/methane.glb",
  usesProceduralFallback: true,
  proceduralFallbackNote: "Interactive 3D ball-and-stick covalent molecular viewer active.",
  sceneConfig: { backgroundColor: 0xf4f7fb, showGrid: false, cameraPosition: { x: 0, y: 1.0, z: 6.2 }, cameraTarget: { x: 0, y: 0, z: 0 }, minDistance: 3.0, maxDistance: 14 },
  cameraPresets: [
    { id: "front", label: "Front View", position: { x: 0, y: 1.0, z: 6.2 }, target: { x: 0, y: 0, z: 0 } },
    { id: "iso", label: "3D Perspective", position: { x: 3.5, y: 2.5, z: 5.0 }, target: { x: 0, y: 0, z: 0 } },
  ],
  features: { rotation: true, zoom: true, pan: true, labels: true, animation: true, fullscreen: true },
  parameters: { molecule: "methane", autoRotate: true },
  parameterControls: [
    {
      key: "molecule",
      label: "Select Carbon Compound",
      type: "select",
      options: [
        { value: "methane", label: "Methane (CH₄ — Alkane)" },
        { value: "ethene", label: "Ethene (C₂H₄ — Alkene, C=C)" },
        { value: "ethyne", label: "Ethyne (C₂H₂ — Alkyne, C≡C)" },
        { value: "ethanol", label: "Ethanol (C₂H₅OH — Alcohol -OH)" },
        { value: "ethanoic-acid", label: "Ethanoic Acid (CH₃COOH — -COOH)" },
        { value: "benzene", label: "Benzene (C₆H₆ — Aromatic Ring)" },
      ],
      defaultValue: "methane",
    },
    { key: "autoRotate", label: "Auto-Rotate Molecule", type: "toggle", defaultValue: true },
  ],
  animationClips: [{ id: "spin", label: "3D Molecular Rotation", duration: 4.0 }],
  learningSteps: [
    { stepNumber: 1, title: "Methane (CH₄ — Saturated Tetrahedral)", description: "Carbon shares 4 electron pairs with 4 Hydrogen atoms, forming 4 single covalent bonds at 109.5°.", focusObject: "CarbonAtom", simulationParams: { molecule: "methane" } },
    { stepNumber: 2, title: "Ethene (C₂H₄) & Ethyne (C₂H₂)", description: "Unsaturated hydrocarbons feature C=C double or C≡C triple covalent bonds and undergo addition reactions.", focusObject: "MultipleBond", simulationParams: { molecule: "ethene" } },
    { stepNumber: 3, title: "Ethanol (-OH) & Ethanoic Acid (-COOH)", description: "Functional groups (-OH, -COOH) determine the chemical properties of organic compounds.", focusObject: "OxygenAtom", simulationParams: { molecule: "ethanol" } },
    { stepNumber: 4, title: "Benzene Ring (C₆H₆)", description: "Six carbon atoms linked in a planar hexagonal ring with alternating single and double bonds.", focusObject: "CarbonAtom", simulationParams: { molecule: "benzene" } },
  ],
  objects: [
    { id: "carbon", meshName: "CarbonAtom", name: "Carbon Atom (C)", description: "Tetravalent atom (atomic number 6, valency 4).", function: "Forms strong covalent single, double, and triple bonds.", labelOffset: { x: 0, y: 0.7, z: 0 } },
    { id: "hydrogen", meshName: "HydrogenAtom", name: "Hydrogen Atom (H)", description: "Monovalent atom sharing 1 electron pair.", function: "Completes duplet via single covalent bond.", labelOffset: { x: 0.5, y: 0.6, z: 0 } },
    { id: "oxygen", meshName: "OxygenAtom", name: "Oxygen Atom (O)", description: "Divalent heteroatom in -OH and -COOH functional groups.", function: "Gives characteristic alcohol or carboxylic acid reactivity.", labelOffset: { x: 0.4, y: 0.8, z: 0 } },
    { id: "mult-bond", meshName: "MultipleBond", name: "Double / Triple Covalent Bond", description: "Sharing of 2 or 3 pairs of electrons between atoms.", function: "Defines unsaturated hydrocarbons (alkenes & alkynes).", labelOffset: { x: 0, y: -0.7, z: 0 } },
  ],
  formulas: [
    { id: "ester", name: "Esterification (Sweet-Smelling Ester)", expression: "CH₃COOH + C₂H₅OH —H₂SO₄→ CH₃COOC₂H₅ + H₂O", variables: "Ethanoic acid + Ethanol → Ethyl ethanoate + Water" },
    { id: "homologous", name: "Homologous Series General Formulas", expression: "Alkane: CₙH₂ₙ₊₂  |  Alkene: CₙH₂ₙ  |  Alkyne: CₙH₂ₙ₋₂", variables: "Successive members differ by -CH₂- (14 u)" },
  ],
  cbseExamNotes: [
    "Why does Carbon form covalent bonds instead of C⁴⁺ or C⁴⁻? Gaining 4 electrons is unstable for a 6-proton nucleus, and losing 4 electrons requires huge energy.",
    "Soaps form spherical Micelles (hydrophobic tail inside oil droplet, hydrophilic ionic head outside in water).",
  ],
  quiz: [
    { id: "carb-q1", question: "How many covalent bonds are present in Ethane (C₂H₆)?", options: ["6 covalent bonds", "7 covalent bonds", "8 covalent bonds", "9 covalent bonds"], correctIndex: 1, explanation: "Ethane has 1 C–C bond and 6 C–H bonds, making 7 single covalent bonds in total.", marks: 1 },
    { id: "carb-q2", question: "Which functional group is present in Ethanoic Acid (CH₃COOH)?", options: ["Alcohol (-OH)", "Aldehyde (-CHO)", "Ketone (>C=O)", "Carboxylic acid (-COOH)"], correctIndex: 3, explanation: "Ethanoic acid contains the -COOH (carboxyl) functional group.", marks: 1 },
  ],
};
