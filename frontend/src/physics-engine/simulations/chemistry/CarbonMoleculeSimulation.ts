import * as THREE from "three";
import type {
  Simulation,
  SimulationContext,
  SimulationParameters,
  SimulationResult,
} from "../interfaces/Simulation";
import {
  getCarbonMoleculeInfo,
  type CarbonMoleculeInfo,
  type MoleculeId,
} from "../../calculations/chemistry/chemistry";
import { clearGroupWithDispose } from "../optics/opticsVisuals";

/**
 * Interactive 3D Carbon & Its Compounds Ball-and-Stick Molecular Geometry Viewer.
 * Supports CH4 (Tetrahedral), C2H4 (Double Bond), C2H2 (Triple Bond),
 * Ethanol (-OH), Ethanoic Acid (-COOH), and Benzene (C6H6 ring).
 */
export class CarbonMoleculeSimulation implements Simulation {
  public readonly id = "chemistry-molecule";

  private context!: SimulationContext;
  private dynamicGroup = new THREE.Group();
  private moleculeRoot = new THREE.Group();
  private params: { molecule: MoleculeId; autoRotate: boolean } = {
    molecule: "methane",
    autoRotate: true,
  };
  private initialParams = { ...this.params };
  private info!: CarbonMoleculeInfo;

  initialize(context: SimulationContext, initialParams: SimulationParameters): void {
    this.context = context;
    this.dynamicGroup.name = "__ChemMoleculeGroup";
    this.context.simulationGroup.add(this.dynamicGroup);

    if (typeof initialParams.molecule === "string") {
      this.params.molecule = initialParams.molecule as MoleculeId;
    }
    if (typeof initialParams.autoRotate === "boolean") {
      this.params.autoRotate = initialParams.autoRotate;
    }
    this.initialParams = { ...this.params };
    this.rebuildVisuals();
  }

  setParameters(params: SimulationParameters): SimulationResult {
    let rebuild = false;
    if (typeof params.molecule === "string" && params.molecule !== this.params.molecule) {
      this.params.molecule = params.molecule as MoleculeId;
      rebuild = true;
    }
    if (typeof params.autoRotate === "boolean") {
      this.params.autoRotate = params.autoRotate;
    }
    if (rebuild) this.rebuildVisuals();
    return this.getResults();
  }

  private addAtom(pos: THREE.Vector3, element: "C" | "H" | "O"): void {
    const cfg =
      element === "C"
        ? { r: 0.42, color: 0x1e293b, name: "CarbonAtom" }
        : element === "O"
          ? { r: 0.38, color: 0xef4444, name: "OxygenAtom" }
          : { r: 0.25, color: 0xf8fafc, name: "HydrogenAtom" };

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(cfg.r, 24, 24),
      new THREE.MeshStandardMaterial({ color: cfg.color, roughness: 0.3, metalness: 0.1 })
    );
    mesh.position.copy(pos);
    mesh.name = cfg.name;
    this.moleculeRoot.add(mesh);
  }

  private addBond(a: THREE.Vector3, b: THREE.Vector3, order: 1 | 2 | 3 = 1): void {
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());

    // Perpendicular offset direction
    const perp = new THREE.Vector3(0, 0, 1);
    if (Math.abs(dir.clone().normalize().dot(perp)) > 0.9) perp.set(1, 0, 0);
    perp.crossVectors(dir, perp).normalize();

    const offsets =
      order === 1 ? [0] : order === 2 ? [-0.09, 0.09] : [-0.13, 0, 0.13];

    offsets.forEach((off) => {
      const cyl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.055, len, 12),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4 })
      );
      cyl.quaternion.copy(quat);
      cyl.position.copy(mid).addScaledVector(perp, off);
      cyl.name = order === 1 ? "SingleBond" : "MultipleBond";
      this.moleculeRoot.add(cyl);
    });
  }

  private rebuildVisuals(): void {
    clearGroupWithDispose(this.dynamicGroup);
    this.moleculeRoot = new THREE.Group();
    this.moleculeRoot.name = "MoleculeModel";
    this.dynamicGroup.add(this.moleculeRoot);

    this.info = getCarbonMoleculeInfo(this.params.molecule);

    if (this.params.molecule === "methane") {
      const c = new THREE.Vector3(0, 0, 0);
      this.addAtom(c, "C");
      const hPositions = [
        new THREE.Vector3(0, 1.35, 0),
        new THREE.Vector3(1.27, -0.45, 0),
        new THREE.Vector3(-0.64, -0.45, 1.1),
        new THREE.Vector3(-0.64, -0.45, -1.1),
      ];
      hPositions.forEach((h) => {
        this.addAtom(h, "H");
        this.addBond(c, h, 1);
      });
    } else if (this.params.molecule === "ethene") {
      const c1 = new THREE.Vector3(-0.75, 0, 0);
      const c2 = new THREE.Vector3(0.75, 0, 0);
      this.addAtom(c1, "C");
      this.addAtom(c2, "C");
      this.addBond(c1, c2, 2);
      const hs = [
        [c1, new THREE.Vector3(-1.45, 0.95, 0)],
        [c1, new THREE.Vector3(-1.45, -0.95, 0)],
        [c2, new THREE.Vector3(1.45, 0.95, 0)],
        [c2, new THREE.Vector3(1.45, -0.95, 0)],
      ];
      hs.forEach(([c, h]) => {
        this.addAtom(h, "H");
        this.addBond(c, h, 1);
      });
    } else if (this.params.molecule === "ethyne") {
      const c1 = new THREE.Vector3(-0.65, 0, 0);
      const c2 = new THREE.Vector3(0.65, 0, 0);
      const h1 = new THREE.Vector3(-1.85, 0, 0);
      const h2 = new THREE.Vector3(1.85, 0, 0);
      this.addAtom(c1, "C");
      this.addAtom(c2, "C");
      this.addAtom(h1, "H");
      this.addAtom(h2, "H");
      this.addBond(c1, c2, 3);
      this.addBond(c1, h1, 1);
      this.addBond(c2, h2, 1);
    } else if (this.params.molecule === "ethanol") {
      const c1 = new THREE.Vector3(-1.3, -0.2, 0);
      const c2 = new THREE.Vector3(0.1, 0.35, 0);
      const o = new THREE.Vector3(1.35, -0.25, 0);
      const ho = new THREE.Vector3(2.15, 0.35, 0);
      this.addAtom(c1, "C");
      this.addAtom(c2, "C");
      this.addAtom(o, "O");
      this.addAtom(ho, "H");
      this.addBond(c1, c2, 1);
      this.addBond(c2, o, 1);
      this.addBond(o, ho, 1);
      [
        [c1, new THREE.Vector3(-2.05, 0.55, 0.4)],
        [c1, new THREE.Vector3(-2.05, -0.95, 0.4)],
        [c1, new THREE.Vector3(-1.35, -0.35, -1.05)],
        [c2, new THREE.Vector3(0.1, 1.25, 0.65)],
        [c2, new THREE.Vector3(0.1, 1.25, -0.65)],
      ].forEach(([c, h]) => {
        this.addAtom(h, "H");
        this.addBond(c, h, 1);
      });
    } else if (this.params.molecule === "ethanoic-acid") {
      const c1 = new THREE.Vector3(-1.25, 0, 0);
      const c2 = new THREE.Vector3(0.25, 0.2, 0);
      const o1 = new THREE.Vector3(0.75, 1.45, 0);
      const o2 = new THREE.Vector3(1.25, -0.75, 0);
      const ho = new THREE.Vector3(2.15, -0.35, 0);
      this.addAtom(c1, "C");
      this.addAtom(c2, "C");
      this.addAtom(o1, "O");
      this.addAtom(o2, "O");
      this.addAtom(ho, "H");
      this.addBond(c1, c2, 1);
      this.addBond(c2, o1, 2);
      this.addBond(c2, o2, 1);
      this.addBond(o2, ho, 1);
      [
        new THREE.Vector3(-1.85, 0.9, 0.5),
        new THREE.Vector3(-1.85, -0.85, 0.5),
        new THREE.Vector3(-1.6, 0, -1.0),
      ].forEach((h) => {
        this.addAtom(h, "H");
        this.addBond(c1, h, 1);
      });
    } else {
      // Benzene C6H6 hexagonal ring
      const rC = 1.45;
      const rH = 2.45;
      const carbons: THREE.Vector3[] = [];
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const cPos = new THREE.Vector3(Math.cos(a) * rC, Math.sin(a) * rC, 0);
        const hPos = new THREE.Vector3(Math.cos(a) * rH, Math.sin(a) * rH, 0);
        carbons.push(cPos);
        this.addAtom(cPos, "C");
        this.addAtom(hPos, "H");
        this.addBond(cPos, hPos, 1);
      }
      for (let i = 0; i < 6; i++) {
        this.addBond(carbons[i], carbons[(i + 1) % 6], i % 2 === 0 ? 2 : 1);
      }
    }
  }

  update(deltaTime: number): void {
    if (this.params.autoRotate) {
      this.moleculeRoot.rotation.y += deltaTime * 0.45;
    }
  }

  getResults(): SimulationResult {
    return {
      metrics: {
        "IUPAC Name": this.info.name,
        "Molecular Formula": this.info.formula,
        "Homologous Series": this.info.series,
        "Functional Group": this.info.functionalGroup,
        "Total Covalent Bonds": this.info.covalentBondsCount,
        "3D Geometry": this.info.geometry,
      },
      summary: `${this.info.name} (${this.info.formula}) • ${this.info.geometry}`,
      observations: [
        `Carbon exhibits tetravalency (forms 4 covalent bonds) and catenation (self-linking into chains and rings).`,
        `Functional Group: ${this.info.functionalGroup}.`,
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
