/**
 * Pure TypeScript CBSE Class 10 Biology calculation helpers:
 * 1. Cardiac cycle / blood flow (Life Processes)
 * 2. Mendelian Monohybrid Cross Punnett Square (Heredity)
 * 3. Lindeman's 10% Energy Transfer Law across Trophic Levels (Our Environment)
 */

export interface CardiacCalculationResult {
  bpm: number;
  strokeVolumeMl: number;
  cardiacOutputLMin: number;
  cycleDurationSec: number;
  bloodPathway: string;
}

export function calculateCardiacMetrics(bpmInput: number): CardiacCalculationResult {
  const bpm = Math.max(40, Math.min(180, Math.round(bpmInput)));
  const strokeVolumeMl = 70;
  const cardiacOutputLMin = Math.round(((bpm * strokeVolumeMl) / 1000) * 100) / 100;
  const cycleDurationSec = Math.round((60 / bpm) * 100) / 100;

  return {
    bpm,
    strokeVolumeMl,
    cardiacOutputLMin,
    cycleDurationSec,
    bloodPathway: "Body → Vena Cava → RA → RV → Lungs → LA → LV → Aorta → Body",
  };
}

export type ParentCrossType = "TT-tt" | "Tt-Tt" | "TT-Tt";

export interface MendelianCrossResult {
  crossLabel: string;
  genotypes: string[];
  phenotypes: string[];
  tallCount: number;
  dwarfCount: number;
  phenotypicRatio: string;
  genotypicRatio: string;
}

export function calculateMendelianCross(cross: ParentCrossType): MendelianCrossResult {
  if (cross === "TT-tt") {
    return {
      crossLabel: "P₁ Pure Tall (TT) × Pure Dwarf (tt)",
      genotypes: ["Tt", "Tt", "Tt", "Tt"],
      phenotypes: ["Tall", "Tall", "Tall", "Tall"],
      tallCount: 4,
      dwarfCount: 0,
      phenotypicRatio: "4 Tall : 0 Dwarf (100% Tall)",
      genotypicRatio: "100% Tt (Heterozygous)",
    };
  }
  if (cross === "TT-Tt") {
    return {
      crossLabel: "TT × Tt Back Cross",
      genotypes: ["TT", "Tt", "TT", "Tt"],
      phenotypes: ["Tall", "Tall", "Tall", "Tall"],
      tallCount: 4,
      dwarfCount: 0,
      phenotypicRatio: "4 Tall : 0 Dwarf (100% Tall)",
      genotypicRatio: "1 TT : 1 Tt",
    };
  }
  return {
    crossLabel: "F₁ Self-Pollination (Tt × Tt)",
    genotypes: ["TT", "Tt", "Tt", "tt"],
    phenotypes: ["Tall", "Tall", "Tall", "Dwarf"],
    tallCount: 3,
    dwarfCount: 1,
    phenotypicRatio: "3 Tall : 1 Dwarf",
    genotypicRatio: "1 TT : 2 Tt : 1 tt",
  };
}

export interface TrophicEnergyResult {
  solarEnergyJ: number;
  producersJ: number;
  primaryConsumersJ: number;
  secondaryConsumersJ: number;
  tertiaryConsumersJ: number;
}

/**
 * Computes energy available at each trophic level:
 * Producers capture ~1% of incident solar energy;
 * each subsequent trophic level receives 10% of the previous level.
 */
export function calculateTrophicEnergy(solarEnergyJ: number): TrophicEnergyResult {
  const solar = Math.max(1000, Math.min(1000000, solarEnergyJ));
  const producersJ = Math.round(solar * 0.01);
  const primaryConsumersJ = Math.round(producersJ * 0.1);
  const secondaryConsumersJ = Math.round(primaryConsumersJ * 0.1);
  const tertiaryConsumersJ = Math.round(secondaryConsumersJ * 0.1);

  return {
    solarEnergyJ: solar,
    producersJ,
    primaryConsumersJ,
    secondaryConsumersJ,
    tertiaryConsumersJ,
  };
}
