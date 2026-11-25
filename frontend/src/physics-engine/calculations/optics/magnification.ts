/**
 * Pure TypeScript optics magnification & image characterization helpers.
 * Follows CBSE Class 10 New Cartesian Sign Convention.
 */

export type ImageNature = "Real & Inverted" | "Virtual & Erect" | "Formed at Infinity";
export type ImageSize = "Point-sized" | "Highly Diminished" | "Diminished" | "Same Size" | "Enlarged" | "Highly Enlarged";

export function classifyImageSize(absMagnification: number): ImageSize {
  if (!Number.isFinite(absMagnification)) {
    return "Highly Enlarged";
  }
  if (absMagnification < 0.05) {
    return "Point-sized";
  }
  if (absMagnification < 0.45) {
    return "Highly Diminished";
  }
  if (Math.abs(absMagnification - 1) < 0.03) {
    return "Same Size";
  }
  if (absMagnification < 1) {
    return "Diminished";
  }
  if (absMagnification > 2.5) {
    return "Highly Enlarged";
  }
  return "Enlarged";
}

export function roundOptics(value: number, decimals = 2): number {
  if (!Number.isFinite(value)) return value;
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
