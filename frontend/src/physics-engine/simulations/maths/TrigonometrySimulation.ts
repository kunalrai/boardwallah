import * as THREE from "three";
import type { Simulation, SimulationContext, SimulationParameters, SimulationResult } from "../interfaces/Simulation";
import { calculateTrigonometry } from "../../calculations/maths/maths";
import { clearGroupWithDispose, createPointMarker, createRayLine } from "../optics/opticsVisuals";

/**
 * Interactive 3D Trigonometry & Heights/Distances Simulation.
 */
export class TrigonometrySimulation implements Simulation {
  public readonly id = "maths-trigonometry";

  private context!: SimulationContext;
  private dynamicGroup = new THREE.Group();
  private params: { mode: "ratios" | "heights"; angleDeg: number; baseDistanceM: number } = {
    mode: "ratios",
    angleDeg: 45,
    baseDistanceM: 20,
  };
  private initialParams = { ...this.params };

  initialize(context: SimulationContext, initialParams: SimulationParameters): void {
    this.context = context;
    this.dynamicGroup.name = "__MathsTrigGroup";
    this.context.simulationGroup.add(this.dynamicGroup);
    this.applyParams(initialParams);
    this.initialParams = { ...this.params };
    this.rebuildVisuals();
  }

  private applyParams(params: SimulationParameters): void {
    if (params.mode === "ratios" || params.mode === "heights") this.params.mode = params.mode;
    if (typeof params.angleDeg === "number") this.params.angleDeg = Math.max(15, Math.min(75, params.angleDeg));
    if (typeof params.baseDistanceM === "number") this.params.baseDistanceM = Math.max(5, Math.min(50, params.baseDistanceM));
  }

  setParameters(params: SimulationParameters): SimulationResult {
    this.applyParams(params);
    this.rebuildVisuals();
    return this.getResults();
  }

  private rebuildVisuals(): void {
    clearGroupWithDispose(this.dynamicGroup);

    const rad = (this.params.angleDeg * Math.PI) / 180;
    const baseLen = 4.5;
    const height = Math.min(5.2, baseLen * Math.tan(rad));

    const O = new THREE.Vector3(-2.2, -1.8, 0);
    const B = new THREE.Vector3(-2.2 + baseLen, -1.8, 0);
    const T = new THREE.Vector3(-2.2 + baseLen, -1.8 + height, 0);

    // Base & Perpendicular & Hypotenuse
    const baseLine = createRayLine([O, B], 0x10b981);
    baseLine.name = "BaseAdjacent";
    const perpLine = createRayLine([B, T], 0x2563eb);
    perpLine.name = this.params.mode === "heights" ? "TowerHeight" : "Perpendicular";
    const hypLine = createRayLine([O, T], 0xef4444);
    hypLine.name = this.params.mode === "heights" ? "LineOfSight" : "Hypotenuse";

    this.dynamicGroup.add(baseLine, perpLine, hypLine);

    if (this.params.mode === "heights") {
      // 3D Tower column on the right
      const tower = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, height, 0.65),
        new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.45 })
      );
      tower.position.set(B.x + 0.35, B.y + height / 2, 0);
      tower.name = "TowerHeight";
      this.dynamicGroup.add(tower);

      const obs = createPointMarker("Observer", O.x, 0xea580c, 0.16);
      obs.position.y = O.y;
      this.dynamicGroup.add(obs);
    } else {
      // Filled right triangle prism
      const shape = new THREE.Shape();
      shape.moveTo(O.x, O.y);
      shape.lineTo(B.x, B.y);
      shape.lineTo(T.x, T.y);
      shape.closePath();
      const mesh = new THREE.Mesh(
        new THREE.ExtrudeGeometry(shape, { depth: 0.15, bevelEnabled: false }),
        new THREE.MeshStandardMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.45 })
      );
      this.dynamicGroup.add(mesh);
    }
  }

  update(): void {}

  getResults(): SimulationResult {
    const t = calculateTrigonometry(this.params.angleDeg, this.params.baseDistanceM);
    if (this.params.mode === "heights") {
      return {
        metrics: {
          "Angle of Elevation (θ)": `${t.deg}°`,
          "Distance from Tower (d)": `${t.baseDistanceM} m`,
          "Tower Height (h = d tan θ)": `${t.towerHeight} m`,
          "Line of Sight": `${t.lineOfSight} m`,
          "tan θ": t.tanVal,
        },
        summary: `Tower Height h = ${t.baseDistanceM} × tan(${t.deg}°) = ${t.towerHeight} m`,
        observations: ["Angle of elevation is measured upward from the horizontal eye-level line of sight."],
      };
    }

    return {
      metrics: {
        "Angle (θ)": `${t.deg}°`,
        "sin θ (P/H)": t.sinVal,
        "cos θ (B/H)": t.cosVal,
        "tan θ (P/B)": t.tanVal,
        "sin²θ + cos²θ": t.identitySum,
      },
      summary: `θ = ${t.deg}° • sin θ = ${t.sinVal}, cos θ = ${t.cosVal}, tan θ = ${t.tanVal} • sin²θ+cos²θ = ${t.identitySum}`,
      observations: ["Fundamental Identity: sin²θ + cos²θ = 1 holds true for every angle θ."],
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
