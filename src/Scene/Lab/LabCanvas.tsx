import { onMount, onCleanup } from "solid-js";
import "./LabCanvas.css";

type LabCanvasProps = {
  backWallRef: HTMLDivElement | undefined;
  brushColor: string;
};

export function LabCanvas(props: LabCanvasProps) {
  let canvasRef: HTMLCanvasElement | undefined;
  let ctx: CanvasRenderingContext2D | null = null;
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

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
    const coords = getCanvasCoords(e);
    if (coords) {
      isDrawing = true;
      lastX = coords.x;
      lastY = coords.y;
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDrawing || !ctx) return;

    const coords = getCanvasCoords(e);
    if (coords) {
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(coords.x, coords.y);
      ctx.strokeStyle = props.brushColor;
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

  return <canvas ref={canvasRef} class="lab-canvas" width={800} height={600} />;
}
