import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHmac, timingSafeEqual } from "crypto";
import type { PHC, HealthArticle } from "./types";

const SESSION_TTL_MS = 1000 * 60 * 60 * 4; // 4 hours

function getAdminPasscode(): string {
  const v = process.env.ADMIN_PASSCODE;
  if (!v || v.trim() === "") {
    throw new Error(
      "Admin panel is disabled: the ADMIN_PASSCODE backend secret has not been set.",
    );
  }
  return v;
}

function getSigningSecret(): string {
  // Derive signing key from passcode + service role so tokens invalidate
  // automatically when either rotates.
  const passcode = getAdminPasscode();
  const srk = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  return `${passcode}:${srk}`;
}

function issueSessionToken(): string {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = String(expiresAt);
  const sig = createHmac("sha256", getSigningSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

function verifySessionToken(token: string) {
  const parts = token.split(".");
  if (parts.length !== 2) throw new Error("Invalid admin session");
  const [payload, sig] = parts;
  const expected = createHmac("sha256", getSigningSecret()).update(payload).digest("hex");
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("Invalid admin session");
  }
  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    throw new Error("Admin session expired");
  }
}

const tokenInput = z.object({ token: z.string().min(1) });

export const verifyAdmin = createServerFn({ method: "POST" })
  .inputValidator((d: { passcode: string }) =>
    z.object({ passcode: z.string().min(1) }).parse(d),
  )
  .handler(async ({ data }) => {
    const expected = getAdminPasscode();
    const a = Buffer.from(data.passcode);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new Error("Invalid admin passcode");
    }
    return { token: issueSessionToken(), expiresAt: Date.now() + SESSION_TTL_MS };
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
  .inputValidator((d: unknown) => tokenInput.parse(d))
  .handler(async ({ data }): Promise<PHC[]> => {
    verifySessionToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin.from("phcs").select("*").order("name");
    if (error) throw new Error(error.message);
    return (rows ?? []) as unknown as PHC[];
  });

export const upsertPhc = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    tokenInput
      .extend({
        id: z.string().uuid().optional(),
        phc: phcInput,
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    verifySessionToken(data.token);
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
    tokenInput.extend({ id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data }) => {
    verifySessionToken(data.token);
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
  .inputValidator((d: unknown) => tokenInput.parse(d))
  .handler(async ({ data }): Promise<(HealthArticle & { published: boolean })[]> => {
    verifySessionToken(data.token);
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
    tokenInput
      .extend({
        id: z.string().uuid().optional(),
        article: articleInput,
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    verifySessionToken(data.token);
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
    tokenInput.extend({ id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data }) => {
    verifySessionToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("health_articles").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
