import { roundOptics } from "./magnification";

export interface GlassSlabInput {
  /** Angle of incidence in degrees (0 to 80) */
  angleOfIncidenceDeg: number;
  /** Refractive index of slab relative to air (e.g. 1.5 for crown glass, 1.33 for water, 2.42 for diamond) */
  refractiveIndex: number;
  /** Slab thickness in cm */
  thicknessCm: number;
}

export interface GlassSlabResult {
  angleIncidenceDeg: number;
  angleRefractionDeg: number;
  angleEmergenceDeg: number;
  refractiveIndex: number;
  thicknessCm: number;
  lateralDisplacementCm: number;
}

/**
 * Computes refraction through a parallel-sided rectangular glass slab using Snell's Law:
 * n1 * sin(i) = n2 * sin(r)
 * Lateral shift d = t * sin(i - r) / cos(r)
 */
export function calculateGlassSlabRefraction(input: GlassSlabInput): GlassSlabResult {
  const iDeg = Math.max(0, Math.min(80, input.angleOfIncidenceDeg));
  const n = Math.max(1.05, Math.min(2.6, input.refractiveIndex));
  const t = Math.max(1, Math.min(12, input.thicknessCm));

  const iRad = (iDeg * Math.PI) / 180;
  const sinR = Math.sin(iRad) / n;
  const rRad = Math.asin(Math.max(-1, Math.min(1, sinR)));
  const rDeg = (rRad * 180) / Math.PI;

  const lateral = (t * Math.sin(iRad - rRad)) / Math.max(0.01, Math.cos(rRad));

  return {
    angleIncidenceDeg: roundOptics(iDeg, 1),
    angleRefractionDeg: roundOptics(rDeg, 2),
    angleEmergenceDeg: roundOptics(iDeg, 1),
    refractiveIndex: roundOptics(n, 2),
    thicknessCm: roundOptics(t, 1),
    lateralDisplacementCm: roundOptics(lateral, 2),
  };
}

export interface PrismBandResult {
  colorName: string;
  hex: number;
  refractiveIndex: number;
  angleEmergenceDeg: number;
  deviationDeg: number;
  totalInternalReflected: boolean;
}

export interface PrismInput {
  angleOfIncidenceDeg: number;
  prismAngleDeg: number;
  baseRefractiveIndex: number;
  dispersionStrength: number;
}

const SPECTRUM_BANDS: { name: string; hex: number; offsetFactor: number }[] = [
  { name: "Red", hex: 0xef4444, offsetFactor: -0.025 },
  { name: "Orange", hex: 0xf97316, offsetFactor: -0.016 },
  { name: "Yellow", hex: 0xeab308, offsetFactor: -0.006 },
  { name: "Green", hex: 0x22c55e, offsetFactor: 0.004 },
  { name: "Blue", hex: 0x3b82f6, offsetFactor: 0.014 },
  { name: "Indigo", hex: 0x6366f1, offsetFactor: 0.022 },
  { name: "Violet", hex: 0x9333ea, offsetFactor: 0.032 },
];

/**
 * Computes refraction & dispersion through a triangular glass prism:
 * r1 = asin(sin(i1) / n)
 * r2 = A - r1
 * i2 = asin(n * sin(r2))  [or TIR if n * sin(r2) > 1]
 * deviation delta = i1 + i2 - A
 */
export function calculatePrismDispersion(input: PrismInput): PrismBandResult[] {
  const i1Deg = Math.max(15, Math.min(80, input.angleOfIncidenceDeg));
  const A = Math.max(30, Math.min(75, input.prismAngleDeg));
  const baseN = Math.max(1.3, Math.min(1.9, input.baseRefractiveIndex));
  const disp = Math.max(0.5, Math.min(3.0, input.dispersionStrength));

  const i1Rad = (i1Deg * Math.PI) / 180;
  const ARad = (A * Math.PI) / 180;

  return SPECTRUM_BANDS.map((band) => {
    const n = baseN + band.offsetFactor * disp;
    const r1Rad = Math.asin(Math.min(0.999, Math.sin(i1Rad) / n));
    const r2Rad = ARad - r1Rad;
    const sinI2 = n * Math.sin(r2Rad);

    if (Math.abs(sinI2) > 1 || r2Rad < 0) {
      return {
        colorName: band.name,
        hex: band.hex,
        refractiveIndex: roundOptics(n, 3),
        angleEmergenceDeg: 90,
        deviationDeg: roundOptics(i1Deg + 90 - A, 1),
        totalInternalReflected: true,
      };
    }

    const i2Rad = Math.asin(sinI2);
    const i2Deg = (i2Rad * 180) / Math.PI;
    const deviation = i1Deg + i2Deg - A;

    return {
      colorName: band.name,
      hex: band.hex,
      refractiveIndex: roundOptics(n, 3),
      angleEmergenceDeg: roundOptics(i2Deg, 2),
      deviationDeg: roundOptics(deviation, 2),
      totalInternalReflected: false,
    };
  });
}
