import { roundOptics } from "../optics/magnification";

export type MagnetismMode = "straight-wire" | "solenoid" | "fleming-force";

export interface MagneticFieldInput {
  mode: MagnetismMode;
  currentA: number; // Positive = default direction, Negative = reversed
  turnsCount?: number; // For solenoid
  distanceCm?: number; // Radial distance from straight conductor
  magneticFieldT?: number; // External B field for Fleming's Left-Hand Rule
}

export interface MagneticFieldResult {
  mode: MagnetismMode;
  currentA: number;
  currentDirectionLabel: string;
  relativeFieldStrength: number; // Normalized / mT
  fieldDirectionDescription: string;
  forceDirectionDescription: string;
  solenoidPolarity: string;
}

/**
 * Computes physically consistent magnetic field strength & direction:
 * - Straight conductor: B = (mu0 * I) / (2 * pi * r) in microTesla
 * - Solenoid: B proportional to n * I
 * - Fleming's Left-Hand Rule: F = I (L x B)
 */
export function calculateMagneticField(input: MagneticFieldInput): MagneticFieldResult {
  const I = input.currentA;
  const absI = Math.abs(I);
  const rMeters = Math.max(0.01, (input.distanceCm ?? 5) / 100);
  const turns = Math.max(4, Math.min(20, Math.round(input.turnsCount ?? 10)));
  const extB = Math.max(0.1, input.magneticFieldT ?? 0.5);

  const isForward = I >= 0;
  const currentDirectionLabel =
    absI < 0.05
      ? "Zero Current (Off)"
      : input.mode === "straight-wire"
        ? isForward
          ? "Upward (+Y)"
          : "Downward (-Y)"
        : isForward
          ? "Forward (+X)"
          : "Reversed (-X)";

  let strength = 0;
  let fieldDesc = "No magnetic field (I = 0)";
  let forceDesc = "No Lorentz force";
  let polarity = "Neutral";

  if (absI >= 0.05) {
    if (input.mode === "straight-wire") {
      // B in microTesla: (2e-7 * I / r) * 1e6 = 0.2 * I / r
      strength = roundOptics((0.2 * absI) / rMeters, 2);
      fieldDesc = isForward
        ? "Concentric circles: Counter-clockwise (Right-Hand Thumb Rule)"
        : "Concentric circles: Clockwise (Right-Hand Thumb Rule)";
    } else if (input.mode === "solenoid") {
      // Relative mT inside solenoid proportional to turns * I
      strength = roundOptics(0.12 * turns * absI, 2);
      polarity = isForward ? "Left: South (S) | Right: North (N)" : "Left: North (N) | Right: South (S)";
      fieldDesc = isForward
        ? "Uniform parallel field inside from South to North (+X)"
        : "Uniform parallel field inside from South to North (-X)";
    } else {
      // Fleming's Left-Hand Rule: B from N->S (+Y or -Y), I along +X/-X => Force along Z
      strength = roundOptics(extB * absI * 0.2, 2); // Force in Newtons for 20cm conductor
      fieldDesc = "External field B directed North → South (Downward -Y)";
      forceDesc = isForward
        ? "Deflects Outward (+Z) per Fleming's Left-Hand Rule"
        : "Deflects Inward (-Z) per Fleming's Left-Hand Rule";
    }
  }

  return {
    mode: input.mode,
    currentA: roundOptics(I, 1),
    currentDirectionLabel,
    relativeFieldStrength: strength,
    fieldDirectionDescription: fieldDesc,
    forceDirectionDescription: forceDesc,
    solenoidPolarity: polarity,
  };
}
