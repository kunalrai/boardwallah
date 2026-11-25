import { simulationRegistry } from "./SimulationRegistry";
import { MirrorSimulation } from "../simulations/optics/MirrorSimulation";
import { LensSimulation } from "../simulations/optics/LensSimulation";
import { RefractionSimulation } from "../simulations/optics/RefractionSimulation";
import { PrismSimulation } from "../simulations/optics/PrismSimulation";
import { CircuitSimulation } from "../simulations/electricity/CircuitSimulation";
import { MagneticFieldSimulation } from "../simulations/magnetism/MagneticFieldSimulation";
import { AnatomySimulation } from "../simulations/anatomy/AnatomySimulation";
import { ChemicalReactionSimulation } from "../simulations/chemistry/ChemicalReactionSimulation";
import { PhLabSimulation } from "../simulations/chemistry/PhLabSimulation";
import { IonicBondSimulation } from "../simulations/chemistry/IonicBondSimulation";
import { CarbonMoleculeSimulation } from "../simulations/chemistry/CarbonMoleculeSimulation";
import { HeartCirculationSimulation } from "../simulations/biology/HeartCirculationSimulation";
import { NeuronSimulation } from "../simulations/biology/NeuronSimulation";
import { FlowerReproductionSimulation } from "../simulations/biology/FlowerReproductionSimulation";
import { HeredityGeneticsSimulation } from "../simulations/biology/HeredityGeneticsSimulation";
import { EcosystemPyramidSimulation } from "../simulations/biology/EcosystemPyramidSimulation";
import { NumberSystemAndAPSimulation } from "../simulations/maths/NumberSystemAndAPSimulation";
import { AlgebraGraphSimulation } from "../simulations/maths/AlgebraGraphSimulation";
import { GeometrySimulation } from "../simulations/maths/GeometrySimulation";
import { CoordinateSimulation } from "../simulations/maths/CoordinateSimulation";
import { TrigonometrySimulation } from "../simulations/maths/TrigonometrySimulation";
import { MensurationAndDataSimulation } from "../simulations/maths/MensurationAndDataSimulation";

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
  simulationRegistry.register("chemistry-reaction", ChemicalReactionSimulation);
  simulationRegistry.register("chemistry-ph", PhLabSimulation);
  simulationRegistry.register("chemistry-ionic", IonicBondSimulation);
  simulationRegistry.register("chemistry-molecule", CarbonMoleculeSimulation);
  simulationRegistry.register("biology-heart", HeartCirculationSimulation);
  simulationRegistry.register("biology-neuron", NeuronSimulation);
  simulationRegistry.register("biology-flower", FlowerReproductionSimulation);
  simulationRegistry.register("biology-heredity", HeredityGeneticsSimulation);
  simulationRegistry.register("biology-ecosystem", EcosystemPyramidSimulation);
  simulationRegistry.register("maths-number-ap", NumberSystemAndAPSimulation);
  simulationRegistry.register("maths-algebra", AlgebraGraphSimulation);
  simulationRegistry.register("maths-geometry", GeometrySimulation);
  simulationRegistry.register("maths-coordinate", CoordinateSimulation);
  simulationRegistry.register("maths-trigonometry", TrigonometrySimulation);
  simulationRegistry.register("maths-mensuration-data", MensurationAndDataSimulation);
  registered = true;
}
