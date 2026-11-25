import * as THREE from "three";
import type {
  Simulation,
  SimulationContext,
  SimulationParameters,
  SimulationResult,
} from "../interfaces/Simulation";
import {
  calculateCardiacMetrics,
  type CardiacCalculationResult,
} from "../../calculations/biology/biology";
import { clearGroupWithDispose } from "../optics/opticsVisuals";

/**
 * Interactive 3D Human Heart & Double Circulation Simulation (Life Processes).
 * Renders all 4 chambers, septum, major vessels, beating contraction,
 * and dual-colour oxygenated (red) / deoxygenated (blue) blood pulses.
 */
export class HeartCirculationSimulation implements Simulation {
  public readonly id = "biology-heart";

  private context!: SimulationContext;
  private dynamicGroup = new THREE.Group();
  private heartRoot = new THREE.Group();
  private bloodPulses: { path: THREE.Vector3[]; mesh: THREE.Mesh; offset: number }[] = [];
  private params = { bpm: 72, showBloodFlow: true };
  private initialParams = { ...this.params };
  private calcResult!: CardiacCalculationResult;
  private animProgress = 0;

  initialize(context: SimulationContext, initialParams: SimulationParameters): void {
    this.context = context;
    this.dynamicGroup.name = "__BioHeartGroup";
    this.context.simulationGroup.add(this.dynamicGroup);
    if (typeof initialParams.bpm === "number") this.params.bpm = initialParams.bpm;
    if (typeof initialParams.showBloodFlow === "boolean") this.params.showBloodFlow = initialParams.showBloodFlow;
    this.initialParams = { ...this.params };
    this.rebuildVisuals();
  }

  setParameters(params: SimulationParameters): SimulationResult {
    let rebuild = false;
    if (typeof params.bpm === "number") {
      this.params.bpm = Math.max(45, Math.min(160, params.bpm));
      this.calcResult = calculateCardiacMetrics(this.params.bpm);
    }
    if (typeof params.showBloodFlow === "boolean") {
      this.params.showBloodFlow = params.showBloodFlow;
      rebuild = true;
    }
    if (typeof params.__animationProgress === "number") {
      this.animProgress = params.__animationProgress;
    }
    if (rebuild) this.rebuildVisuals();
    return this.getResults();
  }

  private rebuildVisuals(): void {
    clearGroupWithDispose(this.dynamicGroup);
    this.bloodPulses = [];
    this.heartRoot = new THREE.Group();
    this.dynamicGroup.add(this.heartRoot);

    this.calcResult = calculateCardiacMetrics(this.params.bpm);

    // Deoxygenated Right Side (viewer's left: -X), Oxygenated Left Side (viewer's right: +X)
    const blueMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.4 });
    const redMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });

    const ra = new THREE.Mesh(new THREE.SphereGeometry(0.68, 22, 22), blueMat);
    ra.position.set(-0.9, 0.85, 0);
    ra.name = "RightAtrium";

    const rv = new THREE.Mesh(new THREE.ConeGeometry(0.75, 1.55, 22), blueMat);
    rv.rotation.z = Math.PI;
    rv.position.set(-0.72, -0.55, 0);
    rv.name = "RightVentricle";

    const la = new THREE.Mesh(new THREE.SphereGeometry(0.68, 22, 22), redMat);
    la.position.set(0.9, 0.85, 0);
    la.name = "LeftAtrium";

    const lv = new THREE.Mesh(new THREE.ConeGeometry(0.84, 1.75, 22), redMat);
    lv.rotation.z = Math.PI;
    lv.position.set(0.72, -0.62, 0);
    lv.name = "LeftVentricle";

    // Septum dividing left & right
    const septum = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 2.5, 1.1),
      new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.5 })
    );
    septum.position.set(0, 0.05, 0);
    septum.name = "Septum";

    // Major Vessels: Vena Cava, Pulmonary Artery, Pulmonary Vein, Aorta
    const venaCava = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 1.5, 16),
      new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.4 })
    );
    venaCava.position.set(-1.35, 1.7, 0);
    venaCava.name = "VenaCava";

    const aorta = new THREE.Mesh(
      new THREE.TorusGeometry(0.72, 0.22, 14, 28, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.35 })
    );
    aorta.position.set(0.35, 1.65, 0);
    aorta.name = "Aorta";

    const pulArtery = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 1.3, 14),
      new THREE.MeshStandardMaterial({ color: 0x60a5fa, roughness: 0.4 })
    );
    pulArtery.rotation.z = 0.55;
    pulArtery.position.set(-0.6, 1.75, 0.35);
    pulArtery.name = "PulmonaryArtery";

    const pulVein = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 1.1, 14),
      new THREE.MeshStandardMaterial({ color: 0xf87171, roughness: 0.4 })
    );
    pulVein.rotation.z = Math.PI / 2;
    pulVein.position.set(1.75, 0.9, 0);
    pulVein.name = "PulmonaryVein";

    this.heartRoot.add(ra, rv, la, lv, septum, venaCava, aorta, pulArtery, pulVein);

    if (this.params.showBloodFlow) {
      const bluePath = [
        new THREE.Vector3(-1.35, 2.3, 0.4),
        new THREE.Vector3(-0.9, 0.85, 0.55),
        new THREE.Vector3(-0.72, -0.55, 0.55),
        new THREE.Vector3(-0.6, 2.1, 0.5),
      ];
      const redPath = [
        new THREE.Vector3(2.2, 0.9, 0.4),
        new THREE.Vector3(0.9, 0.85, 0.55),
        new THREE.Vector3(0.72, -0.62, 0.55),
        new THREE.Vector3(0.35, 2.3, 0.4),
      ];

      [
        { path: bluePath, color: 0x38bdf8 },
        { path: redPath, color: 0xfef08a },
      ].forEach(({ path, color }) => {
        for (let i = 0; i < 3; i++) {
          const pulse = new THREE.Mesh(
            new THREE.SphereGeometry(0.13, 12, 12),
            new THREE.MeshBasicMaterial({ color })
          );
          this.heartRoot.add(pulse);
          this.bloodPulses.push({ path, mesh: pulse, offset: i / 3 });
        }
      });
    }
  }

  update(_deltaTime: number, elapsedTime: number): void {
    const beatsPerSec = this.params.bpm / 60;
    const beatPhase = (elapsedTime * beatsPerSec + this.animProgress) % 1.0;
    const scale = 1.0 + 0.055 * Math.pow(Math.sin(beatPhase * Math.PI), 4);
    this.heartRoot.scale.setScalar(scale);

    for (const bp of this.bloodPulses) {
      const t = (elapsedTime * 0.45 * (this.params.bpm / 72) + bp.offset + this.animProgress) % 1.0;
      const segs = bp.path.length - 1;
      const scaled = t * segs;
      const idx = Math.min(segs - 1, Math.floor(scaled));
      bp.mesh.position.lerpVectors(bp.path[idx], bp.path[idx + 1], scaled - idx);
    }
  }

  getResults(): SimulationResult {
    const r = this.calcResult;
    return {
      metrics: {
        "Heart Rate": `${r.bpm} BPM`,
        "Cardiac Output": `${r.cardiacOutputLMin} L/min`,
        "Cycle Duration": `${r.cycleDurationSec} s`,
        "Right Side Blood": "Deoxygenated (Blue)",
        "Left Side Blood": "Oxygenated (Red)",
        "Circulation": "Double Circulation",
      },
      summary: `${r.bpm} BPM • Output: ${r.cardiacOutputLMin} L/min • ${r.bloodPathway}`,
      observations: [
        "Right Atrium & Ventricle pump deoxygenated blood to the lungs (Pulmonary Circulation).",
        "Left Atrium & Ventricle pump oxygenated blood via the Aorta to the entire body (Systemic Circulation).",
        "Left Ventricle has the thickest muscular wall because it pumps blood to all body organs at high pressure.",
      ],
    };
  }

  reset(): void {
    this.params = { ...this.initialParams };
    this.rebuildVisuals();
  }

  dispose(): void {
    clearGroupWithDispose(this.dynamicGroup);
    this.bloodPulses = [];
  }
}
