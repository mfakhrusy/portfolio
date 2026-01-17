// TODO: slider is still buggy -> when clicking the preset, slider should reset, but it doesn't
import { createSignal, For } from "solid-js";
import "./LabTerminal.css";

const PRESET_COLORS = [
  "#000000",
  "#ffffff",
  "#ff0000",
  "#ff8000",
  "#ffff00",
  "#00ff00",
  "#00ffff",
  "#0000ff",
  "#8000ff",
  "#ff00ff",
  "#808080",
  "#c0c0c0",
];

type CanvasControlsProps = {
  brushColor: string;
  onColorChange: (color: string) => void;
};

export function CanvasControls(props: CanvasControlsProps) {
  const [hue, setHue] = createSignal(0);
  const [saturation, setSaturation] = createSignal(100);
  const [lightness, setLightness] = createSignal(50);

  const updateColorFromHSL = () => {
    const color = `hsl(${hue()}, ${saturation()}%, ${lightness()}%)`;
    props.onColorChange(color);
  };

  return (
    <div class="lab-terminal canvas-controls">
      {/* Header */}
      <div class="lab-terminal-header">
        <span class="lab-terminal-title">BRUSH</span>
      </div>

      {/* Controls */}
      <div class="canvas-controls-body">
        {/* Current color */}
        <div
          class="canvas-controls-current"
          style={{ background: props.brushColor }}
        />

        {/* Preset colors */}
        <div class="canvas-controls-presets">
          <For each={PRESET_COLORS}>
            {(color) => (
              <button
                class="canvas-controls-preset"
                classList={{ active: props.brushColor === color }}
                style={{ background: color }}
                onClick={() => props.onColorChange(color)}
              />
            )}
          </For>
        </div>

        {/* HSL Sliders */}
        <div class="canvas-controls-sliders">
          <label class="canvas-controls-slider-label">
            <span>Hue</span>
            <input
              type="range"
              class="canvas-controls-slider canvas-controls-hue"
              min="0"
              max="360"
              value={hue()}
              onInput={(e) => {
                setHue(parseInt(e.currentTarget.value));
                updateColorFromHSL();
              }}
            />
          </label>

          <label class="canvas-controls-slider-label">
            <span>Sat</span>
            <input
              type="range"
              class="canvas-controls-slider"
              min="0"
              max="100"
              value={saturation()}
              onInput={(e) => {
                setSaturation(parseInt(e.currentTarget.value));
                updateColorFromHSL();
              }}
            />
          </label>

          <label class="canvas-controls-slider-label">
            <span>Light</span>
            <input
              type="range"
              class="canvas-controls-slider"
              min="0"
              max="100"
              value={lightness()}
              onInput={(e) => {
                setLightness(parseInt(e.currentTarget.value));
                updateColorFromHSL();
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
