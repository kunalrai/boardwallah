import * as THREE from "three";
import type {
  Simulation,
  SimulationContext,
  SimulationParameters,
  SimulationResult,
} from "../interfaces/Simulation";
import {
  calculateMendelianCross,
  type MendelianCrossResult,
  type ParentCrossType,
} from "../../calculations/biology/biology";
import { clearGroupWithDispose } from "../optics/opticsVisuals";

/**
 * Interactive 3D Heredity: DNA Double Helix & Mendel's Monohybrid Pea Cross Lab.
 */
export class HeredityGeneticsSimulation implements Simulation {
  public readonly id = "biology-heredity";

  private context!: SimulationContext;
  private dynamicGroup = new THREE.Group();
  private dnaGroup = new THREE.Group();
  private params: { cross: ParentCrossType; autoRotate: boolean } = {
    cross: "Tt-Tt",
    autoRotate: true,
  };
  private initialParams = { ...this.params };
  private calcResult!: MendelianCrossResult;

  initialize(context: SimulationContext, initialParams: SimulationParameters): void {
    this.context = context;
    this.dynamicGroup.name = "__BioHeredityGroup";
    this.context.simulationGroup.add(this.dynamicGroup);
    if (initialParams.cross === "TT-tt" || initialParams.cross === "Tt-Tt" || initialParams.cross === "TT-Tt") {
      this.params.cross = initialParams.cross;
    }
    if (typeof initialParams.autoRotate === "boolean") {
      this.params.autoRotate = initialParams.autoRotate;
    }
    this.initialParams = { ...this.params };
    this.rebuildVisuals();
  }

  setParameters(params: SimulationParameters): SimulationResult {
    let rebuild = false;
    if (params.cross === "TT-tt" || params.cross === "Tt-Tt" || params.cross === "TT-Tt") {
      this.params.cross = params.cross;
      rebuild = true;
    }
    if (typeof params.autoRotate === "boolean") {
      this.params.autoRotate = params.autoRotate;
    }
    if (rebuild) this.rebuildVisuals();
    return this.getResults();
  }

  private rebuildVisuals(): void {
    clearGroupWithDispose(this.dynamicGroup);
    this.calcResult = calculateMendelianCross(this.params.cross);

    // 1. 3D DNA Double Helix (left side x = -2.4)
    this.dnaGroup = new THREE.Group();
    this.dnaGroup.name = "DNA_Helix";
    this.dnaGroup.position.set(-2.4, 0, 0);
    const baseColors = [0xef4444, 0x3b82f6, 0x22c55e, 0xeab308];

    for (let i = 0; i < 12; i++) {
      const y = -1.65 + i * 0.3;
      const angle = i * 0.55;
      const x1 = Math.cos(angle) * 0.65;
      const z1 = Math.sin(angle) * 0.65;

      const b1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0x1d4ed8 })
      );
      b1.position.set(x1, y, z1);

      const b2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0x0284c7 })
      );
      b2.position.set(-x1, y, -z1);

      const rung = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, 1.3, 8),
        new THREE.MeshStandardMaterial({ color: baseColors[i % 4] })
      );
      rung.rotation.z = Math.PI / 2;
      rung.rotation.y = -angle;
      rung.position.set(0, y, 0);

      this.dnaGroup.add(b1, b2, rung);
    }
    this.dynamicGroup.add(this.dnaGroup);

    // 2. 4 Offspring Pea Plants (right side, representing the 4 Punnett Square boxes)
    this.calcResult.phenotypes.forEach((pheno, idx) => {
      const isTall = pheno === "Tall";
      const stemH = isTall ? 2.4 : 1.05;
      const x = 0.4 + idx * 1.1;

      const pot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.24, 0.45, 16),
        new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 })
      );
      pot.position.set(x, -1.5, 0);

      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.09, stemH, 12),
        new THREE.MeshStandardMaterial({ color: isTall ? 0x16a34a : 0x65a30d })
      );
      stem.position.set(x, -1.28 + stemH / 2, 0);
      stem.name = isTall ? "TallPeaPlant" : "DwarfPeaPlant";

      const crown = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 14, 14),
        new THREE.MeshStandardMaterial({ color: isTall ? 0x22c55e : 0x84cc16 })
      );
      crown.position.set(x, -1.28 + stemH, 0);

      this.dynamicGroup.add(pot, stem, crown);
    });
  }

  update(deltaTime: number): void {
    if (this.params.autoRotate) {
      this.dnaGroup.rotation.y += deltaTime * 0.75;
    }
  }

  getResults(): SimulationResult {
    const r = this.calcResult;
    return {
      metrics: {
        "Parent Cross": r.crossLabel,
        "Offspring Genotypes": r.genotypes.join(" | "),
        "Phenotypic Ratio": r.phenotypicRatio,
        "Genotypic Ratio": r.genotypicRatio,
        "Tall : Dwarf": `${r.tallCount} : ${r.dwarfCount}`,
      },
      summary: `${r.crossLabel} ⇒ ${r.phenotypicRatio} (${r.genotypicRatio})`,
      observations: [
        "Allele 'T' (Tall) is dominant over 't' (Dwarf); 'Tt' plants are phenotypically tall.",
        "Human sex determination: XX = female, XY = male (50% probability determined by father's chromosome).",
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
