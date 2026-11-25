import * as THREE from "three";
import type {
  Simulation,
  SimulationContext,
  SimulationParameters,
  SimulationResult,
} from "../interfaces/Simulation";
import { clearGroupWithDispose } from "../optics/opticsVisuals";

export type IonicCompoundId = "nacl-transfer" | "nacl-lattice" | "mgcl2-transfer";

/**
 * Interactive 3D Metals & Non-Metals Ionic Bonding & Crystal Lattice Simulation.
 */
export class IonicBondSimulation implements Simulation {
  public readonly id = "chemistry-ionic";

  private context!: SimulationContext;
  private dynamicGroup = new THREE.Group();
  private params: { compound: IonicCompoundId } = { compound: "nacl-transfer" };
  private initialParams = { ...this.params };
  private transferredElectron: THREE.Mesh | null = null;
  private latticeGroup: THREE.Group | null = null;
  private animProgress = 0;

  initialize(context: SimulationContext, initialParams: SimulationParameters): void {
    this.context = context;
    this.dynamicGroup.name = "__ChemIonicGroup";
    this.context.simulationGroup.add(this.dynamicGroup);
    if (
      initialParams.compound === "nacl-transfer" ||
      initialParams.compound === "nacl-lattice" ||
      initialParams.compound === "mgcl2-transfer"
    ) {
      this.params.compound = initialParams.compound;
    }
    this.initialParams = { ...this.params };
    this.rebuildVisuals();
  }

  setParameters(params: SimulationParameters): SimulationResult {
    if (
      params.compound === "nacl-transfer" ||
      params.compound === "nacl-lattice" ||
      params.compound === "mgcl2-transfer"
    ) {
      this.params.compound = params.compound;
      this.rebuildVisuals();
    }
    if (typeof params.__animationProgress === "number") {
      this.animProgress = params.__animationProgress;
    }
    return this.getResults();
  }

  private rebuildVisuals(): void {
    clearGroupWithDispose(this.dynamicGroup);
    this.transferredElectron = null;
    this.latticeGroup = null;

    if (this.params.compound === "nacl-lattice") {
      const grp = new THREE.Group();
      grp.name = "NaClLattice";
      const naGeo = new THREE.SphereGeometry(0.28, 18, 18);
      const naMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.3 });
      const clGeo = new THREE.SphereGeometry(0.42, 18, 18);
      const clMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3 });

      const spacing = 1.15;
      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          for (let z = -1; z <= 1; z++) {
            const isNa = (Math.abs(x + y + z) % 2) === 0;
            const ion = new THREE.Mesh(isNa ? naGeo : clGeo, isNa ? naMat : clMat);
            ion.position.set(x * spacing, y * spacing, z * spacing);
            ion.name = isNa ? "Cation_Metal" : "Anion_Chloride";
            grp.add(ion);
          }
        }
      }
      this.dynamicGroup.add(grp);
      this.latticeGroup = grp;
      return;
    }

    // Electron transfer view (Metal atom left, Chlorine atom right)
    const metalRadius = this.params.compound === "nacl-transfer" ? 0.65 : 0.6;
    const metalAtom = new THREE.Mesh(
      new THREE.SphereGeometry(metalRadius, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.3 })
    );
    metalAtom.position.set(-2.1, 0, 0);
    metalAtom.name = "Cation_Metal";

    const clAtom = new THREE.Mesh(
      new THREE.SphereGeometry(0.82, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3 })
    );
    clAtom.position.set(2.1, 0, 0);
    clAtom.name = "Anion_Chloride";

    // Valence orbit rings
    const ringGeo = new THREE.TorusGeometry(1.35, 0.025, 10, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
    const ringL = new THREE.Mesh(ringGeo, ringMat);
    ringL.position.set(-2.1, 0, 0);
    const ringR = new THREE.Mesh(ringGeo, ringMat);
    ringR.position.set(2.1, 0, 0);

    // Transferred valence electron
    const electron = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b })
    );
    electron.name = "ValenceElectron";
    electron.position.set(-0.75, 0, 0);
    this.transferredElectron = electron;

    this.dynamicGroup.add(metalAtom, clAtom, ringL, ringR, electron);
  }

  update(deltaTime: number, elapsedTime: number): void {
    if (this.latticeGroup) {
      this.latticeGroup.rotation.y += deltaTime * 0.35;
    }
    if (this.transferredElectron) {
      const t = ((elapsedTime * 0.4) + this.animProgress) % 1.0;
      // Arc from Metal valence shell (-0.75) to Chlorine valence shell (+0.75)
      const x = -0.75 + t * 1.5;
      const y = Math.sin(t * Math.PI) * 0.75;
      this.transferredElectron.position.set(x, y, 0);
    }
  }

  getResults(): SimulationResult {
    const isMg = this.params.compound === "mgcl2-transfer";
    const isLat = this.params.compound === "nacl-lattice";

    return {
      metrics: {
        "Compound": isMg ? "Magnesium Chloride (MgCl₂)" : "Sodium Chloride (NaCl)",
        "Bond Type": "Ionic / Electrovalent Bond",
        "Metal Cation": isMg ? "Mg²⁺ (2, 8)" : "Na⁺ (2, 8)",
        "Non-Metal Anion": "Cl⁻ (2, 8, 8)",
        "Melting Point": isMg ? "714 °C" : "801 °C",
        "State": isLat ? "3D Crystalline Solid" : "Electron Transfer Formation",
      },
      summary: isMg
        ? "Mg (2,8,2) loses 2 electrons to two Cl (2,8,7) atoms → Mg²⁺ + 2Cl⁻"
        : "Na (2,8,1) transfers 1 valence electron to Cl (2,8,7) → Na⁺Cl⁻",
      observations: [
        "Strong electrostatic forces of attraction hold oppositely charged cations and anions in a rigid crystal lattice.",
        "Ionic compounds conduct electricity in molten state or aqueous solution (due to free mobile ions), not in solid state.",
      ],
    };
  }

  reset(): void {
    this.params = { ...this.initialParams };
    this.rebuildVisuals();
  }

  dispose(): void {
    clearGroupWithDispose(this.dynamicGroup);
    this.transferredElectron = null;
    this.latticeGroup = null;
  }
}
