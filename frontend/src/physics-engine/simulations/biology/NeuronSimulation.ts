import * as THREE from "three";
import type {
  Simulation,
  SimulationContext,
  SimulationParameters,
  SimulationResult,
} from "../interfaces/Simulation";
import { clearGroupWithDispose } from "../optics/opticsVisuals";

/**
 * Interactive 3D Motor Neuron & Nerve Impulse Simulation (Control & Coordination).
 */
export class NeuronSimulation implements Simulation {
  public readonly id = "biology-neuron";

  private context!: SimulationContext;
  private dynamicGroup = new THREE.Group();
  private impulsePath = [
    new THREE.Vector3(-4.2, 0.8, 0),
    new THREE.Vector3(-2.6, 0, 0),
    new THREE.Vector3(2.8, 0, 0),
    new THREE.Vector3(3.8, 0.7, 0),
  ];
  private impulseMesh: THREE.Mesh | null = null;
  private params = { stimulusActive: true, impulseSpeed: 1.0 };
  private initialParams = { ...this.params };
  private animProgress = 0;

  initialize(context: SimulationContext, initialParams: SimulationParameters): void {
    this.context = context;
    this.dynamicGroup.name = "__BioNeuronGroup";
    this.context.simulationGroup.add(this.dynamicGroup);
    if (typeof initialParams.stimulusActive === "boolean") this.params.stimulusActive = initialParams.stimulusActive;
    if (typeof initialParams.impulseSpeed === "number") this.params.impulseSpeed = initialParams.impulseSpeed;
    this.initialParams = { ...this.params };
    this.rebuildVisuals();
  }

  setParameters(params: SimulationParameters): SimulationResult {
    if (typeof params.stimulusActive === "boolean") this.params.stimulusActive = params.stimulusActive;
    if (typeof params.impulseSpeed === "number") this.params.impulseSpeed = params.impulseSpeed;
    if (typeof params.__animationProgress === "number") this.animProgress = params.__animationProgress;
    if (this.impulseMesh) this.impulseMesh.visible = this.params.stimulusActive;
    return this.getResults();
  }

  private rebuildVisuals(): void {
    clearGroupWithDispose(this.dynamicGroup);

    // 1. Cell Body (Soma) & Nucleus
    const soma = new THREE.Mesh(
      new THREE.SphereGeometry(0.95, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 })
    );
    soma.position.set(-2.6, 0, 0);
    soma.name = "CellBody_Soma";

    const nucleus = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 18, 18),
      new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.35 })
    );
    nucleus.position.set(-2.6, 0, 0.3);
    nucleus.name = "Nucleus";

    // 2. Dendrites branching left from Soma
    const dendriteAngles = [0.65, 1.25, -0.65, -1.25, 0.15];
    dendriteAngles.forEach((ang, idx) => {
      const den = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.14, 1.75, 12),
        new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.45 })
      );
      den.rotation.z = Math.PI / 2 + ang;
      den.position.set(-2.6 - Math.cos(ang) * 1.25, Math.sin(ang) * 1.25, (idx % 2 === 0 ? 0.2 : -0.2));
      den.name = "Dendrites";
      this.dynamicGroup.add(den);
    });

    // 3. Axon shaft
    const axon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 5.4, 18),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.4 })
    );
    axon.rotation.z = Math.PI / 2;
    axon.position.set(0.1, 0, 0);
    axon.name = "Axon";

    // 4. Myelin Sheaths (insulating segments along Axon)
    [-1.1, 0.1, 1.3].forEach((x) => {
      const sheath = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.32, 0.65, 8, 16),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.72, roughness: 0.25 })
      );
      sheath.rotation.z = Math.PI / 2;
      sheath.position.set(x, 0, 0);
      sheath.name = "MyelinSheath";
      this.dynamicGroup.add(sheath);
    });

    // 5. Nerve Endings / Axon Terminals & Synapse
    [-0.7, 0, 0.7].forEach((yOff) => {
      const branch = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.05, 1.2, 12),
        new THREE.MeshStandardMaterial({ color: 0xd97706 })
      );
      branch.rotation.z = Math.PI / 2 - yOff * 0.5;
      branch.position.set(3.25, yOff * 0.55, 0);
      branch.name = "AxonTerminal";

      const knob = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 14, 14),
        new THREE.MeshStandardMaterial({ color: 0xef4444 })
      );
      knob.position.set(3.85, yOff * 0.9, 0);
      knob.name = "Synapse";
      this.dynamicGroup.add(branch, knob);
    });

    // 6. Electrical Impulse Sphere
    const impulse = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    impulse.visible = this.params.stimulusActive;
    this.impulseMesh = impulse;

    this.dynamicGroup.add(soma, nucleus, axon, impulse);
  }

  update(_deltaTime: number, elapsedTime: number): void {
    if (!this.impulseMesh || !this.params.stimulusActive) return;
    const t = (elapsedTime * 0.42 * this.params.impulseSpeed + this.animProgress) % 1.0;
    const segs = this.impulsePath.length - 1;
    const scaled = t * segs;
    const idx = Math.min(segs - 1, Math.floor(scaled));
    this.impulseMesh.position.lerpVectors(this.impulsePath[idx], this.impulsePath[idx + 1], scaled - idx);
  }

  getResults(): SimulationResult {
    return {
      metrics: {
        "Signal State": this.params.stimulusActive ? "Firing Electrical Impulse" : "Resting Potential",
        "Signal Speed": `${this.params.impulseSpeed}×`,
        "Direction": "Dendrite → Cyton → Axon → Synapse",
        "Synaptic Transmission": "Chemical (Neurotransmitters)",
      },
      summary: "Dendrites receive stimulus → Electrical impulse travels along Axon → Chemical signal crosses Synapse.",
      observations: [
        "Information is acquired at the dendritic tip, creating an electrical impulse that travels through the cell body and axon.",
        "At the synapse (neuromuscular/inter-neuronal gap), electrical signals convert into chemical neurotransmitters.",
      ],
    };
  }

  reset(): void {
    this.params = { ...this.initialParams };
    if (this.impulseMesh) this.impulseMesh.visible = this.params.stimulusActive;
  }

  dispose(): void {
    clearGroupWithDispose(this.dynamicGroup);
    this.impulseMesh = null;
  }
}
