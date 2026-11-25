import { simulationRegistry } from "./SimulationRegistry";
import { MirrorSimulation } from "../simulations/optics/MirrorSimulation";
import { LensSimulation } from "../simulations/optics/LensSimulation";
import { AnatomySimulation } from "../simulations/anatomy/AnatomySimulation";

let registered = false;

/**
 * Registers all built-in scientific simulations into the central SimulationRegistry.
 * Safe to call multiple times (idempotent).
 */
export function registerDefaultSimulations(): void {
  if (registered) return;
  simulationRegistry.register("mirror", MirrorSimulation);
  simulationRegistry.register("lens", LensSimulation);
  simulationRegistry.register("anatomy", AnatomySimulation);
  registered = true;
}
