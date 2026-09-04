import { error } from "@sveltejs/kit";
import type { EntryGenerator, PageLoad } from "./$types";

const allCode = import.meta.glob("../../../code/*.go", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

function trimName(id: string) {
  return id.match(/\.\.\/\.\.\/\.\.\/code\/(.*)\.go$/)?.[1];
}

export const prerender = true;

export const entries: EntryGenerator = () => {
  return Object.keys(allCode).map((id) => ({ slug: trimName(id) as string }));
};

export const load: PageLoad = ({ params }) => {
  const id = Object.keys(allCode).find((id) => trimName(id) === params.slug);
  if (!id) {
    throw error(404, "Code not found");
  }
  return { filename: `${params.slug}.go`, source: allCode[id] };
};
