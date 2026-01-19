import { createSignal } from "solid-js";
import { DraggableTerminal } from "./DraggableTerminal";
import { ColorPicker, hslToRgbNormalized } from "./ColorPicker";
import "./ShaderControls.css";

type ShaderControlsProps = {
  onColorChange: (color: [number, number, number]) => void;
};

export function ShaderControls(props: ShaderControlsProps) {
  const [isMinimized, setIsMinimized] = createSignal(false);
  const [displayColor, setDisplayColor] = createSignal("hsl(200, 80%, 60%)");

  const handleHslChange = (h: number, s: number, l: number) => {
    const rgb = hslToRgbNormalized(h, s, l);
    props.onColorChange(rgb);
  };

  return (
    <DraggableTerminal
      title="SHADER"
      initialPosition={{ x: 30, y: 100 }}
      initialSize={{ width: 220, height: 280 }}
      minSize={{ width: 200, height: 250 }}
      terminalClass="shader-controls"
      isMinimized={() => isMinimized()}
      onMinimize={() => setIsMinimized(true)}
      onExpand={() => setIsMinimized(false)}
      fabIcon="◇"
      fabPosition="bottom-left"
      resizable={false}
    >
      <div class="shader-controls-body">
        <ColorPicker
          currentColor={displayColor()}
          onColorChange={setDisplayColor}
          onHslChange={handleHslChange}
        />
      </div>
    </DraggableTerminal>
  );
}
