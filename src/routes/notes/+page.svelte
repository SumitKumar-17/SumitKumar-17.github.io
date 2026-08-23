<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { Download, Eye, Pencil, Trash2, Wand2 } from "lucide-svelte";

  import Seo from "$lib/components/Seo.svelte";
  import Markdown from "$lib/components/Markdown.svelte";
  import MonacoEditor from "./MonacoEditor.svelte";
  import FloatingPanel from "./FloatingPanel.svelte";
  import NoteTabs from "./NoteTabs.svelte";
  import Toast from "./Toast.svelte";
  import {
    type Note,
    loadCollection,
    saveCollection,
    loadActiveId,
    saveActiveId,
    newNote,
  } from "./storage";

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

  const SAVE_DELAY_MS = 800;
  const UNDO_WINDOW_MS = 6000;

  let notes: Note[] = [];
  let activeId = "";
  let notesLoaded = false;

  let editorRef: MonacoEditor;
  let ready = false;
  let rendered = false;
  let saveStatus: "idle" | "unsaved" | "saved" = "idle";
  let saveTimeout: ReturnType<typeof setTimeout> | undefined;

  let pendingDelete: { note: Note; index: number } | null = null;
  let pendingDeleteTimeout: ReturnType<typeof setTimeout> | undefined;

  $: activeNote = notes.find((n) => n.id === activeId);

  onMount(() => {
    if (import.meta.env.SSR) return;

    let loaded = loadCollection();
    if (loaded.length === 0) loaded = [newNote()];
    notes = loaded;

    const savedActive = loadActiveId();
    activeId = loaded.some((n) => n.id === savedActive)
      ? (savedActive as string)
      : loaded[0].id;

    saveCollection(notes);
    saveActiveId(activeId);
    notesLoaded = true;

    function onKeydown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (saveTimeout) clearTimeout(saveTimeout);
        flushSave();
      }
    }
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  });

  onDestroy(() => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      flushSave();
    }
  });

  function scheduleSave() {
    saveStatus = "unsaved";
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(flushSave, SAVE_DELAY_MS);
  }

  function flushSave() {
    if (!activeNote) return;
    activeNote.updatedAt = Date.now();
    notes = notes;
    saveCollection(notes);
    saveStatus = activeNote.content.trim() ? "saved" : "idle";
  }

  function onEditorChange(e: CustomEvent<string>) {
    if (!activeNote) return;
    activeNote.content = e.detail;
    scheduleSave();
  }

  function selectNote(id: string) {
    if (id === activeId) return;
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      flushSave();
    }
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    activeId = id;
    saveActiveId(id);
    rendered = false;
    editorRef?.setValue(note.content);
    editorRef?.setLanguage(note.language);
  }

  function addNote() {
    const note = newNote();
    notes = [...notes, note];
    saveCollection(notes);
    selectNote(note.id);
  }

  function renameNote(e: CustomEvent<{ id: string; name: string }>) {
    const note = notes.find((n) => n.id === e.detail.id);
    if (!note) return;
    note.name = e.detail.name;
    notes = notes;
    saveCollection(notes);
  }

  function deleteNote(e: CustomEvent<string>) {
    const id = e.detail;
    const index = notes.findIndex((n) => n.id === id);
    if (index === -1) return;

    const copy = [...notes];
    const [removed] = copy.splice(index, 1);
    const switchingActive = id === activeId;
    const next = switchingActive ? copy[Math.max(0, index - 1)] ?? copy[0] : null;

    notes = copy;
    saveCollection(notes);

    if (switchingActive && next) {
      activeId = next.id;
      saveActiveId(activeId);
      editorRef?.setValue(next.content);
      editorRef?.setLanguage(next.language);
    }

    pendingDelete = { note: removed, index };
    if (pendingDeleteTimeout) clearTimeout(pendingDeleteTimeout);
    pendingDeleteTimeout = setTimeout(
      () => (pendingDelete = null),
      UNDO_WINDOW_MS
    );
  }

  function undoDelete() {
    if (!pendingDelete) return;
    const { note, index } = pendingDelete;
    const copy = [...notes];
    copy.splice(index, 0, note);
    notes = copy;
    saveCollection(notes);
    pendingDelete = null;
    if (pendingDeleteTimeout) clearTimeout(pendingDeleteTimeout);
  }

  function setLanguage(id: string) {
    if (!activeNote) return;
    activeNote.language = id;
    notes = notes;
    editorRef?.setLanguage(id);
    if (id !== "markdown") rendered = false;
    scheduleSave();
  }

  function format() {
    editorRef?.format();
  }

  function download() {
    if (!activeNote) return;
    const meta = LANGUAGES.find((l) => l.id === activeNote?.language);
    const blob = new Blob([activeNote.content], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeNote.name || "notes"}.${meta?.ext ?? "txt"}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function clearNote() {
    if (!activeNote) return;
    if (saveTimeout) clearTimeout(saveTimeout);
    activeNote.content = "";
    notes = notes;
    editorRef?.setValue("");
    flushSave();
  }
</script>

<Seo title="Notes" description="Scratch code/markdown notepad." />

<div class="fullscreen">
  {#if notesLoaded && activeNote}
    <FloatingPanel storageKey="notes:panel" label="Notes">
      <div class="toolbar-inner">
        <NoteTabs
          {notes}
          {activeId}
          on:select={(e) => selectNote(e.detail)}
          on:add={addNote}
          on:delete={deleteNote}
          on:rename={renameNote}
        />

        <div class="controls">
          <select
            class="lang-select"
            value={activeNote.language}
            on:change={(e) => setLanguage(e.currentTarget.value)}
          >
            {#each LANGUAGES as lang}
              <option value={lang.id}>{lang.label}</option>
            {/each}
          </select>

          {#if activeNote.language === "markdown"}
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

          <button
            class="btn"
            on:click={download}
            disabled={!activeNote.content.trim()}
          >
            <Download size={15} strokeWidth={1.8} />
            Download
          </button>

          <button
            class="btn"
            on:click={clearNote}
            disabled={!activeNote.content.trim()}
          >
            <Trash2 size={15} strokeWidth={1.8} />
            Clear
          </button>

          <span class="save-status">
            {#if saveStatus === "unsaved"}
              Saving…
            {:else if saveStatus === "saved"}
              Saved
            {/if}
          </span>
        </div>
      </div>
    </FloatingPanel>

    <div class="editor-wrap" class:hidden={rendered}>
      {#if !ready}
        <p class="loading">Loading editor…</p>
      {/if}
      <MonacoEditor
        bind:this={editorRef}
        bind:ready
        initialValue={activeNote.content}
        initialLanguage={activeNote.language}
        on:change={onEditorChange}
      />
    </div>

    {#if rendered}
      <div class="rendered-surface">
        {#if activeNote.content.trim()}
          <Markdown source={activeNote.content} />
        {:else}
          <p class="text-neutral-400">Nothing written yet.</p>
        {/if}
      </div>
    {/if}
  {/if}
</div>

{#if pendingDelete}
  <Toast
    message={`Note "${pendingDelete.note.name}" deleted`}
    actionLabel="Undo"
    onAction={undoDelete}
  />
{/if}

<style lang="postcss">
  @reference "../../app.css";

  .fullscreen {
    @apply fixed inset-0 bg-white;
    height: 100dvh;
    width: 100vw;
    z-index: 100;
  }

  .toolbar-inner {
    @apply flex flex-col gap-1.5;
  }

  .controls {
    @apply flex items-center gap-2 flex-wrap;
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

  .save-status {
    @apply text-xs text-neutral-400 px-1.5 min-w-[3.5rem];
  }

  .editor-wrap {
    @apply relative w-full h-full overflow-hidden;
  }

  .editor-wrap.hidden {
    display: none;
  }

  .loading {
    @apply absolute inset-0 flex items-center justify-center text-neutral-400 text-sm;
    z-index: 1;
  }

  .rendered-surface {
    @apply w-full h-full overflow-y-auto p-8 pt-20 max-w-screen-md mx-auto;
  }
</style>
