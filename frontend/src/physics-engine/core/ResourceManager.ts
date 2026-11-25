import * as THREE from "three";

/**
 * Tracks and cleanly disposes WebGL geometries, materials, textures, and object hierarchies
 * to prevent GPU memory leaks when switching lessons or unmounting viewers.
 */
export class ResourceManager {
  private trackedObjects = new Set<THREE.Object3D>();

  track(object: THREE.Object3D): void {
    this.trackedObjects.add(object);
  }

  disposeObject(object: THREE.Object3D): void {
    object.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => this.disposeMaterial(mat));
        } else {
          this.disposeMaterial(mesh.material);
        }
      }
    });
    this.trackedObjects.delete(object);
  }

  private disposeMaterial(material: THREE.Material): void {
    const matAny = material as unknown as Record<string, unknown>;
    const textureProps = [
      "map",
      "lightMap",
      "bumpMap",
      "normalMap",
      "specularMap",
      "envMap",
      "alphaMap",
      "aoMap",
      "emissiveMap",
      "roughnessMap",
      "metalnessMap",
    ];
    for (const prop of textureProps) {
      const tex = matAny[prop];
      if (tex && typeof (tex as THREE.Texture).dispose === "function") {
        (tex as THREE.Texture).dispose();
      }
    }
    material.dispose();
  }

  disposeAll(): void {
    Array.from(this.trackedObjects).forEach((obj) => this.disposeObject(obj));
    this.trackedObjects.clear();
  }
}
