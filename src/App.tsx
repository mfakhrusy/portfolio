import { createSignal, createEffect, Show } from "solid-js";
import "./App.css";
import type { LampPhase } from "./type";
import { Lamp } from "./Lamp";
import { Clock } from "./Clock";
import { Calendar } from "./Calendar";
import { RobotPersona } from "./RobotPersona/RobotPersona";

type ContentItem = {
  title: string;
  body: string;
  island: string | null;
};

const App = () => {
  // ---------- State ----------
  const [scene, setScene] = createSignal<"office" | "lab">("office");
  const [focus, setFocus] = createSignal<string | null>(null);
  const [lampPhase, setLampPhase] = createSignal<LampPhase>("no-lamp");
  const [isLampOn, setIsLampOn] = createSignal(true);

  // ---------- Room Actions ----------
  const roomActions = {
    toggleLamp: () => setIsLampOn((prev) => !prev),
    setLampOn: (on: boolean) => setIsLampOn(on),
    isLampOn: () => isLampOn(),
  };

  // ---------- Content ----------
  const contentByItem: Record<string, ContentItem> = {
    desk: {
      title: "Desk",
      body: "<p>This is where I work on projects and ideas.</p>",
      island: null,
    },
    robot: {
      title: "Robot",
      body: "<p>This represents my interest in robotics and AI.</p>",
      island: null,
    },
  };

  // ---------- Lamp Sequence ----------
  const runLampSequence = async () => {
    if (lampPhase() !== "no-lamp" || scene() !== "office") return;

    // setLampPhase("placing");
    // await new Promise((r) => setTimeout(r, 600));

    setLampPhase("brightening");
    await new Promise((r) => setTimeout(r, 0));

    setLampPhase("placed");
  };

  // Auto-start sequence when entering office
  createEffect(() => {
    if (scene() === "office") {
      setLampPhase("no-lamp");
      setTimeout(() => runLampSequence(), 0);
    } else {
      setLampPhase("no-lamp");
    }
  });

  // ---------- Event Router ----------
  const dispatch = (
    eventType: "ITEM_FOCUS" | "SCENE_SWITCH" | "OVERLAY_CLOSE",
    payload?: any,
  ) => {
    switch (eventType) {
      case "ITEM_FOCUS":
        setFocus(payload.itemId);
        break;
      case "SCENE_SWITCH":
        setScene(payload.sceneId);
        setFocus(null);
        break;
      case "OVERLAY_CLOSE":
        setFocus(null);
        break;
    }
  };

  // ---------- Handlers ----------
  const handleItemClick = (itemId: string) => (e: Event) => {
    e.preventDefault();
    dispatch("ITEM_FOCUS", { itemId });
  };

  const handleSceneSwitch = (sceneId: string) => (e: Event) => {
    e.preventDefault();
    dispatch("SCENE_SWITCH", { sceneId });
  };

  const handleClose = (e: Event) => {
    e.preventDefault();
    dispatch("OVERLAY_CLOSE");
  };

  // console.log({lampPhase: lampPhase()})

  return (
    <main class="app" role="main">
      {/* Office Scene */}
      <section
        class="scene"
        classList={{ active: scene() === "office" }}
        data-scene="office"
        aria-label="Office scene"
      >
        <div
          class="room"
          classList={{
            brightened:
              scene() === "office" &&
              (lampPhase() === "brightening" || lampPhase() === "placed") &&
              isLampOn(),
            dimmed:
              scene() === "office" && lampPhase() === "placed" && !isLampOn(),
          }}
          // classList={{ brightened: scene() === "office" }}
        >
          {/* <button
            class="item"
            data-focus="desk"
            aria-label="View desk details"
            onClick={handleItemClick('desk')}
          >
            Desk
          </button> */}

          <Show when={scene() === "office"}>
            <Lamp isOn={isLampOn()} />
            <Clock />
            <Calendar />
            <RobotPersona roomActions={roomActions} />
          </Show>

          <nav aria-label="Scene navigation">
            <button
              class="switch"
              data-scene="lab"
              aria-label="Go to Lab"
              onClick={handleSceneSwitch("lab")}
            >
              Go to Lab →
            </button>
          </nav>
        </div>
      </section>

      {/* Lab Scene */}
      <section
        class="scene"
        classList={{ active: scene() === "lab" }}
        data-scene="lab"
        aria-label="Lab scene"
      >
        <div class="room">
          <button
            class="item"
            data-focus="robot"
            aria-label="View robot details"
            onClick={handleItemClick("robot")}
          >
            Robot
          </button>

          <nav aria-label="Scene navigation">
            <button
              class="switch"
              data-scene="office"
              aria-label="Back to Office"
              onClick={handleSceneSwitch("office")}
            >
              ← Back to Office
            </button>
          </nav>
        </div>
      </section>

      {/* Overlay */}
      <section
        class="overlay"
        classList={{ active: Boolean(focus()) }}
        aria-hidden={!focus()}
        role="dialog"
        aria-modal="true"
      >
        <button class="close" aria-label="Close details" onClick={handleClose}>
          ✕
        </button>
        <div class="content">
          <Show when={focus()}>
            <h2>{contentByItem[focus()!].title}</h2>
            <div innerHTML={contentByItem[focus()!].body} />
          </Show>
        </div>
      </section>
    </main>
  );
};

export default App;
