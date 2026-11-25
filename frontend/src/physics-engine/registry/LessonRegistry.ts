import type { PhysicsLessonConfig } from "../types/lesson";
import { humanEyeLesson } from "../../data/physics/human-eye";
import { convexMirrorLesson } from "../../data/physics/convex-mirror";
import { convexLensLesson } from "../../data/physics/convex-lens";

const lessons = new Map<string, PhysicsLessonConfig>([
  [humanEyeLesson.id, humanEyeLesson],
  [convexMirrorLesson.id, convexMirrorLesson],
  [convexLensLesson.id, convexLensLesson],
]);

export function getPhysicsLesson(id: string): PhysicsLessonConfig | undefined {
  return lessons.get(id);
}

export function getAllPhysicsLessons(): PhysicsLessonConfig[] {
  return Array.from(lessons.values());
}
