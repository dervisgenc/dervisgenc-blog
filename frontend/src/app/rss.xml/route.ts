import { listAllPosts } from "@/lib/api";
import { site, siteUrl } from "@/lib/config";

export const dynamic = "force-dynamic";

const FEED_SIZE = 30;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const base = siteUrl();
  let posts;
  try {
    posts = (await listAllPosts(1)).slice(0, FEED_SIZE);
  } catch {
    return new Response("Feed temporarily unavailable", { status: 503 });
  }

  const items = posts
    .map((post) => {
      const link = `${base}/posts/${post.slug}`;
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      ${post.published_at ? `<pubDate>${new Date(post.published_at).toUTCString()}</pubDate>` : ""}
      <description>${escapeXml(post.summary)}</description>
      ${post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("")}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${site.title} · ${site.subtitle}`)}</title>
    <link>${base}</link>
    <description>${escapeXml(site.description)}</description>
    <language>en</language>
    <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=600",
    },
  });
}
