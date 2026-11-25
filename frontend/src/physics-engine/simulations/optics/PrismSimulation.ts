import * as THREE from "three";
import type {
  Simulation,
  SimulationContext,
  SimulationParameters,
  SimulationResult,
} from "../interfaces/Simulation";
import {
  calculatePrismDispersion,
  type PrismBandResult,
} from "../../calculations/optics/refraction";
import {
  clearGroupWithDispose,
  createPhotonPulse,
  createRayLine,
} from "./opticsVisuals";

/**
 * Interactive 3D Triangular Glass Prism & White Light Dispersion (VIBGYOR) Simulation.
 */
export class PrismSimulation implements Simulation {
  public readonly id = "prism";

  private context!: SimulationContext;
  private dynamicGroup = new THREE.Group();
  private params = {
    angleOfIncidence: 42,
    prismAngle: 60,
    baseRefractiveIndex: 1.52,
    dispersionStrength: 1.8,
  };
  private initialParams = { ...this.params };
  private bands: PrismBandResult[] = [];
  private photons: { pts: THREE.Vector3[]; mesh: THREE.Mesh }[] = [];
  private animProgress = 0;

  initialize(context: SimulationContext, initialParams: SimulationParameters): void {
    this.context = context;
    this.dynamicGroup.name = "__PrismDynamicGroup";
    this.context.simulationGroup.add(this.dynamicGroup);
    this.applyParams(initialParams);
    this.initialParams = { ...this.params };
    this.rebuildVisuals();
  }

  private applyParams(params: SimulationParameters): void {
    if (typeof params.angleOfIncidence === "number") {
      this.params.angleOfIncidence = Math.max(20, Math.min(75, params.angleOfIncidence));
    }
    if (typeof params.prismAngle === "number") {
      this.params.prismAngle = Math.max(40, Math.min(70, params.prismAngle));
    }
    if (typeof params.baseRefractiveIndex === "number") {
      this.params.baseRefractiveIndex = Math.max(1.35, Math.min(1.8, params.baseRefractiveIndex));
    }
    if (typeof params.dispersionStrength === "number") {
      this.params.dispersionStrength = Math.max(0.8, Math.min(3.0, params.dispersionStrength));
    }
    if (typeof params.__animationProgress === "number") {
      this.animProgress = params.__animationProgress;
    }
  }

  setParameters(params: SimulationParameters): SimulationResult {
    this.applyParams(params);
    if (
      params.angleOfIncidence !== undefined ||
      params.prismAngle !== undefined ||
      params.baseRefractiveIndex !== undefined ||
      params.dispersionStrength !== undefined
    ) {
      this.rebuildVisuals();
    }
    return this.getResults();
  }

  private rebuildVisuals(): void {
    clearGroupWithDispose(this.dynamicGroup);
    this.photons = [];

    this.bands = calculatePrismDispersion({
      angleOfIncidenceDeg: this.params.angleOfIncidence,
      prismAngleDeg: this.params.prismAngle,
      baseRefractiveIndex: this.params.baseRefractiveIndex,
      dispersionStrength: this.params.dispersionStrength,
    });

    // Triangular prism vertices centered around origin
    const halfA = ((this.params.prismAngle * Math.PI) / 180) / 2;
    const height = 3.2;
    const baseHalfW = height * Math.tan(halfA);
    const topApex = new THREE.Vector3(0, height * 0.55, 0);
    const botLeft = new THREE.Vector3(-baseHalfW, -height * 0.45, 0);
    const botRight = new THREE.Vector3(baseHalfW, -height * 0.45, 0);

    const shape = new THREE.Shape();
    shape.moveTo(botLeft.x, botLeft.y);
    shape.lineTo(botRight.x, botRight.y);
    shape.lineTo(topApex.x, topApex.y);
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, { depth: 1.8, bevelEnabled: false });
    geo.translate(0, 0, -0.9);
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.48,
      roughness: 0.08,
    });
    const prismMesh = new THREE.Mesh(geo, mat);
    prismMesh.name = "GlassPrism";
    this.dynamicGroup.add(prismMesh);

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geo),
      new THREE.LineBasicMaterial({ color: 0x0284c7 })
    );
    this.dynamicGroup.add(edges);

    // Entry point at midpoint of left face
    const entryPt = new THREE.Vector3().lerpVectors(botLeft, topApex, 0.52);
    // Left face normal pointing outward-left
    const leftEdgeDir = new THREE.Vector3().subVectors(topApex, botLeft).normalize();
    const leftNormalOut = new THREE.Vector3(-leftEdgeDir.y, leftEdgeDir.x, 0).normalize();
    if (leftNormalOut.x > 0) leftNormalOut.negate();

    // Incident white light ray at angle i1 relative to normal
    const i1Rad = (this.params.angleOfIncidence * Math.PI) / 180;
    const incDir = leftNormalOut
      .clone()
      .negate()
      .applyAxisAngle(new THREE.Vector3(0, 0, 1), -i1Rad)
      .normalize();
    const incStart = entryPt.clone().sub(incDir.clone().multiplyScalar(3.5));

    const whiteRay = createRayLine([incStart, entryPt], 0x1e293b);
    whiteRay.name = "IncidentWhiteLight";
    this.dynamicGroup.add(whiteRay);

    // Normal at entry face
    this.dynamicGroup.add(
      createRayLine(
        [
          entryPt.clone().add(leftNormalOut.clone().multiplyScalar(1.3)),
          entryPt.clone().sub(leftNormalOut.clone().multiplyScalar(1.3)),
        ],
        0x94a3b8,
        true
      )
    );

    // Screen on the right
    const screenGeo = new THREE.BoxGeometry(0.12, 3.8, 1.8);
    const screenMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.name = "SpectrumScreen";
    screen.position.set(4.8, -0.3, 0);
    this.dynamicGroup.add(screen);

    // Right face line segment: topApex -> botRight
    const rightEdgeDir = new THREE.Vector3().subVectors(botRight, topApex).normalize();
    const rightNormalOut = new THREE.Vector3(rightEdgeDir.y, -rightEdgeDir.x, 0).normalize();
    if (rightNormalOut.x < 0) rightNormalOut.negate();

    // Trace each VIBGYOR band
    this.bands.forEach((band, idx) => {
      const r1Rad = Math.asin(Math.min(0.999, Math.sin(i1Rad) / band.refractiveIndex));
      const internalDir = leftNormalOut
        .clone()
        .negate()
        .applyAxisAngle(new THREE.Vector3(0, 0, 1), -r1Rad)
        .normalize();

      // Intersect entryPt + t * internalDir with right face (topApex -> botRight)
      const denom = internalDir.x * rightEdgeDir.y - internalDir.y * rightEdgeDir.x;
      let tHit = 1.6;
      if (Math.abs(denom) > 1e-4) {
        const dx = topApex.x - entryPt.x;
        const dy = topApex.y - entryPt.y;
        tHit = (dx * rightEdgeDir.y - dy * rightEdgeDir.x) / denom;
      }
      tHit = Math.max(0.4, Math.min(3.5, tHit));
      const exitPt = entryPt.clone().add(internalDir.clone().multiplyScalar(tHit));

      // Emergent direction bends downward away from normal
      const eRad = (band.angleEmergenceDeg * Math.PI) / 180;
      const emerDir = rightNormalOut
        .clone()
        .applyAxisAngle(new THREE.Vector3(0, 0, 1), -eRad)
        .normalize();
      const tScreen = (4.74 - exitPt.x) / Math.max(0.2, emerDir.x);
      const screenHit = exitPt.clone().add(emerDir.clone().multiplyScalar(Math.max(1.0, tScreen)));

      const internalLine = createRayLine([entryPt, exitPt], band.hex);
      const emerLine = createRayLine([exitPt, screenHit], band.hex);
      if (idx === 0) emerLine.name = "SpectrumVIBGYOR";
      this.dynamicGroup.add(internalLine, emerLine);

      const photon = createPhotonPulse(band.hex);
      this.dynamicGroup.add(photon);
      this.photons.push({ pts: [incStart, entryPt, exitPt, screenHit], mesh: photon });
    });
  }

  update(_deltaTime: number, elapsedTime: number): void {
    const t = ((elapsedTime % 4.0) / 4.0 + this.animProgress) % 1.0;
    for (const item of this.photons) {
      const segs = item.pts.length - 1;
      const scaled = t * segs;
      const idx = Math.min(segs - 1, Math.floor(scaled));
      item.mesh.position.lerpVectors(item.pts[idx], item.pts[idx + 1], scaled - idx);
    }
  }

  getResults(): SimulationResult {
    const red = this.bands[0];
    const violet = this.bands[this.bands.length - 1];
    const angularSpread = +(violet.deviationDeg - red.deviationDeg).toFixed(2);

    return {
      metrics: {
        "Prism Angle (A)": `${this.params.prismAngle}°`,
        "Angle of Incidence (i)": `${this.params.angleOfIncidence}°`,
        "Red Deviation (δ_R)": `${red.deviationDeg}°`,
        "Violet Deviation (δ_V)": `${violet.deviationDeg}°`,
        "Angular Dispersion": `${angularSpread}°`,
        "Spectrum Order": "R-O-Y-G-B-I-V (Top → Bottom)",
      },
      summary: `Violet deviates most (${violet.deviationDeg}°) & Red deviates least (${red.deviationDeg}°) • Angular spread = ${angularSpread}°`,
      observations: [
        "White light splits into 7 colours (VIBGYOR) because glass has a slightly different refractive index for each wavelength.",
        "Red light has the longest wavelength (fastest in glass) → least refraction & least deviation.",
        "Violet light has the shortest wavelength (slowest in glass) → maximum refraction & maximum deviation.",
      ],
    };
  }

  reset(): void {
    this.params = { ...this.initialParams };
    this.rebuildVisuals();
  }

  dispose(): void {
    clearGroupWithDispose(this.dynamicGroup);
    this.photons = [];
  }
}
