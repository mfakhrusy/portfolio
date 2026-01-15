import { createSignal, onMount, Show } from "solid-js";
import { RobotBase, type RobotView } from "./RobotBase";
import { SpeechBubble } from "./SpeechBubble";
import "./RobotLab.css";

const labSentences = [
  "Welcome to the lab!",
  " This is where I experiment with new ideas...",
];

type RobotLabPhase = "waiting" | "entering" | "turning" | "facing" | "talking";

type RobotLabProps = {
  onEntryComplete?: () => void;
};

export function RobotLab(props: RobotLabProps) {
  const [phase, setPhase] = createSignal<RobotLabPhase>("waiting");
  const [isTalking, setIsTalking] = createSignal(false);

  const robotView = (): RobotView => {
    const p = phase();
    if (p === "waiting" || p === "entering") return "back";
    return "front";
  };

  onMount(() => {
    // Start entrance after room animation completes (2s)
    setTimeout(() => {
      setPhase("entering");
    }, 2200);

    // Start turning - this is when view switches to "front"
    setTimeout(() => {
      setPhase("turning");
    }, 4200);

    // Facing complete
    setTimeout(() => {
      setPhase("facing");
    }, 5200);

    // Start talking
    setTimeout(() => {
      setPhase("talking");
    }, 5700);
  });

  const handleSpeechComplete = () => {
    setIsTalking(false);
    props.onEntryComplete?.();
  };

  return (
    <div
      class="robot-lab-container"
      classList={{
        "robot-lab-waiting": phase() === "waiting",
        "robot-lab-entering": phase() === "entering",
        "robot-lab-turning": phase() === "turning",
        "robot-lab-facing": phase() === "facing" || phase() === "talking",
      }}
    >
      <div class="robot-lab-body">
        <RobotBase
          view={robotView()}
          isTalking={isTalking()}
          isInteractive={true}
        />
      </div>

      {/* Speech bubble after turning */}
      <Show when={phase() === "talking"}>
        <div class="robot-lab-speech">
          <SpeechBubble
            sentences={labSentences}
            startDelay={0}
            onTalkingChange={setIsTalking}
            onComplete={handleSpeechComplete}
          />
        </div>
      </Show>
    </div>
  );
}
