import { createContext, useContext, createSignal, type JSX } from "solid-js";

type TerminalZIndexContextValue = {
  getZIndex: (id: string) => number;
  bringToFront: (id: string) => void;
  register: (id: string) => void;
  unregister: (id: string) => void;
};

const BASE_Z_INDEX = 1000;

const TerminalZIndexContext = createContext<TerminalZIndexContextValue>();

export function TerminalZIndexProvider(props: { children: JSX.Element }) {
  const [zIndexMap, setZIndexMap] = createSignal<Map<string, number>>(
    new Map(),
  );
  const [maxZIndex, setMaxZIndex] = createSignal(BASE_Z_INDEX);

  const register = (id: string) => {
    setZIndexMap((prev) => {
      const next = new Map(prev);
      if (!next.has(id)) {
        const newZ = maxZIndex() + 1;
        setMaxZIndex(newZ);
        next.set(id, newZ);
      }
      return next;
    });
  };

  const unregister = (id: string) => {
    setZIndexMap((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  };

  const getZIndex = (id: string): number => {
    return zIndexMap().get(id) ?? BASE_Z_INDEX;
  };

  const bringToFront = (id: string) => {
    const currentZ = zIndexMap().get(id);
    const currentMax = maxZIndex();

    if (currentZ !== currentMax) {
      const newZ = currentMax + 1;
      setMaxZIndex(newZ);
      setZIndexMap((prev) => {
        const next = new Map(prev);
        next.set(id, newZ);
        return next;
      });
    }
  };

  return (
    <TerminalZIndexContext.Provider
      value={{ getZIndex, bringToFront, register, unregister }}
    >
      {props.children}
    </TerminalZIndexContext.Provider>
  );
}

export function useTerminalZIndex() {
  const context = useContext(TerminalZIndexContext);
  if (!context) {
    throw new Error(
      "useTerminalZIndex must be used within TerminalZIndexProvider",
    );
  }
  return context;
}
