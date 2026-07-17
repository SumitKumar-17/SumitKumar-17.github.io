<script lang="ts">
  import { ArrowUpRight, Star } from "lucide-svelte";

  import { formatTime } from "$lib/utils";

  type ProjectMeta = {
    title: string;
    date: string;
    content: string;
    repo?: string;
    topics: string[];
    lead: string;
    image?: string;
    image_border?: boolean;
    image_rounded?: boolean;
  };

  export let data: ProjectMeta;
  export let slug: string;
  export let images: Record<string, string>;
  export let stars: Record<string, number> | null = null;

  // A quick plaintext-ish excerpt of the writeup's first paragraph. This
  // whole card is one <a>, so we can't render real Markdown links/HTML here
  // without nesting anchors — just strip the common markdown tokens instead.
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

<a class="teaser group block" href="/projects/{slug}">
  <h3 class="text-black text-xl font-semibold mb-2">
    <span class="mr-1">{data.title}</span>
    <small class="whitespace-nowrap text-neutral-500 text-base font-normal">
      {formatTime("%B %Y", data.date)}
    </small>
  </h3>

  <div class="flex flex-wrap mb-1">
    {#if data.repo}
      <span class="pill">
        <Star size={14} class="fill-current" />
        {#if stars?.[data.repo] !== undefined}
          <span class="ml-1">{stars[data.repo].toLocaleString()}</span>
        {:else}
          <span>&ZeroWidthSpace;</span>
        {/if}
      </span>
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
          class:border={data.image_border}
          class:rounded-md={data.image_rounded}
        />
      </div>
    {/if}
  </div>
</a>

<style lang="postcss">
  .pill {
    @apply flex items-center text-sm font-medium;
    @apply px-1.5 py-[1px] mr-1.5 mb-2 bg-neutral-100 rounded-full;
  }

  .read-more {
    @apply text-black font-medium;
  }

  .teaser:hover .read-more {
    @apply underline;
  }
</style>
