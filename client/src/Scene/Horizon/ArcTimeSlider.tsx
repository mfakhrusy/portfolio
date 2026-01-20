import { createSignal, createEffect, onCleanup } from "solid-js";
import "./ArcTimeSlider.css";

type ArcTimeSliderProps = {
  value: number;
  onChange: (value: number) => void;
};

const ARC_RADIUS_X = 45;
const ARC_RADIUS_Y = 70;
const ARC_CENTER_Y = 85;
const MIN_ANGLE = 0.05;
const MAX_ANGLE = Math.PI - 0.05;

export function ArcTimeSlider(props: ArcTimeSliderProps) {
  let containerRef: HTMLDivElement | undefined;
  const [isDragging, setIsDragging] = createSignal(false);

  const timeToAngle = (time: number) => {
    const clampedTime = Math.max(0, Math.min(24, time));
    const angle = Math.PI - (clampedTime / 24) * Math.PI;
    return Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, angle));
  };

  const angleToTime = (angle: number) => {
    const clampedAngle = Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, angle));
    const normalizedAngle = Math.PI - clampedAngle;
    return (normalizedAngle / Math.PI) * 24;
  };

  const getOrbPosition = () => {
    const angle = timeToAngle(props.value);
    const x = 50 + Math.cos(angle) * ARC_RADIUS_X;
    const y = ARC_CENTER_Y - Math.sin(angle) * ARC_RADIUS_Y;
    return { x, y };
  };

  const isNight = () => props.value < 6 || props.value >= 18;

  const handleInteraction = (clientX: number, clientY: number) => {
    if (!containerRef) return;

    const rect = containerRef.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height * (ARC_CENTER_Y / 100);

    const dx = clientX - centerX;
    const dy = centerY - clientY;

    let angle = Math.atan2(dy, dx);

    if (dy < 0) {
      angle = dx > 0 ? MIN_ANGLE : MAX_ANGLE;
    }

    angle = Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, angle));

    const time = angleToTime(angle);
    props.onChange(time);
  };

  const handleOrbMouseDown = (e: MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    document.body.classList.add("arc-slider-dragging");
  };

  const handleOrbTouchStart = (e: TouchEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    document.body.classList.add("arc-slider-dragging");
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging()) return;
    handleInteraction(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.classList.remove("arc-slider-dragging");
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging()) return;
    const touch = e.touches[0];
    handleInteraction(touch.clientX, touch.clientY);
  };

  createEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleMouseUp);

    onCleanup(() => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    });
  });

  const pos = () => getOrbPosition();

  return (
    <div ref={containerRef} class="arc-time-slider">
      {/* Arc path guide */}
      <svg class="arc-path" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="rgba(150, 150, 200, 0.4)" />
            <stop offset="50%" stop-color="rgba(255, 200, 100, 0.5)" />
            <stop offset="100%" stop-color="rgba(150, 150, 200, 0.4)" />
          </linearGradient>
          <filter id="arcGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M 5 85 A 45 70 0 0 1 95 85"
          fill="none"
          stroke="url(#arcGradient)"
          stroke-width="0.8"
          stroke-linecap="round"
          filter="url(#arcGlow)"
          opacity="0.6"
        />
      </svg>

      {/* Sun/Moon orb - only this is draggable */}
      <div
        class="time-orb"
        classList={{ night: isNight(), dragging: isDragging() }}
        style={{
          left: `${pos().x}%`,
          top: `${pos().y}%`,
        }}
        onMouseDown={handleOrbMouseDown}
        onTouchStart={handleOrbTouchStart}
      >
        <div class="orb-glow" />
        <div class="orb-body">
          {isNight() ? <div class="moon-craters" /> : <div class="sun-rays" />}
        </div>
      </div>
    </div>
  );
}
