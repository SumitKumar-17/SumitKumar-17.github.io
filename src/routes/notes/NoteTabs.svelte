<script lang="ts">
  import { Plus, X } from "lucide-svelte";
  import { createEventDispatcher } from "svelte";
  import type { Note } from "./storage";

  export let notes: Note[];
  export let activeId: string;

  const dispatch = createEventDispatcher<{
    select: string;
    add: void;
    delete: string;
    rename: { id: string; name: string };
  }>();

  let editingId: string | null = null;
  let editingValue = "";

  function startRename(note: Note) {
    editingId = note.id;
    editingValue = note.name;
  }

  function commitRename() {
    if (editingId && editingValue.trim()) {
      dispatch("rename", { id: editingId, name: editingValue.trim() });
    }
    editingId = null;
  }

  function focusOnMount(node: HTMLInputElement) {
    node.focus();
  }
</script>

<div class="tabs">
  {#each notes as note (note.id)}
    <div class="tab" class:active={note.id === activeId}>
      {#if editingId === note.id}
        <input
          class="rename-input"
          bind:value={editingValue}
          on:blur={commitRename}
          on:keydown={(e) => e.key === "Enter" && commitRename()}
          use:focusOnMount
        />
      {:else}
        <button
          class="tab-label"
          on:click={() => dispatch("select", note.id)}
          on:dblclick={() => startRename(note)}
        >
          {note.name}
        </button>
      {/if}
      {#if notes.length > 1}
        <button
          class="tab-close"
          on:click={() => dispatch("delete", note.id)}
          aria-label="Delete note"
        >
          <X size={12} strokeWidth={2} />
        </button>
      {/if}
    </div>
  {/each}

  <button class="add-btn" on:click={() => dispatch("add")} aria-label="New note">
    <Plus size={14} strokeWidth={1.8} />
  </button>
</div>

<style lang="postcss">
  @reference "../../app.css";

  .tabs {
    @apply flex items-center gap-1 overflow-x-auto max-w-[50vw];
  }

  .tab {
    @apply flex items-center gap-1 text-sm rounded-full pl-3 pr-1.5 py-1;
    @apply text-neutral-500 hover:bg-neutral-100 transition-colors shrink-0;
  }

  .tab.active {
    @apply bg-neutral-100 text-black font-medium;
  }

  .tab-label {
    @apply whitespace-nowrap max-w-[10rem] truncate;
  }

  .rename-input {
    @apply text-sm bg-white border border-neutral-300 rounded-full px-2 py-0.5 w-28;
    @apply focus:outline-none;
  }

  .tab-close {
    @apply flex items-center justify-center w-4 h-4 rounded-full text-neutral-400;
    @apply hover:bg-neutral-200 hover:text-neutral-700 transition-colors;
  }

  .add-btn {
    @apply flex items-center justify-center w-6 h-6 rounded-full text-neutral-500;
    @apply hover:bg-neutral-100 transition-colors shrink-0;
  }
</style>
