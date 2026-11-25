import * as THREE from "three";
import type {
  Simulation,
  SimulationContext,
  SimulationParameters,
  SimulationResult,
} from "../interfaces/Simulation";
import {
  calculateMirrorOptics,
  type MirrorCalculationResult,
  type MirrorType,
} from "../../calculations/optics/mirror";
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
 * Interactive 3D Spherical Mirror Simulation (Convex & Concave).
 * Computes exact Cartesian coordinates via calculateMirrorOptics() and renders
 * the mirror curvature, principal axis, P/F/C markers, object, image, and animated rays.
 */
export class MirrorSimulation implements Simulation {
  public readonly id = "mirror";

  private context!: SimulationContext;
  private dynamicGroup = new THREE.Group();
  private params: {
    mirrorType: MirrorType;
    focalLength: number;
    objectDistance: number;
    objectHeight: number;
  } = {
    mirrorType: "convex",
    focalLength: 10,
    objectDistance: -25,
    objectHeight: 4,
  };

  private initialParams = { ...this.params };
  private calcResult!: MirrorCalculationResult;
  private animatedPaths: AnimatedRayPath[] = [];
  private animProgress = 0;

  // World scale: 1 Three.js unit = 5 cm (keeps u in [-55..-5] comfortable in viewport)
  private readonly cmToUnit = 0.14;

  initialize(context: SimulationContext, initialParams: SimulationParameters): void {
    this.context = context;
    this.dynamicGroup.name = "__MirrorDynamicGroup";
    this.context.simulationGroup.add(this.dynamicGroup);

    this.applyParamObject(initialParams);
    this.initialParams = { ...this.params };
    this.rebuildVisuals();
  }

  private applyParamObject(params: SimulationParameters): void {
    if (params.mirrorType === "convex" || params.mirrorType === "concave") {
      this.params.mirrorType = params.mirrorType;
    }
    if (typeof params.focalLength === "number") {
      this.params.focalLength = Math.max(4, Math.min(25, Math.abs(params.focalLength)));
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
      params.mirrorType !== undefined ||
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

    this.calcResult = calculateMirrorOptics({
      mirrorType: this.params.mirrorType,
      focalLengthMagnitude: this.params.focalLength,
      objectDistance: this.params.objectDistance,
      objectHeight: this.params.objectHeight,
    });

    const s = this.cmToUnit;
    const fX = this.calcResult.f * s;
    const cX = this.calcResult.R * s;
    const uX = this.calcResult.u * s;
    const hO = this.calcResult.ho * s * 1.4;

    // 1. Principal Axis
    const axis = createRayLine(
      [new THREE.Vector3(-9.5, 0, 0), new THREE.Vector3(7.5, 0, 0)],
      0x64748b
    );
    axis.name = "PrincipalAxis";
    this.dynamicGroup.add(axis);

    // 2. Curved Mirror Surface (procedural reflective dish)
    const mirrorMesh = this.buildMirrorSurfaceMesh(this.params.mirrorType, Math.abs(cX));
    this.dynamicGroup.add(mirrorMesh);

    // 3. Key Optical Markers: P, F, C
    this.dynamicGroup.add(createPointMarker("Pole_P", 0, 0x0f172a, 0.09));
    this.dynamicGroup.add(createPointMarker("Focus_F", fX, 0x1a73e8, 0.095));
    this.dynamicGroup.add(createPointMarker("Centre_C", cX, 0x7c3aed, 0.095));

    // 4. Object Arrow (AB)
    const objArrow = createAxisArrow("Object_AB", uX, hO, 0x10b981, false);
    this.dynamicGroup.add(objArrow);

    // 5. Incident & Reflected Rays
    const objTop = new THREE.Vector3(uX, hO, 0);
    const hitParallel = new THREE.Vector3(0, hO, 0);
    const pole = new THREE.Vector3(0, 0, 0);

    // Ray 1: Parallel to principal axis -> reflects through (or appears to diverge from) F
    this.dynamicGroup.add(createRayLine([objTop, hitParallel], 0xef4444));

    if (!this.calcResult.isAtInfinity) {
      const vX = Math.max(-9.2, Math.min(7.2, this.calcResult.v * s));
      const hI = Math.max(-3.5, Math.min(3.5, this.calcResult.hi * s * 1.4));
      const imgTop = new THREE.Vector3(vX, hI, 0);

      // Image Arrow (A'B')
      const imgArrow = createAxisArrow(
        "Image_AB",
        vX,
        hI,
        this.calcResult.isVirtual ? 0x0284c7 : 0xea580c,
        this.calcResult.isVirtual
      );
      this.dynamicGroup.add(imgArrow);

      // Ray 1 reflected path
      if (this.calcResult.isVirtual) {
        // Real reflected ray diverges to the left away from F
        const dir1 = new THREE.Vector3().subVectors(hitParallel, new THREE.Vector3(fX, 0, 0)).normalize();
        const farReflected1 = hitParallel.clone().add(dir1.multiplyScalar(6.5));
        this.dynamicGroup.add(createRayLine([hitParallel, farReflected1], 0xef4444));
        // Virtual extension behind/through mirror to F & image top
        this.dynamicGroup.add(createRayLine([hitParallel, new THREE.Vector3(fX, 0, 0)], 0x38bdf8, true));

        this.addAnimatedPath([objTop, hitParallel, farReflected1], 0xf59e0b);
      } else {
        const dir1 = new THREE.Vector3().subVectors(imgTop, hitParallel).normalize();
        const farReflected1 = hitParallel.clone().add(dir1.multiplyScalar(Math.max(4.5, hitParallel.distanceTo(imgTop) + 1.5)));
        this.dynamicGroup.add(createRayLine([hitParallel, farReflected1], 0xef4444));
        this.addAnimatedPath([objTop, hitParallel, farReflected1], 0xf59e0b);
      }

      // Ray 2: Obliquely toward Pole P (angle i = angle r)
      this.dynamicGroup.add(createRayLine([objTop, pole], 0x2563eb));
      const reflectedDir2 = new THREE.Vector3(uX, -hO, 0).normalize();
      const farReflected2 = pole.clone().add(reflectedDir2.multiplyScalar(6.5));
      this.dynamicGroup.add(createRayLine([pole, farReflected2], 0x2563eb));

      if (this.calcResult.isVirtual) {
        this.dynamicGroup.add(createRayLine([pole, imgTop], 0x38bdf8, true));
      }
      this.addAnimatedPath([objTop, pole, farReflected2], 0x38bdf8);

      // Ray 3: Directed toward Centre of Curvature C
      const dirToC = new THREE.Vector3().subVectors(new THREE.Vector3(cX, 0, 0), objTop).normalize();
      if (Math.abs(dirToC.x) > 0.05) {
        const tHit = -objTop.x / dirToC.x;
        const hitC = objTop.clone().add(dirToC.clone().multiplyScalar(tHit));
        if (Math.abs(hitC.y) < 2.2) {
          this.dynamicGroup.add(createRayLine([objTop, hitC], 0x9333ea));
          if (this.calcResult.isVirtual) {
            this.dynamicGroup.add(createRayLine([hitC, new THREE.Vector3(cX, 0, 0)], 0xc084fc, true));
          }
        }
      }
    } else {
      // Object at F -> parallel reflected rays
      const dir1 = new THREE.Vector3(uX - fX, -hO, 0).normalize();
      const far1 = hitParallel.clone().add(dir1.multiplyScalar(6.5));
      this.dynamicGroup.add(createRayLine([hitParallel, far1], 0xef4444));
      this.addAnimatedPath([objTop, hitParallel, far1], 0xf59e0b);
    }
  }

  private buildMirrorSurfaceMesh(mirrorType: MirrorType, radiusUnits: number): THREE.Group {
    const group = new THREE.Group();
    group.name = "MirrorSurface";

    const safeR = Math.max(2.0, Math.min(8.0, radiusUnits));
    const arcHeight = 2.0;
    const points: THREE.Vector2[] = [];
    const segments = 24;

    for (let i = 0; i <= segments; i++) {
      const y = -arcHeight + (2 * arcHeight * i) / segments;
      const sag = (y * y) / (2 * safeR);
      const x = mirrorType === "convex" ? sag : -sag;
      points.push(new THREE.Vector2(x, y));
    }

    const shape = new THREE.Shape();
    shape.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      shape.lineTo(points[i].x, points[i].y);
    }
    for (let i = points.length - 1; i >= 0; i--) {
      const backOffset = 0.14;
      shape.lineTo(points[i].x + backOffset, points[i].y);
    }
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 1.2,
      bevelEnabled: false,
    });
    geo.translate(0, 0, -0.6);

    const mat = new THREE.MeshStandardMaterial({
      color: 0xbae6fd,
      metalness: 0.72,
      roughness: 0.15,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = "MirrorSurface";
    group.add(mesh);

    // Polished silver backing strip
    const backCurvePts = points.map((p) => new THREE.Vector3(p.x + 0.16, p.y, 0));
    const backLine = createRayLine(backCurvePts, 0x475569, true);
    group.add(backLine);

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
        "Mirror Type": r.mirrorType === "convex" ? "Convex (Diverging)" : "Concave (Converging)",
        "Object Distance (u)": `${r.u} cm`,
        "Focal Length (f)": `${r.f} cm`,
        "Image Distance (v)": r.isAtInfinity ? "∞ (Infinity)" : `${r.v} cm`,
        "Magnification (m)": r.isAtInfinity ? "∞" : `${r.m}`,
        "Image Height (hᵢ)": r.isAtInfinity ? "∞" : `${r.hi} cm`,
        "Image Nature": r.nature,
        "Relative Size": r.size,
      },
      summary: `${r.nature} • ${r.size} • ${r.positionDescription}`,
      observations: [
        `Cartesian Sign Convention: u = ${r.u} cm, f = ${r.f} cm`,
        r.isVirtual
          ? `Virtual image forms at v = +${r.v} cm behind the mirror (between P and F for convex).`
          : r.isAtInfinity
            ? `Reflected rays emerge parallel; image forms at infinity.`
            : `Real, inverted image forms in front of the mirror at v = ${r.v} cm.`,
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
