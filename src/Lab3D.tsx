import { createSignal, onMount, Show } from "solid-js";
import "./Lab3D.css";
import { RobotLab } from "./Robot/RobotLab";
import { RobotProvider } from "./Robot/RobotContext";
import type { LabActions, LabPaintColor } from "./Robot/types";
import { LabTerminal } from "./LabTerminal";
import { LabClock } from "./LabClock";

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
  const [isEntering, setIsEntering] = createSignal(true);
  const [paintColor, setPaintColor] = createSignal<LabPaintColor>("blue");

  const labActions: LabActions = {
    setPaintColor: (color) => setPaintColor(color),
    getPaintColor: () => paintColor(),
    goToOffice: () => props.onBack?.(),
  };

  const palette = () => colorPalettes[paintColor()];

  onMount(() => {
    // Remove entering animation after it completes
    setTimeout(() => {
      setIsEntering(false);
    }, 2000);
  });

  return (
    <RobotProvider>
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
          <div class="lab-wall lab-wall-back" />

          {/* Front wall - where we entered (transparent) */}
          <div class="lab-wall lab-wall-front" />

          {/* Left wall */}
          <div class="lab-wall lab-wall-left" />

          {/* Right wall */}
          <div class="lab-wall lab-wall-right">
            <div class="lab-clock-wrapper">
              <LabClock />
            </div>
          </div>

          {/* Floor */}
          <div class="lab-wall lab-wall-floor" />

          {/* Ceiling */}
          <div class="lab-wall lab-wall-ceiling" />

          <RobotLab />
        </div>
        <Show when={!isEntering()}>
          <LabTerminal labActions={labActions} handleBack={props.onBack} />
        </Show>
      </div>
    </RobotProvider>
  );
}
