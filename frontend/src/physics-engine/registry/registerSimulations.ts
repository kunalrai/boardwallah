import { simulationRegistry } from "./SimulationRegistry";
import { MirrorSimulation } from "../simulations/optics/MirrorSimulation";
import { LensSimulation } from "../simulations/optics/LensSimulation";
import { RefractionSimulation } from "../simulations/optics/RefractionSimulation";
import { PrismSimulation } from "../simulations/optics/PrismSimulation";
import { CircuitSimulation } from "../simulations/electricity/CircuitSimulation";
import { MagneticFieldSimulation } from "../simulations/magnetism/MagneticFieldSimulation";
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
  simulationRegistry.register("refraction", RefractionSimulation);
  simulationRegistry.register("prism", PrismSimulation);
  simulationRegistry.register("electricity", CircuitSimulation);
  simulationRegistry.register("magnetism", MagneticFieldSimulation);
  simulationRegistry.register("anatomy", AnatomySimulation);
  registered = true;
}
