import * as THREE from "three";
import type {
  Simulation,
  SimulationContext,
  SimulationParameters,
  SimulationResult,
} from "../interfaces/Simulation";
import {
  calculatePhProperties,
  type PhCalculationResult,
} from "../../calculations/chemistry/chemistry";
import { clearGroupWithDispose } from "../optics/opticsVisuals";

/**
 * Interactive 3D pH Scale, Universal Indicator & H+/OH- Ion Concentration Lab.
 */
export class PhLabSimulation implements Simulation {
  public readonly id = "chemistry-ph";

  private context!: SimulationContext;
  private dynamicGroup = new THREE.Group();
  private params = { pH: 7.0 };
  private initialParams = { ...this.params };
  private calcResult!: PhCalculationResult;
  private ions: { mesh: THREE.Mesh; basePos: THREE.Vector3; phase: number }[] = [];

  initialize(context: SimulationContext, initialParams: SimulationParameters): void {
    this.context = context;
    this.dynamicGroup.name = "__ChemPhGroup";
    this.context.simulationGroup.add(this.dynamicGroup);
    if (typeof initialParams.pH === "number") {
      this.params.pH = initialParams.pH;
    }
    this.initialParams = { ...this.params };
    this.rebuildVisuals();
  }

  setParameters(params: SimulationParameters): SimulationResult {
    if (typeof params.pH === "number") {
      this.params.pH = Math.max(0, Math.min(14, params.pH));
      this.rebuildVisuals();
    }
    return this.getResults();
  }

  private rebuildVisuals(): void {
    clearGroupWithDispose(this.dynamicGroup);
    this.ions = [];
    this.calcResult = calculatePhProperties(this.params.pH);

    // 1. Glass Beaker
    const beakerGeo = new THREE.CylinderGeometry(1.75, 1.65, 3.2, 32, 1, true);
    const beakerMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.3,
      roughness: 0.08,
      side: THREE.DoubleSide,
    });
    const beaker = new THREE.Mesh(beakerGeo, beakerMat);
    beaker.name = "GlassBeaker";
    this.dynamicGroup.add(beaker);

    // 2. Universal Indicator Solution
    const liquid = new THREE.Mesh(
      new THREE.CylinderGeometry(1.62, 1.56, 2.1, 32),
      new THREE.MeshStandardMaterial({
        color: this.calcResult.universalColorHex,
        transparent: true,
        opacity: 0.68,
        roughness: 0.25,
      })
    );
    liquid.position.set(0, -0.45, 0);
    liquid.name = "IndicatorSolution";
    this.dynamicGroup.add(liquid);

    // 3. pH Paper Strip dipped in top
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 1.8, 0.06),
      new THREE.MeshStandardMaterial({ color: this.calcResult.universalColorHex, roughness: 0.6 })
    );
    strip.position.set(0.9, 0.9, 0);
    strip.rotation.z = -0.15;
    strip.name = "PhPaperStrip";
    this.dynamicGroup.add(strip);

    // 4. H+ (Red) and OH- (Blue) Ion Spheres inside the solution
    const hGeo = new THREE.SphereGeometry(0.13, 14, 14);
    const hMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
    const ohGeo = new THREE.SphereGeometry(0.16, 14, 14);
    const ohMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.3 });

    const total = this.calcResult.hydrogenIonCount + this.calcResult.hydroxideIonCount;
    for (let i = 0; i < total; i++) {
      const isH = i < this.calcResult.hydrogenIonCount;
      const mesh = new THREE.Mesh(isH ? hGeo : ohGeo, isH ? hMat : ohMat);
      mesh.name = isH ? "HydrogenIons" : "HydroxideIons";
      const angle = (i / total) * Math.PI * 2 * 1.7;
      const radius = 0.35 + ((i * 0.27) % 1.0);
      const basePos = new THREE.Vector3(
        Math.cos(angle) * radius,
        -1.2 + ((i * 0.43) % 1.5),
        Math.sin(angle) * radius
      );
      mesh.position.copy(basePos);
      this.dynamicGroup.add(mesh);
      this.ions.push({ mesh, basePos, phase: i * 0.8 });
    }
  }

  update(_deltaTime: number, elapsedTime: number): void {
    for (const ion of this.ions) {
      ion.mesh.position.y = ion.basePos.y + Math.sin(elapsedTime * 1.8 + ion.phase) * 0.14;
      ion.mesh.position.x = ion.basePos.x + Math.cos(elapsedTime * 1.3 + ion.phase) * 0.08;
    }
  }

  getResults(): SimulationResult {
    const r = this.calcResult;
    return {
      metrics: {
        "pH Value": r.pH,
        "pOH Value": r.pOH,
        "Solution Nature": r.nature,
        "Litmus Test": r.litmusEffect,
        "Phenolphthalein": r.phenolphthaleinEffect,
        "H⁺ vs OH⁻ Ratio": `${r.hydrogenIonCount} H⁺ : ${r.hydroxideIonCount} OH⁻`,
      },
      summary: `pH ${r.pH} (${r.nature}) • ${r.litmusEffect}`,
      observations: [
        r.pH < 7
          ? `Acidic solutions have higher H⁺(aq) ion concentration than OH⁻(aq) ions.`
          : r.pH > 7
            ? `Basic (alkaline) solutions have higher OH⁻(aq) ion concentration than H⁺(aq) ions.`
            : `Neutral pure water (pH 7) has equal concentrations of H⁺ and OH⁻ ions.`,
        `Phenolphthalein indicator: ${r.phenolphthaleinEffect}.`,
      ],
    };
  }

  reset(): void {
    this.params = { ...this.initialParams };
    this.rebuildVisuals();
  }

  dispose(): void {
    clearGroupWithDispose(this.dynamicGroup);
    this.ions = [];
  }
}
