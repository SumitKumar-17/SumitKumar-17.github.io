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
      table(header: string, body: string) {
        return `<div class="table-wrap"><table><thead>${header}</thead><tbody>${body}</tbody></table></div>`;
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

  .md-output :global(.table-wrap) {
    @apply overflow-x-auto my-4 rounded-md border border-neutral-200;
  }

  .md-output :global(table) {
    @apply w-full text-sm border-collapse;
  }

  .md-output :global(th),
  .md-output :global(td) {
    @apply px-3 py-2 border-b border-neutral-200 text-left align-top;
  }

  .md-output :global(th) {
    @apply bg-neutral-50 font-semibold text-black whitespace-nowrap;
  }

  .md-output :global(tr:last-child td) {
    @apply border-b-0;
  }
</style>
