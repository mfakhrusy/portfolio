import {
  createSignal,
  onMount,
  onCleanup,
  For,
  createEffect,
  Show,
} from "solid-js";
import { parseLabCommand } from "../../Robot/commands/labCommands";
import type { LabActions } from "../../Robot/types";
import { useRobot } from "../../Robot/RobotContext";
import "./LabTerminal.css";

type TerminalLine = {
  type: "robot" | "user" | "system";
  text: string;
};

type LabTerminalProps = {
  labActions: LabActions;
  handleBack?: () => void;
};

export function LabTerminal(props: LabTerminalProps) {
  const { setIsTalking } = useRobot();
  const [lines, setLines] = createSignal<TerminalLine[]>([]);
  const [inputValue, setInputValue] = createSignal("");
  const [isTyping, setIsTyping] = createSignal(false);
  const [isMinimized, setIsMinimized] = createSignal(false);

  // Drag & resize state
  const [position, setPosition] = createSignal({ x: 0, y: 0 });
  const [size, setSize] = createSignal({ width: 550, height: 300 });
  const [isDragging, setIsDragging] = createSignal(false);
  const [isResizing, setIsResizing] = createSignal(false);
  const [dragOffset, setDragOffset] = createSignal({ x: 0, y: 0 });
  const [resizeEdge, setResizeEdge] = createSignal<string | null>(null);
  const [initialRect, setInitialRect] = createSignal({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [initialMouse, setInitialMouse] = createSignal({ x: 0, y: 0 });

  let messagesEndRef: HTMLDivElement | undefined;
  let inputRef: HTMLInputElement | undefined;
  let terminalRef: HTMLDivElement | undefined;

  const scrollToBottom = () => {
    messagesEndRef?.scrollIntoView({ behavior: "smooth" });
  };

  createEffect(() => {
    lines();
    scrollToBottom();
  });

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // Initialize position centered at bottom
  onMount(() => {
    const initialWidth = Math.min(550, window.innerWidth * 0.9);
    setSize({ width: initialWidth, height: 300 });
    setPosition({
      x: (window.innerWidth - initialWidth) / 2,
      y: window.innerHeight - 330,
    });
  });

  // Drag handlers
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

      const minWidth = 300;
      const minHeight = 150;

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

      // Clamp to viewport
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

  // Global mouse event listeners
  onMount(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  });

  onCleanup(() => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  });

  const typeRobotMessage = async (text: string) => {
    setIsTyping(true);
    setIsTalking(true);

    // Add empty line that will be filled
    setLines((prev) => [...prev, { type: "robot", text: "" }]);

    for (let i = 0; i < text.length; i++) {
      setLines((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last.type === "robot") {
          // Create a new object instead of mutating
          updated[updated.length - 1] = { ...last, text: text.slice(0, i + 1) };
        }
        return updated;
      });
      await delay(30);
    }

    setIsTalking(false);
    setIsTyping(false);
  };

  const addSystemLine = (text: string) => {
    setLines((prev) => [...prev, { type: "system", text }]);
  };

  // Welcome sequence
  onMount(async () => {
    await delay(2500);
    addSystemLine("----- TERMINAL INITIALIZED -----");
    await delay(300);
    await typeRobotMessage("Welcome to the lab!");
    await delay(800);
    await typeRobotMessage("This is where Fahru experiment with new ideas.");
    await delay(500);
    await typeRobotMessage("Try: 'paint it green' or 'make it red'");
    inputRef?.focus();
  });

  const handleSubmit = async () => {
    const text = inputValue().trim();
    if (!text || isTyping()) return;

    // Add user input
    setLines((prev) => [...prev, { type: "user", text }]);
    setInputValue("");

    await delay(300);

    // Parse command
    const result = parseLabCommand(text, props.labActions);

    if (result.handled) {
      await typeRobotMessage(result.response);

      // Handle follow-up message if present
      if (result.followUp) {
        const followUpResponse = await result.followUp();
        await delay(300);
        await typeRobotMessage(followUpResponse);
      }
    } else {
      await typeRobotMessage("Command not recognized. Try 'paint it [color]'.");
    }

    inputRef?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      <Show when={!isMinimized()}>
        <div
          ref={terminalRef}
          class="lab-terminal"
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

          {/* Header - draggable */}
          <div class="lab-terminal-header" onMouseDown={handleDragStart}>
            <span class="lab-terminal-title">FLO TERMINAL v0.0</span>
            <button
              class="lab-terminal-minimize"
              onClick={() => setIsMinimized(true)}
              title="Minimize"
            >
              <span class="lab-terminal-minimize-icon" />
            </button>
          </div>

          {/* Terminal output */}
          <div class="lab-terminal-output">
            <For each={lines()}>
              {(line) => (
                <div
                  class="lab-terminal-line"
                  classList={{
                    "lab-terminal-line-robot": line.type === "robot",
                    "lab-terminal-line-user": line.type === "user",
                    "lab-terminal-line-system": line.type === "system",
                  }}
                >
                  <span class="lab-terminal-prefix">
                    {line.type === "robot" && "Flo: "}
                    {line.type === "user" && "$ "}
                    {line.type === "system" && "// "}
                  </span>
                  <span class="lab-terminal-text">{line.text}</span>
                </div>
              )}
            </For>
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div class="lab-terminal-input-container">
            <span class="lab-terminal-prompt">$</span>
            <input
              ref={inputRef}
              type="text"
              class="lab-terminal-input"
              placeholder={isTyping() ? "..." : "Enter command..."}
              value={inputValue()}
              onInput={(e) => setInputValue(e.currentTarget.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping()}
            />
          </div>
        </div>
      </Show>

      <Show when={isMinimized()}>
        <button
          class="lab-terminal-fab"
          onClick={() => setIsMinimized(false)}
          title="Open Terminal"
        >
          <span class="lab-terminal-fab-icon">&gt;_</span>
        </button>
      </Show>
    </>
  );
}
