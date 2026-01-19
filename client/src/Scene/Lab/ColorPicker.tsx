import { createSignal, For } from "solid-js";
import "./ColorPicker.css";

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

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
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

export function hslToRgbNormalized(
  h: number,
  s: number,
  l: number,
): [number, number, number] {
  const sNorm = s / 100;
  const lNorm = l / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return [r + m, g + m, b + m];
}

type ColorPickerProps = {
  currentColor: string;
  onColorChange: (color: string) => void;
  onHslChange?: (h: number, s: number, l: number) => void;
};

export function ColorPicker(props: ColorPickerProps) {
  const [hue, setHue] = createSignal(200);
  const [saturation, setSaturation] = createSignal(80);
  const [lightness, setLightness] = createSignal(60);

  const updateColorFromHSL = () => {
    const color = `hsl(${hue()}, ${saturation()}%, ${lightness()}%)`;
    props.onColorChange(color);
    props.onHslChange?.(hue(), saturation(), lightness());
  };

  const selectPreset = (color: string) => {
    const hsl = hexToHsl(color);
    setHue(hsl.h);
    setSaturation(hsl.s);
    setLightness(hsl.l);
    props.onColorChange(color);
    props.onHslChange?.(hsl.h, hsl.s, hsl.l);
  };

  return (
    <div class="color-picker">
      <div
        class="color-picker-current"
        style={{ background: props.currentColor }}
      />

      <div class="color-picker-presets">
        <For each={PRESET_COLORS}>
          {(color) => (
            <button
              class="color-picker-preset"
              classList={{ active: props.currentColor === color }}
              style={{ background: color }}
              onClick={() => selectPreset(color)}
            />
          )}
        </For>
      </div>

      <div class="color-picker-sliders">
        <label class="color-picker-slider-label">
          <span>Hue</span>
          <input
            type="range"
            class="color-picker-slider color-picker-hue"
            min="0"
            max="360"
            value={hue()}
            onInput={(e) => {
              setHue(parseInt(e.currentTarget.value));
              updateColorFromHSL();
            }}
          />
        </label>

        <label class="color-picker-slider-label">
          <span>Sat</span>
          <input
            type="range"
            class="color-picker-slider"
            min="0"
            max="100"
            value={saturation()}
            onInput={(e) => {
              setSaturation(parseInt(e.currentTarget.value));
              updateColorFromHSL();
            }}
          />
        </label>

        <label class="color-picker-slider-label">
          <span>Light</span>
          <input
            type="range"
            class="color-picker-slider"
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
  );
}
