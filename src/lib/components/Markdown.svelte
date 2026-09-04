<script lang="ts">
  import { marked, type Tokens } from "marked";
  import hljs from "highlight.js/lib/core";
  import bash from "highlight.js/lib/languages/bash";
  import c from "highlight.js/lib/languages/c";
  import cpp from "highlight.js/lib/languages/cpp";
  import csharp from "highlight.js/lib/languages/csharp";
  import css from "highlight.js/lib/languages/css";
  import dockerfile from "highlight.js/lib/languages/dockerfile";
  import go from "highlight.js/lib/languages/go";
  import java from "highlight.js/lib/languages/java";
  import javascript from "highlight.js/lib/languages/javascript";
  import json from "highlight.js/lib/languages/json";
  import nginx from "highlight.js/lib/languages/nginx";
  import python from "highlight.js/lib/languages/python";
  import rust from "highlight.js/lib/languages/rust";
  import sql from "highlight.js/lib/languages/sql";
  import typescript from "highlight.js/lib/languages/typescript";
  import xml from "highlight.js/lib/languages/xml";
  import yaml from "highlight.js/lib/languages/yaml";
  import "highlight.js/styles/github.css";

  export let source: string;

  hljs.registerLanguage("bash", bash);
  hljs.registerAliases(["sh", "shell", "zsh"], { languageName: "bash" });
  hljs.registerLanguage("c", c);
  hljs.registerLanguage("cpp", cpp);
  hljs.registerAliases(["c++"], { languageName: "cpp" });
  hljs.registerLanguage("csharp", csharp);
  hljs.registerAliases(["cs"], { languageName: "csharp" });
  hljs.registerLanguage("css", css);
  hljs.registerLanguage("dockerfile", dockerfile);
  hljs.registerAliases(["docker"], { languageName: "dockerfile" });
  hljs.registerLanguage("go", go);
  hljs.registerAliases(["golang"], { languageName: "go" });
  hljs.registerLanguage("java", java);
  hljs.registerLanguage("javascript", javascript);
  hljs.registerAliases(["js", "jsx"], { languageName: "javascript" });
  hljs.registerLanguage("json", json);
  hljs.registerLanguage("nginx", nginx);
  hljs.registerLanguage("python", python);
  hljs.registerAliases(["py"], { languageName: "python" });
  hljs.registerLanguage("rust", rust);
  hljs.registerAliases(["rs"], { languageName: "rust" });
  hljs.registerLanguage("sql", sql);
  hljs.registerLanguage("typescript", typescript);
  hljs.registerAliases(["ts", "tsx"], { languageName: "typescript" });
  hljs.registerLanguage("xml", xml);
  hljs.registerAliases(["html"], { languageName: "xml" });
  hljs.registerLanguage("yaml", yaml);
  hljs.registerAliases(["yml"], { languageName: "yaml" });

  // Plain object, not a class: marked's `use()` merges renderer overrides via
  // `for...in`, which only sees enumerable properties. ES6 class methods are
  // non-enumerable, so a class-based renderer here would silently no-op.
  marked.use({
    renderer: {
      link({ href, title, text }: Tokens.Link) {
        let out = `<a rel="external" href="${encodeURI(href)}" class="link"`;
        if (title) {
          out += ' title="' + title + '"';
        }
        out += ">" + text + "</a>";
        return out;
      },
      code({ text, lang }: Tokens.Code) {
        const language = (lang || "").trim().split(/\s+/)[0];
        const { value, language: resolved } =
          language && hljs.getLanguage(language)
            ? { value: hljs.highlight(text, { language }).value, language }
            : hljs.highlightAuto(text);
        return `<pre><code class="hljs language-${
          resolved ?? "plaintext"
        }">${value}</code></pre>`;
      },
    },
  });

  // Wrapping <table> in a scrollable container isn't worth fighting marked's
  // renderer-merge quirks over — a simple post-process is more robust here.
  $: html = (marked.parse(source) as string).replace(
    /<table>[\s\S]*?<\/table>/g,
    (match) => `<div class="table-wrap">${match}</div>`
  );
</script>

<div class="md-output">
  {@html html}
</div>

<style lang="postcss">
  @reference "../../app.css";
  .md-output :global(p) {
    @apply mb-4 leading-relaxed;
  }

  .md-output :global(strong) {
    @apply font-semibold;
  }

  .md-output :global(code) {
    @apply text-[95%];
  }

  .md-output :global(h1),
  .md-output :global(h2) {
    @apply text-black text-xl font-semibold mt-10 mb-3;
  }

  .md-output :global(h3) {
    @apply text-black text-lg font-semibold mt-8 mb-2;
  }

  .md-output :global(h4) {
    @apply text-black text-base font-semibold mt-6 mb-2;
  }

  .md-output :global(ul),
  .md-output :global(ol) {
    @apply mb-4 pl-6;
  }

  .md-output :global(ul) {
    @apply list-disc;
  }

  .md-output :global(ol) {
    @apply list-decimal;
  }

  .md-output :global(li) {
    @apply mb-1.5 leading-relaxed;
  }

  .md-output :global(li p) {
    @apply mb-1;
  }

  .md-output :global(blockquote) {
    @apply border-l-2 border-neutral-300 pl-4 my-4 italic text-neutral-600;
  }

  .md-output :global(blockquote p) {
    @apply mb-0;
  }

  .md-output :global(hr) {
    @apply my-8 border-neutral-200;
  }

  .md-output :global(img) {
    @apply rounded-md my-4;
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

  .md-output :global(.video-embed) {
    @apply relative w-full my-6 rounded-md overflow-hidden;
    aspect-ratio: 16 / 9;
  }

  .md-output :global(.video-embed iframe) {
    @apply absolute inset-0 w-full h-full border-0;
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
