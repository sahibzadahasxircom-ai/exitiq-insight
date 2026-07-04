import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, AreaChart, Area,
} from "recharts";
import {
  Users, DollarSign, CheckCircle2, TrendingUp, Sparkles,
  Activity, ShieldCheck, AlertTriangle, Flame, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import {
  KPIS, CATEGORY_DISTRIBUTION, CHURN_TREND, INTERVIEW_VOLUME,
  SENTIMENT_DISTRIBUTION, RECOMMENDATIONS, INTELLIGENCE_CARDS,
  CATEGORY_LABEL, formatMoney,
} from "@/lib/mock-intelligence";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — ExitIQ" },
      { name: "description", content: "Churn intelligence command center — root causes, competitors, revenue impact, and recommendations." },
    ],
  }),
  component: Dashboard,
});

const CHART_COLORS = [
  "oklch(0.52 0.18 257)", "oklch(0.65 0.16 200)", "oklch(0.72 0.15 70)",
  "oklch(0.62 0.18 330)", "oklch(0.62 0.15 155)", "oklch(0.58 0.22 27)",
  "oklch(0.55 0.14 290)", "oklch(0.7 0.12 240)",
];
const SENTIMENT_COLORS = ["oklch(0.62 0.15 155)", "oklch(0.65 0.03 260)", "oklch(0.72 0.17 70)", "oklch(0.58 0.22 27)"];

function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-0.5 text-[11px] font-medium text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Intelligence engine live · demo data
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Founder dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every completed interview is auto-analysed and folded into the metrics below.
          </p>
        </div>
      </div>

      {/* ---- 1. Executive Overview ---- */}
      <Section title="Executive overview" subtitle="The 8 metrics that answer 'what's happening this quarter'.">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Kpi icon={Users} label="Total AI interviews" value={String(KPIS.total_interviews)} delta="+18% MoM" trend="up" />
          <Kpi icon={CheckCircle2} label="Completed" value={String(KPIS.completed_interviews)} delta="86% completion" />
          <Kpi icon={DollarSign} label="Revenue lost" value={formatMoney(KPIS.revenue_lost)} delta="+$12k MoM" trend="up" tone="destructive" />
          <Kpi icon={ShieldCheck} label="Revenue saveable" value={formatMoney(KPIS.revenue_saveable)} delta="High-retention set" tone="success" />
          <Kpi icon={Users} label="Customers interviewed" value={String(KPIS.customers_interviewed)} delta="Across 10 countries" />
          <Kpi icon={Activity} label="AI health score" value={`${KPIS.ai_health_score}%`} delta="All models nominal" tone="success" />
          <Kpi icon={AlertTriangle} label="Top churn reason" value={CATEGORY_LABEL[KPIS.top_churn_category]} delta="31% of churn" />
          <Kpi icon={Flame} label="Fastest growing" value={CATEGORY_LABEL[KPIS.fastest_growing_category]} delta="+42% WoW" trend="up" tone="warning" />
        </div>
      </Section>

      {/* ---- 2. Churn Analytics ---- */}
      <Section title="Churn analytics" subtitle="Distribution, trend, and revenue impact across every completed interview.">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHead title="Root cause distribution" subtitle="Share of churn by category" />
            <div className="h-56">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={CATEGORY_DISTRIBUTION} dataKey="count" nameKey="label" innerRadius={50} outerRadius={84} paddingAngle={2}>
                    {CATEGORY_DISTRIBUTION.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 max-h-40 space-y-1.5 overflow-auto pr-1 text-sm">
              {CATEGORY_DISTRIBUTION.slice(0, 6).map((r, i) => (
                <li key={r.key} className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    {r.label}
                  </span>
                  <span className="font-medium text-foreground">{r.pct}%</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="lg:col-span-2">
            <CardHead title="Churn trend (12 months)" subtitle="Cancellations and revenue lost per month" />
            <div className="h-56">
              <ResponsiveContainer>
                <LineChart data={CHURN_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis yAxisId="left" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis yAxisId="right" orientation="right" stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line yAxisId="left" type="monotone" dataKey="churned" stroke={CHART_COLORS[0]} strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke={CHART_COLORS[3]} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <CardHead title="Revenue lost by category" subtitle="Estimated ARR impact" />
            <div className="h-56">
              <ResponsiveContainer>
                <BarChart data={CATEGORY_DISTRIBUTION} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => formatMoney(Number(v))} />
                  <YAxis type="category" dataKey="label" width={130} stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatMoney(v)} />
                  <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                    {CATEGORY_DISTRIBUTION.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <CardHead title="Interview volume" subtitle="Triggered vs. completed" />
            <div className="h-56">
              <ResponsiveContainer>
                <AreaChart data={INTERVIEW_VOLUME}>
                  <defs>
                    <linearGradient id="grad-int" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS[0]} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="grad-done" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS[4]} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={CHART_COLORS[4]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="interviews" stroke={CHART_COLORS[0]} fill="url(#grad-int)" strokeWidth={2} />
                  <Area type="monotone" dataKey="completed" stroke={CHART_COLORS[4]} fill="url(#grad-done)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <CardHead title="Sentiment distribution" subtitle="How churned customers felt" />
            <div className="h-56">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={SENTIMENT_DISTRIBUTION} dataKey="value" nameKey="label" innerRadius={44} outerRadius={80} paddingAngle={2}>
                    {SENTIMENT_DISTRIBUTION.map((_, i) => <Cell key={i} fill={SENTIMENT_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 grid grid-cols-2 gap-1.5 text-xs text-muted-foreground">
              {SENTIMENT_DISTRIBUTION.map((s, i) => (
                <li key={s.label} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: SENTIMENT_COLORS[i] }} />
                  {s.label} <span className="ml-auto font-medium text-foreground">{s.value}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHead title="Sentiment trend" subtitle="Rolling positivity score" />
            <div className="h-56">
              <ResponsiveContainer>
                <LineChart data={CHURN_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} domain={[30, 80]} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="sentiment" stroke={CHART_COLORS[1]} strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </Section>

      {/* ---- 3. AI Intelligence Center (compact preview) ---- */}
      <Section
        title="AI intelligence center"
        subtitle="Highest-signal insights synthesised across every interview."
        action={<Link to="/insights" className="text-sm font-medium text-primary hover:underline">Open intelligence center →</Link>}
      >
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
                {c.trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {c.pct}% share
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ---- 4. AI Recommendations ---- */}
      <Section
        title="AI recommendations"
        subtitle="Ranked by expected revenue impact. Each is auto-generated from patterns across interviews."
        action={<Link to="/insights" className="text-sm font-medium text-primary hover:underline">See all recommendations →</Link>}
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {RECOMMENDATIONS.slice(0, 4).map((r) => (
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
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>{r.affected_customers} customers · {formatMoney(r.affected_revenue)} ARR</span>
                <span className="inline-flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {Math.round(r.confidence * 100)}% confidence</span>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* ---------- shared UI atoms ---------- */

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
  color: "var(--foreground)",
};

function Section({
  title, subtitle, children, action,
}: { title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-border bg-card p-5 shadow-soft ${className}`}>{children}</div>;
}
function CardHead({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function Kpi({
  icon: Icon, label, value, delta, tone, trend,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  delta?: string;
  tone?: "success" | "destructive" | "warning";
  trend?: "up" | "down";
}) {
  const toneClass =
    tone === "success" ? "text-success" :
    tone === "destructive" ? "text-destructive" :
    tone === "warning" ? "text-warning" :
    "text-muted-foreground";
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-2 truncate text-xl font-semibold tracking-tight">{value}</p>
      {delta && (
        <p className={`mt-1 flex items-center gap-1 text-[11px] ${toneClass}`}>
          {trend === "up" && <ArrowUpRight className="h-3 w-3" />}
          {trend === "down" && <ArrowDownRight className="h-3 w-3" />}
          {delta}
        </p>
      )}
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
