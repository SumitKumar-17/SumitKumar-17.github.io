<script lang="ts">
  import { ArrowUpRight } from "lucide-svelte";

  import { formatTime } from "$lib/utils";

  type Post = {
    title: string;
    date: string;
    lead: string;
  };

  export let title: string;
  export let posts: { slug: string; data: Post }[];
</script>

<section class="layout-md py-12">
  <h2 class="heading2">{title}</h2>

  <div class="grid gap-y-4">
    {#each posts as post (post.slug)}
      <a
        href="/writing/{post.slug}"
        class="block -mx-3 px-3 py-2 hover:bg-neutral-100 transition-colors"
      >
        <div class="flex flex-col sm:flex-row sm:items-end mb-1.5">
          <div class="text-lg text-black">
            {post.data.title}
            <ArrowUpRight size={18} class="inline text-neutral-400" />
          </div>
          <div class="sm:ml-auto mb-0.5 text-neutral-500">
            {formatTime("%B %-d, %Y", post.data.date)}
          </div>
        </div>
        <div class="text-lg leading-snug font-serif italic">
          {post.data.lead}
        </div>
      </a>
    {/each}
  </div>
</section>
