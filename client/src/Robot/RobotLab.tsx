import { createSignal, onMount } from "solid-js";
import { RobotBase, type RobotView } from "./RobotBase";
import { useRobot } from "./RobotContext";
import "./RobotLab.css";

type RobotLabPhase = "waiting" | "entering" | "arrived" | "terminal";

type RobotLabProps = {
  onEntryComplete?: () => void;
  hidden?: boolean;
};

export function RobotLab(props: RobotLabProps) {
  const { isTalking } = useRobot();
  const [phase, setPhase] = createSignal<RobotLabPhase>("waiting");

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

    // Arrived at back of room - show face
    setTimeout(() => {
      setPhase("arrived");
    }, 4200);

    // Show terminal
    setTimeout(() => {
      setPhase("terminal");
      props.onEntryComplete?.();
    }, 4700);
  });

  return (
    <div
      class="robot-lab-container"
      classList={{
        "robot-lab-waiting": phase() === "waiting",
        "robot-lab-entering": phase() === "entering",
        "robot-lab-arrived": phase() === "arrived" || phase() === "terminal",
        "robot-lab-hidden": props.hidden,
      }}
    >
      <div class="robot-lab-body">
        <RobotBase
          view={robotView()}
          isTalking={isTalking()}
          isInteractive={true}
        />
      </div>
    </div>
  );
}
