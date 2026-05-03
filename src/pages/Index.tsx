import { Layout } from "@/components/Layout";
import { useCollaterals, useSolutions } from "@/hooks/useContent";
import { SolutionCard } from "@/components/SolutionCard";
import { CollateralCard } from "@/components/CollateralCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";

const Index = () => {
  const { data: solutions = [], isLoading } = useSolutions();
  const { data: collaterals = [] } = useCollaterals();
  const [tab, setTab] = useState<"all" | "internal" | "external">("all");

  const filtered = useMemo(
    () => (tab === "all" ? solutions : solutions.filter((s) => s.solution_type === tab)),
    [solutions, tab],
  );

  const featuredCollaterals = collaterals.slice(0, 3);

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-hero relative overflow-hidden">
        <div className="container relative py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="glass mb-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Mobius Solutions Showcase
            </span>
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Solutions, <span className="text-gradient-brand">crafted</span> by Mobius.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Explore the internal tools and external solutions our team has shipped — plus the
              decks, videos, and documents behind them.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/solutions"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-95"
              >
                Browse solutions <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/collaterals"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/80 px-5 py-2.5 text-sm font-semibold backdrop-blur transition hover:bg-background"
              >
                View collaterals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions tabs */}
      <section className="container py-16">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="font-display text-3xl font-bold">Solutions</h2>
            <p className="mt-1 text-muted-foreground">
              Filter by Internal team tools or External client solutions.
            </p>
          </div>
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="internal">Internal</TabsTrigger>
              <TabsTrigger value="external">External</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[16/10] animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No solutions yet"
            hint="Add your first solution from the admin panel."
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => (
              <SolutionCard key={s.id} solution={s} />
            ))}
          </div>
        )}
      </section>

      {/* Featured collaterals */}
      {featuredCollaterals.length > 0 && (
        <section className="border-t border-border/60 bg-secondary/30 py-16">
          <div className="container">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="font-display text-3xl font-bold">Latest collaterals</h2>
                <p className="mt-1 text-muted-foreground">Decks, videos, and documents.</p>
              </div>
              <Link
                to="/collaterals"
                className="text-sm font-semibold text-primary hover:underline"
              >
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredCollaterals.map((c) => (
                <CollateralCard key={c.id} collateral={c} solutions={solutions} />
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export const EmptyState = ({ title, hint }: { title: string; hint?: string }) => (
  <div className="rounded-2xl border border-dashed border-border bg-secondary/30 p-12 text-center">
    <p className="font-display text-lg font-semibold">{title}</p>
    {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
  </div>
);

export default Index;
