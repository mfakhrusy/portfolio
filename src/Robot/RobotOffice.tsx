import { createSignal, Show } from "solid-js";
import { RobotBase } from "./RobotBase";
import { SpeechBubble } from "./SpeechBubble";
import { ChatPanel } from "./ChatPanel";
import { parseOfficeCommand } from "./commands/officeCommands";
import type { OfficeActions } from "./types";
import { useRobot } from "./RobotContext";
import "./RobotOffice.css";

export type { OfficeActions };

type RobotOfficeProps = {
  roomActions: OfficeActions;
  isInteractive: boolean;
};

export function RobotOffice(props: RobotOfficeProps) {
  const { isTalking, setIsTalking } = useRobot();
  const [isChatMode, setIsChatMode] = createSignal(false);
  const [isWelcomeStarted, setIsWelcomeStarted] = createSignal(false);
  const [isWelcomeComplete, setIsWelcomeComplete] = createSignal(false);

  const handleRobotClick = (e: Event) => {
    e.stopPropagation();
    if (!props.isInteractive) return;
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
        <RobotBase
          isTalking={isTalking()}
          showWave={isWelcomeStarted() && !isWelcomeComplete()}
          isInteractive={props.isInteractive}
          view="front"
        />
        <Show when={!isChatMode()}>
          <SpeechBubble
            onTalkingChange={setIsTalking}
            onStart={() => setIsWelcomeStarted(true)}
            onComplete={() => setIsWelcomeComplete(true)}
          />
        </Show>
        <Show when={isChatMode()}>
          <ChatPanel
            onTalkingChange={setIsTalking}
            actions={props.roomActions}
            parseCommand={parseOfficeCommand}
            welcomeMessage="Hi! Ask me anything about Fahru, or try controlling the room - like 'turn off the light'!"
          />
        </Show>
      </div>
    </>
  );
}
