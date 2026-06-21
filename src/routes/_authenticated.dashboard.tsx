import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from "recharts";
import {
  Users, DollarSign, CheckCircle2, AlertTriangle, Quote, Sparkles, Swords, Lightbulb, Activity,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getDashboardData } from "@/lib/interview.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — ExitIQ" },
      { name: "description", content: "Churn intelligence command center — root causes, competitors, revenue impact, and feature requests." },
    ],
  }),
  component: Dashboard,
});

const COLORS = ["hsl(var(--primary))", "#8b5cf6", "#f59e0b", "#ef4444", "#10b981", "#64748b", "#0ea5e9", "#ec4899"];
const CATEGORY_LABELS: Record<string, string> = {
  onboarding: "Onboarding friction",
  features: "Missing features",
  pricing: "Pricing concerns",
  competitor: "Switched to competitor",
  value: "Value gap",
  ux: "UX issues",
  activation: "Activation failure",
  other: "Other",
};
const JOURNEY_LABELS: Record<string, string> = {
  signup: "Signup",
  onboarding: "Onboarding",
  activation: "Activation",
  first_use: "First use",
  upgrade: "Upgrade",
  other: "Other",
};
const ASSUMED_MRR = 99; // for revenue-lost estimates

function Dashboard() {
  const { company } = useAuth();
  const fn = useServerFn(getDashboardData);
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: () => fn() });

  const stats = useMemo(() => computeStats(data), [data]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-0.5 text-[11px] font-medium text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Auto-pilot active
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{company?.company_name ?? "Workspace"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Churn intelligence command center — generated from real customer interviews.
          </p>
        </div>
      </div>

      {/* 1. EXECUTIVE OVERVIEW */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Kpi icon={Users} label="Churned customers" value={String(stats.totalChurned)} />
        <Kpi icon={DollarSign} label="Est. revenue lost" value={fmtMoney(stats.revenueLost)} />
        <Kpi icon={Activity} label="Active interviews" value={String(stats.active)} />
        <Kpi icon={CheckCircle2} label="Completed" value={String(stats.completed)} />
        <Kpi icon={AlertTriangle} label="Top churn reason" value={stats.topReasonLabel} note />
      </div>

      {isLoading ? (
        <EmptyCard text="Loading…" />
      ) : stats.totalInsights === 0 ? (
        <EmptyCard text="No completed interviews yet. As your customers go through ExitIQ, structured intelligence will appear here." />
      ) : (
        <>
          {/* 2. AI INSIGHT SUMMARY */}
          <Card>
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-foreground text-background">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  AI insight summary
                </span>
                <p className="mt-1 text-base leading-relaxed text-foreground">{stats.narrative}</p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            {/* 3. ROOT CAUSE BREAKDOWN */}
            <Card className="lg:col-span-2">
              <CardHead title="Root cause breakdown" subtitle="Ranked by share of churn" />
              <div className="h-56">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={stats.categoryChart} dataKey="value" nameKey="name" innerRadius={50} outerRadius={84} paddingAngle={2}>
                      {stats.categoryChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-2 space-y-1.5 text-sm">
                {stats.categoryChart.map((r, i) => (
                  <li key={r.name} className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      {r.name}
                    </span>
                    <span className="font-medium text-foreground">{r.pct}%</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* 5. REVENUE IMPACT */}
            <Card className="lg:col-span-3">
              <CardHead title="Revenue impact by root cause" subtitle={`Estimated at ${fmtMoney(ASSUMED_MRR)} MRR per customer`} />
              <ul className="divide-y divide-border">
                {stats.revenueByCategory.map((r) => (
                  <li key={r.name} className="flex items-center justify-between py-3">
                    <span className="text-sm">{r.name}</span>
                    <div className="flex w-1/2 items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-foreground" style={{ width: `${r.pctOfMax}%` }} />
                      </div>
                      <span className="w-20 text-right text-sm font-semibold">{fmtMoney(r.dollars)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* 4. COMPETITOR INTELLIGENCE */}
          {stats.competitors.length > 0 && (
            <Card>
              <CardHead title="Competitor intelligence" subtitle="Where churned customers went" />
              <ul className="divide-y divide-border">
                {stats.competitors.map((c) => (
                  <li key={c.name} className="flex items-center justify-between py-3">
                    <span className="flex items-center gap-2.5">
                      <Swords className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{c.name}</span>
                    </span>
                    <span className="text-sm text-muted-foreground">{c.count} mention{c.count > 1 ? "s" : ""}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* 6. FEATURE REQUEST ENGINE */}
            <Card>
              <CardHead title="Most requested features" subtitle="Mentioned across exit interviews" />
              {stats.features.length === 0 ? (
                <p className="text-sm text-muted-foreground">No feature requests captured yet.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {stats.features.map((f) => (
                    <li key={f.name} className="flex items-center justify-between py-3">
                      <span className="flex items-center gap-2.5">
                        <Lightbulb className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{f.name}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{f.count}×</span>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${f.impact === "High" ? "border-destructive/30 bg-destructive/10 text-destructive" : f.impact === "Medium" ? "border-warning/30 bg-warning/10 text-warning" : "border-border bg-muted text-muted-foreground"}`}>
                          {f.impact}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* 8. JOURNEY FAILURE POINTS */}
            <Card>
              <CardHead title="Journey failure points" subtitle="Where customers fell off" />
              <ul className="space-y-3">
                {stats.journeyChart.map((j) => (
                  <li key={j.name}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>{j.name}</span>
                      <span className="font-medium text-foreground">{j.pct}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-foreground" style={{ width: `${j.pct}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* 7. REAL CUSTOMER QUOTES */}
          {stats.quotes.length > 0 && (
            <Card>
              <CardHead title="Real customer quotes" subtitle="Raw voice from your exit interviews" />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {stats.quotes.map((q, i) => (
                  <div key={i} className="rounded-lg border border-border bg-background p-4">
                    <Quote className="h-4 w-4 text-muted-foreground" />
                    <p className="mt-2 text-sm">"{q.text}"</p>
                    <p className="mt-3 text-xs text-muted-foreground">{CATEGORY_LABELS[q.category] ?? q.category}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

type DashData = Awaited<ReturnType<typeof getDashboardData>>;

function computeStats(data: DashData | undefined) {
  const sessions = data?.sessions ?? [];
  const insights = data?.insights ?? [];
  const totalChurned = sessions.length;
  const active = sessions.filter((s) => s.interview_status === "active").length;
  const completed = sessions.filter((s) => s.interview_status === "completed").length;
  const revenueLost = totalChurned * ASSUMED_MRR;
  const totalInsights = insights.length;

  // Category breakdown
  const catCounts = new Map<string, number>();
  insights.forEach((i) => {
    const c = i.category ?? "other";
    catCounts.set(c, (catCounts.get(c) ?? 0) + 1);
  });
  const categoryChart = [...catCounts.entries()]
    .map(([k, v]) => ({ name: CATEGORY_LABELS[k] ?? k, key: k, value: v, pct: Math.round((v / totalInsights) * 100) }))
    .sort((a, b) => b.value - a.value);

  const topReason = categoryChart[0];
  const topReasonLabel = topReason ? `${topReason.name} (${topReason.pct}%)` : "—";

  // Revenue per category (proportional)
  const revenueByCategoryAll = categoryChart.map((c) => ({
    name: c.name,
    dollars: Math.round((c.value / totalInsights) * revenueLost),
  }));
  const maxRev = Math.max(1, ...revenueByCategoryAll.map((r) => r.dollars));
  const revenueByCategory = revenueByCategoryAll.map((r) => ({ ...r, pctOfMax: Math.round((r.dollars / maxRev) * 100) }));

  // Competitors
  const compCounts = new Map<string, number>();
  insights.forEach((i) => {
    if (i.competitor_mentioned) {
      const name = i.competitor_mentioned.trim();
      if (name) compCounts.set(name, (compCounts.get(name) ?? 0) + 1);
    }
  });
  const competitors = [...compCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Features
  const featCounts = new Map<string, number>();
  insights.forEach((i) => {
    (i.missing_features ?? []).forEach((f) => {
      const k = f.trim();
      if (k) featCounts.set(k, (featCounts.get(k) ?? 0) + 1);
    });
  });
  const features = [...featCounts.entries()]
    .map(([name, count]) => ({
      name, count,
      impact: count >= 3 ? "High" : count === 2 ? "Medium" : "Low",
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Journey
  const journeyCounts = new Map<string, number>();
  insights.forEach((i) => {
    const j = i.journey_failure_point ?? "other";
    journeyCounts.set(j, (journeyCounts.get(j) ?? 0) + 1);
  });
  const journeyChart = ["signup", "onboarding", "activation", "first_use", "upgrade", "other"].map((k) => {
    const v = journeyCounts.get(k) ?? 0;
    return { name: JOURNEY_LABELS[k], pct: totalInsights ? Math.round((v / totalInsights) * 100) : 0 };
  });

  // Quotes
  const quotes = insights
    .filter((i) => i.quote)
    .slice(0, 3)
    .map((i) => ({ text: i.quote as string, category: i.category ?? "other" }));

  // Narrative
  const onboardingPct = insights.length
    ? Math.round((insights.filter((i) => i.onboarding_issue).length / insights.length) * 100)
    : 0;
  const topComp = competitors[0];
  let narrative = "Not enough interviews yet to summarize patterns.";
  if (totalInsights > 0) {
    const parts = [
      topReason ? `Most churn is driven by ${topReason.name.toLowerCase()} (${topReason.pct}% of cancellations).` : "",
      onboardingPct >= 20 ? `${onboardingPct}% of customers cited onboarding friction.` : "",
      topComp ? `${topComp.name} is the most-mentioned alternative customers are switching to.` : "",
    ].filter(Boolean);
    narrative = parts.join(" ");
  }

  return {
    totalChurned, active, completed, revenueLost, totalInsights,
    topReasonLabel, categoryChart, revenueByCategory, competitors, features, journeyChart, quotes, narrative,
  };
}

function fmtMoney(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return `$${n}`;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-border bg-card p-6 shadow-soft ${className}`}>{children}</section>;
}
function CardHead({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-base font-semibold">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
function EmptyCard({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
function Kpi({
  icon: Icon, label, value, note,
}: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; note?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className={`mt-2 font-semibold tracking-tight ${note ? "text-base leading-snug" : "text-2xl"}`}>{value}</p>
    </div>
  );
}
