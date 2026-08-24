<script lang="ts">
  import { onMount } from "svelte";
  import { FileText } from "lucide-svelte";

  import Seo from "$lib/components/Seo.svelte";
  import Workplace from "./Workplace.svelte";

  const cpProfiles = [
    {
      name: "Codeforces",
      handle: "sumitkumar-17",
      href: "https://codeforces.com/profile/sumitkumar-17",
    },
    {
      name: "LeetCode",
      handle: "SumitKumar-17",
      href: "https://leetcode.com/SumitKumar-17",
      rating: "2181 (Guardian)",
    },
    {
      name: "CSES",
      handle: "sumitkumar-17",
      href: "https://cses.fi/user/279033",
    },
    {
      name: "AtCoder",
      handle: "SumitKumar17",
      href: "https://atcoder.jp/users/SumitKumar17",
    },
    {
      name: "CodeChef",
      handle: "sumitkumar173",
      href: "https://www.codechef.com/users/sumitkumar173",
    },
  ];

  let codeforcesRating: number | null = null;
  let codeforcesRank: string | null = null;
  onMount(async () => {
    try {
      const resp = await fetch(
        "https://codeforces.com/api/user.info?handles=sumitkumar-17"
      );
      const data = await resp.json();
      if (data.status === "OK") {
        codeforcesRating = data.result[0].rating ?? null;
        codeforcesRank = data.result[0].rank ?? null;
      }
    } catch {
      // Codeforces API unreachable - the plain profile link below still works.
    }
  });
</script>

<Seo
  title="Sumit Kumar – Resume"
  description="Final-year CS undergrad at IIT Kharagpur. Building systems, databases, compilers, and things I get too invested in."
/>

<section class="layout-md pt-12">
  <a
    class="resume-btn"
    rel="external"
    target="_blank"
    href="/assets/pdf/resume/Resume_Sumit_Kumar_IITKGP.pdf"
  >
    <FileText size={18} strokeWidth={1.8} />
    View Resume (PDF)
  </a>

  <p class="mt-4 text-neutral-500">
    <a class="link" href="mailto:sumitkanpur2005@gmail.com"
      >sumitkanpur2005@gmail.com</a
    >
    <span class="px-1.5">·</span>
    <a class="link" href="tel:+917376910003">+91-7376910003</a>
  </p>
</section>

<section class="layout-md py-12">
  <h2 class="heading2">Experience</h2>

  <Workplace
    title="Software Engineer Intern"
    company="Atlassian"
    url="https://www.atlassian.com/"
    dates="May 2026 – July 2026"
    location="Bengaluru, India"
  >
    <li>
      Shipped <b>Bulk Archive</b> and <b>Bulk Delete Teams</b> across all Atlassian
      orgs via
      <a
        class="link"
        href="https://developer.atlassian.com/platform/teams/graphql/#mutations_bulkDeleteTeams"
        target="_blank"
        rel="noreferrer">GraphQL mutation APIs</a
      > and custom frontend dialogs.      
    </li>
    <li>
      Replaced a 3-4s manual deletion flow with a single API call using
      hierarchical async deletion built on <b>AWS SQS</b> and <b>DynamoDB</b>.
    </li>
    <li>
      Proposed a fix for notification spam in the Bulk Archive/Delete flows and
      validated it via <b>Splunk</b> logs across staging and production.
    </li>
    <li>
      Instrumented API latency, failure, and counter metrics with
      <b>SignalFx</b> dashboards and <b>Terraform</b>-managed alert rules.
    </li>
  </Workplace>

  <Workplace
    title="Backend Engineer Intern"
    company="Steps AI"
    url="https://stepsai.co/"
    dates="June 2025 – Present"
  >
    <li>
      Engineered async Python microservices with <b>FastAPI</b> and
      <b>Pydantic</b>, serving agent, copilot, voice, and FAQ APIs.
    </li>
    <li>
      Orchestrated <b>LangGraph</b> and <b>LangChain</b> agents with streaming,
      checkpointing, and <b>Milvus</b>/<b>Cohere</b>-backed retrieval.
    </li>
    <li>
      Built a DAG-based workflow platform on <b>PostgreSQL</b>/<b>Redis</b>
      with retries, conditional steps, and connector actions.
    </li>
    <li>
      Automated Shopify/WooCommerce product sync and embedding ingestion via
      <b>Temporal</b> workflows across <b>S3</b> and <b>Milvus</b>.
    </li>
    <li>
      Deployed services with <b>Docker</b> and <b>ArgoCD</b> GitOps pipelines,
      adding <b>Sentry</b>/<b>OpenTelemetry</b> tracing and secure OAuth token
      refresh.
    </li>
  </Workplace>

  <Workplace
    title="Software Engineer Intern"
    company="QFI Research Capital"
    url="https://qficapital.in/"
    dates="October 2025 – December 2025"
  >
    <li>
      Built a library of <b>20+ algorithmic strategies</b> (EMA/VWAP
      crossovers, mean reversion, momentum, options-volatility) for the
      trading engine.
    </li>
    <li>
      Implemented the <b>Bajaj Broking</b> client from scratch, covering
      order placement, modification, holdings, and positions via their
      BridgeLink REST API, and extended the platform's broker abstraction
      alongside <b>Kite Connect</b> and <b>Nubra</b>.
    </li>
    <li>
      Built options-analytics screens computing per-strike Greeks (delta,
      gamma, theta, vega, rho) and IV/VIX time series, plus the trading
      dashboard, charts, and watchlist in <b>React 19</b>/TypeScript.
    </li>
    <li>
      Designed the real-time market-data pipeline, streaming ticks over
      WebSocket into <b>Kafka</b> and aggregating them into <b>InfluxDB</b>
      with <b>Redis</b>-cached prices, backing the platform's live charts
      and strategy signals.
    </li>
  </Workplace>

  <Workplace
    title="System Architecture and Platform Design"
    company="Spring Fest, IIT Kharagpur"
    url="https://www.instagram.com/iitkgp.springfest/?hl=en"
    dates="July 2024 – April 2025"
    location="Kharagpur, India"
  >
    <li>
      Scaled backend for <b>100M+ API requests</b> by deploying with
      <b>Nginx</b> and <b>Redis caching</b> across 4 AWS EC2 t3.large instances.
    </li>
    <li>
      Handled <b>80L+ transactions</b> by integrating the PhonePe API, with authentication
      via JWT and OAuth2 and rate-limited endpoints.
    </li>
    <li>
      Delivered <b>99.8% OTP/email delivery</b> using MSG91, a mailer, async retry
      queues, and CloudWatch monitoring.
    </li>
    <li>
      Shipped a React Native app on the Play Store (1K+ downloads) with backend
      integration for event access and admin tools.
    </li>
  </Workplace>

  <Workplace
    title="Frontend Engineer Intern"
    company="Autonmis"
    url="https://autonmis.com/"
    dates="October 2024 – November 2024"
  >
    <li>
      Built frontend features for Autonmis's AI-native operations platform,
      which auto-builds dashboards, KPIs, and exception alerts from
      plain-language input.
    </li>
    <li>
      Built an in-browser SQL editor using <b>Monaco Editor</b> for querying
      and exploring connected data sources.
    </li>
    <li>
      Built an open connector library enabling database connections across
      multiple engines (Postgres, Snowflake, Salesforce, Google Sheets, S3)
      for a unified data layer.
    </li>
    <li>
      Wired those connectors into the platform's backend reconciliation and
      exception-detection workflows.
    </li>
  </Workplace>

  <Workplace
    title="Software Developer Intern"
    company="ParallelDots"
    url="https://paralleldots.com/"
    dates="December 2024 – January 2025"
  >
    <li>
      Improved Android render speed by 25% and cut cold start by ~3.2s via
      ViewModel, lazy loading, and UI refactors.
    </li>
    <li>
      Reduced upload failures by ~20% using S3 for resumable uploads with
      Cognito-secured access and retry logic.
    </li>
    <li>
      Cut invalid scans by ~18% using a SQLite-backed local queue with
      WorkManager sync triggered by network connectivity.
    </li>
    <li>
      Lowered API load by ~10% by caching task history, enabling instant access
      and reducing backend calls after reconnect.
    </li>
  </Workplace>
</section>

<section class="layout-md py-12">
  <h2 class="heading2">Education</h2>

  <div class="mb-4">
    <div class="flex justify-between items-end">
      <h3 class="text-black text-lg">
        Indian Institute of Technology, Kharagpur
      </h3>
      <div class="text-neutral-500 mb-0.5">2022 - Present</div>
    </div>
    <p class="byline">
      5-year Dual Degree (B.Tech + M.Tech) in Computer Science and Engineering -
      CGPA 8.82/10
    </p>
  </div>

  <div class="mb-4">
    <div class="flex justify-between items-end">
      <h3 class="text-black text-lg">Delhi Public School, Kalyanpur</h3>
      <div class="text-neutral-500 mb-0.5">2020 - 2022</div>
    </div>
    <p class="byline">Class XII (CBSE), 94.2% - Class X (CBSE), 96.6%</p>
  </div>

  <h4 class="font-medium mt-4 mb-1">Core CS & Systems:</h4>
  <ul>
    <li>Programming and Data Structures</li>
    <li>Discrete Structures</li>
    <li>Algorithms I & II</li>
    <li>Computer Organization and Architecture</li>
    <li>High Performance Computer Architecture</li>
    <li>Compilers</li>
    <li>Formal Language and Automata Theory</li>
    <li>Switching Circuits and Logic Design</li>
    <li>Software Engineering</li>
    <li>Operating Systems</li>
    <li>Computer Networks</li>
    <li>Database Management Systems</li>
    <li>Foundations of Cryptography</li>
  </ul>

  <h4 class="font-medium mt-4 mb-1">AI, ML & Data:</h4>
  <ul>
    <li>Data Analytics</li>
    <li>Machine Learning</li>
    <li>Statistical Learning Theory</li>
    <li>Information Retrieval</li>
    <li>AI and Ethics</li>
    <li>Application of Machine Learning in Biological Systems</li>
    <li>Ubiquitous Computing</li>
  </ul>

  <h4 class="font-medium mt-4 mb-1">Mathematics & Science:</h4>
  <ul>
    <li>Advanced Calculus</li>
    <li>Linear Algebra, Numerical and Complex Analysis</li>
    <li>Probability & Statistics</li>
    <li>Signals and Systems</li>
    <li>Basic Electronics</li>
    <li>Physics of Waves</li>
    <li>Chemistry</li>
    <li>Basic Engineering Mechanics</li>
    <li>Electrical Technology</li>
    <li>Environmental Science</li>
    <li>Science of Living Systems</li>
  </ul>

  <h4 class="font-medium mt-4 mb-1">Business, Humanities & Design:</h4>
  <ul>
    <li>English for Communication</li>
    <li>German</li>
    <li>Introduction to Innovation and Entrepreneurship</li>
    <li>Entrepreneurship Essentials</li>
    <li>Small Business Development</li>
    <li>Technopreneurial Marketing</li>
    <li>Positive Psychology</li>
    <li>Engineering Drawing and Computer Graphics</li>
  </ul>
</section>

<section class="layout-md py-12">
  <h2 class="heading2">Skills</h2>

  <div class="mb-4">
    <h3 class="font-medium mb-1">Languages:</h3>
    <p>
      C/C++, Rust, Go, Elixir, Python, TypeScript, JavaScript, Bash, Awk,
      Verilog, SQL
    </p>
  </div>

  <div class="mb-4">
    <h3 class="font-medium mb-1">Libraries and Frameworks:</h3>
    <p>
      React, Next.js, React Native, Node.js, Express, Pandas, NumPy, GraphQL,
      Prisma, Django, Flask
    </p>
  </div>

  <div class="mb-4">
    <h3 class="font-medium mb-1">Tools and Platforms:</h3>
    <p>
      Docker, Kubernetes, Redis, MongoDB, Postgres, AWS, Azure, Git, Databricks,
      Linux Kernel, Raspberry Pi
    </p>
  </div>
</section>

<section class="layout-md py-12">
  <h2 class="heading2">Competitive Programming</h2>

  <ul class="cp-list">
    {#each cpProfiles as profile}
      <li>
        <a class="link" href={profile.href} target="_blank" rel="noreferrer">
          {profile.name}
        </a>
        <span class="text-neutral-500"> - {profile.handle}</span>
        {#if profile.name === "Codeforces" && codeforcesRating !== null}
          <span class="cf-rating">
            {codeforcesRating}{codeforcesRank ? ` (${codeforcesRank})` : ""}
          </span>
        {:else if profile.rating}
          <span class="cf-rating">{profile.rating}</span>
        {/if}
      </li>
    {/each}
  </ul>
</section>

<section class="layout-md py-12">
  <h2 class="heading2">Awards and Honors</h2>

  <ul>
    <li>
      Secured <b>AIR 2038</b> in JEE Advanced, <b>AIR 1870</b> in JEE Mains
      (1.2M candidates), and <b>AIR 83</b> in WBJEE, 2022.
    </li>
    <li>
      Contributed to open-source orgs <b>NixOS</b>, <b>Stripe</b>,
      <b>Supabase</b>, <b>Ubicloud</b>, and <b>PeerDB</b>.
    </li>
    <li>
      Served as Unit Leader for NSS Unit-4, coordinating activities and
      receiving the <b>Best Volunteer Award</b>.
    </li>
  </ul>
</section>

<style lang="postcss">
  @reference "../../app.css";
  b {
    @apply font-medium;
  }

  ul {
    @apply list-disc pl-7 marker:text-neutral-400;
  }

  .cp-list li {
    @apply mb-1.5;
  }

  .cf-rating {
    @apply ml-2 text-sm font-medium text-black bg-neutral-100 rounded-full px-2 py-0.5;
  }

  .byline {
    @apply font-serif italic;
  }

  .resume-btn {
    @apply inline-flex items-center gap-2 text-base font-medium text-black;
    @apply border border-neutral-300 rounded-full px-4 py-2;
    @apply hover:bg-neutral-100 hover:border-neutral-400 transition-colors;
  }
</style>
