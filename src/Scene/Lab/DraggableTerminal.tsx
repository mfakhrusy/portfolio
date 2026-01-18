import {
  createSignal,
  onMount,
  onCleanup,
  Show,
  type JSX,
  type Accessor,
} from "solid-js";
import "./LabTerminal.css";

type Position = { x: number; y: number };
type Size = { width: number; height: number };

export type DraggableTerminalProps = {
  title: string;
  children: JSX.Element;
  initialPosition?: Position;
  initialSize?: Size;
  minSize?: Size;
  isMinimized?: Accessor<boolean>;
  onMinimize?: () => void;
  onExpand?: () => void;
  fabIcon?: string;
  fabClass?: string;
  terminalClass?: string;
  showMinimizeButton?: boolean;
  resizable?: boolean;
};

export function DraggableTerminal(props: DraggableTerminalProps) {
  const minWidth = props.minSize?.width ?? 300;
  const minHeight = props.minSize?.height ?? 150;

  const [position, setPosition] = createSignal<Position>(
    props.initialPosition ?? { x: 0, y: 0 },
  );
  const [size, setSize] = createSignal<Size>(
    props.initialSize ?? { width: 400, height: 300 },
  );
  const [isDragging, setIsDragging] = createSignal(false);
  const [isResizing, setIsResizing] = createSignal(false);
  const [dragOffset, setDragOffset] = createSignal<Position>({ x: 0, y: 0 });
  const [resizeEdge, setResizeEdge] = createSignal<string | null>(null);
  const [initialRect, setInitialRect] = createSignal({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [initialMouse, setInitialMouse] = createSignal<Position>({
    x: 0,
    y: 0,
  });
  const [initialized, setInitialized] = createSignal(false);

  onMount(() => {
    if (!props.initialPosition) {
      const width = props.initialSize?.width ?? 400;
      const height = props.initialSize?.height ?? 300;
      setPosition({
        x: (window.innerWidth - width) / 2,
        y: window.innerHeight - height - 30,
      });
    }
    setInitialized(true);
  });

  const handleDragStart = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest(".lab-terminal-minimize")) return;
    e.preventDefault();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position().x,
      y: e.clientY - position().y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging()) {
      const newX = Math.max(
        0,
        Math.min(e.clientX - dragOffset().x, window.innerWidth - size().width),
      );
      const newY = Math.max(
        0,
        Math.min(
          e.clientY - dragOffset().y,
          window.innerHeight - size().height,
        ),
      );
      setPosition({ x: newX, y: newY });
    }

    if (isResizing()) {
      const edge = resizeEdge();
      const init = initialRect();
      const mouse = initialMouse();
      const dx = e.clientX - mouse.x;
      const dy = e.clientY - mouse.y;

      let newX = init.x;
      let newY = init.y;
      let newWidth = init.width;
      let newHeight = init.height;

      if (edge?.includes("e")) {
        newWidth = Math.max(minWidth, init.width + dx);
      }
      if (edge?.includes("w")) {
        const potentialWidth = init.width - dx;
        if (potentialWidth >= minWidth) {
          newWidth = potentialWidth;
          newX = init.x + dx;
        }
      }
      if (edge?.includes("s")) {
        newHeight = Math.max(minHeight, init.height + dy);
      }
      if (edge?.includes("n")) {
        const potentialHeight = init.height - dy;
        if (potentialHeight >= minHeight) {
          newHeight = potentialHeight;
          newY = init.y + dy;
        }
      }

      newX = Math.max(0, Math.min(newX, window.innerWidth - minWidth));
      newY = Math.max(0, Math.min(newY, window.innerHeight - minHeight));
      newWidth = Math.min(newWidth, window.innerWidth - newX);
      newHeight = Math.min(newHeight, window.innerHeight - newY);

      setPosition({ x: newX, y: newY });
      setSize({ width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeEdge(null);
  };

  const handleResizeStart = (edge: string) => (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeEdge(edge);
    setInitialRect({
      x: position().x,
      y: position().y,
      width: size().width,
      height: size().height,
    });
    setInitialMouse({ x: e.clientX, y: e.clientY });
  };

  onMount(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  });

  onCleanup(() => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  });

  const isMinimized = () => props.isMinimized?.() ?? false;
  const showMinimize = props.showMinimizeButton ?? true;
  const resizable = props.resizable ?? true;

  return (
    <>
      <Show when={!isMinimized() && initialized()}>
        <div
          class={`lab-terminal ${props.terminalClass ?? ""}`}
          classList={{
            "lab-terminal-dragging": isDragging(),
            "lab-terminal-resizing": isResizing(),
          }}
          style={{
            left: `${position().x}px`,
            top: `${position().y}px`,
            width: `${size().width}px`,
            height: `${size().height}px`,
          }}
        >
          {/* Resize handles */}
          <Show when={resizable}>
            <div
              class="lab-terminal-resize lab-terminal-resize-n"
              onMouseDown={handleResizeStart("n")}
            />
            <div
              class="lab-terminal-resize lab-terminal-resize-s"
              onMouseDown={handleResizeStart("s")}
            />
            <div
              class="lab-terminal-resize lab-terminal-resize-e"
              onMouseDown={handleResizeStart("e")}
            />
            <div
              class="lab-terminal-resize lab-terminal-resize-w"
              onMouseDown={handleResizeStart("w")}
            />
            <div
              class="lab-terminal-resize lab-terminal-resize-ne"
              onMouseDown={handleResizeStart("ne")}
            />
            <div
              class="lab-terminal-resize lab-terminal-resize-nw"
              onMouseDown={handleResizeStart("nw")}
            />
            <div
              class="lab-terminal-resize lab-terminal-resize-se"
              onMouseDown={handleResizeStart("se")}
            />
            <div
              class="lab-terminal-resize lab-terminal-resize-sw"
              onMouseDown={handleResizeStart("sw")}
            />
          </Show>

          {/* Header - draggable */}
          <div class="lab-terminal-header" onMouseDown={handleDragStart}>
            <span class="lab-terminal-title">{props.title}</span>
            <Show when={showMinimize && props.onMinimize}>
              <button
                class="lab-terminal-minimize"
                onClick={() => props.onMinimize?.()}
                title="Minimize"
              >
                <span class="lab-terminal-minimize-icon" />
              </button>
            </Show>
          </div>

          {props.children}
        </div>
      </Show>

      <Show when={isMinimized() && props.onExpand}>
        <button
          class={`lab-terminal-fab ${props.fabClass ?? ""}`}
          onClick={() => props.onExpand?.()}
          title={`Open ${props.title}`}
        >
          <span class="lab-terminal-fab-icon">{props.fabIcon ?? ">_"}</span>
        </button>
      </Show>
    </>
  );
}
