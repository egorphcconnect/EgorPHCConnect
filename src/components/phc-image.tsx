import { useEffect, useState } from "react";
import { HeartPulse } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "phc-images";

/**
 * Extract the storage object path from any value we might have stored in
 * phcs.image_url. Supports:
 *  - full /object/public/phc-images/<path> URLs (legacy, when bucket was public)
 *  - /object/sign/phc-images/<path>?token=... URLs
 *  - a raw storage path like "abc.png"
 *  - null / other external URLs (returns null → caller uses value as-is)
 */
export function extractPhcImagePath(value: string | null | undefined): string | null {
  if (!value) return null;
  const publicMarker = `/object/public/${BUCKET}/`;
  const signMarker = `/object/sign/${BUCKET}/`;
  const pi = value.indexOf(publicMarker);
  if (pi >= 0) return decodeURIComponent(value.slice(pi + publicMarker.length).split("?")[0]);
  const si = value.indexOf(signMarker);
  if (si >= 0) return decodeURIComponent(value.slice(si + signMarker.length).split("?")[0]);
  if (/^https?:\/\//i.test(value)) return null;
  return value;
}

const SIGNED_TTL = 60 * 60 * 24 * 365; // 1 year

/** Resolve a stored image_url into a browser-usable src (async for signed URLs). */
export function usePhcImageSrc(image_url: string | null | undefined): {
  src: string | null;
  loading: boolean;
} {
  const [src, setSrc] = useState<string | null>(() => {
    if (!image_url) return null;
    const path = extractPhcImagePath(image_url);
    return path ? null : image_url; // external URL usable immediately
  });
  const [loading, setLoading] = useState<boolean>(() => {
    if (!image_url) return false;
    return !!extractPhcImagePath(image_url);
  });

  useEffect(() => {
    let cancel = false;
    if (!image_url) { setSrc(null); setLoading(false); return; }
    const path = extractPhcImagePath(image_url);
    if (!path) { setSrc(image_url); setLoading(false); return; }
    setLoading(true);
    supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_TTL)
      .then(({ data, error }) => {
        if (cancel) return;
        setSrc(error || !data ? null : data.signedUrl);
        setLoading(false);
      });
    return () => { cancel = true; };
  }, [image_url]);

  return { src, loading };
}

export function PhcImage({
  phc, className = "", aspect = "aspect-[16/9]",
}: {
  phc: { image_url: string | null; name: string };
  className?: string;
  aspect?: string;
}) {
  const { src, loading } = usePhcImageSrc(phc.image_url);
  return (
    <div className={`relative overflow-hidden rounded-lg bg-primary-soft ${aspect} ${className}`}>
      {src ? (
        <img
          src={src}
          alt={`Photograph of ${phc.name}`}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/15 via-primary-soft to-secondary/20 text-primary">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow">
            <HeartPulse className="h-6 w-6" />
          </span>
          <p className="px-3 text-center text-xs font-medium text-primary/80">
            {loading ? "Loading image…" : "Primary Healthcare Centre"}
          </p>
        </div>
      )}
    </div>
  );
}
