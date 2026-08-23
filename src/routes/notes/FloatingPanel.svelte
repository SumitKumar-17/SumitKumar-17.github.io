<script lang="ts">
  import { GripVertical, Minus, Plus } from "lucide-svelte";
  import { onMount } from "svelte";

  export let storageKey: string;
  export let label = "Panel";

  let panelEl: HTMLDivElement;
  let x = 16;
  let y = 16;
  let minimized = false;
  let dragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let panelStartX = 0;
  let panelStartY = 0;

  type SavedState = { x: number; y: number; minimized: boolean };

  function load(): SavedState | null {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function persist() {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ x, y, minimized } satisfies SavedState)
      );
    } catch {
      // localStorage unavailable — position just won't be remembered.
    }
  }

  onMount(() => {
    const saved = load();
    if (saved) {
      x = saved.x;
      y = saved.y;
      minimized = saved.minimized;
    } else {
      // default: top-right corner
      x = window.innerWidth - 340;
      y = 16;
    }
    clampToViewport();

    function onResize() {
      clampToViewport();
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  });

  function clampToViewport() {
    if (!panelEl) return;
    const rect = panelEl.getBoundingClientRect();
    const maxX = Math.max(0, window.innerWidth - rect.width);
    const maxY = Math.max(0, window.innerHeight - rect.height);
    x = Math.min(Math.max(0, x), maxX);
    y = Math.min(Math.max(0, y), maxY);
  }

  function startDrag(e: PointerEvent) {
    dragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    panelStartX = x;
    panelStartY = y;
    window.addEventListener("pointermove", onDrag);
    window.addEventListener("pointerup", endDrag, { once: true });
  }

  function onDrag(e: PointerEvent) {
    if (!dragging) return;
    x = panelStartX + (e.clientX - dragStartX);
    y = panelStartY + (e.clientY - dragStartY);
    clampToViewport();
  }

  function endDrag() {
    dragging = false;
    window.removeEventListener("pointermove", onDrag);
    persist();
  }

  function toggleMinimized() {
    minimized = !minimized;
    persist();
  }
</script>

<div
  bind:this={panelEl}
  class="panel"
  class:minimized
  style="left:{x}px; top:{y}px;"
>
  <div
    class="handle"
    role="button"
    tabindex={0}
    aria-label="Drag to move, click to {minimized ? 'expand' : 'minimize'}"
    on:pointerdown={startDrag}
  >
    <GripVertical size={14} strokeWidth={1.8} class="grip" />
    {#if minimized}
      <span class="label">{label}</span>
    {/if}
    <button
      class="min-btn"
      on:click|stopPropagation={toggleMinimized}
      aria-label={minimized ? "Expand" : "Minimize"}
    >
      {#if minimized}
        <Plus size={14} strokeWidth={1.8} />
      {:else}
        <Minus size={14} strokeWidth={1.8} />
      {/if}
    </button>
  </div>

  {#if !minimized}
    <div class="content">
      <slot />
    </div>
  {/if}
</div>

<style lang="postcss">
  @reference "../../app.css";

  .panel {
    @apply fixed z-20 bg-white/95 backdrop-blur rounded-2xl shadow-md;
    @apply border border-neutral-200;
  }

  .handle {
    @apply flex items-center gap-1.5 px-2 py-1.5 cursor-grab select-none;
    touch-action: none;
  }

  .handle :global(.grip) {
    @apply text-neutral-400;
  }

  .label {
    @apply text-xs font-medium text-neutral-500 pr-1;
  }

  .min-btn {
    @apply flex items-center justify-center w-5 h-5 rounded-full ml-auto;
    @apply text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors;
  }

  .content {
    @apply px-2 pb-2;
  }
</style>
