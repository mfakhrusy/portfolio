import type { CommandResult, OfficeActions } from "../types";

export function parseOfficeCommand(
  text: string,
  actions: OfficeActions,
): CommandResult {
  const lower = text.toLowerCase();

  // Lamp commands
  if (
    lower.includes("turn off") &&
    (lower.includes("light") || lower.includes("lamp"))
  ) {
    actions.setLampOn(false);
    return { handled: true, response: "Done! I've turned off the lamp." };
  }

  if (
    lower.includes("turn on") &&
    (lower.includes("light") || lower.includes("lamp"))
  ) {
    actions.setLampOn(true);
    return { handled: true, response: "There you go! The lamp is now on." };
  }

  if (
    lower.includes("toggle") &&
    (lower.includes("light") || lower.includes("lamp"))
  ) {
    actions.toggleLamp();
    const isOn = actions.isLampOn();
    return {
      handled: true,
      response: isOn ? "Lamp is now on!" : "Lamp is now off!",
    };
  }

  if (lower.includes("dark") || lower.includes("dim")) {
    actions.setLampOn(false);
    return { handled: true, response: "Making it dark for you..." };
  }

  if (lower.includes("bright") || lower.includes("light up")) {
    actions.setLampOn(true);
    return { handled: true, response: "Let there be light!" };
  }

  return { handled: false, response: "" };
}
