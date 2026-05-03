import { Collateral, Solution } from "@/hooks/useContent";
import { useEmailGate } from "@/components/EmailGate";
import { logActivity } from "@/lib/tracking";
import { Download, FileText, Layers, Play, ExternalLink, Link2 } from "lucide-react";

const typeMeta = {
  video: { label: "Video", color: "type-video", Icon: Play },
  deck: { label: "Deck", color: "type-deck", Icon: Layers },
  document: { label: "Document", color: "type-document", Icon: FileText },
} as const;

export const CollateralCard = ({
  collateral,
  solutions,
}: {
  collateral: Collateral;
  solutions?: Solution[];
}) => {
  const { requireEmail } = useEmailGate();
  const meta = typeMeta[collateral.type];
  const linked = solutions?.find((s) => s.id === collateral.linked_solution_id);

  const open = async (download = false) => {
    try {
      await requireEmail();
      const action =
        collateral.type === "video"
          ? "play_video"
          : download
            ? "download_collateral"
            : "view_collateral";
      await logActivity(action, collateral.id, "collateral");
      if (download) {
        const a = document.createElement("a");
        a.href = collateral.file_url;
        a.download = collateral.title;
        a.target = "_blank";
        a.rel = "noopener";
        a.click();
      } else {
        window.open(collateral.file_url, "_blank", "noopener,noreferrer");
      }
    } catch {
      /* cancelled */
    }
  };

  return (
    <div className="hover-lift flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl text-primary-foreground"
          style={{ backgroundColor: `hsl(var(--${meta.color}))` }}
        >
          <meta.Icon className="h-5 w-5" />
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{
            backgroundColor: `hsl(var(--${meta.color}) / 0.12)`,
            color: `hsl(var(--${meta.color}))`,
          }}
        >
          {meta.label}
        </span>
      </div>

      <h3 className="mb-2 font-display text-base font-semibold leading-tight">
        {collateral.title}
      </h3>

      {linked && (
        <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
          <Link2 className="h-3 w-3" /> {linked.title}
        </div>
      )}

      <div className="mt-auto flex gap-2 pt-3">
        <button
          onClick={() => open(false)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-xs font-semibold text-background transition hover:opacity-90"
        >
          {collateral.type === "video" ? (
            <>
              <Play className="h-3.5 w-3.5" /> Play
            </>
          ) : (
            <>
              <ExternalLink className="h-3.5 w-3.5" /> View
            </>
          )}
        </button>
        {collateral.type !== "video" && (
          <button
            onClick={() => open(true)}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold transition hover:bg-secondary"
          >
            <Download className="h-3.5 w-3.5" /> Download
          </button>
        )}
      </div>
    </div>
  );
};
