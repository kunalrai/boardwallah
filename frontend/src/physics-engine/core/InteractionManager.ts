import * as THREE from "three";

export interface InteractionCallbacks {
  onSelect: (meshName: string | null) => void;
  onHover: (meshName: string | null) => void;
}

/**
 * Handles mouse and touch raycasting against named 3D meshes with click-vs-drag
 * discrimination so OrbitControls rotation never triggers accidental selection.
 */
export class InteractionManager {
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private domElement: HTMLElement;
  private camera: THREE.Camera;
  private getTargetRoot: () => THREE.Object3D | null;
  private callbacks: InteractionCallbacks;

  private pointerDownPos = { x: 0, y: 0 };
  private lastHovered: string | null = null;

  private handlePointerDown = (e: PointerEvent): void => {
    this.pointerDownPos = { x: e.clientX, y: e.clientY };
  };

  private handlePointerMove = (e: PointerEvent): void => {
    if (e.pointerType === "touch") return;
    const hitName = this.raycastAt(e.clientX, e.clientY);
    if (hitName !== this.lastHovered) {
      this.lastHovered = hitName;
      this.domElement.style.cursor = hitName ? "pointer" : "grab";
      this.callbacks.onHover(hitName);
    }
  };

  private handlePointerUp = (e: PointerEvent): void => {
    const dx = e.clientX - this.pointerDownPos.x;
    const dy = e.clientY - this.pointerDownPos.y;
    // Ignore drags (> 6px movement)
    if (Math.hypot(dx, dy) > 6) return;

    const hitName = this.raycastAt(e.clientX, e.clientY);
    this.callbacks.onSelect(hitName);
  };

  constructor(
    domElement: HTMLElement,
    camera: THREE.Camera,
    getTargetRoot: () => THREE.Object3D | null,
    callbacks: InteractionCallbacks
  ) {
    this.domElement = domElement;
    this.camera = camera;
    this.getTargetRoot = getTargetRoot;
    this.callbacks = callbacks;

    this.domElement.addEventListener("pointerdown", this.handlePointerDown);
    this.domElement.addEventListener("pointermove", this.handlePointerMove);
    this.domElement.addEventListener("pointerup", this.handlePointerUp);
  }

  private raycastAt(clientX: number, clientY: number): string | null {
    const root = this.getTargetRoot();
    if (!root) return null;

    const rect = this.domElement.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;

    this.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObject(root, true);

    for (const hit of hits) {
      let current: THREE.Object3D | null = hit.object;
      while (current && current !== root) {
        if (current.name && !current.name.startsWith("__") && current.visible) {
          return current.name;
        }
        current = current.parent;
      }
    }
    return null;
  }

  dispose(): void {
    this.domElement.removeEventListener("pointerdown", this.handlePointerDown);
    this.domElement.removeEventListener("pointermove", this.handlePointerMove);
    this.domElement.removeEventListener("pointerup", this.handlePointerUp);
  }
}
