import { Link2 } from "lucide-react";
import type { Element } from "hast";
import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/cn";

import { CodeBlock } from "./code-block";

// Shared by the public post page and the admin editor preview, so a draft
// looks exactly like the published post. Raw HTML in the Markdown is not
// rendered, and react-markdown drops unsafe URLs such as javascript:.

const articleClasses =
  "prose-article prose prose-zinc max-w-none dark:prose-invert " +
  "prose-headings:scroll-mt-24 prose-headings:font-semibold prose-headings:tracking-tight " +
  "prose-a:text-teal-700 prose-a:decoration-teal-500/40 prose-a:underline-offset-4 hover:prose-a:decoration-teal-500 dark:prose-a:text-teal-300 " +
  "prose-img:rounded-xl prose-img:border prose-img:border-zinc-200 dark:prose-img:border-zinc-800 " +
  "prose-code:font-mono prose-code:font-normal prose-code:before:content-none prose-code:after:content-none " +
  "prose-blockquote:border-l-teal-500 prose-blockquote:font-normal prose-blockquote:not-italic " +
  "prose-th:text-left";

function codeLanguage(node: Element | undefined): string | undefined {
  const code = node?.children.find((child): child is Element => child.type === "element" && child.tagName === "code");
  const classes = code?.properties.className;
  if (!Array.isArray(classes)) return undefined;
  const language = classes.find((name) => String(name).startsWith("language-"));
  return language ? String(language).slice("language-".length) : undefined;
}

function heading(Tag: "h2" | "h3") {
  return function Heading({ id, children, node, ...props }: ComponentPropsWithoutRef<"h2"> & { node?: Element }) {
    return (
      <Tag id={id} className="group" {...props}>
        {children}
        {id && (
          <a
            href={`#${id}`}
            className="heading-anchor ml-2 inline-flex align-middle text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 dark:text-zinc-600"
            aria-label="Link to this section"
          >
            <Link2 className="size-4" aria-hidden />
          </a>
        )}
      </Tag>
    );
  };
}

const components: Components = {
  h2: heading("h2"),
  h3: heading("h3"),
  pre: ({ node, children }) => <CodeBlock language={codeLanguage(node)}>{children}</CodeBlock>,
  a: ({ node, href, children, ...props }) => {
    const external = href !== undefined && /^https?:\/\//.test(href);
    return (
      <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...props}>
        {children}
      </a>
    );
  },
  // eslint-disable-next-line @next/next/no-img-element
  img: ({ node, src, alt, ...props }) => <img src={src} alt={alt ?? ""} loading="lazy" decoding="async" {...props} />,
};

export function Markdown({ content, className }: { content: string; className?: string }) {
  return (
    <div className={cn(articleClasses, className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, [rehypeHighlight, { detect: false }]]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
