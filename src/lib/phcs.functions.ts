import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { PHC, HealthArticle } from "./types";
import { supabasePublicServer } from "@/integrations/supabase/client.public.server";

export const listPhcs = createServerFn({ method: "GET" }).handler(async (): Promise<PHC[]> => {
  const { data, error } = await supabasePublicServer
    .from("phcs")
    .select("*")
    .order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as PHC[];
});

export const getPhc = createServerFn({ method: "GET" })
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }): Promise<PHC | null> => {
    const { data: row, error } = await supabasePublicServer
      .from("phcs")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row as unknown as PHC) ?? null;
  });

export const listArticles = createServerFn({ method: "GET" }).handler(
  async (): Promise<HealthArticle[]> => {
    const { data, error } = await supabasePublicServer
      .from("health_articles")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as HealthArticle[];
  },
);

const feedbackSchema = z.object({
  phc_id: z.string().uuid(),
  service_used: z.string().trim().max(80).optional().or(z.literal("")),
  rating: z.number().int().min(1).max(5),
  staff_professionalism: z.number().int().min(1).max(5).optional(),
  waiting_time: z.number().int().min(1).max(5).optional(),
  cleanliness: z.number().int().min(1).max(5).optional(),
  comments: z.string().trim().max(1000).optional().or(z.literal("")),
  anonymous: z.boolean().default(true),
});

export const submitFeedback = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => feedbackSchema.parse(d))
  .handler(async ({ data }) => {
    const { error } = await supabasePublicServer.from("feedback").insert({
      phc_id: data.phc_id,
      service_used: data.service_used || null,
      rating: data.rating,
      staff_professionalism: data.staff_professionalism ?? null,
      waiting_time: data.waiting_time ?? null,
      cleanliness: data.cleanliness ?? null,
      comments: data.comments || null,
      anonymous: data.anonymous,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
