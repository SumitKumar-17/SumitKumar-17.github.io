<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from "svelte";

  export let initialValue = "";
  export let initialLanguage = "markdown";
  export let ready = false;

  const dispatch = createEventDispatcher<{ change: string }>();

  let containerEl: HTMLDivElement;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let editor: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let monacoApi: any;

  // Monaco is loaded as plain static assets (copied from the npm package into
  // /static/monaco) via its classic AMD loader script, not as a Vite/Rolldown
  // module import — the ESM build's web-worker imports don't resolve in
  // SvelteKit's server build, and this route is prerendered like every other
  // page. Loading it as inert static files sidesteps that entirely.
  function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`failed to load ${src}`));
      document.head.appendChild(script);
    });
  }

  onMount(() => {
    if (import.meta.env.SSR) return;
    let disposed = false;

    (async () => {
      const win = window as typeof window & {
        MonacoEnvironment?: unknown;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        require?: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        monaco?: any;
      };

      win.MonacoEnvironment = {
        getWorkerUrl: () =>
          "/monaco/vs/assets/editorWebWorkerMain-CA_vMoUU.js",
      };

      await loadScript("/monaco/vs/loader.js");
      if (disposed) return;

      win.require.config({ paths: { vs: "/monaco/vs" } });
      await new Promise<void>((resolve) => {
        win.require(["vs/editor/editor.main"], () => resolve());
      });
      if (disposed) return;

      const monaco = win.monaco;
      monacoApi = monaco;
      editor = monaco.editor.create(containerEl, {
        value: initialValue,
        language: initialLanguage,
        theme: "vs",
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: "on",
        scrollBeyondLastLine: false,
        tabSize: 2,
      });

      editor.onDidChangeModelContent((e: { isFlush: boolean }) => {
        // isFlush = programmatic setValue(), not a real user edit.
        if (e.isFlush) return;
        dispatch("change", editor.getValue());
      });

      ready = true;
    })();

    return () => {
      disposed = true;
    };
  });

  onDestroy(() => {
    editor?.dispose();
  });

  export function getValue(): string {
    return editor?.getValue() ?? "";
  }

  export function setValue(value: string) {
    editor?.setValue(value);
  }

  export function setLanguage(id: string) {
    if (editor && monacoApi) {
      monacoApi.editor.setModelLanguage(editor.getModel(), id);
    }
  }

  export function format() {
    editor?.getAction("editor.action.formatDocument")?.run();
  }

  export function focus() {
    editor?.focus();
  }
</script>

<div bind:this={containerEl} class="monaco-container"></div>

<style lang="postcss">
  .monaco-container {
    height: 100%;
    width: 100%;
  }
</style>
