<script lang="ts">
  import { ExternalLink, Star } from "lucide-svelte";

  import GithubIcon from "$lib/components/GithubIcon.svelte";
  import Lightbox from "$lib/components/Lightbox.svelte";
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
    subimages?: string[];
  };

  export let data: Project;
  export let images: Record<string, string>;
  export let stars: Record<string, number> | null = null;

  $: allImages = [data.image, ...(data.subimages ?? [])].filter(
    (name): name is string => Boolean(name)
  );
  $: lightboxImages = allImages.map((name) => ({
    src: images[name],
    alt: `${data.title} preview image`,
  }));

  let lightbox: Lightbox;
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
      <GithubIcon size={14} />
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
<!-- never gets squeezed into a narrow side rail. Always rounded/bordered -->
<!-- with a soft shadow, so every project looks polished automatically. -->
<!-- Opens in the in-page Lightbox instead of navigating to the raw file. -->
{#if allImages.length === 1}
  <button type="button" class="hero" on:click={() => lightbox.open(0)}>
    <img src={images[allImages[0]]} alt="{data.title} preview image" />
  </button>
{/if}

<div class="space-y-5">
  <p class="text-lg font-light">{data.lead}</p>
  <Markdown source={data.content} />

  <!-- Multiple images: a gallery grid below the writeup instead of one -->
  <!-- thumbnail wedged next to the text and the rest scattered underneath. -->
  <!-- auto-fit + a fixed aspect ratio means the row always fills cleanly, no -->
  <!-- matter the image count — no orphaned tile stretched alone in its own -->
  <!-- half-empty row, and no jagged heights from mismatched screenshots. -->
  {#if allImages.length > 1}
    <div class="gallery mt-6">
      {#each allImages as image, i}
        <button
          type="button"
          class="gallery-item"
          on:click={() => lightbox.open(i)}
        >
          <img src={images[image]} alt="{data.title} preview image" />
        </button>
      {/each}
    </div>
  {/if}
</div>

<Lightbox bind:this={lightbox} images={lightboxImages} />

<style lang="postcss">
  .pill {
    @apply flex items-center text-sm font-medium;
    @apply px-1.5 py-[1px] mr-1.5 mb-2 bg-neutral-100 rounded-full;
  }

  .pill-accent {
    @apply bg-black text-white;
  }

  .hero {
    @apply block w-full mb-6 rounded-md overflow-hidden border border-neutral-200;
    @apply shadow-sm hover:shadow-md transition-shadow;
    @apply p-0 bg-transparent cursor-pointer text-left;
  }

  .hero img {
    @apply w-full;
  }

  .gallery {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  .gallery-item {
    @apply block aspect-[2/1] overflow-hidden rounded-md border border-neutral-200;
    @apply p-0 bg-transparent cursor-pointer text-left w-full;
  }

  .gallery-item img {
    @apply w-full h-full object-cover transition-transform duration-200;
  }

  .gallery-item:hover img {
    @apply scale-105;
  }
</style>
