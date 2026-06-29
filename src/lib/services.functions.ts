import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listServicesCatalog = createServerFn({ method: "GET" }).handler(
  async (): Promise<string[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("services_catalog")
      .select("name")
      .order("name");
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: { name: string }) => r.name);
  },
);

export const addServiceToCatalog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ name: z.string().trim().min(2).max(80) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin");
    if (!roles || roles.length === 0) throw new Error("Admin only");
    const { error } = await supabaseAdmin
      .from("services_catalog")
      .upsert({ name: data.name }, { onConflict: "name" });
    if (error) throw new Error(error.message);
    return { ok: true, name: data.name };
  });
