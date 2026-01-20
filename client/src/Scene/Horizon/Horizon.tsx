import { createSignal, createEffect } from "solid-js";
import "./Horizon.css";
import { HorizonDoor } from "./HorizonDoor";
import { GrassShader } from "./GrassShader";
import { DayNightProvider, useDayNight } from "./DayNightContext";
import { TimeWheel } from "./TimeWheel";
import milkyWayAvif from "../../assets/milky-way-bg.avif";
import milkyWayJpg from "../../assets/milky-way-bg.jpg";

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
      {/* Milky Way night sky */}
      <picture class="milky-way-bg">
        <source srcset={milkyWayAvif} type="image/avif" />
        <img src={milkyWayJpg} alt="" aria-hidden="true" />
      </picture>

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

      {/* Time Wheel */}
      <TimeWheel value={state().timeOfDay} onChange={setTimeOfDay} />
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
