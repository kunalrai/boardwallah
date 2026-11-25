import * as THREE from "three";
import type {
  Simulation,
  SimulationContext,
  SimulationParameters,
  SimulationResult,
} from "../interfaces/Simulation";
import {
  calculateGlassSlabRefraction,
  type GlassSlabResult,
} from "../../calculations/optics/refraction";
import {
  clearGroupWithDispose,
  createPhotonPulse,
  createRayLine,
} from "./opticsVisuals";

/**
 * Interactive 3D Rectangular Glass Slab Refraction Simulation.
 * Visualizes Snell's Law (n1 sin i = n2 sin r), normal lines,
 * parallel emergent ray (angle i = angle e), and lateral displacement.
 */
export class RefractionSimulation implements Simulation {
  public readonly id = "refraction";

  private context!: SimulationContext;
  private dynamicGroup = new THREE.Group();
  private params = {
    angleOfIncidence: 40,
    refractiveIndex: 1.5,
    thickness: 4.0,
  };
  private initialParams = { ...this.params };
  private calcResult!: GlassSlabResult;
  private rayPoints: THREE.Vector3[] = [];
  private photon: THREE.Mesh | null = null;
  private animProgress = 0;

  initialize(context: SimulationContext, initialParams: SimulationParameters): void {
    this.context = context;
    this.dynamicGroup.name = "__RefractionDynamicGroup";
    this.context.simulationGroup.add(this.dynamicGroup);
    this.applyParams(initialParams);
    this.initialParams = { ...this.params };
    this.rebuildVisuals();
  }

  private applyParams(params: SimulationParameters): void {
    if (typeof params.angleOfIncidence === "number") {
      this.params.angleOfIncidence = Math.max(5, Math.min(75, params.angleOfIncidence));
    }
    if (typeof params.refractiveIndex === "number") {
      this.params.refractiveIndex = Math.max(1.1, Math.min(2.45, params.refractiveIndex));
    }
    if (typeof params.thickness === "number") {
      this.params.thickness = Math.max(2, Math.min(8, params.thickness));
    }
    if (typeof params.__animationProgress === "number") {
      this.animProgress = params.__animationProgress;
    }
  }

  setParameters(params: SimulationParameters): SimulationResult {
    this.applyParams(params);
    if (
      params.angleOfIncidence !== undefined ||
      params.refractiveIndex !== undefined ||
      params.thickness !== undefined
    ) {
      this.rebuildVisuals();
    }
    return this.getResults();
  }

  private rebuildVisuals(): void {
    clearGroupWithDispose(this.dynamicGroup);
    this.rayPoints = [];
    this.photon = null;

    this.calcResult = calculateGlassSlabRefraction({
      angleOfIncidenceDeg: this.params.angleOfIncidence,
      refractiveIndex: this.params.refractiveIndex,
      thicknessCm: this.params.thickness,
    });

    // Scale thickness into world units (slab centered vertically around y = 0)
    const slabH = this.calcResult.thicknessCm * 0.65;
    const slabW = 7.0;
    const slabD = 2.0;
    const topY = slabH / 2;
    const botY = -slabH / 2;

    // 1. Rectangular Glass Slab
    const slabGeo = new THREE.BoxGeometry(slabW, slabH, slabD);
    const slabMat = new THREE.MeshPhysicalMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.42,
      roughness: 0.08,
      metalness: 0.05,
    });
    const slabMesh = new THREE.Mesh(slabGeo, slabMat);
    slabMesh.name = "GlassSlab";
    this.dynamicGroup.add(slabMesh);

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(slabGeo),
      new THREE.LineBasicMaterial({ color: 0x0284c7 })
    );
    this.dynamicGroup.add(edges);

    // 2. Ray geometry
    const iRad = (this.calcResult.angleIncidenceDeg * Math.PI) / 180;
    const rRad = (this.calcResult.angleRefractionDeg * Math.PI) / 180;

    const entryX = -1.2;
    const entryPt = new THREE.Vector3(entryX, topY, 0);

    const incStart = new THREE.Vector3(
      entryX - 2.8 * Math.sin(iRad),
      topY + 2.8 * Math.cos(iRad),
      0
    );

    const exitX = entryX + slabH * Math.tan(rRad);
    const exitPt = new THREE.Vector3(exitX, botY, 0);

    const emerEnd = new THREE.Vector3(
      exitX + 2.8 * Math.sin(iRad),
      botY - 2.8 * Math.cos(iRad),
      0
    );

    // Normals (dashed vertical lines at entry and exit)
    const normal1 = createRayLine(
      [new THREE.Vector3(entryX, topY + 1.8, 0), new THREE.Vector3(entryX, topY - 1.8, 0)],
      0x64748b,
      true
    );
    normal1.name = "Normal_NN";
    this.dynamicGroup.add(normal1);

    const normal2 = createRayLine(
      [new THREE.Vector3(exitX, botY + 1.8, 0), new THREE.Vector3(exitX, botY - 1.8, 0)],
      0x64748b,
      true
    );
    this.dynamicGroup.add(normal2);

    // Undeflected original path (dashed) to show lateral displacement
    const undeflectedEnd = new THREE.Vector3(
      entryX + (slabH + 2.8 * Math.cos(iRad)) * Math.tan(iRad),
      botY - 2.8 * Math.cos(iRad),
      0
    );
    const undeflectedLine = createRayLine([entryPt, undeflectedEnd], 0x94a3b8, true);
    undeflectedLine.name = "LateralShift";
    this.dynamicGroup.add(undeflectedLine);

    // Incident, Refracted, Emergent Rays
    const incLine = createRayLine([incStart, entryPt], 0xef4444);
    incLine.name = "IncidentRay";
    const refLine = createRayLine([entryPt, exitPt], 0xf59e0b);
    refLine.name = "RefractedRay";
    const emerLine = createRayLine([exitPt, emerEnd], 0x2563eb);
    emerLine.name = "EmergentRay";

    this.dynamicGroup.add(incLine, refLine, emerLine);

    this.rayPoints = [incStart, entryPt, exitPt, emerEnd];
    this.photon = createPhotonPulse(0xfde047);
    this.dynamicGroup.add(this.photon);
  }

  update(_deltaTime: number, elapsedTime: number): void {
    if (!this.photon || this.rayPoints.length < 2) return;
    const t = ((elapsedTime % 4.0) / 4.0 + this.animProgress) % 1.0;
    const segs = this.rayPoints.length - 1;
    const scaled = t * segs;
    const idx = Math.min(segs - 1, Math.floor(scaled));
    this.photon.position.lerpVectors(this.rayPoints[idx], this.rayPoints[idx + 1], scaled - idx);
  }

  getResults(): SimulationResult {
    const r = this.calcResult;
    return {
      metrics: {
        "Angle of Incidence (i)": `${r.angleIncidenceDeg}°`,
        "Angle of Refraction (r)": `${r.angleRefractionDeg}°`,
        "Angle of Emergence (e)": `${r.angleEmergenceDeg}°`,
        "Refractive Index (n)": `${r.refractiveIndex}`,
        "Slab Thickness (t)": `${r.thicknessCm} cm`,
        "Lateral Displacement (d)": `${r.lateralDisplacementCm} cm`,
      },
      summary: `Snell's Law: sin(${r.angleIncidenceDeg}°) / sin(${r.angleRefractionDeg}°) = ${r.refractiveIndex} • Lateral shift = ${r.lateralDisplacementCm} cm`,
      observations: [
        `Ray bends TOWARD normal when entering glass (air → glass, rarer → denser).`,
        `Ray bends AWAY from normal when exiting glass (glass → air), making ∠e = ∠i = ${r.angleEmergenceDeg}°.`,
        `Emergent ray is parallel to the incident ray, shifted laterally by ${r.lateralDisplacementCm} cm.`,
      ],
    };
  }

  reset(): void {
    this.params = { ...this.initialParams };
    this.rebuildVisuals();
  }

  dispose(): void {
    clearGroupWithDispose(this.dynamicGroup);
    this.rayPoints = [];
    this.photon = null;
  }
}
