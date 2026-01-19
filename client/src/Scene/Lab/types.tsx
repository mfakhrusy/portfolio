export type WaveShaderConfig = {
  color: [number, number, number];
  intensity: number;
  speed: number;
  waveCount: number;
  frequency: number;
};

export const defaultWaveShaderConfig: WaveShaderConfig = {
  color: [0.22, 0.74, 0.97],
  intensity: 1.0,
  speed: 1.0,
  waveCount: 3,
  frequency: 1.0,
};
