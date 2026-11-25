# Blender to GLB Workflow for BoardWallah

## 1. Modelling & Scale
- Work in metres (`1 Blender unit = 1 Three.js unit`), centered at the world origin `(0, 0, 0)`.
- Keep triangle counts mobile-friendly (`< 30k` triangles per lesson asset).
- Apply transforms (`Ctrl + A` → All Transforms) before exporting.

## 2. Mesh Naming Conventions (Critical for Interaction & Labels)
`InteractionManager` and `LabelManager` match meshes by exact `Object.name`:
- **Human Eye (`/assets/physics/human-eye/human-eye.glb`)**:
  `Sclera`, `OuterShell_Cutaway`, `Choroid`, `Retina`, `Cornea`, `Iris`, `Pupil`, `EyeLens`, `CiliaryMuscles`, `SuspensoryLigaments`, `AqueousHumour`, `VitreousHumour`, `OpticNerve`, `BlindSpot`
- **Mirrors**: `MirrorSurface`, `Pole_P`, `Focus_F`, `Centre_C`
- **Lenses**: `LensBody`, `OpticalCentre_O`, `Focus_F1`, `TwoF1`, `Focus_F2`, `TwoF2`

## 3. Animations
- Author NLA/Action clips in Blender with clear names matching `animationClips[].clipName` in the lesson config.

## 4. Export to GLB
- File → Export → glTF 2.0 (`.glb`)
- Enable **+Y Up**, **Apply Modifiers**, **Compression (Draco)** if needed, and **Animations**.
- Place exported `.glb` under `frontend/public/assets/physics/<category>/<name>.glb`.
- Set `usesProceduralFallback: false` in the lesson config once the production `.glb` is verified.
