// Reveals decrypted credentials for a solution after verifying email-gate session.
import { createClient } from "jsr:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const Body = z.object({
  solution_id: z.string().uuid(),
  email: z.string().email().max(255),
  session_id: z.string().min(8).max(100),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (obj: unknown, status = 200) =>
    new Response(JSON.stringify(obj), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const credKey = Deno.env.get("CREDENTIALS_KEY")!;
    const admin = createClient(url, key);

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Invalid input" }, 400);
    const { solution_id, email, session_id } = parsed.data;
    const emailLower = email.trim().toLowerCase();

    // Verify email gate session was recorded
    const { data: sess } = await admin
      .from("user_sessions")
      .select("id")
      .eq("email", emailLower)
      .eq("session_id", session_id)
      .limit(1)
      .maybeSingle();
    if (!sess) return json({ error: "Session not verified" }, 403);

    // Set the encryption key for this DB session
    await admin.rpc("set_credentials_key", { _key: credKey });

    // Load encrypted password
    const { data: row, error } = await admin
      .from("solutions")
      .select("default_username, default_password_encrypted, credentials_note, status")
      .eq("id", solution_id)
      .maybeSingle();
    if (error || !row) return json({ error: "Solution not found" }, 404);
    if (row.status === "archived") return json({ error: "Solution unavailable" }, 403);
    if (!row.default_password_encrypted && !row.default_username) {
      return json({ error: "No credentials" }, 404);
    }

    let password: string | null = null;
    if (row.default_password_encrypted) {
      const { data: dec, error: decErr } = await admin.rpc("decrypt_credential", {
        _ciphertext: row.default_password_encrypted,
      });
      if (decErr) return json({ error: "Decrypt failed" }, 500);
      password = dec as string;
    }

    // Audit log
    await admin.from("credential_reveals").insert({
      solution_id,
      email: emailLower,
      session_id,
    });
    await admin.from("activity_logs").insert({
      email: emailLower,
      session_id,
      action: "reveal_credentials",
      target_id: solution_id,
      target_type: "solution",
    });

    return json({
      username: row.default_username,
      password,
      note: row.credentials_note,
    });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
