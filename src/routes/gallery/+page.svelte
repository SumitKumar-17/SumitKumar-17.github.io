<script lang="ts">
  import { Image } from "lucide-svelte";

  import Seo from "$lib/components/Seo.svelte";
  import Lightbox from "$lib/components/Lightbox.svelte";

  type Photo = { src: string; alt: string };
  type Category = { name: string; photos: Photo[] };

  const categories: Category[] = [
    { name: "Internships", photos: [] },
    { name: "Spring Fest", photos: [] },
    { name: "College Life", photos: [] },
  ];

  let lightboxes: Lightbox[] = [];
</script>

<Seo
  title="Sumit Kumar – Gallery"
  description="Photos from internships, competitive programming, Spring Fest, and college life."
/>

<section class="layout-md pt-12 pb-24">
  <h2 class="heading2">Gallery</h2>

  {#each categories as category, ci}
    <div class="mb-10">
      <h3 class="text-black text-lg font-medium mb-3">{category.name}</h3>

      {#if category.photos.length === 0}
        <div class="empty-state">
          <Image size={22} strokeWidth={1.5} class="mb-2 text-neutral-400" />
          <p>Photos coming soon.</p>
        </div>
      {:else}
        <div class="gallery">
          {#each category.photos as photo, i}
            <button
              type="button"
              class="gallery-item"
              on:click={() => lightboxes[ci]?.open(i)}
            >
              <img src={photo.src} alt={photo.alt} />
            </button>
          {/each}
        </div>
        <Lightbox bind:this={lightboxes[ci]} images={category.photos} />
      {/if}
    </div>
  {/each}
</section>

<style lang="postcss">
  @reference "../../app.css";

  .empty-state {
    @apply flex flex-col items-center justify-center text-neutral-400;
    @apply border border-dashed border-neutral-200 rounded-md py-10;
  }

  .gallery {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  .gallery-item {
    @apply block aspect-[2/1] overflow-hidden rounded-md border border-neutral-200;
    @apply p-0 bg-transparent cursor-pointer text-left w-full;
  }

  .gallery-item img {
    @apply w-full h-full object-cover transition-transform duration-200;
  }

  .gallery-item:hover img {
    @apply scale-105;
  }
</style>
