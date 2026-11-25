import type { PhysicsLessonConfig } from "../../physics-engine/types/lesson";

export const concaveLensLesson: PhysicsLessonConfig = {
  id: "concave-lens",
  class: 10,
  subject: "Science",
  chapter: "Light – Reflection and Refraction",
  title: "Image Formation by Concave Lens",
  subtitle: "Observe diverging refraction through a biconcave lens, always producing a virtual, erect, and diminished image on the object side.",
  slug: "/class-10/science/physics/concave-lens/",
  simulation: "lens",
  model: "/assets/physics/lenses/concave-lens.glb",
  usesProceduralFallback: true,
  proceduralFallbackNote: "Interactive procedural 3D biconcave lens & divergence ray tracing active.",
  sceneConfig: {
    backgroundColor: 0xf4f7fb,
    showGrid: true,
    cameraPosition: { x: -0.5, y: 1.2, z: 11.2 },
    cameraTarget: { x: -0.5, y: 0.2, z: 0 },
    minDistance: 4,
    maxDistance: 24,
  },
  cameraPresets: [
    { id: "front-2d", label: "Standard Ray Plane", position: { x: -0.5, y: 0.4, z: 11.5 }, target: { x: -0.5, y: 0.1, z: 0 } },
    { id: "angle-3d", label: "3D Perspective", position: { x: -4.2, y: 2.6, z: 10.2 }, target: { x: -0.5, y: 0.1, z: 0 } },
  ],
  features: {
    rotation: true,
    zoom: true,
    pan: true,
    labels: true,
    animation: true,
    fullscreen: true,
    objectDistanceSlider: true,
    focalLengthSlider: true,
    objectHeightSlider: true,
  },
  parameters: {
    lensType: "concave",
    focalLength: 15,
    objectDistance: -30,
    objectHeight: 4.5,
  },
  parameterControls: [
    { key: "objectDistance", label: "Object Distance (u)", type: "range", min: -55, max: -5, step: 1, unit: " cm", defaultValue: -30 },
    { key: "focalLength", label: "Focal Length Magnitude |f|", type: "range", min: 8, max: 22, step: 1, unit: " cm", defaultValue: 15 },
    { key: "objectHeight", label: "Object Height (h₀)", type: "range", min: 2, max: 7, step: 0.5, unit: " cm", defaultValue: 4.5 },
  ],
  animationClips: [{ id: "ray-trace", label: "Divergence Ray Animation", duration: 4.0 }],
  learningSteps: [
    { stepNumber: 1, title: "Parallel Ray Diverges From F₁", description: "A ray parallel to the principal axis diverges after passing through the concave lens as if coming from Focus F₁.", focusObject: "Focus_F1", simulationParams: { lensType: "concave", objectDistance: -30, focalLength: 15, objectHeight: 4.5 } },
    { stepNumber: 2, title: "Ray Through Optical Centre O", description: "A ray directed toward O passes straight through without deviation.", focusObject: "OpticalCentre_O", simulationParams: { lensType: "concave", objectDistance: -20, focalLength: 15, objectHeight: 4.5 } },
    { stepNumber: 3, title: "Virtual, Erect & Diminished Image", description: "Image always forms between O and F₁ on the same side as the object (0 < m < +1).", focusObject: "Image_AB", simulationParams: { lensType: "concave", objectDistance: -12, focalLength: 15, objectHeight: 4.5 } },
  ],
  objects: [
    { id: "object-ab", meshName: "Object_AB", name: "Object (AB)", description: "Real object placed to the left of the concave lens.", function: "Source of incident light rays.", labelOffset: { x: 0, y: 0.6, z: 0 } },
    { id: "lens-body", meshName: "LensBody", name: "Concave Lens", description: "Thinner at the centre, thicker at the edges (diverging lens).", function: "Diverges parallel light rays; f < 0 and P < 0.", labelOffset: { x: 0, y: 2.3, z: 0 } },
    { id: "optical-centre", meshName: "OpticalCentre_O", name: "Optical Centre (O)", description: "Central point of the lens.", function: "Rays pass undeviated through O.", labelOffset: { x: 0, y: -0.45, z: 0 } },
    { id: "f1", meshName: "Focus_F1", name: "Focus F₁", description: "Virtual principal focus on the object side.", function: "Diverging rays appear to originate from F₁.", labelOffset: { x: 0, y: -0.45, z: 0 } },
    { id: "image-ab", meshName: "Image_AB", name: "Image (A'B')", description: "Virtual, erect, diminished image formed between O and F₁.", function: "Always smaller than the object (0 < m < 1).", labelOffset: { x: 0, y: 0.55, z: 0 } },
  ],
  formulas: [
    { id: "lens-eq", name: "Lens Formula", expression: "1/f = 1/v - 1/u", variables: "f is NEGATIVE for a concave lens" },
    { id: "lens-power", name: "Negative Optical Power", expression: "P = 1 / f(m) < 0", variables: "Prescribed to correct Myopia (near-sightedness)" },
  ],
  cbseExamNotes: [
    "A concave lens is used in spectacles to correct Myopia (short-sightedness).",
    "For any finite real object, a concave lens ALWAYS forms a virtual, erect, and diminished image between O and F₁.",
  ],
  quiz: [
    { id: "concl-q1", question: "A concave lens of focal length 15 cm forms an image 10 cm from the lens. How far is the object placed?", options: ["-15 cm", "-30 cm", "-6 cm", "-10 cm"], correctIndex: 1, explanation: "1/u = 1/v - 1/f = 1/(-10) - 1/(-15) = -1/30 ⇒ u = -30 cm.", marks: 1 },
    { id: "concl-q2", question: "What is the sign of the power of a concave lens?", options: ["Always positive", "Always negative", "Zero", "Depends on object distance"], correctIndex: 1, explanation: "Since focal length f is negative for a concave lens, P = 1/f is always negative.", marks: 1 },
  ],
};
