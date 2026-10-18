import { site } from "@/lib/config";

const links = [
  { label: "GitHub", href: site.social.github },
  { label: "LinkedIn", href: site.social.linkedin },
  { label: "X", href: site.social.x },
  { label: "RSS", href: "/rss.xml" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:text-zinc-400">
        <p>
          © {new Date().getFullYear()}{" "}
          <a href={site.aboutUrl} className="hover:text-zinc-900 dark:hover:text-zinc-100">
            {site.author}
          </a>
        </p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
                {...(link.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
