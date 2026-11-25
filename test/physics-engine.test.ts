import { describe, expect, test } from "bun:test";
import { calculateMirrorOptics } from "../frontend/src/physics-engine/calculations/optics/mirror";
import { calculateLensOptics } from "../frontend/src/physics-engine/calculations/optics/lens";
import { calculateGlassSlabRefraction, calculatePrismDispersion } from "../frontend/src/physics-engine/calculations/optics/refraction";
import { calculateCircuit } from "../frontend/src/physics-engine/calculations/electricity/circuit";
import { calculateMagneticField } from "../frontend/src/physics-engine/calculations/magnetism/magnetic-field";
import { calculatePhProperties, getCarbonMoleculeInfo, getChemicalReactionInfo } from "../frontend/src/physics-engine/calculations/chemistry/chemistry";
import { calculateCardiacMetrics, calculateMendelianCross, calculateTrophicEnergy } from "../frontend/src/physics-engine/calculations/biology/biology";
import { calculateArithmeticProgression, calculateCoordinateGeometry, calculateHcfLcm, calculateQuadratic, calculateTrigonometry } from "../frontend/src/physics-engine/calculations/maths/maths";
import { getAllBiologyLessons, getAllChemistryLessons, getAllMathsLessons, getAllPhysicsLessons, getPhysicsLesson } from "../frontend/src/physics-engine/registry/LessonRegistry";

describe("Optics Mirror Calculations (Cartesian Sign Convention)", () => {
  test("Convex mirror with real object always forms virtual, erect, diminished image between P and F", () => {
    const res = calculateMirrorOptics({
      mirrorType: "convex",
      focalLengthMagnitude: 15,
      objectDistance: -30,
      objectHeight: 4,
    });
    expect(res.f).toBe(15);
    expect(res.u).toBe(-30);
    expect(res.v).toBe(10);
    expect(res.m).toBeCloseTo(0.33, 2);
    expect(res.isVirtual).toBe(true);
    expect(res.nature).toBe("Virtual & Erect");
    expect(res.size).toBe("Highly Diminished");
  });

  test("Concave mirror object at C (u = 2f) forms same-size real inverted image at C", () => {
    const res = calculateMirrorOptics({
      mirrorType: "concave",
      focalLengthMagnitude: 10,
      objectDistance: -20,
      objectHeight: 5,
    });
    expect(res.f).toBe(-10);
    expect(res.v).toBe(-20);
    expect(res.m).toBe(-1);
    expect(res.hi).toBe(-5);
    expect(res.nature).toBe("Real & Inverted");
    expect(res.size).toBe("Same Size");
  });

  test("Concave mirror object at F forms image at infinity", () => {
    const res = calculateMirrorOptics({
      mirrorType: "concave",
      focalLengthMagnitude: 12,
      objectDistance: -12,
      objectHeight: 4,
    });
    expect(res.isAtInfinity).toBe(true);
    expect(res.nature).toBe("Formed at Infinity");
  });

  test("Concave mirror object within F forms virtual, erect, enlarged image", () => {
    const res = calculateMirrorOptics({
      mirrorType: "concave",
      focalLengthMagnitude: 15,
      objectDistance: -10,
      objectHeight: 3,
    });
    expect(res.v).toBe(30);
    expect(res.m).toBe(3);
    expect(res.isVirtual).toBe(true);
    expect(res.nature).toBe("Virtual & Erect");
    expect(res.size).toBe("Highly Enlarged");
  });
});

describe("Optics Lens Calculations (Cartesian Sign Convention)", () => {
  test("Convex lens object at 2F1 forms real, inverted, same-size image at 2F2", () => {
    const res = calculateLensOptics({
      lensType: "convex",
      focalLengthMagnitude: 15,
      objectDistance: -30,
      objectHeight: 4,
    });
    expect(res.f).toBe(15);
    expect(res.v).toBe(30);
    expect(res.m).toBe(-1);
    expect(res.powerDioptres).toBeCloseTo(6.67, 2);
    expect(res.nature).toBe("Real & Inverted");
    expect(res.size).toBe("Same Size");
  });

  test("Convex lens power in Dioptres for f = +20 cm is +5 D", () => {
    const res = calculateLensOptics({
      lensType: "convex",
      focalLengthMagnitude: 20,
      objectDistance: -40,
      objectHeight: 4,
    });
    expect(res.powerDioptres).toBe(5);
  });

  test("Convex lens object within F1 acts as magnifier (virtual, erect, enlarged)", () => {
    const res = calculateLensOptics({
      lensType: "convex",
      focalLengthMagnitude: 12,
      objectDistance: -8,
      objectHeight: 3,
    });
    expect(res.v).toBe(-24);
    expect(res.m).toBe(3);
    expect(res.isVirtual).toBe(true);
    expect(res.nature).toBe("Virtual & Erect");
  });

  test("Concave lens always forms virtual, erect, diminished image on object side", () => {
    const res = calculateLensOptics({
      lensType: "concave",
      focalLengthMagnitude: 15,
      objectDistance: -30,
      objectHeight: 4,
    });
    expect(res.f).toBe(-15);
    expect(res.v).toBe(-10);
    expect(res.powerDioptres).toBeCloseTo(-6.67, 2);
    expect(res.isVirtual).toBe(true);
    expect(res.nature).toBe("Virtual & Erect");
  });
});

describe("Refraction & Prism Calculations", () => {
  test("Glass slab obeys Snell's law and angle of emergence equals incidence", () => {
    const res = calculateGlassSlabRefraction({
      angleOfIncidenceDeg: 45,
      refractiveIndex: 1.5,
      thicknessCm: 4,
    });
    expect(res.angleEmergenceDeg).toBe(45);
    expect(res.angleRefractionDeg).toBeCloseTo(28.13, 1);
    expect(res.lateralDisplacementCm).toBeGreaterThan(1.0);
  });

  test("Prism dispersion deviates Violet more than Red", () => {
    const bands = calculatePrismDispersion({
      angleOfIncidenceDeg: 42,
      prismAngleDeg: 60,
      baseRefractiveIndex: 1.52,
      dispersionStrength: 1.8,
    });
    expect(bands.length).toBe(7);
    const red = bands[0];
    const violet = bands[bands.length - 1];
    expect(red.colorName).toBe("Red");
    expect(violet.colorName).toBe("Violet");
    expect(violet.deviationDeg).toBeGreaterThan(red.deviationDeg);
  });
});

describe("Electricity & Magnetism Calculations", () => {
  test("Series and Parallel circuit calculations are physically consistent", () => {
    const series = calculateCircuit({
      voltageV: 12,
      resistor1Ohm: 4,
      resistor2Ohm: 6,
      resistorCount: 2,
      topology: "series",
      switchClosed: true,
    });
    expect(series.equivalentResistanceOhm).toBe(10);
    expect(series.totalCurrentA).toBe(1.2);
    expect(series.powerWatts).toBe(14.4);

    const parallel = calculateCircuit({
      voltageV: 12,
      resistor1Ohm: 4,
      resistor2Ohm: 6,
      resistorCount: 2,
      topology: "parallel",
      switchClosed: true,
    });
    expect(parallel.equivalentResistanceOhm).toBe(2.4);
    expect(parallel.totalCurrentA).toBe(5);
    expect(parallel.branchCurrentsA).toEqual([3, 2]);
  });

  test("Open switch yields 0 current and 0 power", () => {
    const open = calculateCircuit({
      voltageV: 12,
      resistor1Ohm: 4,
      resistor2Ohm: 6,
      resistorCount: 2,
      topology: "series",
      switchClosed: false,
    });
    expect(open.totalCurrentA).toBe(0);
    expect(open.powerWatts).toBe(0);
  });

  test("Magnetic field reverses direction on negative current", () => {
    const pos = calculateMagneticField({ mode: "straight-wire", currentA: 5 });
    const neg = calculateMagneticField({ mode: "straight-wire", currentA: -5 });
    expect(pos.relativeFieldStrength).toBe(neg.relativeFieldStrength);
    expect(pos.fieldDirectionDescription).toContain("Counter-clockwise");
    expect(neg.fieldDirectionDescription).toContain("Clockwise");
  });
});

describe("Chemistry Calculations", () => {
  test("pH properties classify Strong Acid, Neutral, and Strong Base accurately", () => {
    const acid = calculatePhProperties(1.5);
    expect(acid.nature).toBe("Strong Acid");
    expect(acid.hydrogenIonCount).toBeGreaterThan(acid.hydroxideIonCount);

    const neutral = calculatePhProperties(7);
    expect(neutral.nature).toBe("Neutral");
    expect(neutral.hydrogenIonCount).toBe(neutral.hydroxideIonCount);

    const base = calculatePhProperties(13);
    expect(base.nature).toBe("Strong Base (Alkali)");
    expect(base.hydroxideIonCount).toBeGreaterThan(base.hydrogenIonCount);
  });

  test("Chemical reactions & Carbon molecules return balanced equations and bond counts", () => {
    const feso4 = getChemicalReactionInfo("feso4-decomp");
    expect(feso4.balancedEquation).toContain("Fe₂O₃");

    const methane = getCarbonMoleculeInfo("methane");
    expect(methane.covalentBondsCount).toBe(4);
    expect(methane.geometry).toContain("Tetrahedral");
  });
});

describe("Biology Calculations", () => {
  test("Cardiac output, Mendelian F2 3:1 ratio, and 10% energy law are accurate", () => {
    const heart = calculateCardiacMetrics(72);
    expect(heart.cardiacOutputLMin).toBeCloseTo(5.04, 2);

    const f2 = calculateMendelianCross("Tt-Tt");
    expect(f2.tallCount).toBe(3);
    expect(f2.dwarfCount).toBe(1);
    expect(f2.genotypicRatio).toBe("1 TT : 2 Tt : 1 tt");

    const eco = calculateTrophicEnergy(100000);
    expect(eco.producersJ).toBe(1000);
    expect(eco.primaryConsumersJ).toBe(100);
    expect(eco.secondaryConsumersJ).toBe(10);
    expect(eco.tertiaryConsumersJ).toBe(1);
  });
});

describe("Mathematics Calculations", () => {
  test("HCF/LCM, Quadratic Discriminant, AP, Coordinate Geometry & Trig Identity are accurate", () => {
    const hcf = calculateHcfLcm(12, 18);
    expect(hcf.hcf).toBe(6);
    expect(hcf.lcm).toBe(36);

    const q = calculateQuadratic(1, -4, 4);
    expect(q.discriminant).toBe(0);
    expect(q.nature).toBe("Two Equal Real Roots");

    const ap = calculateArithmeticProgression(2, 5, 10);
    expect(ap.nthTerm).toBe(47);
    expect(ap.sumN).toBe(245);

    const coord = calculateCoordinateGeometry(0, 0, 3, 4, 1, 1);
    expect(coord.distance).toBe(5);
    expect(coord.midX).toBe(1.5);

    const trig = calculateTrigonometry(45, 20);
    expect(trig.identitySum).toBe(1);
    expect(trig.towerHeight).toBe(20);
  });
});

describe("LessonRegistry", () => {
  test("Contains all 10 Physics, 5 Chemistry, 5 Biology, and 14 Maths 3D lessons", () => {
    const physics = getAllPhysicsLessons();
    const chemistry = getAllChemistryLessons();
    const biology = getAllBiologyLessons();
    const maths = getAllMathsLessons();
    expect(physics.length).toBe(10);
    expect(chemistry.length).toBe(5);
    expect(biology.length).toBe(5);
    expect(maths.length).toBe(14);
    expect(getPhysicsLesson("maths-real-numbers")?.simulation).toBe("maths-number-ap");
    expect(getPhysicsLesson("maths-probability")?.simulation).toBe("maths-mensuration-data");
  });
});
