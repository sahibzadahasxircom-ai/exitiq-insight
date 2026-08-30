import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Sparkles, Lightbulb, Target, TrendingUp, ArrowUpRight, ArrowDownRight, Minus,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { listInsights } from "@/lib/interview.functions";
import {
  INTELLIGENCE_CARDS, ROOT_CAUSES, FEATURE_REQUESTS, RECOMMENDATIONS,
  CATEGORY_LABEL, formatMoney,
} from "@/lib/mock-intelligence";

export const Route = createFileRoute("/_authenticated/insights")({
  head: () => ({ meta: [{ title: "AI Intelligence Center — leaveesy" }] }),
  component: IntelligenceCenter,
});

function IntelligenceCenter() {
  const [tab, setTab] = useState("overview");
  const listFn = useServerFn(listInsights);
  const { data: insights = [] } = useQuery({
    queryKey: ["insights"],
    queryFn: () => listFn({ data: undefined }),
    retry: false, // Don't retry on error to avoid hanging
  });

  // For now, always use mock data for display
  // TODO: Replace with real data aggregation when sufficient insights exist
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI intelligence center</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Structured intelligence synthesised across every completed interview.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="root-causes">Root causes</TabsTrigger>
          <TabsTrigger value="features">Feature requests</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {INTELLIGENCE_CARDS.map((c) => (
              <div key={c.title} className="rounded-xl border border-border bg-card p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{c.title}</span>
                  <PriorityPill priority={c.priority} />
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-semibold leading-snug">{c.value}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{c.customers} customers</span>
                  <span className="font-semibold text-foreground">{formatMoney(c.revenue)}</span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-[11px] text-success">
                  <ArrowUpRight className="h-3 w-3" /> {c.pct}% share
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Root causes */}
        <TabsContent value="root-causes" className="space-y-3">
          <div className="grid grid-cols-1 gap-4">
            {ROOT_CAUSES.map((r) => (
              <div key={r.name} className="rounded-xl border border-border bg-card p-5 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                      <Target className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold">{r.name}</h3>
                        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {CATEGORY_LABEL[r.category]}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {r.mentions} customers · {r.customers} companies · {formatMoney(r.revenue)} ARR at risk
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendPill trend={r.trend} />
                    <PriorityPill priority={r.priority} />
                  </div>
                </div>
                <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Recommended fix</p>
                  <p className="mt-1 text-sm">{r.recommended_fix}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Features */}
        <TabsContent value="features" className="space-y-3">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Feature</th>
                  <th className="px-4 py-3 text-right font-medium">Mentions</th>
                  <th className="px-4 py-3 text-right font-medium">Customers</th>
                  <th className="px-4 py-3 text-right font-medium">Revenue impact</th>
                  <th className="px-4 py-3 text-right font-medium">Trend</th>
                  <th className="px-4 py-3 text-right font-medium">Priority</th>
                </tr>
              </thead>
              <tbody>
                {FEATURE_REQUESTS.map((f) => (
                  <tr key={f.name} className="border-t border-border hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{f.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">{f.mentions}</td>
                    <td className="px-4 py-3 text-right">{f.customers}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatMoney(f.revenue)}</td>
                    <td className="px-4 py-3 text-right"><TrendPill trend={f.trend} /></td>
                    <td className="px-4 py-3 text-right"><PriorityPill priority={f.priority} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Recommendations */}
        <TabsContent value="recommendations" className="space-y-3">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {RECOMMENDATIONS.map((r) => (
              <div key={r.id} className="rounded-xl border border-border bg-card p-5 shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Problem</p>
                      <p className="text-sm">{r.problem}</p>
                    </div>
                  </div>
                  <PriorityPill priority={r.priority} />
                </div>
                <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Recommendation</p>
                  <p className="mt-1 text-sm font-medium">{r.recommendation}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{r.expected_impact}</p>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  <Stat label="Revenue" value={formatMoney(r.affected_revenue)} />
                  <Stat label="Customers" value={String(r.affected_customers)} />
                  <Stat label="Confidence" value={`${Math.round(r.confidence * 100)}%`} icon={TrendingUp} />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InsightsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-1/3 rounded bg-slate-200" />
        <div className="h-4 w-1/4 rounded bg-slate-200" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded bg-slate-200" />
          ))}
        </div>
      </div>
    </div>
  );
}

function InsightsError() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-lg font-medium text-red-900">Failed to load intelligence data</p>
        <p className="mt-2 text-sm text-red-700">Please refresh the page or try again later.</p>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 flex items-center gap-1 text-sm font-semibold">
        {Icon && <Icon className="h-3 w-3 text-muted-foreground" />}
        {value}
      </p>
    </div>
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
function TrendPill({ trend }: { trend: "up" | "down" | "flat" }) {
  if (trend === "up") return <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive"><ArrowUpRight className="h-3 w-3" /> rising</span>;
  if (trend === "down") return <span className="inline-flex items-center gap-1 text-xs font-medium text-success"><ArrowDownRight className="h-3 w-3" /> falling</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground"><Minus className="h-3 w-3" /> flat</span>;
}

