import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const format = url.searchParams.get("format") ?? "json";
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "100"), 10000);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data, error } = await supabase
    .from("activity_logs")
    .select("id,email,session_id,action,target_id,target_type,created_at")
    .order("created_at", { ascending: false })
    .limit(format === "csv" ? 50000 : limit);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const rows = data ?? [];
  const solutionIds = Array.from(
    new Set(rows.filter((r) => r.target_type === "solution" && r.target_id).map((r) => r.target_id as string)),
  );
  const collateralIds = Array.from(
    new Set(rows.filter((r) => r.target_type === "collateral" && r.target_id).map((r) => r.target_id as string)),
  );

  const nameMap = new Map<string, string>();
  if (solutionIds.length) {
    const { data: sols } = await supabase.from("solutions").select("id,title").in("id", solutionIds);
    sols?.forEach((s: any) => nameMap.set(`solution:${s.id}`, s.title));
  }
  if (collateralIds.length) {
    const { data: cols } = await supabase.from("collaterals").select("id,title").in("id", collateralIds);
    cols?.forEach((c: any) => nameMap.set(`collateral:${c.id}`, c.title));
  }

  const enriched = rows.map((r) => ({
    ...r,
    target_name: r.target_id && r.target_type ? nameMap.get(`${r.target_type}:${r.target_id}`) ?? null : null,
  }));

  if (format === "csv") {
    const header = "id,email,session_id,action,target_id,target_type,target_name,created_at\n";
    const csvRows = enriched
      .map((r) =>
        [r.id, r.email, r.session_id, r.action, r.target_id ?? "", r.target_type ?? "", r.target_name ?? "", r.created_at]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    return new Response(header + csvRows, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="activity-logs-${new Date().toISOString()}.csv"`,
      },
    });
  }

  return new Response(JSON.stringify({ logs: enriched }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
