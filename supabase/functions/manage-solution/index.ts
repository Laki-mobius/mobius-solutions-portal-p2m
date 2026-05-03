// Admin endpoint to create/update/delete solutions, encrypting passwords at rest.
import { createClient } from "jsr:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PayloadSchema = z.object({
  op: z.enum(["upsert", "delete"]),
  id: z.string().uuid().optional(),
  data: z
    .object({
      title: z.string().min(1).max(200),
      description: z.string().max(2000).default(""),
      icon_url: z.string().nullable().optional(),
      thumbnail_url: z.string().nullable().optional(),
      target_url: z.string().min(1).max(2000),
      solution_type: z.enum(["internal", "external"]),
      status: z.enum(["live", "upcoming", "archived"]).default("live"),
      upcoming_eta: z.string().nullable().optional(),
      default_username: z.string().max(200).nullable().optional(),
      default_password: z.string().max(500).nullable().optional(), // plaintext input
      credentials_note: z.string().max(1000).nullable().optional(),
      clear_password: z.boolean().optional(),
    })
    .optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const credKey = Deno.env.get("CREDENTIALS_KEY")!;
    const admin = createClient(url, key);

    // Ensure pgcrypto key is set in DB
    await admin.rpc("set_credentials_key", { _key: credKey });

    const body = await req.json();
    const parsed = PayloadSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { op, id, data } = parsed.data;

    if (op === "delete") {
      if (!id) return json({ error: "id required" }, 400);
      const { error } = await admin.from("solutions").delete().eq("id", id);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    if (!data) return json({ error: "data required" }, 400);

    const row: Record<string, unknown> = {
      title: data.title.trim(),
      description: data.description ?? "",
      icon_url: data.icon_url || null,
      thumbnail_url: data.thumbnail_url || null,
      target_url: data.target_url.trim(),
      solution_type: data.solution_type,
      status: data.status,
      upcoming_eta: data.upcoming_eta || null,
      default_username: data.default_username?.trim() || null,
      credentials_note: data.credentials_note?.trim() || null,
    };

    if (data.clear_password) {
      row.default_password_encrypted = null;
    } else if (data.default_password && data.default_password.length > 0) {
      const { data: enc, error: encErr } = await admin.rpc("encrypt_credential", {
        _plaintext: data.default_password,
      });
      if (encErr) return json({ error: encErr.message }, 500);
      row.default_password_encrypted = enc;
    }

    if (id) {
      const { error } = await admin.from("solutions").update(row).eq("id", id);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true, id });
    } else {
      const { data: ins, error } = await admin
        .from("solutions")
        .insert(row)
        .select("id")
        .single();
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true, id: ins.id });
    }
  } catch (e) {
    return json({ error: String(e) }, 500);
  }

  function json(obj: unknown, status = 200) {
    return new Response(JSON.stringify(obj), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
