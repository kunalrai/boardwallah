import * as THREE from "three";
import type {
  Simulation,
  SimulationContext,
  SimulationParameters,
  SimulationResult,
} from "../interfaces/Simulation";
import { clearGroupWithDispose } from "../optics/opticsVisuals";

export type HistoryChapterId =
  | "nationalism-europe"
  | "nationalism-india"
  | "global-world"
  | "industrialisation"
  | "print-culture";

export class HistorySimulation implements Simulation {
  public readonly id = "sst-history";

  private context!: SimulationContext;
  private dynamicGroup = new THREE.Group();
  private params: { chapterId: HistoryChapterId; era: number; highlight: number } = {
    chapterId: "nationalism-europe",
    era: 1848,
    highlight: 0,
  };
  private initialParams = { ...this.params };
  private animMeshes: THREE.Mesh[] = [];
  private floatTime = 0;

  initialize(context: SimulationContext, initialParams: SimulationParameters): void {
    this.context = context;
    this.dynamicGroup.name = "__SstHistoryGroup";
    this.context.simulationGroup.add(this.dynamicGroup);
    this.applyParams(initialParams);
    this.initialParams = { ...this.params };
    this.rebuildVisuals();
  }

  private applyParams(p: SimulationParameters): void {
    const validChapters: HistoryChapterId[] = [
      "nationalism-europe",
      "nationalism-india",
      "global-world",
      "industrialisation",
      "print-culture",
    ];
    if (typeof p.chapterId === "string" && validChapters.includes(p.chapterId as HistoryChapterId)) {
      this.params.chapterId = p.chapterId as HistoryChapterId;
    }
    if (typeof p.era === "number") {
      this.params.era = p.era;
    } else if (typeof p.era === "string") {
      this.params.era = parseInt(p.era, 10) || 1848;
    }
    if (typeof p.highlight === "number") {
      this.params.highlight = p.highlight;
    } else if (typeof p.highlight === "string") {
      this.params.highlight = parseInt(p.highlight, 10) || 0;
    }
  }

  setParameters(params: SimulationParameters): SimulationResult {
    this.applyParams(params);
    this.rebuildVisuals();

    if (this.context.modelRoot && this.context.modelRoot.children.length > 0) {
      if (this.params.highlight === 1) {
        this.context.highlightMesh("ThirdEstate_PeasantVendor");
      } else if (this.params.highlight === 2) {
        this.context.highlightMesh("SecondEstate_Nobility");
      } else if (this.params.highlight === 3) {
        this.context.highlightMesh("ParisTriumphalArch");
      } else {
        this.context.highlightMesh(null);
      }
    }

    return this.getResults();
  }

  private rebuildVisuals(): void {
    clearGroupWithDispose(this.dynamicGroup);
    this.animMeshes = [];

    // When an external 3D model (GLB) is loaded (e.g. Paris French Revolution street scene),
    // skip building procedural timeline blocks that clash with the 3D model geometry.
    if (this.context.modelRoot && this.context.modelRoot.children.length > 0) {
      return;
    }

    const id = this.params.chapterId;
    if (id === "nationalism-europe") this.buildNationalismEurope();
    else if (id === "nationalism-india") this.buildNationalismIndia();
    else if (id === "global-world") this.buildGlobalWorld();
    else if (id === "industrialisation") this.buildIndustrialisation();
    else if (id === "print-culture") this.buildPrintCulture();
  }

  // 1. Nationalism in Europe (1789 - 1871)
  private buildNationalismEurope(): void {
    // Timeline base
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(11, 0.2, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 })
    );
    base.position.set(0, -1.5, 0);
    this.dynamicGroup.add(base);

    const events = [
      { year: 1789, name: "Era_1789", title: "1789 French Rev", color: 0x3b82f6, h: 2.8, x: -4.2 },
      { year: 1815, name: "Era_1815", title: "1815 Vienna", color: 0xef4444, h: 1.8, x: -2.1 },
      { year: 1830, name: "Era_1830", title: "1830 July Rev", color: 0x10b981, h: 2.2, x: 0 },
      { year: 1848, name: "Era_1848", title: "1848 Spring", color: 0xf59e0b, h: 3.4, x: 2.1 },
      { year: 1871, name: "Era_1871", title: "1871 Unification", color: 0x8b5cf6, h: 4.0, x: 4.2 },
    ];

    events.forEach((ev) => {
      const isSelected = Math.abs(this.params.era - ev.year) < 15 || this.params.highlight > 0;
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, ev.h, 1.2),
        new THREE.MeshStandardMaterial({
          color: ev.color,
          roughness: 0.3,
          metalness: 0.2,
          emissive: isSelected ? ev.color : 0x000000,
          emissiveIntensity: isSelected ? 0.3 : 0,
        })
      );
      bar.position.set(ev.x, -1.4 + ev.h / 2, 0);
      bar.name = ev.name;
      this.dynamicGroup.add(bar);

      // Top capital/pedestal
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.7, 0.7, 0.2, 16),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 })
      );
      cap.position.set(ev.x, -1.4 + ev.h + 0.1, 0);
      this.dynamicGroup.add(cap);
      this.animMeshes.push(cap);
    });
  }

  // 2. Nationalism in India (1920 - 1942)
  private buildNationalismIndia(): void {
    // Tricolor base
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(9.5, 0.25, 2.8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
    );
    base.position.set(0, -1.8, 0);
    this.dynamicGroup.add(base);

    // 1920 Non-Cooperation Movement pillar (Saffron)
    const p1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.75, 0.85, 3.2, 24),
      new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3, metalness: 0.2 })
    );
    p1.position.set(-2.8, -0.2, 0);
    p1.name = "Movement_NCM";
    this.dynamicGroup.add(p1);

    // 1930 Civil Disobedience / Dandi Salt (White / Crystal)
    const p2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.85, 3.8, 24),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.4 })
    );
    p2.position.set(0, 0.1, 0);
    p2.name = "DandiSalt";
    this.dynamicGroup.add(p2);

    // Salt crystals atop 1930
    const saltMound = new THREE.Mesh(
      new THREE.ConeGeometry(0.65, 0.8, 16),
      new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.1, transmission: 0.6 })
    );
    saltMound.position.set(0, 2.4, 0);
    this.dynamicGroup.add(saltMound);
    this.animMeshes.push(saltMound);

    // 1942 Quit India Movement (Green)
    const p3 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.75, 0.85, 4.4, 24),
      new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.3, metalness: 0.2 })
    );
    p3.position.set(2.8, 0.4, 0);
    p3.name = "Movement_QIM";
    this.dynamicGroup.add(p3);

    // Charkha / Spinning wheel motif atop central monument
    const charkhaRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.85, 0.08, 12, 32),
      new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.6 })
    );
    charkhaRing.position.set(0, 3.5, 0);
    charkhaRing.name = "CharkhaWheel";
    this.dynamicGroup.add(charkhaRing);
    this.animMeshes.push(charkhaRing);

    // Interactive CBSE History Map Plate with Glowing Landmark Pins
    const mapPlate = new THREE.Mesh(
      new THREE.BoxGeometry(9.0, 0.15, 3.8),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 })
    );
    mapPlate.position.set(0, -2.1, 0);
    this.dynamicGroup.add(mapPlate);

    // 4 Key CBSE History Exam Map Landmarks
    const mapSites = [
      { id: "amritsar", label: "Amritsar (Jallianwala Bagh 1919)", x: -3.2, z: -1.0, col: 0xef4444 },
      { id: "champaran", label: "Champaran (Indigo 1917)", x: 2.2, z: -0.8, col: 0x3b82f6 },
      { id: "chauri-chaura", label: "Chauri Chaura (1922)", x: 1.4, z: -0.3, col: 0xf59e0b },
      { id: "dandi", label: "Dandi (Salt March 1930)", x: -2.8, z: 0.9, col: 0x10b981 },
      { id: "nagpur", label: "Nagpur Session (Dec 1920)", x: -0.2, z: 0.7, col: 0x8b5cf6 },
    ];

    mapSites.forEach((site) => {
      // Pin stem
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.65, 8),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      stem.position.set(site.x, -1.8, site.z);
      this.dynamicGroup.add(stem);

      // Pin head / sphere
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 16, 16),
        new THREE.MeshStandardMaterial({
          color: site.col,
          emissive: site.col,
          emissiveIntensity: 0.5,
          roughness: 0.2,
        })
      );
      head.position.set(site.x, -1.45, site.z);
      head.name = site.id;
      this.dynamicGroup.add(head);

      // Glowing pulse ring
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.32, 0.03, 8, 20),
        new THREE.MeshBasicMaterial({ color: site.col, transparent: true, opacity: 0.7 })
      );
      ring.position.set(site.x, -2.0, site.z);
      ring.rotation.x = Math.PI / 2;
      this.dynamicGroup.add(ring);
      this.animMeshes.push(ring);
    });
  }

  // 3. Making of a Global World
  private buildGlobalWorld(): void {
    // Globe / Map disc
    const mapDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(4.2, 4.2, 0.3, 40),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 })
    );
    mapDisc.position.set(0, -1.2, 0);
    this.dynamicGroup.add(mapDisc);

    // Continents / Trade hubs
    const hubs = [
      { name: "Asia_Hub", x: 2.2, z: 0.6, color: 0xf59e0b, label: "Asia" },
      { name: "Europe_Hub", x: -0.8, z: -1.8, color: 0x3b82f6, label: "Europe" },
      { name: "Americas_Hub", x: -2.8, z: 0.8, color: 0x10b981, label: "Americas" },
      { name: "Africa_Hub", x: -0.4, z: 1.2, color: 0xef4444, label: "Africa" },
    ];

    hubs.forEach((h) => {
      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.5, 0.5, 18),
        new THREE.MeshStandardMaterial({ color: h.color, metalness: 0.3 })
      );
      hub.position.set(h.x, -0.8, h.z);
      hub.name = h.name;
      this.dynamicGroup.add(hub);
    });

    // Silk Road & Trade Route Arcs
    const createRouteArc = (p1: THREE.Vector3, p2: THREE.Vector3, col: number, name: string) => {
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      mid.y += 2.2;
      const curve = new THREE.CatmullRomCurve3([p1, mid, p2]);
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 32, 0.07, 8, false),
        new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.4 })
      );
      tube.name = name;
      this.dynamicGroup.add(tube);
      return tube;
    };

    const silk = createRouteArc(new THREE.Vector3(2.2, -0.6, 0.6), new THREE.Vector3(-0.8, -0.6, -1.8), 0xfacc15, "SilkRoad_Arc");
    createRouteArc(new THREE.Vector3(-0.8, -0.6, -1.8), new THREE.Vector3(-2.8, -0.6, 0.8), 0x38bdf8, "Colonial_Arc");
    createRouteArc(new THREE.Vector3(-2.8, -0.6, 0.8), new THREE.Vector3(-0.4, -0.6, 1.2), 0xf43f5e, "Triangular_Arc");

    // Bretton Woods pillar
    const bw = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.8, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x6366f1, metalness: 0.4 })
    );
    bw.position.set(0, 0.8, 0);
    bw.name = "BrettonWoods";
    this.dynamicGroup.add(bw);
    this.animMeshes.push(silk);
  }

  // 4. Age of Industrialisation
  private buildIndustrialisation(): void {
    // Factory base floor
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(9.5, 0.25, 4.0),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 })
    );
    floor.position.set(0, -1.4, 0);
    this.dynamicGroup.add(floor);

    // Factory Hall (Victorian steam mill)
    const mill = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 2.6, 2.4),
      new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.8 })
    );
    mill.position.set(-1.8, 0, 0);
    mill.name = "SteamEngine";
    this.dynamicGroup.add(mill);

    // Roof
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(2.4, 1.1, 4),
      new THREE.MeshStandardMaterial({ color: 0x1e293b })
    );
    roof.position.set(-1.8, 1.8, 0);
    roof.rotation.y = Math.PI / 4;
    this.dynamicGroup.add(roof);

    // Tall Chimney
    const chimney = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.5, 4.2, 16),
      new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.9 })
    );
    chimney.position.set(-0.2, 1.0, -0.8);
    chimney.name = "FactoryChimney";
    this.dynamicGroup.add(chimney);

    // Handloom Cottage / Indian Weaver (comparison)
    const cottage = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1.8, 2.0),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 })
    );
    cottage.position.set(2.8, -0.4, 0);
    cottage.name = "IndiaWeaver";
    this.dynamicGroup.add(cottage);

    const cottageRoof = new THREE.Mesh(
      new THREE.ConeGeometry(1.8, 0.9, 4),
      new THREE.MeshStandardMaterial({ color: 0x78350f })
    );
    cottageRoof.position.set(2.8, 0.9, 0);
    cottageRoof.rotation.y = Math.PI / 4;
    this.dynamicGroup.add(cottageRoof);

    // Indian Mill in Bombay (1854)
    const bombayMill = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 1.8, 16),
      new THREE.MeshStandardMaterial({ color: 0x059669, metalness: 0.3 })
    );
    bombayMill.position.set(1.4, -0.4, 1.2);
    bombayMill.name = "IndiaMill";
    this.dynamicGroup.add(bombayMill);
  }

  // 5. Print Culture & Modern World
  private buildPrintCulture(): void {
    // Gutenberg Press Wooden Frame
    const pressFrame = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 3.8, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 })
    );
    pressFrame.position.set(-2.0, 0.5, 0);
    pressFrame.name = "GutenbergPress";
    this.dynamicGroup.add(pressFrame);

    // Big Screw & Platen lever
    const screw = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 2.2, 16),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7 })
    );
    screw.position.set(-2.0, 1.2, 0);
    this.dynamicGroup.add(screw);

    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 2.2, 12),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 })
    );
    handle.position.set(-2.0, 2.0, 0);
    handle.rotation.z = Math.PI / 2;
    this.dynamicGroup.add(handle);
    this.animMeshes.push(handle);

    // Stack of Printed Bibles / Books
    for (let i = 0; i < 4; i++) {
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.22, 1.2),
        new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0xb91c1c : 0xf8fafc, roughness: 0.4 })
      );
      book.position.set(1.8, -1.0 + i * 0.26, 0);
      book.name = i === 3 ? "LutherText" : `Book_${i}`;
      this.dynamicGroup.add(book);
    }

    // Bengal Gazette / Indian Newspaper roll
    const newsRoll = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 1.8, 20),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 })
    );
    newsRoll.position.set(2.0, 0.8, 0.6);
    newsRoll.rotation.x = Math.PI / 2;
    newsRoll.name = "IndianPress";
    this.dynamicGroup.add(newsRoll);
  }

  update(deltaTime: number, elapsedTime: number): void {
    this.floatTime += deltaTime;
    this.animMeshes.forEach((mesh) => {
      mesh.rotation.y = elapsedTime * 0.4;
    });
  }

  getResults(): SimulationResult {
    const cid = this.params.chapterId;
    const dataMap: Record<HistoryChapterId, { title: string; metrics: Record<string, string>; obs: string[] }> = {
      "nationalism-europe": {
        title: "Rise of Nationalism in Europe (1789–1871)",
        metrics: {
          "Primary Era": `${this.params.era}`,
          "Core Concept": "Nation-State Sovereignty",
          "French Revolution": "1789 (Liberty, Equality, Fraternity)",
          "1848 Revolutions": "Spring of Nations across Europe",
          "German Unification": "1871 (Bismarck, Versailles)",
          "Italian Unification": "1861-1871 (Cavour, Garibaldi, Mazzini)",
        },
        obs: [
          "Romantic nationalism cultivated cultural identity (language, folklore, folk dance) before political unification.",
          "Zollverein (1834) customs union unified German states economically before political unification.",
          "Bismarck used 3 wars (Denmark, Austria, France) to unite Germany under Prussian leadership.",
        ],
      },
      "nationalism-india": {
        title: "Nationalism in India (1920–1942)",
        metrics: {
          "Non-Cooperation": "1920–1922 (Ended at Chauri Chaura)",
          "Civil Disobedience": "1930 (Dandi Salt March, 240 miles)",
          "Quit India Movement": "1942 ('Do or Die' at Bombay)",
          "Symbol": "Charkha & Khadi (Self-Reliance)",
          "Poorna Swaraj": "Lahore Session, Dec 1929",
        },
        obs: [
          "Gandhi chose salt because it transcended all caste and religious divisions across India.",
          "Jallianwala Bagh (1919) and Khilafat issue catalysed the Non-Cooperation Movement.",
          "Quit India was the largest unguided mass rebellion in modern Indian history.",
        ],
      },
      "global-world": {
        title: "Making of a Global World",
        metrics: {
          "Pre-Modern": "Silk Road (China–India–Europe)",
          "Colonial Trade": "Triangular Atlantic Trade",
          "Great Depression": "1929 (World trade fell by 66%)",
          "Bretton Woods": "1944 (IMF & World Bank created)",
          "Corn Laws Repeal": "1846 in Britain (Free trade era)",
        },
        obs: [
          "Globalisation preceded modern times: spices, silk, and silver connected continents for millennia.",
          "Great Depression showed the vulnerability of integrated global commodity and financial markets.",
          "Bretton Woods established fixed exchange rates tied to US dollar at $35/ounce of gold.",
        ],
      },
      "industrialisation": {
        title: "Age of Industrialisation",
        metrics: {
          "Proto-Industry": "Putting-out cottage system (pre-1760)",
          "First Factory": "Richard Arkwright's water frame (1769)",
          "India First Cotton Mill": "Bombay, 1854 (Cowasji Davar)",
          "India First Jute Mill": "Rishra (Calcutta), 1855",
          "De-industrialisation": "Tariff asymmetry ruined Indian weavers",
        },
        obs: [
          "Proto-industrialisation mobilised rural labour before steam-powered factories emerged.",
          "India shifted from being the world's leading exporter of fine textiles to a raw cotton exporter.",
          "Indian mills specialised in coarse yarn to avoid direct competition with Manchester.",
        ],
      },
      "print-culture": {
        title: "Print Culture & Modern World",
        metrics: {
          "Oldest Book": "Diamond Sutra (868 CE, China)",
          "Movable Type Press": "Gutenberg (Mainz, 1448)",
          "First Gutenberg Bible": "1455 (180 copies)",
          "India First Newspaper": "Bengal Gazette, 1780 (Hicky)",
          "Key Reformer Press": "Kesari (Tilak) & Sambad Kaumudi (Roy)",
        },
        obs: [
          "Print democratised access to knowledge and sparked the Protestant Reformation (1517).",
          "Print culture fostered public debate on social evils like sati, caste, and religious dogmas.",
          "Vernacular press played an indispensable role in mobilising anti-colonial nationalism in India.",
        ],
      },
    };

    const cur = dataMap[cid];
    return {
      metrics: cur.metrics,
      summary: cur.title,
      observations: cur.obs,
    };
  }

  reset(): void {
    this.params = { ...this.initialParams };
    this.rebuildVisuals();
  }

  dispose(): void {
    clearGroupWithDispose(this.dynamicGroup);
    this.animMeshes = [];
  }
}
