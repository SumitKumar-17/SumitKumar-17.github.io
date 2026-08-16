<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { Download, Eye, Pencil, Wand2 } from "lucide-svelte";

  import Seo from "$lib/components/Seo.svelte";
  import Markdown from "$lib/components/Markdown.svelte";

  const LANGUAGES = [
    { id: "markdown", label: "Markdown", ext: "md" },
    { id: "javascript", label: "JavaScript", ext: "js" },
    { id: "typescript", label: "TypeScript", ext: "ts" },
    { id: "python", label: "Python", ext: "py" },
    { id: "go", label: "Go", ext: "go" },
    { id: "rust", label: "Rust", ext: "rs" },
    { id: "sql", label: "SQL", ext: "sql" },
    { id: "json", label: "JSON", ext: "json" },
    { id: "yaml", label: "YAML", ext: "yaml" },
    { id: "html", label: "HTML", ext: "html" },
    { id: "css", label: "CSS", ext: "css" },
    { id: "cpp", label: "C++", ext: "cpp" },
    { id: "csharp", label: "C#", ext: "cs" },
    { id: "java", label: "Java", ext: "java" },
    { id: "shell", label: "Shell", ext: "sh" },
    { id: "dockerfile", label: "Dockerfile", ext: "dockerfile" },
    { id: "plaintext", label: "Plain Text", ext: "txt" },
  ];

  let containerEl: HTMLDivElement;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let editor: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let monacoApi: any;

  let language = "markdown";
  let source = "";
  let rendered = false;
  let ready = false;

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
        value: source,
        language,
        theme: "vs",
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: "on",
        scrollBeyondLastLine: false,
        tabSize: 2,
      });

      editor.onDidChangeModelContent(() => {
        source = editor.getValue();
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

  function setLanguage(id: string) {
    language = id;
    if (editor && monacoApi) {
      monacoApi.editor.setModelLanguage(editor.getModel(), id);
    }
    if (id !== "markdown") rendered = false;
  }

  function format() {
    editor?.getAction("editor.action.formatDocument")?.run();
  }

  function download() {
    const meta = LANGUAGES.find((l) => l.id === language);
    const blob = new Blob([source], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notes.${meta?.ext ?? "txt"}`;
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<Seo title="Notes" description="Scratch code/markdown notepad." />

<div class="fullscreen">
  <div class="toolbar">
    <select
      class="lang-select"
      bind:value={language}
      on:change={() => setLanguage(language)}
    >
      {#each LANGUAGES as lang}
        <option value={lang.id}>{lang.label}</option>
      {/each}
    </select>

    {#if language === "markdown"}
      <button class="btn" on:click={() => (rendered = !rendered)}>
        {#if rendered}
          <Pencil size={15} strokeWidth={1.8} />
          Edit
        {:else}
          <Eye size={15} strokeWidth={1.8} />
          Render
        {/if}
      </button>
    {/if}

    <button class="btn" on:click={format} disabled={!ready || rendered}>
      <Wand2 size={15} strokeWidth={1.8} />
      Format
    </button>

    <button class="btn" on:click={download} disabled={!source.trim()}>
      <Download size={15} strokeWidth={1.8} />
      Download
    </button>
  </div>

  <div class="editor-wrap" class:hidden={rendered}>
    {#if !ready}
      <p class="loading">Loading editor…</p>
    {/if}
    <div bind:this={containerEl} class="monaco-container"></div>
  </div>

  {#if rendered}
    <div class="rendered-surface">
      {#if source.trim()}
        <Markdown {source} />
      {:else}
        <p class="text-neutral-400">Nothing written yet.</p>
      {/if}
    </div>
  {/if}
</div>

<style lang="postcss">
  @reference "../../app.css";

  .fullscreen {
    @apply fixed inset-0 bg-white;
    height: 100dvh;
    width: 100vw;
    z-index: 100;
  }

  .toolbar {
    @apply absolute top-4 right-4 z-10 flex items-center gap-2;
    @apply bg-white/90 backdrop-blur rounded-full p-1.5 shadow-sm;
  }

  .lang-select {
    @apply text-sm font-medium text-neutral-600 bg-white;
    @apply border border-neutral-300 rounded-full px-3 py-1.5;
    @apply hover:border-neutral-400 transition-colors;
    @apply focus:outline-none;
  }

  .btn {
    @apply flex items-center gap-1.5 text-sm font-medium text-neutral-600;
    @apply border border-neutral-300 rounded-full px-3 py-1.5;
    @apply bg-white hover:bg-neutral-100 hover:border-neutral-400 transition-colors;
    @apply disabled:opacity-40 disabled:pointer-events-none;
  }

  .editor-wrap {
    @apply relative w-full h-full overflow-hidden;
  }

  .editor-wrap.hidden {
    display: none;
  }

  .monaco-container {
    height: 100%;
    width: 100%;
  }

  .loading {
    @apply absolute inset-0 flex items-center justify-center text-neutral-400 text-sm;
  }

  .rendered-surface {
    @apply w-full h-full overflow-y-auto p-8 pt-20 max-w-screen-md mx-auto;
  }
</style>
