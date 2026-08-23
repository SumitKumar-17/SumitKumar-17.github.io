<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from "svelte";
  import "@excalidraw/excalidraw/index.css";

  export let initialData: { elements?: unknown[]; files?: unknown } | null =
    null;

  const dispatch = createEventDispatcher<{
    change: { elements: unknown[]; files: unknown };
  }>();

  let containerEl: HTMLDivElement;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let root: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let api: any;
  let applyingScene = false;

  onMount(() => {
    if (import.meta.env.SSR) return;
    let disposed = false;

    (async () => {
      const [React, ReactDOMClient, Excalidraw] = await Promise.all([
        import("react"),
        import("react-dom/client"),
        import("@excalidraw/excalidraw"),
      ]);
      if (disposed) return;

      root = ReactDOMClient.createRoot(containerEl);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const props: any = {
        initialData: initialData ?? undefined,
        excalidrawAPI: (a: unknown) => (api = a),
        onChange: (elements: unknown[], _appState: unknown, files: unknown) => {
          if (applyingScene) return;
          dispatch("change", { elements, files });
        },
      };
      root.render(React.createElement(Excalidraw.Excalidraw, props));
    })();

    return () => {
      disposed = true;
    };
  });

  onDestroy(() => {
    root?.unmount();
  });

  export function loadScene(data: { elements?: unknown[]; files?: unknown }) {
    if (!api) return;
    applyingScene = true;
    api.updateScene({ elements: data.elements ?? [] });
    if (data.files) api.addFiles(Object.values(data.files));
    applyingScene = false;
  }
</script>

<div bind:this={containerEl} class="excalidraw-container"></div>

<style>
  .excalidraw-container {
    height: 100%;
    width: 100%;
  }
</style>
