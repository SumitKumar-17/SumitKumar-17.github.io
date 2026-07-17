<script lang="ts">
  import { ArrowUpRight } from "lucide-svelte";

  import Seo from "$lib/components/Seo.svelte";
  import { formatTime } from "$lib/utils";

  const posts = import.meta.glob("../../writing/*.md", {
    eager: true,
  }) as any;

  function trimName(id: string) {
    return id.match(/\.\.\/\.\.\/writing\/(.*)\.md$/)?.[1];
  }

  const postsByDate = Object.keys(posts).sort(
    (a, b) => posts[b].date - posts[a].date
  );
</script>

<Seo
  title="Sumit Kumar – Writing"
  description="Notes, tutorials, and technical writing on databases, deployment, and everything else I get nerd-sniped by."
/>

<section class="layout-md py-12">
  <h2 class="heading2">Writing</h2>

  <div class="grid gap-y-4">
    {#each postsByDate as id (id)}
      <a
        href="/writing/{trimName(id)}"
        class="block -mx-3 px-3 py-2 hover:bg-neutral-100 transition-colors"
      >
        <div class="flex flex-col sm:flex-row sm:items-end mb-1.5">
          <div class="text-lg text-black">
            {posts[id].title}
            <ArrowUpRight size={18} class="inline text-neutral-400" />
          </div>
          <div class="sm:ml-auto mb-0.5 text-neutral-500">
            {formatTime("%B %-d, %Y", posts[id].date)}
          </div>
        </div>
        <div class="text-lg leading-snug font-serif italic">
          {posts[id].lead}
        </div>
      </a>
    {/each}
  </div>
</section>
