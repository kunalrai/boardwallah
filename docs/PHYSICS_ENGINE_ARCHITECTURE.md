# BoardWallah 3D Physics Engine Architecture

## Overview
The BoardWallah 3D Physics Engine is a modular, configuration-driven Three.js + TypeScript simulation system embedded directly into the BoardWallah Astro static site (`frontend/`). It keeps **rendering**, **scientific calculations**, **simulation logic**, and **lesson configurations** strictly separated.

```text
Astro Lesson Pages (frontend/src/pages/class-10/science/physics/*.astro)
        │
        ▼
Reusable Astro UI (frontend/src/components/physics3d/PhysicsViewer.astro)
        │  (Browser-only dynamic import — zero SSR DOM/WebGL access)
        ▼
PhysicsEngine (frontend/src/physics-engine/core/Engine.ts)
  ├── SceneManager        (Scene, lights, modelGroup, simulationGroup)
  ├── CameraManager       (PerspectiveCamera, OrbitControls, presets)
  ├── RendererManager     (WebGLRenderer, DPR cap, resize)
  ├── AssetManager        (GLB cache + ModelLoader/GLTFLoader)
  ├── AnimationManager    (AnimationMixer + programmatic timeline)
  ├── InteractionManager  (Pointer raycasting, click vs drag)
  ├── LabelManager        (Projected 2D/SVG leader-line badges)
  ├── MaterialManager     (Hover & selection emissive highlighting)
  ├── ResourceManager     (Geometry/material/texture disposal)
  └── EventManager        (Decoupled typed event bus)
        │
        ▼
SimulationRegistry ──► Simulation Implementations (Mirror, Lens, Anatomy)
        │
        ▼
Pure TypeScript Calculations (calculations/optics/*.ts)
```

## SSR Safety in Astro
- All `.astro` pages render static HTML, SEO metadata, and serialized JSON lesson configs at build time.
- Three.js (`three`, `OrbitControls`, `GLTFLoader`) is only imported inside `<script>` browser execution via dynamic `import()`.
- `window.addEventListener("pagehide", ...)` and `astro:before-swap` call `engine.dispose()` to cancel `requestAnimationFrame`, disconnect `ResizeObserver`, remove event listeners, and free GPU buffers.
