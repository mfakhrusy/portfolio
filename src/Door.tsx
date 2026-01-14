import { createSignal } from "solid-js";
import "./Door.css";

type DoorProps = {
  isInteractive: boolean;
  onEnter?: () => void;
};

export function Door(props: DoorProps) {
  const [isOpen, setIsOpen] = createSignal(false);

  const handleClick = (e: Event) => {
    e.stopPropagation();
    if (!props.isInteractive || isOpen()) return;

    setIsOpen(true);

    // Wait 2 seconds with door open, then enter
    setTimeout(() => {
      if (props.onEnter) {
        props.onEnter();
      }
    }, 2000);
  };

  return (
    <div
      class="door-container"
      classList={{ "door-container-interactive": props.isInteractive }}
      onClick={handleClick}
    >
      {/* Door frame */}
      <div class="door-frame">
        {/* The door itself - swings open */}
        <div class="door" classList={{ "door-open": isOpen() }}>
          {/* Door panel details */}
          <div class="door-panel door-panel-top" />
          <div class="door-panel door-panel-bottom" />
          {/* Door handle */}
          <div class="door-handle" />
        </div>

        {/* Dark interior visible when door opens */}
        <div
          class="door-interior"
          classList={{ "door-interior-visible": isOpen() }}
        />
      </div>
    </div>
  );
}
