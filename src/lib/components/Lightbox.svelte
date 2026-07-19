<script lang="ts">
  import { ChevronLeft, ChevronRight, X } from "lucide-svelte";

  export let images: { src: string; alt: string }[];

  let activeIndex: number | null = null;
  let previouslyFocused: HTMLElement | null = null;
  let closeButton: HTMLButtonElement;

  export function open(index: number) {
    previouslyFocused = document.activeElement as HTMLElement;
    activeIndex = index;
    document.body.style.overflow = "hidden";
    // The close button doesn't exist until this render commits.
    requestAnimationFrame(() => closeButton?.focus());
  }

  function close() {
    activeIndex = null;
    document.body.style.overflow = "";
    previouslyFocused?.focus();
  }

  function next() {
    if (activeIndex === null) return;
    activeIndex = (activeIndex + 1) % images.length;
  }

  function prev() {
    if (activeIndex === null) return;
    activeIndex = (activeIndex - 1 + images.length) % images.length;
  }

  function onKeydown(e: KeyboardEvent) {
    if (activeIndex === null) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight" && images.length > 1) next();
    else if (e.key === "ArrowLeft" && images.length > 1) prev();
  }
</script>

<svelte:window on:keydown={onKeydown} />

{#if activeIndex !== null}
  <div
    class="backdrop"
    role="dialog"
    aria-modal="true"
    aria-label={images[activeIndex].alt}
    tabindex="-1"
    on:click={close}
    on:keydown={onKeydown}
  >
    <button
      bind:this={closeButton}
      class="control close"
      on:click|stopPropagation={close}
      aria-label="Close"
    >
      <X size={22} />
    </button>

    {#if images.length > 1}
      <button
        class="control prev"
        on:click|stopPropagation={prev}
        aria-label="Previous image"
      >
        <ChevronLeft size={28} />
      </button>
    {/if}

    <div class="image-frame" role="presentation" on:click|stopPropagation>
      <img
        class="lightbox-image"
        src={images[activeIndex].src}
        alt={images[activeIndex].alt}
      />
    </div>

    {#if images.length > 1}
      <button
        class="control next"
        on:click|stopPropagation={next}
        aria-label="Next image"
      >
        <ChevronRight size={28} />
      </button>
      <div class="counter">{activeIndex + 1} / {images.length}</div>
    {/if}
  </div>
{/if}

<style lang="postcss">
  .backdrop {
    @apply fixed inset-0 z-50 flex items-center justify-center;
    @apply bg-black/90 p-6 sm:p-10;
    animation: fade-in 150ms ease-out;
  }

  .image-frame {
    display: contents;
  }

  .lightbox-image {
    @apply max-w-full max-h-full rounded-md object-contain;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  }

  .control {
    @apply absolute flex items-center justify-center text-white/80;
    @apply hover:text-white transition-colors rounded-full;
    @apply bg-white/10 hover:bg-white/20;
  }

  .close {
    @apply top-4 right-4 sm:top-6 sm:right-6 w-10 h-10;
  }

  .prev,
  .next {
    @apply top-1/2 -translate-y-1/2 w-12 h-12;
  }

  .prev {
    @apply left-2 sm:left-6;
  }

  .next {
    @apply right-2 sm:right-6;
  }

  .counter {
    @apply absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2;
    @apply text-white/70 text-sm px-3 py-1 rounded-full bg-white/10;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
