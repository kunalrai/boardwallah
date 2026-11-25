import type { PhysicsLessonConfig } from "../../physics-engine/types/lesson";

export const acidsBasesLesson: PhysicsLessonConfig = {
  id: "acids-bases-salts",
  class: 10,
  subject: "Chemistry",
  chapter: "Acids, Bases and Salts",
  title: "3D pH Scale, Universal Indicator & H⁺/OH⁻ Ion Lab",
  subtitle: "Adjust pH from 0 to 14 to observe Universal Indicator colour shifts, H⁺ vs OH⁻ ion concentrations, and Litmus/Phenolphthalein tests.",
  slug: "/class-10/science/chemistry/acids-bases-salts/",
  simulation: "chemistry-ph",
  model: "/assets/chemistry/ph/beaker.glb",
  usesProceduralFallback: true,
  proceduralFallbackNote: "Interactive 3D pH Beaker & H⁺/OH⁻ Ion simulator active.",
  sceneConfig: { backgroundColor: 0xf4f7fb, showGrid: false, cameraPosition: { x: 0, y: 2.0, z: 6.8 }, cameraTarget: { x: 0, y: 0, z: 0 }, minDistance: 3.5, maxDistance: 15 },
  cameraPresets: [
    { id: "front", label: "Beaker Front", position: { x: 0, y: 2.0, z: 6.8 }, target: { x: 0, y: 0, z: 0 } },
    { id: "top", label: "Top Ion View", position: { x: 0, y: 6.5, z: 2.5 }, target: { x: 0, y: 0, z: 0 } },
  ],
  features: { rotation: true, zoom: true, pan: true, labels: true, animation: true, fullscreen: true },
  parameters: { pH: 7.0 },
  parameterControls: [
    { key: "pH", label: "Solution pH (0 = Strong Acid, 14 = Strong Base)", type: "range", min: 0, max: 14, step: 0.5, unit: "", defaultValue: 7.0 },
  ],
  animationClips: [{ id: "ions", label: "Ion Motion", duration: 4.0 }],
  learningSteps: [
    { stepNumber: 1, title: "Strong Acid (pH 1.0 — Gastric Juice / HCl)", description: "High concentration of H⁺(aq) ions (red spheres); turns Universal Indicator red and Blue Litmus red.", focusObject: "HydrogenIons", simulationParams: { pH: 1.0 } },
    { stepNumber: 2, title: "Neutral Solution (pH 7.0 — Pure Water)", description: "Equal H⁺ and OH⁻ ions; turns Universal Indicator green.", focusObject: "IndicatorSolution", simulationParams: { pH: 7.0 } },
    { stepNumber: 3, title: "Strong Alkali (pH 13.5 — NaOH)", description: "High concentration of OH⁻(aq) ions (blue spheres); turns Universal Indicator violet and Phenolphthalein deep pink.", focusObject: "HydroxideIons", simulationParams: { pH: 13.5 } },
  ],
  objects: [
    { id: "beaker", meshName: "GlassBeaker", name: "Glass Beaker", description: "Graduated laboratory beaker.", function: "Contains aqueous test solution.", labelOffset: { x: -1.8, y: 1.2, z: 0 } },
    { id: "sol", meshName: "IndicatorSolution", name: "Universal Indicator Solution", description: "Mixture of indicators showing distinct colours across pH 0–14.", function: "Identifies acidic, neutral, or basic strength.", labelOffset: { x: -1.8, y: -0.5, z: 0 } },
    { id: "strip", meshName: "PhPaperStrip", name: "pH Paper Strip", description: "Test strip dipped into solution.", function: "Matches standard pH colour chart.", labelOffset: { x: 1.4, y: 1.5, z: 0 } },
    { id: "h-ions", meshName: "HydrogenIons", name: "H⁺(aq) / H₃O⁺ Ions", description: "Hydronium ions responsible for acidic character.", function: "Higher [H⁺] ⇒ lower pH (stronger acid).", labelOffset: { x: -1.5, y: 0.4, z: 0 } },
    { id: "oh-ions", meshName: "HydroxideIons", name: "OH⁻(aq) Ions", description: "Hydroxide ions responsible for basic character.", function: "Higher [OH⁻] ⇒ higher pH (stronger base).", labelOffset: { x: 1.5, y: -0.4, z: 0 } },
  ],
  formulas: [
    { id: "chlor-alkali", name: "Chlor-Alkali Process", expression: "2NaCl(aq) + 2H₂O(l) → 2NaOH(aq) + Cl₂(g) + H₂(g)", variables: "Cl₂ at Anode, H₂ at Cathode, NaOH near Cathode" },
    { id: "pop", name: "Plaster of Paris & Gypsum", expression: "CaSO₄·½H₂O + 1½H₂O → CaSO₄·2H₂O", variables: "Plaster of Paris sets into hard Gypsum" },
  ],
  cbseExamNotes: [
    "Always add ACID slowly to WATER with constant stirring (exothermic dilution), never water to acid.",
    "Tooth decay starts when mouth pH falls below 5.5; Baking Soda (NaHCO₃) or toothpaste neutralises excess acid.",
  ],
  quiz: [
    { id: "ph-q1", question: "A solution turns red litmus blue. Its pH is likely to be:", options: ["1", "4", "5", "10"], correctIndex: 3, explanation: "Solutions turning red litmus blue are basic (alkaline) and have pH > 7.", marks: 1 },
    { id: "ph-q2", question: "Which chemical is known as Bleaching Powder?", options: ["NaHCO₃", "CaOCl₂", "Na₂CO₃·10H₂O", "CaSO₄·½H₂O"], correctIndex: 1, explanation: "Calcium oxychloride (CaOCl₂) is Bleaching Powder, prepared by passing Cl₂ over dry slaked lime Ca(OH)₂.", marks: 1 },
  ],
};
