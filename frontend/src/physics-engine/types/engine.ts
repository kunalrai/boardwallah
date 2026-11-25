import type * as THREE from "three";

export interface Vector3Tuple {
  x: number;
  y: number;
  z: number;
}

export interface CameraPreset {
  id: string;
  label: string;
  position: Vector3Tuple;
  target: Vector3Tuple;
  fov?: number;
}

export interface EngineSceneConfig {
  backgroundColor?: number | string;
  ambientLightIntensity?: number;
  directionalLightIntensity?: number;
  showGrid?: boolean;
  showAxes?: boolean;
  cameraPosition?: Vector3Tuple;
  cameraTarget?: Vector3Tuple;
  minDistance?: number;
  maxDistance?: number;
  enableDamping?: boolean;
  enablePan?: boolean;
  enableZoom?: boolean;
  cameraPresets?: CameraPreset[];
}

export interface LabelDefinition {
  id: string;
  meshName: string;
  title: string;
  shortNote?: string;
  offset?: Vector3Tuple;
  visible?: boolean;
}

export interface EngineCallbacks {
  onLoadStart?: () => void;
  onLoadProgress?: (progress: number) => void;
  onLoadComplete?: (meshNames: string[]) => void;
  onLoadError?: (error: Error) => void;
  onObjectSelected?: (meshName: string | null) => void;
  onObjectHovered?: (meshName: string | null) => void;
  onAnimationTimeUpdate?: (currentTime: number, duration: number, activeClip: string | null) => void;
  onSimulationUpdate?: (results: Record<string, unknown>) => void;
  onWebGLError?: (message: string) => void;
}

export interface ManagedObjectInfo {
  name: string;
  visible: boolean;
  object: THREE.Object3D;
}
