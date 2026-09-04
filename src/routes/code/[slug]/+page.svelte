<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import Markdown from "$lib/components/Markdown.svelte";
  import type { PageData } from "./$types";

  export let data: PageData;
  $: content = "```go\n" + data.source + "\n```";
</script>

<Seo title="{data.filename} – Sumit Kumar" description="Source: {data.filename}" />

<section class="layout-md py-12">
  <p class="mb-6">
    <a class="link" href="/writing">← Back to writing</a>
  </p>

  <h1 class="text-black text-2xl font-semibold mb-8 font-mono">
    {data.filename}
  </h1>

  <Markdown source={content} />
</section>
