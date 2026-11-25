import * as THREE from "three";
import { SceneManager } from "./SceneManager";
import { CameraManager } from "./CameraManager";
import { RendererManager } from "./RendererManager";
import { AssetManager } from "./AssetManager";
import { AnimationManager } from "./AnimationManager";
import { InteractionManager } from "./InteractionManager";
import { LabelManager } from "./LabelManager";
import { MaterialManager } from "./MaterialManager";
import { EventManager } from "./EventManager";
import { ResourceManager } from "./ResourceManager";
import type {
  CameraPreset,
  EngineCallbacks,
  LabelDefinition,
} from "../types/engine";
import type { PhysicsLessonConfig } from "../types/lesson";
import type { Simulation, SimulationParameters, SimulationResult } from "../types/simulation";
import { simulationRegistry } from "../registry/SimulationRegistry";

/**
 * BoardWallah Reusable 3D Physics Engine.
 * Orchestrates WebGL rendering, GLTF asset loading, OrbitControls, raycasting,
 * 2D/3D labels, animation playback, and pluggable scientific simulations.
 */
export class PhysicsEngine {
  private container: HTMLElement;
  private callbacks: EngineCallbacks;

  public readonly events = new EventManager();
  private resources = new ResourceManager();
  private sceneManager: SceneManager;
  private cameraManager: CameraManager;
  private rendererManager: RendererManager;
  private assetManager = new AssetManager();
  private animationManager = new AnimationManager();
  private interactionManager: InteractionManager;
  private labelManager: LabelManager;
  private materialManager = new MaterialManager();

  private activeSimulation: Simulation | null = null;
  private modelRoot: THREE.Object3D | null = null;
  private cameraPresets: CameraPreset[] = [];

  private selectedMeshName: string | null = null;
  private hoveredMeshName: string | null = null;

  private rafId: number | null = null;
  private clock = new THREE.Clock();
  private resizeObserver: ResizeObserver | null = null;
  private disposed = false;

  constructor(
    container: HTMLElement,
    lesson: PhysicsLessonConfig,
    callbacks: EngineCallbacks = {}
  ) {
    this.container = container;
    this.callbacks = callbacks;
    this.cameraPresets = lesson.cameraPresets ?? [];

    if (!this.isWebGLAvailable()) {
      const msg = "WebGL is unavailable or disabled on this device. Showing static fallback.";
      this.callbacks.onWebGLError?.(msg);
      throw new Error(msg);
    }

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 420;

    this.sceneManager = new SceneManager(lesson.sceneConfig);
    this.rendererManager = new RendererManager(container);
    this.cameraManager = new CameraManager(
      this.rendererManager.renderer.domElement,
      width,
      height,
      lesson.sceneConfig
    );

    this.labelManager = new LabelManager(container, (meshName) => {
      this.selectObject(meshName);
    });

    this.interactionManager = new InteractionManager(
      this.rendererManager.renderer.domElement,
      this.cameraManager.camera,
      () => this.getInteractableRoot(),
      {
        onSelect: (meshName) => this.selectObject(meshName),
        onHover: (meshName) => this.hoverObject(meshName),
      }
    );

    this.setupResizeHandling();
    this.startLoop();
  }

  private isWebGLAvailable(): boolean {
    if (typeof window === "undefined" || typeof document === "undefined") return false;
    try {
      const canvas = document.createElement("canvas");
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
    } catch {
      return false;
    }
  }

  private getInteractableRoot(): THREE.Object3D | null {
    // Prefer simulationGroup if it contains named interactable meshes, otherwise modelGroup
    if (this.modelRoot) return this.modelRoot;
    return this.sceneManager.simulationGroup;
  }

  async loadLesson(lesson: PhysicsLessonConfig): Promise<void> {
    if (this.disposed) return;

    this.callbacks.onLoadStart?.();
    this.clearCurrentLesson();
    this.cameraPresets = lesson.cameraPresets ?? [];
    this.cameraManager.updateConfig(lesson.sceneConfig);
    if (lesson.sceneConfig?.backgroundColor !== undefined) {
      this.sceneManager.setBackground(lesson.sceneConfig.backgroundColor);
    }

    // Respect prefers-reduced-motion
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      this.animationManager.pause();
    }

    let loadedMeshNames: string[] = [];

    if (lesson.model) {
      try {
        const loaded = await this.assetManager.getModel(lesson.model, (pct) => {
          this.callbacks.onLoadProgress?.(pct);
        });
        if (this.disposed) return;

        this.modelRoot = loaded.scene;
        this.sceneManager.modelGroup.add(this.modelRoot);
        this.resources.track(this.modelRoot);
        loadedMeshNames = loaded.meshNames;

        this.animationManager.bindModel(
          this.modelRoot,
          loaded.animations,
          lesson.animationClips ?? []
        );
      } catch (err) {
        // Non-fatal if simulation provides procedural geometry fallback; report if no simulation
        console.warn(`[PhysicsEngine] Could not load GLB "${lesson.model}", checking simulation procedural fallback:`, err);
        this.animationManager.setConfigsOnly(lesson.animationClips ?? []);
        if (!simulationRegistry.has(lesson.simulation)) {
          const error = err instanceof Error ? err : new Error(String(err));
          this.callbacks.onLoadError?.(error);
          return;
        }
      }
    } else {
      this.animationManager.setConfigsOnly(lesson.animationClips ?? []);
    }

    // Initialize registered scientific simulation
    if (simulationRegistry.has(lesson.simulation)) {
      this.activeSimulation = simulationRegistry.create(lesson.simulation);
      this.activeSimulation.initialize(
        {
          scene: this.sceneManager.scene,
          simulationGroup: this.sceneManager.simulationGroup,
          modelRoot: this.modelRoot,
          getMeshByName: (name: string) => this.findObjectByName(name),
          highlightMesh: (name: string | null) => this.selectObject(name),
        },
        lesson.parameters
      );

      // If simulation created procedural meshes inside simulationGroup, track them
      this.resources.track(this.sceneManager.simulationGroup);
      if (!this.modelRoot && this.sceneManager.simulationGroup.children.length > 0) {
        this.modelRoot = this.sceneManager.simulationGroup;
        this.modelRoot.traverse((obj) => {
          if (obj.name && !obj.name.startsWith("__") && !loadedMeshNames.includes(obj.name)) {
            loadedMeshNames.push(obj.name);
          }
        });
      }

      const initialResult = this.activeSimulation.getResults();
      this.callbacks.onSimulationUpdate?.(initialResult as unknown as Record<string, unknown>);
    }

    // Configure labels from lesson objects
    const labelDefs: LabelDefinition[] = lesson.objects.map((obj) => ({
      id: obj.id,
      meshName: obj.meshName,
      title: obj.name,
      shortNote: obj.description,
      offset: obj.labelOffset,
      visible: lesson.features.labels,
    }));
    this.labelManager.setLabels(labelDefs);
    this.labelManager.setVisible(lesson.features.labels);

    this.callbacks.onLoadProgress?.(100);
    this.callbacks.onLoadComplete?.(loadedMeshNames);
  }

  private findObjectByName(name: string): THREE.Object3D | null {
    return (
      this.sceneManager.modelGroup.getObjectByName(name) ||
      this.sceneManager.simulationGroup.getObjectByName(name) ||
      null
    );
  }

  private clearCurrentLesson(): void {
    if (this.activeSimulation) {
      this.activeSimulation.dispose();
      this.activeSimulation = null;
    }
    this.animationManager.dispose();
    this.materialManager.dispose();
    this.labelManager.clear();

    this.sceneManager.modelGroup.clear();
    this.sceneManager.simulationGroup.clear();
    this.resources.disposeAll();

    this.modelRoot = null;
    this.selectedMeshName = null;
    this.hoveredMeshName = null;
  }

  selectObject(meshName: string | null): void {
    this.selectedMeshName = meshName;
    this.materialManager.updateHighlight(
      this.getInteractableRoot(),
      this.selectedMeshName,
      this.hoveredMeshName
    );
    this.labelManager.setSelectedMesh(meshName);
    this.callbacks.onObjectSelected?.(meshName);
    this.events.emit("objectSelected", meshName);
  }

  private hoverObject(meshName: string | null): void {
    this.hoveredMeshName = meshName;
    this.materialManager.updateHighlight(
      this.getInteractableRoot(),
      this.selectedMeshName,
      this.hoveredMeshName
    );
    this.callbacks.onObjectHovered?.(meshName);
  }

  setObjectVisibility(meshName: string, visible: boolean): void {
    const obj = this.findObjectByName(meshName);
    if (obj) {
      obj.visible = visible;
    }
  }

  updateParameters(params: SimulationParameters): SimulationResult | null {
    if (!this.activeSimulation) return null;
    const result = this.activeSimulation.setParameters(params);
    this.callbacks.onSimulationUpdate?.(result as unknown as Record<string, unknown>);
    this.events.emit("simulationUpdated", result);
    return result;
  }

  resetSimulation(): void {
    if (!this.activeSimulation) return;
    this.activeSimulation.reset();
    const result = this.activeSimulation.getResults();
    this.callbacks.onSimulationUpdate?.(result as unknown as Record<string, unknown>);
  }

  // ── Animation Controls ──
  play(): void {
    this.animationManager.play();
  }

  pause(): void {
    this.animationManager.pause();
  }

  togglePlay(): boolean {
    return this.animationManager.togglePlay();
  }

  restartAnimation(): void {
    this.animationManager.restart();
  }

  setPlaybackSpeed(speed: number): void {
    this.animationManager.setSpeed(speed);
  }

  scrubAnimation(timeSeconds: number): void {
    this.animationManager.scrubTo(timeSeconds);
    // Pass normalized timeline to simulation if it supports timeline parameter
    if (this.activeSimulation) {
      this.activeSimulation.setParameters({
        __animationProgress: this.animationManager.getNormalizedProgress(),
      });
    }
  }

  selectAnimationClip(clipId: string): void {
    this.animationManager.selectClip(clipId);
    if (this.activeSimulation) {
      this.activeSimulation.setParameters({
        __activeClip: clipId,
      });
    }
  }

  // ── Camera & Label Controls ──
  resetCamera(): void {
    this.cameraManager.resetCamera();
  }

  zoomIn(): void {
    this.cameraManager.zoomBy(0.82);
  }

  zoomOut(): void {
    this.cameraManager.zoomBy(1.22);
  }

  applyCameraPreset(presetId: string): void {
    const preset = this.cameraPresets.find((p) => p.id === presetId);
    if (preset) {
      this.cameraManager.applyPreset(preset);
    }
  }

  setLabelsVisible(visible: boolean): void {
    this.labelManager.setVisible(visible);
  }

  toggleLabels(): boolean {
    const next = !this.labelManager.getVisible();
    this.labelManager.setVisible(next);
    return next;
  }

  private setupResizeHandling(): void {
    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => {
        this.handleResize();
      });
      this.resizeObserver.observe(this.container);
    }
    if (typeof window !== "undefined") {
      window.addEventListener("resize", this.handleResize);
    }
  }

  private handleResize = (): void => {
    if (this.disposed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width > 0 && height > 0) {
      this.cameraManager.resize(width, height);
      this.rendererManager.resize(width, height);
    }
  };

  private startLoop(): void {
    const tick = (): void => {
      if (this.disposed) return;
      this.rafId = requestAnimationFrame(tick);

      const delta = Math.min(0.05, this.clock.getDelta());
      const elapsed = this.clock.elapsedTime;

      this.animationManager.update(delta);
      this.cameraManager.update(delta);

      if (this.activeSimulation) {
        this.activeSimulation.update(delta, this.animationManager.getCurrentTime());
      }

      this.rendererManager.render(this.sceneManager.scene, this.cameraManager.camera);

      this.labelManager.update(
        this.getInteractableRoot(),
        this.cameraManager.camera,
        this.container.clientWidth,
        this.container.clientHeight
      );

      this.callbacks.onAnimationTimeUpdate?.(
        this.animationManager.getCurrentTime(),
        this.animationManager.getDuration(),
        this.animationManager.getActiveClipId()
      );
    };
    this.rafId = requestAnimationFrame(tick);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", this.handleResize);
    }

    this.clearCurrentLesson();
    this.interactionManager.dispose();
    this.labelManager.dispose();
    this.cameraManager.dispose();
    this.sceneManager.dispose();
    this.rendererManager.dispose();
    this.assetManager.clear();
    this.events.clear();
  }
}
