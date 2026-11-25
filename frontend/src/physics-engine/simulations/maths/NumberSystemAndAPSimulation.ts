import * as THREE from "three";
import type { Simulation, SimulationContext, SimulationParameters, SimulationResult } from "../interfaces/Simulation";
import { calculateArithmeticProgression, calculateHcfLcm } from "../../calculations/maths/maths";
import { clearGroupWithDispose } from "../optics/opticsVisuals";

/**
 * Interactive 3D Simulation for Real Numbers (HCF/LCM & Spiral of Theodorus √n)
 * and Arithmetic Progressions (3D Staircase Terms & Sum).
 */
export class NumberSystemAndAPSimulation implements Simulation {
  public readonly id = "maths-number-ap";

  private context!: SimulationContext;
  private dynamicGroup = new THREE.Group();
  private params: { mode: "real-numbers" | "ap"; a: number; d: number; n: number; numA: number; numB: number } = {
    mode: "ap",
    a: 2,
    d: 2,
    n: 6,
    numA: 12,
    numB: 18,
  };
  private initialParams = { ...this.params };

  initialize(context: SimulationContext, initialParams: SimulationParameters): void {
    this.context = context;
    this.dynamicGroup.name = "__MathsNumberApGroup";
    this.context.simulationGroup.add(this.dynamicGroup);
    this.applyParams(initialParams);
    this.initialParams = { ...this.params };
    this.rebuildVisuals();
  }

  private applyParams(params: SimulationParameters): void {
    if (params.mode === "real-numbers" || params.mode === "ap") this.params.mode = params.mode;
    if (typeof params.a === "number") this.params.a = params.a;
    if (typeof params.d === "number") this.params.d = params.d;
    if (typeof params.n === "number") this.params.n = params.n;
    if (typeof params.numA === "number") this.params.numA = params.numA;
    if (typeof params.numB === "number") this.params.numB = params.numB;
  }

  setParameters(params: SimulationParameters): SimulationResult {
    this.applyParams(params);
    this.rebuildVisuals();
    return this.getResults();
  }

  private rebuildVisuals(): void {
    clearGroupWithDispose(this.dynamicGroup);

    if (this.params.mode === "real-numbers") {
      // Spiral of Theodorus (√1, √2, √3, ..., √n) showing irrational lengths geometrically
      const steps = Math.max(2, Math.min(10, Math.round(this.params.n)));
      let angle = 0;
      for (let k = 1; k <= steps; k++) {
        const hyp = Math.sqrt(k + 1);
        const leg = Math.sqrt(k);
        const triShape = new THREE.Shape();
        triShape.moveTo(0, 0);
        triShape.lineTo(leg * 0.85, 0);
        triShape.lineTo(leg * 0.85, 0.85);
        triShape.closePath();

        const mesh = new THREE.Mesh(
          new THREE.ExtrudeGeometry(triShape, { depth: 0.14, bevelEnabled: false }),
          new THREE.MeshStandardMaterial({
            color: k % 2 === 0 ? 0x3b82f6 : 0x10b981,
            roughness: 0.4,
            transparent: true,
            opacity: 0.85,
          })
        );
        mesh.rotation.z = angle;
        mesh.position.z = -k * 0.03;
        mesh.name = `RootTriangle_${k + 1}`;
        this.dynamicGroup.add(mesh);

        angle += Math.atan2(1, leg);
        void hyp;
      }
      return;
    }

    // Arithmetic Progression 3D Bar Staircase
    const ap = calculateArithmeticProgression(this.params.a, this.params.d, this.params.n);
    const maxAbs = Math.max(1, ...ap.terms.map((t) => Math.abs(t)));
    const scaleY = 3.2 / maxAbs;
    const startX = -((ap.terms.length - 1) * 0.85) / 2;

    ap.terms.forEach((val, idx) => {
      const h = Math.max(0.18, Math.abs(val) * scaleY);
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(0.62, h, 0.62),
        new THREE.MeshStandardMaterial({
          color: val >= 0 ? 0x2563eb : 0xef4444,
          roughness: 0.35,
        })
      );
      bar.position.set(startX + idx * 0.85, (val >= 0 ? 1 : -1) * (h / 2) - 0.8, 0);
      bar.name = `AP_Term_${idx + 1}`;
      this.dynamicGroup.add(bar);
    });
  }

  update(): void {}

  getResults(): SimulationResult {
    if (this.params.mode === "real-numbers") {
      const res = calculateHcfLcm(this.params.numA, this.params.numB);
      return {
        metrics: {
          "Number a": res.a,
          "Number b": res.b,
          "HCF(a, b)": res.hcf,
          "LCM(a, b)": res.lcm,
          "HCF × LCM": res.product,
          "Irrational Spiral": `√2 to √${Math.round(this.params.n) + 1}`,
        },
        summary: `HCF(${res.a}, ${res.b}) = ${res.hcf}, LCM = ${res.lcm} • HCF × LCM = ${res.product}`,
        observations: [
          "Fundamental Theorem of Arithmetic: Every composite number factors uniquely into primes.",
          "Spiral of Theodorus geometrically constructs irrational lengths √2, √3, √5, ... using right triangles.",
        ],
      };
    }

    const ap = calculateArithmeticProgression(this.params.a, this.params.d, this.params.n);
    return {
      metrics: {
        "First Term (a)": ap.a,
        "Common Diff (d)": ap.d,
        "Terms (n)": ap.n,
        "n-th Term (aₙ)": ap.nthTerm,
        "Sum (Sₙ)": ap.sumN,
        "Sequence": ap.terms.slice(0, 5).join(", ") + (ap.terms.length > 5 ? "..." : ""),
      },
      summary: `aₙ = ${ap.nthTerm} • Sₙ = ${ap.sumN} • Sequence: ${ap.terms.join(", ")}`,
      observations: [
        "Each step rises (or falls) by constant common difference d.",
        "Formula: aₙ = a + (n - 1)d and Sₙ = (n/2)[2a + (n - 1)d].",
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
