import { createSignal, onMount } from "solid-js";
import "./Lab3D.css";

type Lab3DProps = {
  onBack?: () => void;
};

export function Lab3D(props: Lab3DProps) {
  const [isEntering, setIsEntering] = createSignal(true);

  onMount(() => {
    // Remove entering animation after it completes
    setTimeout(() => {
      setIsEntering(false);
    }, 2000);
  });

  return (
    <div class="lab-container">
      <div class="lab-room" classList={{ "lab-room-entering": isEntering() }}>
        {/* Back wall - facing us */}
        <div class="lab-wall lab-wall-back" />

        {/* Front wall - where we entered (transparent) */}
        <div class="lab-wall lab-wall-front" />

        {/* Left wall */}
        <div class="lab-wall lab-wall-left" />

        {/* Right wall */}
        <div class="lab-wall lab-wall-right" />

        {/* Floor */}
        <div class="lab-wall lab-wall-floor" />

        {/* Ceiling */}
        <div class="lab-wall lab-wall-ceiling" />
      </div>

      {/* Back button outside the 3D space */}
      <button class="lab-back-button" onClick={props.onBack}>
        ← Exit Lab
      </button>
    </div>
  );
}
