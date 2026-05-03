import { Layout } from "@/components/Layout";
import { useCollaterals, useSolutions } from "@/hooks/useContent";
import { CollateralCard } from "@/components/CollateralCard";
import { useMemo, useState } from "react";
import { EmptyState } from "@/pages/Index";
import { Search } from "lucide-react";

const filters = [
  { key: "all", label: "All" },
  { key: "video", label: "Video" },
  { key: "deck", label: "Deck" },
  { key: "document", label: "Document" },
] as const;

type FilterKey = (typeof filters)[number]["key"];

const Collaterals = () => {
  const { data: collaterals = [], isLoading } = useCollaterals();
  const { data: solutions = [] } = useSolutions();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [q, setQ] = useState("");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: collaterals.length };
    for (const x of collaterals) c[x.type] = (c[x.type] ?? 0) + 1;
    return c;
  }, [collaterals]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return collaterals.filter((c) => {
      if (filter !== "all" && c.type !== filter) return false;
      if (!ql) return true;
      return c.title.toLowerCase().includes(ql);
    });
  }, [collaterals, filter, q]);

  return (
    <Layout>
      <section className="border-b border-border/60 bg-hero">
        <div className="container py-12">
          <h1 className="font-display text-4xl font-bold">Collaterals</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Decks, videos, and documents from our solutions team.
          </p>
        </div>
      </section>

      <section className="container py-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  filter === f.key
                    ? "bg-foreground text-background"
                    : "border border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label} <span className="opacity-60">({counts[f.key] ?? 0})</span>
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search collaterals…"
              className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none ring-ring focus:ring-2"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No collaterals found" />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <CollateralCard key={c.id} collateral={c} solutions={solutions} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Collaterals;
