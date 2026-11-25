import type { PhysicsLessonConfig } from "../../physics-engine/types/lesson";

export const prismDispersionLesson: PhysicsLessonConfig = {
  id: "prism-dispersion",
  class: 10,
  subject: "Science",
  chapter: "The Human Eye and the Colourful World",
  title: "Refraction & Dispersion Through a Glass Prism",
  subtitle: "Observe white light splitting into the 7-colour VIBGYOR spectrum and compare deviation angles of Red vs Violet.",
  slug: "/class-10/science/physics/prism-dispersion/",
  simulation: "prism",
  model: "/assets/physics/prism/glass-prism.glb",
  usesProceduralFallback: true,
  proceduralFallbackNote: "Interactive procedural 3D glass prism & VIBGYOR dispersion solver active.",
  sceneConfig: {
    backgroundColor: 0xf4f7fb,
    showGrid: true,
    cameraPosition: { x: 0.4, y: 0.8, z: 10.2 },
    cameraTarget: { x: 0.8, y: 0, z: 0 },
    minDistance: 4,
    maxDistance: 20,
  },
  cameraPresets: [
    { id: "front-2d", label: "Spectrum Plane", position: { x: 0.8, y: 0.2, z: 10.5 }, target: { x: 0.8, y: 0, z: 0 } },
    { id: "angle-3d", label: "3D Prism View", position: { x: -3.8, y: 2.5, z: 9.2 }, target: { x: 0.6, y: 0, z: 0 } },
  ],
  features: { rotation: true, zoom: true, pan: true, labels: true, animation: true, fullscreen: true },
  parameters: { angleOfIncidence: 42, prismAngle: 60, baseRefractiveIndex: 1.52, dispersionStrength: 1.8 },
  parameterControls: [
    { key: "angleOfIncidence", label: "Angle of Incidence (i)", type: "range", min: 25, max: 70, step: 1, unit: "°", defaultValue: 42 },
    { key: "prismAngle", label: "Angle of Prism (A)", type: "range", min: 45, max: 68, step: 1, unit: "°", defaultValue: 60 },
    { key: "dispersionStrength", label: "Material Dispersion", type: "range", min: 1.0, max: 3.0, step: 0.2, unit: "×", defaultValue: 1.8 },
  ],
  animationClips: [{ id: "disp-cycle", label: "Dispersion Animation", duration: 4.0 }],
  learningSteps: [
    { stepNumber: 1, title: "Incident White Light", description: "White light contains 7 wavelengths (Red to Violet) traveling together at equal speed in air.", focusObject: "IncidentWhiteLight", simulationParams: { angleOfIncidence: 42, prismAngle: 60, dispersionStrength: 1.8 } },
    { stepNumber: 2, title: "Refraction Toward Prism Base", description: "Inside the triangular glass prism, both faces bend the light downward toward the thicker base.", focusObject: "GlassPrism", simulationParams: { angleOfIncidence: 42, prismAngle: 60, dispersionStrength: 1.8 } },
    { stepNumber: 3, title: "VIBGYOR Spectrum on Screen", description: "Violet bends most (highest refractive index) and Red bends least (lowest refractive index).", focusObject: "SpectrumScreen", simulationParams: { angleOfIncidence: 45, prismAngle: 60, dispersionStrength: 2.4 } },
  ],
  objects: [
    { id: "prism", meshName: "GlassPrism", name: "Triangular Glass Prism", description: "Two inclined plane refracting surfaces meeting at prism angle A.", function: "Deviates and disperses polychromatic white light.", labelOffset: { x: 0, y: 1.85, z: 0 } },
    { id: "white-ray", meshName: "IncidentWhiteLight", name: "Incident White Light", description: "Beam containing all visible wavelengths (400–700 nm).", function: "Strikes the first refracting face at angle i.", labelOffset: { x: -1.4, y: 0.6, z: 0 } },
    { id: "spectrum", meshName: "SpectrumVIBGYOR", name: "VIBGYOR Spectrum", description: "Seven dispersed colour bands emerging from the second face.", function: "Red is at the top (least deviation); Violet is at the bottom (max deviation).", labelOffset: { x: 1.5, y: 0.9, z: 0 } },
    { id: "screen", meshName: "SpectrumScreen", name: "Observation Screen", description: "White screen capturing the dispersed spectrum.", function: "Displays separated colour bands.", labelOffset: { x: 0, y: 2.1, z: 0 } },
  ],
  formulas: [
    { id: "prism-dev", name: "Angle of Deviation", expression: "δ = i + e - A", variables: "i: incidence, e: emergence, A: angle of prism" },
    { id: "prism-internal", name: "Internal Angle Relation", expression: "A = r₁ + r₂", variables: "r₁, r₂: angles of refraction at the two faces" },
  ],
  cbseExamNotes: [
    "Always remember: RED bends the LEAST (longest wavelength), VIOLET bends the MOST (shortest wavelength).",
    "Newton showed that placing a second identical inverted prism recombines the VIBGYOR spectrum back into white light.",
  ],
  quiz: [
    { id: "prism-q1", question: "Which colour of white light deviates the MOST when passing through a glass prism?", options: ["Red", "Yellow", "Green", "Violet"], correctIndex: 3, explanation: "Violet has the shortest wavelength, travels slowest in glass (highest refractive index), and therefore deviates the most.", marks: 1 },
    { id: "prism-q2", question: "What is the relationship between angle of incidence (i), emergence (e), prism angle (A), and deviation (δ)?", options: ["δ = i + e + A", "δ = i + e - A", "δ = A - i - e", "δ = i × e / A"], correctIndex: 1, explanation: "For a triangular prism, the total angle of deviation is δ = i + e - A.", marks: 1 },
  ],
};
