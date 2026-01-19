import { Show } from "solid-js";
import { CanvasControls } from "./CanvasControls";
import { HelpTerminal } from "./HelpTerminal";
import { LabTerminal } from "./LabTerminal";
import { ShaderControls } from "./ShaderControls";
import type { LabActions } from "../../Robot/types";
import type { WaveShaderConfig } from "./types";

type Props = {
  labActions: LabActions;
  onBack?: () => void;
  helpExpanded: boolean;
  setHelpExpanded: (expanded: boolean) => void;
  brushColor: () => string;
  setBrushColor: (color: string) => void;
  canvasVisible: () => boolean;
  shaderMode: () => string;
  shaderConfig: () => WaveShaderConfig;
  setWaveShaderConfig: (config: WaveShaderConfig) => void;
};

export function LabTerminals(props: Props) {
  return (
    <>
      <LabTerminal labActions={props.labActions} handleBack={props.onBack} />
      <HelpTerminal
        expanded={props.helpExpanded}
        onMinimize={() => props.setHelpExpanded(false)}
        onExpand={() => props.setHelpExpanded(true)}
      />
      <Show when={props.canvasVisible()}>
        <CanvasControls
          brushColor={props.brushColor()}
          onColorChange={props.setBrushColor}
        />
      </Show>
      <Show when={props.shaderMode() !== "none"}>
        <ShaderControls
          initialConfig={props.shaderConfig()}
          onConfigChange={props.setWaveShaderConfig}
        />
      </Show>
    </>
  );
}
