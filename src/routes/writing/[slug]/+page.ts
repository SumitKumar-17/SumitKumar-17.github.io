import { error } from "@sveltejs/kit";
import { isVisible } from "$lib/utils";
import type { EntryGenerator, PageLoad } from "./$types";

const allPosts = import.meta.glob("../../../writing/*.md", {
  eager: true,
}) as any;
const posts = Object.fromEntries(
  Object.entries(allPosts).filter(([, data]) => isVisible(data as any))
) as any;

function trimName(id: string) {
  return id.match(/\.\.\/\.\.\/\.\.\/writing\/(.*)\.md$/)?.[1];
}

export const prerender = true;

export const entries: EntryGenerator = () => {
  return Object.keys(posts).map((id) => ({ slug: trimName(id) as string }));
};

export const load: PageLoad = ({ params }) => {
  const id = Object.keys(posts).find((id) => trimName(id) === params.slug);
  if (!id) {
    throw error(404, "Post not found");
  }
  return { post: posts[id] };
};
