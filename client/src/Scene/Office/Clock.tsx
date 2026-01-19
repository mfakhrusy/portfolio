import { createSignal, onCleanup, onMount, Show } from "solid-js";
import "./Clock.css";

type ClockProps = {
  isInteractive: boolean;
};

export function Clock(props: ClockProps) {
  const [time, setTime] = createSignal(new Date());
  const [isZoomed, setIsZoomed] = createSignal(false);
  const [showDetailed, setShowDetailed] = createSignal(false);

  onMount(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    onCleanup(() => clearInterval(interval));
  });

  const hourRotation = () => {
    const hours = time().getHours() % 12;
    const minutes = time().getMinutes();
    return hours * 30 + minutes * 0.5;
  };

  const minuteRotation = () => {
    const minutes = time().getMinutes();
    const seconds = time().getSeconds();
    return minutes * 6 + seconds * 0.1;
  };

  const secondRotation = () => {
    const seconds = time().getSeconds();
    return seconds * 6;
  };

  const handleClick = (e: Event) => {
    e.stopPropagation();
    if (!props.isInteractive) return;
    if (!isZoomed()) {
      setIsZoomed(true);
      setTimeout(() => setShowDetailed(true), 300);
    } else {
      setShowDetailed(false);
      setTimeout(() => setIsZoomed(false), 300);
    }
  };

  const handleBackdropClick = () => {
    setShowDetailed(false);
    setTimeout(() => setIsZoomed(false), 300);
  };

  return (
    <>
      <Show when={isZoomed()}>
        <div class="clock-backdrop" onClick={handleBackdropClick} />
      </Show>

      <svg
        class="clock"
        classList={{ "clock-zoomed": isZoomed() }}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        onClick={handleClick}
      >
        {/* Clock face */}
        <circle cx="50" cy="50" r="48" class="clock-face" />

        {/* Inner ring */}
        <circle cx="50" cy="50" r="44" class="clock-inner" />

        {/* Hour markers */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const x1 = 50 + 38 * Math.cos(angle);
          const y1 = 50 + 38 * Math.sin(angle);
          const x2 = 50 + 42 * Math.cos(angle);
          const y2 = 50 + 42 * Math.sin(angle);
          return <line x1={x1} y1={y1} x2={x2} y2={y2} class="clock-marker" />;
        })}

        {/* Simple view elements - fade out when detailed */}
        <g
          class="clock-simple-view"
          classList={{ "clock-view-hidden": showDetailed() }}
        >
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="26"
            class="clock-hand hour-hand"
            style={{ transform: `rotate(${hourRotation()}deg)` }}
          />
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="16"
            class="clock-hand minute-hand"
            style={{ transform: `rotate(${minuteRotation()}deg)` }}
          />
          <circle cx="50" cy="50" r="3" class="clock-center" />
        </g>

        {/* Detailed view elements - fade in when zoomed */}
        <g
          class="clock-detailed-view"
          classList={{ "clock-view-visible": showDetailed() }}
        >
          {/* Minute markers */}
          {[...Array(60)].map((_, i) => {
            if (i % 5 === 0) return null;
            const angle = (i * 6 - 90) * (Math.PI / 180);
            const x1 = 50 + 40 * Math.cos(angle);
            const y1 = 50 + 40 * Math.sin(angle);
            const x2 = 50 + 42 * Math.cos(angle);
            const y2 = 50 + 42 * Math.sin(angle);
            return (
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                class="clock-marker-small"
              />
            );
          })}

          {/* Numbers */}
          {[...Array(12)].map((_, i) => {
            const hour = i === 0 ? 12 : i;
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const x = 50 + 32 * Math.cos(angle);
            const y = 50 + 32 * Math.sin(angle);
            return (
              <text
                x={x}
                y={y}
                class="clock-number"
                text-anchor="middle"
                dominant-baseline="central"
              >
                {hour}
              </text>
            );
          })}

          {/* Hands */}
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="26"
            class="clock-hand hour-hand"
            style={{ transform: `rotate(${hourRotation()}deg)` }}
          />
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="16"
            class="clock-hand minute-hand"
            style={{ transform: `rotate(${minuteRotation()}deg)` }}
          />
          <line
            x1="50"
            y1="55"
            x2="50"
            y2="12"
            class="clock-hand second-hand"
            style={{ transform: `rotate(${secondRotation()}deg)` }}
          />
          <circle
            cx="50"
            cy="50"
            r="4"
            class="clock-center clock-center-detailed"
          />
        </g>
      </svg>
    </>
  );
}
