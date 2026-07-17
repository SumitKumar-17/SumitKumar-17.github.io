<script lang="ts">
  import { marked } from "marked";
  import hljs from "highlight.js/lib/core";
  import bash from "highlight.js/lib/languages/bash";
  import c from "highlight.js/lib/languages/c";
  import nginx from "highlight.js/lib/languages/nginx";
  import sql from "highlight.js/lib/languages/sql";
  import "highlight.js/styles/github.css";

  export let source: string;

  hljs.registerLanguage("bash", bash);
  hljs.registerAliases(["sh"], { languageName: "bash" });
  hljs.registerLanguage("c", c);
  hljs.registerLanguage("nginx", nginx);
  hljs.registerLanguage("sql", sql);

  marked.use({
    renderer: {
      link(href: string, title: string | null, text: string) {
        let out = `<a rel="external" href="${encodeURI(href)}" class="link"`;
        if (title) {
          out += ' title="' + title + '"';
        }
        out += ">" + text + "</a>";
        return out;
      },
      code(code: string, infostring: string | undefined) {
        const lang = (infostring || "").trim().split(/\s+/)[0];
        const { value, language } =
          lang && hljs.getLanguage(lang)
            ? {
                value: hljs.highlight(code, { language: lang }).value,
                language: lang,
              }
            : hljs.highlightAuto(code);
        return `<pre><code class="hljs language-${
          language ?? "plaintext"
        }">${value}</code></pre>`;
      },
    },
  });

  $: html = marked.parse(source, {
    smartLists: true,
    smartypants: true,
  });
</script>

<div class="md-output">
  {@html html}
</div>

<style lang="postcss">
  .md-output :global(p) {
    @apply mb-4;
  }

  .md-output :global(strong) {
    @apply font-semibold;
  }

  .md-output :global(code) {
    @apply text-[95%];
  }

  .md-output :global(pre) {
    @apply overflow-x-auto rounded-md my-4 p-4 text-[13px] leading-relaxed;
  }

  .md-output :global(pre code.hljs) {
    @apply bg-transparent p-0;
  }
</style>
