import type { PhysicsLessonConfig } from "../../physics-engine/types/lesson";

export const controlCoordinationLesson: PhysicsLessonConfig = {
  id: "control-and-coordination",
  class: 10,
  subject: "Biology",
  chapter: "Control and Coordination",
  title: "3D Motor Neuron & Nerve Impulse Transmission",
  subtitle: "Explore Dendrites, Cyton (Cell Body), Myelin Sheath, Axon, and Synapse while watching an electrical impulse travel along the neuron.",
  slug: "/class-10/science/biology/control-and-coordination/",
  simulation: "biology-neuron",
  model: "/assets/biology/neuron/neuron.glb",
  usesProceduralFallback: true,
  proceduralFallbackNote: "Interactive 3D Motor Neuron & Action Potential simulator active.",
  sceneConfig: { backgroundColor: 0xf4f7fb, showGrid: false, cameraPosition: { x: 0, y: 1.0, z: 8.6 }, cameraTarget: { x: 0, y: 0, z: 0 }, minDistance: 3.5, maxDistance: 18 },
  cameraPresets: [
    { id: "front", label: "Full Neuron View", position: { x: 0, y: 1.0, z: 8.6 }, target: { x: 0, y: 0, z: 0 } },
    { id: "soma", label: "Soma & Dendrites", position: { x: -2.6, y: 0.8, z: 4.5 }, target: { x: -2.6, y: 0, z: 0 } },
  ],
  features: { rotation: true, zoom: true, pan: true, labels: true, animation: true, fullscreen: true },
  parameters: { stimulusActive: true, impulseSpeed: 1.0 },
  parameterControls: [
    { key: "stimulusActive", label: "Apply Stimulus (Fire Impulse)", type: "toggle", defaultValue: true },
    { key: "impulseSpeed", label: "Impulse Speed", type: "range", min: 0.5, max: 2.5, step: 0.25, unit: "×", defaultValue: 1.0 },
  ],
  animationClips: [{ id: "impulse", label: "Action Potential Flow", duration: 4.0 }],
  learningSteps: [
    { stepNumber: 1, title: "Dendrites Receive Stimulus", description: "Branched dendrites detect environmental stimuli and trigger an electrical impulse.", focusObject: "Dendrites", simulationParams: { stimulusActive: true } },
    { stepNumber: 2, title: "Cell Body (Cyton) & Axon", description: "The electrical impulse passes through the Cyton and travels rapidly along the insulated Axon.", focusObject: "Axon", simulationParams: { stimulusActive: true } },
    { stepNumber: 3, title: "Synapse Chemical Release", description: "At the nerve ending, the electrical signal triggers neurotransmitter release across the synapse to the next neuron/muscle.", focusObject: "Synapse", simulationParams: { stimulusActive: true } },
  ],
  objects: [
    { id: "dendrites", meshName: "Dendrites", name: "Dendrites", description: "Short branched fibres extending from the cell body.", function: "Acquire information/stimuli from receptors or previous neurons.", labelOffset: { x: -1.4, y: 1.2, z: 0 } },
    { id: "soma", meshName: "CellBody_Soma", name: "Cell Body (Cyton)", description: "Central metabolic hub containing cytoplasm and nucleus.", function: "Integrates signals and forwards electrical impulse to axon.", labelOffset: { x: 0, y: 1.4, z: 0 } },
    { id: "axon", meshName: "Axon", name: "Axon", description: "Long conducting fibre transmitting impulses away from cyton.", function: "Carries action potential toward nerve endings.", labelOffset: { x: 0, y: -1.1, z: 0 } },
    { id: "myelin", meshName: "MyelinSheath", name: "Myelin Sheath", description: "Insulating lipid layer around the axon.", function: "Speeds up electrical impulse conduction.", labelOffset: { x: 0, y: 0.9, z: 0 } },
    { id: "synapse", meshName: "Synapse", name: "Synapse / Nerve Ending", description: "Microscopic gap between two neurons or neuron and muscle.", function: "Converts electrical impulse into chemical signal (neurotransmitters).", labelOffset: { x: 0.8, y: 1.1, z: 0 } },
  ],
  formulas: [
    { id: "reflex-arc", name: "Reflex Arc Pathway", expression: "Receptor → Sensory Neuron → Spinal Cord → Motor Neuron → Effector", variables: "Fast involuntary protection mechanism" },
    { id: "brain-parts", name: "Human Brain Divisions", expression: "Forebrain (Cerebrum: thinking) | Midbrain | Hindbrain (Cerebellum: posture, Medulla: BP/vomiting)", variables: "Key CBSE 3-mark differentiation" },
  ],
  cbseExamNotes: [
    "Reflex actions are controlled by the SPINAL CORD for instant response before the thinking brain processes it.",
    "Plant hormones: Auxin (phototropism/cell elongation), Gibberellins (stem growth), Cytokinins (cell division), Abscisic Acid (growth inhibitor/wilting).",
  ],
  quiz: [
    { id: "bio2-q1", question: "Where are electrical impulses converted into chemical signals for onward transmission?", options: ["Dendrite", "Cell body", "Axon", "Synapse (Nerve ending)"], correctIndex: 3, explanation: "At the axonal end (synapse), electrical impulses trigger the release of chemical neurotransmitters.", marks: 1 },
    { id: "bio2-q2", question: "Which part of the human brain maintains posture and equilibrium of the body?", options: ["Cerebrum", "Cerebellum", "Medulla", "Pons"], correctIndex: 1, explanation: "The Cerebellum (in the hindbrain) coordinates voluntary precision movements, posture, and balance.", marks: 1 },
  ],
};
