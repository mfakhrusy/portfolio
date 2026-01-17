import { createSignal, createEffect } from "solid-js";
import type { LampPhase } from "./type";
import { Lamp } from "./Lamp";
import { Clock } from "./Clock";
import { Calendar } from "./Calendar";
import { Door } from "./Door";
import { RobotOffice } from "./Robot/RobotOffice";
import { RobotProvider } from "./Robot/RobotContext";

type OfficeProps = {
  onEnterDoor: () => void;
};

export function Office(props: OfficeProps) {
  const [lampPhase, setLampPhase] = createSignal<LampPhase>("no-lamp");
  const [isLampOn, setIsLampOn] = createSignal(true);
  const [isInteractive, setIsInteractive] = createSignal(false);

  const roomActions = {
    toggleLamp: () => setIsLampOn((prev) => !prev),
    setLampOn: (on: boolean) => setIsLampOn(on),
    isLampOn: () => isLampOn(),
  };

  const runLampSequence = async () => {
    if (lampPhase() !== "no-lamp") return;

    setLampPhase("brightening");
    await new Promise((r) => setTimeout(r, 0));

    setLampPhase("placed");
  };

  createEffect(() => {
    setLampPhase("no-lamp");
    setIsInteractive(false);
    setTimeout(() => runLampSequence(), 0);
    setTimeout(() => setIsInteractive(true), 5000);
  });

  return (
    <div
      class="room"
      classList={{
        brightened:
          (lampPhase() === "brightening" || lampPhase() === "placed") &&
          isLampOn(),
        dimmed: lampPhase() === "placed" && !isLampOn(),
      }}
    >
      <Lamp isOn={isLampOn()} />
      <Clock isInteractive={isInteractive()} />
      <Calendar isInteractive={isInteractive()} />
      <Door isInteractive={isInteractive()} onEnter={props.onEnterDoor} />
      <RobotProvider>
        <RobotOffice
          roomActions={roomActions}
          isInteractive={isInteractive()}
        />
      </RobotProvider>
    </div>
  );
}
