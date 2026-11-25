# Adding New Lessons to BoardWallah 3D Physics Engine

Adding a new lesson that uses an existing simulation (`mirror`, `lens`, `anatomy`) requires **zero changes** to the core engine.

## Steps

1. **Create Lesson Configuration**
   Create `frontend/src/data/physics/<lesson-id>.ts` exporting a `PhysicsLessonConfig` object (`frontend/src/physics-engine/types/lesson.ts`):
   - `id`, `class`, `subject`, `chapter`, `title`, `subtitle`, `slug`
   - `simulation`: registered key (`"mirror"`, `"lens"`, `"anatomy"`)
   - `model`: path under `/assets/physics/.../*.glb`
   - `features`: booleans for `rotation`, `zoom`, `labels`, `animation`, `fullscreen`, etc.
   - `parameters` & `parameterControls`: initial values and slider/select/toggle definitions
   - `learningSteps`, `objects` (matching GLB/procedural mesh names), `formulas`, `cbseExamNotes`, `quiz`

2. **Register the Lesson**
   Add the lesson to `frontend/src/physics-engine/registry/LessonRegistry.ts`.

3. **Create the Astro Route**
   Create `frontend/src/pages/class-10/science/physics/<lesson-id>.astro`:
   ```astro
   ---
   import Layout from "../../../../layouts/Layout.astro";
   import PhysicsViewer from "../../../../components/physics3d/PhysicsViewer.astro";
   import { myNewLesson } from "../../../../data/physics/my-new-lesson";
   ---
   <Layout title={`${myNewLesson.title} | BoardWallah`} description={myNewLesson.subtitle}>
     <PhysicsViewer lesson={myNewLesson} />
   </Layout>
   ```

4. **Verify**
   Run `bun test` and `npm --prefix frontend run build`.
