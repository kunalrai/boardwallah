import type { PhysicsLessonConfig } from "../../physics-engine/types/lesson";

export const glassSlabLesson: PhysicsLessonConfig = {
  id: "glass-slab",
  class: 10,
  subject: "Science",
  chapter: "Light – Reflection and Refraction",
  title: "Refraction Through a Rectangular Glass Slab",
  subtitle: "Vary angle of incidence, refractive index n, and slab thickness to verify Snell's Law and measure lateral displacement.",
  slug: "/class-10/science/physics/glass-slab/",
  simulation: "refraction",
  model: "/assets/physics/lenses/glass-slab.glb",
  usesProceduralFallback: true,
  proceduralFallbackNote: "Interactive procedural 3D glass slab & Snell's Law ray tracer active.",
  sceneConfig: {
    backgroundColor: 0xf4f7fb,
    showGrid: true,
    cameraPosition: { x: 0, y: 0.6, z: 10.5 },
    cameraTarget: { x: 0.2, y: 0, z: 0 },
    minDistance: 4,
    maxDistance: 20,
  },
  cameraPresets: [
    { id: "front-2d", label: "2D Refraction Plane", position: { x: 0.2, y: 0.2, z: 10.5 }, target: { x: 0.2, y: 0, z: 0 } },
    { id: "angle-3d", label: "3D Glass Block", position: { x: -4.2, y: 2.8, z: 9.2 }, target: { x: 0.2, y: 0, z: 0 } },
  ],
  features: { rotation: true, zoom: true, pan: true, labels: true, animation: true, fullscreen: true },
  parameters: { angleOfIncidence: 40, refractiveIndex: 1.5, thickness: 4.0 },
  parameterControls: [
    { key: "angleOfIncidence", label: "Angle of Incidence (i)", type: "range", min: 10, max: 70, step: 1, unit: "°", defaultValue: 40 },
    { key: "refractiveIndex", label: "Refractive Index (n)", type: "range", min: 1.2, max: 2.42, step: 0.02, unit: "", defaultValue: 1.5 },
    { key: "thickness", label: "Glass Slab Thickness (t)", type: "range", min: 2, max: 7, step: 0.5, unit: " cm", defaultValue: 4.0 },
  ],
  animationClips: [{ id: "slab-refract", label: "Ray Refraction Cycle", duration: 4.0 }],
  learningSteps: [
    { stepNumber: 1, title: "Air → Glass (Rarer to Denser)", description: "Light slows down in glass and bends TOWARD the normal (∠r < ∠i).", focusObject: "IncidentRay", simulationParams: { angleOfIncidence: 45, refractiveIndex: 1.5, thickness: 4 } },
    { stepNumber: 2, title: "Glass → Air (Denser to Rarer)", description: "Light speeds up leaving the opposite parallel face and bends AWAY from the normal (∠e = ∠i).", focusObject: "EmergentRay", simulationParams: { angleOfIncidence: 45, refractiveIndex: 1.5, thickness: 4 } },
    { stepNumber: 3, title: "Lateral Displacement", description: "Increasing thickness t, angle i, or refractive index n increases the perpendicular shift between incident and emergent rays.", focusObject: "LateralShift", simulationParams: { angleOfIncidence: 55, refractiveIndex: 1.8, thickness: 6 } },
  ],
  objects: [
    { id: "glass-slab", meshName: "GlassSlab", name: "Rectangular Glass Slab", description: "Parallel-sided transparent optical medium.", function: "Refracts light twice at opposite parallel boundaries.", labelOffset: { x: 2.4, y: 0.6, z: 0 } },
    { id: "inc-ray", meshName: "IncidentRay", name: "Incident Ray", description: "Incoming ray in air striking the top interface at angle i.", function: "Travels at speed c in air/vacuum.", labelOffset: { x: -1.1, y: 1.3, z: 0 } },
    { id: "ref-ray", meshName: "RefractedRay", name: "Refracted Ray", description: "Ray bending toward the normal inside the glass.", function: "Obeys Snell's Law: sin(i) / sin(r) = n.", labelOffset: { x: 0.6, y: 0.1, z: 0 } },
    { id: "emer-ray", meshName: "EmergentRay", name: "Emergent Ray", description: "Ray exiting back into air parallel to the original direction.", function: "Angle of emergence e equals angle of incidence i.", labelOffset: { x: 1.1, y: -1.1, z: 0 } },
    { id: "lat-shift", meshName: "LateralShift", name: "Original Path / Shift", description: "Dashed extension showing lateral displacement d.", function: "Increases with slab thickness and angle of incidence.", labelOffset: { x: 1.5, y: -1.8, z: 0 } },
  ],
  formulas: [
    { id: "snell", name: "Snell's Law of Refraction", expression: "n = sin(i) / sin(r)", variables: "n: refractive index of glass w.r.t. air (~1.5 for crown glass)" },
    { id: "lat-eq", name: "Lateral Displacement", expression: "d = t · sin(i - r) / cos(r)", variables: "t: slab thickness" },
  ],
  cbseExamNotes: [
    "Why is there no net angular deviation in a parallel-sided glass slab? Because bending at the first face is exactly cancelled by equal and opposite bending at the parallel second face (∠i = ∠e).",
  ],
  quiz: [
    { id: "slab-q1", question: "When a light ray passes from air into glass, how does it bend?", options: ["Away from the normal", "Toward the normal", "Does not bend", "Reflects completely"], correctIndex: 1, explanation: "Air is optically rarer and glass is optically denser, so light slows down and bends toward the normal.", marks: 1 },
    { id: "slab-q2", question: "For a parallel-sided glass slab, how is the emergent ray related to the incident ray?", options: ["Perpendicular", "Parallel and laterally displaced", "Converging", "Coincident without shift"], correctIndex: 1, explanation: "Since opposite faces are parallel, ∠e = ∠i and the emergent ray is parallel to the incident ray, shifted laterally.", marks: 1 },
  ],
};
