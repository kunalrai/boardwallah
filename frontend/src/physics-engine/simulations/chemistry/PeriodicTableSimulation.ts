import * as THREE from "three";
import type {
  Simulation,
  SimulationContext,
  SimulationParameters,
  SimulationResult,
} from "../interfaces/Simulation";
import { clearGroupWithDispose } from "../optics/opticsVisuals";

export type PeriodicView = "modern" | "mendeleev" | "dobereiner" | "trends";

// First 20 elements — CBSE Class 10 Periodic Table scope
const ELEMENTS = [
  // Period 1
  { symbol: "H",  name: "Hydrogen",   z: 1,  group: 1,  period: 1, metal: false,  color: 0xfef9c3 },
  { symbol: "He", name: "Helium",     z: 2,  group: 18, period: 1, metal: false,  color: 0xe0e7ff },
  // Period 2
  { symbol: "Li", name: "Lithium",    z: 3,  group: 1,  period: 2, metal: true,   color: 0xfca5a5 },
  { symbol: "Be", name: "Beryllium",  z: 4,  group: 2,  period: 2, metal: true,   color: 0xfb923c },
  { symbol: "B",  name: "Boron",      z: 5,  group: 13, period: 2, metal: false,  color: 0xa3e635 },
  { symbol: "C",  name: "Carbon",     z: 6,  group: 14, period: 2, metal: false,  color: 0x94a3b8 },
  { symbol: "N",  name: "Nitrogen",   z: 7,  group: 15, period: 2, metal: false,  color: 0x86efac },
  { symbol: "O",  name: "Oxygen",     z: 8,  group: 16, period: 2, metal: false,  color: 0x6ee7b7 },
  { symbol: "F",  name: "Fluorine",   z: 9,  group: 17, period: 2, metal: false,  color: 0x5eead4 },
  { symbol: "Ne", name: "Neon",       z: 10, group: 18, period: 2, metal: false,  color: 0xe0e7ff },
  // Period 3
  { symbol: "Na", name: "Sodium",     z: 11, group: 1,  period: 3, metal: true,   color: 0xfca5a5 },
  { symbol: "Mg", name: "Magnesium",  z: 12, group: 2,  period: 3, metal: true,   color: 0xfb923c },
  { symbol: "Al", name: "Aluminium",  z: 13, group: 13, period: 3, metal: true,   color: 0xfbbf24 },
  { symbol: "Si", name: "Silicon",    z: 14, group: 14, period: 3, metal: false,  color: 0xa3e635 },
  { symbol: "P",  name: "Phosphorus", z: 15, group: 15, period: 3, metal: false,  color: 0x86efac },
  { symbol: "S",  name: "Sulphur",    z: 16, group: 16, period: 3, metal: false,  color: 0x6ee7b7 },
  { symbol: "Cl", name: "Chlorine",   z: 17, group: 17, period: 3, metal: false,  color: 0x5eead4 },
  { symbol: "Ar", name: "Argon",      z: 18, group: 18, period: 3, metal: false,  color: 0xe0e7ff },
  // Period 4 (first two)
  { symbol: "K",  name: "Potassium",  z: 19, group: 1,  period: 4, metal: true,   color: 0xfca5a5 },
  { symbol: "Ca", name: "Calcium",    z: 20, group: 2,  period: 4, metal: true,   color: 0xfb923c },
];

// Dobereiner triads
const TRIADS = [
  { name: "Lithium–Sodium–Potassium (Alkali Metals)", elements: ["Li", "Na", "K"],  colors: [0xfca5a5, 0xf87171, 0xef4444] },
  { name: "Calcium–Strontium–Barium (Alkaline Earths)", elements: ["Ca", "Sr", "Ba"], colors: [0xfb923c, 0xf97316, 0xea580c] },
  { name: "Chlorine–Bromine–Iodine (Halogens)", elements: ["Cl", "Br", "I"],  colors: [0x5eead4, 0x2dd4bf, 0x0d9488] },
];

function groupToX(group: number): number {
  // Map groups 1,2,13-18 to compact x positions
  if (group <= 2) return (group - 1) * 1.4 - 6.3;
  return (group - 13 + 2) * 1.4 + 1.4;
}

function periodToY(period: number): number {
  return -(period - 1) * 1.4 + 1.5;
}

export class PeriodicTableSimulation implements Simulation {
  public readonly id = "chemistry-periodic";

  private context!: SimulationContext;
  private dynamicGroup = new THREE.Group();
  private params: { view: PeriodicView; highlightGroup: number; highlightPeriod: number } = {
    view: "modern",
    highlightGroup: 0,
    highlightPeriod: 0,
  };
  private initialParams = { ...this.params };
  private elementMeshes: Map<string, THREE.Mesh> = new Map();
  private floatTime = 0;

  initialize(context: SimulationContext, initialParams: SimulationParameters): void {
    this.context = context;
    this.dynamicGroup.name = "__PeriodicTableGroup";
    this.context.simulationGroup.add(this.dynamicGroup);
    if (typeof initialParams.view === "string") this.params.view = initialParams.view as PeriodicView;
    if (typeof initialParams.highlightGroup === "number") this.params.highlightGroup = initialParams.highlightGroup;
    if (typeof initialParams.highlightPeriod === "number") this.params.highlightPeriod = initialParams.highlightPeriod;
    this.initialParams = { ...this.params };
    this.rebuildVisuals();
  }

  setParameters(params: SimulationParameters): SimulationResult {
    let changed = false;
    if (typeof params.view === "string" && params.view !== this.params.view) {
      this.params.view = params.view as PeriodicView;
      changed = true;
    }
    if (typeof params.highlightGroup === "number" && params.highlightGroup !== this.params.highlightGroup) {
      this.params.highlightGroup = params.highlightGroup;
      changed = true;
    }
    if (typeof params.highlightPeriod === "number" && params.highlightPeriod !== this.params.highlightPeriod) {
      this.params.highlightPeriod = params.highlightPeriod;
      changed = true;
    }
    if (changed) this.rebuildVisuals();
    return this.getResults();
  }

  private rebuildVisuals(): void {
    clearGroupWithDispose(this.dynamicGroup);
    this.elementMeshes.clear();

    if (this.params.view === "modern") {
      this.buildModernTable();
    } else if (this.params.view === "dobereiner") {
      this.buildDobereinerTriads();
    } else if (this.params.view === "mendeleev") {
      this.buildMendeleevColumns();
    } else {
      this.buildTrendsView();
    }
  }

  private makeElementTile(el: typeof ELEMENTS[0], x: number, y: number, z = 0, scale = 1.0): void {
    const isHighlightedGroup = this.params.highlightGroup > 0 && el.group === this.params.highlightGroup;
    const isHighlightedPeriod = this.params.highlightPeriod > 0 && el.period === this.params.highlightPeriod;
    const highlighted = isHighlightedGroup || isHighlightedPeriod;

    const geo = new THREE.BoxGeometry(1.1 * scale, 1.1 * scale, highlighted ? 0.26 : 0.18);
    const mat = new THREE.MeshStandardMaterial({
      color: highlighted ? 0xfbbf24 : el.color,
      roughness: 0.35,
      metalness: el.metal ? 0.45 : 0.0,
      emissive: highlighted ? 0x78350f : 0x000000,
      emissiveIntensity: highlighted ? 0.22 : 0,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = `Element_${el.symbol}`;
    mesh.position.set(x, y, z + (highlighted ? 0.08 : 0));
    mesh.castShadow = true;
    this.dynamicGroup.add(mesh);
    this.elementMeshes.set(el.symbol, mesh);

    // Noble gas ring highlight
    if (el.group === 18) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.58 * scale, 0.025, 8, 24),
        new THREE.MeshBasicMaterial({ color: 0x818cf8 })
      );
      ring.position.set(x, y, z + 0.14);
      this.dynamicGroup.add(ring);
    }
  }

  private buildModernTable(): void {
    // Background grid lines for periods
    for (let p = 1; p <= 4; p++) {
      const y = periodToY(p);
      const bg = new THREE.Mesh(
        new THREE.PlaneGeometry(14, 1.05),
        new THREE.MeshBasicMaterial({ color: p % 2 === 0 ? 0xf1f5f9 : 0xfafafa, transparent: true, opacity: 0.5 })
      );
      bg.position.set(0, y, -0.12);
      this.dynamicGroup.add(bg);
    }

    ELEMENTS.forEach((el) => {
      const x = groupToX(el.group);
      const y = periodToY(el.period);
      this.makeElementTile(el, x, y);
    });

    // Gap indicator between groups 2 and 13
    const gapMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.5, 1.0),
      new THREE.MeshBasicMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.6 })
    );
    gapMesh.position.set(-2.0, periodToY(2) - 1.4, -0.11);
    this.dynamicGroup.add(gapMesh);

    // Legend — Metals vs Non-Metals
    this.addLegend();
  }

  private buildDobereinerTriads(): void {
    TRIADS.forEach((triad, ti) => {
      const baseX = (ti - 1) * 5.5;

      // Triad label block
      const labelBlock = new THREE.Mesh(
        new THREE.BoxGeometry(4.6, 0.55, 0.12),
        new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.5 })
      );
      labelBlock.position.set(baseX, 2.2, 0);
      labelBlock.name = `Triad_${ti}`;
      this.dynamicGroup.add(labelBlock);

      triad.elements.forEach((sym, ei) => {
        const el = ELEMENTS.find((e) => e.symbol === sym);
        if (!el) return;
        const x = baseX + (ei - 1) * 1.5;
        const y = 0.8 - ei * 1.5;

        const geo = new THREE.CylinderGeometry(0.52, 0.52, 0.22, 20);
        const mat = new THREE.MeshStandardMaterial({ color: triad.colors[ei], roughness: 0.3, metalness: 0.3 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.name = `Element_${sym}`;
        mesh.position.set(x, y, 0);
        this.dynamicGroup.add(mesh);
        this.elementMeshes.set(sym, mesh);

        // Atomic mass indicator bar
        const bar = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, el.z * 0.065, 0.08),
          new THREE.MeshStandardMaterial({ color: 0x1a73e8 })
        );
        bar.position.set(x + 0.65, y - 0.5 + (el.z * 0.065) / 2, 0);
        this.dynamicGroup.add(bar);
      });

      // Middle element mean arrow
      const arrow = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 2.8, 8),
        new THREE.MeshBasicMaterial({ color: 0x94a3b8 })
      );
      arrow.position.set(baseX, 0.8 - 1.5, 0.15);
      this.dynamicGroup.add(arrow);
    });
  }

  private buildMendeleevColumns(): void {
    // Arrange elements by groups as vertical columns (Mendeleev style — groups by valency)
    const groups: Record<number, typeof ELEMENTS> = {};
    ELEMENTS.forEach((el) => {
      if (!groups[el.group]) groups[el.group] = [];
      groups[el.group].push(el);
    });

    const groupKeys = [1, 2, 13, 14, 15, 16, 17, 18];
    groupKeys.forEach((g, gi) => {
      const els = groups[g] || [];
      const x = (gi - 3.5) * 1.5;

      // Column header
      const headerGeo = new THREE.BoxGeometry(1.2, 0.5, 0.15);
      const headerMat = new THREE.MeshStandardMaterial({ color: 0x1e3a5f });
      const header = new THREE.Mesh(headerGeo, headerMat);
      header.position.set(x, 2.3, 0);
      header.name = `GroupHeader_${g}`;
      this.dynamicGroup.add(header);

      els.forEach((el, ei) => {
        this.makeElementTile(el, x, 1.2 - ei * 1.4);
      });
    });
  }

  private buildTrendsView(): void {
    // Show atomic size trend: size decreases left→right, increases top→bottom
    const period3 = ELEMENTS.filter((e) => e.period === 3);
    // Atomic radii (pm, approximate)
    const radii: Record<string, number> = {
      Na: 186, Mg: 160, Al: 143, Si: 117, P: 110, S: 104, Cl: 99, Ar: 94,
    };

    period3.forEach((el, i) => {
      const x = (i - 3.5) * 1.5;
      const r = (radii[el.symbol] ?? 100) / 180; // normalize to ~0.5–1.0
      const scale = r * 0.95;

      const geo = new THREE.SphereGeometry(scale * 0.62, 20, 20);
      const mat = new THREE.MeshStandardMaterial({
        color: el.metal ? 0xfb923c : 0x5eead4,
        roughness: 0.3,
        metalness: el.metal ? 0.4 : 0,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, 0, 0);
      mesh.name = `Element_${el.symbol}`;
      this.dynamicGroup.add(mesh);
      this.elementMeshes.set(el.symbol, mesh);

      // Arrow showing size decrease (horizontal)
      if (i < period3.length - 1) {
        const arrowLen = 0.5;
        const arr = new THREE.Mesh(
          new THREE.ConeGeometry(0.07, arrowLen, 8),
          new THREE.MeshBasicMaterial({ color: 0xef4444 })
        );
        arr.rotation.z = -Math.PI / 2;
        arr.position.set(x + 0.95, -1.4, 0);
        this.dynamicGroup.add(arr);
      }
    });

    // Period trend: Na vs K size comparison (vertical)
    const periodPair = [
      { el: ELEMENTS.find((e) => e.symbol === "Na")!, y: 1.5, r: 0.56 },
      { el: ELEMENTS.find((e) => e.symbol === "K")!,  y: -1.5, r: 0.78 },
    ];
    periodPair.forEach(({ el, y, r }) => {
      if (!el) return;
      const geo = new THREE.SphereGeometry(r, 20, 20);
      const mat = new THREE.MeshStandardMaterial({ color: 0xfca5a5, roughness: 0.3, metalness: 0.3 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(-7.5, y, 0);
      mesh.name = `Element_${el.symbol}`;
      this.dynamicGroup.add(mesh);
      this.elementMeshes.set(el.symbol, mesh);
    });

    // Down-arrow for period trend
    const downArr = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.6, 8),
      new THREE.MeshBasicMaterial({ color: 0x1a73e8 })
    );
    downArr.rotation.z = Math.PI;
    downArr.position.set(-7.5, -0.1, 0);
    this.dynamicGroup.add(downArr);
  }

  private addLegend(): void {
    // Metal block
    const metalBlock = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.4, 0.14),
      new THREE.MeshStandardMaterial({ color: 0xfca5a5, metalness: 0.4, roughness: 0.3 })
    );
    metalBlock.position.set(-3.2, -3.5, 0);
    this.dynamicGroup.add(metalBlock);

    // Non-metal block
    const nonMetalBlock = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.4, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x6ee7b7, roughness: 0.4 })
    );
    nonMetalBlock.position.set(0.4, -3.5, 0);
    this.dynamicGroup.add(nonMetalBlock);

    // Noble gas ring
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.03, 8, 24),
      new THREE.MeshBasicMaterial({ color: 0x818cf8 })
    );
    ring.position.set(3.5, -3.5, 0);
    this.dynamicGroup.add(ring);
  }

  update(deltaTime: number, _elapsedTime: number): void {
    this.floatTime += deltaTime;
    // Gentle float/pulse on highlighted elements
    this.elementMeshes.forEach((mesh, sym) => {
      const el = ELEMENTS.find((e) => e.symbol === sym);
      if (!el) return;
      const isHL = (this.params.highlightGroup > 0 && el.group === this.params.highlightGroup) ||
                   (this.params.highlightPeriod > 0 && el.period === this.params.highlightPeriod);
      if (isHL) {
        mesh.position.z = 0.08 + Math.sin(this.floatTime * 2.2) * 0.06;
      }
    });
  }

  getResults(): SimulationResult {
    const view = this.params.view;
    const hg = this.params.highlightGroup;
    const hp = this.params.highlightPeriod;

    const groupNames: Record<number, string> = { 1: "Alkali Metals", 2: "Alkaline Earth Metals", 13: "Boron Group", 14: "Carbon Group", 15: "Nitrogen Group", 16: "Chalcogens", 17: "Halogens", 18: "Noble Gases" };
    const trendMap: Record<string, string> = {
      modern: "Modern Periodic Law — Properties are periodic functions of atomic number (Z).",
      dobereiner: "Döbereiner's Triads — Middle element's atomic mass ≈ average of first & third.",
      mendeleev: "Mendeleev's Periodic Law — Properties are periodic functions of atomic mass.",
      trends: "Atomic size decreases across a period (↔) and increases down a group (↕).",
    };

    return {
      metrics: {
        "View": view === "modern" ? "Modern Periodic Table" : view === "dobereiner" ? "Döbereiner's Triads" : view === "mendeleev" ? "Mendeleev's Table" : "Periodic Trends",
        "Elements Shown": `${ELEMENTS.length} (Z=1 to Z=20)`,
        "Highlighted Group": hg > 0 ? (groupNames[hg] ?? `Group ${hg}`) : "None",
        "Highlighted Period": hp > 0 ? `Period ${hp}` : "None",
        "Periods Covered": "1 to 4",
        "Groups Covered": "1, 2, 13–18",
      },
      summary: trendMap[view] ?? "Explore the Periodic Table in 3D.",
      observations: [
        "Elements in the same group have the same number of valence electrons → similar chemical properties.",
        "Moving left to right across a period: atomic size ↓, metallic character ↓, non-metallic character ↑.",
        "Moving down a group: atomic size ↑, metallic character ↑.",
        "Noble gases (Group 18) have fully filled outermost shells — extremely low reactivity.",
        "Döbereiner noticed the middle element's atomic mass is the arithmetic mean of the other two in a Triad.",
      ],
    };
  }

  reset(): void {
    this.params = { ...this.initialParams };
    this.rebuildVisuals();
  }

  dispose(): void {
    clearGroupWithDispose(this.dynamicGroup);
    this.elementMeshes.clear();
  }
}
