import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { name, url } from "../../consts";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const journalEntries = await getCollection("journal");

  const sortedEntries = journalEntries.sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  return rss({
    title: `${name}'s Journal`,
    description: "A collection of thoughts and writings.",
    site: url,
    items: sortedEntries.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/journal/${post.slug}/`,
    })),
    customData: `<language>en-uk</language>`,
  });
}
