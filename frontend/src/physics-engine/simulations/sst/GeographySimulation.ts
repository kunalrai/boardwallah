import * as THREE from "three";
import type {
  Simulation,
  SimulationContext,
  SimulationParameters,
  SimulationResult,
} from "../interfaces/Simulation";
import { clearGroupWithDispose } from "../optics/opticsVisuals";

export type GeographyChapterId =
  | "resources-development"
  | "forest-wildlife"
  | "water-resources"
  | "agriculture"
  | "minerals-energy"
  | "manufacturing"
  | "lifelines";

export class GeographySimulation implements Simulation {
  public readonly id = "sst-geography";

  private context!: SimulationContext;
  private dynamicGroup = new THREE.Group();
  private params: { chapterId: GeographyChapterId; layer: number; showData: boolean } = {
    chapterId: "resources-development",
    layer: 0,
    showData: true,
  };
  private initialParams = { ...this.params };
  private rotatingGroup: THREE.Group | null = null;

  initialize(context: SimulationContext, initialParams: SimulationParameters): void {
    this.context = context;
    this.dynamicGroup.name = "__SstGeographyGroup";
    this.context.simulationGroup.add(this.dynamicGroup);
    this.applyParams(initialParams);
    this.initialParams = { ...this.params };
    this.rebuildVisuals();
  }

  private applyParams(p: SimulationParameters): void {
    const valid: GeographyChapterId[] = [
      "resources-development",
      "forest-wildlife",
      "water-resources",
      "agriculture",
      "minerals-energy",
      "manufacturing",
      "lifelines",
    ];
    if (typeof p.chapterId === "string" && valid.includes(p.chapterId as GeographyChapterId)) {
      this.params.chapterId = p.chapterId as GeographyChapterId;
    }
    if (typeof p.layer === "number") {
      this.params.layer = p.layer;
    } else if (typeof p.layer === "string") {
      this.params.layer = parseInt(p.layer, 10) || 0;
    }
    if (typeof p.showData === "boolean") {
      this.params.showData = p.showData;
    }
  }

  setParameters(params: SimulationParameters): SimulationResult {
    this.applyParams(params);
    this.rebuildVisuals();
    return this.getResults();
  }

  private rebuildVisuals(): void {
    clearGroupWithDispose(this.dynamicGroup);
    this.rotatingGroup = null;

    const id = this.params.chapterId;
    if (id === "resources-development") this.buildResources();
    else if (id === "forest-wildlife") this.buildForests();
    else if (id === "water-resources") this.buildWater();
    else if (id === "agriculture") this.buildAgriculture();
    else if (id === "minerals-energy") this.buildEnergy();
    else if (id === "manufacturing") this.buildManufacturing();
    else if (id === "lifelines") this.buildLifelines();
  }

  // 1. Resources and Development: Land Use Bar Pillars
  private buildResources(): void {
    const categories = [
      { name: "LandBar_NetSown", label: "Net Sown Area (46%)", pct: 4.6, color: 0x16a34a, x: -3.8 },
      { name: "LandBar_Forest", label: "Forest Cover (23%)", pct: 2.3, color: 0x15803d, x: -2.3 },
      { name: "LandBar_Barren", label: "Barren / Wasteland (14%)", pct: 1.4, color: 0x78716c, x: -0.8 },
      { name: "LandBar_Fallow", label: "Fallow Land (7%)", pct: 0.7, color: 0xd97706, x: 0.7 },
      { name: "LandBar_Waste", label: "Culturable Waste (6%)", pct: 0.6, color: 0xb45309, x: 2.2 },
      { name: "LandBar_Pasture", label: "Permanent Pasture (4%)", pct: 0.4, color: 0xa3e635, x: 3.7 },
    ];

    const base = new THREE.Mesh(
      new THREE.BoxGeometry(9.5, 0.25, 2.5),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 })
    );
    base.position.set(0, -1.5, 0);
    this.dynamicGroup.add(base);

    categories.forEach((c) => {
      const bar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.55, c.pct, 20),
        new THREE.MeshStandardMaterial({ color: c.color, roughness: 0.3, metalness: 0.1 })
      );
      bar.position.set(c.x, -1.4 + c.pct / 2, 0);
      bar.name = c.name;
      this.dynamicGroup.add(bar);
    });
  }

  // 2. Forest and Wildlife Resources
  private buildForests(): void {
    const types = [
      { name: "ForestBar_Reserved", label: "Reserved Forests (53%)", h: 4.2, color: 0x065f46, x: -2.6 },
      { name: "ForestBar_Protected", label: "Protected Forests (29%)", h: 2.8, color: 0x059669, x: 0 },
      { name: "ForestBar_Unclassed", label: "Unclassed Forests (18%)", h: 1.8, color: 0x34d399, x: 2.6 },
    ];

    types.forEach((t) => {
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(0.75, 0.85, t.h, 24),
        new THREE.MeshStandardMaterial({ color: t.color, roughness: 0.3 })
      );
      col.position.set(t.x, -1.5 + t.h / 2, 0);
      col.name = t.name;
      this.dynamicGroup.add(col);

      // Tree foliage canopy atop each pillar
      const canopy = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.85, 1),
        new THREE.MeshStandardMaterial({ color: t.color, roughness: 0.8 })
      );
      canopy.position.set(t.x, -1.5 + t.h + 0.6, 0);
      this.dynamicGroup.add(canopy);
    });

    // Project Tiger emblem pillar
    const tiger = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 1.4, 1.4),
      new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4, metalness: 0.2 })
    );
    tiger.position.set(0, 2.5, 0);
    tiger.name = "TigerReserve";
    this.dynamicGroup.add(tiger);
  }

  // 3. Water Resources: 3D Dam Cross Section
  private buildWater(): void {
    // Concrete Dam Wall (Trapezoidal / sloping)
    const damGeo = new THREE.CylinderGeometry(1.2, 3.2, 3.8, 4, 1, false, Math.PI / 4);
    const damMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.6, metalness: 0.3 });
    const dam = new THREE.Mesh(damGeo, damMat);
    dam.position.set(0, 0, 0);
    dam.name = "DamStructure";
    this.dynamicGroup.add(dam);

    // Upstream Reservoir Water
    const water = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 2.8, 3.6),
      new THREE.MeshPhysicalMaterial({ color: 0x0284c7, transparent: true, opacity: 0.75, roughness: 0.1 })
    );
    water.position.set(-2.4, -0.4, 0);
    water.name = "WaterReservoir";
    this.dynamicGroup.add(water);

    // Spillway and Downstream River
    const spillway = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.4, 1.8),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2 })
    );
    spillway.position.set(1.4, -1.4, 0);
    this.dynamicGroup.add(spillway);

    // Traditional Rainwater Tank (Tanka / Kund)
    const tanka = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.65, 1.2, 20),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 })
    );
    tanka.position.set(3.2, 0.2, 1.2);
    tanka.name = "RainwaterHarvest";
    this.dynamicGroup.add(tanka);

    // Interactive CBSE Dam Map Pins
    const damPins = [
      { id: "bhakra-nangal", x: -2.8, z: -1.2, col: 0x3b82f6 },
      { id: "hirakud", x: 1.8, z: 0.8, col: 0x10b981 },
      { id: "sardar-sarovar", x: -1.2, z: 1.2, col: 0xf59e0b },
    ];
    damPins.forEach((d) => {
      const pin = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 16, 16),
        new THREE.MeshStandardMaterial({ color: d.col, emissive: d.col, emissiveIntensity: 0.4 })
      );
      pin.position.set(d.x, 1.2, d.z);
      pin.name = d.id;
      this.dynamicGroup.add(pin);
    });
  }

  // 4. Agriculture: Kharif vs Rabi Crops
  private buildAgriculture(): void {
    // Kharif Crop Platform (Green / Monsoon)
    const kharifBase = new THREE.Mesh(
      new THREE.BoxGeometry(4.0, 0.3, 3.2),
      new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.6 })
    );
    kharifBase.position.set(-2.5, -1.4, 0);
    this.dynamicGroup.add(kharifBase);

    // Rice (Kharif)
    const rice = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.55, 3.2, 16),
      new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.4 })
    );
    rice.position.set(-2.5, 0.3, 0);
    rice.name = "KharifBar_Rice";
    this.dynamicGroup.add(rice);

    // Rabi Crop Platform (Golden / Winter)
    const rabiBase = new THREE.Mesh(
      new THREE.BoxGeometry(4.0, 0.3, 3.2),
      new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.6 })
    );
    rabiBase.position.set(2.5, -1.4, 0);
    this.dynamicGroup.add(rabiBase);

    // Wheat (Rabi)
    const wheat = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.55, 3.2, 16),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 })
    );
    wheat.position.set(2.5, 0.3, 0);
    wheat.name = "RabiBar_Wheat";
    this.dynamicGroup.add(wheat);
  }

  // 5. Minerals and Energy Resources
  private buildEnergy(): void {
    // Conventional Energy Pillars: Coal (55%), Oil (35%), Gas (10%)
    const coal = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 3.5, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 })
    );
    coal.position.set(-3.2, 0.25, 0);
    coal.name = "EnergyBar_Coal";
    this.dynamicGroup.add(coal);

    const oil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.6, 2.4, 18),
      new THREE.MeshStandardMaterial({ color: 0x92400e, metalness: 0.5 })
    );
    oil.position.set(-1.4, -0.3, 0);
    oil.name = "EnergyBar_Oil";
    this.dynamicGroup.add(oil);

    // Non-Conventional Renewable Energy Tower (Solar / Wind)
    const renewable = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.4, 4.2, 16),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7 })
    );
    renewable.position.set(2.2, 0.6, 0);
    renewable.name = "RenewableBar";
    this.dynamicGroup.add(renewable);

    // Windmill blades atop renewable tower
    const blades = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 1.6, 0.05),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 })
      );
      blade.position.y = 0.8;
      const pivot = new THREE.Group();
      pivot.rotation.z = (i * Math.PI * 2) / 3;
      pivot.add(blade);
      blades.add(pivot);
    }
    blades.position.set(2.2, 2.7, 0.3);
    this.dynamicGroup.add(blades);
    this.rotatingGroup = blades;
  }

  // 6. Manufacturing Industries
  private buildManufacturing(): void {
    // Cotton Textile Mill (Mumbai - Ahmedabad)
    const textile = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 2.4, 2.0),
      new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.5 })
    );
    textile.position.set(-2.8, -0.3, 0);
    textile.name = "TextileCluster";
    this.dynamicGroup.add(textile);

    // Iron and Steel Plant (Chota Nagpur)
    const steel = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 3.2, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.3 })
    );
    steel.position.set(0.6, 0.1, 0);
    steel.name = "SteelCluster";
    this.dynamicGroup.add(steel);

    // Chemical cluster
    const chem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.7, 2.2, 18),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 })
    );
    chem.position.set(3.4, -0.4, 0);
    chem.name = "ChemCluster";
    this.dynamicGroup.add(chem);
  }

  // 7. Lifelines of National Economy
  private buildLifelines(): void {
    // Road Network Pillar (63.86 Lakh km - Vast)
    const road = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 4.4, 1.4),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 })
    );
    road.position.set(-2.4, 0.7, 0);
    road.name = "RoadNetwork";
    this.dynamicGroup.add(road);

    // Railways Pillar (67,956 km)
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 3.2, 1.4),
      new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.4 })
    );
    rail.position.set(0.6, 0.1, 0);
    rail.name = "RailNetwork";
    this.dynamicGroup.add(rail);

    // Waterways & Air
    const water = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.6, 1.8, 16),
      new THREE.MeshStandardMaterial({ color: 0x0d9488, metalness: 0.3 })
    );
    water.position.set(3.2, -0.6, 0);
    water.name = "WaterwayRoute";
    this.dynamicGroup.add(water);
  }

  update(deltaTime: number, _elapsedTime: number): void {
    if (this.rotatingGroup) {
      this.rotatingGroup.rotation.z += deltaTime * 2.0;
    }
  }

  getResults(): SimulationResult {
    const cid = this.params.chapterId;
    const dataMap: Record<GeographyChapterId, { title: string; metrics: Record<string, string>; obs: string[] }> = {
      "resources-development": {
        title: "Resources & Development",
        metrics: {
          "Net Sown Area": "46.2% (~141M hectares)",
          "Forest Cover": "23.4% (Target: 33%)",
          "Barren / Wasteland": "14.1%",
          "Fallow Land": "7.2%",
          "Major Soil": "Alluvial (43%) & Black (15%)",
        },
        obs: [
          "India's 1952 National Forest Policy mandates 33% forest cover for ecological balance.",
          "Black/Regur soil is self-aerating and ideal for Deccan cotton cultivation.",
          "Contour ploughing and shelterbelts prevent gully and sheet soil erosion.",
        ],
      },
      "forest-wildlife": {
        title: "Forest & Wildlife Resources",
        metrics: {
          "Reserved Forests": "53% of total forest cover",
          "Protected Forests": "29%",
          "Unclassed Forests": "18%",
          "Project Tiger": "1973 (Now 54 tiger reserves)",
          "Tiger Population": "3,167 (2022 Census)",
        },
        obs: [
          "Reserved forests are strictly controlled for timber and wildlife with no community felling.",
          "Joint Forest Management (JFM) originated in Odisha in 1988 for community stewardship.",
          "India houses 8% of recorded global biodiversity on only 2.4% of world land area.",
        ],
      },
      "water-resources": {
        title: "Water Resources",
        metrics: {
          "Global Freshwater": "4% (supporting 18% of population)",
          "Bhakra Nangal": "Sutlej River (Hydro + Irrigation)",
          "Hirakud Dam": "Mahanadi (Longest earthen: 25.8 km)",
          "Sardar Sarovar": "Narmada River (Gujarat/MP)",
          "Rainwater Systems": "Tankas, Johads, Kunds, Kuls",
        },
        obs: [
          "Nehru hailed multipurpose dams as the 'Temples of Modern India'.",
          "Narmada Bachao Andolan highlighted tribal displacement and river basin submergence.",
          "Rooftop rainwater harvesting was made compulsory in Tamil Nadu to restore aquifers.",
        ],
      },
      "agriculture": {
        title: "Agriculture in India",
        metrics: {
          "Kharif Season": "June–Oct (Monsoon: Rice, Maize, Cotton)",
          "Rabi Season": "Oct–April (Winter: Wheat, Mustard, Gram)",
          "Zaid Season": "March–June (Watermelon, Cucumber)",
          "Wheat Granary": "Punjab, Haryana, Western UP",
          "Golden Fibre": "Jute (West Bengal leading)",
        },
        obs: [
          "Green Revolution transformed India from food-deficient to self-reliant in cereals.",
          "Rice requires >100cm rainfall and warm temperatures (>25°C).",
          "Cotton requires 210 frost-free days and deep black volcanic soil.",
        ],
      },
      "minerals-energy": {
        title: "Minerals & Energy Resources",
        metrics: {
          "Coal Share": "55% of commercial energy",
          "Petroleum Hub": "Mumbai High (63% offshore yield)",
          "Renewable Target": "500 GW by 2030",
          "Bhadla Solar Park": "2,245 MW (Rajasthan, World Largest)",
          "Iron Ore Belt": "Odisha-Jharkhand (Haematite)",
        },
        obs: [
          "Chota Nagpur plateau is India's mineral heartland (iron, coal, manganese, mica).",
          "Gondwana coalfields contribute over 98% of India's total coal deposits.",
          "Non-conventional biogas and solar power offer carbon-neutral rural energy.",
        ],
      },
      "manufacturing": {
        title: "Manufacturing Industries",
        metrics: {
          "Cotton Textile": "Oldest industry (Mumbai 1854)",
          "First Steel Plant": "TISCO, Jamshedpur (1907)",
          "Silicon Valley": "Bengaluru (Software technology parks)",
          "Chemical Belt": "Gujarat petrochemical corridor",
          "Public Sector Steel": "SAIL (Bhilai, Rourkela, Durgapur)",
        },
        obs: [
          "Manufacturing sector contributes approximately 17% to India's GDP.",
          "Industrial agglomeration economies occur when factories cluster near ports and markets.",
          "Iron and steel plants require proximate raw materials (iron ore, coking coal, limestone).",
        ],
      },
      "lifelines": {
        title: "Lifelines of National Economy",
        metrics: {
          "Road Network": "63.86 Lakh km (2nd largest worldwide)",
          "Golden Quadrilateral": "5,846 km (Delhi-Mumbai-Chennai-Kolkata)",
          "Indian Railways": "67,956 km (4th largest globally)",
          "National Waterway 1": "Ganga: Prayagraj to Haldia (1,620 km)",
          "Major Sea Ports": "12 major ports handling 95% trade volume",
        },
        obs: [
          "Roadways carry 85% of passenger traffic and 70% of freight volume across India.",
          "Konkan Railway (760 km) overcame extreme Western Ghats terrain with 91 tunnels.",
          "Pipelines transport crude oil, petroleum products, and natural gas with negligible transit loss.",
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
    this.rotatingGroup = null;
  }
}
