<script lang="ts">
  import { page } from "$app/stores";

  import { SITE_NAME } from "$lib/site";

  const links = [
    { name: "projects", href: "/projects" },
    { name: "writing", href: "/writing" },
    { name: "resume", href: "/resume" },
  ];

  function isActive(href: string, pathname: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  let pageTitle: string | null = null;
  $: {
    const link = links.find(({ href }) => isActive(href, $page.url.pathname));
    if (link) {
      pageTitle = link.name.charAt(0).toUpperCase() + link.name.slice(1);
    } else {
      pageTitle = null;
    }
  }
</script>

<header
  class="layout-md flex justify-between items-start"
  data-sveltekit-noscroll
  data-sveltekit-preload-code="eager"
>
  <h1 class="font-bold text-black text-2xl mb-6">
    <a href="/">{SITE_NAME}</a>
    {#if pageTitle}
      <span class="page-title">
        <span class="text-neutral-400">-</span>
        {pageTitle}
      </span>
    {/if}
  </h1>
  <nav>
    {#each links as link (link)}
      <a
        href={link.href}
        class="hover:text-black transition-colors"
        class:text-black={isActive(link.href, $page.url.pathname)}
      >
        {link.name}
      </a>
    {/each}
  </nav>
</header>

<style lang="postcss">
  nav {
    @apply flex items-start text-neutral-500 justify-end space-x-6 text-lg py-0.5;
  }

  .page-title {
    @apply font-light;
  }

  @media (max-width: 580px) {
    .page-title {
      @apply block text-xl;
    }

    .page-title :first-child {
      @apply hidden;
    }
  }

  @media (max-width: 420px) {
    nav {
      @apply flex-col items-end space-x-0;
    }
  }
</style>
