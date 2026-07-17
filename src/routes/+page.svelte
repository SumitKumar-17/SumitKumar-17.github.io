<script lang="ts">
  import { ArrowUpRight } from "lucide-svelte";

  import Seo from "$lib/components/Seo.svelte";

  const featuredProjects = [
    {
      name: "KeystoneDB",
      href: "/projects#keystonedb",
      desc: "custom relational database engine with its own SQL parser",
    },
    {
      name: "C-Kafka",
      href: "/projects#c-kafka",
      desc: "mini Kafka clone in C exploring zero-copy and mmap I/O",
    },
    {
      name: "KTPSocket",
      href: "/projects#ktpsocket",
      desc: "reliable TCP-like flow control built from scratch over UDP",
    },
    {
      name: "NotebookLM Clone",
      href: "/projects#notebooklm",
      desc: "chat-with-your-PDFs app, survivor of JS dependency hell",
    },
    {
      name: "Mini RISC Processor",
      href: "/projects#mini-risc-processor",
      desc: "pipelined RISC processor in Verilog, run on an FPGA",
    },
    {
      name: "DirScanner",
      href: "/projects#dirscanner",
      desc: "CLI tool that renders a directory tree as Markdown",
    },
  ];
</script>

<Seo
  title="Sumit Kumar"
  description="Fourth-year CS undergrad at IIT Kharagpur. Building systems, databases, compilers, and things I get too invested in."
/>

<p
  class="layout-md text-black text-xl leading-tight font-light mb-16"
  id="sumit-is"
>
  <span class="g">is a</span> student<span class="g">,</span><br />
  systems tinkerer<span class="g">, and</span><br />
  builder<span class="g">.</span>
</p>

<div class="layout-md text-lg space-y-14">
  <div class="space-y-5">
    <p>
      I'm a fourth-year undergrad in <a class="link" href="/resume"
        >Computer Science and Engineering</a
      >
      at the <a class="link" href="https://www.iitkgp.ac.in/">Indian Institute
        of Technology, Kharagpur</a
      >.
    </p>

    <p>
      I like working on <em>systems</em> — databases, compilers, distributed
      systems, and the Linux kernel — and I have a habit of turning ordinary
      course lab assignments into projects I get way too invested in.
    </p>

    <p>
      Towards that goal, I care about understanding how things work from the
      ground up: writing a SQL parser instead of using one, building a mini
      Kafka to understand why the real one is fast, implementing my own
      RISC processor instead of just studying one.
    </p>
  </div>

  <div class="leading-snug space-y-4">
    <p class="pb-2">Notable projects:</p>

    {#each featuredProjects as project}
      <a class="project-pair" href={project.href}>
        <div class="text-black font-medium">
          {project.name}
          <ArrowUpRight size={18} class="inline text-neutral-400" />
        </div>
        <div>
          <p>{project.desc}</p>
        </div>
      </a>
    {/each}
  </div>

  <div class="space-y-5">
    <p>
      I've interned at <a class="link" href="https://paralleldots.com/"
        >ParallelDots</a
      >, and led backend/platform work for <a class="link"
        href="https://springfest.iitkgp.ac.in/">Spring Fest</a
      >, IIT Kharagpur's annual cultural festival, scaling its systems to
      handle 100M+ API requests.
    </p>

    <p>
      Before college, I placed in JEE Advanced, and along the way I've
      contributed patches to <a class="link" href="https://nixos.org/"
        >NixOS</a
      >
      and served as unit leader for our campus's National Service Scheme
      chapter.
    </p>

    <p>Other interests: basketball, and long walks with friends.</p>
  </div>

  <div class="space-y-5">
    <img
      alt="A black-and-white photograph of the Howrah Bridge across the Hooghly river in Kolkata"
      src="/assets/images/kolkata-landscape.png"
    />
  </div>
</div>

<style lang="postcss">
  .g {
    @apply text-neutral-400;
  }

  em {
    @apply font-serif text-[110%] leading-[100%];
  }

  .project-pair {
    @apply grid sm:grid-cols-[1fr,2fr] gap-y-1 -mx-3 px-3 py-2 hover:bg-neutral-100 transition-colors;
  }

  /* Correction for vertical navigation links on mobile. */
  @media (max-width: 420px) {
    #sumit-is {
      @apply -mt-10;
    }
  }
</style>
