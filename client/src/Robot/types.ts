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
  goToHorizon: () => void;
  goToHorizonCinematic: () => Promise<void>;
  showWebpage: () => void;
  hideWebpage: () => void;
  isWebpageVisible: () => boolean;
  showHelp: () => void;
  hideHelp: () => void;
  isHelpVisible: () => boolean;
  showCanvas: () => Promise<void>;
  hideCanvas: () => void;
  isCanvasVisible: () => boolean;
  showShaderBackWall: () => void;
  showShaderAllWalls: () => void;
  hideShader: () => void;
  getShaderMode: () => "none" | "back" | "all";
};

// Union type for all scene actions
export type SceneActions = OfficeActions | LabActions;

// Pending confirmation for multi-step commands
export type PendingConfirmation = {
  prompt: string;
  onConfirm: () => Promise<string>;
  onDeny: () => string;
};

// Command result from parsing
export type CommandResult = {
  handled: boolean;
  response: string;
  followUp?: () => Promise<string>;
  confirmation?: PendingConfirmation;
};

// Check if text is a confirmation or denial
export function isConfirmation(text: string): boolean {
  const lower = text.toLowerCase().trim();
  // Match words with repeated letters (e.g., "yessss", "yeahhh", "suuure")
  const confirmPatterns = [
    /^y+e*s+/, // yes, yess, yesss, yees
    /^y+e+a+h*/, // yeah, yeaah, yeahh
    /^y+e+p+/, // yep, yepp
    /^y+u+p+/, // yup, yupp
    /^y+\b/, // y, yy (word boundary)
    /^s+u+r+e+/, // sure, suure, suuree
    /^o+k+a*y*/, // ok, okay, okk, okkk
    /^do it/, // do it
    /^confirm/, // confirm
    /^proceed/, // proceed
    /^go ahead/, // go ahead
    /^absolutely/, // absolutely
    /^definitely/, // definitely
    /^affirmative/, // affirmative
    /^let'?s go/, // let's go, lets go
    /^a+y+e*/, // aye, ayy, ayyye
  ];
  return confirmPatterns.some((pattern) => pattern.test(lower));
}

export function isDenial(text: string): boolean {
  const lower = text.toLowerCase().trim();
  // Match words with repeated letters
  const denyPatterns = [
    /^n+o+/, // no, noo, nooo, nno
    /^n+a+h+/, // nah, nahh, naah
    /^n+o+p+e*/, // nope, noppe
    /^cancel/, // cancel
    /^never/, // never, nevermind
    /^stop/, // stop
    /^don'?t/, // don't, dont
    /^abort/, // abort
    /^negative/, // negative
  ];
  return denyPatterns.some((pattern) => pattern.test(lower));
}

// Command parser function type
export type CommandParser<T extends SceneActions> = (
  text: string,
  actions: T,
) => CommandResult;
