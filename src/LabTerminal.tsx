import { createSignal, onMount, For, createEffect } from "solid-js";
import { parseLabCommand } from "./Robot/commands/labCommands";
import type { LabActions } from "./Robot/types";
import { useRobot } from "./Robot/RobotContext";
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

  let messagesEndRef: HTMLDivElement | undefined;
  let inputRef: HTMLInputElement | undefined;

  const scrollToBottom = () => {
    messagesEndRef?.scrollIntoView({ behavior: "smooth" });
  };

  createEffect(() => {
    lines();
    scrollToBottom();
  });

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

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
    await delay(500);
    addSystemLine("TERMINAL INITIALIZED");
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
    <div class="lab-terminal">
      {/* Header */}
      <div class="lab-terminal-header">
        <span class="lab-terminal-title">FLO TERMINAL v0.0</span>
        <div class="lab-terminal-status">
          <span class="lab-terminal-dot" />
          <span class="lab-terminal-dot" />
          <span class="lab-terminal-dot" />
        </div>
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

      {/* Scanline effect */}
      <div class="lab-terminal-scanline" />
    </div>
  );
}
