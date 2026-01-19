import { Show } from "solid-js";
import "./RobotBase.css";

export type RobotView = "front" | "back";

export type RobotBaseProps = {
  isTalking?: boolean;
  showWave?: boolean;
  isInteractive?: boolean;
  view?: RobotView;
  class?: string;
};

export function RobotBase(props: RobotBaseProps) {
  const isFront = () => (props.view ?? "front") === "front";

  console.log(isFront());

  return (
    <svg
      class={`robot-base-svg ${props.class ?? ""}`}
      width="200px"
      height="200px"
      viewBox="-200 -200 2046 974"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Front view: body + face */}
      <Show when={isFront()}>
        <RobotBodyFront />
        <RobotEyes isInteractive={props.isInteractive} />
        <RobotMouth isTalking={props.isTalking} />
      </Show>

      {/* Back view: body only, no face */}
      <Show when={!isFront()}>
        <RobotBodyBack />
      </Show>

      <RobotHands
        showWave={props.showWave}
        view={isFront() ? "front" : "back"}
      />
    </svg>
  );
}

function RobotBodyFront() {
  return (
    <>
      <rect
        class="robot-body-outer"
        x={331.04}
        y={0}
        width={975.169}
        height={524.831}
      />
      <rect
        class="robot-body-inner"
        x={337.358}
        y={6.1}
        width={975.169}
        height={524.831}
      />
    </>
  );
}

function RobotBodyBack() {
  return (
    <>
      <rect
        class="robot-body-outer-back"
        x={331.04}
        y={0}
        width={975.169}
        height={524.831}
      />
      <rect
        class="robot-body-inner-back"
        x={337.358}
        y={6.1}
        width={975.169}
        height={524.831}
      />
    </>
  );
}

type RobotEyesProps = {
  isInteractive?: boolean;
};

function RobotEyes(props: RobotEyesProps) {
  return (
    <g>
      <Show
        when={props.isInteractive}
        fallback={
          <>
            <RobotStraightRightEye />
            <RobotStraightLeftEye />
          </>
        }
      >
        <RobotSharpRightEye />
        <RobotSharpLeftEye />
      </Show>
    </g>
  );
}

function RobotSharpRightEye() {
  return (
    <text class="robot-eye" x="392.337px" y="310.715px">
      &gt;
    </text>
  );
}

function RobotSharpLeftEye() {
  return (
    <g transform="matrix(-1,0,0,-1,9415.006527,12926.613143)">
      <text class="robot-eye" x="8169.043px" y="12885.714px">
        &gt;
      </text>
    </g>
  );
}

function RobotStraightLeftEye() {
  return (
    <rect
      x="1000"
      y="152"
      width="174.822"
      height="46.23"
      class="robot-straight-eye"
    />
  );
}

function RobotStraightRightEye() {
  return (
    <rect
      x="490"
      y="152"
      width="174.822"
      height="46.23"
      class="robot-straight-eye"
    />
  );
}

function RobotMouth(props: { isTalking?: boolean }) {
  return (
    <rect
      class="robot-mouth"
      classList={{ "robot-mouth-talking": props.isTalking }}
      x={698.198}
      y={400.496}
      width={253.49}
      height={29.42}
    />
  );
}

type RobotHandsProps = {
  showWave?: boolean;
  view?: RobotView;
};

function RobotHands(props: RobotHandsProps) {
  const handClass = () =>
    props.view === "back" ? "robot-hand-back" : "robot-hand";

  return (
    <>
      <g class="robot-right-hand-group">
        <path
          class={handClass()}
          classList={{ "robot-right-hand-waving": props.showWave }}
          d="M4.483,423.544c49.795,-26.362 55.164,-30.647 55.164,-30.647c0,0 9.194,177.75 113.392,101.134c104.198,-76.617 -19.29,-161.525 -47.953,-160.444c-28.663,1.081 52.55,-46.421 52.55,-46.421c0,0 173.153,176.218 55.164,263.561c-117.989,87.343 -254.367,-113.392 -228.317,-127.183Z"
        />
      </g>
      <path
        class={handClass()}
        d="M1508.023,296.791c26.362,49.795 30.647,55.164 30.647,55.164c0,0 -177.75,9.194 -101.134,113.392c76.617,104.198 161.525,-19.29 160.444,-47.953c-1.081,-28.663 46.421,52.55 46.421,52.55c0,0 -176.218,173.153 -263.561,55.164c-87.343,-117.989 113.392,-254.367 127.183,-228.317Z"
      />
    </>
  );
}
