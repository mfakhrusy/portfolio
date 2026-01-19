import { createContext, useContext, createSignal, type JSX } from "solid-js";

type TerminalInteractionContextValue = {
  isInteracting: () => boolean;
  setInteracting: (value: boolean) => void;
};

const TerminalInteractionContext =
  createContext<TerminalInteractionContextValue>();

export function TerminalInteractionProvider(props: { children: JSX.Element }) {
  const [isInteracting, setInteracting] = createSignal(false);

  return (
    <TerminalInteractionContext.Provider
      value={{ isInteracting, setInteracting }}
    >
      {props.children}
    </TerminalInteractionContext.Provider>
  );
}

export function useTerminalInteraction() {
  const context = useContext(TerminalInteractionContext);
  if (!context) {
    throw new Error(
      "useTerminalInteraction must be used within TerminalInteractionProvider",
    );
  }
  return context;
}
