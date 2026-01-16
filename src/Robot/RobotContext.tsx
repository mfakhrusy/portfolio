import {
  createContext,
  useContext,
  createSignal,
  type ParentProps,
} from "solid-js";

type RobotContextValue = {
  isTalking: () => boolean;
  setIsTalking: (value: boolean) => void;
};

const RobotContext = createContext<RobotContextValue>();

export function RobotProvider(props: ParentProps) {
  const [isTalking, setIsTalking] = createSignal(false);

  return (
    <RobotContext.Provider value={{ isTalking, setIsTalking }}>
      {props.children}
    </RobotContext.Provider>
  );
}

export function useRobot() {
  const context = useContext(RobotContext);
  if (!context) {
    throw new Error("useRobot must be used within a RobotProvider");
  }
  return context;
}
