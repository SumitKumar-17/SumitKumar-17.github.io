<script lang="ts">
  import { onMount } from "svelte";
  import { CalendarDays, Star } from "lucide-svelte";

  import Seo from "$lib/components/Seo.svelte";
  import { isVisible } from "$lib/utils";
  import ProjectTeaser from "./ProjectTeaser.svelte";

  const allProjects = import.meta.glob("../../projects/*/index.md", {
    eager: true,
  }) as any;
  const projects = Object.fromEntries(
    Object.entries(allProjects).filter(([, data]) => isVisible(data as any))
  ) as any;
  const rawImages = import.meta.glob("../../projects/*/*.{png,jpg,svg}", {
    eager: true,
  }) as Record<string, { default: string }>;

  // Keyed by bare filename (e.g. "keystonedb.png") so lookups don't depend on
  // how deep the importing route is nested relative to src/projects.
  const images: Record<string, string> = Object.fromEntries(
    Object.entries(rawImages).map(([path, mod]) => [
      path.split("/").pop() as string,
      mod.default,
    ])
  );

  function trimName(id: string) {
    return id.match(/\.\.\/projects\/(.*)\/index\.md$/)?.[1];
  }

  function slugOf(id: string): string {
    return trimName(id) ?? id;
  }

  $: projectsByDate = Object.keys(projects).sort(
    (a, b) =>
      new Date(projects[b].date).getTime() -
      new Date(projects[a].date).getTime()
  );
  $: projectsByTitle = Object.keys(projects).sort((a, b) => {
    const titleA = projects[a].title.toLowerCase();
    const titleB = projects[b].title.toLowerCase();
    return titleA < titleB ? -1 : titleA > titleB ? 1 : 0;
  });

  let stars: Record<string, number> | null = null;
  onMount(async () => {
    const resp = await fetch(
      "https://api.github.com/users/SumitKumar-17/repos?per_page=100"
    );
    const repos = await resp.json();
    stars = {};
    for (const obj of repos) {
      stars[obj.full_name] = obj.stargazers_count;
    }
  });

  $: projectsByStars = [...projectsByTitle].sort((a, b) => {
    const starsA = stars?.[projects[a].repo] ?? 0;
    const starsB = stars?.[projects[b].repo] ?? 0;
    return starsB - starsA;
  });

  let sortOrder: "date" | "stars" = "date";
</script>

<Seo
  title="Sumit Kumar – Projects"
  description="Systems, databases, compilers, GPU/AI infra, and full-stack projects built while studying Computer Science at IIT Kharagpur."
/>

<section class="layout-md py-12">
  <h2 class="heading2">Open Source</h2>

  <p class="text-lg mb-4">
    Most of these started as course lab assignments that I got a little too
    invested in - a database engine, a compiler, a mini Kafka in C - plus a
    handful of side projects I built because I wanted the tool to exist.
  </p>

  <p class="text-lg mb-4">
    I particularly like databases, compilers, systems programming, GPU and AI
    infra, and building small dev tools that scratch a very specific itch.
  </p>

  <p class="text-lg">
    If you find something interesting,
    <a
      class="link"
      href="mailto:sumitkanpur2005@gmail.com?subject=Software%20Projects"
      >let me know</a
    >!
  </p>
</section>

<div class="bg-gray-900 text-neutral-200 dark">
  <section class="layout-md py-12">
    <h2 class="heading2 text-white">Table of Contents</h2>
    <ul class="sm:columns-2">
      {#each projectsByTitle as id (id)}
        <li>
          <a class="link" href="/projects/{trimName(id)}"
            >{projects[id].title}</a
          >
        </li>
      {/each}
    </ul>
  </section>
</div>

<div class="bg-neutral-50 border-b border-neutral-200 py-4">
  <div class="flex justify-center space-x-6">
    <button
      class:active={sortOrder === "date"}
      on:click={() => (sortOrder = "date")}
    >
      <CalendarDays size={18} strokeWidth={1.8} class="mr-1.5" /> by Date
    </button>
    <button
      class:active={sortOrder === "stars"}
      on:click={() => (sortOrder = "stars")}
    >
      <Star size={18} strokeWidth={1.8} class="mr-1.5" /> by Stars
    </button>
  </div>
</div>

{#each sortOrder === "date" ? projectsByDate : projectsByStars as id (id)}
  <section class="py-10">
    <div class="mx-auto max-w-[1152px] px-4 sm:px-6">
      <ProjectTeaser data={projects[id]} slug={slugOf(id)} {images} {stars} />
    </div>
  </section>
{/each}

<style lang="postcss">
  button {
    @apply flex items-center text-neutral-400 transition-colors hover:text-black;
  }

  button.active {
    @apply text-black;
  }
</style>
