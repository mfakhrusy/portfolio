export function SpeechBubble() {
  const text = "Hello, this is Fahru.";
  return (
    <svg
      width="300px"
      height="100px"
      viewBox="0 0 300 100"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: "absolute",
        top: "-19px",
        left: "112px",
        overflow: "visible",
      }}
    >
      <style>
        {`
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes typing {
        from { width: 0; }
        to { width: 280px; }
      }
      .speech-bubble {
        opacity: 0;
        animation: fadeIn 0.3s ease-out forwards;
        animation-delay: 5s;
      }
      .speech-text-clip {
        animation: typing 2s steps(${text.length}, end) forwards;
        animation-delay: 5s;
      }
    `}
      </style>

      <g class="speech-bubble">
        <polygon
          points="
        15,0
        265,0
        280,15
        280,55
        265,70
        55,70
        35,85
        25,70
        15,70
        0,55
        0,15
      "
          style={{
            fill: "#ffffff",
            stroke: "#000",
            "stroke-width": "1px",
          }}
        />

        <clipPath id="textClip">
          <rect x={15} y={10} height={50} class="speech-text-clip" />
        </clipPath>

        <text
          x={20}
          y={45}
          clip-path="url(#textClip)"
          style={{
            "font-family": "Arial, sans-serif",
            "font-size": "22px",
            fill: "#000",
          }}
        >
          {text}
        </text>
      </g>
    </svg>
  );
}
