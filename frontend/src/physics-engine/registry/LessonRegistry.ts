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

const lessons = new Map<string, PhysicsLessonConfig>([
  [humanEyeLesson.id, humanEyeLesson],
  [eyeDefectsLesson.id, eyeDefectsLesson],
  [convexMirrorLesson.id, convexMirrorLesson],
  [concaveMirrorLesson.id, concaveMirrorLesson],
  [convexLensLesson.id, convexLensLesson],
  [concaveLensLesson.id, concaveLensLesson],
  [glassSlabLesson.id, glassSlabLesson],
  [prismDispersionLesson.id, prismDispersionLesson],
  [electricityLesson.id, electricityLesson],
  [magnetismLesson.id, magnetismLesson],
]);

export function getPhysicsLesson(id: string): PhysicsLessonConfig | undefined {
  return lessons.get(id);
}

export function getAllPhysicsLessons(): PhysicsLessonConfig[] {
  return Array.from(lessons.values());
}
