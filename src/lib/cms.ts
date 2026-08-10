import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_CONTENT, defaultContent } from "./content-defaults";

export interface SiteContentRow {
  id: string;
  page: string;
  block_key: string;
  value: string;
  draft_value: string | null;
  updated_at: string;
}

export interface PageSection {
  id: string;
  page: string;
  heading: string;
  body: string;
  image_url: string | null;
  image_alt: string | null;
  display_order: number;
  published: boolean;
  updated_at: string;
}

export interface Stakeholder {
  id: string;
  name: string;
  role_title: string | null;
  organization: string | null;
  statement: string | null;
  description: string | null;
  image_url: string | null;
  image_alt: string | null;
  display_order: number;
  published: boolean;
  updated_at: string;
}

/** Published copy for the whole site, keyed by "page.block_key". */
export type ContentMap = Record<string, string>;

export async function fetchSiteContent(): Promise<ContentMap> {
  const { data, error } = await supabase.from("site_content").select("page, block_key, value");
  if (error) return { ...DEFAULT_CONTENT };
  const map: ContentMap = { ...DEFAULT_CONTENT };
  for (const row of data ?? []) {
    if (typeof row.value === "string" && row.value.length > 0) {
      map[`${row.page}.${row.block_key}`] = row.value;
    }
  }
  return map;
}

export const siteContentQuery = {
  queryKey: ["site-content"] as const,
  queryFn: fetchSiteContent,
  staleTime: 60_000,
};

export async function fetchPageSections(page: string): Promise<PageSection[]> {
  const { data, error } = await supabase
    .from("page_sections")
    .select("*")
    .eq("page", page)
    .eq("published", true)
    .order("display_order");
  if (error) return [];
  return (data ?? []) as PageSection[];
}

export const pageSectionsQuery = (page: string) => ({
  queryKey: ["page-sections", page] as const,
  queryFn: () => fetchPageSections(page),
  staleTime: 60_000,
});

export async function fetchStakeholders(): Promise<Stakeholder[]> {
  const { data, error } = await supabase
    .from("stakeholders")
    .select("*")
    .eq("published", true)
    .order("display_order");
  if (error) return [];
  return (data ?? []) as Stakeholder[];
}

export const stakeholdersQuery = {
  queryKey: ["stakeholders"] as const,
  queryFn: fetchStakeholders,
  staleTime: 60_000,
};

/** Build a lookup for a single page, falling back to the built-in defaults. */
export function pageText(map: ContentMap | undefined, page: string) {
  return (key: string): string => {
    const v = map?.[`${page}.${key}`];
    return v && v.length > 0 ? v : defaultContent(page, key);
  };
}
