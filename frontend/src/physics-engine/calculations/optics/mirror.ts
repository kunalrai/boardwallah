import { classifyImageSize, roundOptics, type ImageNature, type ImageSize } from "./magnification";

export type MirrorType = "convex" | "concave";

export interface MirrorInput {
  mirrorType: MirrorType;
  /** Magnitude of focal length in cm (automatically signed: + for convex, - for concave) */
  focalLengthMagnitude: number;
  /** Object distance in cm (negative for real object in front of mirror per Cartesian sign convention) */
  objectDistance: number;
  /** Object height in cm (positive above principal axis) */
  objectHeight: number;
}

export interface MirrorCalculationResult {
  mirrorType: MirrorType;
  /** Signed focal length f in cm */
  f: number;
  /** Radius of curvature R = 2f in cm */
  R: number;
  /** Signed object distance u in cm */
  u: number;
  /** Signed image distance v in cm (Infinity when object is at F) */
  v: number;
  /** Linear magnification m = -v/u */
  m: number;
  /** Object height h_o in cm */
  ho: number;
  /** Image height h_i = m * h_o in cm */
  hi: number;
  nature: ImageNature;
  size: ImageSize;
  positionDescription: string;
  isAtInfinity: boolean;
  isVirtual: boolean;
}

/**
 * Computes spherical mirror image formation using New Cartesian Sign Convention:
 * - Light travels left to right; Pole P is at origin (0, 0).
 * - Real object is placed to the left: u < 0.
 * - Concave mirror: f < 0, C < 0.
 * - Convex mirror: f > 0, C > 0.
 * - Mirror formula: 1/f = 1/v + 1/u => v = (u * f) / (u - f)
 * - Magnification: m = -v / u = h_i / h_o
 */
export function calculateMirrorOptics(input: MirrorInput): MirrorCalculationResult {
  const fMag = Math.max(1, Math.abs(input.focalLengthMagnitude));
  const f = input.mirrorType === "convex" ? fMag : -fMag;
  const R = 2 * f;

  // Enforce real object convention (u < 0)
  const u = input.objectDistance >= 0 ? -Math.max(1, Math.abs(input.objectDistance)) : input.objectDistance;
  const ho = input.objectHeight;

  const denom = u - f;
  const isAtInfinity = Math.abs(denom) < 1e-4;

  if (isAtInfinity) {
    return {
      mirrorType: input.mirrorType,
      f: roundOptics(f),
      R: roundOptics(R),
      u: roundOptics(u),
      v: Infinity,
      m: Infinity,
      ho: roundOptics(ho),
      hi: Infinity,
      nature: "Formed at Infinity",
      size: "Highly Enlarged",
      positionDescription: "At infinity (reflected rays are parallel)",
      isAtInfinity: true,
      isVirtual: false,
    };
  }

  const v = (u * f) / denom;
  const m = -v / u;
  const hi = m * ho;
  const isVirtual = v > 0;
  const nature: ImageNature = isVirtual ? "Virtual & Erect" : "Real & Inverted";
  const size = classifyImageSize(Math.abs(m));

  const positionDescription = describeMirrorImagePosition(input.mirrorType, u, f, R, v);

  return {
    mirrorType: input.mirrorType,
    f: roundOptics(f),
    R: roundOptics(R),
    u: roundOptics(u),
    v: roundOptics(v),
    m: roundOptics(m),
    ho: roundOptics(ho),
    hi: roundOptics(hi),
    nature,
    size,
    positionDescription,
    isAtInfinity: false,
    isVirtual,
  };
}

function describeMirrorImagePosition(
  mirrorType: MirrorType,
  u: number,
  f: number,
  R: number,
  v: number
): string {
  if (mirrorType === "convex") {
    if (Math.abs(u) > 200) {
      return "At Focus F behind the mirror";
    }
    return "Between Pole P and Focus F, behind the mirror";
  }

  // Concave mirror 6 standard positions
  const absU = Math.abs(u);
  const absF = Math.abs(f);
  const absR = Math.abs(R);

  if (absU > absR * 4) {
    return "At Focus F (in front of the mirror)";
  }
  if (absU > absR + 0.5) {
    return "Between F and C (in front of the mirror)";
  }
  if (Math.abs(absU - absR) <= 0.5) {
    return "At Centre of Curvature C";
  }
  if (absU > absF + 0.5 && absU < absR - 0.5) {
    return "Beyond Centre of Curvature C";
  }
  if (Math.abs(absU - absF) <= 0.5) {
    return "At Infinity";
  }
  if (v > 0) {
    return "Behind the mirror (Virtual & Erect)";
  }
  return `At v = ${roundOptics(v)} cm`;
}
