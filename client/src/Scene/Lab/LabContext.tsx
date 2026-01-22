import {
  createContext,
  useContext,
  createSignal,
  type JSX,
  type Accessor,
  type Setter,
} from "solid-js";
import { type WaveShaderConfig, defaultWaveShaderConfig } from "./types";

type LabContextValue = {
  helpExpanded: Accessor<boolean>;
  setHelpExpanded: Setter<boolean>;
  brushColor: Accessor<string>;
  setBrushColor: Setter<string>;
  canvasVisible: Accessor<boolean>;
  setCanvasVisible: Setter<boolean>;
  shaderMode: Accessor<"none" | "back" | "all">;
  setShaderMode: Setter<"none" | "back" | "all">;
  shaderConfig: Accessor<WaveShaderConfig>;
  setShaderConfig: Setter<WaveShaderConfig>;
  clearCanvasTrigger: Accessor<number>;
  triggerClearCanvas: () => void;
};

const LabContext = createContext<LabContextValue>();

export function LabProvider(props: { children: JSX.Element }) {
  const [helpExpanded, setHelpExpanded] = createSignal(false);
  const [brushColor, setBrushColor] = createSignal("#000000");
  const [canvasVisible, setCanvasVisible] = createSignal(false);
  const [shaderMode, setShaderMode] = createSignal<"none" | "back" | "all">(
    "none",
  );
  const [shaderConfig, setShaderConfig] = createSignal<WaveShaderConfig>(
    defaultWaveShaderConfig,
  );
  const [clearCanvasTrigger, setClearCanvasTrigger] = createSignal(0);

  const triggerClearCanvas = () => {
    setClearCanvasTrigger((prev) => prev + 1);
  };

  return (
    <LabContext.Provider
      value={{
        helpExpanded,
        setHelpExpanded,
        brushColor,
        setBrushColor,
        canvasVisible,
        setCanvasVisible,
        shaderMode,
        setShaderMode,
        shaderConfig,
        setShaderConfig,
        clearCanvasTrigger,
        triggerClearCanvas,
      }}
    >
      {props.children}
    </LabContext.Provider>
  );
}

export function useLab() {
  const context = useContext(LabContext);
  if (!context) {
    throw new Error("useLab must be used within LabProvider");
  }
  return context;
}
