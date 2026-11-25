import * as THREE from "three";
import type { Simulation, SimulationContext, SimulationParameters, SimulationResult } from "../interfaces/Simulation";
import { calculateCoordinateGeometry } from "../../calculations/maths/maths";
import { clearGroupWithDispose, createPointMarker, createRayLine } from "../optics/opticsVisuals";

/**
 * Interactive 3D Coordinate Geometry Simulation (Distance, Midpoint & Section Formula).
 */
export class CoordinateSimulation implements Simulation {
  public readonly id = "maths-coordinate";

  private context!: SimulationContext;
  private dynamicGroup = new THREE.Group();
  private params = { x1: -3, y1: -2, x2: 3, y2: 4, m1: 1, m2: 2 };
  private initialParams = { ...this.params };

  initialize(context: SimulationContext, initialParams: SimulationParameters): void {
    this.context = context;
    this.dynamicGroup.name = "__MathsCoordGroup";
    this.context.simulationGroup.add(this.dynamicGroup);
    this.applyParams(initialParams);
    this.initialParams = { ...this.params };
    this.rebuildVisuals();
  }

  private applyParams(params: SimulationParameters): void {
    (["x1", "y1", "x2", "y2", "m1", "m2"] as const).forEach((k) => {
      if (typeof params[k] === "number") this.params[k] = params[k] as number;
    });
  }

  setParameters(params: SimulationParameters): SimulationResult {
    this.applyParams(params);
    this.rebuildVisuals();
    return this.getResults();
  }

  private rebuildVisuals(): void {
    clearGroupWithDispose(this.dynamicGroup);
    const scale = 0.65;

    // Coordinate Axes
    this.dynamicGroup.add(createRayLine([new THREE.Vector3(-5, 0, 0), new THREE.Vector3(5, 0, 0)], 0x334155));
    this.dynamicGroup.add(createRayLine([new THREE.Vector3(0, -4.5, 0), new THREE.Vector3(0, 4.5, 0)], 0x334155));

    const calc = calculateCoordinateGeometry(this.params.x1, this.params.y1, this.params.x2, this.params.y2, this.params.m1, this.params.m2);

    const pA = new THREE.Vector3(this.params.x1 * scale, this.params.y1 * scale, 0);
    const pB = new THREE.Vector3(this.params.x2 * scale, this.params.y2 * scale, 0);
    const pSec = new THREE.Vector3(calc.secX * scale, calc.secY * scale, 0);

    const seg = createRayLine([pA, pB], 0x2563eb);
    seg.name = "LineSegmentAB";
    this.dynamicGroup.add(seg);

    // Right-triangle legs illustrating Distance Formula √((x2-x1)² + (y2-y1)²)
    const corner = new THREE.Vector3(pB.x, pA.y, 0);
    this.dynamicGroup.add(createRayLine([pA, corner, pB], 0x94a3b8, true));

    const mA = createPointMarker("PointA", pA.x, 0x10b981, 0.14);
    mA.position.y = pA.y;
    const mB = createPointMarker("PointB", pB.x, 0xef4444, 0.14);
    mB.position.y = pB.y;
    const mS = createPointMarker("SectionPointP", pSec.x, 0xf59e0b, 0.15);
    mS.position.y = pSec.y;

    this.dynamicGroup.add(mA, mB, mS);
  }

  update(): void {}

  getResults(): SimulationResult {
    const c = calculateCoordinateGeometry(this.params.x1, this.params.y1, this.params.x2, this.params.y2, this.params.m1, this.params.m2);
    return {
      metrics: {
        "Point A": `(${this.params.x1}, ${this.params.y1})`,
        "Point B": `(${this.params.x2}, ${this.params.y2})`,
        "Distance AB": `${c.distance} units`,
        "Midpoint M": `(${c.midX}, ${c.midY})`,
        [`Section P (${this.params.m1}:${this.params.m2})`]: `(${c.secX}, ${c.secY})`,
      },
      summary: `Distance AB = ${c.distance} units • Midpoint (${c.midX}, ${c.midY}) • Section P (${c.secX}, ${c.secY})`,
      observations: [
        "Distance Formula AB = √[(x₂ - x₁)² + (y₂ - y₁)²] is derived directly from Pythagoras Theorem.",
        "Section Formula splits segment AB internally in ratio m₁ : m₂.",
      ],
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
