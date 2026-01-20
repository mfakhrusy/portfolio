import { Door } from "../Office/Door";
import "./HorizonDoor.css";

type HorizonDoorProps = {
  isInteractive: boolean;
  onEnter?: () => void;
};

export function HorizonDoor(props: HorizonDoorProps) {
  return (
    <div class="horizon-door-wrapper">
      <Door isInteractive={props.isInteractive} onEnter={props.onEnter} />
    </div>
  );
}
