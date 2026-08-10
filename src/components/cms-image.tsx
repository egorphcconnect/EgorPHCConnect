import { usePhcImageSrc } from "@/components/phc-image";

/**
 * Renders an image whose source is stored in the CMS (a `phc-images` storage
 * path, an external URL, or empty). Falls back to `fallbackSrc` when no CMS
 * image has been set.
 */
export function CmsImage({
  value,
  fallbackSrc,
  alt,
  className = "",
  width,
  height,
}: {
  value: string | null | undefined;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}) {
  const { src } = usePhcImageSrc(value ?? null);
  const finalSrc = src ?? fallbackSrc ?? null;
  if (!finalSrc) return null;
  return (
    <img
      src={finalSrc}
      alt={alt}
      {...(width ? { width } : {})}
      {...(height ? { height } : {})}
      loading="lazy"
      className={className}
    />
  );
}
