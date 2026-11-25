import type { Simulation, SimulationConstructor } from "../types/simulation";

/**
 * Central registry mapping simulation keys (e.g. "mirror", "lens", "anatomy")
 * to Simulation implementations so the core engine stays decoupled from chapter physics.
 */
export class SimulationRegistry {
  private registry = new Map<string, SimulationConstructor>();

  register(id: string, ctor: SimulationConstructor): void {
    this.registry.set(id, ctor);
  }

  has(id: string): boolean {
    return this.registry.has(id);
  }

  create(id: string): Simulation {
    const Ctor = this.registry.get(id);
    if (!Ctor) {
      throw new Error(`Simulation "${id}" is not registered in SimulationRegistry.`);
    }
    return new Ctor();
  }

  list(): string[] {
    return Array.from(this.registry.keys());
  }
}

export const simulationRegistry = new SimulationRegistry();
