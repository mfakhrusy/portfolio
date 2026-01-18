import { createSignal, For } from "solid-js";
import { DraggableTerminal } from "./DraggableTerminal";
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

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: Math.round(l * 100) };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  if (max === r) {
    h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  } else if (max === g) {
    h = ((b - r) / d + 2) / 6;
  } else {
    h = ((r - g) / d + 4) / 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

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

  const selectPreset = (color: string) => {
    const hsl = hexToHsl(color);
    setHue(hsl.h);
    setSaturation(hsl.s);
    setLightness(hsl.l);
    props.onColorChange(color);
  };

  return (
    <DraggableTerminal
      title="BRUSH"
      initialPosition={{ x: 30, y: 30 }}
      initialSize={{ width: 220, height: 320 }}
      terminalClass="canvas-controls"
      showMinimizeButton={false}
      resizable={false}
    >
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
                onClick={() => selectPreset(color)}
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
    </DraggableTerminal>
  );
}
