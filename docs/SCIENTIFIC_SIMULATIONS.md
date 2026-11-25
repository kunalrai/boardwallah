# Scientific Simulations Guide

## Architecture
Every simulation implements `Simulation` (`frontend/src/physics-engine/simulations/interfaces/Simulation.ts`):
- `initialize(context, initialParams)`
- `update(deltaTime, elapsedTime)`
- `setParameters(params): SimulationResult`
- `getResults(): SimulationResult`
- `reset()`
- `dispose()`

## Current Modules
1. **Optics — `MirrorSimulation` (`mirror`)**
   - Uses `calculateMirrorOptics()` (`calculations/optics/mirror.ts`).
   - Enforces New Cartesian Sign Convention ($u < 0$, convex $f > 0$, concave $f < 0$, $1/f = 1/v + 1/u$, $m = -v/u$).
   - Dynamically rebuilds 3D incident rays, reflected rays, virtual extensions, and image arrow height/position.
2. **Optics — `LensSimulation` (`lens`)**
   - Uses `calculateLensOptics()` (`calculations/optics/lens.ts`).
   - Enforces $1/f = 1/v - 1/u$, $m = v/u$, and optical power $P = 1 / f(\text{m})$ in Dioptres.
   - Supports all 6 convex-lens positions and concave-lens divergence.
3. **Anatomy — `AnatomySimulation` (`anatomy`)**
   - Supports cross-section cutaway toggling, ciliary accommodation lens scaling, incoming ray refraction onto the inverted retinal image, and optic nerve impulse animation.

## Adding a New Simulation Domain (e.g. Electricity / Magnetism)
1. Add pure math helpers under `frontend/src/physics-engine/calculations/<domain>/`.
2. Implement `Simulation` under `frontend/src/physics-engine/simulations/<domain>/`.
3. Register the class in `frontend/src/physics-engine/registry/registerSimulations.ts`.
