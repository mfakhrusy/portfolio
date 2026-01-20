import { createSignal, createEffect, onCleanup } from "solid-js";
import "./TimeWheel.css";

type TimeWheelProps = {
  value: number;
  onChange: (value: number) => void;
};

export function TimeWheel(props: TimeWheelProps) {
  let wheelRef: HTMLDivElement | undefined;
  const [isDragging, setIsDragging] = createSignal(false);
  const [lastAngle, setLastAngle] = createSignal(0);

  const isNight = () => props.value < 6 || props.value >= 18;

  const getAngleFromEvent = (clientX: number, clientY: number) => {
    if (!wheelRef) return 0;
    const rect = wheelRef.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return Math.atan2(clientY - centerY, clientX - centerX);
  };

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setLastAngle(getAngleFromEvent(clientX, clientY));
    document.body.classList.add("time-wheel-dragging");
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging()) return;

    const currentAngle = getAngleFromEvent(clientX, clientY);
    let delta = currentAngle - lastAngle();

    if (delta > Math.PI) delta -= 2 * Math.PI;
    if (delta < -Math.PI) delta += 2 * Math.PI;

    const hoursDelta = (delta / (2 * Math.PI)) * 24;
    let newTime = props.value + hoursDelta;

    if (newTime < 0) newTime += 24;
    if (newTime >= 24) newTime -= 24;

    props.onChange(newTime);
    setLastAngle(currentAngle);
  };

  const handleEnd = () => {
    setIsDragging(false);
    document.body.classList.remove("time-wheel-dragging");
  };

  const handleMouseDown = (e: MouseEvent) => handleStart(e.clientX, e.clientY);
  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  createEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", handleEnd);

    onCleanup(() => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", handleEnd);
    });
  });

  const rotation = () => (props.value / 24) * 360 - 90;

  return (
    <div
      ref={wheelRef}
      class="time-wheel"
      classList={{ dragging: isDragging() }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div class="wheel-track" />
      <div
        class="wheel-indicator"
        style={{ transform: `rotate(${rotation()}deg)` }}
      >
        <div class="indicator-orb" classList={{ night: isNight() }} />
      </div>
    </div>
  );
}
