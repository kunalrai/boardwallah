import * as THREE from "three";
import type { AnimationClipConfig } from "../types/animation";

/**
 * Controls both Blender GLTF AnimationMixer clips and programmatic simulation timelines
 * (play, pause, restart, speed, scrubbing, and clip switching).
 */
export class AnimationManager {
  private mixer: THREE.AnimationMixer | null = null;
  private actions = new Map<string, THREE.AnimationAction>();
  private clipConfigs: AnimationClipConfig[] = [];
  private activeClipId: string | null = null;

  private isPlaying = true;
  private speed = 1.0;
  private virtualTime = 0;
  private virtualDuration = 8.0;

  bindModel(root: THREE.Object3D, clips: THREE.AnimationClip[], configs: AnimationClipConfig[] = []): void {
    this.dispose();
    this.clipConfigs = configs;

    if (clips.length > 0) {
      this.mixer = new THREE.AnimationMixer(root);
      clips.forEach((clip) => {
        const action = this.mixer!.clipAction(clip);
        this.actions.set(clip.name, action);
      });
    }

    if (configs.length > 0) {
      this.selectClip(configs[0].id);
    } else if (clips.length > 0) {
      this.selectClip(clips[0].name);
    }
  }

  setConfigsOnly(configs: AnimationClipConfig[]): void {
    this.clipConfigs = configs;
    if (configs.length > 0 && !this.activeClipId) {
      this.activeClipId = configs[0].id;
      this.virtualDuration = configs[0].duration ?? 8.0;
    }
  }

  selectClip(clipId: string): void {
    this.activeClipId = clipId;
    const cfg = this.clipConfigs.find((c) => c.id === clipId);
    this.virtualDuration = cfg?.duration ?? 8.0;
    this.virtualTime = 0;

    if (this.mixer && this.actions.size > 0) {
      this.actions.forEach((action) => action.stop());
      const targetName = cfg?.clipName || clipId;
      const action = this.actions.get(targetName);
      if (action) {
        action.reset();
        action.play();
        action.paused = !this.isPlaying;
      }
    }
  }

  play(): void {
    this.isPlaying = true;
    this.actions.forEach((action) => {
      action.paused = false;
    });
  }

  pause(): void {
    this.isPlaying = false;
    this.actions.forEach((action) => {
      action.paused = true;
    });
  }

  togglePlay(): boolean {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  restart(): void {
    this.virtualTime = 0;
    if (this.mixer && this.activeClipId) {
      const cfg = this.clipConfigs.find((c) => c.id === this.activeClipId);
      const targetName = cfg?.clipName || this.activeClipId;
      const action = this.actions.get(targetName);
      if (action) {
        action.reset();
        action.play();
        action.paused = !this.isPlaying;
      }
    }
  }

  setSpeed(speed: number): void {
    this.speed = Math.max(0.25, Math.min(3.0, speed));
    if (this.mixer) {
      this.mixer.timeScale = this.speed;
    }
  }

  scrubTo(timeSeconds: number): void {
    const dur = this.getDuration();
    this.virtualTime = Math.max(0, Math.min(dur, timeSeconds));
    if (this.mixer && this.activeClipId) {
      const cfg = this.clipConfigs.find((c) => c.id === this.activeClipId);
      const targetName = cfg?.clipName || this.activeClipId;
      const action = this.actions.get(targetName);
      if (action) {
        action.time = this.virtualTime;
        this.mixer.update(0);
      }
    }
  }

  update(deltaTime: number): void {
    if (!this.isPlaying) return;
    const scaledDelta = deltaTime * this.speed;
    const dur = this.getDuration();
    this.virtualTime = (this.virtualTime + scaledDelta) % dur;

    if (this.mixer) {
      this.mixer.update(scaledDelta);
    }
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getSpeed(): number {
    return this.speed;
  }

  getCurrentTime(): number {
    return this.virtualTime;
  }

  getDuration(): number {
    if (this.mixer && this.activeClipId) {
      const cfg = this.clipConfigs.find((c) => c.id === this.activeClipId);
      const targetName = cfg?.clipName || this.activeClipId;
      const action = this.actions.get(targetName);
      if (action) {
        return action.getClip().duration || this.virtualDuration;
      }
    }
    return this.virtualDuration;
  }

  getActiveClipId(): string | null {
    return this.activeClipId;
  }

  getNormalizedProgress(): number {
    const dur = this.getDuration();
    return dur > 0 ? this.virtualTime / dur : 0;
  }

  dispose(): void {
    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer = null;
    }
    this.actions.clear();
  }
}
