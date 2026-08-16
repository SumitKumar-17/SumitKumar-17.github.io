<script lang="ts">
  import { Download, Eye, Pencil } from "lucide-svelte";

  import Seo from "$lib/components/Seo.svelte";
  import Markdown from "$lib/components/Markdown.svelte";

  let source = "";
  let rendered = false;

  function download() {
    const blob = new Blob([source], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "notes.md";
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<Seo title="Notes" description="Scratch markdown notepad." />

<section class="layout-md py-12">
  <div class="toolbar">
    <button class="btn" on:click={() => (rendered = !rendered)}>
      {#if rendered}
        <Pencil size={15} strokeWidth={1.8} />
        Edit
      {:else}
        <Eye size={15} strokeWidth={1.8} />
        Render
      {/if}
    </button>
    <button class="btn" on:click={download} disabled={!source.trim()}>
      <Download size={15} strokeWidth={1.8} />
      Download
    </button>
  </div>

  {#if rendered}
    <div class="surface rendered">
      {#if source.trim()}
        <Markdown {source} />
      {:else}
        <p class="text-neutral-400">Nothing written yet.</p>
      {/if}
    </div>
  {:else}
    <textarea
      class="surface editor"
      bind:value={source}
      placeholder="Write anything. Nothing here is saved — refresh and it's gone."
      spellcheck="false"
      autofocus
    ></textarea>
  {/if}
</section>

<style lang="postcss">
  @reference "../../app.css";

  .toolbar {
    @apply flex gap-2 mb-4;
  }

  .btn {
    @apply flex items-center gap-1.5 text-sm font-medium text-neutral-600;
    @apply border border-neutral-300 rounded-full px-3 py-1.5;
    @apply hover:bg-neutral-100 hover:border-neutral-400 transition-colors;
    @apply disabled:opacity-40 disabled:pointer-events-none;
  }

  .surface {
    min-height: 75vh;
  }

  .editor {
    @apply w-full rounded-md border border-neutral-200 p-4;
    @apply font-mono text-sm leading-relaxed text-neutral-700;
    @apply focus:outline-none focus:border-neutral-400;
    resize: vertical;
  }

  .rendered {
    @apply rounded-md border border-neutral-200 p-4;
  }
</style>
