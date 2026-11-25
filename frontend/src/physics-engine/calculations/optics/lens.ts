import { classifyImageSize, roundOptics, type ImageNature, type ImageSize } from "./magnification";

export type LensType = "convex" | "concave";

export interface LensInput {
  lensType: LensType;
  /** Magnitude of focal length in cm (automatically signed: + for convex, - for concave) */
  focalLengthMagnitude: number;
  /** Object distance in cm (negative for real object to the left of optical centre O) */
  objectDistance: number;
  /** Object height in cm */
  objectHeight: number;
}

export interface LensCalculationResult {
  lensType: LensType;
  /** Signed focal length f in cm */
  f: number;
  /** 2F distance in cm */
  twoF: number;
  /** Signed object distance u in cm */
  u: number;
  /** Signed image distance v in cm */
  v: number;
  /** Linear magnification m = v/u */
  m: number;
  /** Optical power P = 1 / f(m) in Dioptres (D) */
  powerDioptres: number;
  ho: number;
  hi: number;
  nature: ImageNature;
  size: ImageSize;
  positionDescription: string;
  isAtInfinity: boolean;
  isVirtual: boolean;
}

/**
 * Computes thin spherical lens image formation using New Cartesian Sign Convention:
 * - Optical centre O is at origin (0, 0).
 * - Real object is to the left: u < 0.
 * - Convex (converging) lens: f > 0.
 * - Concave (diverging) lens: f < 0.
 * - Lens formula: 1/f = 1/v - 1/u => v = (u * f) / (u + f)
 * - Magnification: m = v / u = h_i / h_o
 * - Power: P = 1 / (f / 100) in Dioptres (D)
 */
export function calculateLensOptics(input: LensInput): LensCalculationResult {
  const fMag = Math.max(1, Math.abs(input.focalLengthMagnitude));
  const f = input.lensType === "convex" ? fMag : -fMag;
  const twoF = 2 * f;

  // Enforce real object convention (u < 0)
  const u = input.objectDistance >= 0 ? -Math.max(1, Math.abs(input.objectDistance)) : input.objectDistance;
  const ho = input.objectHeight;
  const powerDioptres = roundOptics(100 / f);

  const denom = u + f;
  const isAtInfinity = Math.abs(denom) < 1e-4;

  if (isAtInfinity) {
    return {
      lensType: input.lensType,
      f: roundOptics(f),
      twoF: roundOptics(twoF),
      u: roundOptics(u),
      v: Infinity,
      m: Infinity,
      powerDioptres,
      ho: roundOptics(ho),
      hi: Infinity,
      nature: "Formed at Infinity",
      size: "Highly Enlarged",
      positionDescription: "At infinity (emergent rays are parallel)",
      isAtInfinity: true,
      isVirtual: false,
    };
  }

  const v = (u * f) / denom;
  const m = v / u;
  const hi = m * ho;
  // For a real object (u < 0), v < 0 means image is on the same side as object => virtual & erect
  const isVirtual = v < 0;
  const nature: ImageNature = isVirtual ? "Virtual & Erect" : "Real & Inverted";
  const size = classifyImageSize(Math.abs(m));

  const positionDescription = describeLensImagePosition(input.lensType, u, f, twoF, v);

  return {
    lensType: input.lensType,
    f: roundOptics(f),
    twoF: roundOptics(twoF),
    u: roundOptics(u),
    v: roundOptics(v),
    m: roundOptics(m),
    powerDioptres,
    ho: roundOptics(ho),
    hi: roundOptics(hi),
    nature,
    size,
    positionDescription,
    isAtInfinity: false,
    isVirtual,
  };
}

function describeLensImagePosition(
  lensType: LensType,
  u: number,
  f: number,
  twoF: number,
  v: number
): string {
  if (lensType === "concave") {
    if (Math.abs(u) > 200) {
      return "At Focus F1 (on same side as object)";
    }
    return "Between Optical Centre O and Focus F1 (same side as object)";
  }

  // Convex lens 6 standard object positions
  const absU = Math.abs(u);
  const absF = Math.abs(f);
  const abs2F = Math.abs(twoF);

  if (absU > abs2F * 4) {
    return "At Focus F2 (on other side of lens)";
  }
  if (absU > abs2F + 0.5) {
    return "Between F2 and 2F2 (other side of lens)";
  }
  if (Math.abs(absU - abs2F) <= 0.5) {
    return "At 2F2 (other side of lens)";
  }
  if (absU > absF + 0.5 && absU < abs2F - 0.5) {
    return "Beyond 2F2 (other side of lens)";
  }
  if (Math.abs(absU - absF) <= 0.5) {
    return "At Infinity";
  }
  if (v < 0) {
    return "On the same side of the lens as the object";
  }
  return `At v = ${roundOptics(v)} cm`;
}
