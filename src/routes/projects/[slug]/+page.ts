import { error } from "@sveltejs/kit";
import { isVisible } from "$lib/utils";
import type { EntryGenerator, PageLoad } from "./$types";

const allProjects = import.meta.glob("../../../projects/*/index.md", {
  eager: true,
}) as any;
const projects = Object.fromEntries(
  Object.entries(allProjects).filter(([, data]) => isVisible(data as any))
) as any;

function trimName(id: string) {
  return id.match(/\.\.\/\.\.\/\.\.\/projects\/(.*)\/index\.md$/)?.[1];
}

export const prerender = true;

export const entries: EntryGenerator = () => {
  return Object.keys(projects).map((id) => ({ slug: trimName(id) as string }));
};

export const load: PageLoad = ({ params }) => {
  const id = Object.keys(projects).find((id) => trimName(id) === params.slug);
  if (!id) {
    throw error(404, "Project not found");
  }
  return { project: projects[id] };
};
