import { createSignal, createEffect } from "solid-js";
import "./Horizon.css";
import { HorizonDoor } from "./HorizonDoor";
import { GrassShader } from "./GrassShader";

type HorizonProps = {
  onEnterDoor: () => void;
};

export function Horizon(props: HorizonProps) {
  const [isInteractive, setIsInteractive] = createSignal(false);

  createEffect(() => {
    // Scene entrance delay before interactions are enabled
    setTimeout(() => setIsInteractive(true), 2000);
  });

  return (
    <div class="horizon-scene">
      {/* Sky background */}
      <div class="horizon-sky" />

      {/* Ground with grass shader */}
      <div class="horizon-ground">
        <GrassShader />
      </div>

      {/* Door */}
      <HorizonDoor
        isInteractive={isInteractive()}
        onEnter={props.onEnterDoor}
      />
    </div>
  );
}
