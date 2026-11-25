import * as THREE from "three";
import type {
  Simulation,
  SimulationContext,
  SimulationParameters,
  SimulationResult,
} from "../interfaces/Simulation";
import { clearGroupWithDispose } from "../optics/opticsVisuals";

/**
 * Interactive 3D Bisexual Flower Longitudinal Section & Double Fertilization Simulation.
 */
export class FlowerReproductionSimulation implements Simulation {
  public readonly id = "biology-flower";

  private context!: SimulationContext;
  private dynamicGroup = new THREE.Group();
  private pollenGrain: THREE.Mesh | null = null;
  private pollenPath = [
    new THREE.Vector3(1.1, 1.55, 0),  // Anther
    new THREE.Vector3(0.0, 2.25, 0),  // Lands on Stigma
    new THREE.Vector3(0.0, 0.7, 0),   // Grows down Style
    new THREE.Vector3(0.0, -0.75, 0), // Reaches Ovule in Ovary
  ];
  private params = { showPollination: true };
  private initialParams = { ...this.params };
  private animProgress = 0;

  initialize(context: SimulationContext, initialParams: SimulationParameters): void {
    this.context = context;
    this.dynamicGroup.name = "__BioFlowerGroup";
    this.context.simulationGroup.add(this.dynamicGroup);
    if (typeof initialParams.showPollination === "boolean") {
      this.params.showPollination = initialParams.showPollination;
    }
    this.initialParams = { ...this.params };
    this.rebuildVisuals();
  }

  setParameters(params: SimulationParameters): SimulationResult {
    if (typeof params.showPollination === "boolean") {
      this.params.showPollination = params.showPollination;
      if (this.pollenGrain) this.pollenGrain.visible = this.params.showPollination;
    }
    if (typeof params.__animationProgress === "number") {
      this.animProgress = params.__animationProgress;
    }
    return this.getResults();
  }

  private rebuildVisuals(): void {
    clearGroupWithDispose(this.dynamicGroup);

    // 1. Pedicel & Sepals (green)
    const greenMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5 });
    const pedicel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.3, 16), greenMat);
    pedicel.position.set(0, -2.0, 0);

    [-1, 1].forEach((side) => {
      const sepal = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.16, 0.55), greenMat);
      sepal.rotation.z = side * -0.45;
      sepal.position.set(side * 0.75, -1.3, 0);
      sepal.name = "Sepals";
      this.dynamicGroup.add(sepal);
    });

    // 2. Petals (bright pink/coral)
    const petalMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.4, side: THREE.DoubleSide });
    [-1, 1].forEach((side) => {
      const petal = new THREE.Mesh(new THREE.SphereGeometry(1.35, 18, 18), petalMat);
      petal.scale.set(0.75, 1.5, 0.2);
      petal.rotation.z = side * -0.42;
      petal.position.set(side * 1.45, 0.35, -0.2);
      petal.name = "Petals";
      this.dynamicGroup.add(petal);
    });

    // 3. Female Carpel / Pistil: Ovary (swollen base), Style (neck), Stigma (sticky top)
    const carpelMat = new THREE.MeshStandardMaterial({ color: 0x84cc16, transparent: true, opacity: 0.78, roughness: 0.35 });
    const ovary = new THREE.Mesh(new THREE.SphereGeometry(0.85, 22, 22), carpelMat);
    ovary.scale.set(1.0, 1.2, 0.9);
    ovary.position.set(0, -0.75, 0);
    ovary.name = "Ovary";

    const ovule = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.3 })
    );
    ovule.position.set(0, -0.75, 0);
    ovule.name = "Ovule";

    const style = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 1.9, 16), carpelMat);
    style.position.set(0, 0.85, 0);
    style.name = "Style";

    const stigma = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.22, 0.35, 18),
      new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.35 })
    );
    stigma.position.set(0, 1.9, 0);
    stigma.name = "Pistil_Stigma";

    // 4. Male Stamens: Filament + Anther
    [-1, 1].forEach((side) => {
      const filament = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 2.2, 12),
        new THREE.MeshStandardMaterial({ color: 0xfde047 })
      );
      filament.rotation.z = side * -0.25;
      filament.position.set(side * 0.85, 0.35, 0);
      filament.name = "Filament";

      const anther = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.22, 0.35, 8, 12),
        new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 })
      );
      anther.position.set(side * 1.12, 1.48, 0);
      anther.name = "Stamen_Anther";
      this.dynamicGroup.add(filament, anther);
    });

    // 5. Animated Pollen Grain -> Pollen Tube
    const pollen = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 14, 14),
      new THREE.MeshBasicMaterial({ color: 0xfacc15 })
    );
    pollen.visible = this.params.showPollination;
    this.pollenGrain = pollen;

    this.dynamicGroup.add(pedicel, ovary, ovule, style, stigma, pollen);
  }

  update(_deltaTime: number, elapsedTime: number): void {
    if (!this.pollenGrain || !this.params.showPollination) return;
    const t = (elapsedTime * 0.25 + this.animProgress) % 1.0;
    const segs = this.pollenPath.length - 1;
    const scaled = t * segs;
    const idx = Math.min(segs - 1, Math.floor(scaled));
    this.pollenGrain.position.lerpVectors(this.pollenPath[idx], this.pollenPath[idx + 1], scaled - idx);
  }

  getResults(): SimulationResult {
    return {
      metrics: {
        "Male Part (Stamen)": "Anther + Filament",
        "Female Part (Pistil)": "Stigma + Style + Ovary",
        "Pollination": this.params.showPollination ? "Active (Anther → Stigma)" : "Paused",
        "Post-Fertilization": "Ovary → Fruit | Ovule → Seed",
      },
      summary: "Pollen lands on Stigma → Pollen tube grows through Style → Male gamete fuses with egg in Ovule.",
      observations: [
        "Self-pollination occurs within the same flower; cross-pollination transfers pollen between flowers via wind, water, or insects.",
        "After fertilization, the zygote divides to form an embryo inside the ovule (seed), while the ovary ripens into a fruit.",
      ],
    };
  }

  reset(): void {
    this.params = { ...this.initialParams };
    if (this.pollenGrain) this.pollenGrain.visible = this.params.showPollination;
  }

  dispose(): void {
    clearGroupWithDispose(this.dynamicGroup);
    this.pollenGrain = null;
  }
}
