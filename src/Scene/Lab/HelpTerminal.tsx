import { createSignal, createEffect, For } from "solid-js";
import { labHelpCommands } from "../../Robot/commands/labCommands";
import { DraggableTerminal } from "./DraggableTerminal";
import { useLab } from "./LabContext";
import "./LabTerminal.css";
import "./HelpTerminal.css";

export function HelpTerminal() {
  const { helpExpanded, setHelpExpanded } = useLab();
  const [isMinimized, setIsMinimized] = createSignal(true);

  createEffect(() => {
    if (helpExpanded()) {
      setIsMinimized(false);
    }
  });

  const handleMinimize = () => {
    setIsMinimized(true);
    setHelpExpanded(false);
  };

  const handleExpand = () => {
    setIsMinimized(false);
    setHelpExpanded(true);
  };

  return (
    <DraggableTerminal
      title="HELP"
      initialPosition={{ x: window.innerWidth - 430, y: 30 }}
      initialSize={{ width: 400, height: 350 }}
      minSize={{ width: 250, height: 150 }}
      isMinimized={() => isMinimized()}
      onMinimize={handleMinimize}
      onExpand={handleExpand}
      fabIcon="?"
      fabClass="help-terminal-fab"
      terminalClass="help-terminal"
    >
      {/* Help content */}
      <div class="lab-terminal-output">
        <div class="lab-terminal-line lab-terminal-line-system">
          <span class="lab-terminal-text">Available Commands:</span>
        </div>
        <For each={labHelpCommands}>
          {(item) => (
            <div class="help-command-item">
              <span class="help-command-name">{item.command}</span>
              <span class="help-command-desc">{item.description}</span>
            </div>
          )}
        </For>
      </div>
    </DraggableTerminal>
  );
}
