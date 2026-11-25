import * as THREE from "three";
import type {
  Simulation,
  SimulationContext,
  SimulationParameters,
  SimulationResult,
} from "../interfaces/Simulation";
import {
  calculateTrophicEnergy,
  type TrophicEnergyResult,
} from "../../calculations/biology/biology";
import { clearGroupWithDispose } from "../optics/opticsVisuals";

/**
 * Interactive 3D Ecosystem Trophic Energy Pyramid (10% Law - Our Environment).
 */
export class EcosystemPyramidSimulation implements Simulation {
  public readonly id = "biology-ecosystem";

  private context!: SimulationContext;
  private dynamicGroup = new THREE.Group();
  private pyramidRoot = new THREE.Group();
  private params = { solarEnergyJ: 100000, autoRotate: true };
  private initialParams = { ...this.params };
  private calcResult!: TrophicEnergyResult;

  initialize(context: SimulationContext, initialParams: SimulationParameters): void {
    this.context = context;
    this.dynamicGroup.name = "__BioEcosystemGroup";
    this.context.simulationGroup.add(this.dynamicGroup);
    if (typeof initialParams.solarEnergyJ === "number") {
      this.params.solarEnergyJ = initialParams.solarEnergyJ;
    }
    if (typeof initialParams.autoRotate === "boolean") {
      this.params.autoRotate = initialParams.autoRotate;
    }
    this.initialParams = { ...this.params };
    this.rebuildVisuals();
  }

  setParameters(params: SimulationParameters): SimulationResult {
    if (typeof params.solarEnergyJ === "number") {
      this.params.solarEnergyJ = Math.max(10000, Math.min(1000000, params.solarEnergyJ));
      this.calcResult = calculateTrophicEnergy(this.params.solarEnergyJ);
    }
    if (typeof params.autoRotate === "boolean") {
      this.params.autoRotate = params.autoRotate;
    }
    return this.getResults();
  }

  private rebuildVisuals(): void {
    clearGroupWithDispose(this.dynamicGroup);
    this.pyramidRoot = new THREE.Group();
    this.dynamicGroup.add(this.pyramidRoot);
    this.calcResult = calculateTrophicEnergy(this.params.solarEnergyJ);

    const tiers = [
      { name: "Producers_T1", w: 4.4, y: -1.35, color: 0x16a34a },
      { name: "PrimaryConsumers_T2", w: 3.3, y: -0.45, color: 0x84cc16 },
      { name: "SecondaryConsumers_T3", w: 2.2, y: 0.45, color: 0xf59e0b },
      { name: "TertiaryConsumers_T4", w: 1.15, y: 1.35, color: 0xef4444 },
    ];

    tiers.forEach((tier) => {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(tier.w, 0.78, tier.w),
        new THREE.MeshStandardMaterial({ color: tier.color, roughness: 0.45 })
      );
      box.position.set(0, tier.y, 0);
      box.name = tier.name;
      this.pyramidRoot.add(box);
    });
  }

  update(deltaTime: number): void {
    if (this.params.autoRotate) {
      this.pyramidRoot.rotation.y += deltaTime * 0.35;
    }
  }

  getResults(): SimulationResult {
    const r = this.calcResult;
    return {
      metrics: {
        "Sunlight Incident": `${r.solarEnergyJ.toLocaleString()} J`,
        "T1 Producers (1%)": `${r.producersJ.toLocaleString()} J`,
        "T2 Herbivores (10%)": `${r.primaryConsumersJ.toLocaleString()} J`,
        "T3 Carnivores (10%)": `${r.secondaryConsumersJ.toLocaleString()} J`,
        "T4 Top Carnivores (10%)": `${r.tertiaryConsumersJ.toLocaleString()} J`,
      },
      summary: `10% Energy Law: ${r.producersJ} J → ${r.primaryConsumersJ} J → ${r.secondaryConsumersJ} J → ${r.tertiaryConsumersJ} J`,
      observations: [
        "Green plants capture ~1% of solar energy falling on leaves.",
        "Only ~10% of energy is transferred to the next trophic level; ~90% is lost as heat and life processes.",
        "Energy flow in a food chain is strictly unidirectional.",
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
