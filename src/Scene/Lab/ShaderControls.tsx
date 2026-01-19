import { createSignal } from "solid-js";
import { DraggableTerminal } from "./DraggableTerminal";
import { ColorPicker, hslToRgbNormalized } from "./ColorPicker";
import "./ShaderControls.css";
import type { WaveShaderConfig } from "./types";

type ShaderControlsProps = {
  onConfigChange: (config: WaveShaderConfig) => void;
  initialConfig: WaveShaderConfig;
};

export function ShaderControls(props: ShaderControlsProps) {
  const [isMinimized, setIsMinimized] = createSignal(false);
  const [displayColor, setDisplayColor] = createSignal("hsl(200, 80%, 60%)");
  const [color, setColor] = createSignal(props.initialConfig.color);
  const [intensity, setIntensity] = createSignal(props.initialConfig.intensity);
  const [speed, setSpeed] = createSignal(props.initialConfig.speed);
  const [waveCount, setWaveCount] = createSignal(props.initialConfig.waveCount);
  const [frequency, setFrequency] = createSignal(props.initialConfig.frequency);

  const emitConfig = () => {
    props.onConfigChange({
      color: color(),
      intensity: intensity(),
      speed: speed(),
      waveCount: waveCount(),
      frequency: frequency(),
    });
  };

  const handleHslChange = (h: number, s: number, l: number) => {
    const rgb = hslToRgbNormalized(h, s, l);
    setColor(rgb);
    emitConfig();
  };

  return (
    <DraggableTerminal
      title="WAVE SHADER"
      initialPosition={{ x: 30, y: 100 }}
      initialSize={{ width: 240, height: 420 }}
      minSize={{ width: 220, height: 380 }}
      terminalClass="shader-controls"
      isMinimized={() => isMinimized()}
      onMinimize={() => setIsMinimized(true)}
      onExpand={() => setIsMinimized(false)}
      fabIcon="◇"
      fabPosition="bottom-left"
      resizable={false}
    >
      <div class="shader-controls-body">
        <div class="shader-controls-section">
          <div class="shader-controls-section-title">Color</div>
          <ColorPicker
            currentColor={displayColor()}
            onColorChange={setDisplayColor}
            onHslChange={handleHslChange}
          />
        </div>

        <div class="shader-controls-section">
          <div class="shader-controls-section-title">Wave Settings</div>

          <label class="shader-controls-slider-label">
            <span>Waves</span>
            <span class="shader-controls-value">{waveCount()}</span>
            <input
              type="range"
              class="shader-controls-slider"
              min="1"
              max="5"
              step="1"
              value={waveCount()}
              onInput={(e) => {
                setWaveCount(parseInt(e.currentTarget.value));
                emitConfig();
              }}
            />
          </label>

          <label class="shader-controls-slider-label">
            <span>Speed</span>
            <span class="shader-controls-value">{speed().toFixed(1)}</span>
            <input
              type="range"
              class="shader-controls-slider"
              min="0.1"
              max="3"
              step="0.1"
              value={speed()}
              onInput={(e) => {
                setSpeed(parseFloat(e.currentTarget.value));
                emitConfig();
              }}
            />
          </label>

          <label class="shader-controls-slider-label">
            <span>Intensity</span>
            <span class="shader-controls-value">{intensity().toFixed(1)}</span>
            <input
              type="range"
              class="shader-controls-slider"
              min="0.2"
              max="2"
              step="0.1"
              value={intensity()}
              onInput={(e) => {
                setIntensity(parseFloat(e.currentTarget.value));
                emitConfig();
              }}
            />
          </label>

          <label class="shader-controls-slider-label">
            <span>Frequency</span>
            <span class="shader-controls-value">{frequency().toFixed(1)}</span>
            <input
              type="range"
              class="shader-controls-slider"
              min="0.5"
              max="2"
              step="0.1"
              value={frequency()}
              onInput={(e) => {
                setFrequency(parseFloat(e.currentTarget.value));
                emitConfig();
              }}
            />
          </label>
        </div>
      </div>
    </DraggableTerminal>
  );
}
