<script lang="ts">
  import { FileText } from "lucide-svelte";

  import Seo from "$lib/components/Seo.svelte";
  import Workplace from "./Workplace.svelte";
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
    href="/assets/pdf/Resume_Sumit_Kumar_IITKGP.pdf"
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
    title="System Architecture and Platform Design"
    company="Spring Fest, IIT Kharagpur"
    url="https://springfest.iitkgp.ac.in/"
    dates="July 2024 – April 2025"
    location="Kharagpur, India"
  >
    <li>
      Scaled backend for <b>100M+ API requests</b> by deploying with
      <b>Nginx</b> and <b>Redis caching</b> across 4 AWS EC2 t3.large
      instances.
    </li>
    <li>
      Handled <b>80L+ transactions</b> by integrating the PhonePe API, with
      authentication via JWT and OAuth2 and rate-limited endpoints.
    </li>
    <li>
      Delivered <b>99.8% OTP/email delivery</b> using MSG91, a mailer, async
      retry queues, and CloudWatch monitoring.
    </li>
    <li>
      Shipped a React Native app on the Play Store (1K+ downloads) with
      backend integration for event access and admin tools.
    </li>
  </Workplace>

  <Workplace
    title="Software Developer Intern"
    company="ParallelDots"
    url="https://paralleldots.com/"
    dates="December 2024 – January 2025"
    location="Remote"
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
      Lowered API load by ~10% by caching task history, enabling instant
      access and reducing backend calls after reconnect.
    </li>
  </Workplace>
</section>

<section class="layout-md py-12">
  <h2 class="heading2">Education</h2>

  <div class="mb-4">
    <div class="flex justify-between items-end">
      <h3 class="text-black text-lg">Indian Institute of Technology, Kharagpur</h3>
      <div class="text-neutral-500 mb-0.5">2022 — Present</div>
    </div>
    <p class="byline">
      5-year Dual Degree (B.Tech + M.Tech) in Computer Science and Engineering
      — CGPA 8.73/10
    </p>
  </div>

  <div class="mb-4">
    <div class="flex justify-between items-end">
      <h3 class="text-black text-lg">Delhi Public School, Kalyanpur</h3>
      <div class="text-neutral-500 mb-0.5">2020 — 2022</div>
    </div>
    <p class="byline">Class XII (CBSE), 94.2% — Class X (CBSE), 96.6%</p>
  </div>

  <h4 class="font-medium mt-4 mb-1">Computer Science:</h4>
  <ul>
    <li>Programming and Data Structures</li>
    <li>Algorithm-I</li>
    <li>Software Engineering</li>
    <li>Computer Organization and Architecture</li>
    <li>Compilers</li>
    <li>Database Management Systems</li>
    <li>Operating Systems</li>
    <li>Computer Networks</li>
  </ul>

  <h4 class="font-medium mt-4 mb-1">Mathematics:</h4>
  <ul>
    <li>Advanced Calculus</li>
    <li>Linear Algebra and Numerical and Complex Analysis</li>
    <li>Probability & Statistics</li>
    <li>Discrete Structures</li>
    <li>Formal Language and Automata Theory</li>
  </ul>

  <h4 class="font-medium mt-4 mb-1">More Courses:</h4>
  <ul>
    <li>Basic Electronics</li>
    <li>Switching Circuits and Logic Design</li>
    <li>Machine Learning</li>
    <li>Data Analytics</li>
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
      Docker, Kubernetes, Redis, MongoDB, Postgres, AWS, Azure, Git,
      Databricks, Linux Kernel, Raspberry Pi
    </p>
  </div>
</section>

<section class="layout-md py-12">
  <h2 class="heading2">Awards and Honors</h2>

  <ul>
    <li>
      Secured <b>AIR 2038</b> in JEE Advanced and <b>AIR 1870</b> in JEE Mains
      (1.2M candidates), 2022.
    </li>
    <li>
      Contributed to the <b>NixOS</b> open-source project, writing patches,
      refining Nix expressions, and improving system builds.
    </li>
    <li>
      Served as Unit Leader for NSS Unit-4, coordinating activities and
      receiving the <b>Best Volunteer Award</b>.
    </li>
  </ul>
</section>

<style lang="postcss">
  b {
    @apply font-medium;
  }

  ul {
    @apply list-disc pl-7 marker:text-neutral-400;
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
