import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { CameraPreset, EngineSceneConfig, Vector3Tuple } from "../types/engine";

/**
 * Manages PerspectiveCamera, OrbitControls, zoom/pan limits, smooth camera transitions,
 * and named camera presets.
 */
export class CameraManager {
  public readonly camera: THREE.PerspectiveCamera;
  public readonly controls: OrbitControls;

  private defaultPosition: THREE.Vector3;
  private defaultTarget: THREE.Vector3;
  private transition: {
    startPos: THREE.Vector3;
    endPos: THREE.Vector3;
    startTarget: THREE.Vector3;
    endTarget: THREE.Vector3;
    elapsed: number;
    duration: number;
  } | null = null;

  constructor(domElement: HTMLElement, width: number, height: number, config?: EngineSceneConfig) {
    const aspect = width > 0 && height > 0 ? width / height : 16 / 9;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 200);

    const pos = config?.cameraPosition ?? { x: 0, y: 1.5, z: 9 };
    const target = config?.cameraTarget ?? { x: 0, y: 0, z: 0 };

    this.defaultPosition = new THREE.Vector3(pos.x, pos.y, pos.z);
    this.defaultTarget = new THREE.Vector3(target.x, target.y, target.z);

    this.camera.position.copy(this.defaultPosition);

    this.controls = new OrbitControls(this.camera, domElement);
    this.controls.target.copy(this.defaultTarget);
    this.controls.enableDamping = config?.enableDamping ?? true;
    this.controls.dampingFactor = 0.08;
    this.controls.enablePan = config?.enablePan ?? true;
    this.controls.enableZoom = config?.enableZoom ?? true;
    this.controls.minDistance = config?.minDistance ?? 2.2;
    this.controls.maxDistance = config?.maxDistance ?? 26;
    this.controls.update();
  }

  update(deltaTime: number): void {
    if (this.transition) {
      this.transition.elapsed += deltaTime;
      const t = Math.min(1, this.transition.elapsed / this.transition.duration);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      this.camera.position.lerpVectors(this.transition.startPos, this.transition.endPos, eased);
      this.controls.target.lerpVectors(this.transition.startTarget, this.transition.endTarget, eased);

      if (t >= 1) {
        this.transition = null;
      }
    }
    this.controls.update();
  }

  transitionTo(position: Vector3Tuple, target: Vector3Tuple, duration = 0.65): void {
    this.transition = {
      startPos: this.camera.position.clone(),
      endPos: new THREE.Vector3(position.x, position.y, position.z),
      startTarget: this.controls.target.clone(),
      endTarget: new THREE.Vector3(target.x, target.y, target.z),
      elapsed: 0,
      duration: Math.max(0.05, duration),
    };
  }

  applyPreset(preset: CameraPreset): void {
    if (preset.fov) {
      this.camera.fov = preset.fov;
      this.camera.updateProjectionMatrix();
    }
    this.transitionTo(preset.position, preset.target);
  }

  resetCamera(): void {
    this.transitionTo(
      { x: this.defaultPosition.x, y: this.defaultPosition.y, z: this.defaultPosition.z },
      { x: this.defaultTarget.x, y: this.defaultTarget.y, z: this.defaultTarget.z }
    );
  }

  updateConfig(config?: EngineSceneConfig): void {
    if (!config) return;
    if (config.cameraPosition) {
      this.defaultPosition.set(config.cameraPosition.x, config.cameraPosition.y, config.cameraPosition.z);
      this.camera.position.copy(this.defaultPosition);
    }
    if (config.cameraTarget) {
      this.defaultTarget.set(config.cameraTarget.x, config.cameraTarget.y, config.cameraTarget.z);
      this.controls.target.copy(this.defaultTarget);
    }
    if (config.minDistance !== undefined) {
      this.controls.minDistance = config.minDistance;
    }
    if (config.maxDistance !== undefined) {
      this.controls.maxDistance = config.maxDistance;
    }
    this.controls.update();
  }

  zoomBy(factor: number): void {
    const offset = this.camera.position.clone().sub(this.controls.target);
    const nextDist = Math.max(
      this.controls.minDistance,
      Math.min(this.controls.maxDistance, offset.length() * factor)
    );
    offset.setLength(nextDist);
    this.camera.position.copy(this.controls.target).add(offset);
    this.controls.update();
  }

  resize(width: number, height: number): void {
    if (width <= 0 || height <= 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  dispose(): void {
    this.controls.dispose();
  }
}
