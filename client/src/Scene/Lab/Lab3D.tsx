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
import { TerminalZIndexProvider } from "./TerminalZIndexContext";
import { WaveShader } from "./WaveShader";
import { LabTerminals } from "./LabTerminals";
import { LabHorizonPortal } from "./LabHorizonPortal";
import { MobileLabTerminal } from "./MobileLabTerminal";
import { MobileCanvasControls } from "./MobileCanvasControls";
import { MobileShaderControls } from "./MobileShaderControls";
import { MobileGuestBook } from "./MobileGuestBook";
import { useMobile } from "./useMobile";

type Lab3DProps = {
  onBack?: () => void;
  onHorizon?: () => void;
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
      <TerminalZIndexProvider>
        <LabProvider>
          <RobotProvider>
            <Lab3DContent onBack={props.onBack} onHorizon={props.onHorizon} />
          </RobotProvider>
        </LabProvider>
      </TerminalZIndexProvider>
    </TerminalInteractionProvider>
  );
}

type TouchGrassPhase =
  | "idle"
  | "walkForward"
  | "turnLeft"
  | "spawnPortal"
  | "walkThrough"
  | "done";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function Lab3DContent(props: Lab3DProps) {
  const {
    helpExpanded,
    setHelpExpanded,
    canvasVisible,
    setCanvasVisible,
    shaderMode,
    setShaderMode,
    guestBookVisible,
    setGuestBookVisible,
  } = useLab();
  const isMobile = useMobile();

  const [isEntering, setIsEntering] = createSignal(true);
  const [paintColor, setPaintColor] = createSignal<LabPaintColor>("blue");
  const [webpageVisible, setWebpageVisible] = createSignal(false);

  const [touchGrassPhase, setTouchGrassPhase] =
    createSignal<TouchGrassPhase>("idle");
  const [camZ, setCamZ] = createSignal(0);
  const [camRotY, setCamRotY] = createSignal(0);
  const [portalVisible, setPortalVisible] = createSignal(false);
  const [portalOverlayOn, setPortalOverlayOn] = createSignal(false);
  const [cinematicLock, setCinematicLock] = createSignal(false);

  let backWallRef: HTMLDivElement | undefined;

  const runTouchGrassCinematic = async () => {
    if (cinematicLock()) return;
    setCinematicLock(true);

    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;
    if (reduced) {
      props.onHorizon?.();
      setCinematicLock(false);
      return;
    }

    setTouchGrassPhase("walkForward");
    setCamZ(140);
    await wait(900);

    setTouchGrassPhase("turnLeft");
    setCamRotY(-90);
    await wait(900);

    setTouchGrassPhase("spawnPortal");
    setPortalVisible(true);
    await wait(700);

    setTouchGrassPhase("walkThrough");
    setCamZ(520);
    setPortalOverlayOn(true);
    await wait(900);

    props.onHorizon?.();
    await wait(250);

    setTouchGrassPhase("done");
    setCinematicLock(false);
  };

  const labActions: LabActions = {
    setPaintColor: (color) => setPaintColor(color),
    getPaintColor: () => paintColor(),
    goToOffice: () => props.onBack?.(),
    goToHorizon: () => props.onHorizon?.(),
    goToHorizonCinematic: runTouchGrassCinematic,
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
    showGuestBook: () => setGuestBookVisible(true),
    hideGuestBook: () => setGuestBookVisible(false),
    isGuestBookVisible: () => guestBookVisible(),
  };

  const palette = () => colorPalettes[paintColor()];

  // Debug mode: add ?debug=portal#lab to URL to show portal immediately in the lab scene
  const debugPortal =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("debug") === "portal";

  onMount(() => {
    if (debugPortal) {
      // Skip entry animation, show portal immediately facing left wall
      setIsEntering(false);
      setTouchGrassPhase("spawnPortal");
      setCamRotY(-90);
      setPortalVisible(true);
    } else {
      setTimeout(() => {
        setIsEntering(false);
      }, 2000);
    }
  });

  const isCinematic = () => touchGrassPhase() !== "idle" || debugPortal;

  return (
    <>
      <div
        class="lab-container"
        style={{
          "--lab-primary": palette().primary,
          "--lab-secondary": palette().secondary,
          "--lab-dark": palette().dark,
          "--lab-accent": palette().accent,
        }}
      >
        <div
          class="lab-room-shell"
          classList={{ "lab-room-entering": isEntering() }}
        >
          <div
            class="lab-room"
            classList={{
              "lab-cinematic": isCinematic(),
            }}
            style={{
              "--cam-z": `${camZ()}px`,
              "--cam-rot-y": `${camRotY()}deg`,
            }}
          >
            {/* Back wall - facing us */}
            <div ref={backWallRef} class="lab-wall lab-wall-back">
              {/* Clock on back wall for mobile (hidden when canvas/rain active) */}
              <Show when={isMobile() && !webpageVisible() && !canvasVisible()}>
                <div class="lab-clock-wrapper lab-clock-wrapper-mobile">
                  <LabClock />
                </div>
              </Show>
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

            {/* Left wall with horizon portal */}
            <div class="lab-wall lab-wall-left">
              <LabHorizonPortal visible={portalVisible()} />
              <Show when={shaderMode() === "all"}>
                <WaveShader />
              </Show>
            </div>

            {/* Right wall - hidden on mobile during touch grass cinematic */}
            <Show when={!(isMobile() && isCinematic())}>
              <div class="lab-wall lab-wall-right">
                {/* Clock only on desktop - mobile has it on back wall */}
                <Show when={!isMobile()}>
                  <div class="lab-clock-wrapper">
                    <LabClock />
                  </div>
                </Show>
                <Show when={shaderMode() === "all"}>
                  <WaveShader />
                </Show>
              </div>
            </Show>

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
        </div>

        <Show when={portalOverlayOn()}>
          <div class="portal-transition-overlay" />
        </Show>

        <Show when={!isEntering() && !isCinematic()}>
          <LabTerminals labActions={labActions} onBack={props.onBack} />
        </Show>
      </div>

      {/* Mobile terminal rendered outside lab-container to avoid perspective/transform issues */}
      <Show when={isMobile() && !isEntering() && !isCinematic()}>
        <MobileLabTerminal labActions={labActions} handleBack={props.onBack} />
      </Show>

      {/* Mobile canvas controls - rendered outside lab-container */}
      <Show
        when={isMobile() && canvasVisible() && !isEntering() && !isCinematic()}
      >
        <MobileCanvasControls />
      </Show>

      {/* Mobile shader controls - rendered outside lab-container */}
      <Show
        when={
          isMobile() &&
          shaderMode() !== "none" &&
          !isEntering() &&
          !isCinematic()
        }
      >
        <MobileShaderControls />
      </Show>

      {/* Mobile guest book - rendered outside lab-container */}
      <Show
        when={
          isMobile() && guestBookVisible() && !isEntering() && !isCinematic()
        }
      >
        <MobileGuestBook />
      </Show>
    </>
  );
}
