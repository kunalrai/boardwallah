import * as THREE from "three";
import type {
  Simulation,
  SimulationContext,
  SimulationParameters,
  SimulationResult,
} from "../interfaces/Simulation";
import { clearGroupWithDispose } from "../optics/opticsVisuals";

export type EconomicsChapterId =
  | "development"
  | "sectors-economy"
  | "money-credit"
  | "globalisation"
  | "consumer-rights";

export class EconomicsSimulation implements Simulation {
  public readonly id = "sst-economics";

  private context!: SimulationContext;
  private dynamicGroup = new THREE.Group();
  private params: { chapterId: EconomicsChapterId; indicator: string; year: number } = {
    chapterId: "development",
    indicator: "hdi",
    year: 2022,
  };
  private initialParams = { ...this.params };

  initialize(context: SimulationContext, initialParams: SimulationParameters): void {
    this.context = context;
    this.dynamicGroup.name = "__SstEconomicsGroup";
    this.context.simulationGroup.add(this.dynamicGroup);
    this.applyParams(initialParams);
    this.initialParams = { ...this.params };
    this.rebuildVisuals();
  }

  private applyParams(p: SimulationParameters): void {
    const valid: EconomicsChapterId[] = [
      "development",
      "sectors-economy",
      "money-credit",
      "globalisation",
      "consumer-rights",
    ];
    if (typeof p.chapterId === "string" && valid.includes(p.chapterId as EconomicsChapterId)) {
      this.params.chapterId = p.chapterId as EconomicsChapterId;
    }
    if (typeof p.indicator === "string") {
      this.params.indicator = p.indicator;
    }
    if (typeof p.year === "number") {
      this.params.year = p.year;
    }
  }

  setParameters(params: SimulationParameters): SimulationResult {
    this.applyParams(params);
    this.rebuildVisuals();
    return this.getResults();
  }

  private rebuildVisuals(): void {
    clearGroupWithDispose(this.dynamicGroup);

    const id = this.params.chapterId;
    if (id === "development") this.buildDevelopment();
    else if (id === "sectors-economy") this.buildSectors();
    else if (id === "money-credit") this.buildCredit();
    else if (id === "globalisation") this.buildGlobalisation();
    else if (id === "consumer-rights") this.buildConsumer();
  }

  // 1. Development: Human Development Index (HDI) & Indicators
  private buildDevelopment(): void {
    const countries = [
      { name: "HDI_Germany", label: "Germany (HDI 0.942)", val: 4.7, color: 0x10b981, x: -2.8 },
      { name: "HDI_SriLanka", label: "Sri Lanka (HDI 0.782)", val: 3.9, color: 0x3b82f6, x: 0 },
      { name: "HDI_India", label: "India (HDI 0.633)", val: 3.1, color: 0xf59e0b, x: 2.8 },
    ];

    const base = new THREE.Mesh(
      new THREE.BoxGeometry(8.5, 0.25, 2.8),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 })
    );
    base.position.set(0, -1.5, 0);
    this.dynamicGroup.add(base);

    countries.forEach((c) => {
      const bar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.7, 0.7, c.val, 24),
        new THREE.MeshStandardMaterial({ color: c.color, roughness: 0.3, metalness: 0.2 })
      );
      bar.position.set(c.x, -1.4 + c.val / 2, 0);
      bar.name = c.name;
      this.dynamicGroup.add(bar);
    });
  }

  // 2. Sectors of the Indian Economy: Structural Paradox (GDP vs Employment)
  private buildSectors(): void {
    // Primary Sector: 17% GDP, 50% Employment (Green)
    const pGdp = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.7, 1.0), new THREE.MeshStandardMaterial({ color: 0x16a34a }));
    pGdp.position.set(-3.2, -1.4 + 0.85, 0);
    pGdp.name = "PrimaryBar";
    const pEmp = new THREE.Mesh(new THREE.BoxGeometry(1.0, 5.0, 1.0), new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.2 }));
    pEmp.position.set(-2.0, -1.4 + 2.5, 0);
    this.dynamicGroup.add(pGdp, pEmp);

    // Secondary Sector: 26% GDP, 22% Employment (Blue)
    const sGdp = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.6, 1.0), new THREE.MeshStandardMaterial({ color: 0x2563eb }));
    sGdp.position.set(-0.6, -1.4 + 1.3, 0);
    const sEmp = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.2, 1.0), new THREE.MeshStandardMaterial({ color: 0x60a5fa, roughness: 0.2 }));
    sEmp.position.set(0.6, -1.4 + 1.1, 0);
    this.dynamicGroup.add(sGdp, sEmp);

    // Tertiary Sector: 57% GDP, 28% Employment (Purple/Gold)
    const tGdp = new THREE.Mesh(new THREE.BoxGeometry(1.0, 5.7, 1.0), new THREE.MeshStandardMaterial({ color: 0x7c3aed }));
    tGdp.position.set(2.0, -1.4 + 2.85, 0);
    tGdp.name = "TertiaryBar";
    const tEmp = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.8, 1.0), new THREE.MeshStandardMaterial({ color: 0xa78bfa, roughness: 0.2 }));
    tEmp.position.set(3.2, -1.4 + 1.4, 0);
    this.dynamicGroup.add(tGdp, tEmp);
  }

  // 3. Money and Credit: Formal vs Informal
  private buildCredit(): void {
    // Formal Sector Banking Tower (RBI, Commercial Banks - 40%)
    const formal = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 4.0, 2.0),
      new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.4, roughness: 0.3 })
    );
    formal.position.set(-2.2, 0.5, 0);
    formal.name = "MoneyFlow";
    this.dynamicGroup.add(formal);

    // Informal Sector (Moneylenders, 60% with 40-120% interest)
    const informal = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 4.6, 2.0),
      new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.5 })
    );
    informal.position.set(2.2, 0.8, 0);
    informal.name = "SHGNode";
    this.dynamicGroup.add(informal);
  }

  // 4. Globalisation and the Indian Economy: Trade Network
  private buildGlobalisation(): void {
    // Central India Hub
    const indiaHub = new THREE.Mesh(
      new THREE.CylinderGeometry(1.0, 1.0, 0.5, 24),
      new THREE.MeshStandardMaterial({ color: 0xf97316, metalness: 0.4 })
    );
    indiaHub.position.set(0, 0, 0);
    indiaHub.name = "TradeNetwork";
    this.dynamicGroup.add(indiaHub);

    // MNC Satellite Nodes (USA, EU, East Asia)
    const partners = [
      { name: "MNCNodes", x: -3.2, z: 0.8, col: 0x3b82f6 },
      { name: "Node_EU", x: -1.8, z: -2.4, col: 0x10b981 },
      { name: "Node_Asia", x: 3.2, z: 0.4, col: 0xf59e0b },
    ];

    partners.forEach((p) => {
      const node = new THREE.Mesh(
        new THREE.SphereGeometry(0.65, 18, 18),
        new THREE.MeshStandardMaterial({ color: p.col, roughness: 0.3 })
      );
      node.position.set(p.x, 0, p.z);
      node.name = p.name;
      this.dynamicGroup.add(node);

      // Connecting Trade Arc
      const mid = new THREE.Vector3().addVectors(new THREE.Vector3(0, 0, 0), node.position).multiplyScalar(0.5);
      mid.y += 1.6;
      const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), mid, node.position]);
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 20, 0.05, 8, false),
        new THREE.MeshBasicMaterial({ color: p.col })
      );
      this.dynamicGroup.add(tube);
    });
  }

  // 5. Consumer Rights: 6-Tier Rights Pyramid & Consumer Courts
  private buildConsumer(): void {
    // 6 Rights Layers Pyramid (SICHRE)
    const colors = [0x1e3a8a, 0x2563eb, 0x0284c7, 0x0d9488, 0x16a34a, 0xca8a04];
    for (let i = 0; i < 6; i++) {
      const w = 4.6 - i * 0.6;
      const layer = new THREE.Mesh(
        new THREE.BoxGeometry(w, 0.55, 2.0),
        new THREE.MeshStandardMaterial({ color: colors[i], roughness: 0.3 })
      );
      layer.position.set(0, -1.4 + i * 0.65, 0);
      if (i === 5) layer.name = "RightsPyramid";
      this.dynamicGroup.add(layer);
    }
  }

  update(): void {}

  getResults(): SimulationResult {
    const cid = this.params.chapterId;
    const dataMap: Record<EconomicsChapterId, { title: string; metrics: Record<string, string>; obs: string[] }> = {
      "development": {
        title: "Development: GDP vs Human Well-Being",
        metrics: {
          "UNDP HDI Formula": "Life Expectancy + Education + GNI per capita",
          "Germany HDI": "0.942 (Very High Human Development)",
          "Sri Lanka HDI": "0.782 (High Human Development)",
          "India HDI": "0.633 (Rank 132/191, Medium)",
          "Kerala Paradox": "Lower per-capita income than Haryana, but lowest IMR (12)",
        },
        obs: [
          "Money in your pocket cannot buy all goods and services needed for a flourishing life (pollution-free air, unadulterated medicine).",
          "Public provisioning of healthcare and schooling produces far superior developmental outcomes than private income alone.",
        ],
      },
      "sectors-economy": {
        title: "Sectors of the Indian Economy",
        metrics: {
          "Primary Sector": "17% GDP | 50% Employment (Agriculture & Allied)",
          "Secondary Sector": "26% GDP | 22% Employment (Industry & Construction)",
          "Tertiary Sector": "57% GDP | 28% Employment (Services & IT)",
          "Structural Shift": "Tertiary grew 14x since 1973; employment shifted minimally",
          "Unorganised Sector": "Employs ~90% of India's total workforce without social security",
        },
        obs: [
          "Disguised unemployment in rural agriculture means millions can be relocated without reducing total cereal output.",
          "MNREGA (2005) provides a legal right to 100 days of guaranteed wage employment per rural household.",
        ],
      },
      "money-credit": {
        title: "Money and Credit",
        metrics: {
          "Barter Problem": "Eliminated double coincidence of wants",
          "Formal Sector": "Banks & Cooperatives (~40% of rural credit, 8–12% interest)",
          "Informal Sector": "Moneylenders & traders (~60% rural credit, 36–120% interest)",
          "Debt Trap": "High informal interest consumes borrowers' entire crop surplus",
          "SHG Revolution": "Self-Help Groups (15–20 rural women per group saving collectively)",
        },
        obs: [
          "The Reserve Bank of India (RBI) mandates commercial banks to lend 40% of their net credit to Priority Sectors.",
          "Collateral requirements prevent poorest rural households from accessing institutional bank loans.",
        ],
      },
      "globalisation": {
        title: "Globalisation & the Indian Economy",
        metrics: {
          "1991 Reforms": "LPG (Liberalisation, Privatisation, Globalisation)",
          "WTO Role": "164 member nations enforcing multilateral trade rules",
          "MNC Influence": "Foreign direct investment in automobiles, electronics, and fast food",
          "Indian MNCs": "Tata Motors (JLR), Infosys, Ranbaxy, Asian Paints",
          "SEZ Incentives": "Special Economic Zones with tax holidays and world-class infrastructure",
        },
        obs: [
          "Containerised shipping and telecommunications collapsed global transport and communication friction.",
          "Small domestic producers (batteries, capacitors, toys) suffered catastrophic displacement under open imports.",
        ],
      },
      "consumer-rights": {
        title: "Consumer Rights (COPRA 1986 & 2019)",
        metrics: {
          "6 Consumer Rights": "Safety, Information, Choice, Representation, Redressal, Education",
          "District Forum": "Claims up to ₹1 Crore",
          "State Commission": "Claims between ₹1 Crore and ₹10 Crore",
          "National Commission": "NCDRC (New Delhi) for claims exceeding ₹10 Crore",
          "Quality Marks": "ISI (Industrial), Agmark (Agricultural), Hallmark (Gold purity)",
        },
        obs: [
          "Under COPRA, consumers can file grievances in consumer courts without hiring an advocate.",
          "World Consumer Rights Day is observed on March 15; National Consumer Day in India on December 24.",
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
  }
}
