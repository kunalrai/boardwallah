import { describe, expect, test } from "bun:test";
import { calculateMirrorOptics } from "../frontend/src/physics-engine/calculations/optics/mirror";
import { calculateLensOptics } from "../frontend/src/physics-engine/calculations/optics/lens";
import { getAllPhysicsLessons, getPhysicsLesson } from "../frontend/src/physics-engine/registry/LessonRegistry";

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

describe("LessonRegistry", () => {
  test("Contains all three initial demonstration lessons", () => {
    const all = getAllPhysicsLessons();
    expect(all.length).toBe(3);
    expect(getPhysicsLesson("human-eye")?.simulation).toBe("anatomy");
    expect(getPhysicsLesson("convex-mirror")?.simulation).toBe("mirror");
    expect(getPhysicsLesson("convex-lens")?.simulation).toBe("lens");
  });
});
