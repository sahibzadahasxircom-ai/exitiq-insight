import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Search, Zap, Filter, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_INTERVIEWS, CATEGORY_LABEL, formatMoney } from "@/lib/mock-intelligence";

export const Route = createFileRoute("/_authenticated/interviews")({
  head: () => ({ meta: [{ title: "Interview Library — ExitIQ" }] }),
  component: InterviewLibrary,
});

const SENTIMENT_COLORS: Record<string, string> = {
  positive: "border-success/30 bg-success/10 text-success",
  neutral: "border-border bg-muted text-muted-foreground",
  frustrated: "border-warning/30 bg-warning/10 text-warning",
  angry: "border-destructive/30 bg-destructive/10 text-destructive",
};

function InterviewLibrary() {
  const [tab, setTab] = useState<"all" | "critical" | "high" | "medium" | "low">("all");
  const [category, setCategory] = useState<string>("all");
  const [sentiment, setSentiment] = useState<string>("all");
  const [plan, setPlan] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return MOCK_INTERVIEWS.filter((i) => {
      if (tab !== "all" && i.priority !== tab) return false;
      if (category !== "all" && i.category !== category) return false;
      if (sentiment !== "all" && i.sentiment !== sentiment) return false;
      if (plan !== "all" && i.plan !== plan) return false;
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        i.customer_name.toLowerCase().includes(q) ||
        i.company.toLowerCase().includes(q) ||
        i.primary_reason.toLowerCase().includes(q) ||
        i.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [tab, category, sentiment, plan, search]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Interview library</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {MOCK_INTERVIEWS.length} interviews · every one auto-analysed into a structured intelligence card.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success">
          <Zap className="h-3 w-3" /> Auto-pilot active
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="critical">Critical</TabsTrigger>
            <TabsTrigger value="high">High</TabsTrigger>
            <TabsTrigger value="medium">Medium</TabsTrigger>
            <TabsTrigger value="low">Low</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer, company, tag…"
              className="pl-8"
            />
          </div>
          <FilterSelect label="Category" value={category} onChange={setCategory}
            options={[{ value: "all", label: "All categories" }, ...Object.entries(CATEGORY_LABEL).map(([v, l]) => ({ value: v, label: l }))]}
          />
          <FilterSelect label="Sentiment" value={sentiment} onChange={setSentiment}
            options={[
              { value: "all", label: "All sentiment" },
              { value: "positive", label: "Positive" },
              { value: "neutral", label: "Neutral" },
              { value: "frustrated", label: "Frustrated" },
              { value: "angry", label: "Angry" },
            ]}
          />
          <FilterSelect label="Plan" value={plan} onChange={setPlan}
            options={[
              { value: "all", label: "All plans" },
              { value: "Starter", label: "Starter" },
              { value: "Growth", label: "Growth" },
              { value: "Scale", label: "Scale" },
              { value: "Enterprise", label: "Enterprise" },
            ]}
          />
          <span className="ml-auto text-xs text-muted-foreground">{filtered.length} shown</span>
        </div>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Nothing matches these filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((i) => (
            <Link
              key={i.id}
              to="/interviews/$id"
              params={{ id: i.id }}
              className="group flex flex-col rounded-xl border border-border bg-card p-5 shadow-soft transition-colors hover:border-foreground/30"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{i.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{i.company} · {i.plan}</p>
                </div>
                <PriorityPill priority={i.priority} />
              </div>

              <p className="mt-3 text-sm font-medium leading-snug line-clamp-2">{i.primary_reason}</p>
              <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{i.executive_summary}</p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {CATEGORY_LABEL[i.category]}
                </span>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${SENTIMENT_COLORS[i.sentiment]}`}>
                  {i.sentiment}
                </span>
                {i.competitor && (
                  <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    → {i.competitor}
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                <span>{format(new Date(i.completed_at), "MMM d")}</span>
                <span className="font-semibold text-foreground">{formatMoney(i.revenue_impact)}</span>
                <span className="inline-flex items-center gap-1">
                  {Math.round(i.ai_confidence * 100)}% AI
                  <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-muted-foreground">
      <Filter className="h-3 w-3" />
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-xs font-medium text-foreground focus:outline-none"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

function PriorityPill({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    critical: "border-destructive/30 bg-destructive/10 text-destructive",
    high: "border-warning/30 bg-warning/10 text-warning",
    medium: "border-border bg-muted text-muted-foreground",
    low: "border-border bg-muted text-muted-foreground",
  };
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles[priority] ?? styles.medium}`}>
      {priority}
    </span>
  );
}
