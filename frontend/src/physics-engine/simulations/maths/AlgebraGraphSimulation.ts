import * as THREE from "three";
import type { Simulation, SimulationContext, SimulationParameters, SimulationResult } from "../interfaces/Simulation";
import { calculateLinearPair, calculateQuadratic } from "../../calculations/maths/maths";
import { clearGroupWithDispose, createPointMarker, createRayLine } from "../optics/opticsVisuals";

/**
 * Interactive 3D Algebra Graph Simulation for Polynomials,
 * Quadratic Equations (Discriminant & Roots), and Pair of Linear Equations.
 */
export class AlgebraGraphSimulation implements Simulation {
  public readonly id = "maths-algebra";

  private context!: SimulationContext;
  private dynamicGroup = new THREE.Group();
  private params = {
    mode: "quadratic" as "quadratic" | "linear-pair",
    a: 1,
    b: -3,
    c: -4,
    a1: 1,
    b1: 1,
    c1: 5,
    a2: 2,
    b2: -1,
    c2: 4,
  };
  private initialParams = { ...this.params };

  initialize(context: SimulationContext, initialParams: SimulationParameters): void {
    this.context = context;
    this.dynamicGroup.name = "__MathsAlgebraGroup";
    this.context.simulationGroup.add(this.dynamicGroup);
    this.applyParams(initialParams);
    this.initialParams = { ...this.params };
    this.rebuildVisuals();
  }

  private applyParams(params: SimulationParameters): void {
    if (params.mode === "quadratic" || params.mode === "linear-pair") this.params.mode = params.mode;
    (["a", "b", "c", "a1", "b1", "c1", "a2", "b2", "c2"] as const).forEach((k) => {
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

    // Axes X and Y
    this.dynamicGroup.add(createRayLine([new THREE.Vector3(-6, 0, 0), new THREE.Vector3(6, 0, 0)], 0x334155));
    this.dynamicGroup.add(createRayLine([new THREE.Vector3(0, -5, 0), new THREE.Vector3(0, 5, 0)], 0x334155));

    const scale = 0.55;
    if (this.params.mode === "linear-pair") {
      const drawLine = (a: number, b: number, c: number, color: number, name: string) => {
        const pts: THREE.Vector3[] = [];
        for (let x = -7; x <= 7; x += 1) {
          const y = Math.abs(b) > 0.05 ? (c - a * x) / b : x * 2;
          if (Math.abs(y) <= 8) pts.push(new THREE.Vector3(x * scale, y * scale, 0));
        }
        if (pts.length >= 2) {
          const line = createRayLine(pts, color);
          line.name = name;
          this.dynamicGroup.add(line);
        }
      };

      drawLine(this.params.a1, this.params.b1, this.params.c1, 0x2563eb, "Line_1");
      drawLine(this.params.a2, this.params.b2, this.params.c2, 0xea580c, "Line_2");

      const sol = calculateLinearPair(this.params.a1, this.params.b1, this.params.c1, this.params.a2, this.params.b2, this.params.c2);
      if (sol.x !== null && sol.y !== null) {
        const pt = createPointMarker("IntersectionPoint", sol.x * scale, 0x10b981, 0.14);
        pt.position.y = sol.y * scale;
        this.dynamicGroup.add(pt);
      }
      return;
    }

    // Quadratic Parabola y = ax^2 + bx + c
    const q = calculateQuadratic(this.params.a, this.params.b, this.params.c);
    const pts: THREE.Vector3[] = [];
    for (let x = -6; x <= 6; x += 0.25) {
      const y = q.a * x * x + q.b * x + q.c;
      if (Math.abs(y) <= 9) {
        pts.push(new THREE.Vector3(x * scale, y * scale, 0));
      }
    }
    if (pts.length >= 2) {
      const curve = new THREE.CatmullRomCurve3(pts);
      const mesh = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 48, 0.055, 8, false),
        new THREE.MeshStandardMaterial({ color: 0x2563eb })
      );
      mesh.name = "ParabolaCurve";
      this.dynamicGroup.add(mesh);
    }

    // Vertex marker
    const vMarker = createPointMarker("ParabolaVertex", q.vertexX * scale, 0x7c3aed, 0.13);
    vMarker.position.y = Math.max(-4.5, Math.min(4.5, q.vertexY * scale));
    this.dynamicGroup.add(vMarker);

    // Real roots on X-axis
    if (q.discriminant >= 0) {
      const r1 = (-q.b + Math.sqrt(q.discriminant)) / (2 * q.a);
      const r2 = (-q.b - Math.sqrt(q.discriminant)) / (2 * q.a);
      this.dynamicGroup.add(createPointMarker("ZerosOnXAxis", r1 * scale, 0xef4444, 0.14));
      if (q.discriminant > 0.01) {
        this.dynamicGroup.add(createPointMarker("ZerosOnXAxis", r2 * scale, 0xef4444, 0.14));
      }
    }
  }

  update(): void {}

  getResults(): SimulationResult {
    if (this.params.mode === "linear-pair") {
      const sol = calculateLinearPair(this.params.a1, this.params.b1, this.params.c1, this.params.a2, this.params.b2, this.params.c2);
      return {
        metrics: {
          "Equation 1": `${this.params.a1}x + ${this.params.b1}y = ${this.params.c1}`,
          "Equation 2": `${this.params.a2}x + ${this.params.b2}y = ${this.params.c2}`,
          "Graphical Nature": sol.status,
          "Solution (x, y)": sol.x !== null ? `(${sol.x}, ${sol.y})` : "None / Infinite",
        },
        summary: `${sol.status}${sol.x !== null ? ` at (${sol.x}, ${sol.y})` : ""}`,
        observations: [
          "Unique solution when a₁/a₂ ≠ b₁/b₂ (Intersecting lines).",
          "No solution when a₁/a₂ = b₁/b₂ ≠ c₁/c₂ (Parallel lines).",
        ],
      };
    }

    const q = calculateQuadratic(this.params.a, this.params.b, this.params.c);
    return {
      metrics: {
        "Equation": `${q.a}x² + (${q.b})x + (${q.c}) = 0`,
        "Discriminant (D)": q.discriminant,
        "Nature of Roots": q.nature,
        "Zeros / Roots": q.rootsText,
        "Sum (α + β)": q.sumOfRoots,
        "Product (α · β)": q.productOfRoots,
      },
      summary: `${q.nature} (${q.rootsText}) • D = ${q.discriminant}`,
      observations: [
        "Zeros of a polynomial are the x-coordinates where the parabola intersects the X-axis.",
        "D > 0 gives 2 distinct real roots, D = 0 gives 2 equal real roots, D < 0 gives no real roots.",
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
