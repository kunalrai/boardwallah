import * as THREE from "three";
import type { EngineSceneConfig } from "../types/engine";

/**
 * Creates and manages the Three.js Scene, lighting rig, optional grid/axes helpers,
 * and dedicated root groups for loaded models vs. dynamic simulation visuals.
 */
export class SceneManager {
  public readonly scene: THREE.Scene;
  public readonly modelGroup: THREE.Group;
  public readonly simulationGroup: THREE.Group;
  private gridHelper: THREE.GridHelper | null = null;
  private axesHelper: THREE.AxesHelper | null = null;

  constructor(config?: EngineSceneConfig) {
    this.scene = new THREE.Scene();
    const bg = config?.backgroundColor ?? 0xf4f7fb;
    this.scene.background = new THREE.Color(bg);

    this.modelGroup = new THREE.Group();
    this.modelGroup.name = "__BoardwallahModelGroup";

    this.simulationGroup = new THREE.Group();
    this.simulationGroup.name = "__BoardwallahSimulationGroup";

    this.scene.add(this.modelGroup);
    this.scene.add(this.simulationGroup);

    this.setupLighting(config);
    this.setupHelpers(config);
  }

  private setupLighting(config?: EngineSceneConfig): void {
    const ambientIntensity = config?.ambientLightIntensity ?? 0.85;
    const dirIntensity = config?.directionalLightIntensity ?? 1.15;

    const ambient = new THREE.AmbientLight(0xffffff, ambientIntensity);
    this.scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0xeef6ff, 0xcbd5e1, 0.45);
    hemi.position.set(0, 12, 0);
    this.scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xffffff, dirIntensity);
    keyLight.position.set(6, 10, 8);
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.55);
    fillLight.position.set(-7, -4, -6);
    this.scene.add(fillLight);
  }

  private setupHelpers(config?: EngineSceneConfig): void {
    if (config?.showGrid) {
      this.gridHelper = new THREE.GridHelper(20, 20, 0xcbd5e1, 0xe2e8f0);
      this.gridHelper.position.y = -3.2;
      this.scene.add(this.gridHelper);
    }
    if (config?.showAxes) {
      this.axesHelper = new THREE.AxesHelper(3);
      this.scene.add(this.axesHelper);
    }
  }

  setBackground(color: number | string): void {
    this.scene.background = new THREE.Color(color);
  }

  dispose(): void {
    if (this.gridHelper) {
      this.gridHelper.geometry.dispose();
      (this.gridHelper.material as THREE.Material).dispose();
    }
    if (this.axesHelper) {
      this.axesHelper.geometry.dispose();
      (this.axesHelper.material as THREE.Material).dispose();
    }
  }
}
