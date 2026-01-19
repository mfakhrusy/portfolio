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
    }, 1500);
  };

  return (
    <div
      class="door-container"
      classList={{ "door-container-interactive": props.isInteractive }}
      onClick={handleClick}
    >
      {/* Cartoon arrows and signs */}
      <div class="door-signs">
        {/* Big flashy ENTER HERE sign */}
        <div class="sign-enter-here">
          <span class="sign-text">ENTER HERE!</span>
          <div class="sign-sparkle s1" />
          <div class="sign-sparkle s2" />
          <div class="sign-sparkle s3" />
        </div>

        {/* Curved arrow from top */}
        <div class="arrow-curved-top">↓</div>

        {/* Bouncing arrow left */}
        <div class="arrow-left">
          <span>→</span>
          <span class="arrow-text">THIS WAY!</span>
        </div>

        <svg class="curved-arrow" viewBox="0 0 100 80" fill="none">
          <path
            d="M10 10 Q 10 70, 80 70"
            stroke="url(#arrow-gradient)"
            stroke-width="4"
            stroke-linecap="round"
            fill="none"
          />
          <polygon points="75,60 90,72 78,80" fill="#ff00ff" />
          <defs>
            <linearGradient
              id="arrow-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stop-color="#ffea00" />
              <stop offset="100%" stop-color="#ff00ff" />
            </linearGradient>
          </defs>
        </svg>

        {/* Right side pointing arrow */}
        <div class="arrow-right">
          <span class="arrow-text">COME IN!</span>
          <span>←</span>
        </div>

        {/* Bottom wavy text */}
        <div class="sign-bottom">
          <span class="wavy-text">✨ Don't be shy! ✨</span>
        </div>

        {/* Extra sparkles */}
        <div class="sparkle sp1">✦</div>
        <div class="sparkle sp2">✧</div>
        <div class="sparkle sp3">✦</div>
        <div class="sparkle sp4">✧</div>
        <div class="sparkle sp5">★</div>
      </div>

      {/* Door frame */}
      <div class="door-frame">
        <div class="door" classList={{ "door-open": isOpen() }}>
          <div class="door-panel door-panel-top" />
          <div class="door-panel door-panel-bottom" />
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
