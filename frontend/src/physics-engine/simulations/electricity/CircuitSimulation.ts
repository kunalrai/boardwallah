import * as THREE from "three";
import type {
  Simulation,
  SimulationContext,
  SimulationParameters,
  SimulationResult,
} from "../interfaces/Simulation";
import {
  calculateCircuit,
  type CircuitCalculationResult,
  type CircuitTopology,
} from "../../calculations/electricity/circuit";
import { clearGroupWithDispose } from "../optics/opticsVisuals";

/**
 * Interactive 3D DC Electric Circuit Simulation.
 * Supports Battery, Switch, Ammeter, Voltmeter, Bulb (dynamic glow),
 * 1–3 Resistors in Series or Parallel, and animated charge carriers proportional to I.
 */
export class CircuitSimulation implements Simulation {
  public readonly id = "electricity";

  private context!: SimulationContext;
  private dynamicGroup = new THREE.Group();
  private params: {
    voltageV: number;
    resistor1Ohm: number;
    resistor2Ohm: number;
    resistorCount: number;
    topology: CircuitTopology;
    switchClosed: boolean;
  } = {
    voltageV: 12,
    resistor1Ohm: 4,
    resistor2Ohm: 6,
    resistorCount: 2,
    topology: "series",
    switchClosed: true,
  };
  private initialParams = { ...this.params };
  private calcResult!: CircuitCalculationResult;
  private chargeCarriers: { path: THREE.Vector3[]; mesh: THREE.Mesh; offset: number }[] = [];
  private animProgress = 0;

  initialize(context: SimulationContext, initialParams: SimulationParameters): void {
    this.context = context;
    this.dynamicGroup.name = "__CircuitDynamicGroup";
    this.context.simulationGroup.add(this.dynamicGroup);
    this.applyParams(initialParams);
    this.initialParams = { ...this.params };
    this.rebuildVisuals();
  }

  private applyParams(params: SimulationParameters): void {
    if (typeof params.voltageV === "number") {
      this.params.voltageV = Math.max(0, Math.min(24, params.voltageV));
    }
    if (typeof params.resistor1Ohm === "number") {
      this.params.resistor1Ohm = Math.max(1, Math.min(30, params.resistor1Ohm));
    }
    if (typeof params.resistor2Ohm === "number") {
      this.params.resistor2Ohm = Math.max(1, Math.min(30, params.resistor2Ohm));
    }
    if (typeof params.resistorCount === "number") {
      this.params.resistorCount = Math.max(1, Math.min(3, Math.round(params.resistorCount)));
    }
    if (params.topology === "series" || params.topology === "parallel") {
      this.params.topology = params.topology;
    }
    if (typeof params.switchClosed === "boolean") {
      this.params.switchClosed = params.switchClosed;
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
    this.chargeCarriers = [];

    this.calcResult = calculateCircuit(this.params);

    // Base insulated circuit board
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(9.6, 0.25, 6.2),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 })
    );
    board.position.set(0, -0.35, 0);
    this.dynamicGroup.add(board);

    // 1. Battery Pack (left side, x = -3.8, z = 0)
    const battery = new THREE.Group();
    battery.name = "Battery";
    const cellBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.7, 1.8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 })
    );
    const posTerminal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.25, 16),
      new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.4 })
    );
    posTerminal.position.set(0, 0.45, -0.55);
    const negTerminal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.25, 16),
      new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.4 })
    );
    negTerminal.position.set(0, 0.45, 0.55);
    battery.add(cellBody, posTerminal, negTerminal);
    battery.position.set(-3.8, 0.15, 0);
    this.dynamicGroup.add(battery);

    // 2. Switch (bottom-left, x = -1.6, z = 2.2)
    const switchGrp = new THREE.Group();
    switchGrp.name = "Switch";
    const swBase = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.16, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x334155 })
    );
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.08, 0.1),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7 })
    );
    blade.position.set(0, 0.18, 0);
    if (!this.params.switchClosed) {
      blade.rotation.z = 0.55;
      blade.position.y = 0.36;
    }
    switchGrp.add(swBase, blade);
    switchGrp.position.set(-1.6, -0.1, 2.2);
    this.dynamicGroup.add(switchGrp);

    // 3. Ammeter (in series on top wire, x = -1.4, z = -2.2)
    const ammeter = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.55, 0.35, 24),
      new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.35 })
    );
    ammeter.name = "Ammeter";
    ammeter.position.set(-1.4, 0.05, -2.2);
    this.dynamicGroup.add(ammeter);

    // 4. Indicator Bulb (right side, x = 3.8, z = 0) with dynamic emissive intensity
    const bulbGrp = new THREE.Group();
    bulbGrp.name = "Bulb";
    const glowFactor = this.calcResult.switchClosed
      ? Math.min(1.0, this.calcResult.powerWatts / 36)
      : 0;
    const glassBulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.52, 24, 24),
      new THREE.MeshStandardMaterial({
        color: glowFactor > 0.05 ? 0xfef08a : 0xcbd5e1,
        emissive: 0xf59e0b,
        emissiveIntensity: glowFactor * 1.4,
        transparent: true,
        opacity: 0.85,
      })
    );
    glassBulb.position.y = 0.45;
    const bulbSocket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.32, 0.35, 18),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6 })
    );
    bulbGrp.add(glassBulb, bulbSocket);
    bulbGrp.position.set(3.8, 0.0, 0);
    this.dynamicGroup.add(bulbGrp);

    // 5. Resistors (1, 2, or 3) along top/middle branches
    const resistorPositions: THREE.Vector3[] = [];
    if (this.params.topology === "series" || this.params.resistorCount === 1) {
      const startX = 0.2;
      const stepX = 1.45;
      for (let i = 0; i < this.params.resistorCount; i++) {
        resistorPositions.push(new THREE.Vector3(startX + i * stepX, 0.05, -2.2));
      }
    } else {
      const zOffsets = this.params.resistorCount === 2 ? [-2.2, -0.7] : [-2.4, -1.2, 0.0];
      zOffsets.forEach((z) => resistorPositions.push(new THREE.Vector3(1.2, 0.05, z)));
    }

    resistorPositions.forEach((pos, idx) => {
      const resMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 0.95, 16),
        new THREE.MeshStandardMaterial({ color: idx === 0 ? 0xd97706 : 0xb45309, roughness: 0.45 })
      );
      resMesh.rotation.z = Math.PI / 2;
      resMesh.position.copy(pos);
      resMesh.name = `Resistor_${idx + 1}`;
      this.dynamicGroup.add(resMesh);
    });

    // 6. Voltmeter across resistor network
    const voltmeter = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 0.32, 24),
      new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.35 })
    );
    voltmeter.name = "Voltmeter";
    voltmeter.position.set(1.2, 0.05, 1.15);
    this.dynamicGroup.add(voltmeter);

    // 7. Copper Wire Loop
    const mainLoop: THREE.Vector3[] = [
      new THREE.Vector3(-3.8, 0.05, -2.2),
      new THREE.Vector3(3.8, 0.05, -2.2),
      new THREE.Vector3(3.8, 0.05, 2.2),
      new THREE.Vector3(-3.8, 0.05, 2.2),
      new THREE.Vector3(-3.8, 0.05, -2.2),
    ];
    this.addWireTube(mainLoop, 0xd97706);

    if (this.params.topology === "parallel" && this.params.resistorCount > 1) {
      resistorPositions.slice(1).forEach((pos) => {
        this.addWireTube(
          [
            new THREE.Vector3(-0.2, 0.05, -2.2),
            new THREE.Vector3(-0.2, 0.05, pos.z),
            new THREE.Vector3(2.6, 0.05, pos.z),
            new THREE.Vector3(2.6, 0.05, -2.2),
          ],
          0xd97706
        );
      });
    }

    // Animated electrons / current carriers when switch is closed
    if (this.calcResult.switchClosed && this.calcResult.totalCurrentA > 0) {
      const carrierGeo = new THREE.SphereGeometry(0.09, 10, 10);
      const carrierMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const count = 12;
      for (let i = 0; i < count; i++) {
        const mesh = new THREE.Mesh(carrierGeo, carrierMat);
        this.dynamicGroup.add(mesh);
        this.chargeCarriers.push({ path: mainLoop, mesh, offset: i / count });
      }
    }
  }

  private addWireTube(points: THREE.Vector3[], color: number): void {
    const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.04);
    const geo = new THREE.TubeGeometry(curve, 32, 0.045, 8, false);
    const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.6, roughness: 0.3 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = "ConnectingWire";
    this.dynamicGroup.add(mesh);
  }

  update(_deltaTime: number, elapsedTime: number): void {
    if (!this.calcResult.switchClosed || this.chargeCarriers.length === 0) return;
    const speedFactor = Math.max(0.15, Math.min(1.6, this.calcResult.totalCurrentA * 0.14));
    const baseT = (elapsedTime * speedFactor + this.animProgress) % 1.0;

    for (const carrier of this.chargeCarriers) {
      const t = (baseT + carrier.offset) % 1.0;
      const segs = carrier.path.length - 1;
      const scaled = t * segs;
      const idx = Math.min(segs - 1, Math.floor(scaled));
      carrier.mesh.position.lerpVectors(
        carrier.path[idx],
        carrier.path[idx + 1],
        scaled - idx
      );
    }
  }

  getResults(): SimulationResult {
    const r = this.calcResult;
    return {
      metrics: {
        "Switch State": r.switchClosed ? "CLOSED (ON)" : "OPEN (OFF)",
        "Topology": r.topology === "series" ? "Series" : "Parallel",
        "Supply Voltage (V)": `${r.voltageV} V`,
        "Equivalent R_eq": `${r.equivalentResistanceOhm} Ω`,
        "Total Current (I)": `${r.totalCurrentA} A`,
        "Electric Power (P)": `${r.powerWatts} W`,
        "Heat (H in 10s)": `${r.heatEnergyJoules} J`,
      },
      summary: r.switchClosed
        ? `V = ${r.voltageV} V • R_eq = ${r.equivalentResistanceOhm} Ω • Current I = ${r.totalCurrentA} A • Power = ${r.powerWatts} W`
        : "Circuit is OPEN — current I = 0 A",
      observations: [
        r.topology === "series"
          ? `Series combination increases equivalent resistance (R_s = ΣRᵢ = ${r.equivalentResistanceOhm} Ω); same current flows through every resistor.`
          : `Parallel combination decreases equivalent resistance (1/R_p = Σ1/Rᵢ ⇒ R_p = ${r.equivalentResistanceOhm} Ω); branch currents = [${r.branchCurrentsA.join(", ")}] A.`,
        `Ohm's Law verified: I = V / R_eq = ${r.voltageV} / ${r.equivalentResistanceOhm} = ${r.totalCurrentA} A.`,
      ],
    };
  }

  reset(): void {
    this.params = { ...this.initialParams };
    this.rebuildVisuals();
  }

  dispose(): void {
    clearGroupWithDispose(this.dynamicGroup);
    this.chargeCarriers = [];
  }
}
