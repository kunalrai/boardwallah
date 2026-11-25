import type { PhysicsLessonConfig } from "../../physics-engine/types/lesson";

export const ourEnvironmentLesson: PhysicsLessonConfig = {
  id: "our-environment",
  class: 10,
  subject: "Biology",
  chapter: "Our Environment",
  title: "3D Ecosystem Trophic Pyramid & 10% Energy Law",
  subtitle: "Adjust incident solar energy to calculate energy transfer across Producers, Herbivores, Carnivores, and Top Carnivores.",
  slug: "/class-10/science/biology/our-environment/",
  simulation: "biology-ecosystem",
  model: "/assets/biology/ecosystem/trophic-pyramid.glb",
  usesProceduralFallback: true,
  proceduralFallbackNote: "Interactive 3D Ecological Energy Pyramid & 10% Law simulator active.",
  sceneConfig: { backgroundColor: 0xf4f7fb, showGrid: false, cameraPosition: { x: 4.2, y: 2.6, z: 6.4 }, cameraTarget: { x: 0, y: 0, z: 0 }, minDistance: 3.5, maxDistance: 16 },
  cameraPresets: [
    { id: "iso", label: "3D Pyramid View", position: { x: 4.2, y: 2.6, z: 6.4 }, target: { x: 0, y: 0, z: 0 } },
    { id: "front", label: "Front Tiers", position: { x: 0, y: 0.4, z: 7.5 }, target: { x: 0, y: 0, z: 0 } },
  ],
  features: { rotation: true, zoom: true, pan: true, labels: true, animation: true, fullscreen: true },
  parameters: { solarEnergyJ: 100000, autoRotate: true },
  parameterControls: [
    { key: "solarEnergyJ", label: "Incident Solar Energy", type: "range", min: 10000, max: 500000, step: 10000, unit: " J", defaultValue: 100000 },
    { key: "autoRotate", label: "Auto-Rotate Pyramid", type: "toggle", defaultValue: true },
  ],
  animationClips: [{ id: "rotate", label: "3D Pyramid Rotation", duration: 4.0 }],
  learningSteps: [
    { stepNumber: 1, title: "T₁ Producers (1% Solar Capture)", description: "Green plants capture ~1% of sunlight via photosynthesis.", focusObject: "Producers_T1", simulationParams: { solarEnergyJ: 100000 } },
    { stepNumber: 2, title: "10% Transfer Law (T₂ → T₃ → T₄)", description: "Only 10% of energy passes to each next level; 90% is lost as heat/respiration, limiting food chains to 3–4 steps.", focusObject: "TertiaryConsumers_T4", simulationParams: { solarEnergyJ: 200000 } },
  ],
  objects: [
    { id: "t1", meshName: "Producers_T1", name: "T₁ Producers (Plants)", description: "Autotrophs converting solar energy to chemical energy.", function: "Base of the food web; largest biomass & energy.", labelOffset: { x: 2.4, y: -1.3, z: 0 } },
    { id: "t2", meshName: "PrimaryConsumers_T2", name: "T₂ Primary Consumers (Herbivores)", description: "Organisms feeding directly on plants.", function: "Receive 10% of T₁ energy.", labelOffset: { x: -2.0, y: -0.4, z: 0 } },
    { id: "t3", meshName: "SecondaryConsumers_T3", name: "T₃ Secondary Consumers", description: "Small carnivores feeding on herbivores.", function: "Receive 10% of T₂ energy.", labelOffset: { x: 1.6, y: 0.5, z: 0 } },
    { id: "t4", meshName: "TertiaryConsumers_T4", name: "T₄ Top Carnivores", description: "Apex predators at the top of the food chain.", function: "Receive minimal energy; highest biological magnification of toxins.", labelOffset: { x: -1.2, y: 1.5, z: 0 } },
  ],
  formulas: [
    { id: "ten-percent", name: "10% Energy Law", expression: "Eₙ₊₁ = 0.10 × Eₙ", variables: "Only 10% energy moves up each trophic level" },
    { id: "ozone", name: "Ozone Formation", expression: "O₂ —UV→ O + O  |  O + O₂ → O₃", variables: "CFCs deplete stratospheric ozone layer" },
  ],
  cbseExamNotes: [
    "Biological Magnification: Non-biodegradable pesticides (like DDT) accumulate in increasing concentrations at higher trophic levels, highest in humans.",
  ],
  quiz: [
    { id: "bio5-q1", question: "If 10,000 J of energy is available to producers (plants), how much energy reaches secondary consumers (T₃)?", options: ["1,000 J", "100 J", "10 J", "1 J"], correctIndex: 1, explanation: "Producers (10,000 J) → Primary consumers (1,000 J) → Secondary consumers (100 J) by the 10% law.", marks: 1 },
  ],
};
