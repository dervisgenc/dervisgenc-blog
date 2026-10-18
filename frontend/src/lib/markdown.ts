import GithubSlugger from "github-slugger";

const WORDS_PER_MINUTE = 220;

export function countWords(markdown: string): number {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/[#>*_`~[\]()-]/g, " ");
  return text.split(/\s+/).filter(Boolean).length;
}

export function readingMinutes(markdown: string): number {
  return Math.max(1, Math.round(countWords(markdown) / WORDS_PER_MINUTE));
}

export interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * Extracts level 2 and 3 headings for the table of contents. Ids are
 * generated with the same slugger rehype-slug uses, so links match the
 * rendered anchors.
 */
export function extractHeadings(markdown: string): Heading[] {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  let inFence = false;

  for (const line of markdown.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    if (inFence) continue;

    const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    const level = match[1]!.length;
    const text = plainText(match[2]!);
    // Every heading advances the slugger so duplicate ids stay in sync.
    const id = slugger.slug(text);
    if (level === 2 || level === 3) headings.push({ id, text, level });
  }
  return headings;
}

function plainText(inline: string): string {
  return inline
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`~]/g, "")
    .trim();
}
