import * as THREE from "three";
import type {
  Simulation,
  SimulationContext,
  SimulationParameters,
  SimulationResult,
} from "../interfaces/Simulation";
import { clearGroupWithDispose } from "../optics/opticsVisuals";

export type RealWorldSceneId =
  | "rusting"
  | "combustion"
  | "antacid"
  | "photography"
  | "bleaching"
  | "battery";

interface SceneInfo {
  name: string;
  realWorldContext: string;
  equation: string;
  reactionType: string;
  initialColor: number;
  finalColor: number;
  gasColor: number | null;
}

const SCENES: Record<RealWorldSceneId, SceneInfo> = {
  rusting: {
    name: "Rusting of Iron (Bridge / Nails / Cars)",
    realWorldContext: "Iron bridges, car bodies, nails left in rain corrode via oxidation.",
    equation: "4Fe(s) + 3O₂(g) + xH₂O(l) → 2Fe₂O₃·xH₂O(s)  [Rust]",
    reactionType: "Oxidation (Redox) — Slow Combustion",
    initialColor: 0x64748b,   // steel grey
    finalColor: 0xc2410c,     // rust orange-red
    gasColor: null,
  },
  combustion: {
    name: "LPG / Wood Combustion (Kitchen Burner / Campfire)",
    realWorldContext: "LPG (butane/propane) burns in kitchen stoves; wood campfires.",
    equation: "C₄H₁₀(g) + 13/2 O₂(g) → 4CO₂(g) + 5H₂O(g)  [LPG combustion]",
    reactionType: "Exothermic Combustion",
    initialColor: 0xfbbf24,   // fuel yellow
    finalColor: 0x1e293b,     // ash dark
    gasColor: 0x94a3b8,       // grey smoke
  },
  antacid: {
    name: "Antacid Tablet in Stomach Acid (NaHCO₃ + HCl)",
    realWorldContext: "Acidity/heartburn — ENO, Gelusil, baking soda relieve excess stomach acid.",
    equation: "NaHCO₃(s) + HCl(aq) → NaCl(aq) + H₂O(l) + CO₂(g)↑",
    reactionType: "Neutralisation — Acid + Base Salt",
    initialColor: 0xfef9c3,   // pale yellow acid
    finalColor: 0xdbeafe,     // neutral blue
    gasColor: 0xbfdbfe,       // CO₂ bubbles blue-white
  },
  photography: {
    name: "Silver Bromide in Camera Film (Photolysis)",
    realWorldContext: "Photographic film / X-ray film darkens in light — AgBr decomposes.",
    equation: "2AgBr(s) —hν→ 2Ag(s) + Br₂(g)  [Light causes decomposition]",
    reactionType: "Photolytic Decomposition",
    initialColor: 0xfef3c7,   // cream AgBr
    finalColor: 0x1f2937,     // black Ag deposits
    gasColor: 0xd97706,       // Br₂ orange vapour
  },
  bleaching: {
    name: "Bleaching Powder on Clothes / Water Treatment",
    realWorldContext: "CaOCl₂ bleaches coloured cloth and disinfects swimming pool water.",
    equation: "CaOCl₂(s) + H₂O(l) → Ca(OH)₂(aq) + Cl₂(g)  → bleaching/disinfection",
    reactionType: "Displacement — Cl₂ Release (Oxidising Agent)",
    initialColor: 0xfcd34d,   // yellow-stained cloth
    finalColor: 0xf8fafc,     // white bleached
    gasColor: 0xa3e635,       // Cl₂ greenish-yellow
  },
  battery: {
    name: "Daniel Cell / Zinc-Copper Electrochemical Battery",
    realWorldContext: "Dry cells, car batteries, phone batteries all use redox reactions to generate electricity.",
    equation: "Zn(s) + CuSO₄(aq) → ZnSO₄(aq) + Cu(s)  [Zn is oxidised, Cu²⁺ is reduced]",
    reactionType: "Redox — Oxidation + Reduction",
    initialColor: 0x0ea5e9,   // blue CuSO₄
    finalColor: 0xa3e635,     // pale green ZnSO₄
    gasColor: null,
  },
};

export class RealWorldChemistrySimulation implements Simulation {
  public readonly id = "chemistry-realworld";

  private context!: SimulationContext;
  private dynamicGroup = new THREE.Group();
  private params: { sceneId: RealWorldSceneId; progress: number; timeOn: boolean } = {
    sceneId: "rusting",
    progress: 0.6,
    timeOn: true,
  };
  private initialParams = { ...this.params };

  private flameMeshes: THREE.Mesh[] = [];
  private gasParticles: { mesh: THREE.Mesh; offset: number }[] = [];
  private rustLayer: THREE.Mesh | null = null;
  private electronMeshes: THREE.Mesh[] = [];
  private animTime = 0;

  initialize(context: SimulationContext, initialParams: SimulationParameters): void {
    this.context = context;
    this.dynamicGroup.name = "__RealWorldChemGroup";
    this.context.simulationGroup.add(this.dynamicGroup);
    this.applyParams(initialParams);
    this.initialParams = { ...this.params };
    this.rebuildVisuals();
  }

  private applyParams(p: SimulationParameters): void {
    const validScenes: RealWorldSceneId[] = ["rusting", "combustion", "antacid", "photography", "bleaching", "battery"];
    if (typeof p.sceneId === "string" && validScenes.includes(p.sceneId as RealWorldSceneId)) {
      this.params.sceneId = p.sceneId as RealWorldSceneId;
    }
    if (typeof p.progress === "number") {
      this.params.progress = Math.max(0, Math.min(1, p.progress));
    }
    if (typeof p.timeOn === "boolean") this.params.timeOn = p.timeOn;
  }

  setParameters(params: SimulationParameters): SimulationResult {
    this.applyParams(params);
    this.rebuildVisuals();
    return this.getResults();
  }

  private rebuildVisuals(): void {
    clearGroupWithDispose(this.dynamicGroup);
    this.flameMeshes = [];
    this.gasParticles = [];
    this.rustLayer = null;
    this.electronMeshes = [];

    const id = this.params.sceneId;
    if (id === "rusting")     this.buildRusting();
    else if (id === "combustion")  this.buildCombustion();
    else if (id === "antacid")     this.buildAntacid();
    else if (id === "photography") this.buildPhotography();
    else if (id === "bleaching")   this.buildBleaching();
    else if (id === "battery")     this.buildBattery();
  }

  // ─── Scene: Rusting ────────────────────────────────────────────────────────
  private buildRusting(): void {
    const p = this.params.progress;

    // Iron bridge beam
    const beam = new THREE.Mesh(
      new THREE.BoxGeometry(5.5, 0.55, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.75, roughness: 0.35 })
    );
    beam.name = "IronBeam";
    beam.position.set(0, 0, 0);
    this.dynamicGroup.add(beam);

    // Bridge support pillars
    [-2.1, 2.1].forEach((x) => {
      const pillar = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 2.2, 0.3),
        new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6 })
      );
      pillar.position.set(x, -1.4, 0);
      pillar.name = "IronPillar";
      this.dynamicGroup.add(pillar);
    });

    // Rust layer growing over the beam
    if (p > 0.05) {
      const rustGeo = new THREE.BoxGeometry(5.5 * p, 0.57, 0.92);
      const rustMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xb45309).lerp(new THREE.Color(0xc2410c), p),
        roughness: 0.85,
        metalness: 0,
      });
      const rust = new THREE.Mesh(rustGeo, rustMat);
      rust.name = "RustLayer";
      rust.position.set(-(5.5 * (1 - p)) / 2, 0.03, 0);
      this.dynamicGroup.add(rust);
      this.rustLayer = rust;
    }

    // Water droplets (rain / humidity)
    for (let i = 0; i < 8; i++) {
      const drop = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 10, 10),
        new THREE.MeshPhysicalMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.72 })
      );
      drop.position.set((i - 3.5) * 0.65, 0.5 + Math.sin(i * 1.3) * 0.2, 0.3);
      drop.name = "WaterDroplet";
      this.dynamicGroup.add(drop);
    }

    // O₂ molecules floating
    for (let i = 0; i < 6; i++) {
      const o2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x34d399 })
      );
      o2.position.set((i - 2.5) * 0.9, 1.4 + Math.sin(i) * 0.3, Math.cos(i * 1.4) * 0.5);
      o2.name = "OxygenMolecule";
      this.dynamicGroup.add(o2);
      this.electronMeshes.push(o2);
    }
  }

  // ─── Scene: Combustion ─────────────────────────────────────────────────────
  private buildCombustion(): void {
    const p = this.params.progress;

    // Stove burner body
    const burnerBody = new THREE.Mesh(
      new THREE.CylinderGeometry(1.1, 1.3, 0.55, 24),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, roughness: 0.5 })
    );
    burnerBody.position.set(0, -1.0, 0);
    burnerBody.name = "StoveBurner";
    this.dynamicGroup.add(burnerBody);

    // Gas ring
    const gasRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.9, 0.08, 10, 28),
      new THREE.MeshStandardMaterial({ color: 0x374151 })
    );
    gasRing.position.set(0, -0.68, 0);
    this.dynamicGroup.add(gasRing);

    // Flame cones (blue inner, orange outer)
    if (this.params.timeOn) {
      const flamePositions = Array.from({ length: 8 }, (_, i) => ({
        x: Math.cos((i / 8) * Math.PI * 2) * 0.9,
        z: Math.sin((i / 8) * Math.PI * 2) * 0.9,
      }));

      flamePositions.forEach(({ x, z }) => {
        // Outer orange flame
        const outer = new THREE.Mesh(
          new THREE.ConeGeometry(0.16, 0.65 + p * 0.3, 10),
          new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.85 })
        );
        outer.position.set(x, -0.3, z);
        this.dynamicGroup.add(outer);
        this.flameMeshes.push(outer);

        // Inner blue flame
        const inner = new THREE.Mesh(
          new THREE.ConeGeometry(0.08, 0.35, 8),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.9 })
        );
        inner.position.set(x, -0.3, z);
        this.dynamicGroup.add(inner);
        this.flameMeshes.push(inner);
      });
    }

    // Cooking pot on burner
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(1.3, 1.1, 1.1, 24, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6, roughness: 0.3, side: THREE.DoubleSide })
    );
    pot.position.set(0, 0.35, 0);
    pot.name = "CookingPot";
    this.dynamicGroup.add(pot);

    // CO₂ smoke particles
    if (p > 0.2 && this.params.timeOn) {
      for (let i = 0; i < 10; i++) {
        const smoke = new THREE.Mesh(
          new THREE.SphereGeometry(0.14 + i * 0.03, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.4 - i * 0.03 })
        );
        smoke.position.set(Math.sin(i * 0.9) * 0.3, 1.2 + i * 0.3, Math.cos(i * 1.1) * 0.3);
        smoke.name = "CO2Smoke";
        this.dynamicGroup.add(smoke);
        this.gasParticles.push({ mesh: smoke, offset: i / 10 });
      }
    }
  }

  // ─── Scene: Antacid ────────────────────────────────────────────────────────
  private buildAntacid(): void {
    const p = this.params.progress;

    // Stomach/glass beaker
    const stomach = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 1.1, 2.6, 24, 1, true),
      new THREE.MeshPhysicalMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.3, roughness: 0.1, side: THREE.DoubleSide })
    );
    stomach.position.set(0, 0, 0);
    stomach.name = "StomachVessel";
    this.dynamicGroup.add(stomach);

    // Stomach acid (yellow → blue as antacid neutralises)
    const acidColor = new THREE.Color(0xfef9c3).lerp(new THREE.Color(0xdbeafe), p);
    const acid = new THREE.Mesh(
      new THREE.CylinderGeometry(1.32, 1.05, 1.5, 24),
      new THREE.MeshStandardMaterial({ color: acidColor, transparent: true, opacity: 0.85 })
    );
    acid.position.set(0, -0.75, 0);
    acid.name = "StomachAcid";
    this.dynamicGroup.add(acid);

    // Antacid tablet dropping in
    const tablet = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.12, 20),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 })
    );
    tablet.position.set(0.2, 0.9 - p * 1.6, 0);
    tablet.name = "AntacidTablet";
    this.dynamicGroup.add(tablet);

    // CO₂ bubbles rising from neutralisation
    if (p > 0.15) {
      const bubbleCount = Math.floor(p * 14);
      for (let i = 0; i < bubbleCount; i++) {
        const bubble = new THREE.Mesh(
          new THREE.SphereGeometry(0.08 + Math.random() * 0.08, 10, 10),
          new THREE.MeshPhysicalMaterial({ color: 0xbfdbfe, transparent: true, opacity: 0.65 })
        );
        bubble.position.set(
          (Math.sin(i * 2.1) * 0.9),
          -0.8 + (i / bubbleCount) * 2.0,
          Math.cos(i * 1.7) * 0.7
        );
        bubble.name = "CO2Bubble";
        this.dynamicGroup.add(bubble);
        this.gasParticles.push({ mesh: bubble, offset: i / bubbleCount });
      }
    }

    // ENO/tablet label context
    const labelBlock = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.35, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x1a73e8 })
    );
    labelBlock.position.set(0.2, 1.4, 0);
    labelBlock.name = "ENOTablet";
    this.dynamicGroup.add(labelBlock);
  }

  // ─── Scene: Photography ────────────────────────────────────────────────────
  private buildPhotography(): void {
    const p = this.params.progress;

    // Camera film strip
    const filmBase = new THREE.Mesh(
      new THREE.BoxGeometry(5.0, 1.8, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.6 })
    );
    filmBase.position.set(0, 0, 0);
    filmBase.name = "FilmStrip";
    this.dynamicGroup.add(filmBase);

    // Film perforations
    for (let i = -4; i <= 4; i++) {
      const hole = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.28, 0.1),
        new THREE.MeshBasicMaterial({ color: 0x1e293b })
      );
      hole.position.set(i * 0.55, 0.65, 0.01);
      this.dynamicGroup.add(hole);
      const hole2 = hole.clone();
      hole2.position.set(i * 0.55, -0.65, 0.01);
      this.dynamicGroup.add(hole2);
    }

    // Darkening overlay — AgBr → Ag (silver) deposits
    const darkOverlay = new THREE.Mesh(
      new THREE.BoxGeometry(5.0 * p, 1.6, 0.09),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xfef3c7).lerp(new THREE.Color(0x1f2937), p),
        roughness: 0.5,
      })
    );
    darkOverlay.position.set(-(5.0 * (1 - p)) / 2, 0, 0.01);
    darkOverlay.name = "AgBrLayer";
    this.dynamicGroup.add(darkOverlay);

    // Photon rays (light hitting film)
    if (this.params.timeOn) {
      for (let i = -3; i <= 3; i++) {
        const ray = new THREE.Mesh(
          new THREE.CylinderGeometry(0.025, 0.025, 1.6, 8),
          new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.8 })
        );
        ray.position.set(i * 0.7, 1.9, 0);
        ray.name = "PhotonRay";
        this.dynamicGroup.add(ray);
        this.electronMeshes.push(ray);
      }
    }

    // Bromine vapour (Br₂ — orange)
    if (p > 0.3) {
      for (let i = 0; i < 8; i++) {
        const br = new THREE.Mesh(
          new THREE.SphereGeometry(0.11, 10, 10),
          new THREE.MeshBasicMaterial({ color: 0xd97706, transparent: true, opacity: 0.6 })
        );
        br.position.set((i - 3.5) * 0.6, -1.5 - Math.random() * 0.5, Math.sin(i) * 0.3);
        br.name = "BromineMolecule";
        this.dynamicGroup.add(br);
        this.gasParticles.push({ mesh: br, offset: i / 8 });
      }
    }
  }

  // ─── Scene: Bleaching ──────────────────────────────────────────────────────
  private buildBleaching(): void {
    const p = this.params.progress;

    // Fabric/cloth (rectangular sheet)
    const cloth = new THREE.Mesh(
      new THREE.BoxGeometry(4.0, 2.4, 0.06),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xfcd34d).lerp(new THREE.Color(0xf8fafc), p),
        roughness: 0.9,
      })
    );
    cloth.position.set(0, 0, 0);
    cloth.name = "FabricCloth";
    this.dynamicGroup.add(cloth);

    // Bleach powder spilling on cloth
    if (p > 0.0) {
      const powder = new THREE.Mesh(
        new THREE.BoxGeometry(3.8 * p, 0.12, 0.08),
        new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.9 })
      );
      powder.position.set(0, 0.5, 0.07);
      powder.name = "BleachPowder";
      this.dynamicGroup.add(powder);
    }

    // Cl₂ gas particles (greenish-yellow)
    if (p > 0.2) {
      for (let i = 0; i < 10; i++) {
        const cl2 = new THREE.Mesh(
          new THREE.SphereGeometry(0.13, 10, 10),
          new THREE.MeshBasicMaterial({ color: 0x84cc16, transparent: true, opacity: 0.55 })
        );
        cl2.position.set((i - 4.5) * 0.8, 1.6 + Math.sin(i * 0.9) * 0.3, Math.cos(i * 1.2) * 0.4);
        cl2.name = "ChlorineMolecule";
        this.dynamicGroup.add(cl2);
        this.gasParticles.push({ mesh: cl2, offset: i / 10 });
      }
    }

    // Water droplets activating bleach
    for (let i = 0; i < 6; i++) {
      const drop = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 10, 10),
        new THREE.MeshPhysicalMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.7 })
      );
      drop.position.set((i - 2.5) * 0.6, -1.0, 0.1);
      drop.name = "WaterActivator";
      this.dynamicGroup.add(drop);
    }
  }

  // ─── Scene: Battery ────────────────────────────────────────────────────────
  private buildBattery(): void {
    const p = this.params.progress;

    // Electrolyte beaker (CuSO₄ → ZnSO₄)
    const beaker = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.3, 2.4, 24, 1, true),
      new THREE.MeshPhysicalMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.28, side: THREE.DoubleSide })
    );
    beaker.position.set(0, 0, 0);
    beaker.name = "ElectrolyteBeaker";
    this.dynamicGroup.add(beaker);

    // Electrolyte solution colour (blue CuSO₄ → pale green ZnSO₄)
    const solColor = new THREE.Color(0x0ea5e9).lerp(new THREE.Color(0x86efac), p);
    const solution = new THREE.Mesh(
      new THREE.CylinderGeometry(1.42, 1.25, 2.0, 24),
      new THREE.MeshStandardMaterial({ color: solColor, transparent: true, opacity: 0.8 })
    );
    solution.position.set(0, -0.1, 0);
    solution.name = "ElectrolyteSolution";
    this.dynamicGroup.add(solution);

    // Zinc electrode (left) — getting oxidised (mass decreasing)
    const znHeight = 2.6 - p * 1.0;
    const zn = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, znHeight, 0.28),
      new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.7, roughness: 0.3 })
    );
    zn.position.set(-0.9, 0, 0);
    zn.name = "ZincElectrode";
    this.dynamicGroup.add(zn);

    // Copper electrode (right) — Cu depositing (getting thicker)
    const cu = new THREE.Mesh(
      new THREE.BoxGeometry(0.28 + p * 0.22, 2.6, 0.28 + p * 0.22),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x92400e).lerp(new THREE.Color(0xb45309), p),
        metalness: 0.6,
        roughness: 0.4,
      })
    );
    cu.position.set(0.9, 0, 0);
    cu.name = "CopperElectrode";
    this.dynamicGroup.add(cu);

    // Electrode label tops
    [-0.9, 0.9].forEach((x, i) => {
      const cap = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.18, 0.5),
        new THREE.MeshStandardMaterial({ color: i === 0 ? 0xf59e0b : 0xef4444 })
      );
      cap.position.set(x, 1.5, 0);
      this.dynamicGroup.add(cap);
    });

    // Zn²⁺ ions moving right → (oxidation)
    for (let i = 0; i < 6; i++) {
      const ion = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xd1d5db })
      );
      ion.position.set(-0.9 + (i / 6) * 1.8, (Math.sin(i * 1.1) * 0.6), Math.cos(i * 0.8) * 0.5);
      ion.name = "ZincIon";
      this.dynamicGroup.add(ion);
      this.electronMeshes.push(ion);
    }

    // Cu²⁺ ions moving left ← (reduction) in blue
    for (let i = 0; i < 6; i++) {
      const cu2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x0ea5e9 })
      );
      cu2.position.set(0.9 - (i / 6) * 1.8, (Math.cos(i * 1.3) * 0.5), Math.sin(i * 0.9) * 0.5);
      cu2.name = "CopperIon";
      this.dynamicGroup.add(cu2);
      this.gasParticles.push({ mesh: cu2, offset: i / 6 });
    }

    // External wire arc (top)
    const wirePts: THREE.Vector3[] = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      wirePts.push(new THREE.Vector3(
        -0.9 + t * 1.8,
        1.8 + Math.sin(t * Math.PI) * 0.9,
        0
      ));
    }
    const wireCurve = new THREE.CatmullRomCurve3(wirePts);
    const wireGeo = new THREE.TubeGeometry(wireCurve, 20, 0.04, 8, false);
    const wire = new THREE.Mesh(wireGeo, new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 }));
    wire.name = "ExternalWire";
    this.dynamicGroup.add(wire);

    // Bulb on wire
    const bulbColor = p > 0.3 ? 0xfef08a : 0x94a3b8;
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 16, 16),
      new THREE.MeshBasicMaterial({ color: bulbColor })
    );
    bulb.position.set(0, 2.75, 0);
    bulb.name = "LightBulb";
    this.dynamicGroup.add(bulb);
  }

  update(deltaTime: number, elapsedTime: number): void {
    this.animTime += deltaTime;
    const id = this.params.sceneId;

    // Flame flicker
    this.flameMeshes.forEach((f, i) => {
      const s = 0.9 + 0.18 * Math.sin(elapsedTime * 12 + i * 0.5);
      f.scale.set(1, s, 1);
    });

    // Gas/particle rise
    this.gasParticles.forEach((gp) => {
      if (id === "battery") {
        // Cu²⁺ ions drift toward electrode
        gp.mesh.position.x += Math.sin(this.animTime * 1.4 + gp.offset * 6) * 0.003;
      } else {
        const phase = ((elapsedTime * 0.4) + gp.offset) % 1.0;
        gp.mesh.position.y = (gp.mesh.userData.baseY ?? gp.mesh.position.y) + phase * 0.6;
        if (!gp.mesh.userData.baseY) gp.mesh.userData.baseY = gp.mesh.position.y;
      }
    });

    // Floating electrons / ions
    this.electronMeshes.forEach((m, i) => {
      if (id === "rusting") {
        m.position.y += Math.sin(elapsedTime * 1.2 + i * 0.8) * 0.004;
      } else if (id === "photography") {
        // Photon rays shimmering
        (m.material as THREE.MeshBasicMaterial).opacity = 0.5 + 0.4 * Math.abs(Math.sin(elapsedTime * 3 + i * 0.4));
      } else if (id === "battery") {
        // Zn²⁺ drift right
        m.position.x = Math.min(0.6, m.position.x + deltaTime * 0.08);
      }
    });

    // Rust layer slow grow
    if (this.rustLayer && id === "rusting" && this.params.timeOn) {
      (this.rustLayer.material as THREE.MeshStandardMaterial).roughness = 0.8 + Math.sin(elapsedTime * 0.5) * 0.05;
    }
  }

  getResults(): SimulationResult {
    const scene = SCENES[this.params.sceneId];
    const p = this.params.progress;

    const contextMap: Record<RealWorldSceneId, string[]> = {
      rusting: [
        "Prevention: paint, galvanisation (Zn coat), oil/grease, alloying (stainless steel).",
        "Corrosion is a slow oxidation — billions lost annually in infrastructure damage.",
        "Galvanisation uses zinc coating because Zn preferentially oxidises (sacrificial anode).",
      ],
      combustion: [
        "LPG has odorant (ethyl mercaptan) added to detect leaks — combustion itself is odourless.",
        "Incomplete combustion produces poisonous CO (carbon monoxide) — ensure ventilation.",
        "Combustion is exothermic — releases heat energy used in cooking, engines, rockets.",
      ],
      antacid: [
        "Baking soda (NaHCO₃) = antacid for heartburn. Also used in baking (CO₂ makes dough rise).",
        "ENO, Gelusil, Milk of Magnesia [Mg(OH)₂] all work by neutralising excess HCl in stomach.",
        "pH of stomach acid ≈ 1–2 (very acidic). After antacid: rises toward 4–5 (relief zone).",
      ],
      photography: [
        "AgBr is light-sensitive — used in X-ray films, photographic negatives.",
        "Development: exposed AgBr grains → Ag metal (black). Fixer (hypo) dissolves unexposed AgBr.",
        "Same photolytic decomposition principle used in solar cells (photovoltaic effect).",
      ],
      bleaching: [
        "Bleaching powder (CaOCl₂) releases Cl₂ in water → Cl₂ + H₂O → HCl + HOCl (bleaching agent).",
        "Used to disinfect drinking water, bleach paper pulp, whiten cotton textiles.",
        "Active ingredient is HOCl (hypochlorous acid) — oxidises coloured compounds to colourless ones.",
      ],
      battery: [
        "Zn is the anode (oxidation): Zn → Zn²⁺ + 2e⁻. Cu is the cathode (reduction): Cu²⁺ + 2e⁻ → Cu.",
        "Same redox principle powers AA batteries, car lead-acid batteries, lithium-ion phone batteries.",
        "Salt bridge (or porous membrane) maintains electrical neutrality by ion exchange.",
      ],
    };

    return {
      metrics: {
        "Real World Scene": scene.name,
        "Reaction Type": scene.reactionType,
        "Progress": `${Math.round(p * 100)}%`,
        "Reaction Equation": scene.equation,
        "Real World Use": scene.realWorldContext,
      },
      summary: scene.equation,
      observations: contextMap[this.params.sceneId] ?? [],
    };
  }

  reset(): void {
    this.params = { ...this.initialParams };
    this.rebuildVisuals();
  }

  dispose(): void {
    clearGroupWithDispose(this.dynamicGroup);
    this.flameMeshes = [];
    this.gasParticles = [];
    this.rustLayer = null;
    this.electronMeshes = [];
  }
}
