import type { PhysicsLessonConfig } from "../../physics-engine/types/lesson";

export const eyeDefectsLesson: PhysicsLessonConfig = {
  id: "eye-defects",
  class: 10,
  subject: "Science",
  chapter: "The Human Eye and the Colourful World",
  title: "Defects of Vision & Correction (Myopia & Hypermetropia)",
  subtitle: "Compare normal focus on the retina with Myopia (focus in front) and Hypermetropia (focus behind), and apply corrective spectacle lenses.",
  slug: "/class-10/science/physics/eye-defects/",
  simulation: "anatomy",
  model: "/assets/physics/human-eye/human-eye.glb",
  usesProceduralFallback: true,
  proceduralFallbackNote: "Interactive procedural 3D human eye & spectacle lens correction simulator active.",
  sceneConfig: {
    backgroundColor: 0xf4f7fb,
    showGrid: false,
    cameraPosition: { x: -3.2, y: 1.2, z: 7.4 },
    cameraTarget: { x: -0.2, y: 0, z: 0 },
    minDistance: 3.5,
    maxDistance: 16,
  },
  cameraPresets: [
    { id: "sagittal", label: "Sagittal Focus View", position: { x: -0.3, y: 0.2, z: 8.2 }, target: { x: -0.3, y: 0, z: 0 } },
    { id: "perspective", label: "3D Cross-Section", position: { x: -3.8, y: 1.6, z: 6.8 }, target: { x: 0, y: 0, z: 0 } },
  ],
  features: { rotation: true, zoom: true, pan: true, labels: true, animation: true, fullscreen: true, crossSectionToggle: true },
  parameters: { crossSection: true, showLightPath: true, eyeDefect: "myopia", correctiveLens: false },
  parameterControls: [
    {
      key: "eyeDefect",
      label: "Vision Condition",
      type: "select",
      options: [
        { value: "normal", label: "Normal Eye (Focus on Retina)" },
        { value: "myopia", label: "Myopia (Near-sightedness)" },
        { value: "hypermetropia", label: "Hypermetropia (Far-sightedness)" },
      ],
      defaultValue: "myopia",
    },
    { key: "correctiveLens", label: "Place Corrective Spectacle Lens", type: "toggle", defaultValue: false },
    { key: "crossSection", label: "Cross-Section Cutaway", type: "toggle", defaultValue: true },
  ],
  animationClips: [{ id: "cross-section", label: "Refraction & Focus", duration: 4.0 }],
  learningSteps: [
    { stepNumber: 1, title: "Myopia (Near-sightedness)", description: "Distant rays converge IN FRONT of the retina due to high lens curvature or elongated eyeball.", focusObject: "EyeLens", simulationParams: { eyeDefect: "myopia", correctiveLens: false, crossSection: true } },
    { stepNumber: 2, title: "Myopia Correction (Concave Lens)", description: "A diverging concave lens diverges incoming rays slightly so they focus accurately back onto the retina.", focusObject: "Retina", simulationParams: { eyeDefect: "myopia", correctiveLens: true, crossSection: true } },
    { stepNumber: 3, title: "Hypermetropia (Far-sightedness)", description: "Near rays converge BEHIND the retina due to low lens power or shortened eyeball.", focusObject: "Retina", simulationParams: { eyeDefect: "hypermetropia", correctiveLens: false, crossSection: true } },
    { stepNumber: 4, title: "Hypermetropia Correction (Convex Lens)", description: "A converging convex lens provides extra converging power to shift the focus forward onto the retina.", focusObject: "EyeLens", simulationParams: { eyeDefect: "hypermetropia", correctiveLens: true, crossSection: true } },
  ],
  objects: [
    { id: "cornea", meshName: "Cornea", name: "Cornea", description: "Front transparent dome.", function: "Performs primary refraction.", labelOffset: { x: -0.7, y: 0.9, z: 0 } },
    { id: "eye-lens", meshName: "EyeLens", name: "Eye Lens", description: "Internal crystalline converging lens.", function: "Fine-tunes focal length.", labelOffset: { x: -0.2, y: 1.15, z: 0 } },
    { id: "retina", meshName: "Retina", name: "Retina", description: "Light-sensitive screen at the back of the eye.", function: "Sharp vision requires image focus exactly on the retina.", labelOffset: { x: 0.9, y: 1.3, z: 0 } },
    { id: "optic-nerve", meshName: "OpticNerve", name: "Optic Nerve", description: "Visual nerve bundle.", function: "Carries impulses to the brain.", labelOffset: { x: 0.8, y: -0.7, z: 0 } },
  ],
  formulas: [
    { id: "myopia-power", name: "Myopia Corrective Power", expression: "P = -1 / (Far Point in m)", variables: "Negative power (Concave lens)" },
    { id: "hyper-power", name: "Hypermetropia Corrective Power", expression: "1/f = 1/v - 1/u (v = -Near Point, u = -0.25 m)", variables: "Positive power (Convex lens)" },
  ],
  cbseExamNotes: [
    "Myopia: Can see near clearly, cannot see far. Image forms IN FRONT of retina. Corrected by CONCAVE lens (-D).",
    "Hypermetropia: Can see far clearly, cannot see near (< 25 cm). Image forms BEHIND retina. Corrected by CONVEX lens (+D).",
    "Presbyopia: Age-related weakening of ciliary muscles; corrected using bifocal lenses.",
  ],
  quiz: [
    { id: "def-q1", question: "A student cannot read the blackboard from the back bench, though they can read a book easily. Which lens is prescribed?", options: ["Convex lens", "Concave lens", "Cylindrical lens", "Plane glass"], correctIndex: 1, explanation: "The student has Myopia (short-sightedness), which is corrected using a diverging concave lens.", marks: 1 },
    { id: "def-q2", question: "Where does the image of a nearby object form in an uncorrected hypermetropic eye?", options: ["On the retina", "In front of the retina", "Behind the retina", "On the cornea"], correctIndex: 2, explanation: "In hypermetropia, the converging power is too low (or eyeball too short), so rays focus behind the retina.", marks: 1 },
  ],
};
