import { createSignal, onMount, Show } from "solid-js";
import "./SpeechBubble.css";

const sentences = [
  "Hello, this is Fahru.",
  " A software engineer.",
  " This is my home,",
  " enjoy.",
  " Take a look around.",
];

type SpeechBubbleProps = {
  onTalkingChange?: (isTalking: boolean) => void;
  onWelcomeStart?: () => void;
  onWelcomeComplete?: () => void;
};

export function SpeechBubble(props: SpeechBubbleProps) {
  const [displayedText, setDisplayedText] = createSignal("");
  const [isVisible, setIsVisible] = createSignal(false);

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const animateSentences = async () => {
    let currentText = "";

    for (const sentence of sentences) {
      props.onTalkingChange?.(true);

      for (let i = 0; i < sentence.length; i++) {
        currentText += sentence[i];
        setDisplayedText(currentText);
        await delay(50);
      }

      props.onTalkingChange?.(false);

      if (sentence !== sentences[sentences.length - 1]) {
        await delay(1500);
      }
    }

    props.onWelcomeComplete?.();
  };

  onMount(() => {
    setTimeout(() => {
      setIsVisible(true);
      props.onWelcomeStart?.();
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
        class="speech-bubble-svg"
        width={`${bubbleWidth + 20}px`}
        height={`${bubbleHeight() + 20}px`}
        viewBox={`0 0 ${bubbleWidth + 20} ${bubbleHeight() + 20}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <g class="speech-bubble">
          <polygon
            class="speech-bubble-shape"
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
          />

          <text
            class="speech-bubble-text"
            x={20}
            y={(() => {
              const fontSize = 20;
              const lineHeight = 28;
              const totalTextHeight = fontSize + (lineCount() - 1) * lineHeight;
              return (bubbleHeight() - totalTextHeight) / 2 + fontSize;
            })()}
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
