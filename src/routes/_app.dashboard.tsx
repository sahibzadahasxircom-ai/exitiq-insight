import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  Users, DollarSign, AlertTriangle, CheckCircle2,
  Sparkles, ArrowUpRight, ArrowDownRight, Quote,
  Lightbulb, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — ExitIQ" },
      { name: "description", content: "Founder analytics: churn reasons, revenue at risk, and AI-recommended actions." },
    ],
  }),
  component: Dashboard,
});

const churnReasons = [
  { name: "Onboarding friction", value: 42 },
  { name: "Missing features", value: 21 },
  { name: "Price", value: 15 },
  { name: "Switched competitor", value: 13 },
  { name: "No longer needed", value: 9 },
];

const churnTrend = [
  { day: "Mon", churned: 8 },
  { day: "Tue", churned: 12 },
  { day: "Wed", churned: 10 },
  { day: "Thu", churned: 15 },
  { day: "Fri", churned: 9 },
  { day: "Sat", churned: 6 },
  { day: "Sun", churned: 7 },
];

const quotes = [
  { text: "It was too complicated to set up and I gave up after 20 minutes.", customer: "B. — Series A SaaS" },
  { text: "I didn't see value quickly enough. The free trial ended before I figured it out.", customer: "M. — Solo founder" },
  { text: "Competitor was easier to use and half the price.", customer: "S. — Marketing agency" },
  { text: "Support never responded when I got stuck during onboarding.", customer: "K. — Mid-market" },
];

const actions = [
  { title: "Improve onboarding flow", desc: "42% of churn cites setup friction. Ship a guided 5-step setup.", impact: "High" },
  { title: "Reduce time-to-value", desc: "Move the first 'aha' moment before the integration step.", impact: "High" },
  { title: "Add quick-start tutorial", desc: "Inline product tour for new accounts within first 24h.", impact: "Medium" },
  { title: "Clarify pricing communication", desc: "Position value vs. competitor in pricing page copy.", impact: "Medium" },
];

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function Dashboard() {
  const [range, setRange] = useState("7");

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Churn intelligence</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            What's driving cancellations and what to do about it.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Users} label="Total churned customers" value="248" delta="+12%" trend="up" tone="neutral" />
        <KpiCard icon={DollarSign} label="Revenue lost (est.)" value="$42,180" delta="+8.4%" trend="up" tone="bad" />
        <KpiCard icon={AlertTriangle} label="Top churn reason" value="Onboarding friction" delta="42% share" trend="up" tone="warn" valueClass="text-lg" />
        <KpiCard icon={CheckCircle2} label="Interview completion" value="71%" delta="+3.1%" trend="up" tone="good" />
      </div>

      {/* AI Insight */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-6 shadow-soft">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-60"
          style={{ background: "radial-gradient(60% 80% at 0% 0%, color-mix(in oklab, var(--primary) 10%, transparent), transparent 70%)" }}
        />
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-soft">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-wide uppercase text-primary">AI Insight of the Week</h2>
              <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                Updated 2h ago
              </span>
            </div>
            <p className="mt-2 max-w-3xl text-lg font-medium leading-snug">
              Most users are not reaching value quickly enough. Onboarding friction is the primary churn driver, accounting for 42% of all cancellations this week — up 6 points vs. last week.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm">Review onboarding funnel</Button>
              <Button size="sm" variant="outline">View source interviews</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <ChartCard title="Churn reasons" subtitle="Breakdown of cited reasons" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={churnReasons} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {churnReasons.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="var(--background)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "var(--popover-foreground)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <ul className="mt-4 space-y-2">
            {churnReasons.map((r, i) => (
              <li key={r.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground">{r.name}</span>
                </div>
                <span className="font-medium tabular-nums">{r.value}%</span>
              </li>
            ))}
          </ul>
        </ChartCard>

        <ChartCard title="Churn trend" subtitle="Cancellations per day" className="lg:col-span-3">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={churnTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "var(--popover-foreground)",
                }}
              />
              <Line
                type="monotone"
                dataKey="churned"
                stroke="var(--primary)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "var(--primary)" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Quotes + Actions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold">Customer feedback</h3>
              <p className="text-sm text-muted-foreground">Verbatim quotes from recent interviews.</p>
            </div>
            <Button size="sm" variant="ghost">View all</Button>
          </div>
          <ul className="mt-5 space-y-4">
            {quotes.map((q, i) => (
              <li key={i} className="rounded-lg border border-border bg-background p-4">
                <Quote className="h-4 w-4 text-muted-foreground" />
                <p className="mt-2 text-sm leading-relaxed text-foreground">{q.text}</p>
                <p className="mt-2 text-xs text-muted-foreground">{q.customer}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold">Recommended actions</h3>
              <p className="text-sm text-muted-foreground">AI-suggested moves to reduce churn.</p>
            </div>
            <Lightbulb className="h-4 w-4 text-primary" />
          </div>
          <ul className="mt-5 space-y-3">
            {actions.map((a) => (
              <li key={a.title}>
                <button className="group flex w-full items-center justify-between rounded-lg border border-border bg-background p-4 text-left transition hover:border-primary/40 hover:bg-accent">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{a.title}</span>
                      <span
                        className={
                          "rounded-full px-2 py-0.5 text-[10px] font-medium " +
                          (a.impact === "High"
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground")
                        }
                      >
                        {a.impact} impact
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{a.desc}</p>
                  </div>
                  <ChevronRight className="ml-4 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon, label, value, delta, trend, tone, valueClass,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  tone: "good" | "bad" | "warn" | "neutral";
  valueClass?: string;
}) {
  const toneClass =
    tone === "good"
      ? "text-success"
      : tone === "bad"
      ? "text-destructive"
      : tone === "warn"
      ? "text-warning"
      : "text-muted-foreground";
  const TrendIcon = trend === "up" ? ArrowUpRight : ArrowDownRight;
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className={"mt-3 text-2xl font-semibold tracking-tight " + (valueClass ?? "")}>{value}</p>
      <p className={"mt-1 inline-flex items-center gap-1 text-xs " + toneClass}>
        <TrendIcon className="h-3.5 w-3.5" />
        {delta}
      </p>
    </div>
  );
}

function ChartCard({
  title, subtitle, children, className,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={"rounded-xl border border-border bg-card p-6 shadow-soft " + (className ?? "")}>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}
