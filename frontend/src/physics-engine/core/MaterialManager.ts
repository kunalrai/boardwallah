import * as THREE from "three";

/**
 * Handles highlight/hover material states cleanly without mutating shared base materials.
 */
export class MaterialManager {
  private originalMaterials = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
  private selectedMeshName: string | null = null;
  private hoveredMeshName: string | null = null;

  private applyEmissive(object: THREE.Object3D, emissiveHex: number, intensity: number): void {
    object.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;

      if (!this.originalMaterials.has(mesh)) {
        this.originalMaterials.set(mesh, mesh.material);
      }

      const baseMat = this.originalMaterials.get(mesh)!;
      const cloneAndTint = (mat: THREE.Material): THREE.Material => {
        const cloned = mat.clone();
        if ("emissive" in cloned) {
          const std = cloned as THREE.MeshStandardMaterial;
          std.emissive = new THREE.Color(emissiveHex);
          std.emissiveIntensity = intensity;
        }
        return cloned;
      };

      mesh.material = Array.isArray(baseMat) ? baseMat.map(cloneAndTint) : cloneAndTint(baseMat);
    });
  }

  private restoreAll(root: THREE.Object3D | null): void {
    if (!root) return;
    root.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      const orig = this.originalMaterials.get(mesh);
      if (orig) {
        mesh.material = orig;
      }
    });
  }

  updateHighlight(
    root: THREE.Object3D | null,
    selectedName: string | null,
    hoveredName: string | null
  ): void {
    if (!root) return;
    if (this.selectedMeshName === selectedName && this.hoveredMeshName === hoveredName) {
      return;
    }

    this.restoreAll(root);
    this.selectedMeshName = selectedName;
    this.hoveredMeshName = hoveredName;

    if (hoveredName && hoveredName !== selectedName) {
      const hoveredObj = root.getObjectByName(hoveredName);
      if (hoveredObj) {
        this.applyEmissive(hoveredObj, 0x38bdf8, 0.35);
      }
    }

    if (selectedName) {
      const selectedObj = root.getObjectByName(selectedName);
      if (selectedObj) {
        this.applyEmissive(selectedObj, 0xea580c, 0.55);
      }
    }
  }

  dispose(): void {
    this.originalMaterials.clear();
  }
}
