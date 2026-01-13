import { createSignal, For, createEffect } from "solid-js";
import type { RoomActions } from "./RobotPersona";
import "./ChatPanel.css";

type ChatMessage = {
  role: "user" | "robot";
  content: string;
};

type ChatPanelProps = {
  onTalkingChange?: (isTalking: boolean) => void;
  roomActions: RoomActions;
};

type CommandResult = {
  handled: boolean;
  response: string;
};

function parseCommand(text: string, roomActions: RoomActions): CommandResult {
  const lower = text.toLowerCase();

  // Lamp commands
  if (
    lower.includes("turn off") &&
    (lower.includes("light") || lower.includes("lamp"))
  ) {
    roomActions.setLampOn(false);
    return { handled: true, response: "Done! I've turned off the lamp." };
  }

  if (
    lower.includes("turn on") &&
    (lower.includes("light") || lower.includes("lamp"))
  ) {
    roomActions.setLampOn(true);
    return { handled: true, response: "There you go! The lamp is now on." };
  }

  if (
    lower.includes("toggle") &&
    (lower.includes("light") || lower.includes("lamp"))
  ) {
    roomActions.toggleLamp();
    const isOn = roomActions.isLampOn();
    return {
      handled: true,
      response: isOn ? "Lamp is now on!" : "Lamp is now off!",
    };
  }

  if (lower.includes("dark") || lower.includes("dim")) {
    roomActions.setLampOn(false);
    return { handled: true, response: "Making it dark for you..." };
  }

  if (lower.includes("bright") || lower.includes("light up")) {
    roomActions.setLampOn(true);
    return { handled: true, response: "Let there be light!" };
  }

  return { handled: false, response: "" };
}

export function ChatPanel(props: ChatPanelProps) {
  const [messages, setMessages] = createSignal<ChatMessage[]>([
    {
      role: "robot",
      content:
        "Hi! Ask me anything about Fahru, or try controlling the room - like 'turn off the light'!",
    },
  ]);
  const [inputValue, setInputValue] = createSignal("");
  const [isTyping, setIsTyping] = createSignal(false);

  let messagesEndRef: HTMLDivElement | undefined;

  const scrollToBottom = () => {
    messagesEndRef?.scrollIntoView({ behavior: "smooth" });
  };

  createEffect(() => {
    messages();
    scrollToBottom();
  });

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const typeResponse = async (text: string) => {
    setIsTyping(true);
    props.onTalkingChange?.(true);

    setMessages((prev) => [...prev, { role: "robot", content: "" }]);

    for (let i = 0; i < text.length; i++) {
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last.role === "robot") {
          last.content = text.slice(0, i + 1);
        }
        return updated;
      });
      await delay(30);
    }

    props.onTalkingChange?.(false);
    setIsTyping(false);
  };

  const handleSend = async () => {
    const text = inputValue().trim();
    if (!text || isTyping()) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInputValue("");

    await delay(300);

    // Check for room commands
    const commandResult = parseCommand(text, props.roomActions);

    if (commandResult.handled) {
      await typeResponse(commandResult.response);
    } else {
      await typeResponse(
        "Thanks for your message! LLM integration coming soon.",
      );
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div class="chat-panel" onClick={(e) => e.stopPropagation()}>
      <div class="chat-messages">
        <For each={messages()}>
          {(message) => (
            <div
              class="chat-message"
              classList={{
                "chat-message-user": message.role === "user",
                "chat-message-robot": message.role === "robot",
              }}
            >
              <span class="chat-message-content">{message.content}</span>
            </div>
          )}
        </For>
        <div ref={messagesEndRef} />
      </div>

      <div class="chat-input-container">
        <input
          type="text"
          class="chat-input"
          placeholder="Type a message..."
          value={inputValue()}
          onInput={(e) => setInputValue(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          disabled={isTyping()}
        />
        <button
          class="chat-send-button"
          onClick={handleSend}
          disabled={isTyping() || !inputValue().trim()}
        >
          →
        </button>
      </div>
    </div>
  );
}
