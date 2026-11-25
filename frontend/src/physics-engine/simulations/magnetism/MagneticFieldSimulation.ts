import * as THREE from "three";
import type {
  Simulation,
  SimulationContext,
  SimulationParameters,
  SimulationResult,
} from "../interfaces/Simulation";
import {
  calculateMagneticField,
  type MagneticFieldResult,
  type MagnetismMode,
} from "../../calculations/magnetism/magnetic-field";
import { clearGroupWithDispose } from "../optics/opticsVisuals";

/**
 * Interactive 3D Magnetism & Electromagnetism Simulation.
 * Supports:
 * 1. Straight current-carrying conductor (Right-Hand Thumb Rule concentric rings)
 * 2. Solenoid electromagnet (uniform interior field + N/S poles)
 * 3. Force on a current-carrying conductor in a magnetic field (Fleming's Left-Hand Rule)
 */
export class MagneticFieldSimulation implements Simulation {
  public readonly id = "magnetism";

  private context!: SimulationContext;
  private dynamicGroup = new THREE.Group();
  private params: {
    mode: MagnetismMode;
    currentA: number;
    turnsCount: number;
  } = {
    mode: "straight-wire",
    currentA: 4,
    turnsCount: 10,
  };
  private initialParams = { ...this.params };
  private calcResult!: MagneticFieldResult;
  private animatedRingTokens: { radius: number; y: number; mesh: THREE.Mesh; offset: number }[] = [];
  private deflectingRod: THREE.Mesh | null = null;
  private animProgress = 0;

  initialize(context: SimulationContext, initialParams: SimulationParameters): void {
    this.context = context;
    this.dynamicGroup.name = "__MagnetismDynamicGroup";
    this.context.simulationGroup.add(this.dynamicGroup);
    this.applyParams(initialParams);
    this.initialParams = { ...this.params };
    this.rebuildVisuals();
  }

  private applyParams(params: SimulationParameters): void {
    if (
      params.mode === "straight-wire" ||
      params.mode === "solenoid" ||
      params.mode === "fleming-force"
    ) {
      this.params.mode = params.mode;
    }
    if (typeof params.currentA === "number") {
      this.params.currentA = Math.max(-10, Math.min(10, params.currentA));
    }
    if (typeof params.turnsCount === "number") {
      this.params.turnsCount = Math.max(4, Math.min(18, Math.round(params.turnsCount)));
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
    this.animatedRingTokens = [];
    this.deflectingRod = null;

    this.calcResult = calculateMagneticField(this.params);

    if (this.params.mode === "straight-wire") {
      this.buildStraightWireScene();
    } else if (this.params.mode === "solenoid") {
      this.buildSolenoidScene();
    } else {
      this.buildFlemingForceScene();
    }
  }

  private buildStraightWireScene(): void {
    // Horizontal cardboard plane
    const plane = new THREE.Mesh(
      new THREE.BoxGeometry(5.6, 0.12, 5.6),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.75 })
    );
    plane.name = "CardboardPlane";
    this.dynamicGroup.add(plane);

    // Vertical copper conductor
    const wire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.11, 5.4, 20),
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.6, roughness: 0.3 })
    );
    wire.name = "StraightConductor";
    this.dynamicGroup.add(wire);

    if (Math.abs(this.params.currentA) < 0.05) return;

    // Concentric magnetic field rings around wire (spacing decreases near wire to show stronger B)
    const radii = [0.75, 1.35, 2.15];
    radii.forEach((r, idx) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.028, 10, 48),
        new THREE.MeshBasicMaterial({ color: 0x1a73e8 })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.1;
      ring.name = "MagneticFieldLines";
      this.dynamicGroup.add(ring);

      const token = new THREE.Mesh(
        new THREE.SphereGeometry(0.085, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xea580c })
      );
      this.dynamicGroup.add(token);
      this.animatedRingTokens.push({ radius: r, y: 0.1, mesh: token, offset: idx * 0.33 });
    });
  }

  private buildSolenoidScene(): void {
    // Helical copper solenoid coils
    const turns = this.params.turnsCount;
    const length = 5.2;
    const radius = 1.05;
    const pts: THREE.Vector3[] = [];
    const totalPts = turns * 18;
    for (let i = 0; i <= totalPts; i++) {
      const t = i / totalPts;
      const angle = t * turns * Math.PI * 2;
      const x = -length / 2 + t * length;
      pts.push(new THREE.Vector3(x, Math.cos(angle) * radius, Math.sin(angle) * radius));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const coilMesh = new THREE.Mesh(
      new THREE.TubeGeometry(curve, totalPts, 0.065, 8, false),
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.65, roughness: 0.25 })
    );
    coilMesh.name = "SolenoidCoil";
    this.dynamicGroup.add(coilMesh);

    if (Math.abs(this.params.currentA) < 0.05) return;

    // Uniform parallel interior field lines
    [-0.45, 0, 0.45].forEach((yOff) => {
      const lineGeo = new THREE.CylinderGeometry(0.025, 0.025, 7.6, 8);
      lineGeo.rotateZ(Math.PI / 2);
      const line = new THREE.Mesh(lineGeo, new THREE.MeshBasicMaterial({ color: 0x1a73e8 }));
      line.position.set(0, yOff, 0);
      line.name = "MagneticFieldLines";
      this.dynamicGroup.add(line);
    });
  }

  private buildFlemingForceScene(): void {
    // Horseshoe Magnet Poles: North (top, red) & South (bottom, blue) -> B points Downward (-Y)
    const northPole = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.65, 2.2),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 })
    );
    northPole.position.set(0, 1.85, 0);
    northPole.name = "NorthPole";

    const southPole = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.65, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.4 })
    );
    southPole.position.set(0, -1.85, 0);
    southPole.name = "SouthPole";

    // Deflecting copper rod along X-axis
    const rod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.11, 4.4, 20),
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.65, roughness: 0.25 })
    );
    rod.rotation.z = Math.PI / 2;
    rod.name = "DeflectingConductor";
    this.deflectingRod = rod;

    this.dynamicGroup.add(northPole, southPole, rod);
  }

  update(_deltaTime: number, elapsedTime: number): void {
    const absI = Math.abs(this.params.currentA);
    if (absI < 0.05) return;

    const sign = this.params.currentA >= 0 ? 1 : -1;
    if (this.params.mode === "straight-wire") {
      const speed = Math.max(0.25, absI * 0.18);
      for (const item of this.animatedRingTokens) {
        const angle = sign * (elapsedTime * speed * Math.PI * 2 + item.offset * Math.PI * 2 + this.animProgress * Math.PI * 2);
        item.mesh.position.set(
          Math.cos(angle) * item.radius,
          item.y,
          -Math.sin(angle) * item.radius
        );
      }
    } else if (this.params.mode === "fleming-force" && this.deflectingRod) {
      const amp = Math.min(1.3, absI * 0.13) * sign;
      const pulse = 0.65 + 0.35 * Math.sin(elapsedTime * 3.0);
      this.deflectingRod.position.z = amp * pulse;
    }
  }

  getResults(): SimulationResult {
    const r = this.calcResult;
    return {
      metrics: {
        "Experiment Mode": r.mode,
        "Current (I)": `${r.currentA} A (${r.currentDirectionLabel})`,
        "Field / Force Magnitude":
          r.mode === "straight-wire"
            ? `${r.relativeFieldStrength} µT (at 5 cm)`
            : r.mode === "solenoid"
              ? `${r.relativeFieldStrength} mT`
              : `${r.relativeFieldStrength} N`,
        "Solenoid Polarity": r.solenoidPolarity,
      },
      summary: `${r.fieldDirectionDescription}${r.mode === "fleming-force" ? " • " + r.forceDirectionDescription : ""}`,
      observations: [
        r.fieldDirectionDescription,
        r.mode === "fleming-force"
          ? r.forceDirectionDescription
          : "Reversing the current immediately reverses the magnetic field direction.",
      ],
    };
  }

  reset(): void {
    this.params = { ...this.initialParams };
    this.rebuildVisuals();
  }

  dispose(): void {
    clearGroupWithDispose(this.dynamicGroup);
    this.animatedRingTokens = [];
    this.deflectingRod = null;
  }
}
