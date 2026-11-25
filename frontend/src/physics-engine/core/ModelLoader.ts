import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

export interface LoadedModelResult {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
  meshNames: string[];
}

/**
 * Loads GLB/GLTF 3D models using Three.js GLTFLoader with progress reporting
 * and normalized bounding-box inspection.
 */
export class ModelLoader {
  private loader: GLTFLoader;

  constructor() {
    this.loader = new GLTFLoader();
  }

  async load(
    url: string,
    onProgress?: (percent: number) => void
  ): Promise<LoadedModelResult> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (gltf: GLTF) => {
          const root = gltf.scene || new THREE.Group();
          const meshNames: string[] = [];
          root.traverse((obj) => {
            if (obj.name && !meshNames.includes(obj.name)) {
              meshNames.push(obj.name);
            }
          });
          resolve({
            scene: root,
            animations: gltf.animations || [],
            meshNames,
          });
        },
        (xhr) => {
          if (xhr.lengthComputable && onProgress) {
            onProgress(Math.round((xhr.loaded / xhr.total) * 100));
          }
        },
        (error) => {
          reject(
            error instanceof Error
              ? error
              : new Error(`Failed to load 3D model at ${url}`)
          );
        }
      );
    });
  }
}
