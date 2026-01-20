import { createSignal, createEffect, Show, onMount, onCleanup } from "solid-js";
import "./App.css";
import { Office } from "./Scene/Office/Office";
import { Lab3D } from "./Scene/Lab/Lab3D";
import { Horizon } from "./Scene/Horizon/Horizon";

type Scene = "horizon" | "office" | "lab";

const getSceneFromHash = (): Scene => {
  const hash = window.location.hash.slice(1);
  if (hash === "lab") return "lab";
  if (hash === "office") return "office";
  return "horizon";
};

const App = () => {
  const [scene, setScene] = createSignal<Scene>(getSceneFromHash());
  const [isEnteringDoor, setIsEnteringDoor] = createSignal(false);

  // ---------- Hash Routing ----------
  createEffect(() => {
    const currentScene = scene();
    const newHash = currentScene === "horizon" ? "" : currentScene;
    if (window.location.hash.slice(1) !== newHash) {
      window.history.pushState(
        null,
        "",
        newHash ? `#${newHash}` : window.location.pathname,
      );
    }
  });

  onMount(() => {
    const handlePopState = () => {
      setScene(getSceneFromHash());
    };
    window.addEventListener("popstate", handlePopState);
    onCleanup(() => window.removeEventListener("popstate", handlePopState));
  });

  // ---------- Handlers ----------
  const handleDoorEnter = () => {
    if (isEnteringDoor()) return;
    setIsEnteringDoor(true);
    setTimeout(() => {
      setScene("lab");
      setIsEnteringDoor(false);
    }, 1500);
  };

  const handleLabExit = () => {
    setScene("horizon");
  };

  return (
    <main class="app" role="main">
      {/* Door transition overlay */}
      <Show when={isEnteringDoor()}>
        <div class="door-transition-overlay" />
      </Show>

      {/* Horizon Scene (Default) */}
      <section
        class="scene"
        classList={{
          active: scene() === "horizon",
          "scene-entering": isEnteringDoor() && scene() === "horizon",
        }}
        data-scene="horizon"
        aria-label="Horizon scene"
      >
        <Show when={scene() === "horizon"}>
          <Horizon onEnterDoor={handleDoorEnter} />
        </Show>
      </section>

      {/* Office Scene */}
      <section
        class="scene"
        classList={{
          active: scene() === "office",
          "scene-entering": isEnteringDoor() && scene() === "office",
        }}
        data-scene="office"
        aria-label="Office scene"
      >
        <Show when={scene() === "office"}>
          <Office onEnterDoor={handleDoorEnter} />
        </Show>
      </section>

      {/* Lab Scene - 3D Room */}
      <section
        class="scene"
        classList={{ active: scene() === "lab" }}
        data-scene="lab"
        aria-label="Lab scene"
      >
        <Show when={scene() === "lab"}>
          <Lab3D onBack={handleLabExit} />
        </Show>
      </section>
    </main>
  );
};

export default App;
