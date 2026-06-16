import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { PHC, HealthArticle } from "./types";

function checkPasscode(passcode: string) {
  const expected = process.env.ADMIN_PASSCODE || "egor-admin";
  if (passcode !== expected) throw new Error("Invalid admin passcode");
}

export const verifyAdmin = createServerFn({ method: "POST" })
  .inputValidator((d: { passcode: string }) => z.object({ passcode: z.string() }).parse(d))
  .handler(async ({ data }) => {
    checkPasscode(data.passcode);
    return { ok: true };
  });

// ---------- PHCs ----------

const hoursSchema = z
  .object({
    mon_fri: z.string().optional(),
    sat: z.string().optional(),
    sun: z.string().optional(),
  })
  .default({});

const phcInput = z.object({
  name: z.string().trim().min(1),
  address: z.string().trim().min(1),
  ward: z.string().trim().min(1),
  services: z.array(z.string()).default([]),
  operating_hours: hoursSchema,
  contact_phone: z.string().trim().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  status: z.string().default("active"),
});

export const listAllPhcs = createServerFn({ method: "POST" })
  .inputValidator((d: { passcode: string }) => z.object({ passcode: z.string() }).parse(d))
  .handler(async ({ data }): Promise<PHC[]> => {
    checkPasscode(data.passcode);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin.from("phcs").select("*").order("name");
    if (error) throw new Error(error.message);
    return (rows ?? []) as unknown as PHC[];
  });

export const upsertPhc = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        passcode: z.string(),
        id: z.string().uuid().optional(),
        phc: phcInput,
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    checkPasscode(data.passcode);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload = { ...data.phc, last_updated: new Date().toISOString() };
    if (data.id) {
      const { error } = await supabaseAdmin.from("phcs").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("phcs").insert(payload);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deletePhc = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ passcode: z.string(), id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data }) => {
    checkPasscode(data.passcode);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("phcs").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Articles ----------

const articleInput = z.object({
  title: z.string().trim().min(1),
  category: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  content: z.string().trim().min(1),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(true),
});

export const listAllArticles = createServerFn({ method: "POST" })
  .inputValidator((d: { passcode: string }) => z.object({ passcode: z.string() }).parse(d))
  .handler(async ({ data }): Promise<(HealthArticle & { published: boolean })[]> => {
    checkPasscode(data.passcode);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("health_articles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (rows ?? []) as unknown as (HealthArticle & { published: boolean })[];
  });

export const upsertArticle = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        passcode: z.string(),
        id: z.string().uuid().optional(),
        article: articleInput,
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    checkPasscode(data.passcode);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.id) {
      const { error } = await supabaseAdmin
        .from("health_articles")
        .update(data.article)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("health_articles").insert(data.article);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteArticle = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ passcode: z.string(), id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data }) => {
    checkPasscode(data.passcode);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("health_articles").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
