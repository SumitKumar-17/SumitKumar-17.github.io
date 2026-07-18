<script lang="ts">
  import Seo from "$lib/components/Seo.svelte";
  import AcademicWritingSection from "./AcademicWritingSection.svelte";
  import BlogSection from "./BlogSection.svelte";

  const rawPosts = import.meta.glob("../../writing/*.md", {
    eager: true,
  }) as Record<string, any>;

  function slugOf(id: string): string {
    return id.match(/\.\.\/\.\.\/writing\/(.*)\.md$/)?.[1] as string;
  }

  const postsByDate = Object.entries(rawPosts)
    .map(([id, data]) => ({ slug: slugOf(id), data }))
    .sort(
      (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
    );

  // Group posts by their frontmatter `topic` into ordered sections. Topics
  // are ordered by when they first appear in date-sorted order, so the
  // busiest/most-recent topic naturally leads. Adding a new topic is just a
  // matter of tagging posts with it — no code change needed here.
  const topicOrder: string[] = [];
  const postsByTopic: Record<string, typeof postsByDate> = {};
  for (const post of postsByDate) {
    const topic = post.data.topic ?? "Technology";
    if (!postsByTopic[topic]) {
      topicOrder.push(topic);
      postsByTopic[topic] = [];
    }
    postsByTopic[topic].push(post);
  }

  const rawAcademicWriting = import.meta.glob("../../academic-writing/*.md", {
    eager: true,
  }) as Record<string, any>;

  function academicSlugOf(id: string): string {
    return id.match(/\.\.\/\.\.\/academic-writing\/(.*)\.md$/)?.[1] as string;
  }

  const academicWriting = Object.entries(rawAcademicWriting)
    .map(([id, data]) => ({ slug: academicSlugOf(id), data }))
    .sort(
      (a, b) =>
        new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
    );
</script>

<Seo
  title="Sumit Kumar – Writing"
  description="Notes, tutorials, and academic writing on databases, deployment, and everything else I get nerd-sniped by."
/>

{#each topicOrder as topic}
  <BlogSection title={topic} posts={postsByTopic[topic]} />
{/each}

<AcademicWritingSection title="Academic Writing" entries={academicWriting} />
