import * as THREE from "three";
import type { LabelDefinition } from "../types/engine";

interface LabelItem {
  def: LabelDefinition;
  buttonEl: HTMLButtonElement;
  lineEl: SVGLineElement;
  dotEl: SVGCircleElement;
}

/**
 * Projects 3D mesh anchor positions into 2D HTML/SVG leader-line labels layered cleanly
 * over the WebGL canvas, with show/hide support and click-to-select synchronization.
 */
export class LabelManager {
  private overlayEl: HTMLElement;
  private svgEl: SVGSVGElement;
  private items: LabelItem[] = [];
  private visible = true;
  private selectedMeshName: string | null = null;
  private onSelectCallback?: (meshName: string) => void;

  private tempVec = new THREE.Vector3();
  private tempBox = new THREE.Box3();

  constructor(container: HTMLElement, onSelect?: (meshName: string) => void) {
    this.onSelectCallback = onSelect;

    this.overlayEl = document.createElement("div");
    this.overlayEl.className = "bw-p3d-labels-overlay";
    this.overlayEl.style.cssText =
      "position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:5;";

    this.svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svgEl.setAttribute("width", "100%");
    this.svgEl.setAttribute("height", "100%");
    this.svgEl.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;";

    this.overlayEl.appendChild(this.svgEl);
    container.appendChild(this.overlayEl);
  }

  setLabels(definitions: LabelDefinition[]): void {
    this.clear();
    definitions.forEach((def) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "bw-p3d-label-badge";
      btn.textContent = def.title;
      btn.setAttribute("aria-label", `Inspect ${def.title}`);
      btn.style.cssText =
        "position:absolute;transform:translate(-50%,-50%);pointer-events:auto;background:rgba(255,255,255,0.88);color:#0f172a;border:1px solid #94a3b8;border-radius:999px;padding:1px 7px;font-size:10px;font-weight:600;white-space:nowrap;box-shadow:0 1px 6px rgba(15,23,42,0.14);cursor:pointer;transition:border-color 0.15s,background 0.15s,color 0.15s;max-width:90px;overflow:hidden;text-overflow:ellipsis;";

      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.onSelectCallback?.(def.meshName);
      });

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("stroke", "#64748b");
      line.setAttribute("stroke-width", "1.25");
      line.setAttribute("stroke-dasharray", "3,2");

      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("r", "3");
      dot.setAttribute("fill", "#1a73e8");

      this.svgEl.appendChild(line);
      this.svgEl.appendChild(dot);
      this.overlayEl.appendChild(btn);

      this.items.push({ def, buttonEl: btn, lineEl: line, dotEl: dot });
    });
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    this.overlayEl.style.display = visible ? "block" : "none";
  }

  getVisible(): boolean {
    return this.visible;
  }

  setSelectedMesh(meshName: string | null): void {
    this.selectedMeshName = meshName;
    this.items.forEach((item) => {
      const isSelected = item.def.meshName === this.selectedMeshName;
      item.buttonEl.style.background = isSelected ? "#1a73e8" : "rgba(255,255,255,0.92)";
      item.buttonEl.style.color = isSelected ? "#ffffff" : "#0f172a";
      item.buttonEl.style.borderColor = isSelected ? "#1a73e8" : "#cbd5e1";
      item.lineEl.setAttribute("stroke", isSelected ? "#1a73e8" : "#64748b");
      item.dotEl.setAttribute("fill", isSelected ? "#ea580c" : "#1a73e8");
    });
  }

  update(root: THREE.Object3D | null, camera: THREE.Camera, width: number, height: number): void {
    if (!this.visible || !root || width <= 0 || height <= 0) return;

    this.items.forEach((item) => {
      const target = root.getObjectByName(item.def.meshName);
      if (!target || !target.visible) {
        item.buttonEl.style.display = "none";
        item.lineEl.style.display = "none";
        item.dotEl.style.display = "none";
        return;
      }

      this.tempBox.setFromObject(target);
      if (this.tempBox.isEmpty()) {
        target.getWorldPosition(this.tempVec);
      } else {
        this.tempBox.getCenter(this.tempVec);
      }

      const anchorVec = this.tempVec.clone();
      anchorVec.project(camera);

      // Hide if behind camera
      if (anchorVec.z > 1) {
        item.buttonEl.style.display = "none";
        item.lineEl.style.display = "none";
        item.dotEl.style.display = "none";
        return;
      }

      const ax = (anchorVec.x * 0.5 + 0.5) * width;
      const ay = (-anchorVec.y * 0.5 + 0.5) * height;

      const offset = item.def.offset ?? { x: 0, y: 0.75, z: 0 };
      const labelVec = this.tempVec.clone().add(new THREE.Vector3(offset.x, offset.y, offset.z));
      labelVec.project(camera);

      // Raw projected label position
      let lx = (labelVec.x * 0.5 + 0.5) * width;
      let ly = (-labelVec.y * 0.5 + 0.5) * height;

      // Push labels into the outer 30% margins so they never overlap the central diagram.
      // For X: if in the inner 40%-60% range, nudge to the nearest outer zone.
      const innerXMin = width * 0.25;
      const innerXMax = width * 0.75;
      const innerYMin = height * 0.20;
      const innerYMax = height * 0.80;

      if (lx > innerXMin && lx < innerXMax) {
        // Snap to whichever horizontal margin is closer
        lx = (lx < width / 2) ? Math.min(lx, innerXMin - 4) : Math.max(lx, innerXMax + 4);
      }
      if (ly > innerYMin && ly < innerYMax) {
        // Snap to whichever vertical margin is closer
        ly = (ly < height / 2) ? Math.min(ly, innerYMin - 4) : Math.max(ly, innerYMax + 4);
      }

      lx = Math.max(52, Math.min(width - 52, lx));
      ly = Math.max(16, Math.min(height - 16, ly));

      item.buttonEl.style.display = "inline-block";
      item.buttonEl.style.left = `${lx}px`;
      item.buttonEl.style.top = `${ly}px`;

      item.dotEl.style.display = "block";
      item.dotEl.setAttribute("cx", `${ax}`);
      item.dotEl.setAttribute("cy", `${ay}`);

      item.lineEl.style.display = "block";
      item.lineEl.setAttribute("x1", `${ax}`);
      item.lineEl.setAttribute("y1", `${ay}`);
      item.lineEl.setAttribute("x2", `${lx}`);
      item.lineEl.setAttribute("y2", `${ly}`);
    });
  }

  clear(): void {
    this.items.forEach((item) => {
      item.buttonEl.remove();
      item.lineEl.remove();
      item.dotEl.remove();
    });
    this.items = [];
  }

  dispose(): void {
    this.clear();
    this.overlayEl.remove();
  }
}
