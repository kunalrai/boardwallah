import * as THREE from "three";
import type { LabelDefinition } from "../types/engine";

interface LabelItem {
  def: LabelDefinition;
  buttonEl: HTMLButtonElement;
  lineEl: SVGLineElement;
  dotEl: SVGCircleElement;
}

interface ActiveLabelEntry {
  item: LabelItem;
  ax: number;
  ay: number;
  lx: number;
  ly: number;
  w: number;
  h: number;
}

/**
 * Projects 3D mesh anchor positions into 2D HTML/SVG leader-line labels layered cleanly
 * over the WebGL canvas, with show/hide support, iterative collision relaxation
 * to prevent badges from stacking over each other, and click-to-select synchronization.
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
    this.svgEl.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;";

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
      btn.title = `${def.title} — Click to inspect`;
      btn.setAttribute("aria-label", `Inspect ${def.title}`);
      btn.style.cssText = [
        "position:absolute",
        "transform:translate(-50%,-50%)",
        "pointer-events:auto",
        "display:inline-flex",
        "align-items:center",
        "justify-content:center",
        "min-height:0!important",
        "height:22px!important",
        "max-height:22px!important",
        "padding:1px 8px!important",
        "font-size:11px!important",
        "font-weight:600!important",
        "line-height:18px!important",
        "border-radius:999px!important",
        "border:1px solid rgba(148,163,184,0.75)!important",
        "background:rgba(255,255,255,0.95)!important",
        "color:#0f172a!important",
        "white-space:nowrap!important",
        "box-shadow:0 1px 4px rgba(15,23,42,0.12)!important",
        "cursor:pointer!important",
        "max-width:130px!important",
        "overflow:hidden!important",
        "text-overflow:ellipsis!important",
        "box-sizing:border-box!important",
        "z-index:5",
        "transition:border-color 0.15s,background 0.15s,color 0.15s,box-shadow 0.15s",
      ].join(";") + ";";

      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.onSelectCallback?.(def.meshName);
      });

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("stroke", "#64748b");
      line.setAttribute("stroke-width", "1");
      line.setAttribute("stroke-dasharray", "3,2");
      line.setAttribute("opacity", "0.75");

      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("r", "2.5");
      dot.setAttribute("fill", "#2563eb");
      dot.setAttribute("stroke", "#ffffff");
      dot.setAttribute("stroke-width", "1");

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
      item.buttonEl.classList.toggle("active", isSelected);
      item.buttonEl.style.background = isSelected
        ? "#2563eb"
        : "rgba(255,255,255,0.95)";
      item.buttonEl.style.color = isSelected ? "#ffffff" : "#0f172a";
      item.buttonEl.style.borderColor = isSelected
        ? "#1d4ed8"
        : "rgba(148,163,184,0.75)";
      item.buttonEl.style.zIndex = isSelected ? "20" : "5";
      item.lineEl.setAttribute("stroke", isSelected ? "#2563eb" : "#64748b");
      item.lineEl.setAttribute("stroke-width", isSelected ? "1.5" : "1");
      item.dotEl.setAttribute("fill", isSelected ? "#ea580c" : "#2563eb");
    });
  }

  update(
    root: THREE.Object3D | null,
    camera: THREE.Camera,
    width: number,
    height: number
  ): void {
    if (!this.visible || !root || width <= 0 || height <= 0) return;

    const active: ActiveLabelEntry[] = [];

    // 1. Project 3D anchors and offsets to 2D screen coordinates
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

      // Use specific label offset or default slight vertical lift
      const offset = item.def.offset ?? { x: 0, y: 0.65, z: 0 };
      const labelVec = this.tempVec
        .clone()
        .add(new THREE.Vector3(offset.x, offset.y, offset.z));
      labelVec.project(camera);

      let lx = (labelVec.x * 0.5 + 0.5) * width;
      let ly = (-labelVec.y * 0.5 + 0.5) * height;

      // Approximate or measured badge width
      const textLen = item.def.title.length;
      const approxW = Math.min(130, Math.max(48, textLen * 6.8 + 18));
      const w =
        item.buttonEl.offsetWidth > 0 ? item.buttonEl.offsetWidth : approxW;
      const h = 22;

      // Clamp initial position inside viewport margins
      lx = Math.max(w / 2 + 8, Math.min(width - w / 2 - 8, lx));
      ly = Math.max(h / 2 + 8, Math.min(height - h / 2 - 8, ly));

      active.push({ item, ax, ay, lx, ly, w, h });
    });

    if (active.length === 0) return;

    // 2. Multi-pass anti-collision relaxation so badges never sit one over each other
    const PADDING_X = 8;
    const PADDING_Y = 5;
    const iterations = Math.min(10, Math.max(4, active.length * 2));

    for (let iter = 0; iter < iterations; iter++) {
      for (let i = 0; i < active.length; i++) {
        for (let j = i + 1; j < active.length; j++) {
          const a = active[i];
          const b = active[j];

          const dx = b.lx - a.lx;
          const dy = b.ly - a.ly;
          const minDistX = (a.w + b.w) * 0.5 + PADDING_X;
          const minDistY = (a.h + b.h) * 0.5 + PADDING_Y;

          if (Math.abs(dx) < minDistX && Math.abs(dy) < minDistY) {
            const overlapX = minDistX - Math.abs(dx);
            const overlapY = minDistY - Math.abs(dy);

            // Separate along the axis of smaller displacement (prefer vertical stacking)
            if (overlapY < overlapX * 1.4) {
              const shiftY = overlapY * 0.5 + 1;
              if (dy >= 0) {
                a.ly -= shiftY;
                b.ly += shiftY;
              } else {
                a.ly += shiftY;
                b.ly -= shiftY;
              }
            } else {
              const shiftX = overlapX * 0.5 + 1;
              if (dx >= 0) {
                a.lx -= shiftX;
                b.lx += shiftX;
              } else {
                a.lx += shiftX;
                b.lx += shiftX;
              }
            }

            // Keep within viewport boundary
            a.lx = Math.max(a.w / 2 + 8, Math.min(width - a.w / 2 - 8, a.lx));
            a.ly = Math.max(a.h / 2 + 8, Math.min(height - a.h / 2 - 8, a.ly));
            b.lx = Math.max(b.w / 2 + 8, Math.min(width - b.w / 2 - 8, b.lx));
            b.ly = Math.max(b.h / 2 + 8, Math.min(height - b.h / 2 - 8, b.ly));
          }
        }
      }
    }

    // 3. Render resolved badge positions, anchor dots, and leader lines
    for (const entry of active) {
      const { item, ax, ay, lx, ly } = entry;

      item.buttonEl.style.display = "inline-flex";
      item.buttonEl.style.left = `${lx}px`;
      item.buttonEl.style.top = `${ly}px`;

      // Anchor dot on 3D object
      item.dotEl.style.display = "block";
      item.dotEl.setAttribute("cx", `${ax}`);
      item.dotEl.setAttribute("cy", `${ay}`);

      // Leader line connecting anchor dot to badge
      const dist = Math.hypot(lx - ax, ly - ay);
      if (dist > 14) {
        item.lineEl.style.display = "block";
        item.lineEl.setAttribute("x1", `${ax}`);
        item.lineEl.setAttribute("y1", `${ay}`);
        item.lineEl.setAttribute("x2", `${lx}`);
        item.lineEl.setAttribute("y2", `${ly}`);
      } else {
        item.lineEl.style.display = "none";
      }
    }
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
