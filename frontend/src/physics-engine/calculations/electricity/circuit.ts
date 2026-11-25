import { roundOptics } from "../optics/magnification";

export type CircuitTopology = "series" | "parallel";

export interface CircuitInput {
  voltageV: number;
  resistor1Ohm: number;
  resistor2Ohm: number;
  resistorCount: number; // 1, 2, or 3 (3rd resistor uses resistor2Ohm for clean UI or explicit)
  resistor3Ohm?: number;
  topology: CircuitTopology;
  switchClosed: boolean;
  timeSeconds?: number;
}

export interface CircuitCalculationResult {
  switchClosed: boolean;
  topology: CircuitTopology;
  voltageV: number;
  equivalentResistanceOhm: number;
  totalCurrentA: number;
  branchCurrentsA: number[];
  powerWatts: number;
  heatEnergyJoules: number;
}

/**
 * Computes DC circuit quantities obeying Ohm's Law (V = IR),
 * Series (Rs = R1 + R2 + ...), Parallel (1/Rp = 1/R1 + 1/R2 + ...),
 * Electric Power (P = V * I), and Joule's Heating (H = I^2 * R * t).
 */
export function calculateCircuit(input: CircuitInput): CircuitCalculationResult {
  const V = Math.max(0, Math.min(24, input.voltageV));
  const count = Math.max(1, Math.min(3, Math.round(input.resistorCount)));
  const resistors: number[] = [Math.max(1, input.resistor1Ohm)];
  if (count >= 2) resistors.push(Math.max(1, input.resistor2Ohm));
  if (count >= 3) resistors.push(Math.max(1, input.resistor3Ohm ?? input.resistor2Ohm));

  let req = resistors[0];
  if (count > 1) {
    if (input.topology === "series") {
      req = resistors.reduce((acc, r) => acc + r, 0);
    } else {
      const invSum = resistors.reduce((acc, r) => acc + 1 / r, 0);
      req = 1 / invSum;
    }
  }

  if (!input.switchClosed || V === 0) {
    return {
      switchClosed: input.switchClosed,
      topology: input.topology,
      voltageV: roundOptics(V, 2),
      equivalentResistanceOhm: roundOptics(req, 2),
      totalCurrentA: 0,
      branchCurrentsA: resistors.map(() => 0),
      powerWatts: 0,
      heatEnergyJoules: 0,
    };
  }

  const totalI = V / req;
  const branchCurrentsA =
    input.topology === "series" || count === 1
      ? resistors.map(() => roundOptics(totalI, 3))
      : resistors.map((r) => roundOptics(V / r, 3));

  const power = V * totalI;
  const time = Math.max(1, input.timeSeconds ?? 10);
  const heat = totalI * totalI * req * time;

  return {
    switchClosed: true,
    topology: input.topology,
    voltageV: roundOptics(V, 2),
    equivalentResistanceOhm: roundOptics(req, 2),
    totalCurrentA: roundOptics(totalI, 3),
    branchCurrentsA,
    powerWatts: roundOptics(power, 2),
    heatEnergyJoules: roundOptics(heat, 1),
  };
}
