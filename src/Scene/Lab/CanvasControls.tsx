import { createSignal } from "solid-js";
import { DraggableTerminal } from "./DraggableTerminal";
import { ColorPicker } from "./ColorPicker";
import "./CanvasControls.css";

type CanvasControlsProps = {
  brushColor: string;
  onColorChange: (color: string) => void;
};

export function CanvasControls(props: CanvasControlsProps) {
  const [displayColor, setDisplayColor] = createSignal(props.brushColor);

  const handleColorChange = (color: string) => {
    setDisplayColor(color);
    props.onColorChange(color);
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
