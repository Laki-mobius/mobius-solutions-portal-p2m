import { Layout } from "@/components/Layout";
import { useSolutions } from "@/hooks/useContent";
import { SolutionCard } from "@/components/SolutionCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { EmptyState } from "@/pages/Index";

const Solutions = () => {
  const { data: solutions = [], isLoading } = useSolutions();
  const [tab, setTab] = useState<"all" | "internal" | "external">("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return solutions.filter((s) => {
      if (tab !== "all" && s.solution_type !== tab) return false;
      if (!ql) return true;
      return (
        s.title.toLowerCase().includes(ql) || s.description.toLowerCase().includes(ql)
      );
    });
  }, [solutions, tab, q]);

  return (
    <Layout>
      <section className="border-b border-border/60 bg-hero">
        <div className="container py-12">
          <h1 className="font-display text-4xl font-bold">Solutions</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Every solution our team has built — internal tools and external market facing solutions.
          </p>
        </div>
      </section>

      <section className="container py-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList>
              <TabsTrigger value="all">All ({solutions.length})</TabsTrigger>
              <TabsTrigger value="internal">
                Internal ({solutions.filter((s) => s.solution_type === "internal").length})
              </TabsTrigger>
              <TabsTrigger value="external">
                External ({solutions.filter((s) => s.solution_type === "external").length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search solutions…"
              className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none ring-ring focus:ring-2"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[16/10] animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No matching solutions" hint="Try a different filter or search term." />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => (
              <SolutionCard key={s.id} solution={s} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Solutions;
