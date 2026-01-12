import { createSignal, onMount, Show } from "solid-js";

const sentences = [
  "Hello, this is Fahru.",
  " A software engineer.",
  " This is my home,",
  " enjoy.",
  " Take a look around.",
];

export function SpeechBubble() {
  const [displayedText, setDisplayedText] = createSignal("");
  const [isVisible, setIsVisible] = createSignal(false);

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const animateSentences = async () => {
    let currentText = "";

    for (const sentence of sentences) {
      for (let i = 0; i < sentence.length; i++) {
        currentText += sentence[i];
        setDisplayedText(currentText);
        await delay(50);
      }

      if (sentence !== sentences[sentences.length - 1]) {
        await delay(1500);
      }
    }
  };

  onMount(() => {
    setTimeout(() => {
      setIsVisible(true);
      animateSentences();
    }, 5000);
  });

  const bubbleWidth = 400;
  const maxCharsPerLine = 40;

  const wrapText = (text: string): string[] => {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (testLine.length <= maxCharsPerLine) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const lines = () => wrapText(displayedText());
  const lineCount = () => lines().length;

  const bubbleHeight = () => {
    if (lineCount() >= 3) return 110;
    if (lineCount() >= 2) return 90;
    return 70;
  };

  return (
    <Show when={isVisible()}>
      <svg
        width={`${bubbleWidth + 20}px`}
        height={`${bubbleHeight() + 20}px`}
        viewBox={`0 0 ${bubbleWidth + 20} ${bubbleHeight() + 20}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "absolute",
          bottom: "65%",
          left: "112px",
          overflow: "visible",
        //   transition: "height 0.1s ease-out",
        }}
      >
        <style>
          {`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .speech-bubble {
              animation: fadeIn 0.3s ease-out forwards;
            }
          `}
        </style>

        <g class="speech-bubble">
          <polygon
            points={`
              15,0
              ${bubbleWidth - 15},0
              ${bubbleWidth},15
              ${bubbleWidth},${bubbleHeight() - 15}
              ${bubbleWidth - 15},${bubbleHeight()}
              55,${bubbleHeight()}
              35,${bubbleHeight() + 15}
              25,${bubbleHeight()}
              15,${bubbleHeight()}
              0,${bubbleHeight() - 15}
              0,15
            `}
            style={{
              fill: "#ffffff",
              stroke: "#000",
              "stroke-width": "1px",
            //   transition: "all 0.1s ease-out",
            }}
          />

          <text
            x={20}
            y={lineCount() >= 3 ? 28 : lineCount() >= 2 ? 35 : 45}
            style={{
              "font-family": "Arial, sans-serif",
              "font-size": "20px",
              fill: "#000",
            }}
          >
            {lines().map((line, i) => (
              <tspan x={20} dy={i === 0 ? 0 : 28}>
                {line}
              </tspan>
            ))}
          </text>
        </g>
      </svg>
    </Show>
  );
}
