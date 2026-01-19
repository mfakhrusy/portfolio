import { createSignal, onCleanup, onMount } from "solid-js";
import "./LabClock.css";

export function LabClock() {
  const [time, setTime] = createSignal(new Date());

  onMount(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    onCleanup(() => clearInterval(interval));
  });

  const formatTime = () => {
    const h = time().getHours().toString().padStart(2, "0");
    const m = time().getMinutes().toString().padStart(2, "0");
    const s = time().getSeconds().toString().padStart(2, "0");
    return { h, m, s };
  };

  const t = () => formatTime();

  return (
    <div class="lab-clock">
      {/* Front face */}
      <div class="lab-clock-face lab-clock-front">
        <div class="lab-clock-display">
          <span class="lab-clock-segment">{t().h}</span>
          <span class="lab-clock-colon">:</span>
          <span class="lab-clock-segment">{t().m}</span>
          <span class="lab-clock-colon">:</span>
          <span class="lab-clock-segment lab-clock-seconds">{t().s}</span>
        </div>
        <div class="lab-clock-label">TIME</div>
        <div class="lab-clock-scanline" />
      </div>
      {/* Depth sides */}
      <div class="lab-clock-face lab-clock-top" />
      <div class="lab-clock-face lab-clock-bottom" />
      <div class="lab-clock-face lab-clock-left" />
      <div class="lab-clock-face lab-clock-right" />
      <div class="lab-clock-face lab-clock-back" />
    </div>
  );
}
