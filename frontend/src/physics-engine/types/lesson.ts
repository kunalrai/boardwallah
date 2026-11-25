import type { CameraPreset, EngineSceneConfig } from "./engine";
import type { AnimationClipConfig } from "./animation";
import type { SimulationParameters } from "./simulation";

export interface LessonFeatures {
  rotation: boolean;
  zoom: boolean;
  pan?: boolean;
  labels: boolean;
  animation: boolean;
  fullscreen: boolean;
  crossSectionToggle?: boolean;
  objectDistanceSlider?: boolean;
  focalLengthSlider?: boolean;
  objectHeightSlider?: boolean;
  lensTypeToggle?: boolean;
  mirrorTypeToggle?: boolean;
}

export interface LessonLearningStep {
  stepNumber: number;
  title: string;
  description: string;
  focusObject?: string;
  cameraPresetId?: string;
  animationClipId?: string;
  simulationParams?: SimulationParameters;
  videoUrl?: string;
  videoCaption?: string;
}

export interface LessonObjectInfo {
  id: string;
  meshName: string;
  name: string;
  description: string;
  function: string;
  cbseNote?: string;
  formula?: string;
  labelOffset?: { x: number; y: number; z: number };
}

export interface LessonFormula {
  id: string;
  name: string;
  expression: string;
  variables: string;
  notes?: string;
}

export interface LessonQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  marks?: number;
}

export interface LessonParameterControl {
  key: string;
  label: string;
  type: "range" | "select" | "toggle";
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: { value: string; label: string }[];
  defaultValue: number | string | boolean;
}

export interface PhysicsLessonConfig {
  id: string;
  class: number;
  subject: string;
  chapter: string;
  title: string;
  subtitle: string;
  slug: string;
  simulation: string;
  model: string;
  usesProceduralFallback?: boolean;
  proceduralFallbackNote?: string;
  thumbnail?: string;
  videoFallback?: string;
  staticImageFallback?: string;
  sceneConfig?: EngineSceneConfig;
  cameraPresets?: CameraPreset[];
  features: LessonFeatures;
  parameters: SimulationParameters;
  parameterControls?: LessonParameterControl[];
  animationClips?: AnimationClipConfig[];
  learningSteps: LessonLearningStep[];
  objects: LessonObjectInfo[];
  formulas: LessonFormula[];
  cbseExamNotes: string[];
  quiz: LessonQuizQuestion[];
}
