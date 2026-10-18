import { cn } from "@/lib/cn";

interface CoverImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

/**
 * Cover images are already resized by the backend and served from
 * /api/uploads, so a plain <img> is used instead of next/image.
 */
export function CoverImage({ src, alt, className, priority = false }: CoverImageProps) {
  if (!src) {
    return (
      <div
        aria-hidden
        className={cn(
          "bg-gradient-to-br from-zinc-100 via-zinc-50 to-teal-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-teal-950/40",
          className,
        )}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={cn("object-cover", className)}
    />
  );
}
