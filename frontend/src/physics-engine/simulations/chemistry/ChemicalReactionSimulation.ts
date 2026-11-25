import * as THREE from "three";
import type {
  Simulation,
  SimulationContext,
  SimulationParameters,
  SimulationResult,
} from "../interfaces/Simulation";
import {
  getChemicalReactionInfo,
  type ReactionCalculationResult,
  type ReactionId,
} from "../../calculations/chemistry/chemistry";
import { clearGroupWithDispose } from "../optics/opticsVisuals";

/**
 * Interactive 3D Chemical Reactions Lab Simulation.
 * Renders a borosilicate reaction vessel, optional Bunsen burner flame,
 * dynamic reactant-to-product colour transition, rising gas fumes, and precipitate particles.
 */
export class ChemicalReactionSimulation implements Simulation {
  public readonly id = "chemistry-reaction";

  private context!: SimulationContext;
  private dynamicGroup = new THREE.Group();
  private params: {
    reactionId: ReactionId;
    reactionProgress: number;
    heatingOn: boolean;
  } = {
    reactionId: "feso4-decomp",
    reactionProgress: 0.6,
    heatingOn: true,
  };
  private initialParams = { ...this.params };
  private info!: ReactionCalculationResult;
  private gasParticles: { mesh: THREE.Mesh; offset: number }[] = [];
  private flameMesh: THREE.Mesh | null = null;
  private animProgress = 0;

  initialize(context: SimulationContext, initialParams: SimulationParameters): void {
    this.context = context;
    this.dynamicGroup.name = "__ChemReactionGroup";
    this.context.simulationGroup.add(this.dynamicGroup);
    this.applyParams(initialParams);
    this.initialParams = { ...this.params };
    this.rebuildVisuals();
  }

  private applyParams(params: SimulationParameters): void {
    if (
      params.reactionId === "feso4-decomp" ||
      params.reactionId === "pbno3-decomp" ||
      params.reactionId === "fe-cuso4" ||
      params.reactionId === "ba-precip"
    ) {
      this.params.reactionId = params.reactionId;
    }
    if (typeof params.reactionProgress === "number") {
      this.params.reactionProgress = Math.max(0, Math.min(1, params.reactionProgress));
    }
    if (typeof params.heatingOn === "boolean") {
      this.params.heatingOn = params.heatingOn;
    }
    if (typeof params.__animationProgress === "number") {
      this.animProgress = params.__animationProgress;
    }
  }

  setParameters(params: SimulationParameters): SimulationResult {
    this.applyParams(params);
    this.rebuildVisuals();
    return this.getResults();
  }

  private rebuildVisuals(): void {
    clearGroupWithDispose(this.dynamicGroup);
    this.gasParticles = [];
    this.flameMesh = null;

    this.info = getChemicalReactionInfo(this.params.reactionId);
    const p = this.params.reactionProgress;

    // 1. Glass Reaction Vessel / Test Tube
    const vesselGeo = new THREE.CylinderGeometry(1.15, 1.15, 3.6, 28, 1, true);
    const vesselMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.34,
      roughness: 0.08,
      side: THREE.DoubleSide,
    });
    const vessel = new THREE.Mesh(vesselGeo, vesselMat);
    vessel.name = "ReactionVessel";
    vessel.position.set(0, 0.5, 0);
    this.dynamicGroup.add(vessel);

    const baseRim = new THREE.Mesh(
      new THREE.CylinderGeometry(1.15, 1.15, 0.1, 28),
      vesselMat
    );
    baseRim.position.set(0, -1.3, 0);
    this.dynamicGroup.add(baseRim);

    // 2. Reactant/Product Substance with interpolated colour
    const cInit = new THREE.Color(this.info.initialColorHex);
    const cFinal = new THREE.Color(this.info.finalColorHex);
    const currentColor = cInit.clone().lerp(cFinal, p);

    const contents = new THREE.Mesh(
      new THREE.CylinderGeometry(1.06, 1.06, 1.55, 24),
      new THREE.MeshStandardMaterial({
        color: currentColor,
        roughness: 0.35,
        transparent: true,
        opacity: 0.88,
      })
    );
    contents.name = "ReactantMedium";
    contents.position.set(0, -0.45, 0);
    this.dynamicGroup.add(contents);

    // Iron nail for displacement reaction
    if (this.params.reactionId === "fe-cuso4") {
      const nail = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.08, 2.5, 14),
        new THREE.MeshStandardMaterial({
          color: p > 0.35 ? 0xc2410c : 0x64748b,
          metalness: 0.7,
          roughness: 0.3,
        })
      );
      nail.rotation.z = 0.28;
      nail.position.set(0.15, 0.1, 0);
      nail.name = "IronNail";
      this.dynamicGroup.add(nail);
    }

    // 3. Optional Bunsen Burner Flame (for decomposition reactions)
    if (this.params.heatingOn && (this.params.reactionId === "feso4-decomp" || this.params.reactionId === "pbno3-decomp")) {
      const burner = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.55, 0.7, 20),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 })
      );
      burner.position.set(0, -2.25, 0);
      burner.name = "BunsenBurner";
      this.dynamicGroup.add(burner);

      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.36, 0.78, 18),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 })
      );
      flame.position.set(0, -1.65, 0);
      flame.name = "BurnerFlame";
      this.dynamicGroup.add(flame);
      this.flameMesh = flame;
    }

    // 4. Rising Gas Fumes (if reaction produces gas)
    if (this.info.gasColorHex !== null && p > 0.15) {
      const gasGeo = new THREE.SphereGeometry(0.18, 12, 12);
      const gasMat = new THREE.MeshStandardMaterial({
        color: this.info.gasColorHex,
        transparent: true,
        opacity: 0.65,
      });
      for (let i = 0; i < 10; i++) {
        const bubble = new THREE.Mesh(gasGeo, gasMat);
        bubble.position.set((Math.sin(i * 1.9) * 0.55), 0.3 + i * 0.22, Math.cos(i * 2.1) * 0.45);
        bubble.name = "EvolvedGas";
        this.dynamicGroup.add(bubble);
        this.gasParticles.push({ mesh: bubble, offset: i / 10 });
      }
    }

    // 5. Settling Precipitate Layer (for BaSO4 or Cu)
    if (this.info.precipitateColorHex !== null && p > 0.25) {
      const precip = new THREE.Mesh(
        new THREE.CylinderGeometry(1.04, 1.04, 0.32 * p, 24),
        new THREE.MeshStandardMaterial({ color: this.info.precipitateColorHex, roughness: 0.6 })
      );
      precip.position.set(0, -1.12, 0);
      precip.name = "Precipitate";
      this.dynamicGroup.add(precip);
    }
  }

  update(_deltaTime: number, elapsedTime: number): void {
    const t = ((elapsedTime * 0.45) + this.animProgress) % 1.0;
    if (this.flameMesh) {
      const s = 0.92 + 0.14 * Math.sin(elapsedTime * 14);
      this.flameMesh.scale.set(1, s, 1);
    }
    for (const gp of this.gasParticles) {
      const phase = (t + gp.offset) % 1.0;
      gp.mesh.position.y = 0.25 + phase * 2.5;
      gp.mesh.scale.setScalar(0.75 + phase * 0.7);
    }
  }

  getResults(): SimulationResult {
    return {
      metrics: {
        "Reaction": this.info.name,
        "Type": this.info.reactionType,
        "Balanced Equation": this.info.balancedEquation,
        "Initial State": this.info.initialAppearance,
        "Final Products": this.info.finalAppearance,
        "Progress": `${Math.round(this.params.reactionProgress * 100)}%`,
      },
      summary: this.info.balancedEquation,
      observations: [this.info.observation],
    };
  }

  reset(): void {
    this.params = { ...this.initialParams };
    this.rebuildVisuals();
  }

  dispose(): void {
    clearGroupWithDispose(this.dynamicGroup);
    this.gasParticles = [];
    this.flameMesh = null;
  }
}
