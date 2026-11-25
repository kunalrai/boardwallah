import * as THREE from "three";
import type {
  Simulation,
  SimulationContext,
  SimulationParameters,
  SimulationResult,
} from "../interfaces/Simulation";
import {
  calculateMagneticField,
  type MagneticFieldResult,
  type MagnetismMode,
} from "../../calculations/magnetism/magnetic-field";
import { clearGroupWithDispose } from "../optics/opticsVisuals";

/**
 * Creates a clean 3D vector arrow with cylinder shaft and cone arrowhead.
 */
function create3DArrow(
  dir: THREE.Vector3,
  length: number,
  color: number,
  radius = 0.045
): THREE.Group {
  const group = new THREE.Group();
  const shaftLen = Math.max(0.1, length * 0.72);
  const headLen = Math.max(0.1, length * 0.28);
  const headRad = radius * 2.8;

  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, shaftLen, 12),
    new THREE.MeshBasicMaterial({ color })
  );
  shaft.position.y = shaftLen / 2;

  const head = new THREE.Mesh(
    new THREE.ConeGeometry(headRad, headLen, 16),
    new THREE.MeshBasicMaterial({ color })
  );
  head.position.y = shaftLen + headLen / 2;

  group.add(shaft, head);

  const up = new THREE.Vector3(0, 1, 0);
  const norm = dir.clone().normalize();
  if (norm.lengthSq() > 0.001) {
    const dot = up.dot(norm);
    if (Math.abs(dot - 1) > 0.0001) {
      if (Math.abs(dot + 1) < 0.0001) {
        group.rotation.x = Math.PI;
      } else {
        const axis = new THREE.Vector3().crossVectors(up, norm).normalize();
        const angle = Math.acos(Math.max(-1, Math.min(1, dot)));
        group.setRotationFromAxisAngle(axis, angle);
      }
    }
  }
  return group;
}

/**
 * Procedural 3D Right Hand grasping the vertical conductor.
 * Demonstrates Maxwell's Right-Hand Thumb Rule:
 * - Thumb points along the vertical wire in current direction (I)
 * - 4 Curled fingers encircle the wire in the magnetic field direction (B)
 */
function createRightHandModel(currentA: number): THREE.Group {
  const isForward = currentA >= 0;
  const group = new THREE.Group();
  group.name = "RightHandModel";

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xf5be9e,
    roughness: 0.55,
    metalness: 0.05,
  });
  const palmBackMat = new THREE.MeshStandardMaterial({
    color: 0xefa780,
    roughness: 0.6,
    metalness: 0.05,
  });
  const cuffMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a,
    roughness: 0.7,
  });

  // Forearm / Wrist reaching in from +X side
  const wrist = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.28, 1.1, 14),
    cuffMat
  );
  wrist.rotation.z = Math.PI / 2;
  wrist.position.set(1.15, 0.0, 0);
  group.add(wrist);

  // Palm base wrapping around wire
  const palm = new THREE.Mesh(
    new THREE.BoxGeometry(0.48, 0.88, 0.44),
    palmBackMat
  );
  palm.position.set(0.48, 0.05, 0.0);
  group.add(palm);

  // 4 Curled fingers wrapping around the conductor (radius 0.11 at x=0, z=0)
  const fingerYOffsets = [-0.27, -0.09, 0.09, 0.27];
  const fingerRadii = [0.06, 0.065, 0.065, 0.058];

  fingerYOffsets.forEach((yOff, idx) => {
    const fingerGroup = new THREE.Group();
    fingerGroup.position.set(0, yOff, 0);

    const knuckle = new THREE.Mesh(
      new THREE.CylinderGeometry(fingerRadii[idx], fingerRadii[idx], 0.35, 10),
      skinMat
    );
    knuckle.rotation.x = Math.PI / 2;
    knuckle.position.set(0.42, 0, -0.16);
    fingerGroup.add(knuckle);

    const curlArc = new THREE.Mesh(
      new THREE.TorusGeometry(0.34, fingerRadii[idx], 8, 18, Math.PI * 0.95),
      skinMat
    );
    curlArc.rotation.x = Math.PI / 2;
    curlArc.rotation.z = -Math.PI * 0.48;
    curlArc.position.set(0, 0, 0);
    fingerGroup.add(curlArc);

    group.add(fingerGroup);
  });

  // Extended Thumb along vertical conductor
  const thumbGroup = new THREE.Group();
  thumbGroup.name = "RightHandThumb";

  const thumbBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.085, 0.095, 0.36, 12),
    skinMat
  );
  thumbBase.rotation.z = Math.PI * 0.15;
  thumbBase.position.set(0.24, 0.42, 0.15);
  thumbGroup.add(thumbBase);

  const thumbMain = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.082, 0.72, 12),
    skinMat
  );
  thumbMain.position.set(0.18, 0.85, 0.16);
  thumbGroup.add(thumbMain);

  const thumbTip = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 12, 12),
    skinMat
  );
  thumbTip.position.set(0.18, 1.21, 0.16);
  thumbGroup.add(thumbTip);

  group.add(thumbGroup);

  // 3D Vector Arrow on Thumb (Amber/Yellow for Current I)
  const thumbArrow = create3DArrow(
    new THREE.Vector3(0, 1, 0),
    0.85,
    0xf59e0b,
    0.045
  );
  thumbArrow.position.set(0.18, 1.25, 0.16);
  group.add(thumbArrow);

  // Circular Torus Arc on Curled Fingers (Royal Blue for Magnetic Field B)
  const fieldArcGeo = new THREE.TorusGeometry(0.82, 0.032, 8, 36, Math.PI * 1.5);
  const fieldArc = new THREE.Mesh(
    fieldArcGeo,
    new THREE.MeshBasicMaterial({ color: 0x2563eb })
  );
  fieldArc.rotation.x = Math.PI / 2;
  fieldArc.position.set(0, 0.52, 0);
  group.add(fieldArc);

  const arcHead = new THREE.Mesh(
    new THREE.ConeGeometry(0.08, 0.18, 12),
    new THREE.MeshBasicMaterial({ color: 0x2563eb })
  );
  arcHead.rotation.y = -Math.PI * 0.15;
  arcHead.position.set(-0.78, 0.52, 0.28);
  group.add(arcHead);

  // Flip 180° if current is reversed (negative Y)
  if (!isForward) {
    group.rotation.x = Math.PI;
    group.position.y = -0.2;
  } else {
    group.position.y = 0.2;
  }

  return group;
}

/**
 * Procedural 3D Left Hand between horseshoe magnet poles.
 * Demonstrates Fleming's Left-Hand Rule:
 * - Forefinger (First finger) = Field (B) pointing DOWN (-Y) towards South pole
 * - Middle finger (Second finger) = Current (I) along the rod (+X or -X)
 * - Thumb = Force / Motion (F) along Z (+Z or -Z)
 * - Ring & Pinky curled into palm
 */
function createFlemingLeftHandModel(currentA: number): THREE.Group {
  const isForward = currentA >= 0;
  const group = new THREE.Group();
  group.name = "LeftHandModel";

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xf5be9e,
    roughness: 0.55,
    metalness: 0.05,
  });
  const palmMat = new THREE.MeshStandardMaterial({
    color: 0xefa780,
    roughness: 0.6,
    metalness: 0.05,
  });
  const cuffMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a,
    roughness: 0.7,
  });

  // Wrist extending back
  const wrist = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.3, 0.9, 14),
    cuffMat
  );
  wrist.rotation.x = Math.PI / 3;
  wrist.rotation.z = Math.PI / 4;
  wrist.position.set(-0.85, 0.5, -0.65);
  group.add(wrist);

  // Central Palm
  const palm = new THREE.Mesh(
    new THREE.BoxGeometry(0.52, 0.52, 0.42),
    palmMat
  );
  palm.position.set(-0.35, 0.25, -0.15);
  group.add(palm);

  // Curled Ring & Pinky into palm
  const curled1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.065, 0.065, 0.35, 10),
    skinMat
  );
  curled1.rotation.z = Math.PI / 2;
  curled1.position.set(-0.25, 0.12, -0.05);

  const curled2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.32, 10),
    skinMat
  );
  curled2.rotation.z = Math.PI / 2;
  curled2.position.set(-0.25, 0.02, -0.05);
  group.add(curled1, curled2);

  const curSign = isForward ? 1 : -1;
  const fSign = isForward ? 1 : -1;

  // 1. Forefinger (First Finger) = Field (B) pointing DOWN (-Y) towards South pole
  const forefingerGroup = new THREE.Group();
  forefingerGroup.name = "ForefingerField";
  const foreShaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.08, 0.95, 12),
    skinMat
  );
  foreShaft.position.set(-0.28, -0.42, 0.05);
  const foreTip = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 12, 12),
    skinMat
  );
  foreTip.position.set(-0.28, -0.92, 0.05);
  forefingerGroup.add(foreShaft, foreTip);

  const bArrow = create3DArrow(new THREE.Vector3(0, -1, 0), 0.85, 0x2563eb, 0.04);
  bArrow.position.set(-0.28, -0.95, 0.05);
  forefingerGroup.add(bArrow);
  group.add(forefingerGroup);

  // 2. Middle Finger (Second Finger) = Current (I) along conductor (+X or -X)
  const middleFingerGroup = new THREE.Group();
  middleFingerGroup.name = "MiddleFingerCurrent";
  const midShaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.075, 1.05, 12),
    skinMat
  );
  midShaft.rotation.z = (Math.PI / 2) * -curSign;
  midShaft.position.set(curSign * 0.42, 0.22, 0.12);
  const midTip = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 12, 12),
    skinMat
  );
  midTip.position.set(curSign * 0.98, 0.22, 0.12);
  middleFingerGroup.add(midShaft, midTip);

  const iArrow = create3DArrow(new THREE.Vector3(curSign, 0, 0), 0.85, 0xef4444, 0.04);
  iArrow.position.set(curSign * 1.02, 0.22, 0.12);
  middleFingerGroup.add(iArrow);
  group.add(middleFingerGroup);

  // 3. Thumb = Motion / Force (F) along Z (+Z or -Z)
  const thumbGroup = new THREE.Group();
  thumbGroup.name = "LeftHandThumb";
  const thumbShaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.082, 0.088, 0.88, 12),
    skinMat
  );
  thumbShaft.rotation.x = (Math.PI / 2) * fSign;
  thumbShaft.position.set(-0.45, 0.48, fSign * 0.38);
  const thumbTip = new THREE.Mesh(
    new THREE.SphereGeometry(0.082, 12, 12),
    skinMat
  );
  thumbTip.position.set(-0.45, 0.48, fSign * 0.86);
  thumbGroup.add(thumbShaft, thumbTip);

  const fArrow = create3DArrow(new THREE.Vector3(0, 0, fSign), 0.85, 0x10b981, 0.045);
  fArrow.position.set(-0.45, 0.48, fSign * 0.9);
  thumbGroup.add(fArrow);
  group.add(thumbGroup);

  return group;
}

/**
 * Interactive 3D Magnetism & Electromagnetism Simulation.
 * Supports:
 * 1. Straight current-carrying conductor (Maxwell's Right-Hand Thumb Rule)
 * 2. Solenoid electromagnet (Uniform interior field + Clock Face Rule)
 * 3. Force on conductor in magnetic field (Fleming's Left-Hand Rule)
 */
export class MagneticFieldSimulation implements Simulation {
  public readonly id = "magnetism";

  private context!: SimulationContext;
  private dynamicGroup = new THREE.Group();
  private params: {
    mode: MagnetismMode;
    currentA: number;
    turnsCount: number;
    showHand?: boolean;
  } = {
    mode: "straight-wire",
    currentA: 4,
    turnsCount: 10,
    showHand: true,
  };
  private initialParams = { ...this.params };
  private calcResult!: MagneticFieldResult;
  private animatedRingTokens: { radius: number; y: number; mesh: THREE.Mesh; offset: number }[] = [];
  private deflectingRod: THREE.Mesh | null = null;
  private leftHandModel: THREE.Group | null = null;
  private rightHandModel: THREE.Group | null = null;
  private animProgress = 0;

  initialize(context: SimulationContext, initialParams: SimulationParameters): void {
    this.context = context;
    this.dynamicGroup.name = "__MagnetismDynamicGroup";
    this.context.simulationGroup.add(this.dynamicGroup);
    this.applyParams(initialParams);
    this.initialParams = { ...this.params };
    this.rebuildVisuals();
  }

  private applyParams(params: SimulationParameters): void {
    if (
      params.mode === "straight-wire" ||
      params.mode === "solenoid" ||
      params.mode === "fleming-force"
    ) {
      this.params.mode = params.mode;
    }
    if (typeof params.currentA === "number") {
      this.params.currentA = Math.max(-10, Math.min(10, params.currentA));
    }
    if (typeof params.turnsCount === "number") {
      this.params.turnsCount = Math.max(4, Math.min(18, Math.round(params.turnsCount)));
    }
    if (typeof params.showHand === "boolean") {
      this.params.showHand = params.showHand;
    }
    if (typeof params.__animationProgress === "number") {
      this.animProgress = params.__animationProgress;
    }
  }

  setParameters(params: SimulationParameters): SimulationResult {
    this.applyParams(params);
    this.rebuildVisuals();
    return this.getResults();
  }

  private rebuildVisuals(): void {
    clearGroupWithDispose(this.dynamicGroup);
    this.animatedRingTokens = [];
    this.deflectingRod = null;
    this.leftHandModel = null;
    this.rightHandModel = null;

    this.calcResult = calculateMagneticField(this.params);

    if (this.params.mode === "straight-wire") {
      this.buildStraightWireScene();
    } else if (this.params.mode === "solenoid") {
      this.buildSolenoidScene();
    } else {
      this.buildFlemingForceScene();
    }
  }

  private buildStraightWireScene(): void {
    // Horizontal cardboard plane
    const plane = new THREE.Mesh(
      new THREE.BoxGeometry(5.6, 0.12, 5.6),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.75 })
    );
    plane.name = "CardboardPlane";
    this.dynamicGroup.add(plane);

    // Vertical copper conductor
    const wire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.11, 5.4, 20),
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.6, roughness: 0.3 })
    );
    wire.name = "StraightConductor";
    this.dynamicGroup.add(wire);

    if (Math.abs(this.params.currentA) < 0.05) return;

    // Concentric magnetic field rings around wire (spacing decreases near wire to show stronger B)
    const radii = [0.85, 1.45, 2.25];
    radii.forEach((r, idx) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.028, 10, 48),
        new THREE.MeshBasicMaterial({ color: 0x1a73e8 })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.1;
      ring.name = "MagneticFieldLines";
      this.dynamicGroup.add(ring);

      const token = new THREE.Mesh(
        new THREE.SphereGeometry(0.085, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xea580c })
      );
      this.dynamicGroup.add(token);
      this.animatedRingTokens.push({ radius: r, y: 0.1, mesh: token, offset: idx * 0.33 });
    });

    // 3D Maxwell's Right-Hand Thumb Rule Model
    if (this.params.showHand !== false) {
      this.rightHandModel = createRightHandModel(this.params.currentA);
      this.dynamicGroup.add(this.rightHandModel);
    }
  }

  private buildSolenoidScene(): void {
    // Helical copper solenoid coils
    const turns = this.params.turnsCount;
    const length = 5.2;
    const radius = 1.05;
    const pts: THREE.Vector3[] = [];
    const totalPts = turns * 18;
    for (let i = 0; i <= totalPts; i++) {
      const t = i / totalPts;
      const angle = t * turns * Math.PI * 2;
      const x = -length / 2 + t * length;
      pts.push(new THREE.Vector3(x, Math.cos(angle) * radius, Math.sin(angle) * radius));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const coilMesh = new THREE.Mesh(
      new THREE.TubeGeometry(curve, totalPts, 0.065, 8, false),
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.65, roughness: 0.25 })
    );
    coilMesh.name = "SolenoidCoil";
    this.dynamicGroup.add(coilMesh);

    if (Math.abs(this.params.currentA) < 0.05) return;

    // Uniform parallel interior field lines
    [-0.45, 0, 0.45].forEach((yOff) => {
      const lineGeo = new THREE.CylinderGeometry(0.025, 0.025, 7.6, 8);
      lineGeo.rotateZ(Math.PI / 2);
      const line = new THREE.Mesh(lineGeo, new THREE.MeshBasicMaterial({ color: 0x1a73e8 }));
      line.position.set(0, yOff, 0);
      line.name = "MagneticFieldLines";
      this.dynamicGroup.add(line);
    });

    // Clock Face Rule Polarities at coil ends
    const isForward = this.params.currentA >= 0;
    // Right face (x = 2.65)
    const rightPoleColor = isForward ? 0xef4444 : 0x2563eb; // North = Red, South = Blue
    const rightRing = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.035, 8, 32),
      new THREE.MeshBasicMaterial({ color: rightPoleColor })
    );
    rightRing.rotation.y = Math.PI / 2;
    rightRing.position.set(2.65, 0, 0);
    this.dynamicGroup.add(rightRing);

    // Left face (x = -2.65)
    const leftPoleColor = isForward ? 0x2563eb : 0xef4444; // South = Blue, North = Red
    const leftRing = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.035, 8, 32),
      new THREE.MeshBasicMaterial({ color: leftPoleColor })
    );
    leftRing.rotation.y = Math.PI / 2;
    leftRing.position.set(-2.65, 0, 0);
    this.dynamicGroup.add(leftRing);
  }

  private buildFlemingForceScene(): void {
    // Horseshoe Magnet Poles: North (top, red) & South (bottom, blue) -> B points Downward (-Y)
    const northPole = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.65, 2.2),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 })
    );
    northPole.position.set(0, 1.85, 0);
    northPole.name = "NorthPole";

    const southPole = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.65, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.4 })
    );
    southPole.position.set(0, -1.85, 0);
    southPole.name = "SouthPole";

    // Deflecting copper rod along X-axis
    const rod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.11, 4.4, 20),
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.65, roughness: 0.25 })
    );
    rod.rotation.z = Math.PI / 2;
    rod.name = "DeflectingConductor";
    this.deflectingRod = rod;

    this.dynamicGroup.add(northPole, southPole, rod);

    // 3D Fleming's Left-Hand Rule Model
    if (this.params.showHand !== false && Math.abs(this.params.currentA) >= 0.05) {
      this.leftHandModel = createFlemingLeftHandModel(this.params.currentA);
      this.dynamicGroup.add(this.leftHandModel);
    }
  }

  update(_deltaTime: number, elapsedTime: number): void {
    const absI = Math.abs(this.params.currentA);
    if (absI < 0.05) return;

    const sign = this.params.currentA >= 0 ? 1 : -1;
    if (this.params.mode === "straight-wire") {
      const speed = Math.max(0.25, absI * 0.18);
      for (const item of this.animatedRingTokens) {
        const angle =
          sign *
          (elapsedTime * speed * Math.PI * 2 +
            item.offset * Math.PI * 2 +
            this.animProgress * Math.PI * 2);
        item.mesh.position.set(
          Math.cos(angle) * item.radius,
          item.y,
          -Math.sin(angle) * item.radius
        );
      }
    } else if (this.params.mode === "fleming-force") {
      const amp = Math.min(1.2, absI * 0.12) * sign;
      const pulse = 0.65 + 0.35 * Math.sin(elapsedTime * 3.0);
      const zOffset = amp * pulse;
      if (this.deflectingRod) {
        this.deflectingRod.position.z = zOffset;
      }
      if (this.leftHandModel) {
        this.leftHandModel.position.z = zOffset;
      }
    }
  }

  getResults(): SimulationResult {
    const r = this.calcResult;
    return {
      metrics: {
        "Experiment Mode": r.mode,
        "Current (I)": `${r.currentA} A (${r.currentDirectionLabel})`,
        "Field / Force Magnitude":
          r.mode === "straight-wire"
            ? `${r.relativeFieldStrength} µT (at 5 cm)`
            : r.mode === "solenoid"
              ? `${r.relativeFieldStrength} mT`
              : `${r.relativeFieldStrength} N`,
        "Solenoid Polarity": r.solenoidPolarity,
      },
      summary: `${r.fieldDirectionDescription}${
        r.mode === "fleming-force" ? " • " + r.forceDirectionDescription : ""
      }`,
      observations: [
        r.fieldDirectionDescription,
        r.mode === "fleming-force"
          ? r.forceDirectionDescription
          : "Reversing the current immediately reverses the magnetic field direction.",
        r.mode === "straight-wire"
          ? "Maxwell's Right-Hand Thumb Rule: Thumb points along current (I); curled fingers encircle the wire in the direction of magnetic field (B)."
          : r.mode === "fleming-force"
            ? "Fleming's Left-Hand Rule: Forefinger = Field (B), Middle Finger = Current (I), Thumb = Force/Motion (F)."
            : "Clock Face Rule: End with clockwise current acts as South pole; end with anti-clockwise current acts as North pole.",
      ],
    };
  }

  reset(): void {
    this.params = { ...this.initialParams };
    this.rebuildVisuals();
  }

  dispose(): void {
    clearGroupWithDispose(this.dynamicGroup);
    this.animatedRingTokens = [];
    this.deflectingRod = null;
    this.leftHandModel = null;
    this.rightHandModel = null;
  }
}
