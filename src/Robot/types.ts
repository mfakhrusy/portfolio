// Scene action types - each scene defines its own actions

export type OfficeActions = {
  toggleLamp: () => void;
  setLampOn: (on: boolean) => void;
  isLampOn: () => boolean;
};

export type LabPaintColor = "blue" | "green" | "red" | "white" | "black";

export type LabActions = {
  setPaintColor: (color: LabPaintColor) => void;
  getPaintColor: () => LabPaintColor;
  goToOffice: () => void;
  showWebpage: () => void;
  hideWebpage: () => void;
  isWebpageVisible: () => boolean;
  showHelp: () => void;
  hideHelp: () => void;
  isHelpVisible: () => boolean;
  showCanvas: () => void;
  hideCanvas: () => void;
  isCanvasVisible: () => boolean;
};

// Union type for all scene actions
export type SceneActions = OfficeActions | LabActions;

// Command result from parsing
export type CommandResult = {
  handled: boolean;
  response: string;
};

// Command parser function type
export type CommandParser<T extends SceneActions> = (
  text: string,
  actions: T,
) => CommandResult;
