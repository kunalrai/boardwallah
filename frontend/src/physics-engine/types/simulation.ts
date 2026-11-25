import type * as THREE from "three";

export type SimulationParameterValue = number | string | boolean;

export type SimulationParameters = Record<string, SimulationParameterValue>;

export interface SimulationResult {
  metrics: Record<string, string | number | boolean>;
  summary: string;
  observations: string[];
  rayData?: unknown;
}

export interface SimulationContext {
  scene: THREE.Scene;
  simulationGroup: THREE.Group;
  modelRoot: THREE.Object3D | null;
  getMeshByName: (name: string) => THREE.Object3D | null;
  highlightMesh: (name: string | null) => void;
}

export interface Simulation {
  readonly id: string;
  initialize(context: SimulationContext, initialParams: SimulationParameters): void;
  update(deltaTime: number, elapsedTime: number): void;
  setParameters(params: SimulationParameters): SimulationResult;
  getResults(): SimulationResult;
  reset(): void;
  dispose(): void;
}

export type SimulationConstructor = new () => Simulation;
