import { createSignal } from "solid-js";
import { DraggableTerminal } from "./DraggableTerminal";
import { ColorPicker } from "./ColorPicker";
import { useLab } from "./LabContext";
import "./CanvasControls.css";

export function CanvasControls() {
  const { brushColor, setBrushColor, triggerClearCanvas } = useLab();
  const [displayColor, setDisplayColor] = createSignal(brushColor());

  const handleColorChange = (color: string) => {
    setDisplayColor(color);
    setBrushColor(color);
  };

  return (
    <DraggableTerminal
      title="CANVAS"
      initialPosition={{ x: 30, y: 30 }}
      initialSize={{ width: 220, height: 330 }}
      terminalClass="canvas-controls"
      showMinimizeButton={false}
      resizable={false}
    >
      <div class="canvas-controls-body">
        <ColorPicker
          currentColor={displayColor()}
          onColorChange={handleColorChange}
        />
        <button class="canvas-clear-button" onClick={triggerClearCanvas}>
          Clear Canvas
        </button>
      </div>
    </DraggableTerminal>
  );
}
