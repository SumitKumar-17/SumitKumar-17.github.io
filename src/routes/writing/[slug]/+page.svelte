<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import Markdown from "$lib/components/Markdown.svelte";
  import { formatTime } from "$lib/utils";
  import type { PageData } from "./$types";

  export let data: PageData;
  $: post = data.post;
</script>

<Seo title="{post.title} – Sumit Kumar" description={post.lead} />

<section class="layout-md py-12">
  <p class="mb-6">
    <a class="link" href="/writing">← Back to writing</a>
  </p>

  <h1 class="text-black text-3xl font-semibold mb-2">{post.title}</h1>
  <p class="text-neutral-500 mb-8">
    {formatTime("%B %-d, %Y", post.date)}
  </p>

  <Markdown source={post.content} />
</section>
