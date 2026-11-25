/**
 * Pure TypeScript CBSE Class 10 Chemistry calculation & scientific data helpers.
 * Covers:
 * 1. Chemical Reactions (stoichiometry, colour changes, gas/precipitate products)
 * 2. Acids, Bases & Salts (pH, H+/OH- concentration ratio, Universal/Litmus/Phenolphthalein indicators)
 * 3. Metals & Ionic Bonding (electron configuration, valency transfer, lattice ratio)
 * 4. Carbon Compounds (homologous series general formulas, IUPAC names, bond counts)
 */

export type ReactionId = "feso4-decomp" | "pbno3-decomp" | "fe-cuso4" | "ba-precip";

export interface ReactionCalculationResult {
  id: ReactionId;
  name: string;
  balancedEquation: string;
  reactionType: string;
  initialColorHex: number;
  finalColorHex: number;
  initialAppearance: string;
  finalAppearance: string;
  gasColorHex: number | null;
  precipitateColorHex: number | null;
  observation: string;
}

const REACTIONS: Record<ReactionId, ReactionCalculationResult> = {
  "feso4-decomp": {
    id: "feso4-decomp",
    name: "Thermal Decomposition of Ferrous Sulphate",
    balancedEquation: "2FeSO₄(s) —Δ→ Fe₂O₃(s) + SO₂(g)↑ + SO₃(g)↑",
    reactionType: "Thermal Decomposition (Endothermic)",
    initialColorHex: 0x86efac,
    finalColorHex: 0x991b1b,
    initialAppearance: "Pale green FeSO₄·7H₂O crystals",
    finalAppearance: "Reddish-brown Fe₂O₃ solid + pungent SO₂/SO₃ gas",
    gasColorHex: 0xe2e8f0,
    precipitateColorHex: null,
    observation: "Green crystals first lose water to become white anhydrous FeSO₄, then decompose into reddish-brown ferric oxide with smell of burning sulphur.",
  },
  "pbno3-decomp": {
    id: "pbno3-decomp",
    name: "Thermal Decomposition of Lead Nitrate",
    balancedEquation: "2Pb(NO₃)₂(s) —Δ→ 2PbO(s) + 4NO₂(g)↑ + O₂(g)↑",
    reactionType: "Thermal Decomposition (Endothermic)",
    initialColorHex: 0xf8fafc,
    finalColorHex: 0xfacc15,
    initialAppearance: "White crystalline Pb(NO₃)₂",
    finalAppearance: "Yellow PbO residue + dense brown NO₂ fumes",
    gasColorHex: 0xb45309,
    precipitateColorHex: null,
    observation: "Crackling sound with emission of reddish-brown nitrogen dioxide (NO₂) fumes and yellow lead(II) oxide residue.",
  },
  "fe-cuso4": {
    id: "fe-cuso4",
    name: "Iron Nail in Copper Sulphate Solution",
    balancedEquation: "Fe(s) + CuSO₄(aq) → FeSO₄(aq) + Cu(s)",
    reactionType: "Single Displacement Reaction",
    initialColorHex: 0x2563eb,
    finalColorHex: 0x4ade80,
    initialAppearance: "Deep blue CuSO₄ aqueous solution",
    finalAppearance: "Pale green FeSO₄ solution + reddish-brown Cu deposit",
    gasColorHex: null,
    precipitateColorHex: 0xc2410c,
    observation: "More reactive Iron displaces Copper from CuSO₄; blue colour fades to pale green and brown copper coats the iron.",
  },
  "ba-precip": {
    id: "ba-precip",
    name: "Sodium Sulphate + Barium Chloride",
    balancedEquation: "Na₂SO₄(aq) + BaCl₂(aq) → BaSO₄(s)↓ + 2NaCl(aq)",
    reactionType: "Double Displacement (Precipitation)",
    initialColorHex: 0xe0f2fe,
    finalColorHex: 0xf1f5f9,
    initialAppearance: "Clear colourless aqueous solutions",
    finalAppearance: "Insoluble white BaSO₄ precipitate settling down",
    gasColorHex: null,
    precipitateColorHex: 0xffffff,
    observation: "Exchange of ions forms an immediate, insoluble white precipitate of Barium Sulphate (BaSO₄).",
  },
};

export function getChemicalReactionInfo(id: ReactionId): ReactionCalculationResult {
  return REACTIONS[id];
}

export interface PhCalculationResult {
  pH: number;
  pOH: number;
  nature: string;
  universalColorHex: number;
  litmusEffect: string;
  phenolphthaleinEffect: string;
  hydrogenIonCount: number;
  hydroxideIonCount: number;
}

export function calculatePhProperties(pHInput: number): PhCalculationResult {
  const pH = Math.round(Math.max(0, Math.min(14, pHInput)) * 10) / 10;
  const pOH = Math.round((14 - pH) * 10) / 10;

  let nature = "Neutral";
  let universalColorHex = 0x22c55e; // pH 7 green
  let litmusEffect = "No colour change on red or blue litmus";
  let phenolphthaleinEffect = "Colourless";

  if (pH < 3) {
    nature = "Strong Acid";
    universalColorHex = 0xef4444;
    litmusEffect = "Turns Blue Litmus → Red";
  } else if (pH < 5.5) {
    nature = "Weak Acid";
    universalColorHex = 0xf97316;
    litmusEffect = "Turns Blue Litmus → Red";
  } else if (pH < 6.8) {
    nature = "Slightly Acidic";
    universalColorHex = 0xeab308;
    litmusEffect = "Turns Blue Litmus → Red";
  } else if (pH <= 7.2) {
    nature = "Neutral";
    universalColorHex = 0x22c55e;
  } else if (pH < 10.5) {
    nature = "Weak Base (Alkali)";
    universalColorHex = 0x3b82f6;
    litmusEffect = "Turns Red Litmus → Blue";
    phenolphthaleinEffect = pH > 8.2 ? "Turns Pink" : "Colourless";
  } else {
    nature = "Strong Base (Alkali)";
    universalColorHex = 0x7c3aed;
    litmusEffect = "Turns Red Litmus → Blue";
    phenolphthaleinEffect = "Turns Deep Pink / Magenta";
  }

  // Relative visual ion counts in beaker (total 16 ions)
  const hCount = Math.max(1, Math.min(15, Math.round(15 - (pH / 14) * 14)));
  const ohCount = 16 - hCount;

  return {
    pH,
    pOH,
    nature,
    universalColorHex,
    litmusEffect,
    phenolphthaleinEffect,
    hydrogenIonCount: hCount,
    hydroxideIonCount: ohCount,
  };
}

export type MoleculeId = "methane" | "ethene" | "ethyne" | "ethanol" | "ethanoic-acid" | "benzene";

export interface CarbonMoleculeInfo {
  id: MoleculeId;
  name: string;
  formula: string;
  series: string;
  functionalGroup: string;
  covalentBondsCount: number;
  geometry: string;
}

const MOLECULES: Record<MoleculeId, CarbonMoleculeInfo> = {
  methane: {
    id: "methane",
    name: "Methane",
    formula: "CH₄",
    series: "Alkane (CₙH₂ₙ₊₂)",
    functionalGroup: "None (Saturated hydrocarbon)",
    covalentBondsCount: 4,
    geometry: "Tetrahedral (109.5°)",
  },
  ethene: {
    id: "ethene",
    name: "Ethene",
    formula: "C₂H₄",
    series: "Alkene (CₙH₂ₙ)",
    functionalGroup: "C=C Double Bond (Unsaturated)",
    covalentBondsCount: 6,
    geometry: "Trigonal Planar (120°)",
  },
  ethyne: {
    id: "ethyne",
    name: "Ethyne",
    formula: "C₂H₂",
    series: "Alkyne (CₙH₂ₙ₋₂)",
    functionalGroup: "C≡C Triple Bond (Unsaturated)",
    covalentBondsCount: 5,
    geometry: "Linear (180°)",
  },
  ethanol: {
    id: "ethanol",
    name: "Ethanol",
    formula: "C₂H₅OH",
    series: "Alcohol (CₙH₂ₙ₊₁OH)",
    functionalGroup: "Hydroxyl (-OH)",
    covalentBondsCount: 8,
    geometry: "Tetrahedral around C atoms",
  },
  "ethanoic-acid": {
    id: "ethanoic-acid",
    name: "Ethanoic Acid",
    formula: "CH₃COOH",
    series: "Carboxylic Acid",
    functionalGroup: "Carboxyl (-COOH)",
    covalentBondsCount: 8,
    geometry: "Tetrahedral CH₃ + Planar -COOH",
  },
  benzene: {
    id: "benzene",
    name: "Benzene",
    formula: "C₆H₆",
    series: "Aromatic Cyclic Hydrocarbon",
    functionalGroup: "Alternating C=C Ring",
    covalentBondsCount: 15,
    geometry: "Planar Hexagonal Ring (120°)",
  },
};

export function getCarbonMoleculeInfo(id: MoleculeId): CarbonMoleculeInfo {
  return MOLECULES[id];
}
