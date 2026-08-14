import { supabase } from "@/integrations/supabase/client";

/**
 * News & Announcements data layer.
 *
 * The database is the single source of truth. Fields are kept structured
 * (title / summary / content / category / event date / event time / location
 * are all separate columns) so the published record can be queried cleanly by
 * any future consumer without reshaping this feature.
 */

export type NewsStatus = "draft" | "published" | "unpublished";

export interface NewsCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  display_order: number;
}

export interface NewsImage {
  id: string;
  post_id: string;
  image_url: string;
  image_alt: string;
  display_order: number;
}

export interface NewsPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category_id: string | null;
  featured_image: string | null;
  featured_image_alt: string | null;
  status: NewsStatus;
  featured: boolean;
  published_at: string | null;
  event_date: string | null;
  event_time: string | null;
  location: string | null;
  contact_information: string | null;
  call_to_action_text: string | null;
  call_to_action_url: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface NewsPostWithCategory extends NewsPost {
  category: { id: string; name: string; slug: string } | null;
}

const POST_COLUMNS =
  "id,title,slug,summary,content,category_id,featured_image,featured_image_alt,status,featured,published_at,event_date,event_time,location,contact_information,call_to_action_text,call_to_action_url,created_at,updated_at,created_by,updated_by";

const POST_WITH_CATEGORY = `${POST_COLUMNS},category:news_categories(id,name,slug)`;

/* ------------------------------- slugs ---------------------------------- */

const STOP_WORDS = new Set(["a", "an", "the", "at", "of", "for", "in", "on", "to", "and"]);

/** Build a clean, URL-friendly slug from an announcement title. */
export function slugify(title: string): string {
  const base = (title ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, " ")
    .trim()
    .split(/[\s_-]+/)
    .filter(Boolean);
  const trimmed = base.filter((w, i) => i === 0 || !STOP_WORDS.has(w));
  const words = (trimmed.length ? trimmed : base).slice(0, 12);
  return words.join("-").slice(0, 90).replace(/^-+|-+$/g, "") || "announcement";
}

/** Ensure the slug is unique across announcements (ignoring `excludeId`). */
export async function uniqueSlug(title: string, excludeId?: string): Promise<string> {
  const base = slugify(title);
  let query = supabase.from("news_posts").select("slug,id").like("slug", `${base}%`);
  if (excludeId) query = query.neq("id", excludeId);
  const { data } = await query;
  const taken = new Set((data ?? []).map((r) => r.slug));
  if (!taken.has(base)) return base;
  for (let n = 2; n < 500; n++) {
    const candidate = `${base}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base}-${Date.now()}`;
}

/* ----------------------------- Lagos dates ------------------------------ */

const LAGOS = "Africa/Lagos";

/** Today's date in Africa/Lagos as YYYY-MM-DD. */
export function todayLagos(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: LAGOS,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Format a YYYY-MM-DD date (no timezone shifting) e.g. "20 August 2026". */
export function formatEventDate(date: string | null | undefined): string | null {
  if (!date) return null;
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** Format a publication timestamp in Africa/Lagos. */
export function formatPublishedAt(ts: string | null | undefined): string | null {
  if (!ts) return null;
  const dt = new Date(ts);
  if (Number.isNaN(dt.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: LAGOS,
  }).format(dt);
}

export type EventTiming = "upcoming" | "past" | null;

/** Upcoming / past classification based on the event date in Africa/Lagos. */
export function eventTiming(event_date: string | null | undefined): EventTiming {
  if (!event_date) return null;
  return event_date >= todayLagos() ? "upcoming" : "past";
}

/* ------------------------------ public reads ----------------------------- */

export async function fetchNewsCategories(): Promise<NewsCategory[]> {
  const { data, error } = await supabase
    .from("news_categories")
    .select("id,name,slug,description,display_order")
    .order("display_order")
    .order("name");
  if (error) return [];
  return (data ?? []) as NewsCategory[];
}

export const newsCategoriesQuery = {
  queryKey: ["news-categories"] as const,
  queryFn: fetchNewsCategories,
  staleTime: 60_000,
};

/** Published announcements only — drafts and unpublished items never leak. */
export async function fetchPublishedNews(limit?: number): Promise<NewsPostWithCategory[]> {
  let query = supabase
    .from("news_posts")
    .select(POST_WITH_CATEGORY)
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as unknown as NewsPostWithCategory[];
}

export const publishedNewsQuery = (limit?: number) => ({
  queryKey: ["news", "published", limit ?? "all"] as const,
  queryFn: () => fetchPublishedNews(limit),
  staleTime: 60_000,
});

/** Featured published announcements, newest first, capped for the homepage. */
export async function fetchFeaturedNews(limit = 3): Promise<NewsPostWithCategory[]> {
  const { data, error } = await supabase
    .from("news_posts")
    .select(POST_WITH_CATEGORY)
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []) as unknown as NewsPostWithCategory[];
}

export const featuredNewsQuery = (limit = 3) => ({
  queryKey: ["news", "featured", limit] as const,
  queryFn: () => fetchFeaturedNews(limit),
  staleTime: 60_000,
});

export async function fetchNewsBySlug(
  slug: string,
): Promise<{ post: NewsPostWithCategory; images: NewsImage[] } | null> {
  const { data, error } = await supabase
    .from("news_posts")
    .select(POST_WITH_CATEGORY)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error || !data) return null;
  const post = data as unknown as NewsPostWithCategory;
  const { data: imgs } = await supabase
    .from("news_images")
    .select("id,post_id,image_url,image_alt,display_order")
    .eq("post_id", post.id)
    .order("display_order");
  return { post, images: (imgs ?? []) as NewsImage[] };
}

export const newsBySlugQuery = (slug: string) => ({
  queryKey: ["news", "slug", slug] as const,
  queryFn: () => fetchNewsBySlug(slug),
  staleTime: 60_000,
});

/* ------------------------------ admin reads ------------------------------ */

/** Every announcement regardless of status — admin only (enforced by RLS). */
export async function fetchAllNews(): Promise<NewsPostWithCategory[]> {
  const { data, error } = await supabase
    .from("news_posts")
    .select(POST_WITH_CATEGORY)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as NewsPostWithCategory[];
}

export async function fetchNewsImages(postId: string): Promise<NewsImage[]> {
  const { data, error } = await supabase
    .from("news_images")
    .select("id,post_id,image_url,image_alt,display_order")
    .eq("post_id", postId)
    .order("display_order");
  if (error) return [];
  return (data ?? []) as NewsImage[];
}
