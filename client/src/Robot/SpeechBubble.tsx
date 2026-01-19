import { createSignal, createEffect, onMount, Show } from "solid-js";
import "./SpeechBubble.css";

type SpeechBubbleProps = {
  sentences: string[];
  startDelay?: number;
  onTalkingChange?: (isTalking: boolean) => void;
  onStart?: () => void;
  onComplete?: () => void;
};

export function SpeechBubble(props: SpeechBubbleProps) {
  const [displayedText, setDisplayedText] = createSignal("");
  const [isVisible, setIsVisible] = createSignal(false);
  let abortController: { aborted: boolean } = { aborted: false };

  const startDelay = () => props.startDelay ?? 5000;

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const animateSentences = async (
    sentenceList: string[],
    controller: { aborted: boolean },
  ) => {
    let currentText = "";

    for (const sentence of sentenceList) {
      if (controller.aborted) return;

      props.onTalkingChange?.(true);

      for (let i = 0; i < sentence.length; i++) {
        if (controller.aborted) {
          props.onTalkingChange?.(false);
          return;
        }
        currentText += sentence[i];
        setDisplayedText(currentText);
        await delay(50);
      }

      props.onTalkingChange?.(false);

      if (sentence !== sentenceList[sentenceList.length - 1]) {
        await delay(1500);
      }
    }

    if (!controller.aborted) {
      props.onComplete?.();
    }
  };

  onMount(() => {
    setTimeout(() => {
      setIsVisible(true);
      props.onStart?.();
      animateSentences(props.sentences, abortController);
    }, startDelay());
  });

  createEffect((prevSentences: string[] | undefined) => {
    const currentSentences = props.sentences;
    if (prevSentences && prevSentences !== currentSentences) {
      abortController.aborted = true;
      abortController = { aborted: false };
      setDisplayedText("");
      setIsVisible(true);
      animateSentences(currentSentences, abortController);
    }
    return currentSentences;
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
    if (lineCount() >= 6) return 170;
    if (lineCount() >= 5) return 150;
    if (lineCount() >= 4) return 130;
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
              ${bubbleWidth / 2 + 15},${bubbleHeight()}
              ${bubbleWidth / 2},${bubbleHeight() + 15}
              ${bubbleWidth / 2 - 15},${bubbleHeight()}
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
