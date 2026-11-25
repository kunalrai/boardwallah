import * as THREE from "three";
import type {
  Simulation,
  SimulationContext,
  SimulationParameters,
  SimulationResult,
} from "../interfaces/Simulation";
import {
  calculateLensOptics,
  type LensCalculationResult,
  type LensType,
} from "../../calculations/optics/lens";
import {
  clearGroupWithDispose,
  createAxisArrow,
  createPhotonPulse,
  createPointMarker,
  createRayLine,
} from "./opticsVisuals";

interface AnimatedRayPath {
  points: THREE.Vector3[];
  photon: THREE.Mesh;
}

/**
 * Interactive 3D Thin Lens Simulation (Convex & Concave).
 * Supports all 6 standard CBSE Class 10 convex-lens positions and concave-lens divergence.
 */
export class LensSimulation implements Simulation {
  public readonly id = "lens";

  private context!: SimulationContext;
  private dynamicGroup = new THREE.Group();
  private params: {
    lensType: LensType;
    focalLength: number;
    objectDistance: number;
    objectHeight: number;
  } = {
    lensType: "convex",
    focalLength: 12,
    objectDistance: -30,
    objectHeight: 4,
  };

  private initialParams = { ...this.params };
  private calcResult!: LensCalculationResult;
  private animatedPaths: AnimatedRayPath[] = [];
  private animProgress = 0;

  private readonly cmToUnit = 0.12;

  initialize(context: SimulationContext, initialParams: SimulationParameters): void {
    this.context = context;
    this.dynamicGroup.name = "__LensDynamicGroup";
    this.context.simulationGroup.add(this.dynamicGroup);

    this.applyParamObject(initialParams);
    this.initialParams = { ...this.params };
    this.rebuildVisuals();
  }

  private applyParamObject(params: SimulationParameters): void {
    if (params.lensType === "convex" || params.lensType === "concave") {
      this.params.lensType = params.lensType;
    }
    if (typeof params.focalLength === "number") {
      this.params.focalLength = Math.max(5, Math.min(25, Math.abs(params.focalLength)));
    }
    if (typeof params.objectDistance === "number") {
      this.params.objectDistance = Math.min(-3, Math.max(-60, params.objectDistance));
    }
    if (typeof params.objectHeight === "number") {
      this.params.objectHeight = Math.max(1, Math.min(8, params.objectHeight));
    }
    if (typeof params.__animationProgress === "number") {
      this.animProgress = params.__animationProgress;
    }
  }

  setParameters(params: SimulationParameters): SimulationResult {
    this.applyParamObject(params);
    if (
      params.lensType !== undefined ||
      params.focalLength !== undefined ||
      params.objectDistance !== undefined ||
      params.objectHeight !== undefined
    ) {
      this.rebuildVisuals();
    }
    return this.getResults();
  }

  private rebuildVisuals(): void {
    clearGroupWithDispose(this.dynamicGroup);
    this.animatedPaths = [];

    this.calcResult = calculateLensOptics({
      lensType: this.params.lensType,
      focalLengthMagnitude: this.params.focalLength,
      objectDistance: this.params.objectDistance,
      objectHeight: this.params.objectHeight,
    });

    const s = this.cmToUnit;
    const fAbs = Math.abs(this.calcResult.f) * s;
    const twoFAbs = 2 * fAbs;
    const uX = this.calcResult.u * s;
    const hO = this.calcResult.ho * s * 1.4;

    // 1. Principal Axis
    this.dynamicGroup.add(
      createRayLine([new THREE.Vector3(-9.5, 0, 0), new THREE.Vector3(9.5, 0, 0)], 0x64748b)
    );

    // 2. 3D Lens Glass Mesh
    this.dynamicGroup.add(this.buildLensMesh(this.params.lensType));

    // 3. Optical Centre O, F1, 2F1, F2, 2F2
    this.dynamicGroup.add(createPointMarker("OpticalCentre_O", 0, 0x0f172a, 0.085));
    this.dynamicGroup.add(createPointMarker("Focus_F1", -fAbs, 0x1a73e8, 0.09));
    this.dynamicGroup.add(createPointMarker("TwoF1", -twoFAbs, 0x7c3aed, 0.09));
    this.dynamicGroup.add(createPointMarker("Focus_F2", fAbs, 0x1a73e8, 0.09));
    this.dynamicGroup.add(createPointMarker("TwoF2", twoFAbs, 0x7c3aed, 0.09));

    // 4. Object Arrow
    this.dynamicGroup.add(createAxisArrow("Object_AB", uX, hO, 0x10b981, false));

    const objTop = new THREE.Vector3(uX, hO, 0);
    const lensHit = new THREE.Vector3(0, hO, 0);
    const opticalCentre = new THREE.Vector3(0, 0, 0);

    // Ray 1: Parallel to principal axis
    this.dynamicGroup.add(createRayLine([objTop, lensHit], 0xef4444));

    if (!this.calcResult.isAtInfinity) {
      const vX = Math.max(-9.2, Math.min(9.2, this.calcResult.v * s));
      const hI = Math.max(-3.6, Math.min(3.6, this.calcResult.hi * s * 1.4));
      const imgTop = new THREE.Vector3(vX, hI, 0);

      // Image Arrow
      this.dynamicGroup.add(
        createAxisArrow(
          "Image_AB",
          vX,
          hI,
          this.calcResult.isVirtual ? 0x0284c7 : 0xea580c,
          this.calcResult.isVirtual
        )
      );

      if (this.params.lensType === "convex") {
        const f2Point = new THREE.Vector3(fAbs, 0, 0);
        const dir1 = new THREE.Vector3().subVectors(f2Point, lensHit).normalize();
        const far1 = lensHit.clone().add(dir1.multiplyScalar(8.5));
        this.dynamicGroup.add(createRayLine([lensHit, far1], 0xef4444));
        this.addAnimatedPath([objTop, lensHit, far1], 0xf59e0b);

        // Ray 2: Straight through optical centre O
        const dir2 = new THREE.Vector3().subVectors(opticalCentre, objTop).normalize();
        const far2 = opticalCentre.clone().add(dir2.multiplyScalar(8.5));
        this.dynamicGroup.add(createRayLine([objTop, far2], 0x2563eb));
        this.addAnimatedPath([objTop, opticalCentre, far2], 0x38bdf8);

        if (this.calcResult.isVirtual) {
          // Trace virtual backward extensions to imgTop on left side
          this.dynamicGroup.add(createRayLine([lensHit, imgTop], 0x38bdf8, true));
          this.dynamicGroup.add(createRayLine([opticalCentre, imgTop], 0x38bdf8, true));
        }
      } else {
        // Concave lens: Ray 1 diverges as if coming from F1 (-fAbs, 0)
        const f1Point = new THREE.Vector3(-fAbs, 0, 0);
        const dir1 = new THREE.Vector3().subVectors(lensHit, f1Point).normalize();
        const far1 = lensHit.clone().add(dir1.multiplyScalar(7.5));
        this.dynamicGroup.add(createRayLine([lensHit, far1], 0xef4444));
        this.dynamicGroup.add(createRayLine([lensHit, f1Point], 0x38bdf8, true));
        this.addAnimatedPath([objTop, lensHit, far1], 0xf59e0b);

        // Ray 2: Undeviated through optical centre O
        const dir2 = new THREE.Vector3().subVectors(opticalCentre, objTop).normalize();
        const far2 = opticalCentre.clone().add(dir2.multiplyScalar(7.5));
        this.dynamicGroup.add(createRayLine([objTop, far2], 0x2563eb));
        this.addAnimatedPath([objTop, opticalCentre, far2], 0x38bdf8);
      }
    } else {
      // Object at F1 of convex lens -> parallel emergent rays
      const f2Point = new THREE.Vector3(fAbs, 0, 0);
      const dir1 = new THREE.Vector3().subVectors(f2Point, lensHit).normalize();
      const far1 = lensHit.clone().add(dir1.multiplyScalar(8.5));
      this.dynamicGroup.add(createRayLine([lensHit, far1], 0xef4444));

      const dir2 = new THREE.Vector3().subVectors(opticalCentre, objTop).normalize();
      const far2 = opticalCentre.clone().add(dir2.multiplyScalar(8.5));
      this.dynamicGroup.add(createRayLine([objTop, far2], 0x2563eb));
      this.addAnimatedPath([objTop, lensHit, far1], 0xf59e0b);
    }
  }

  private buildLensMesh(lensType: LensType): THREE.Group {
    const group = new THREE.Group();
    group.name = "LensBody";

    const height = 2.1;
    const segments = 24;
    const shape = new THREE.Shape();

    if (lensType === "convex") {
      const bulge = 0.28;
      shape.moveTo(0, -height);
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const y = -height + 2 * height * t;
        const x = bulge * (1 - (y / height) * (y / height));
        shape.lineTo(x, y);
      }
      for (let i = segments; i >= 0; i--) {
        const t = i / segments;
        const y = -height + 2 * height * t;
        const x = -bulge * (1 - (y / height) * (y / height));
        shape.lineTo(x, y);
      }
      shape.closePath();
    } else {
      // Concave (biconcave) profile
      const edgeHalf = 0.28;
      const waistHalf = 0.06;
      shape.moveTo(-edgeHalf, -height);
      shape.lineTo(edgeHalf, -height);
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const y = -height + 2 * height * t;
        const x = waistHalf + (edgeHalf - waistHalf) * ((y / height) * (y / height));
        shape.lineTo(x, y);
      }
      shape.lineTo(-edgeHalf, height);
      for (let i = segments; i >= 0; i--) {
        const t = i / segments;
        const y = -height + 2 * height * t;
        const x = -(waistHalf + (edgeHalf - waistHalf) * ((y / height) * (y / height)));
        shape.lineTo(x, y);
      }
      shape.closePath();
    }

    const geo = new THREE.ExtrudeGeometry(shape, { depth: 1.2, bevelEnabled: false });
    geo.translate(0, 0, -0.6);

    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.58,
      roughness: 0.1,
      metalness: 0.05,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = "LensBody";
    group.add(mesh);

    return group;
  }

  private addAnimatedPath(points: THREE.Vector3[], color: number): void {
    const photon = createPhotonPulse(color);
    this.dynamicGroup.add(photon);
    this.animatedPaths.push({ points, photon });
  }

  update(_deltaTime: number, elapsedTime: number): void {
    if (this.animatedPaths.length === 0) return;
    const t = ((elapsedTime % 4.0) / 4.0 + this.animProgress) % 1.0;

    for (const path of this.animatedPaths) {
      const segCount = path.points.length - 1;
      if (segCount <= 0) continue;
      const scaled = t * segCount;
      const idx = Math.min(segCount - 1, Math.floor(scaled));
      const localT = scaled - idx;
      path.photon.position.lerpVectors(path.points[idx], path.points[idx + 1], localT);
    }
  }

  getResults(): SimulationResult {
    const r = this.calcResult;
    return {
      metrics: {
        "Lens Type": r.lensType === "convex" ? "Convex (Converging)" : "Concave (Diverging)",
        "Object Distance (u)": `${r.u} cm`,
        "Focal Length (f)": `${r.f} cm`,
        "Power (P = 1/f)": `${r.powerDioptres > 0 ? "+" : ""}${r.powerDioptres} D`,
        "Image Distance (v)": r.isAtInfinity ? "∞ (Infinity)" : `${r.v} cm`,
        "Magnification (m)": r.isAtInfinity ? "∞" : `${r.m}`,
        "Image Nature": r.nature,
        "Relative Size": r.size,
      },
      summary: `${r.nature} • ${r.size} • ${r.positionDescription}`,
      observations: [
        `Lens Formula: 1/f = 1/v - 1/u | Power P = ${r.powerDioptres > 0 ? "+" : ""}${r.powerDioptres} Dioptres`,
        r.isVirtual
          ? `Virtual, erect image forms on the same side of the lens at v = ${r.v} cm.`
          : r.isAtInfinity
            ? `Refracted rays emerge parallel; image forms at infinity.`
            : `Real, inverted image forms on the opposite side at v = +${r.v} cm.`,
      ],
    };
  }

  reset(): void {
    this.params = { ...this.initialParams };
    this.rebuildVisuals();
  }

  dispose(): void {
    clearGroupWithDispose(this.dynamicGroup);
    this.animatedPaths = [];
  }
}
