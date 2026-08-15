import { supabase } from "@/integrations/supabase/client";
import { extractPhcImagePath } from "@/components/phc-image";

const BUCKET = "phc-images";
const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

/**
 * Upload an image for CMS content and return the storage path to persist.
 * Removes the previously stored object so orphans don't accumulate.
 */
export async function uploadCmsImage(
  file: File,
  previous?: string | null,
  folder = "content",
): Promise<{ path: string } | { error: string }> {
  if (!ACCEPTED.includes(file.type)) return { error: "Only JPG, PNG or WebP images are allowed" };
  if (file.size > 5 * 1024 * 1024) return { error: "Image must be under 5 MB" };

  if (previous) {
    const prev = extractPhcImagePath(previous);
    if (prev) await supabase.storage.from(BUCKET).remove([prev]);
  }
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) return { error: error.message };
  return { path };
}

export async function removeCmsImage(value?: string | null) {
  if (!value) return;
  const path = extractPhcImagePath(value);
  if (path) await supabase.storage.from(BUCKET).remove([path]);
}
