import * as THREE from "three";
import type {
  Simulation,
  SimulationContext,
  SimulationParameters,
  SimulationResult,
} from "../interfaces/Simulation";
import {
  clearGroupWithDispose,
  createPhotonPulse,
  createRayLine,
} from "../optics/opticsVisuals";

/**
 * Reusable Anatomy Simulation — initial implementation: Structure of the Human Eye.
 * Supports:
 * - Loading Blender GLB anatomy meshes OR creating a scientifically accurate
 *   named procedural fallback model with all required CBSE anatomical structures.
 * - Cross-section cutaway toggle (reveals internal chambers, retina, lens, optic nerve).
 * - Incoming light ray refraction through cornea & crystalline lens forming a
 *   real & inverted image on the retina.
 * - Animated neural impulse traveling along the optic nerve.
 */
export class AnatomySimulation implements Simulation {
  public readonly id = "anatomy";

  private context!: SimulationContext;
  private eyeGroup = new THREE.Group();
  private lightRaysGroup = new THREE.Group();
  private impulsePulses: { points: THREE.Vector3[]; mesh: THREE.Mesh }[] = [];
  private rayPhotons: { points: THREE.Vector3[]; mesh: THREE.Mesh }[] = [];

  private params: {
    crossSection: boolean;
    showLightPath: boolean;
    accommodationFocus: number;
    activeClip: string;
    eyeDefect: "normal" | "myopia" | "hypermetropia";
    correctiveLens: boolean;
  } = {
    crossSection: true,
    showLightPath: true,
    accommodationFocus: 1.0,
    activeClip: "overview",
    eyeDefect: "normal",
    correctiveLens: false,
  };
  private initialParams = { ...this.params };
  private animProgress = 0;

  initialize(context: SimulationContext, initialParams: SimulationParameters): void {
    this.context = context;
    this.applyParams(initialParams);
    this.initialParams = { ...this.params };

    // If no external GLB was loaded, construct the temporary procedural Human Eye model
    if (!this.context.modelRoot) {
      this.eyeGroup.name = "__ProceduralHumanEye";
      this.buildProceduralHumanEye();
      this.context.simulationGroup.add(this.eyeGroup);
    }

    this.lightRaysGroup.name = "__EyeLightPathGroup";
    this.context.simulationGroup.add(this.lightRaysGroup);
    this.buildOpticalAndNeuralAnimation();
    this.applyCrossSectionState();
  }

  private applyParams(params: SimulationParameters): void {
    if (typeof params.crossSection === "boolean") {
      this.params.crossSection = params.crossSection;
    }
    if (typeof params.showLightPath === "boolean") {
      this.params.showLightPath = params.showLightPath;
    }
    if (typeof params.accommodationFocus === "number") {
      this.params.accommodationFocus = Math.max(0.5, Math.min(1.5, params.accommodationFocus));
    }
    if (
      params.eyeDefect === "normal" ||
      params.eyeDefect === "myopia" ||
      params.eyeDefect === "hypermetropia"
    ) {
      this.params.eyeDefect = params.eyeDefect;
    }
    if (typeof params.correctiveLens === "boolean") {
      this.params.correctiveLens = params.correctiveLens;
    }
    if (typeof params.__activeClip === "string") {
      this.params.activeClip = params.__activeClip;
      if (params.__activeClip === "complete-eye") {
        this.params.crossSection = false;
      } else if (params.__activeClip === "cross-section" || params.__activeClip === "refraction-retina") {
        this.params.crossSection = true;
      }
    }
    if (typeof params.__animationProgress === "number") {
      this.animProgress = params.__animationProgress;
    }
  }

  setParameters(params: SimulationParameters): SimulationResult {
    this.applyParams(params);
    this.applyCrossSectionState();
    this.buildOpticalAndNeuralAnimation();
    return this.getResults();
  }

  private buildProceduralHumanEye(): void {
    const phiLength = Math.PI; // Hemisphere cutaway base when rotated

    // 1. Sclera (outer tough white protective layer - upper/back half)
    const scleraOuter = new THREE.Mesh(
      new THREE.SphereGeometry(2.05, 36, 28, 0, Math.PI * 2, 0, Math.PI),
      new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.45,
        side: THREE.DoubleSide,
      })
    );
    scleraOuter.name = "Sclera";

    // Cutaway shell (front half toggled by crossSection)
    const scleraFrontShell = new THREE.Mesh(
      new THREE.SphereGeometry(2.06, 32, 24, -Math.PI / 2, phiLength),
      new THREE.MeshStandardMaterial({
        color: 0xf1f5f9,
        roughness: 0.45,
        transparent: true,
        opacity: 0.92,
      })
    );
    scleraFrontShell.name = "OuterShell_Cutaway";
    scleraFrontShell.rotation.y = Math.PI / 2;

    // 2. Choroid (middle vascular layer)
    const choroid = new THREE.Mesh(
      new THREE.SphereGeometry(1.94, 32, 24, Math.PI / 2, Math.PI),
      new THREE.MeshStandardMaterial({
        color: 0x7f1d1d,
        roughness: 0.6,
        side: THREE.DoubleSide,
      })
    );
    choroid.name = "Choroid";
    choroid.rotation.y = Math.PI / 2;

    // 3. Retina (inner light-sensitive layer)
    const retina = new THREE.Mesh(
      new THREE.SphereGeometry(1.85, 32, 24, Math.PI / 2, Math.PI),
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0x78350f,
        emissiveIntensity: 0.2,
        roughness: 0.5,
        side: THREE.DoubleSide,
      })
    );
    retina.name = "Retina";
    retina.rotation.y = Math.PI / 2;

    // 4. Vitreous Humour (clear gel filling posterior chamber)
    const vitreous = new THREE.Mesh(
      new THREE.SphereGeometry(1.78, 28, 20, Math.PI / 2, Math.PI),
      new THREE.MeshPhysicalMaterial({
        color: 0xe0f2fe,
        transparent: true,
        opacity: 0.22,
        roughness: 0.1,
      })
    );
    vitreous.name = "VitreousHumour";
    vitreous.rotation.y = Math.PI / 2;

    // 5. Cornea (transparent bulging front dome at x = -2.05)
    const cornea = new THREE.Mesh(
      new THREE.SphereGeometry(1.12, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.48),
      new THREE.MeshPhysicalMaterial({
        color: 0xbae6fd,
        transparent: true,
        opacity: 0.45,
        roughness: 0.08,
      })
    );
    cornea.name = "Cornea";
    cornea.rotation.z = Math.PI / 2;
    cornea.position.set(-1.58, 0, 0);

    // 6. Aqueous Humour (chamber behind cornea)
    const aqueous = new THREE.Mesh(
      new THREE.SphereGeometry(0.95, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.42),
      new THREE.MeshPhysicalMaterial({
        color: 0x7dd3fc,
        transparent: true,
        opacity: 0.28,
        roughness: 0.1,
      })
    );
    aqueous.name = "AqueousHumour";
    aqueous.rotation.z = Math.PI / 2;
    aqueous.position.set(-1.48, 0, 0);

    // 7. Iris (coloured muscular diaphragm)
    const iris = new THREE.Mesh(
      new THREE.RingGeometry(0.34, 0.88, 32),
      new THREE.MeshStandardMaterial({
        color: 0x1d4ed8,
        roughness: 0.4,
        side: THREE.DoubleSide,
      })
    );
    iris.name = "Iris";
    iris.rotation.y = Math.PI / 2;
    iris.position.set(-1.55, 0, 0);

    // 8. Pupil (central aperture)
    const pupil = new THREE.Mesh(
      new THREE.CircleGeometry(0.33, 28),
      new THREE.MeshBasicMaterial({ color: 0x020617, side: THREE.DoubleSide })
    );
    pupil.name = "Pupil";
    pupil.rotation.y = Math.PI / 2;
    pupil.position.set(-1.54, 0, 0);

    // 9. Eye Lens (crystalline biconvex protein lens)
    const eyeLens = new THREE.Mesh(
      new THREE.SphereGeometry(0.58, 24, 24),
      new THREE.MeshPhysicalMaterial({
        color: 0xdbeafe,
        transparent: true,
        opacity: 0.72,
        roughness: 0.12,
      })
    );
    eyeLens.name = "EyeLens";
    eyeLens.scale.set(0.55, 1.0, 1.0);
    eyeLens.position.set(-1.05, 0, 0);

    // 10. Ciliary Muscles (top & bottom muscular ring holding lens)
    const ciliary = new THREE.Mesh(
      new THREE.TorusGeometry(0.92, 0.14, 14, 32),
      new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.5 })
    );
    ciliary.name = "CiliaryMuscles";
    ciliary.rotation.y = Math.PI / 2;
    ciliary.position.set(-1.12, 0, 0);

    // 11. Suspensory Ligaments
    const ligaments = new THREE.Mesh(
      new THREE.CylinderGeometry(0.82, 0.56, 0.16, 24, 1, true),
      new THREE.MeshStandardMaterial({
        color: 0xfde68a,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide,
      })
    );
    ligaments.name = "SuspensoryLigaments";
    ligaments.rotation.z = Math.PI / 2;
    ligaments.position.set(-1.08, 0, 0);

    // 12. Optic Nerve (exiting posterior pole to brain)
    const opticNerve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.38, 1.55, 20),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.45 })
    );
    opticNerve.name = "OpticNerve";
    opticNerve.rotation.z = -Math.PI / 2 + 0.18;
    opticNerve.position.set(2.55, -0.35, 0);

    // 13. Blind Spot (junction of optic nerve & retina)
    const blindSpot = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5 })
    );
    blindSpot.name = "BlindSpot";
    blindSpot.position.set(1.82, -0.24, 0);

    this.eyeGroup.add(
      scleraOuter,
      scleraFrontShell,
      choroid,
      retina,
      vitreous,
      cornea,
      aqueous,
      iris,
      pupil,
      eyeLens,
      ciliary,
      ligaments,
      opticNerve,
      blindSpot
    );
  }

  private applyCrossSectionState(): void {
    const shell =
      this.context.getMeshByName("OuterShell_Cutaway") ||
      this.eyeGroup.getObjectByName("OuterShell_Cutaway");
    const sclera =
      this.context.getMeshByName("Sclera") ||
      this.eyeGroup.getObjectByName("Sclera");

    if (shell) {
      shell.visible = !this.params.crossSection;
    }
    if (sclera) {
      const mesh = sclera as THREE.Mesh;
      if (mesh.material && "transparent" in mesh.material) {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.transparent = this.params.crossSection;
        mat.opacity = this.params.crossSection ? 0.18 : 1.0;
        mat.needsUpdate = true;
      }
    }

    const lens = this.eyeGroup.getObjectByName("EyeLens");
    if (lens) {
      lens.scale.x = 0.45 + 0.2 * this.params.accommodationFocus;
    }
  }

  private buildOpticalAndNeuralAnimation(): void {
    clearGroupWithDispose(this.lightRaysGroup);
    this.rayPhotons = [];
    this.impulsePulses = [];

    if (!this.params.showLightPath) return;

    // Determine convergence x-coordinate based on eyeDefect & correctiveLens
    let focusX = 1.82; // On retina
    if (!this.params.correctiveLens) {
      if (this.params.eyeDefect === "myopia") focusX = 0.85; // In front of retina
      else if (this.params.eyeDefect === "hypermetropia") focusX = 2.45; // Behind retina
    }

    // Optional spectacle corrective lens in front of cornea (x = -3.1)
    if (this.params.correctiveLens && this.params.eyeDefect !== "normal") {
      const specGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.14, 24);
      specGeo.rotateZ(Math.PI / 2);
      const specMat = new THREE.MeshPhysicalMaterial({
        color: this.params.eyeDefect === "myopia" ? 0x38bdf8 : 0x34d399,
        transparent: true,
        opacity: 0.55,
        roughness: 0.1,
      });
      const specMesh = new THREE.Mesh(specGeo, specMat);
      specMesh.name = "CorrectiveLens";
      specMesh.position.set(-3.1, 0, 0);
      this.lightRaysGroup.add(specMesh);
    }

    // Incoming light rays -> optional spectacle -> Cornea -> EyeLens -> convergence at focusX
    const startY = this.params.eyeDefect === "hypermetropia" && !this.params.correctiveLens ? 0.18 : 0.55;
    const upperRay = [
      new THREE.Vector3(-4.4, startY, 0),
      new THREE.Vector3(-3.1, this.params.correctiveLens && this.params.eyeDefect === "myopia" ? 0.52 : 0.55, 0),
      new THREE.Vector3(-2.1, 0.52, 0),
      new THREE.Vector3(-1.05, 0.36, 0),
      new THREE.Vector3(focusX, 0, 0),
    ];
    const lowerRay = [
      new THREE.Vector3(-4.4, -startY, 0),
      new THREE.Vector3(-3.1, this.params.correctiveLens && this.params.eyeDefect === "myopia" ? -0.52 : -0.55, 0),
      new THREE.Vector3(-2.1, -0.52, 0),
      new THREE.Vector3(-1.05, -0.36, 0),
      new THREE.Vector3(focusX, 0, 0),
    ];
    const centralRay = [
      new THREE.Vector3(-4.4, 0, 0),
      new THREE.Vector3(1.82, 0, 0),
    ];

    this.lightRaysGroup.add(createRayLine(upperRay, 0xef4444));
    this.lightRaysGroup.add(createRayLine(lowerRay, 0xef4444));
    this.lightRaysGroup.add(createRayLine(centralRay, 0xf59e0b));

    [upperRay, lowerRay, centralRay].forEach((pts) => {
      const photon = createPhotonPulse(0xfde047);
      this.lightRaysGroup.add(photon);
      this.rayPhotons.push({ points: pts, mesh: photon });
    });

    // Optic nerve electrical signal path (from BlindSpot/Retina to brain)
    const nerveSignal = [
      new THREE.Vector3(1.82, -0.24, 0),
      new THREE.Vector3(3.35, -0.48, 0),
    ];
    const pulse = createPhotonPulse(0x38bdf8);
    this.lightRaysGroup.add(pulse);
    this.impulsePulses.push({ points: nerveSignal, mesh: pulse });
  }

  update(_deltaTime: number, elapsedTime: number): void {
    const t = ((elapsedTime % 4.0) / 4.0 + this.animProgress) % 1.0;

    // Phase 1 (0 -> 0.7): photons refract through cornea & lens onto retina
    // Phase 2 (0.7 -> 1.0): neural impulse travels down optic nerve
    const rayT = Math.min(1, t / 0.7);
    const nerveT = t > 0.65 ? (t - 0.65) / 0.35 : 0;

    for (const item of this.rayPhotons) {
      const segs = item.points.length - 1;
      const scaled = rayT * segs;
      const idx = Math.min(segs - 1, Math.floor(scaled));
      item.mesh.position.lerpVectors(item.points[idx], item.points[idx + 1], scaled - idx);
    }

    for (const item of this.impulsePulses) {
      item.mesh.visible = nerveT > 0;
      if (item.mesh.visible) {
        item.mesh.position.lerpVectors(item.points[0], item.points[1], nerveT);
      }
    }
  }

  getResults(): SimulationResult {
    const defectLabel =
      this.params.eyeDefect === "myopia"
        ? "Myopia (Near-sightedness)"
        : this.params.eyeDefect === "hypermetropia"
          ? "Hypermetropia (Far-sightedness)"
          : "Normal Emmetropic Eye";
    const focusLocation =
      this.params.eyeDefect === "normal" || this.params.correctiveLens
        ? "On Retina (Sharp Vision)"
        : this.params.eyeDefect === "myopia"
          ? "In Front of Retina (Blurred Distant Vision)"
          : "Behind Retina (Blurred Near Vision)";

    return {
      metrics: {
        "Vision State": defectLabel,
        "Focal Point": focusLocation,
        "Corrective Spectacle":
          this.params.eyeDefect === "normal"
            ? "None Required"
            : this.params.correctiveLens
              ? this.params.eyeDefect === "myopia"
                ? "Concave Lens (Diverging, -D)"
                : "Convex Lens (Converging, +D)"
              : "Uncorrected",
        "Image on Retina": "Real & Inverted",
        "View Mode": this.params.crossSection ? "Cross-Section Cutaway" : "Complete Eyeball",
      },
      summary: `${defectLabel} • Focus: ${focusLocation}`,
      observations: [
        this.params.eyeDefect === "myopia"
          ? "Myopia occurs due to excessive curvature of the eye lens or elongation of the eyeball; corrected with a concave lens."
          : this.params.eyeDefect === "hypermetropia"
            ? "Hypermetropia occurs when focal length is too long or eyeball is too small; corrected with a convex lens."
            : "Most refraction occurs at the outer surface of the cornea; ciliary muscles fine-tune focus on the retina.",
        "Photoreceptor rods & cones convert light into electrical signals carried by the optic nerve.",
      ],
    };
  }

  reset(): void {
    this.params = { ...this.initialParams };
    this.applyCrossSectionState();
    this.buildOpticalAndNeuralAnimation();
  }

  dispose(): void {
    clearGroupWithDispose(this.eyeGroup);
    clearGroupWithDispose(this.lightRaysGroup);
    this.rayPhotons = [];
    this.impulsePulses = [];
  }
}
