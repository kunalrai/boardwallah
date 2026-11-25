import type { PhysicsLessonConfig } from "../../physics-engine/types/lesson";

export const magnetismLesson: PhysicsLessonConfig = {
  id: "magnetism",
  class: 10,
  subject: "Science",
  chapter: "Magnetic Effects of Electric Current",
  title: "Magnetic Fields, Solenoid & Fleming's Left-Hand Rule",
  subtitle: "Switch between Straight Conductor (Right-Hand Thumb Rule), Solenoid Electromagnet, and Motor Force (Fleming's Left-Hand Rule).",
  slug: "/class-10/science/physics/magnetism/",
  simulation: "magnetism",
  model: "/assets/physics/magnetism/electromagnet.glb",
  usesProceduralFallback: true,
  proceduralFallbackNote: "Interactive procedural 3D magnetic field & Lorentz force simulator active.",
  sceneConfig: {
    backgroundColor: 0xf4f7fb,
    showGrid: false,
    cameraPosition: { x: 4.5, y: 3.8, z: 6.5 },
    cameraTarget: { x: 0, y: 0, z: 0 },
    minDistance: 3.5,
    maxDistance: 18,
  },
  cameraPresets: [
    { id: "perspective", label: "3D Perspective", position: { x: 4.5, y: 3.8, z: 6.5 }, target: { x: 0, y: 0, z: 0 } },
    { id: "top-down", label: "Top View (Field Rings)", position: { x: 0, y: 7.5, z: 0.4 }, target: { x: 0, y: 0, z: 0 } },
  ],
  features: { rotation: true, zoom: true, pan: true, labels: true, animation: true, fullscreen: true },
  parameters: { mode: "straight-wire", currentA: 4, turnsCount: 10 },
  parameterControls: [
    {
      key: "mode",
      label: "Magnetic Experiment",
      type: "select",
      options: [
        { value: "straight-wire", label: "Straight Conductor (Right-Hand Thumb Rule)" },
        { value: "solenoid", label: "Solenoid Electromagnet (Uniform Field)" },
        { value: "fleming-force", label: "Force on Conductor (Fleming's Left-Hand Rule)" },
      ],
      defaultValue: "straight-wire",
    },
    { key: "currentA", label: "Current (I) [Negative = Reversed]", type: "range", min: -8, max: 8, step: 1, unit: " A", defaultValue: 4 },
    { key: "turnsCount", label: "Solenoid Coil Turns (N)", type: "range", min: 4, max: 18, step: 1, unit: "", defaultValue: 10 },
  ],
  animationClips: [{ id: "field-motion", label: "Field & Force Animation", duration: 4.0 }],
  learningSteps: [
    { stepNumber: 1, title: "Straight Conductor & Right-Hand Thumb Rule", description: "Concentric magnetic field circles form around the wire; reversing current reverses the circle direction.", focusObject: "StraightConductor", simulationParams: { mode: "straight-wire", currentA: 5 } },
    { stepNumber: 2, title: "Solenoid Uniform Interior Field", description: "Parallel, equally spaced field lines inside a solenoid indicate a uniform magnetic field; strength rises with turns & current.", focusObject: "SolenoidCoil", simulationParams: { mode: "solenoid", currentA: 5, turnsCount: 12 } },
    { stepNumber: 3, title: "Fleming's Left-Hand Rule (Motor Principle)", description: "A current-carrying conductor placed perpendicular to a magnetic field experiences a mechanical force perpendicular to both.", focusObject: "DeflectingConductor", simulationParams: { mode: "fleming-force", currentA: 6 } },
  ],
  objects: [
    { id: "straight-wire", meshName: "StraightConductor", name: "Straight Copper Conductor", description: "Vertical current-carrying wire piercing a cardboard plane.", function: "Produces concentric circular magnetic field lines.", labelOffset: { x: 0.4, y: 1.8, z: 0 } },
    { id: "field-lines", meshName: "MagneticFieldLines", name: "Magnetic Field Lines", description: "Imaginary closed curves showing field direction and strength.", function: "Closer spacing represents stronger magnetic field; field lines never intersect.", labelOffset: { x: 1.6, y: 0.4, z: 0 } },
    { id: "solenoid", meshName: "SolenoidCoil", name: "Solenoid Coil", description: "Coil of many circular turns of insulated copper wire wrapped in a cylinder.", function: "Acts like a bar magnet when current flows (electromagnet).", labelOffset: { x: 0, y: 1.4, z: 0 } },
    { id: "rod", meshName: "DeflectingConductor", name: "Current-Carrying Rod", description: "Conductor suspended between North and South poles.", function: "Experiences Lorentz force F = BIL per Fleming's Left-Hand Rule.", labelOffset: { x: 0, y: 0.5, z: 0.6 } },
  ],
  formulas: [
    { id: "rhtr", name: "Right-Hand Thumb Rule", expression: "Thumb → Current (I)  |  Curled Fingers → Magnetic Field (B)", variables: "Determines clockwise vs counter-clockwise field lines" },
    { id: "flhr", name: "Fleming's Left-Hand Rule", expression: "Thumb → Force (F)  |  Forefinger → Field (B)  |  Middle → Current (I)", variables: "All three mutually perpendicular" },
  ],
  cbseExamNotes: [
    "Why do two magnetic field lines never intersect each other? Because if they did, a compass needle placed at the point of intersection would point in two directions simultaneously, which is impossible.",
    "Strength of an electromagnet increases by: (1) increasing current, (2) increasing number of turns, (3) inserting a soft iron core.",
  ],
  quiz: [
    { id: "mag-q1", question: "What is the shape of magnetic field lines inside a long straight current-carrying solenoid?", options: ["Circular", "Parabolic", "Parallel straight lines", "Radial"], correctIndex: 2, explanation: "Inside a solenoid, magnetic field lines are parallel straight lines, showing that the magnetic field is uniform.", marks: 1 },
    { id: "mag-q2", question: "Which rule gives the direction of force acting on a current-carrying conductor in a magnetic field?", options: ["Right-hand thumb rule", "Fleming's left-hand rule", "Snell's law", "Ohm's law"], correctIndex: 1, explanation: "Fleming's Left-Hand Rule relates Force (Thumb), Magnetic Field (Forefinger), and Current (Middle finger).", marks: 1 },
  ],
};
