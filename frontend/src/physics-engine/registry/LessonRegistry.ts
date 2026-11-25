import type { PhysicsLessonConfig } from "../types/lesson";
import { humanEyeLesson } from "../../data/physics/human-eye";
import { eyeDefectsLesson } from "../../data/physics/eye-defects";
import { convexMirrorLesson } from "../../data/physics/convex-mirror";
import { concaveMirrorLesson } from "../../data/physics/concave-mirror";
import { convexLensLesson } from "../../data/physics/convex-lens";
import { concaveLensLesson } from "../../data/physics/concave-lens";
import { glassSlabLesson } from "../../data/physics/glass-slab";
import { prismDispersionLesson } from "../../data/physics/prism-dispersion";
import { electricityLesson } from "../../data/physics/electricity";
import { magnetismLesson } from "../../data/physics/magnetism";
import { chemicalReactionsLesson } from "../../data/chemistry/chemical-reactions";
import { acidsBasesLesson } from "../../data/chemistry/acids-bases-salts";
import { metalsNonMetalsLesson } from "../../data/chemistry/metals-non-metals";
import { carbonCompoundsLesson } from "../../data/chemistry/carbon-compounds";
import { lifeProcessesLesson } from "../../data/biology/life-processes";
import { controlCoordinationLesson } from "../../data/biology/control-and-coordination";
import { reproductionLesson } from "../../data/biology/reproduction";
import { heredityLesson } from "../../data/biology/heredity";
import { ourEnvironmentLesson } from "../../data/biology/our-environment";
import { mathsLessons } from "../../data/maths/all-maths-lessons";

const physicsLessons: PhysicsLessonConfig[] = [
  humanEyeLesson,
  eyeDefectsLesson,
  convexMirrorLesson,
  concaveMirrorLesson,
  convexLensLesson,
  concaveLensLesson,
  glassSlabLesson,
  prismDispersionLesson,
  electricityLesson,
  magnetismLesson,
];

const chemistryLessons: PhysicsLessonConfig[] = [
  chemicalReactionsLesson,
  acidsBasesLesson,
  metalsNonMetalsLesson,
  carbonCompoundsLesson,
];

const biologyLessons: PhysicsLessonConfig[] = [
  lifeProcessesLesson,
  controlCoordinationLesson,
  reproductionLesson,
  heredityLesson,
  ourEnvironmentLesson,
];

const lessons = new Map<string, PhysicsLessonConfig>(
  [...physicsLessons, ...chemistryLessons, ...biologyLessons, ...mathsLessons].map((l) => [l.id, l])
);

export function getPhysicsLesson(id: string): PhysicsLessonConfig | undefined {
  return lessons.get(id);
}

export function getAllPhysicsLessons(): PhysicsLessonConfig[] {
  return physicsLessons;
}

export function getAllChemistryLessons(): PhysicsLessonConfig[] {
  return chemistryLessons;
}

export function getAllBiologyLessons(): PhysicsLessonConfig[] {
  return biologyLessons;
}

export function getAllMathsLessons(): PhysicsLessonConfig[] {
  return mathsLessons;
}

export function getLessonsBySubject(subject: string): PhysicsLessonConfig[] {
  const s = subject.toLowerCase();
  if (s === "chemistry") return chemistryLessons;
  if (s === "biology") return biologyLessons;
  if (s === "mathematics" || s === "maths") return mathsLessons;
  return physicsLessons;
}
