import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line,
} from "recharts";
import {
  Sparkles, ArrowUpRight, ArrowDownRight, Minus, Quote, ArrowRight,
} from "lucide-react";
import {
  EXECUTIVE_BRIEFING, CUSTOMER_VOICE, CHURN_DRIVERS, WEEKLY_BRIEF,
  REVENUE_LEAKAGE, RECOMMENDATIONS, COMPETITORS, FEATURE_REQUESTS,
  CHURN_TREND, formatMoney,
} from "@/lib/mock-intelligence";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Executive Intelligence — ExitIQ" },
      { name: "description", content: "AI-generated churn intelligence for SaaS founders — the story of why customers are leaving, what's changing, and what to do next." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-16 px-6 py-10">
      <Hero />
      <ExecutiveBriefing />
      <CustomerVoice />
      <ChurnDrivers />
      <PriorityCenter />
      <RevenueLeakage />
      <CompetitorSignal />
      <FeatureDemand />
      <WeeklyBrief />
      <Trends />
    </div>
  );
}

/* ---------- Hero ---------- */
function Hero() {
  const now = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  return (
    <header className="space-y-2">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{now} · Executive briefing</p>
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Here's what's happening inside your business.</h1>
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Synthesised from every completed exit interview this quarter. Not metrics — decisions.
      </p>
    </header>
  );
}

/* ---------- Executive Briefing ---------- */
function ExecutiveBriefing() {
  const b = EXECUTIVE_BRIEFING;
  return (
    <section className="rounded-2xl border border-border bg-gradient-to-br from-card to-muted/30 p-8 shadow-soft md:p-10">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
        <Sparkles className="h-3.5 w-3.5" /> This week's headline
      </div>
      <h2 className="mt-4 text-2xl font-medium leading-snug tracking-tight md:text-[28px]">
        {b.headline}
      </h2>
      <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
        {b.detail}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-6 border-t border-border pt-6 md:grid-cols-4">
        <BriefStat label="Revenue at risk" value={formatMoney(b.revenue_at_risk)} />
        <BriefStat label="Customers affected" value={String(b.affected_customers)} />
        <BriefStat label="Product area" value={b.product_area} small />
        <BriefStat label="AI confidence" value={`${Math.round(b.confidence * 100)}%`} />
      </div>

      <div className="mt-6 rounded-xl border border-primary/20 bg-primary/[0.04] p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Next best action</p>
        <p className="mt-2 text-[15px] leading-relaxed">{b.next_best_action}</p>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">{b.window}</p>
    </section>
  );
}

function BriefStat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className={`mt-1.5 font-medium tracking-tight ${small ? "text-sm" : "text-lg"}`}>{value}</p>
    </div>
  );
}

/* ---------- Customer Voice ---------- */
function CustomerVoice() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % CUSTOMER_VOICE.length), 6500);
    return () => clearInterval(t);
  }, []);
  const q = CUSTOMER_VOICE[idx];
  return (
    <section className="space-y-6">
      <SectionHead eyebrow="Customer voice" title="What they're actually saying" />
      <div className="rounded-2xl border border-border bg-card p-10 md:p-14">
        <Quote className="h-6 w-6 text-primary/40" />
        <blockquote key={idx} className="mt-6 text-2xl font-normal leading-[1.35] tracking-tight text-foreground md:text-[32px] md:leading-[1.25] animate-in fade-in duration-700">
          "{q.quote}"
        </blockquote>
        <p className="mt-6 text-xs uppercase tracking-[0.16em] text-muted-foreground">{q.attribution}</p>
        <div className="mt-8 flex gap-1.5">
          {CUSTOMER_VOICE.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Quote ${i + 1}`}
              className={`h-1 rounded-full transition-all ${i === idx ? "w-8 bg-primary" : "w-4 bg-muted"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Churn Drivers ---------- */
function ChurnDrivers() {
  return (
    <section className="space-y-6">
      <SectionHead eyebrow="Root causes" title="Why customers are leaving" subtitle="Normalised into business categories, ranked by revenue impact." />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {CHURN_DRIVERS.map((d) => (
          <article key={d.name} className="group rounded-2xl border border-border bg-card p-6 transition hover:border-foreground/20">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-lg font-medium tracking-tight">{d.name}</h3>
              <TrendGlyph trend={d.trend} />
            </div>
            <div className="mt-5 flex items-baseline gap-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Share of churn</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight">{d.pct}<span className="text-lg text-muted-foreground">%</span></p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Revenue impact</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight">{formatMoney(d.revenue)}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Customers</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight">{d.customers}</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{d.explanation}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------- AI Priority Center ---------- */
function PriorityCenter() {
  return (
    <section className="space-y-6">
      <SectionHead
        eyebrow="AI priority center"
        title="What to do next"
        subtitle="Strategic product advice synthesised across every interview, ranked by expected revenue impact."
      />
      <div className="space-y-4">
        {RECOMMENDATIONS.slice(0, 5).map((r, i) => (
          <article key={r.id} className="rounded-2xl border border-border bg-card p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div className="flex items-baseline gap-4">
                <span className="text-xs font-medium tabular-nums text-muted-foreground">0{i + 1}</span>
                <h3 className="max-w-2xl text-lg font-medium leading-snug tracking-tight">{r.recommendation}</h3>
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {formatMoney(r.affected_revenue)} · {r.affected_customers} customers
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 border-t border-border pt-6 md:grid-cols-3">
              <PriorityBlock label="The problem">{r.problem}</PriorityBlock>
              <PriorityBlock label="Why it matters">{r.expected_impact}</PriorityBlock>
              <PriorityBlock label="AI reasoning">
                Consistent signal across {r.affected_customers} independent interviews with {Math.round(r.confidence * 100)}% confidence. Pattern is compounding, not one-off.
              </PriorityBlock>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PriorityBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm leading-relaxed">{children}</p>
    </div>
  );
}

/* ---------- Revenue Leakage ---------- */
function RevenueLeakage() {
  const total = REVENUE_LEAKAGE.reduce((s, r) => s + r.revenue, 0);
  const max = Math.max(...REVENUE_LEAKAGE.map((r) => r.revenue));
  return (
    <section className="space-y-6">
      <SectionHead
        eyebrow="Revenue leakage"
        title="Where product decisions are costing you money"
        subtitle={`${formatMoney(total)} ARR lost across the categories below.`}
      />
      <div className="rounded-2xl border border-border bg-card p-2">
        {REVENUE_LEAKAGE.map((r, i) => (
          <div key={r.category} className={`grid grid-cols-1 gap-4 px-6 py-6 md:grid-cols-[1fr_auto] md:items-center ${i > 0 ? "border-t border-border" : ""}`}>
            <div>
              <div className="flex items-baseline gap-3">
                <h3 className="text-base font-medium tracking-tight">{r.label}</h3>
                <TrendGlyph trend={r.trend} />
              </div>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{r.product_decision}</p>
              <div className="mt-3 h-1 w-full max-w-md overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-foreground/70" style={{ width: `${(r.revenue / max) * 100}%` }} />
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-semibold tracking-tight">{formatMoney(r.revenue)}</p>
              <p className="text-xs text-muted-foreground">{r.customers} customers · {r.pct}%</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Competitor Signal ---------- */
function CompetitorSignal() {
  return (
    <section className="space-y-6">
      <SectionHead
        eyebrow="Competitive intelligence"
        title="Who's winning your customers, and why"
        action={<Link to="/competitors" className="text-sm font-medium text-primary hover:underline">Full analysis →</Link>}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {COMPETITORS.slice(0, 4).map((c) => (
          <article key={c.name} className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-baseline justify-between">
              <h3 className="text-lg font-medium tracking-tight">{c.name}</h3>
              <TrendGlyph trend={c.trend} />
            </div>
            <div className="mt-4 flex items-baseline gap-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Mentions</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">{c.mentions}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Revenue lost</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">{formatMoney(c.revenue)}</p>
              </div>
            </div>
            {c.reasons.length > 0 && (
              <div className="mt-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Why they win</p>
                <ul className="mt-2 space-y-1.5">
                  {c.reasons.slice(0, 3).map((r) => (
                    <li key={r} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground/40" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------- Feature Demand ---------- */
function FeatureDemand() {
  const top = FEATURE_REQUESTS.slice(0, 6);
  return (
    <section className="space-y-6">
      <SectionHead
        eyebrow="Feature demand"
        title="What customers are asking for"
        subtitle="Grouped and ranked by revenue attached — not raw mention count."
        action={<Link to="/insights" className="text-sm font-medium text-primary hover:underline">All requests →</Link>}
      />
      <div className="rounded-2xl border border-border bg-card">
        {top.map((f, i) => (
          <div key={f.name} className={`grid grid-cols-[1fr_auto_auto] items-center gap-6 px-6 py-5 ${i > 0 ? "border-t border-border" : ""}`}>
            <div>
              <p className="font-medium tracking-tight">{f.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {f.customers} customers · {f.mentions} mentions · retention impact: {f.priority === "critical" ? "very high" : f.priority === "high" ? "high" : "moderate"}
              </p>
            </div>
            <TrendGlyph trend={f.trend} />
            <p className="w-20 text-right text-base font-semibold tabular-nums tracking-tight">{formatMoney(f.revenue)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Weekly AI Brief ---------- */
function WeeklyBrief() {
  return (
    <section className="space-y-6">
      <SectionHead eyebrow={WEEKLY_BRIEF.week_of} title="Weekly AI product brief" subtitle="Written for the founder. Read it like an internal memo, not a dashboard." />
      <article className="space-y-8 rounded-2xl border border-border bg-card p-8 md:p-12">
        {WEEKLY_BRIEF.sections.map((s) => (
          <div key={s.title}>
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">{s.title}</h3>
            <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-foreground/90">{s.body}</p>
          </div>
        ))}
      </article>
    </section>
  );
}

/* ---------- Trends (only the two that matter) ---------- */
function Trends() {
  return (
    <section className="space-y-6">
      <SectionHead eyebrow="Trends" title="The two charts worth looking at" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Revenue lost per month" subtitle="Escalating trajectory — every month sets a new high.">
          <ResponsiveContainer>
            <BarChart data={CHURN_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => `$${Math.round(Number(v) / 1000)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatMoney(v)} />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]} fill="oklch(0.52 0.18 257)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Customer sentiment" subtitle="Rolling positivity score across all completed interviews.">
          <ResponsiveContainer>
            <LineChart data={CHURN_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} domain={[30, 80]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="sentiment" stroke="oklch(0.62 0.15 155)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </section>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      <div className="mt-5 h-56">{children}</div>
    </div>
  );
}

/* ---------- Atoms ---------- */

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
  color: "var(--foreground)",
};

function SectionHead({
  eyebrow, title, subtitle, action,
}: { eyebrow: string; title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function TrendGlyph({ trend }: { trend: "up" | "down" | "flat" }) {
  if (trend === "up") return <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive"><ArrowUpRight className="h-3.5 w-3.5" /> rising</span>;
  if (trend === "down") return <span className="inline-flex items-center gap-1 text-xs font-medium text-success"><ArrowDownRight className="h-3.5 w-3.5" /> falling</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground"><Minus className="h-3.5 w-3.5" /> steady</span>;
}
