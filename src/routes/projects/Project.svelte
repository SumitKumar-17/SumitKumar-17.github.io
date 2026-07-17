<script lang="ts">
  import { ExternalLink, Github, Star } from "lucide-svelte";

  import Markdown from "$lib/components/Markdown.svelte";
  import { formatTime } from "$lib/utils";

  type Project = {
    title: string;
    date: string;
    content: string;
    repo?: string;
    demo?: string;
    topics: string[];
    lead: string;
    image?: string;
    image_border?: boolean;
    image_rounded?: boolean;
    subimages?: string[];
  };

  export let data: Project;
  export let images: Record<string, string>;
  export let stars: Record<string, number> | null = null;

  $: allImages = [data.image, ...(data.subimages ?? [])].filter(
    (name): name is string => Boolean(name)
  );
</script>

<!-- Title -->
<h3 class="text-black text-xl font-semibold mb-2">
  <span class="mr-1">{data.title}</span>
  <small class="whitespace-nowrap text-neutral-500 text-base font-normal">
    {formatTime("%B %Y", data.date)}
  </small>
</h3>

<!-- Stars and tags (pill bar) -->
<div class="flex flex-wrap mb-1">
  {#if data.repo}
    <a
      class="pill hover:!bg-neutral-200 transition-colors"
      href="https://github.com/{data.repo}"
      target="_blank"
      rel="noreferrer"
    >
      <Github size={14} />
      <span class="ml-1">GitHub</span>
    </a>
    <a
      class="pill hover:!bg-neutral-200 transition-colors"
      href="https://github.com/{data.repo}/stargazers"
      target="_blank"
      rel="noreferrer"
    >
      <Star size={14} class="fill-current" />
      {#if stars?.[data.repo] !== undefined}
        <span class="ml-1">{stars[data.repo].toLocaleString()}</span>
      {:else}
        <span>&ZeroWidthSpace;</span>
      {/if}
    </a>
  {/if}
  {#if data.demo}
    <a
      class="pill pill-accent hover:!bg-neutral-800 transition-colors"
      href={data.demo}
      target="_blank"
      rel="noreferrer"
    >
      <ExternalLink size={14} />
      <span class="ml-1">Live Demo</span>
    </a>
  {/if}
  {#each data.topics as tag}
    <div class="pill">{tag}</div>
  {/each}
</div>

<!-- Single image: full-width hero above the writeup, so the text column -->
<!-- never gets squeezed into a narrow side rail. -->
{#if allImages.length === 1}
  <a rel="external" href={images[allImages[0]]} class="block mb-4">
    <img
      src={images[allImages[0]]}
      alt="{data.title} preview image"
      class="w-full"
      class:border={data.image_border}
      class:rounded-md={data.image_rounded}
    />
  </a>
{/if}

<div class="space-y-4">
  <p class="text-lg font-light mb-3">{data.lead}</p>
  <Markdown source={data.content} />

  <!-- Multiple images: a gallery grid below the writeup instead of one -->
  <!-- thumbnail wedged next to the text and the rest scattered underneath. -->
  {#if allImages.length > 1}
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
      {#each allImages as image}
        <a rel="external" href={images[image]}>
          <img
            src={images[image]}
            alt="{data.title} preview image"
            class="w-full"
          />
        </a>
      {/each}
    </div>
  {/if}
</div>

<style lang="postcss">
  .pill {
    @apply flex items-center text-sm font-medium;
    @apply px-1.5 py-[1px] mr-1.5 mb-2 bg-neutral-100 rounded-full;
  }

  .pill-accent {
    @apply bg-black text-white;
  }
</style>
