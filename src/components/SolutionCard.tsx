import { Solution } from "@/hooks/useContent";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { useEmailGate } from "@/components/EmailGate";
import { logActivity } from "@/lib/tracking";

export const SolutionCard = ({ solution }: { solution: Solution }) => {
  const { requireEmail } = useEmailGate();

  const handleClick = async () => {
    try {
      await requireEmail();
      await logActivity("view_solution", solution.id, "solution");
      window.open(solution.target_url, "_blank", "noopener,noreferrer");
    } catch {
      /* user cancelled gate */
    }
  };

  const isInternal = solution.solution_type === "internal";
  const isNew =
    Date.now() - new Date(solution.created_at).getTime() < 30 * 24 * 60 * 60 * 1000;

  return (
    <button
      onClick={handleClick}
      className="hover-lift group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-soft"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {solution.thumbnail_url ? (
          <img
            src={solution.thumbnail_url}
            alt={solution.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            className={`h-full w-full ${
              isInternal ? "bg-gradient-internal" : "bg-gradient-external"
            } flex items-center justify-center`}
          >
            <Sparkles className="h-10 w-10 text-primary-foreground/80" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <span
            className={`glass inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
              isInternal ? "text-[hsl(var(--internal-from))]" : "text-[hsl(var(--external-from))]"
            }`}
          >
            {isInternal ? "Internal" : "External"}
          </span>
          {isNew && (
            <span className="inline-flex items-center rounded-full bg-gradient-brand px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-glow">
              New
            </span>
          )}
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-foreground/90 p-2 text-background opacity-0 transition-opacity group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start gap-3">
          {solution.icon_url && (
            <img
              src={solution.icon_url}
              alt=""
              className="h-9 w-9 rounded-lg border border-border object-cover"
              loading="lazy"
            />
          )}
          <h3 className="flex-1 font-display text-lg font-semibold leading-tight">
            {solution.title}
          </h3>
        </div>
        {solution.description && (
          <p className="line-clamp-3 text-sm text-muted-foreground">{solution.description}</p>
        )}
      </div>
    </button>
  );
};
