<script lang="ts">
  import { fade } from "svelte/transition";

  export let title: string;
  export let company: string;
  export let url: string;
  export let dates: string;
  export let location: string;
  export let hiddenMode: "click" | "always" | undefined = undefined;

  const isToggle = hiddenMode === "click";
  let hidden = isToggle;
</script>

{#if isToggle}
  <div
    class="my-10 cursor-pointer"
    role="button"
    tabindex={0}
    on:click={() => (hidden = false)}
    on:keydown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        hidden = false;
      }
    }}
  >
    <h3 class="text-black text-lg leading-tight mb-1">
      {title} at <a class="link" href={url}>{company}</a>
    </h3>
    <p class="font-light mb-2">
      <span class="whitespace-nowrap">{dates}</span>
      <span class="px-0.5 text-neutral-500">•</span>
      <span class="whitespace-nowrap">{location}</span>
    </p>
    {#if !hidden}
      <ul
        class="list-disc pl-7 marker:text-neutral-400 space-y-1"
        in:fade|local
      >
        <slot />
      </ul>
    {/if}
  </div>
{:else if hiddenMode !== "always"}
  <div class="my-10">
    <h3 class="text-black text-lg leading-tight mb-1">
      {title} at <a class="link" href={url}>{company}</a>
    </h3>
    <p class="font-light mb-2">
      <span class="whitespace-nowrap">{dates}</span>
      <span class="px-0.5 text-neutral-500">•</span>
      <span class="whitespace-nowrap">{location}</span>
    </p>
    <ul class="list-disc pl-7 marker:text-neutral-400 space-y-1">
      <slot />
    </ul>
  </div>
{/if}
