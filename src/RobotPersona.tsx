export function RobotPersona() {
  return (
    <svg
      width="200px"
      height="200px"
      viewBox="-200 -200 2046 974"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      // @ts-ignore
      xml:space="preserve"
      style={{
        "fill-rule": "evenodd",
        "clip-rule": "evenodd",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-miterlimit": 1.5,
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <rect
        x={331.04}
        y={0}
        width={975.169}
        height={524.831}
        style={{ fill: "#c3c3c3" }}
      />

      <rect
        x={337.358}
        y={6.1}
        width={975.169}
        height={524.831}
        style={{ fill: "#ebebeb" }}
      />

      <g transform="matrix(382.409469,0,0,382.409469,615.658175,310.71451)" />

      <RobotPersonaRightEye />
      <RobotPersonaLeftEye />
      <RobotPersonaMouth />
      <RobotPersonaRightHand />
      <RobotPersonaLeftHand />
    </svg>
  );
}

function RobotPersonaRightEye() {
  return (
    <text
      x="392.337px"
      y="310.715px"
      style={{
        "font-family": "Arial, sans-serif",
        "font-size": "382.409px",
      }}
    >
      &gt;
    </text>
  );
}

function RobotPersonaLeftEye() {
  return (
    <g transform="matrix(-1,0,0,-1,9415.006527,12926.613143)">
      <g transform="matrix(382.409469,0,0,382.409469,8392.363856,12885.713908)" />
      <text
        x="8169.043px"
        y="12885.714px"
        style={{
          "font-family": "Arial, sans-serif",
          "font-size": "382.409px",
        }}
      >
        &gt;
      </text>
    </g>
  );
}

function RobotPersonaMouth() {
  return (
    <rect
      x={698.198}
      y={400.496}
      width={253.49}
      height={29.42}
      style={{
        fill: "#606060",
        stroke: "#000",
        "stroke-width": "2.5px",
      }}
    />
  );
}

function RobotPersonaRightHand() {
  return (
    <g style={{ "transform-origin": "180px 550px" }}>
      <style>
        {`
            @keyframes wave {
              0%, 100% { transform: rotate(0deg); }
              25% { transform: rotate(-15deg); }
              75% { transform: rotate(15deg); }
            }
            .waving-hand {
              animation: wave 0.5s ease-in-out infinite;
              animation-delay: 5s;
            }
          `}
      </style>
      <path
        class="waving-hand"
        d="M4.483,423.544c49.795,-26.362 55.164,-30.647 55.164,-30.647c0,0 9.194,177.75 113.392,101.134c104.198,-76.617 -19.29,-161.525 -47.953,-160.444c-28.663,1.081 52.55,-46.421 52.55,-46.421c0,0 173.153,176.218 55.164,263.561c-117.989,87.343 -254.367,-113.392 -228.317,-127.183Z"
        style={{
          fill: "#e7e7e7",
          stroke: "#000",
          "stroke-width": "2.5px",
          "transform-origin": "180px 550px",
        }}
      />
    </g>
  );
}

function RobotPersonaLeftHand() {
  return (
    <path
      d="M1508.023,296.791c26.362,49.795 30.647,55.164 30.647,55.164c0,0 -177.75,9.194 -101.134,113.392c76.617,104.198 161.525,-19.29 160.444,-47.953c-1.081,-28.663 46.421,52.55 46.421,52.55c0,0 -176.218,173.153 -263.561,55.164c-87.343,-117.989 113.392,-254.367 127.183,-228.317Z"
      style={{
        fill: "#e7e7e7",
        stroke: "#000",
        "stroke-width": "2.5px",
      }}
    />
  );
}
