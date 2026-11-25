import type * as THREE from "three";
import { ModelLoader, type LoadedModelResult } from "./ModelLoader";

/**
 * Caches loaded GLTF/GLB assets by URL so revisiting a lesson or switching views
 * does not re-download models unnecessarily.
 */
export class AssetManager {
  private modelLoader = new ModelLoader();
  private cache = new Map<string, LoadedModelResult>();

  async getModel(
    url: string,
    onProgress?: (percent: number) => void
  ): Promise<LoadedModelResult> {
    if (this.cache.has(url)) {
      const cached = this.cache.get(url)!;
      onProgress?.(100);
      return {
        scene: cached.scene.clone(true) as THREE.Group,
        animations: cached.animations,
        meshNames: [...cached.meshNames],
      };
    }

    const loaded = await this.modelLoader.load(url, onProgress);
    this.cache.set(url, {
      scene: loaded.scene.clone(true) as THREE.Group,
      animations: loaded.animations,
      meshNames: [...loaded.meshNames],
    });
    return loaded;
  }

  has(url: string): boolean {
    return this.cache.has(url);
  }

  clear(): void {
    this.cache.clear();
  }
}
