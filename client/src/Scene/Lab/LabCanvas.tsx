import { onMount, onCleanup, createSignal, createEffect } from "solid-js";
import "./LabCanvas.css";
import { useLab } from "./LabContext";
import { useTerminalInteraction } from "./TerminalInteractionContext";

type LabCanvasProps = {
  backWallRef: HTMLDivElement | undefined;
};

export function LabCanvas(props: LabCanvasProps) {
  const { brushColor, clearCanvasTrigger } = useLab();
  const { isInteracting } = useTerminalInteraction();
  let canvasRef: HTMLCanvasElement | undefined;
  let ctx: CanvasRenderingContext2D | null = null;
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  const [isAbleToDraw, setIsAbleToDraw] = createSignal(false);

  const clearCanvas = () => {
    if (ctx && canvasRef) {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);
    }
  };

  /**
   * Clear canvas via context trigger pattern.
   *
   * clearCanvas() depends on `ctx` and `canvasRef` which are local to this component,
   * but the clear button lives in CanvasControls/MobileCanvasControls (sibling components).
   * Since we can't pass refs directly between siblings, we use a numeric signal in context
   * as a simple event trigger - incrementing it signals "clear now" to this effect.
   */
  createEffect(() => {
    const trigger = clearCanvasTrigger();
    if (trigger > 0) {
      clearCanvas();
    }
  });

  /**
   *
   * This function checks e.target.closest(".draggable-terminal") to detect if the mouse is actually over a terminal element:
   * 1. Clicking on a terminal won't start drawing (even if terminal is over canvas)
   * 2. Hovering over a terminal won't show the brush cursor
   * 3. Drawing continues only when the mouse isn't over a terminal
   * This works regardless of the translateZ mapping since we're checking the actual DOM element the mouse is over via the event target.
   *
   * @returns true if the pointer is over a terminal element, false otherwise
   */
  const isPointerOnTopOfTerminal = (target: EventTarget | null) => {
    if (!target) return false;
    const el = target as HTMLElement;
    return (
      !!el.closest(".draggable-terminal") ||
      !!el.closest(".mobile-canvas-controls")
    );
  };

  const isPointInsideCanvasArea = (clientX: number, clientY: number) => {
    if (!props.backWallRef) return false;
    const wallRect = props.backWallRef.getBoundingClientRect();
    return (
      clientX >= wallRect.left &&
      clientX <= wallRect.right &&
      clientY >= wallRect.top &&
      clientY <= wallRect.bottom
    );
  };

  const getCanvasCoords = (clientX: number, clientY: number) => {
    if (!props.backWallRef || !canvasRef) return null;

    const wallRect = props.backWallRef.getBoundingClientRect();

    // Check if pointer is within the back wall's visual bounds
    if (
      clientX < wallRect.left ||
      clientX > wallRect.right ||
      clientY < wallRect.top ||
      clientY > wallRect.bottom
    ) {
      return null;
    }

    // Map screen coordinates to canvas coordinates
    const relativeX = (clientX - wallRect.left) / wallRect.width;
    const relativeY = (clientY - wallRect.top) / wallRect.height;

    return {
      x: relativeX * canvasRef.width,
      y: relativeY * canvasRef.height,
    };
  };

  // Shared drawing logic
  const startDrawing = (
    clientX: number,
    clientY: number,
    target: EventTarget | null,
  ) => {
    if (isInteracting() || isPointerOnTopOfTerminal(target)) return;
    const coords = getCanvasCoords(clientX, clientY);
    if (coords) {
      isDrawing = true;
      lastX = coords.x;
      lastY = coords.y;
    }
  };

  const draw = (
    clientX: number,
    clientY: number,
    target: EventTarget | null,
  ) => {
    const blockedByTerminal = isPointerOnTopOfTerminal(target);
    setIsAbleToDraw(
      isPointInsideCanvasArea(clientX, clientY) &&
        !isInteracting() &&
        !blockedByTerminal,
    );

    if (isInteracting() || blockedByTerminal || !isDrawing || !ctx) return;

    const coords = getCanvasCoords(clientX, clientY);
    if (coords) {
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(coords.x, coords.y);
      ctx.strokeStyle = brushColor();
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      lastX = coords.x;
      lastY = coords.y;
    }
  };

  const stopDrawing = () => {
    isDrawing = false;
  };

  // Mouse event handlers
  const handleMouseDown = (e: MouseEvent) => {
    startDrawing(e.clientX, e.clientY, e.target);
  };

  const handleMouseMove = (e: MouseEvent) => {
    draw(e.clientX, e.clientY, e.target);
  };

  const handleMouseUp = () => {
    stopDrawing();
  };

  // Touch event handlers
  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (isPointerOnTopOfTerminal(target)) return;

    // Prevent scrolling when drawing on canvas
    if (isPointInsideCanvasArea(touch.clientX, touch.clientY)) {
      e.preventDefault();
    }
    startDrawing(touch.clientX, touch.clientY, target);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);

    // Prevent scrolling when drawing
    if (isDrawing) {
      e.preventDefault();
    }
    draw(touch.clientX, touch.clientY, target);
  };

  const handleTouchEnd = () => {
    stopDrawing();
  };

  onMount(() => {
    if (canvasRef) {
      ctx = canvasRef.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);
      }
    }

    // Mouse events
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseUp);

    // Touch events (passive: false to allow preventDefault)
    document.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
    document.addEventListener("touchcancel", handleTouchEnd);
  });

  onCleanup(() => {
    document.removeEventListener("mousedown", handleMouseDown);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    document.removeEventListener("mouseleave", handleMouseUp);

    document.removeEventListener("touchstart", handleTouchStart);
    document.removeEventListener("touchmove", handleTouchMove);
    document.removeEventListener("touchend", handleTouchEnd);
    document.removeEventListener("touchcancel", handleTouchEnd);
  });

  return (
    <>
      {isAbleToDraw() && (
        <style>{`body { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%23333' d='M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34a.996.996 0 0 0-1.41 0L9 12.25 11.75 15l8.96-8.96a.996.996 0 0 0 0-1.41z'/%3E%3C/svg%3E") 0 24, crosshair !important; }`}</style>
      )}
      <canvas ref={canvasRef} class="lab-canvas" width={800} height={600} />
    </>
  );
}
