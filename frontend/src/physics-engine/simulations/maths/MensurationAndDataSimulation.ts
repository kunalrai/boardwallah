import * as THREE from "three";
import type { Simulation, SimulationContext, SimulationParameters, SimulationResult } from "../interfaces/Simulation";
import { calculateCombinedSolid } from "../../calculations/maths/maths";
import { clearGroupWithDispose } from "../optics/opticsVisuals";

/**
 * Interactive 3D Simulation for:
 * 1. Surface Areas & Volumes (3D Combinations of Solids)
 * 2. Statistics (3D Grouped Frequency Histogram & Mode)
 * 3. Probability (3D Die / Sample Space Visualizer)
 */
export class MensurationAndDataSimulation implements Simulation {
  public readonly id = "maths-mensuration-data";

  private context!: SimulationContext;
  private dynamicGroup = new THREE.Group();
  private rootObj = new THREE.Group();
  private params: {
    mode: "solids" | "statistics" | "probability";
    solidShape: "cone-hemisphere" | "cylinder-cone" | "cylinder-hemispheres";
    radius: number;
    height: number;
    dieTarget: number;
    autoRotate: boolean;
  } = {
    mode: "solids",
    solidShape: "cone-hemisphere",
    radius: 3.5,
    height: 6,
    dieTarget: 4,
    autoRotate: true,
  };
  private initialParams = { ...this.params };

  initialize(context: SimulationContext, initialParams: SimulationParameters): void {
    this.context = context;
    this.dynamicGroup.name = "__MathsMensDataGroup";
    this.context.simulationGroup.add(this.dynamicGroup);
    this.applyParams(initialParams);
    this.initialParams = { ...this.params };
    this.rebuildVisuals();
  }

  private applyParams(params: SimulationParameters): void {
    if (params.mode === "solids" || params.mode === "statistics" || params.mode === "probability") {
      this.params.mode = params.mode;
    }
    if (
      params.solidShape === "cone-hemisphere" ||
      params.solidShape === "cylinder-cone" ||
      params.solidShape === "cylinder-hemispheres"
    ) {
      this.params.solidShape = params.solidShape;
    }
    if (typeof params.radius === "number") this.params.radius = Math.max(2, Math.min(6, params.radius));
    if (typeof params.height === "number") this.params.height = Math.max(3, Math.min(10, params.height));
    if (typeof params.dieTarget === "number") this.params.dieTarget = Math.max(1, Math.min(6, Math.round(params.dieTarget)));
    if (typeof params.autoRotate === "boolean") this.params.autoRotate = params.autoRotate;
  }

  setParameters(params: SimulationParameters): SimulationResult {
    this.applyParams(params);
    this.rebuildVisuals();
    return this.getResults();
  }

  private rebuildVisuals(): void {
    clearGroupWithDispose(this.dynamicGroup);
    this.rootObj = new THREE.Group();
    this.dynamicGroup.add(this.rootObj);

    if (this.params.mode === "statistics") {
      const freqs = [4, 7, 12, 9, 5];
      freqs.forEach((f, idx) => {
        const h = f * 0.25;
        const bar = new THREE.Mesh(
          new THREE.BoxGeometry(0.85, h, 0.85),
          new THREE.MeshStandardMaterial({ color: idx === 2 ? 0xea580c : 0x3b82f6, roughness: 0.4 })
        );
        bar.position.set(-2.0 + idx * 1.0, h / 2 - 1.4, 0);
        bar.name = idx === 2 ? "ModalClassBar" : `ClassInterval_${idx + 1}`;
        this.rootObj.add(bar);
      });
      return;
    }

    if (this.params.mode === "probability") {
      for (let i = 1; i <= 6; i++) {
        const isFav = i >= this.params.dieTarget;
        const cube = new THREE.Mesh(
          new THREE.BoxGeometry(0.75, 0.75, 0.75),
          new THREE.MeshStandardMaterial({ color: isFav ? 0x10b981 : 0xcbd5e1, roughness: 0.35 })
        );
        cube.position.set(-2.5 + (i - 1) * 1.0, 0, 0);
        cube.name = isFav ? "FavourableOutcome" : "SampleSpaceDie";
        this.rootObj.add(cube);
      }
      return;
    }

    // Combined 3D Mensuration Solids
    const r = this.params.radius * 0.32;
    const h = this.params.height * 0.32;
    const matTop = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.35 });
    const matBot = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.35 });

    if (this.params.solidShape === "cone-hemisphere") {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(r, h, 32), matTop);
      cone.position.y = h / 2;
      cone.name = "ConePart";
      const hemi = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), matBot);
      hemi.name = "HemispherePart";
      this.rootObj.add(cone, hemi);
    } else if (this.params.solidShape === "cylinder-cone") {
      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 32), matBot);
      cyl.name = "CylinderPart";
      const cone = new THREE.Mesh(new THREE.ConeGeometry(r, h * 0.85, 32), matTop);
      cone.position.y = h / 2 + (h * 0.85) / 2;
      cone.name = "ConePart";
      this.rootObj.add(cyl, cone);
    } else {
      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 32), matBot);
      cyl.name = "CylinderPart";
      const hTop = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), matTop);
      hTop.position.y = h / 2;
      hTop.name = "HemispherePart";
      const hBot = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), matTop);
      hBot.position.y = -h / 2;
      this.rootObj.add(cyl, hTop, hBot);
    }
  }

  update(deltaTime: number): void {
    if (this.params.autoRotate) {
      this.rootObj.rotation.y += deltaTime * 0.45;
    }
  }

  getResults(): SimulationResult {
    if (this.params.mode === "statistics") {
      return {
        metrics: {
          "Modal Class": "20–30 (Max Freq = 12)",
          "Sample Frequencies": "4, 7, 12, 9, 5 (N = 37)",
          "Empirical Relation": "3 Median = Mode + 2 Mean",
        },
        summary: "Modal Class = 20–30 (tallest orange bar) • 3 Median = Mode + 2 Mean",
        observations: ["The class interval with the highest frequency is the Modal Class."],
      };
    }

    if (this.params.mode === "probability") {
      const fav = 7 - this.params.dieTarget;
      const prob = +(fav / 6).toFixed(3);
      return {
        metrics: {
          "Event": `Die Roll ≥ ${this.params.dieTarget}`,
          "Favourable Outcomes": `${fav} out of 6`,
          "P(E)": `${fav}/6 = ${prob}`,
          "P(not E)": `${6 - fav}/6 = ${+(1 - prob).toFixed(3)}`,
        },
        summary: `P(Die ≥ ${this.params.dieTarget}) = ${fav}/6 (${prob}) • P(E) + P(Ē) = 1`,
        observations: ["0 ≤ P(E) ≤ 1 for every event; sum of all elementary probabilities equals 1."],
      };
    }

    const s = calculateCombinedSolid(this.params.solidShape, this.params.radius, this.params.height);
    return {
      metrics: {
        "Solid Combination": this.params.solidShape,
        "Radius (r)": `${s.r} cm`,
        "Height (h)": `${s.h} cm`,
        "Total Volume": `${s.volume} cm³`,
        "Exposed Surface Area": `${s.tsa} cm²`,
      },
      summary: `Volume = ${s.volume} cm³ • Exposed TSA = ${s.tsa} cm²`,
      observations: ["For combined solids, add individual volumes, but add ONLY the visible outer curved surface areas (exclude hidden bases)."],
    };
  }

  reset(): void {
    this.params = { ...this.initialParams };
    this.rebuildVisuals();
  }

  dispose(): void {
    clearGroupWithDispose(this.dynamicGroup);
  }
}
