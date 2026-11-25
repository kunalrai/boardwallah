import type { PhysicsLessonConfig } from "../../physics-engine/types/lesson";

export const heredityLesson: PhysicsLessonConfig = {
  id: "heredity",
  class: 10,
  subject: "Biology",
  chapter: "Heredity",
  title: "3D DNA Double Helix & Mendel's Monohybrid Cross",
  subtitle: "Inspect the rotating 3D DNA molecule and compare Tall vs Dwarf pea plant offspring across P₁ × P₁ and F₁ × F₁ crosses.",
  slug: "/class-10/science/biology/heredity/",
  simulation: "biology-heredity",
  model: "/assets/biology/heredity/dna-pea.glb",
  usesProceduralFallback: true,
  proceduralFallbackNote: "Interactive 3D DNA Double Helix & Mendelian Pea Cross model active.",
  sceneConfig: { backgroundColor: 0xf4f7fb, showGrid: false, cameraPosition: { x: 0.4, y: 1.0, z: 8.2 }, cameraTarget: { x: 0.4, y: 0, z: 0 }, minDistance: 3.5, maxDistance: 16 },
  cameraPresets: [
    { id: "front", label: "DNA & Pea Cross", position: { x: 0.4, y: 1.0, z: 8.2 }, target: { x: 0.4, y: 0, z: 0 } },
    { id: "dna", label: "DNA Close-Up", position: { x: -2.4, y: 0.4, z: 4.5 }, target: { x: -2.4, y: 0, z: 0 } },
  ],
  features: { rotation: true, zoom: true, pan: true, labels: true, animation: true, fullscreen: true },
  parameters: { cross: "Tt-Tt", autoRotate: true },
  parameterControls: [
    {
      key: "cross",
      label: "Select Mendelian Cross",
      type: "select",
      options: [
        { value: "TT-tt", label: "P₁ Cross: Pure Tall (TT) × Pure Dwarf (tt)" },
        { value: "Tt-Tt", label: "F₁ Selfing: Hybrid Tall (Tt) × Hybrid Tall (Tt)" },
        { value: "TT-Tt", label: "Back Cross: TT × Tt" },
      ],
      defaultValue: "Tt-Tt",
    },
    { key: "autoRotate", label: "Rotate DNA Helix", type: "toggle", defaultValue: true },
  ],
  animationClips: [{ id: "helix", label: "DNA Rotation", duration: 4.0 }],
  learningSteps: [
    { stepNumber: 1, title: "F₁ Generation (TT × tt)", description: "All offspring are heterozygous Tall (Tt); dominant trait T masks recessive trait t.", focusObject: "TallPeaPlant", simulationParams: { cross: "TT-tt" } },
    { stepNumber: 2, title: "F₂ Generation (Tt × Tt)", description: "Self-pollination of F₁ produces 3 Tall : 1 Dwarf phenotypic ratio and 1 TT : 2 Tt : 1 tt genotypic ratio.", focusObject: "DwarfPeaPlant", simulationParams: { cross: "Tt-Tt" } },
  ],
  objects: [
    { id: "dna", meshName: "DNA_Helix", name: "DNA Double Helix", description: "Deoxyribonucleic acid carrying hereditary genes.", function: "Stores genetic blueprint passed from parents to offspring.", labelOffset: { x: -0.5, y: 2.0, z: 0 } },
    { id: "tall", meshName: "TallPeaPlant", name: "Tall Pea Plant (TT / Tt)", description: "Expresses dominant Tall allele (T).", function: "Produces sufficient growth hormone for tall stem.", labelOffset: { x: 0, y: 1.8, z: 0 } },
    { id: "dwarf", meshName: "DwarfPeaPlant", name: "Dwarf Pea Plant (tt)", description: "Homozygous recessive genotype.", function: "Expresses dwarfness only when both alleles are recessive (tt).", labelOffset: { x: 0, y: 1.1, z: 0 } },
  ],
  formulas: [
    { id: "mono", name: "F₂ Monohybrid Ratios", expression: "Phenotypic = 3 : 1  |  Genotypic = 1 : 2 : 1", variables: "TT : Tt : tt = 1 : 2 : 1" },
    { id: "dihybrid", name: "F₂ Dihybrid Phenotypic Ratio", expression: "9 : 3 : 3 : 1", variables: "Law of Independent Assortment" },
  ],
  cbseExamNotes: [
    "In humans, sex of the child is determined by the father: X-bearing sperm + egg (X) → Girl (XX); Y-bearing sperm + egg (X) → Boy (XY).",
  ],
  quiz: [
    { id: "bio4-q1", question: "In Mendel's F₂ generation of a monohybrid cross (Tt × Tt), what is the genotypic ratio?", options: ["3 : 1", "1 : 2 : 1", "9 : 3 : 3 : 1", "1 : 1"], correctIndex: 1, explanation: "The genotypes produced are 1 TT : 2 Tt : 1 tt, giving a genotypic ratio of 1 : 2 : 1.", marks: 1 },
  ],
};
