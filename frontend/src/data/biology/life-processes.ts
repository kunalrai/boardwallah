import type { PhysicsLessonConfig } from "../../physics-engine/types/lesson";

export const lifeProcessesLesson: PhysicsLessonConfig = {
  id: "life-processes",
  class: 10,
  subject: "Biology",
  chapter: "Life Processes",
  title: "3D Human Heart & Double Circulation",
  subtitle: "Inspect all 4 heart chambers, septum, aorta, and vena cava; adjust heart rate (BPM) to observe cardiac output and double circulation.",
  slug: "/class-10/science/biology/life-processes/",
  simulation: "biology-heart",
  model: "/assets/biology/heart/human-heart.glb",
  usesProceduralFallback: true,
  proceduralFallbackNote: "Interactive 3D 4-Chamber Human Heart & Double Circulation model active.",
  sceneConfig: { backgroundColor: 0xf4f7fb, showGrid: false, cameraPosition: { x: 0, y: 0.6, z: 7.4 }, cameraTarget: { x: 0, y: 0.3, z: 0 }, minDistance: 3.5, maxDistance: 16 },
  cameraPresets: [
    { id: "front", label: "Anterior View", position: { x: 0, y: 0.6, z: 7.4 }, target: { x: 0, y: 0.3, z: 0 } },
    { id: "angle", label: "3D Perspective", position: { x: 4.0, y: 2.2, z: 6.0 }, target: { x: 0, y: 0.3, z: 0 } },
  ],
  features: { rotation: true, zoom: true, pan: true, labels: true, animation: true, fullscreen: true },
  parameters: { bpm: 72, showBloodFlow: true },
  parameterControls: [
    { key: "bpm", label: "Heart Rate (Beats Per Minute)", type: "range", min: 50, max: 150, step: 2, unit: " BPM", defaultValue: 72 },
    { key: "showBloodFlow", label: "Animate Oxygenated / Deoxygenated Blood", type: "toggle", defaultValue: true },
  ],
  animationClips: [{ id: "heartbeat", label: "Cardiac Cycle & Flow", duration: 4.0 }],
  learningSteps: [
    { stepNumber: 1, title: "Deoxygenated Blood (Right Side)", description: "Vena Cava brings deoxygenated blood from the body into the Right Atrium → Right Ventricle → Pulmonary Artery → Lungs.", focusObject: "RightVentricle", simulationParams: { bpm: 72, showBloodFlow: true } },
    { stepNumber: 2, title: "Oxygenated Blood (Left Side)", description: "Pulmonary Vein brings oxygenated blood from the lungs into the Left Atrium → Left Ventricle → Aorta → Body.", focusObject: "LeftVentricle", simulationParams: { bpm: 72, showBloodFlow: true } },
    { stepNumber: 3, title: "Septum Separation", description: "The muscular septum prevents mixing of oxygenated and deoxygenated blood, supporting high energy needs in humans.", focusObject: "Septum", simulationParams: { bpm: 90, showBloodFlow: true } },
  ],
  objects: [
    { id: "ra", meshName: "RightAtrium", name: "Right Atrium", description: "Upper right chamber receiving deoxygenated blood.", function: "Collects blood from Vena Cava and pumps to Right Ventricle.", labelOffset: { x: -1.5, y: 0.9, z: 0 } },
    { id: "rv", meshName: "RightVentricle", name: "Right Ventricle", description: "Lower right chamber.", function: "Pumps deoxygenated blood to lungs via Pulmonary Artery.", labelOffset: { x: -1.6, y: -0.7, z: 0 } },
    { id: "la", meshName: "LeftAtrium", name: "Left Atrium", description: "Upper left chamber receiving oxygenated blood.", function: "Receives oxygen-rich blood from lungs via Pulmonary Vein.", labelOffset: { x: 1.5, y: 0.9, z: 0 } },
    { id: "lv", meshName: "LeftVentricle", name: "Left Ventricle", description: "Thickest-walled chamber of the heart.", function: "Pumps oxygenated blood to the entire body through the Aorta.", cbseNote: "Board PYQ: Why do ventricles have thicker walls than atria? Because they pump blood to distant organs under high pressure.", labelOffset: { x: 1.6, y: -0.7, z: 0 } },
    { id: "septum", meshName: "Septum", name: "Muscular Septum", description: "Dividing wall between left and right sides.", function: "Prevents mixing of oxygenated and deoxygenated blood.", labelOffset: { x: 0, y: -1.6, z: 0 } },
    { id: "aorta", meshName: "Aorta", name: "Aorta", description: "Largest artery leaving the Left Ventricle.", function: "Distributes oxygenated blood to all body tissues.", labelOffset: { x: 0.8, y: 2.3, z: 0 } },
  ],
  formulas: [
    { id: "cardiac-out", name: "Cardiac Output", expression: "Cardiac Output = Heart Rate (BPM) × Stroke Volume (70 mL)", variables: "Normal resting output ≈ 5.04 L/min" },
    { id: "double-circ", name: "Double Circulation", expression: "Pulmonary Circulation + Systemic Circulation", variables: "Blood passes through the heart twice in one complete cycle" },
  ],
  cbseExamNotes: [
    "Arteries have thick, elastic walls (high pressure, no valves except semilunar); Veins have thin walls and valves to prevent backflow.",
    "Nephron is the structural and functional filtration unit of the kidney.",
  ],
  quiz: [
    { id: "bio1-q1", question: "Which blood vessel carries oxygenated blood from the lungs to the Left Atrium?", options: ["Pulmonary artery", "Vena cava", "Pulmonary vein", "Aorta"], correctIndex: 2, explanation: "Pulmonary vein is the only vein that carries oxygenated blood (from lungs to the left atrium).", marks: 1 },
    { id: "bio1-q2", question: "Why is double circulation necessary in humans?", options: ["To mix oxygenated and deoxygenated blood", "To ensure high oxygen supply for constant body temperature", "To reduce blood pressure", "To bypass the lungs"], correctIndex: 1, explanation: "Separating oxygenated and deoxygenated blood allows efficient oxygen delivery required by warm-blooded mammals.", marks: 1 },
  ],
};
