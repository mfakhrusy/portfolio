import { createSignal, createEffect } from "solid-js";
import "./Horizon.css";
import { HorizonDoor } from "./HorizonDoor";
import { GrassShader } from "./GrassShader";
import { DayNightProvider, useDayNight } from "./DayNightContext";

type HorizonProps = {
  onEnterDoor: () => void;
};

function HorizonScene(props: HorizonProps) {
  const [isInteractive, setIsInteractive] = createSignal(false);
  const { state, setTimeOfDay } = useDayNight();

  createEffect(() => {
    // Scene entrance delay before interactions are enabled
    setTimeout(() => setIsInteractive(true), 2000);
  });

  return (
    <div class="horizon-scene" style={state().skyStyle}>
      {/* Sky background */}
      <div class="horizon-sky" />

      {/* Ground with grass shader */}
      <div class="horizon-ground">
        <GrassShader lightIntensity={state().lightIntensity} />
      </div>

      {/* Door */}
      <HorizonDoor
        isInteractive={isInteractive()}
        onEnter={props.onEnterDoor}
      />

      {/* Time Control Slider */}
      <div class="time-control">
        <input
          type="range"
          min="0"
          max="24"
          step="0.1"
          value={state().timeOfDay}
          onInput={(e) => setTimeOfDay(parseFloat(e.currentTarget.value))}
        />
      </div>
    </div>
  );
}

export function Horizon(props: HorizonProps) {
  return (
    <DayNightProvider>
      <HorizonScene {...props} />
    </DayNightProvider>
  );
}
