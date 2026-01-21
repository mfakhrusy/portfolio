import { createMemo, Show } from "solid-js";
import { GrassShader } from "../Horizon/GrassShader";
import { computeSkyColors } from "../Horizon/DayNightContext";

type LabHorizonPortalProps = {
  visible: boolean;
};

export function LabHorizonPortal(props: LabHorizonPortalProps) {
  const skyColors = createMemo(() => {
    const now = new Date();
    const timeOfDay = now.getHours() + now.getMinutes() / 60;
    return computeSkyColors(timeOfDay);
  });

  return (
    <div
      class="lab-horizon-portal-tunnel"
      classList={{ "lab-horizon-portal-tunnel-visible": props.visible }}
    >
      <div class="tunnel-wall tunnel-top" />
      <div class="tunnel-wall tunnel-bottom" />
      <div class="tunnel-wall tunnel-left" />
      <div class="tunnel-wall tunnel-right" />
      <div class="lab-horizon-portal">
        <div
          class="lab-horizon-portal-sky"
          style={{
            background: `linear-gradient(180deg, ${skyColors().topColor} 0%, ${skyColors().bottomColor} 100%)`,
          }}
        />
        <div
          class="lab-horizon-portal-grass"
          style={{
            background: `linear-gradient(180deg, ${skyColors().ground1} 0%, ${skyColors().ground2} 50%, ${skyColors().ground3} 100%)`,
          }}
        >
          <Show when={props.visible}>
            <GrassShader lightIntensity={skyColors().lightIntensity} />
          </Show>
        </div>
      </div>
    </div>
  );
}
