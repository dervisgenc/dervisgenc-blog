"use client";

import { Check, Link as LinkIcon, Share2 } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

import { engagement } from "@/lib/browser-api";
import type { ShareChannel } from "@/lib/types";

interface ShareButtonsProps {
  slug: string;
  title: string;
}

type LinkChannel = Exclude<ShareChannel, "copy" | "native">;

const shareLinks: Record<LinkChannel, { label: string; href: (url: string, title: string) => string }> = {
  x: { label: "X", href: (url, title) => `https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}` },
  linkedin: { label: "LinkedIn", href: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
  whatsapp: { label: "WhatsApp", href: (url, title) => `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}` },
  telegram: {
    label: "Telegram",
    href: (url, title) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
};

const subscribeNothing = () => () => {};

const pillClasses =
  "inline-flex h-9 items-center gap-1.5 rounded-full border border-zinc-200 px-3.5 text-sm text-zinc-600 transition-colors hover:border-teal-500/50 hover:text-teal-700 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-teal-400/40 dark:hover:text-teal-300";

export function ShareButtons({ slug, title }: ShareButtonsProps) {
  const isClient = useSyncExternalStore(subscribeNothing, () => true, () => false);
  const [copied, setCopied] = useState(false);

  // The page address and Web Share support are only known in the browser.
  const url = isClient ? window.location.origin + window.location.pathname : "";
  const canNativeShare = isClient && typeof navigator.share === "function";

  const record = (channel: ShareChannel) => {
    engagement.recordShare(slug, channel).catch(() => {
      // Best effort.
    });
  };

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      record("copy");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access denied; nothing else to do.
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, url });
      record("native");
    } catch {
      // The reader closed the share sheet.
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canNativeShare && (
        <button type="button" onClick={nativeShare} className={pillClasses}>
          <Share2 className="size-3.5" aria-hidden /> Share
        </button>
      )}
      {(Object.keys(shareLinks) as LinkChannel[]).map((channel) => (
        <a
          key={channel}
          href={url ? shareLinks[channel].href(url, title) : undefined}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => record(channel)}
          className={pillClasses}
          aria-label={`Share on ${shareLinks[channel].label}`}
        >
          {shareLinks[channel].label}
        </a>
      ))}
      <button type="button" onClick={copyLink} className={pillClasses} aria-label="Copy link to this post">
        {copied ? <Check className="size-3.5" aria-hidden /> : <LinkIcon className="size-3.5" aria-hidden />}
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
