import type { PhysicsLessonConfig } from "../../physics-engine/types/lesson";

export const reproductionLesson: PhysicsLessonConfig = {
  id: "reproduction",
  class: 10,
  subject: "Biology",
  chapter: "How do Organisms Reproduce?",
  title: "3D Flower Longitudinal Section, Pollination & Fertilization",
  subtitle: "Inspect Stamen (Anther + Filament), Pistil (Stigma + Style + Ovary + Ovule), and watch pollen travel from anther to ovule.",
  slug: "/class-10/science/biology/reproduction/",
  simulation: "biology-flower",
  model: "/assets/biology/flower/flower-ls.glb",
  usesProceduralFallback: true,
  proceduralFallbackNote: "Interactive 3D Bisexual Flower L.S. & Pollination model active.",
  sceneConfig: { backgroundColor: 0xf4f7fb, showGrid: false, cameraPosition: { x: 0, y: 0.8, z: 7.4 }, cameraTarget: { x: 0, y: 0.2, z: 0 }, minDistance: 3.5, maxDistance: 16 },
  cameraPresets: [
    { id: "front", label: "Longitudinal Section", position: { x: 0, y: 0.8, z: 7.4 }, target: { x: 0, y: 0.2, z: 0 } },
    { id: "top", label: "Stigma & Anthers", position: { x: 2.2, y: 4.5, z: 4.5 }, target: { x: 0, y: 1.2, z: 0 } },
  ],
  features: { rotation: true, zoom: true, pan: true, labels: true, animation: true, fullscreen: true },
  parameters: { showPollination: true },
  parameterControls: [
    { key: "showPollination", label: "Animate Pollination & Pollen Tube", type: "toggle", defaultValue: true },
  ],
  animationClips: [{ id: "pollination", label: "Pollination to Fertilization", duration: 4.0 }],
  learningSteps: [
    { stepNumber: 1, title: "Stamen (Male Reproductive Part)", description: "Consists of Filament and Anther, which produces yellow pollen grains containing male gametes.", focusObject: "Stamen_Anther", simulationParams: { showPollination: true } },
    { stepNumber: 2, title: "Pollination on Stigma", description: "Pollen transfers from Anther to sticky Stigma (self or cross-pollination).", focusObject: "Pistil_Stigma", simulationParams: { showPollination: true } },
    { stepNumber: 3, title: "Pollen Tube & Fertilization in Ovule", description: "Pollen tube grows down the Style into the Ovary, where male germ cell fuses with female egg inside the Ovule.", focusObject: "Ovule", simulationParams: { showPollination: true } },
  ],
  objects: [
    { id: "stigma", meshName: "Pistil_Stigma", name: "Stigma (Pistil)", description: "Sticky terminal receptive part of the carpel.", function: "Receives pollen grains during pollination.", labelOffset: { x: 0, y: 0.8, z: 0 } },
    { id: "style", meshName: "Style", name: "Style", description: "Elongated middle tube connecting stigma to ovary.", function: "Pathway through which the pollen tube grows downward.", labelOffset: { x: -1.1, y: 0.3, z: 0 } },
    { id: "ovary", meshName: "Ovary", name: "Ovary", description: "Swollen basal part of the pistil.", function: "Contains ovules; develops into the FRUIT after fertilization.", labelOffset: { x: -1.3, y: -0.4, z: 0 } },
    { id: "ovule", meshName: "Ovule", name: "Ovule", description: "Structure inside ovary containing the female egg cell.", function: "Develops into the SEED after fertilization.", labelOffset: { x: 1.3, y: -0.5, z: 0 } },
    { id: "anther", meshName: "Stamen_Anther", name: "Anther (Stamen)", description: "Bilobed top of the male stamen.", function: "Produces and releases pollen grains.", labelOffset: { x: 1.4, y: 0.6, z: 0 } },
    { id: "petals", meshName: "Petals", name: "Petals (Corolla)", description: "Brightly coloured leaf-like structures.", function: "Attracts insects/pollinators and protects inner reproductive whorls.", labelOffset: { x: -1.7, y: 1.2, z: 0 } },
  ],
  formulas: [
    { id: "post-fert", name: "Post-Fertilization Changes", expression: "Ovule → Seed  |  Ovary → Fruit  |  Zygote → Embryo", variables: "Petals, sepals, and stamens wither and fall off" },
  ],
  cbseExamNotes: [
    "Unisexual flowers (Papaya, Watermelon) contain either stamens OR pistil; Bisexual flowers (Hibiscus, Mustard) contain both.",
    "Asexual modes: Binary fission (Amoeba), Multiple fission (Plasmodium), Budding (Hydra/Yeast), Fragmentation (Spirogyra), Spore formation (Rhizopus).",
  ],
  quiz: [
    { id: "bio3-q1", question: "After fertilization in a flowering plant, what do the ovule and ovary develop into respectively?", options: ["Fruit and Seed", "Seed and Fruit", "Embryo and Root", "Pollen and Stigma"], correctIndex: 1, explanation: "The fertilized ovule develops into a seed, while the ovary grows rapidly and ripens into a fruit.", marks: 1 },
    { id: "bio3-q2", question: "Which of the following is an example of a unisexual flower?", options: ["Hibiscus", "Mustard", "Papaya", "Pea"], correctIndex: 2, explanation: "Papaya and watermelon bear unisexual flowers.", marks: 1 },
  ],
};
