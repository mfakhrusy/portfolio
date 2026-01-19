import { createSignal } from "solid-js";
import { DraggableTerminal } from "./DraggableTerminal";
import { ColorPicker } from "./ColorPicker";
import { useLab } from "./LabContext";
import "./CanvasControls.css";

export function CanvasControls() {
  const { brushColor, setBrushColor } = useLab();
  const [displayColor, setDisplayColor] = createSignal(brushColor());

  const handleColorChange = (color: string) => {
    setDisplayColor(color);
    setBrushColor(color);
  };

  return (
    <DraggableTerminal
      title="BRUSH"
      initialPosition={{ x: 30, y: 30 }}
      initialSize={{ width: 220, height: 280 }}
      terminalClass="canvas-controls"
      showMinimizeButton={false}
      resizable={false}
    >
      <div class="canvas-controls-body">
        <ColorPicker
          currentColor={displayColor()}
          onColorChange={handleColorChange}
        />
      </div>
    </DraggableTerminal>
  );
}
