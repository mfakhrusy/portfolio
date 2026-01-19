import { createSignal, For, createEffect } from "solid-js";
import type { SceneActions, CommandResult } from "./types";
import "./ChatPanel.css";

type ChatMessage = {
  role: "user" | "robot";
  content: string;
};

type ChatPanelProps<T extends SceneActions> = {
  onTalkingChange?: (isTalking: boolean) => void;
  actions: T;
  parseCommand: (text: string, actions: T) => CommandResult;
  welcomeMessage?: string;
};

export function ChatPanel<T extends SceneActions>(props: ChatPanelProps<T>) {
  const defaultWelcome = "Hi! Ask me anything, or try controlling the room!";

  const [messages, setMessages] = createSignal<ChatMessage[]>([
    {
      role: "robot",
      content: props.welcomeMessage ?? defaultWelcome,
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

    // Check for scene commands
    const commandResult = props.parseCommand(text, props.actions);

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
