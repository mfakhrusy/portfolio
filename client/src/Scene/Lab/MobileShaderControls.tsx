import { createSignal } from "solid-js";
import { ColorPicker, hslToRgbNormalized } from "./ColorPicker";
import { useLab } from "./LabContext";
import "./MobileShaderControls.css";

export function MobileShaderControls() {
  const { shaderConfig, setShaderConfig } = useLab();
  const [isMinimized, setIsMinimized] = createSignal(false);
  const [displayColor, setDisplayColor] = createSignal("hsl(200, 80%, 60%)");
  const [color, setColor] = createSignal(shaderConfig().color);
  const [intensity, setIntensity] = createSignal(shaderConfig().intensity);
  const [speed, setSpeed] = createSignal(shaderConfig().speed);
  const [waveCount, setWaveCount] = createSignal(shaderConfig().waveCount);
  const [frequency, setFrequency] = createSignal(shaderConfig().frequency);

  const emitConfig = () => {
    setShaderConfig({
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
    <div
      class="mobile-shader-controls"
      classList={{ "mobile-shader-controls-minimized": isMinimized() }}
    >
      <div class="mobile-shader-controls-header">
        <span class="mobile-shader-controls-title">WAVE SHADER</span>
        <button
          class="mobile-shader-controls-toggle"
          onClick={() => setIsMinimized(!isMinimized())}
          title={isMinimized() ? "Maximize" : "Minimize"}
        >
          <span class="mobile-shader-controls-toggle-icon">
            {isMinimized() ? "□" : "−"}
          </span>
        </button>
      </div>

      {!isMinimized() && (
        <div class="mobile-shader-controls-body">
          <div class="mobile-shader-controls-section">
            <div class="mobile-shader-controls-section-title">Color</div>
            <ColorPicker
              currentColor={displayColor()}
              onColorChange={setDisplayColor}
              onHslChange={handleHslChange}
            />
          </div>

          <div class="mobile-shader-controls-section">
            <div class="mobile-shader-controls-section-title">
              Wave Settings
            </div>

            <label class="mobile-shader-controls-slider-label">
              <span>Waves</span>
              <span class="mobile-shader-controls-value">{waveCount()}</span>
              <input
                type="range"
                class="mobile-shader-controls-slider"
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

            <label class="mobile-shader-controls-slider-label">
              <span>Speed</span>
              <span class="mobile-shader-controls-value">
                {speed().toFixed(1)}
              </span>
              <input
                type="range"
                class="mobile-shader-controls-slider"
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

            <label class="mobile-shader-controls-slider-label">
              <span>Intensity</span>
              <span class="mobile-shader-controls-value">
                {intensity().toFixed(1)}
              </span>
              <input
                type="range"
                class="mobile-shader-controls-slider"
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

            <label class="mobile-shader-controls-slider-label">
              <span>Frequency</span>
              <span class="mobile-shader-controls-value">
                {frequency().toFixed(1)}
              </span>
              <input
                type="range"
                class="mobile-shader-controls-slider"
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
      )}
    </div>
  );
}
