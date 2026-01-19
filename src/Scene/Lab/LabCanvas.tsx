import { onMount, onCleanup, createSignal } from "solid-js";
import "./LabCanvas.css";
import { useLab } from "./LabContext";
import { useTerminalInteraction } from "./TerminalInteractionContext";

type LabCanvasProps = {
  backWallRef: HTMLDivElement | undefined;
};

export function LabCanvas(props: LabCanvasProps) {
  const { brushColor } = useLab();
  const { isInteracting } = useTerminalInteraction();
  let canvasRef: HTMLCanvasElement | undefined;
  let ctx: CanvasRenderingContext2D | null = null;
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  const [isAbleToDraw, setIsAbleToDraw] = createSignal(false);

  /**
   *
   * This function checks e.target.closest(".draggable-terminal") to detect if the mouse is actually over a terminal element:
   * 1. Clicking on a terminal won't start drawing (even if terminal is over canvas)
   * 2. Hovering over a terminal won't show the brush cursor
   * 3. Drawing continues only when the mouse isn't over a terminal
   * This works regardless of the translateZ mapping since we're checking the actual DOM element the mouse is over via the event target.
   *
   * @returns true if the mouse is over a terminal element, false otherwise
   */
  const isMouseOnTopOfTerminal = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    return !!target.closest(".draggable-terminal");
  };

  const isMouseInsideCanvasArea = (e: MouseEvent) => {
    if (!props.backWallRef) return false;
    const wallRect = props.backWallRef.getBoundingClientRect();
    return (
      e.clientX >= wallRect.left &&
      e.clientX <= wallRect.right &&
      e.clientY >= wallRect.top &&
      e.clientY <= wallRect.bottom
    );
  };

  const getCanvasCoords = (e: MouseEvent) => {
    if (!props.backWallRef || !canvasRef) return null;

    const wallRect = props.backWallRef.getBoundingClientRect();
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    // Check if mouse is within the back wall's visual bounds
    if (
      mouseX < wallRect.left ||
      mouseX > wallRect.right ||
      mouseY < wallRect.top ||
      mouseY > wallRect.bottom
    ) {
      return null;
    }

    // Map screen coordinates to canvas coordinates
    const relativeX = (mouseX - wallRect.left) / wallRect.width;
    const relativeY = (mouseY - wallRect.top) / wallRect.height;

    return {
      x: relativeX * canvasRef.width,
      y: relativeY * canvasRef.height,
    };
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (isInteracting() || isMouseOnTopOfTerminal(e)) return;
    const coords = getCanvasCoords(e);
    if (coords) {
      isDrawing = true;
      lastX = coords.x;
      lastY = coords.y;
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    const blockedByTerminal = isMouseOnTopOfTerminal(e);
    setIsAbleToDraw(
      isMouseInsideCanvasArea(e) && !isInteracting() && !blockedByTerminal,
    );

    if (isInteracting() || blockedByTerminal || !isDrawing || !ctx) return;

    const coords = getCanvasCoords(e);
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

  const handleMouseUp = () => {
    isDrawing = false;
  };

  onMount(() => {
    if (canvasRef) {
      ctx = canvasRef.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);
      }
    }

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseUp);
  });

  onCleanup(() => {
    document.removeEventListener("mousedown", handleMouseDown);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    document.removeEventListener("mouseleave", handleMouseUp);
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
