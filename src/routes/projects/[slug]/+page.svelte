<script lang="ts">
  import { onMount } from "svelte";

  import Seo from "$lib/components/Seo.svelte";
  import Project from "../Project.svelte";
  import type { PageData } from "./$types";

  export let data: PageData;
  $: project = data.project;

  const rawImages = import.meta.glob("../../../projects/*/*.{png,jpg,svg}", {
    eager: true,
  }) as Record<string, { default: string }>;

  // Keyed by bare filename so it matches Project.svelte's lookup regardless
  // of how deep this route is nested relative to src/projects.
  const images: Record<string, string> = Object.fromEntries(
    Object.entries(rawImages).map(([path, mod]) => [
      path.split("/").pop() as string,
      mod.default,
    ])
  );

  let stars: Record<string, number> | null = null;
  onMount(async () => {
    const resp = await fetch(
      "https://api.github.com/users/SumitKumar-17/repos?per_page=100"
    );
    const repos = await resp.json();
    const map: Record<string, number> = {};
    for (const obj of repos) {
      map[obj.full_name] = obj.stargazers_count;
    }
    stars = map;
  });
</script>

<Seo title="{project.title} – Sumit Kumar" description={project.lead} />

<section class="layout-md py-12">
  <p class="mb-6">
    <a class="link" href="/projects">← Back to projects</a>
  </p>

  <Project data={project} {images} {stars} />
</section>
