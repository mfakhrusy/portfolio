import {
  createContext,
  useContext,
  createSignal,
  createEffect,
  onCleanup,
  type ParentProps,
  onMount,
  createMemo,
} from "solid-js";

type DayNightState = {
  timeOfDay: number; // 0-24
  isDay: boolean; // 6am - 6pm
  lightIntensity: number; // 0-1 (for grass shader)
  skyStyle: Record<string, string>; // CSS variables for sky gradient & sun
};

type DayNightContextValue = {
  state: () => DayNightState;
  isDebug: () => boolean;
  setTimeOfDay: (time: number) => void;
};

const DayNightContext = createContext<DayNightContextValue>();

// Helper to interpolate colors
const interpolateColor = (
  color1: number[],
  color2: number[],
  factor: number,
) => {
  const result = color1.slice();
  for (let i = 0; i < 3; i++) {
    result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
  }
  return `rgb(${result[0]}, ${result[1]}, ${result[2]})`;
};

// Helper to parse hex to rgb array
const hexToRgb = (hex: string) => {
  const bigint = parseInt(hex.replace("#", ""), 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
};

const PALETTE = {
  // Noon
  NOON_TOP: hexToRgb("#4a90d9"),
  NOON_BOTTOM: hexToRgb("#d4eef9"),
  // Dawn/Dusk
  DAWN_TOP: hexToRgb("#2c3e50"),
  DAWN_BOTTOM: hexToRgb("#fd746c"),
  // Night
  NIGHT_TOP: hexToRgb("#0f2027"),
  NIGHT_BOTTOM: hexToRgb("#203a43"),
  // Sun
  SUN_DAY: hexToRgb("#ffeb3b"),
  SUN_DAWN: hexToRgb("#ff7e5f"),
  MOON: hexToRgb("#fdfbfb"),
  // Ground
  GROUND_DAY_1: hexToRgb("#4a7c3f"),
  GROUND_DAY_2: hexToRgb("#3d6b34"),
  GROUND_DAY_3: hexToRgb("#2d5a28"),
  GROUND_NIGHT_1: hexToRgb("#0e1a0c"),
  GROUND_NIGHT_2: hexToRgb("#0c150a"),
  GROUND_NIGHT_3: hexToRgb("#050a04"),
};

export function DayNightProvider(props: ParentProps) {
  const [timeOfDay, setTimeOfDay] = createSignal(new Date().getHours());
  const [isDebug, setIsDebug] = createSignal(false);

  // Check for debug mode on mount
  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("debug") === "true") {
      setIsDebug(true);
    }
  });

  // Timer loop for real time (if not debug)
  createEffect(() => {
    if (isDebug()) return;

    const updateTime = () => {
      const now = new Date();
      setTimeOfDay(now.getHours() + now.getMinutes() / 60);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    onCleanup(() => clearInterval(interval));
  });

  // Computed state
  const state = createMemo(() => {
    const t = timeOfDay();
    let isDay = t >= 6 && t < 18;
    let lightIntensity = 1;
    let topColor: string, bottomColor: string;
    let ground1: string, ground2: string, ground3: string;

    // --- COLORS ---
    if (t >= 5 && t < 7) {
      // DAWN (5-7)
      const p = (t - 5) / 2;
      topColor = interpolateColor(PALETTE.NIGHT_TOP, PALETTE.DAWN_TOP, p);
      bottomColor = interpolateColor(
        PALETTE.NIGHT_BOTTOM,
        PALETTE.DAWN_BOTTOM,
        p,
      );
      ground1 = interpolateColor(
        PALETTE.GROUND_NIGHT_1,
        PALETTE.GROUND_DAY_1,
        p,
      );
      ground2 = interpolateColor(
        PALETTE.GROUND_NIGHT_2,
        PALETTE.GROUND_DAY_2,
        p,
      );
      ground3 = interpolateColor(
        PALETTE.GROUND_NIGHT_3,
        PALETTE.GROUND_DAY_3,
        p,
      );
      lightIntensity = 0.2 + p * 0.3;
    } else if (t >= 7 && t < 17) {
      // DAY (7-17) - transition from Dawn to Noon and stay
      const p = Math.min(1, Math.max(0, (t - 7) / 2)); // 2h transition to full bright
      topColor = interpolateColor(PALETTE.DAWN_TOP, PALETTE.NOON_TOP, p);
      bottomColor = interpolateColor(
        PALETTE.DAWN_BOTTOM,
        PALETTE.NOON_BOTTOM,
        p,
      );
      ground1 = `rgb(${PALETTE.GROUND_DAY_1.join(",")})`;
      ground2 = `rgb(${PALETTE.GROUND_DAY_2.join(",")})`;
      ground3 = `rgb(${PALETTE.GROUND_DAY_3.join(",")})`;
      lightIntensity = 0.5 + p * 0.5;
    } else if (t >= 17 && t < 19) {
      // DUSK (17-19)
      const p = (t - 17) / 2;
      topColor = interpolateColor(PALETTE.NOON_TOP, PALETTE.DAWN_TOP, p);
      bottomColor = interpolateColor(
        PALETTE.NOON_BOTTOM,
        PALETTE.DAWN_BOTTOM,
        p,
      );
      ground1 = interpolateColor(
        PALETTE.GROUND_DAY_1,
        PALETTE.GROUND_NIGHT_1,
        p,
      );
      ground2 = interpolateColor(
        PALETTE.GROUND_DAY_2,
        PALETTE.GROUND_NIGHT_2,
        p,
      );
      ground3 = interpolateColor(
        PALETTE.GROUND_DAY_3,
        PALETTE.GROUND_NIGHT_3,
        p,
      );
      lightIntensity = 1.0 - p * 0.8;
    } else {
      // NIGHT
      topColor = `rgb(${PALETTE.NIGHT_TOP.join(",")})`;
      bottomColor = `rgb(${PALETTE.NIGHT_BOTTOM.join(",")})`;
      ground1 = `rgb(${PALETTE.GROUND_NIGHT_1.join(",")})`;
      ground2 = `rgb(${PALETTE.GROUND_NIGHT_2.join(",")})`;
      ground3 = `rgb(${PALETTE.GROUND_NIGHT_3.join(",")})`;
      lightIntensity = 0.2;
    }

    const skyStyle = {
      "--sky-top": topColor as string,
      "--sky-bottom": bottomColor as string,
      "--ground-1": ground1 as string,
      "--ground-2": ground2 as string,
      "--ground-3": ground3 as string,
      "--scene-opacity": `${lightIntensity}`,
    };

    return {
      timeOfDay: t,
      isDay,
      lightIntensity,
      skyStyle,
    };
  });

  return (
    <DayNightContext.Provider value={{ state, isDebug, setTimeOfDay }}>
      {props.children}
    </DayNightContext.Provider>
  );
}

export function useDayNight() {
  const context = useContext(DayNightContext);
  if (!context) {
    throw new Error("useDayNight must be used within a DayNightProvider");
  }
  return context;
}
