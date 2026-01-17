import type { CommandResult, LabActions, LabPaintColor } from "../types";

const colorNames: Record<LabPaintColor, string[]> = {
  blue: ["blue", "navy", "azure"],
  green: ["green", "emerald", "lime"],
  red: ["red", "crimson", "scarlet"],
  white: ["white", "bright", "light"],
  black: ["black", "dark", "noir"],
};

const colorResponses: Record<LabPaintColor, string> = {
  blue: "Nice choice! The lab now has a cool blue vibe.",
  green: "Going green! The lab feels fresh now.",
  red: "Bold choice! Red walls activated.",
  white: "Clean and minimal! White walls it is.",
  black: "Dark mode engaged! The lab is now black.",
};

function detectColor(text: string): LabPaintColor | null {
  const lower = text.toLowerCase();

  for (const [color, keywords] of Object.entries(colorNames)) {
    if (keywords.some((keyword) => lower.includes(keyword))) {
      return color as LabPaintColor;
    }
  }

  return null;
}

export function parseLabCommand(
  text: string,
  actions: LabActions,
): CommandResult {
  const lower = text.toLowerCase();

  // Paint/color commands
  if (
    lower.includes("paint") ||
    lower.includes("color") ||
    lower.includes("wall") ||
    lower.includes("change") ||
    lower.includes("make it")
  ) {
    const color = detectColor(text);

    if (color) {
      actions.setPaintColor(color);
      return { handled: true, response: colorResponses[color] };
    }

    // User asked about paint but didn't specify a color
    if (lower.includes("paint") || lower.includes("color")) {
      const current = actions.getPaintColor();
      return {
        handled: true,
        response: `The walls are currently ${current}. Try: "paint it green" or "make it red"!`,
      };
    }
  }

  // Direct color mentions without "paint"
  const directColor = detectColor(text);
  if (
    directColor &&
    (lower.includes("make") ||
      lower.includes("change") ||
      lower.includes("set"))
  ) {
    actions.setPaintColor(directColor);
    return { handled: true, response: colorResponses[directColor] };
  }

  if (lower.includes("go to office")) {
    actions.goToOffice();
    return { handled: true, response: "Going to the office..." };
  }

  // Rain sound command
  if (
    lower.includes("play rain") ||
    lower.includes("rain sound") ||
    lower.includes("play rain sound")
  ) {
    actions.showWebpage();
    return {
      handled: true,
      response: "Playing rain sounds... relax and enjoy.",
    };
  }

  if (lower.includes("stop rain") || lower.includes("stop sound")) {
    if (!actions.isWebpageVisible()) {
      return {
        handled: true,
        response: "What rain? It's perfectly dry in here!",
      };
    }
    actions.hideWebpage();
    return { handled: true, response: "Stopping the rain sounds." };
  }

  // Help commands
  if (
    lower === "help" ||
    lower.includes("show help") ||
    lower.includes("what command") ||
    lower.includes("available command") ||
    lower.includes("list command")
  ) {
    if (actions.isHelpVisible()) {
      return { handled: true, response: "The help terminal is already open." };
    }
    actions.showHelp();
    return { handled: true, response: "Opening help panel..." };
  }

  if (lower.includes("hide help") || lower.includes("close help")) {
    actions.hideHelp();
    return { handled: true, response: "Closing help panel." };
  }

  // Canvas commands
  if (
    lower.includes("show canvas") ||
    lower.includes("open canvas") ||
    lower.includes("draw") ||
    lower.includes("paint canvas")
  ) {
    if (actions.isCanvasVisible()) {
      return { handled: true, response: "The canvas is already on the wall!" };
    }
    actions.showCanvas();
    return { handled: true, response: "Here's a canvas for you. Draw freely!" };
  }

  if (lower.includes("hide canvas") || lower.includes("close canvas")) {
    if (!actions.isCanvasVisible()) {
      return { handled: true, response: "There's no canvas to hide." };
    }
    actions.hideCanvas();
    return { handled: true, response: "Canvas hidden." };
  }

  return { handled: false, response: "" };
}

export const labHelpCommands = [
  {
    command: "paint it [color]",
    description: "Change wall color (blue, green, red, white, black)",
  },
  { command: "play rain", description: "Play rain sounds on the back wall" },
  { command: "stop rain", description: "Stop rain sounds" },
  {
    command: "show canvas",
    description: "Open a drawing canvas on the back wall",
  },
  { command: "hide canvas", description: "Hide the drawing canvas" },
  { command: "go to office", description: "Return to the office scene" },
  { command: "help", description: "Show this help panel" },
];
