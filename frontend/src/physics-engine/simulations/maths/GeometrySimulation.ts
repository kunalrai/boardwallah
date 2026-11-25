import * as THREE from "three";
import type { Simulation, SimulationContext, SimulationParameters, SimulationResult } from "../interfaces/Simulation";
import { calculateCircleSector } from "../../calculations/maths/maths";
import { clearGroupWithDispose, createPointMarker, createRayLine } from "../optics/opticsVisuals";

/**
 * Interactive 3D Geometry Simulation for:
 * 1. Triangles (Basic Proportionality Theorem / Thales Theorem)
 * 2. Circles (Theorem 10.1 & 10.2: Equal Tangents from External Point P)
 * 3. Areas Related to Circles (Sector & Minor Segment)
 */
export class GeometrySimulation implements Simulation {
  public readonly id = "maths-geometry";

  private context!: SimulationContext;
  private dynamicGroup = new THREE.Group();
  private params: {
    mode: "bpt" | "circles" | "sector";
    splitRatio: number;
    externalDist: number;
    radius: number;
    angleDeg: number;
  } = {
    mode: "bpt",
    splitRatio: 0.5,
    externalDist: 5.0,
    radius: 6,
    angleDeg: 90,
  };
  private initialParams = { ...this.params };

  initialize(context: SimulationContext, initialParams: SimulationParameters): void {
    this.context = context;
    this.dynamicGroup.name = "__MathsGeometryGroup";
    this.context.simulationGroup.add(this.dynamicGroup);
    this.applyParams(initialParams);
    this.initialParams = { ...this.params };
    this.rebuildVisuals();
  }

  private applyParams(params: SimulationParameters): void {
    if (params.mode === "bpt" || params.mode === "circles" || params.mode === "sector") this.params.mode = params.mode;
    if (typeof params.splitRatio === "number") this.params.splitRatio = Math.max(0.2, Math.min(0.85, params.splitRatio));
    if (typeof params.externalDist === "number") this.params.externalDist = Math.max(3.0, Math.min(7.0, params.externalDist));
    if (typeof params.radius === "number") this.params.radius = Math.max(3, Math.min(12, params.radius));
    if (typeof params.angleDeg === "number") this.params.angleDeg = Math.max(20, Math.min(300, params.angleDeg));
  }

  setParameters(params: SimulationParameters): SimulationResult {
    this.applyParams(params);
    this.rebuildVisuals();
    return this.getResults();
  }

  private rebuildVisuals(): void {
    clearGroupWithDispose(this.dynamicGroup);

    if (this.params.mode === "bpt") {
      const A = new THREE.Vector3(0, 2.6, 0);
      const B = new THREE.Vector3(-2.6, -2.0, 0);
      const C = new THREE.Vector3(2.8, -2.0, 0);

      const D = new THREE.Vector3().lerpVectors(A, B, this.params.splitRatio);
      const E = new THREE.Vector3().lerpVectors(A, C, this.params.splitRatio);

      const tri = createRayLine([A, B, C, A], 0x2563eb);
      tri.name = "TriangleABC";
      const parallelLine = createRayLine([D, E], 0xea580c);
      parallelLine.name = "ParallelLineDE";

      this.dynamicGroup.add(tri, parallelLine);
      this.dynamicGroup.add(createPointMarker("VertexA", A.x, 0x0f172a, 0.11));
      const pD = createPointMarker("PointD", D.x, 0xea580c, 0.12);
      pD.position.y = D.y;
      const pE = createPointMarker("PointE", E.x, 0xea580c, 0.12);
      pE.position.y = E.y;
      this.dynamicGroup.add(pD, pE);
      return;
    }

    if (this.params.mode === "circles") {
      const R = 1.8;
      const center = new THREE.Vector3(1.2, 0, 0);
      const P = new THREE.Vector3(1.2 - this.params.externalDist, 0, 0);

      const circleMesh = new THREE.Mesh(
        new THREE.TorusGeometry(R, 0.055, 12, 64),
        new THREE.MeshBasicMaterial({ color: 0x2563eb })
      );
      circleMesh.position.copy(center);
      circleMesh.name = "CircleBody";
      this.dynamicGroup.add(circleMesh);

      const distOP = this.params.externalDist;
      const cosAlpha = R / distOP;
      const sinAlpha = Math.sqrt(Math.max(0, 1 - cosAlpha * cosAlpha));

      const A = new THREE.Vector3(center.x - R * cosAlpha, R * sinAlpha, 0);
      const B = new THREE.Vector3(center.x - R * cosAlpha, -R * sinAlpha, 0);

      const t1 = createRayLine([P, A], 0xef4444);
      t1.name = "TangentPA";
      const t2 = createRayLine([P, B], 0xef4444);
      t2.name = "TangentPB";
      const rad1 = createRayLine([center, A], 0x10b981, true);
      rad1.name = "RadiusOA";
      const rad2 = createRayLine([center, B], 0x10b981, true);

      this.dynamicGroup.add(t1, t2, rad1, rad2, createRayLine([P, center], 0x64748b, true));
      this.dynamicGroup.add(createPointMarker("ExternalPointP", P.x, 0xef4444, 0.13));
      this.dynamicGroup.add(createPointMarker("CentreO", center.x, 0x2563eb, 0.12));
      return;
    }

    // Sector & Segment
    const rUnits = this.params.radius * 0.25;
    const rad = (this.params.angleDeg * Math.PI) / 180;

    const fullCircle = new THREE.Mesh(
      new THREE.TorusGeometry(rUnits, 0.04, 10, 64),
      new THREE.MeshBasicMaterial({ color: 0x94a3b8 })
    );
    fullCircle.name = "CircleBoundary";

    const sectorGeo = new THREE.CircleGeometry(rUnits, 40, 0, rad);
    const sectorMesh = new THREE.Mesh(
      sectorGeo,
      new THREE.MeshStandardMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.65, side: THREE.DoubleSide })
    );
    sectorMesh.name = "SectorArea";

    const chord = createRayLine(
      [new THREE.Vector3(rUnits, 0, 0.03), new THREE.Vector3(rUnits * Math.cos(rad), rUnits * Math.sin(rad), 0.03)],
      0xea580c
    );
    chord.name = "ChordAB";

    this.dynamicGroup.add(fullCircle, sectorMesh, chord);
  }

  update(): void {}

  getResults(): SimulationResult {
    if (this.params.mode === "bpt") {
      const adRatio = +(this.params.splitRatio * 10).toFixed(2);
      const dbRatio = +((1 - this.params.splitRatio) * 10).toFixed(2);
      const ratio = +(adRatio / dbRatio).toFixed(2);
      return {
        metrics: {
          "Theorem": "Basic Proportionality Theorem (Thales)",
          "Line DE": "Parallel to Base BC",
          "AD / DB": `${adRatio} / ${dbRatio} = ${ratio}`,
          "AE / EC": `${adRatio} / ${dbRatio} = ${ratio}`,
          "Similarity": "△ADE ~ △ABC (AA Criterion)",
        },
        summary: `Since DE ∥ BC, AD/DB = AE/EC = ${ratio} (Theorem 6.1)`,
        observations: ["Moving DE up or down keeps AD/DB strictly equal to AE/EC."],
      };
    }

    if (this.params.mode === "circles") {
      const op = this.params.externalDist;
      const r = 1.8;
      const tangentLen = +Math.sqrt(op * op - r * r).toFixed(2);
      return {
        metrics: {
          "Radius (r)": `${r} units`,
          "Distance OP": `${op} units`,
          "Tangent PA": `${tangentLen} units`,
          "Tangent PB": `${tangentLen} units`,
          "Angle ∠OAP": "90° (Theorem 10.1)",
        },
        summary: `PA = PB = ${tangentLen} units (Theorem 10.2) • OA ⊥ PA (90°)`,
        observations: ["Tangents drawn from an external point P to a circle are always equal in length (PA = PB)."],
      };
    }

    const s = calculateCircleSector(this.params.radius, this.params.angleDeg);
    return {
      metrics: {
        "Radius (r)": `${s.r} cm`,
        "Central Angle (θ)": `${s.theta}°`,
        "Arc Length (l)": `${s.arcLength} cm`,
        "Sector Area": `${s.sectorArea} cm²`,
        "Minor Segment Area": `${s.minorSegmentArea} cm²`,
      },
      summary: `Sector Area = ${s.sectorArea} cm² • Arc Length = ${s.arcLength} cm`,
      observations: ["Sector Area = (θ/360°) × πr² | Minor Segment = Sector Area - Area of △OAB."],
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
