export interface AnimationClipConfig {
  id: string;
  label: string;
  clipName?: string;
  description?: string;
  duration?: number;
}

export interface AnimationPlaybackState {
  isPlaying: boolean;
  speed: number;
  currentTime: number;
  duration: number;
  activeClipId: string | null;
  clips: AnimationClipConfig[];
}
