import { createSignal, onMount, Show } from "solid-js";
import "./LabTheme.css";
import "./Lab3D.css";
import { RobotLab } from "../../Robot/RobotLab";
import { RobotProvider } from "../../Robot/RobotContext";
import type { LabActions, LabPaintColor } from "../../Robot/types";
import { LabCanvas } from "./LabCanvas";
import { LabClock } from "./LabClock";
import { LabProvider, useLab } from "./LabContext";
import { TerminalInteractionProvider } from "./TerminalInteractionContext";
import { WaveShader } from "./WaveShader";
import { LabTerminals } from "./LabTerminals";

type Lab3DProps = {
  onBack?: () => void;
};

// Color palettes for each paint color
const colorPalettes: Record<
  LabPaintColor,
  {
    primary: string;
    secondary: string;
    dark: string;
    accent: string;
  }
> = {
  blue: {
    primary: "#1a1a2e",
    secondary: "#16213e",
    dark: "#0f0f1a",
    accent: "rgba(56, 189, 248, 0.05)",
  },
  green: {
    primary: "#1a2e1a",
    secondary: "#213e21",
    dark: "#0f1a0f",
    accent: "rgba(74, 222, 128, 0.05)",
  },
  red: {
    primary: "#2e1a1a",
    secondary: "#3e2121",
    dark: "#1a0f0f",
    accent: "rgba(248, 113, 113, 0.05)",
  },
  white: {
    primary: "#e8e8e8",
    secondary: "#d4d4d4",
    dark: "#c0c0c0",
    accent: "rgba(0, 0, 0, 0.03)",
  },
  black: {
    primary: "#0a0a0a",
    secondary: "#141414",
    dark: "#050505",
    accent: "rgba(255, 255, 255, 0.02)",
  },
};

export function Lab3D(props: Lab3DProps) {
  return (
    <TerminalInteractionProvider>
      <LabProvider>
        <RobotProvider>
          <Lab3DContent onBack={props.onBack} />
        </RobotProvider>
      </LabProvider>
    </TerminalInteractionProvider>
  );
}

function Lab3DContent(props: Lab3DProps) {
  const {
    helpExpanded,
    setHelpExpanded,
    canvasVisible,
    setCanvasVisible,
    shaderMode,
    setShaderMode,
  } = useLab();

  const [isEntering, setIsEntering] = createSignal(true);
  const [paintColor, setPaintColor] = createSignal<LabPaintColor>("blue");
  const [webpageVisible, setWebpageVisible] = createSignal(false);

  let backWallRef: HTMLDivElement | undefined;

  const labActions: LabActions = {
    setPaintColor: (color) => setPaintColor(color),
    getPaintColor: () => paintColor(),
    goToOffice: () => props.onBack?.(),
    showWebpage: () => setWebpageVisible(true),
    hideWebpage: () => setWebpageVisible(false),
    isWebpageVisible: () => webpageVisible(),
    showHelp: () => setHelpExpanded(true),
    hideHelp: () => setHelpExpanded(false),
    isHelpVisible: () => helpExpanded(),
    showCanvas: async () => {
      await new Promise((r) => setTimeout(r, 600));
      setCanvasVisible(true);
    },
    hideCanvas: () => setCanvasVisible(false),
    isCanvasVisible: () => canvasVisible(),
    showShaderBackWall: () => setShaderMode("back"),
    showShaderAllWalls: () => setShaderMode("all"),
    hideShader: () => setShaderMode("none"),
    getShaderMode: () => shaderMode(),
  };

  const palette = () => colorPalettes[paintColor()];

  onMount(() => {
    setTimeout(() => {
      setIsEntering(false);
    }, 2000);
  });

  return (
    <div
      class="lab-container"
      style={{
        "--lab-primary": palette().primary,
        "--lab-secondary": palette().secondary,
        "--lab-dark": palette().dark,
        "--lab-accent": palette().accent,
      }}
    >
      <div class="lab-room" classList={{ "lab-room-entering": isEntering() }}>
        {/* Back wall - facing us */}
        <div ref={backWallRef} class="lab-wall lab-wall-back">
          <Show when={webpageVisible()}>
            <iframe
              class="lab-back-iframe"
              src="https://www.youtube.com/embed/R0NME9W3cR4?autoplay=1&loop=1&playlist=R0NME9W3cR4&start=60&controls=0&modestbranding=1&showinfo=0&rel=0"
              title="Rain sounds"
              allow="autoplay; fullscreen"
            />
          </Show>
          <Show when={canvasVisible()}>
            <LabCanvas backWallRef={backWallRef} />
          </Show>
          <Show when={shaderMode() !== "none"}>
            <WaveShader />
          </Show>
        </div>

        {/* Front wall - where we entered (transparent) */}
        <div class="lab-wall lab-wall-front" />

        {/* Left wall */}
        <div class="lab-wall lab-wall-left">
          <Show when={shaderMode() === "all"}>
            <WaveShader />
          </Show>
        </div>

        {/* Right wall */}
        <div class="lab-wall lab-wall-right">
          <div class="lab-clock-wrapper">
            <LabClock />
          </div>
          <Show when={shaderMode() === "all"}>
            <WaveShader />
          </Show>
        </div>

        {/* Floor */}
        <div class="lab-wall lab-wall-floor">
          <Show when={shaderMode() === "all"}>
            <WaveShader />
          </Show>
        </div>

        {/* Ceiling */}
        <div class="lab-wall lab-wall-ceiling">
          <Show when={shaderMode() === "all"}>
            <WaveShader />
          </Show>
        </div>

        <RobotLab hidden={canvasVisible() || shaderMode() !== "none"} />
      </div>
      <Show when={!isEntering()}>
        <LabTerminals labActions={labActions} onBack={props.onBack} />
      </Show>
    </div>
  );
}
