import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type LogRow = {
  id: string;
  email: string;
  session_id: string;
  action: string;
  target_id: string | null;
  target_type: string | null;
  target_name: string | null;
  created_at: string;
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

const fetchLogs = async (): Promise<LogRow[]> => {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-logs?limit=100`, {
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
    },
  });
  if (!res.ok) throw new Error("Failed to load logs");
  const json = await res.json();
  return json.logs ?? [];
};

export const AdminLogs = () => {
  const { data = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin", "logs"],
    queryFn: fetchLogs,
  });

  const downloadCsv = async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-logs?format=csv`, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
        },
      });
      if (!res.ok) throw new Error("Failed to export");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `activity-logs-${new Date().toISOString()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing latest {data.length} activity events.
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`mr-1.5 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={downloadCsv}>
            <Download className="mr-1.5 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-3 text-left">When</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Action</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Target</th>
              <th className="p-3 text-left">Session</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  No activity yet.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="whitespace-nowrap p-3 text-muted-foreground">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td className="p-3">{row.email}</td>
                  <td className="p-3 font-mono text-xs">{row.action}</td>
                  <td className="p-3">{row.target_name ?? "—"}</td>
                  <td className="p-3 font-mono text-xs text-muted-foreground">
                    {row.target_type}:{row.target_id?.slice(0, 8)}
                  </td>
                  <td className="p-3 font-mono text-xs text-muted-foreground">
                    {row.session_id.slice(0, 8)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
