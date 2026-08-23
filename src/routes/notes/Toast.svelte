<script lang="ts">
  export let message: string;
  export let actionLabel: string | undefined = undefined;
  export let onAction: (() => void) | undefined = undefined;
</script>

<div class="toast" role="status">
  <span>{message}</span>
  {#if actionLabel && onAction}
    <button class="action" on:click={onAction}>{actionLabel}</button>
  {/if}
</div>

<style lang="postcss">
  @reference "../../app.css";

  .toast {
    @apply fixed left-1/2 bottom-6 -translate-x-1/2 z-30;
    @apply flex items-center gap-3 bg-neutral-900 text-white text-sm;
    @apply rounded-full pl-4 pr-2 py-2 shadow-lg;
  }

  .action {
    @apply text-white font-medium rounded-full px-3 py-1;
    @apply bg-white/15 hover:bg-white/25 transition-colors;
  }
</style>
