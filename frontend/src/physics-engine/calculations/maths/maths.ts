import { roundOptics } from "../optics/magnification";

/**
 * Pure TypeScript CBSE Class 10 Mathematics calculation helpers covering all 14 NCERT chapters.
 */

export function calculateHcfLcm(aInput: number, bInput: number) {
  const a = Math.max(2, Math.round(Math.abs(aInput)));
  const b = Math.max(2, Math.round(Math.abs(bInput)));
  let x = a;
  let y = b;
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  const hcf = x;
  const lcm = (a * b) / hcf;
  return { a, b, hcf, lcm, product: a * b };
}

export function calculateQuadratic(aInput: number, bInput: number, cInput: number) {
  const a = Math.abs(aInput) < 0.1 ? 1 : aInput;
  const b = bInput;
  const c = cInput;
  const discriminant = roundOptics(b * b - 4 * a * c, 2);
  const sumOfRoots = roundOptics(-b / a, 2);
  const productOfRoots = roundOptics(c / a, 2);
  const vertexX = roundOptics(-b / (2 * a), 2);
  const vertexY = roundOptics(a * vertexX * vertexX + b * vertexX + c, 2);

  let nature = "Two Distinct Real Roots";
  let rootsText = "";
  if (discriminant > 0) {
    const r1 = roundOptics((-b + Math.sqrt(discriminant)) / (2 * a), 2);
    const r2 = roundOptics((-b - Math.sqrt(discriminant)) / (2 * a), 2);
    rootsText = `x = ${r1}, ${r2}`;
  } else if (Math.abs(discriminant) < 0.01) {
    nature = "Two Equal Real Roots";
    const r = roundOptics(-b / (2 * a), 2);
    rootsText = `x = ${r}, ${r}`;
  } else {
    nature = "No Real Roots (D < 0)";
    rootsText = "No real x-intercepts";
  }

  return { a, b, c, discriminant, nature, rootsText, sumOfRoots, productOfRoots, vertexX, vertexY };
}

export function calculateLinearPair(a1: number, b1: number, c1: number, a2: number, b2: number, c2: number) {
  const det = a1 * b2 - a2 * b1;
  if (Math.abs(det) < 1e-4) {
    const isCoincident = Math.abs(a1 * c2 - a2 * c1) < 1e-4 && Math.abs(b1 * c2 - b2 * c1) < 1e-4;
    return {
      status: isCoincident ? "Coincident Lines (Infinitely Many Solutions)" : "Parallel Lines (No Solution)",
      consistent: isCoincident,
      x: null as number | null,
      y: null as number | null,
    };
  }
  const x = roundOptics((c1 * b2 - c2 * b1) / det, 2);
  const y = roundOptics((a1 * c2 - a2 * c1) / det, 2);
  return {
    status: "Intersecting Lines (Unique Solution)",
    consistent: true,
    x,
    y,
  };
}

export function calculateArithmeticProgression(a: number, d: number, nInput: number) {
  const n = Math.max(2, Math.min(12, Math.round(nInput)));
  const terms: number[] = [];
  for (let i = 0; i < n; i++) {
    terms.push(roundOptics(a + i * d, 2));
  }
  const nthTerm = terms[terms.length - 1];
  const sumN = roundOptics((n / 2) * (2 * a + (n - 1) * d), 2);
  return { a, d, n, terms, nthTerm, sumN };
}

export function calculateCoordinateGeometry(x1: number, y1: number, x2: number, y2: number, m1: number, m2: number) {
  const distance = roundOptics(Math.hypot(x2 - x1, y2 - y1), 2);
  const midX = roundOptics((x1 + x2) / 2, 2);
  const midY = roundOptics((y1 + y2) / 2, 2);
  const denom = Math.max(1, m1 + m2);
  const secX = roundOptics((m1 * x2 + m2 * x1) / denom, 2);
  const secY = roundOptics((m1 * y2 + m2 * y1) / denom, 2);
  return { distance, midX, midY, secX, secY };
}

export function calculateTrigonometry(angleDegInput: number, baseDistanceM: number) {
  const deg = Math.max(10, Math.min(80, angleDegInput));
  const rad = (deg * Math.PI) / 180;
  const sinVal = roundOptics(Math.sin(rad), 4);
  const cosVal = roundOptics(Math.cos(rad), 4);
  const tanVal = roundOptics(Math.tan(rad), 4);
  const identitySum = roundOptics(sinVal * sinVal + cosVal * cosVal, 4);
  const towerHeight = roundOptics(baseDistanceM * Math.tan(rad), 2);
  const lineOfSight = roundOptics(baseDistanceM / Math.cos(rad), 2);
  return { deg, sinVal, cosVal, tanVal, identitySum, baseDistanceM, towerHeight, lineOfSight };
}

export function calculateCircleSector(radiusCm: number, angleDeg: number) {
  const r = Math.max(2, Math.min(15, radiusCm));
  const theta = Math.max(15, Math.min(330, angleDeg));
  const arcLength = roundOptics((theta / 360) * 2 * Math.PI * r, 2);
  const sectorArea = roundOptics((theta / 360) * Math.PI * r * r, 2);
  const triangleArea = roundOptics(0.5 * r * r * Math.sin((theta * Math.PI) / 180), 2);
  const minorSegmentArea = roundOptics(sectorArea - triangleArea, 2);
  return { r, theta, arcLength, sectorArea, minorSegmentArea };
}

export function calculateCombinedSolid(shape: "cone-hemisphere" | "cylinder-cone" | "cylinder-hemispheres", r: number, h: number) {
  const slant = Math.sqrt(r * r + h * h);
  let volume = 0;
  let tsa = 0;
  if (shape === "cone-hemisphere") {
    volume = (1 / 3) * Math.PI * r * r * h + (2 / 3) * Math.PI * r * r * r;
    tsa = Math.PI * r * slant + 2 * Math.PI * r * r;
  } else if (shape === "cylinder-cone") {
    volume = Math.PI * r * r * h + (1 / 3) * Math.PI * r * r * h;
    tsa = Math.PI * r * r + 2 * Math.PI * r * h + Math.PI * r * slant;
  } else {
    volume = Math.PI * r * r * h + (4 / 3) * Math.PI * r * r * r;
    tsa = 2 * Math.PI * r * h + 4 * Math.PI * r * r;
  }
  return {
    shape,
    r: roundOptics(r, 2),
    h: roundOptics(h, 2),
    slant: roundOptics(slant, 2),
    volume: roundOptics(volume, 2),
    tsa: roundOptics(tsa, 2),
  };
}
