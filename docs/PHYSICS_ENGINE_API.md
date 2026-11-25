# PhysicsEngine TypeScript API Reference

## `PhysicsEngine` (`frontend/src/physics-engine/core/Engine.ts`)
- `new PhysicsEngine(container: HTMLElement, lesson: PhysicsLessonConfig, callbacks?: EngineCallbacks)`
- `async loadLesson(lesson: PhysicsLessonConfig): Promise<void>`
- `selectObject(meshName: string | null): void`
- `setObjectVisibility(meshName: string, visible: boolean): void`
- `updateParameters(params: SimulationParameters): SimulationResult | null`
- `resetSimulation(): void`
- `play() / pause() / togglePlay() / restartAnimation()`
- `setPlaybackSpeed(speed: number)`
- `scrubAnimation(timeSeconds: number)`
- `selectAnimationClip(clipId: string)`
- `resetCamera() / zoomIn() / zoomOut() / applyCameraPreset(presetId: string)`
- `setLabelsVisible(visible: boolean) / toggleLabels(): boolean`
- `dispose(): void`

## `SimulationRegistry` (`frontend/src/physics-engine/registry/SimulationRegistry.ts`)
- `simulationRegistry.register(id: string, ctor: SimulationConstructor): void`
- `simulationRegistry.create(id: string): Simulation`
- `simulationRegistry.has(id: string): boolean`
