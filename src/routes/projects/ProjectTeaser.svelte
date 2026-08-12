<script lang="ts">
  import { ArrowUpRight, ExternalLink, Star } from "lucide-svelte";

  import GithubIcon from "$lib/components/GithubIcon.svelte";
  import { formatTime } from "$lib/utils";

  type ProjectMeta = {
    title: string;
    date: string;
    content: string;
    repo?: string;
    demo?: string;
    topics: string[];
    lead: string;
    image?: string;
  };

  export let data: ProjectMeta;
  export let slug: string;
  export let images: Record<string, string>;
  export let stars: Record<string, number> | null = null;

  // A quick plaintext-ish excerpt of the writeup's first paragraph. This card
  // uses a "stretched link" (an absolutely-positioned <a> covering the whole
  // card) rather than wrapping everything in one <a>, so real markdown links
  // here would still be invalid HTML — strip the common markdown tokens
  // instead.
  function excerptOf(markdown: string): string {
    const firstBlock = markdown.trim().split(/\n\s*\n/)[0] ?? "";
    return firstBlock
      .replace(/^>\s*/gm, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/`([^`]*)`/g, "$1")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .trim();
  }

  $: excerpt = excerptOf(data.content);
</script>

<div class="teaser group relative">
  <!-- Stretched link: makes the whole card clickable while still letting the -->
  <!-- GitHub pill below be its own real, independently-clickable link. -->
  <a
    class="absolute inset-0 z-0"
    href="/projects/{slug}"
    aria-label={data.title}
  ></a>

  <h3 class="text-black text-xl font-semibold mb-2">
    <span class="mr-1">{data.title}</span>
    <small class="whitespace-nowrap text-neutral-500 text-base font-normal">
      {formatTime("%B %Y", data.date)}
    </small>
  </h3>

  <div class="flex flex-wrap mb-1">
    {#if data.repo}
      <a
        class="pill relative z-10 hover:!bg-neutral-200 transition-colors"
        href="https://github.com/{data.repo}"
        target="_blank"
        rel="noreferrer"
      >
        <GithubIcon size={14} />
        <span class="ml-1">GitHub</span>
      </a>
      <span class="pill">
        <Star size={14} class="fill-current" />
        {#if stars?.[data.repo] !== undefined}
          <span class="ml-1">{stars[data.repo].toLocaleString()}</span>
        {:else}
          <span>&ZeroWidthSpace;</span>
        {/if}
      </span>
    {/if}
    {#if data.demo}
      <a
        class="pill pill-accent relative z-10 hover:!bg-neutral-800 transition-colors"
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

  <div class="grid grid-cols-3 gap-4 md:gap-8 lg:gap-12">
    <div class="col-span-3" class:md:col-span-2={data.image}>
      <p class="text-lg font-light mb-2">{data.lead}</p>
      <p class="text-neutral-600 mb-3 line-clamp-3">{excerpt}</p>
      <span class="read-more">
        Read the full writeup
        <ArrowUpRight size={16} class="inline text-neutral-400" />
      </span>
    </div>
    {#if data.image}
      <div class="col-span-3 md:col-span-1">
        <img
          src={images[data.image]}
          alt="{data.title} preview image"
          class="thumb"
        />
      </div>
    {/if}
  </div>
</div>

<style lang="postcss">
  @reference "../../app.css";
  .teaser {
    @apply block -mx-3 px-3 py-2 hover:bg-neutral-100 transition-colors;
  }

  .pill {
    @apply flex items-center text-sm font-medium;
    @apply px-1.5 py-[1px] mr-1.5 mb-2 bg-neutral-100 rounded-full;
  }

  .pill-accent {
    @apply bg-black text-white;
  }

  .thumb {
    @apply w-full rounded-md border border-neutral-200;
  }

  .read-more {
    @apply text-black font-medium;
  }

  .teaser:hover .read-more {
    @apply underline;
  }
</style>
