<script lang="ts">
  import { ArrowUpRight, Star } from "lucide-svelte";

  import { formatTime } from "$lib/utils";

  type ProjectMeta = {
    title: string;
    date: string;
    repo?: string;
    topics: string[];
    lead: string;
    image?: string;
    image_border?: boolean;
    image_rounded?: boolean;
  };

  export let data: ProjectMeta;
  export let slug: string;
  export let images: Record<string, { default: string }>;
  export let stars: Record<string, number> | null = null;
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
      <span class="read-more">
        Read the full writeup
        <ArrowUpRight size={16} class="inline text-neutral-400" />
      </span>
    </div>
    {#if data.image}
      <div class="col-span-3 md:col-span-1">
        <img
          src={images[`../../projects/${data.image}`]?.default}
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
