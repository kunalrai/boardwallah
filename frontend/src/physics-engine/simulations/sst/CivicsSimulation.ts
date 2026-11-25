import * as THREE from "three";
import type {
  Simulation,
  SimulationContext,
  SimulationParameters,
  SimulationResult,
} from "../interfaces/Simulation";
import { clearGroupWithDispose } from "../optics/opticsVisuals";

export type CivicsChapterId =
  | "power-sharing"
  | "federalism"
  | "democracy-diversity"
  | "gender-religion-caste"
  | "struggles-movements"
  | "political-parties"
  | "outcomes-democracy"
  | "challenges-democracy";

export class CivicsSimulation implements Simulation {
  public readonly id = "sst-civics";

  private context!: SimulationContext;
  private dynamicGroup = new THREE.Group();
  private params: { chapterId: CivicsChapterId; showComparison: boolean; highlight: number } = {
    chapterId: "power-sharing",
    showComparison: true,
    highlight: 0,
  };
  private initialParams = { ...this.params };
  private pulseMeshes: THREE.Mesh[] = [];

  initialize(context: SimulationContext, initialParams: SimulationParameters): void {
    this.context = context;
    this.dynamicGroup.name = "__SstCivicsGroup";
    this.context.simulationGroup.add(this.dynamicGroup);
    this.applyParams(initialParams);
    this.initialParams = { ...this.params };
    this.rebuildVisuals();
  }

  private applyParams(p: SimulationParameters): void {
    const valid: CivicsChapterId[] = [
      "power-sharing",
      "federalism",
      "democracy-diversity",
      "gender-religion-caste",
      "struggles-movements",
      "political-parties",
      "outcomes-democracy",
      "challenges-democracy",
    ];
    if (typeof p.chapterId === "string" && valid.includes(p.chapterId as CivicsChapterId)) {
      this.params.chapterId = p.chapterId as CivicsChapterId;
    }
    if (typeof p.showComparison === "boolean") {
      this.params.showComparison = p.showComparison;
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
    return this.getResults();
  }

  private rebuildVisuals(): void {
    clearGroupWithDispose(this.dynamicGroup);
    this.pulseMeshes = [];

    const id = this.params.chapterId;
    if (id === "power-sharing") this.buildPowerSharing();
    else if (id === "federalism") this.buildFederalism();
    else if (id === "democracy-diversity") this.buildDiversity();
    else if (id === "gender-religion-caste") this.buildInequality();
    else if (id === "struggles-movements") this.buildStruggles();
    else if (id === "political-parties") this.buildParties();
    else if (id === "outcomes-democracy") this.buildOutcomes();
    else if (id === "challenges-democracy") this.buildChallenges();
  }

  // 1. Power Sharing: Belgium vs Sri Lanka
  private buildPowerSharing(): void {
    // Belgium Model (Distributed balance)
    const belgiumBase = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.3, 3.2),
      new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.5 })
    );
    belgiumBase.position.set(-2.6, -1.4, 0);
    this.dynamicGroup.add(belgiumBase);

    // 3 Equal Pillars (Dutch 59%, French 40%, German 1% in harmony)
    const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 3.2, 18), new THREE.MeshStandardMaterial({ color: 0x3b82f6 }));
    b1.position.set(-3.6, 0.35, 0);
    const b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 3.2, 18), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
    b2.position.set(-2.6, 0.35, 0);
    const b3 = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 3.2, 18), new THREE.MeshStandardMaterial({ color: 0x10b981 }));
    b3.position.set(-1.6, 0.35, 0);
    b2.name = "Belgium_Model";
    this.dynamicGroup.add(b1, b2, b3);

    // Sri Lanka Majoritarian Monolith (Single dominant Sinhala block crushing Tamil minority)
    const slBase = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.3, 3.2),
      new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.5 })
    );
    slBase.position.set(2.6, -1.4, 0);
    this.dynamicGroup.add(slBase);

    const slSinhala = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 4.2, 2.0),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 })
    );
    slSinhala.position.set(2.2, 0.85, 0);
    slSinhala.name = "SriLanka_Model";
    this.dynamicGroup.add(slSinhala);

    const slTamil = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 1.2, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 })
    );
    slTamil.position.set(3.8, -0.65, 0);
    this.dynamicGroup.add(slTamil);
  }

  // 2. Federalism: 3-Tier Government Pyramid
  private buildFederalism(): void {
    // Tier 1: Union Government (Apex)
    const union = new THREE.Mesh(
      new THREE.CylinderGeometry(1.0, 1.4, 1.2, 24),
      new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.3, roughness: 0.3 })
    );
    union.position.set(0, 1.8, 0);
    union.name = "UnionList";
    this.dynamicGroup.add(union);

    // Tier 2: State Governments (28 States)
    const state = new THREE.Mesh(
      new THREE.CylinderGeometry(2.0, 2.5, 1.2, 24),
      new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.2, roughness: 0.4 })
    );
    state.position.set(0, 0.4, 0);
    state.name = "StateMap";
    this.dynamicGroup.add(state);

    // Tier 3: Local Governments (Panchayati Raj & Municipalities)
    const local = new THREE.Mesh(
      new THREE.CylinderGeometry(3.2, 3.6, 1.2, 24),
      new THREE.MeshStandardMaterial({ color: 0x16a34a, metalness: 0.1, roughness: 0.5 })
    );
    local.position.set(0, -1.0, 0);
    local.name = "PanchayatSystem";
    this.dynamicGroup.add(local);
  }

  // 3. Democracy and Diversity
  private buildDiversity(): void {
    const spheres = [
      { name: "Div_Race", col: 0xef4444, x: -1.6, y: 0.5, r: 1.3 },
      { name: "Div_Religion", col: 0x3b82f6, x: 1.6, y: 0.5, r: 1.3 },
      { name: "Div_Class", col: 0x10b981, x: 0, y: -1.2, r: 1.4 },
    ];

    spheres.forEach((s) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(s.r, 24, 24),
        new THREE.MeshPhysicalMaterial({ color: s.col, transparent: true, opacity: 0.65, roughness: 0.2 })
      );
      mesh.position.set(s.x, s.y, 0);
      mesh.name = s.name === "Div_Race" ? "DivisionOverlap" : s.name;
      this.dynamicGroup.add(mesh);
      this.pulseMeshes.push(mesh);
    });
  }

  // 4. Gender, Religion and Caste
  private buildInequality(): void {
    // Gender Representation Bar (Only ~15% Women in Parliament vs 50% Population)
    const women = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.5, 1.2),
      new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.3 })
    );
    women.position.set(-2.8, -0.65, 0);
    women.name = "GenderBar";
    this.dynamicGroup.add(women);

    const men = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 4.4, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3 })
    );
    men.position.set(-1.2, 0.8, 0);
    this.dynamicGroup.add(men);

    // Caste Reservations Representation
    const caste = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.2, 3.2, 24),
      new THREE.MeshStandardMaterial({ color: 0x8b5cf6, metalness: 0.2 })
    );
    caste.position.set(2.2, 0.2, 0);
    caste.name = "CasteBar";
    this.dynamicGroup.add(caste);
  }

  // 5. Popular Struggles and Movements
  private buildStruggles(): void {
    // Bolivia Water War Block (Cochabamba)
    const bolivia = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 3.2, 2.0),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 })
    );
    bolivia.position.set(-2.4, 0.2, 0);
    bolivia.name = "BoliviaProtest";
    this.dynamicGroup.add(bolivia);

    // Nepal Seven-Party Alliance & Democracy (2006)
    const nepal = new THREE.Mesh(
      new THREE.ConeGeometry(1.8, 3.8, 4),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 })
    );
    nepal.position.set(2.4, 0.5, 0);
    nepal.name = "NepalMovement";
    this.dynamicGroup.add(nepal);
  }

  // 6. Political Parties
  private buildParties(): void {
    // National Parties Hub (6 recognized)
    const national = new THREE.Mesh(
      new THREE.CylinderGeometry(1.8, 1.8, 2.2, 28),
      new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.4, metalness: 0.3 })
    );
    national.position.set(0, 0, 0);
    national.name = "NationalParties";
    this.dynamicGroup.add(national);

    // Satellite State Party Orbs
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.45, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 })
      );
      orb.position.set(Math.cos(angle) * 3.2, Math.sin(angle) * 1.8, 0);
      this.dynamicGroup.add(orb);
    }
  }

  // 7. Outcomes of Democracy
  private buildOutcomes(): void {
    const metrics = [
      { name: "AccountabilityBar", col: 0x10b981, h: 4.2, x: -3.0 },
      { name: "ResponsivenessBar", col: 0x3b82f6, h: 3.6, x: -1.0 },
      { name: "LegitimacyBar", col: 0x6366f1, h: 4.4, x: 1.0 },
      { name: "DignityBar", col: 0x8b5cf6, h: 4.8, x: 3.0 },
    ];

    metrics.forEach((m) => {
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, m.h, 1.2),
        new THREE.MeshStandardMaterial({ color: m.col, roughness: 0.3 })
      );
      bar.position.set(m.x, -1.5 + m.h / 2, 0);
      bar.name = m.name;
      this.dynamicGroup.add(bar);
    });
  }

  // 8. Challenges to Democracy
  private buildChallenges(): void {
    // Foundational + Expansion + Deepening Triangle
    const c1 = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.0, 1.4), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
    c1.position.set(-2.5, -0.4, 0);
    c1.name = "ChallengeTypes";

    const c2 = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.8, 1.4), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
    c2.position.set(0, 0, 0);

    const c3 = new THREE.Mesh(new THREE.BoxGeometry(2.0, 3.6, 1.4), new THREE.MeshStandardMaterial({ color: 0x10b981 }));
    c3.position.set(2.5, 0.4, 0);
    c3.name = "ReformBlocks";

    this.dynamicGroup.add(c1, c2, c3);
  }

  update(_deltaTime: number, elapsedTime: number): void {
    this.pulseMeshes.forEach((mesh, i) => {
      const s = 1.0 + 0.05 * Math.sin(elapsedTime * 2.0 + i);
      mesh.scale.set(s, s, s);
    });
  }

  getResults(): SimulationResult {
    const cid = this.params.chapterId;
    const dataMap: Record<CivicsChapterId, { title: string; metrics: Record<string, string>; obs: string[] }> = {
      "power-sharing": {
        title: "Power Sharing: Belgium vs Sri Lanka",
        metrics: {
          "Belgium Model": "Consociational (Community & Regional tiers)",
          "Sri Lanka Model": "Majoritarianism (1956 Sinhala Only Act)",
          "Belgium Peace": "Zero ethnic conflict post-1970 reforms",
          "Sri Lanka Outcome": "26-year Civil War (1983–2009)",
          "Core Principle": "Democracy requires power dispersal",
        },
        obs: [
          "Belgium amended its constitution 4 times between 1970 and 1993 to accommodate linguistic diversity.",
          "Sri Lanka's majoritarian denial of Tamil language and university access sparked armed insurgency.",
          "Horizontal power sharing (Legislature, Executive, Judiciary) creates checks and balances.",
        ],
      },
      "federalism": {
        title: "Federalism in India",
        metrics: {
          "Type": "'Holding Together' Federation",
          "Union List": "97 subjects (Defence, Banking, Foreign)",
          "State List": "66 subjects (Police, Agriculture, Health)",
          "Concurrent List": "47 subjects (Education, Forests)",
          "Local Tier": "73rd & 74th Amendments (1992)",
        },
        obs: [
          "In case of conflict over Concurrent List subjects, central parliamentary law prevails.",
          "Linguistic reorganisation of states (1956) strengthened rather than weakened Indian unity.",
          "One-third of seats in rural and urban local bodies are constitutionally reserved for women.",
        ],
      },
      "democracy-diversity": {
        title: "Democracy and Diversity",
        metrics: {
          "1968 Olympics": "Tommie Smith & John Carlos Black Power salute",
          "Peter Norman": "Australian sprinter who supported civil rights",
          "Cross-cutting Divisions": "Netherlands (Catholics & Protestants socioeconomically balanced)",
          "Overlapping Divisions": "Northern Ireland (Religion aligned with class → violent conflict)",
          "Constitutional Goal": "Dignity without erasure of identity",
        },
        obs: [
          "Social differences become toxic social divisions when they overlap with economic deprivations.",
          "Accommodating diversity within constitutional frameworks prevents national fragmentation.",
        ],
      },
      "gender-religion-caste": {
        title: "Gender, Religion and Caste",
        metrics: {
          "Women in Lok Sabha": "~15% (Global Nordic benchmark >40%)",
          "Panchayat Quota": "33% constitutionally guaranteed for women",
          "Secularism": "No official religion, freedom of conscience",
          "Article 17": "Untouchability abolished in all forms",
          "Affirmative Action": "SC 15%, ST 7.5%, OBC 27% reservations",
        },
        obs: [
          "Feminist movements emphasize the public-private divide and unpaid household labour.",
          "Secularism in India involves principled equal distance and state intervention against discrimination.",
          "Caste-based political mobilization has enabled marginalized communities to access democratic power.",
        ],
      },
      "struggles-movements": {
        title: "Popular Struggles & Movements",
        metrics: {
          "Bolivia Water War": "Cochabamba 2000 (Bechtel evicted)",
          "Nepal Movement": "April 2006 (Seven-Party Alliance & King's retreat)",
          "Interest Groups": "FICCI, BKU, Trade unions",
          "Issue Movements": "Narmada Bachao Andolan, Right to Food",
          "Function": "Check state excesses between elections",
        },
        obs: [
          "Popular mass struggles are fundamental to democratic deepening beyond periodic electoral voting.",
          "Pressure groups prevent monopoly of political power by ruling elites and corporate lobbies.",
        ],
      },
      "political-parties": {
        title: "Political Parties in India",
        metrics: {
          "National Parties": "Recognized in 4+ states (6% votes + 4 LS seats)",
          "State Parties": "Recognized in state assembly (6% + 2 seats)",
          "Core Functions": "Contest elections, shape laws, form government",
          "Key Challenges": "Dynastic succession, money power, criminalisation",
          "Reforms": "Anti-Defection Law, affidavit disclosures, NOTA",
        },
        obs: [
          "Without political parties, candidates would be independent with purely localized accountability.",
          "Over 30% of elected Lok Sabha MPs face declared criminal investigations.",
        ],
      },
      "outcomes-democracy": {
        title: "Outcomes of Democracy",
        metrics: {
          "Accountability": "Regular free & fair elections",
          "Transparency": "RTI Act (Right to Information, 2005)",
          "Famine Immunity": "Zero major famines in democratic India (Amartya Sen)",
          "Citizen Dignity": "Equal political franchise (One vote, one value)",
          "Legitimacy": "People's own government",
        },
        obs: [
          "Democracy may be slower in decision-making than autocracy, but its outcomes are significantly more legitimate.",
          "The supreme outcome of democracy is the preservation of individual liberty and minority dignity.",
        ],
      },
      "challenges-democracy": {
        title: "Challenges to Democracy",
        metrics: {
          "Foundational Challenge": "Transition from authoritarianism to democratic institutions",
          "Challenge of Expansion": "Extending democracy to minorities, women, and local tiers",
          "Deepening Challenge": "Strengthening citizen participation and curbing elite capture",
          "Primary Indian Need": "Judicial speed, police reform, campaign finance transparency",
          "Supreme Defense": "An educated, vigilant, and politically active citizenry",
        },
        obs: [
          "Legal and constitutional reforms can guide democratic health, but democratic culture requires citizen engagement.",
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
    this.pulseMeshes = [];
  }
}
