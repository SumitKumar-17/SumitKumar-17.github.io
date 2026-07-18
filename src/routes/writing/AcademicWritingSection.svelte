<script lang="ts">
  import { ArrowUpRight, FileText } from "lucide-svelte";

  import { formatTime } from "$lib/utils";

  type Entry = {
    title: string;
    date?: string;
    subtitle?: string;
    presentationUrl?: string;
    reportUrl?: string;
  };

  export let title: string;
  export let entries: { slug: string; data: Entry }[];
</script>

<section class="layout-md py-12">
  <h2 class="heading2">{title}</h2>

  <div class="grid gap-y-4">
    {#each entries as entry (entry.slug)}
      <div class="-mx-3 px-3 py-2">
        <div class="flex flex-col sm:flex-row sm:items-end">
          <div class="text-lg text-black">{entry.data.title}</div>
          {#if entry.data.date}
            <div class="sm:ml-auto mb-0.5 text-neutral-500">
              {formatTime("%B %Y", entry.data.date)}
            </div>
          {/if}
        </div>
        {#if entry.data.subtitle}
          <div class="text-neutral-500 mb-1.5">{entry.data.subtitle}</div>
        {/if}
        <div class="flex flex-wrap gap-x-4 gap-y-1">
          {#if entry.data.presentationUrl}
            <a
              class="link inline-flex items-center gap-1"
              href={entry.data.presentationUrl}
              target="_blank"
              rel="noreferrer"
            >
              Presentation
              <ArrowUpRight size={16} class="text-neutral-400" />
            </a>
          {/if}
          {#if entry.data.reportUrl}
            <a
              class="link inline-flex items-center gap-1"
              href={entry.data.reportUrl}
              target="_blank"
              rel="noreferrer"
            >
              <FileText size={16} class="text-neutral-400" />
              Report (PDF)
            </a>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</section>
