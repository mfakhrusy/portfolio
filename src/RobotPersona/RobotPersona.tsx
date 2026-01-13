import { createSignal, Show } from "solid-js";
import { SpeechBubble } from "./SpeechBubble";
import { ChatPanel } from "./ChatPanel";
import "./RobotPersona.css";

export type RoomActions = {
  toggleLamp: () => void;
  setLampOn: (on: boolean) => void;
  isLampOn: () => boolean;
};

type RobotPersonaProps = {
  roomActions: RoomActions;
};

export function RobotPersona(props: RobotPersonaProps) {
  const [isChatMode, setIsChatMode] = createSignal(false);
  const [isTalking, setIsTalking] = createSignal(false);
  const [isWelcomeStarted, setIsWelcomeStarted] = createSignal(false);
  const [isWelcomeComplete, setIsWelcomeComplete] = createSignal(false);

  const handleRobotClick = (e: Event) => {
    e.stopPropagation();
    setIsChatMode(true);
  };

  const handleBackdropClick = () => {
    setIsChatMode(false);
  };

  return (
    <>
      <Show when={isChatMode()}>
        <div class="robot-backdrop" onClick={handleBackdropClick} />
      </Show>

      <div
        class="robot-persona"
        classList={{ "robot-persona-chat-mode": isChatMode() }}
        onClick={handleRobotClick}
      >
        <RobotPersonaSvg
          isTalking={isTalking()}
          showWave={isWelcomeStarted() && !isWelcomeComplete()}
        />
        <Show when={!isChatMode()}>
          <SpeechBubble
            onTalkingChange={setIsTalking}
            onWelcomeStart={() => setIsWelcomeStarted(true)}
            onWelcomeComplete={() => setIsWelcomeComplete(true)}
          />
        </Show>
        <Show when={isChatMode()}>
          <ChatPanel
            onTalkingChange={setIsTalking}
            roomActions={props.roomActions}
          />
        </Show>
      </div>
    </>
  );
}

type RobotPersonaSvgProps = {
  isTalking: boolean;
  showWave: boolean;
};

function RobotPersonaSvg(props: RobotPersonaSvgProps) {
  return (
    <svg
      class="robot-persona-svg"
      width="200px"
      height="200px"
      viewBox="-200 -200 2046 974"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      // @ts-ignore
      xml:space="preserve"
    >
      <rect
        class="robot-body-outer"
        x={331.04}
        y={0}
        width={975.169}
        height={524.831}
      />

      <rect
        class="robot-body-inner"
        x={337.358}
        y={6.1}
        width={975.169}
        height={524.831}
      />

      <g transform="matrix(382.409469,0,0,382.409469,615.658175,310.71451)" />

      <RobotPersonaRightEye />
      <RobotPersonaLeftEye />
      <RobotPersonaMouth isTalking={props.isTalking} />
      <RobotPersonaRightHand showWave={props.showWave} />
      <RobotPersonaLeftHand />
    </svg>
  );
}

function RobotPersonaRightEye() {
  return (
    <text class="robot-eye" x="392.337px" y="310.715px">
      &gt;
    </text>
  );
}

function RobotPersonaLeftEye() {
  return (
    <g transform="matrix(-1,0,0,-1,9415.006527,12926.613143)">
      <g transform="matrix(382.409469,0,0,382.409469,8392.363856,12885.713908)" />
      <text class="robot-eye" x="8169.043px" y="12885.714px">
        &gt;
      </text>
    </g>
  );
}

function RobotPersonaMouth(props: { isTalking: boolean }) {
  return (
    <rect
      class="robot-mouth"
      classList={{ "robot-mouth-talking": props.isTalking }}
      x={698.198}
      y={400.496}
      width={253.49}
      height={29.42}
    />
  );
}

function RobotPersonaRightHand(props: { showWave: boolean }) {
  return (
    <g class="robot-right-hand-group">
      <path
        class="robot-right-hand"
        classList={{ "robot-right-hand-waving": props.showWave }}
        d="M4.483,423.544c49.795,-26.362 55.164,-30.647 55.164,-30.647c0,0 9.194,177.75 113.392,101.134c104.198,-76.617 -19.29,-161.525 -47.953,-160.444c-28.663,1.081 52.55,-46.421 52.55,-46.421c0,0 173.153,176.218 55.164,263.561c-117.989,87.343 -254.367,-113.392 -228.317,-127.183Z"
      />
    </g>
  );
}

function RobotPersonaLeftHand() {
  return (
    <path
      class="robot-left-hand"
      d="M1508.023,296.791c26.362,49.795 30.647,55.164 30.647,55.164c0,0 -177.75,9.194 -101.134,113.392c76.617,104.198 161.525,-19.29 160.444,-47.953c-1.081,-28.663 46.421,52.55 46.421,52.55c0,0 -176.218,173.153 -263.561,55.164c-87.343,-117.989 113.392,-254.367 127.183,-228.317Z"
    />
  );
}
