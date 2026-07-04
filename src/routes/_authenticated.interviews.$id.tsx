import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  ArrowLeft, Sparkles, TrendingUp, DollarSign, ShieldCheck, Swords,
  Lightbulb, AlertTriangle, Users, Tag, Target, MessageSquare,
} from "lucide-react";
import { getMockInterview, CATEGORY_LABEL, formatMoney, type MockInterview } from "@/lib/mock-intelligence";

export const Route = createFileRoute("/_authenticated/interviews/$id")({
  head: ({ params }) => ({ meta: [{ title: `Interview ${params.id} — ExitIQ` }] }),
  loader: ({ params }) => {
    const interview = getMockInterview(params.id);
    if (!interview) throw notFound();
    return { interview };
  },
  component: InterviewAnalysis,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center text-sm text-muted-foreground">
      Interview not found. <Link to="/interviews" className="text-primary hover:underline">Back to library</Link>.
    </div>
  ),
});

const SENTIMENT_COLORS: Record<string, string> = {
  positive: "border-success/30 bg-success/10 text-success",
  neutral: "border-border bg-muted text-muted-foreground",
  frustrated: "border-warning/30 bg-warning/10 text-warning",
  angry: "border-destructive/30 bg-destructive/10 text-destructive",
};

function InterviewAnalysis() {
  const { interview: i } = Route.useLoaderData() as { interview: MockInterview };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <Link to="/interviews" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Interview library
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{i.customer_name}</h1>
            <PriorityPill priority={i.priority} />
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${SENTIMENT_COLORS[i.sentiment]}`}>
              {i.sentiment} · {Math.round(i.sentiment_confidence * 100)}%
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {i.company} · {i.plan} · {i.segment} · {i.country}
          </p>
          <p className="text-xs text-muted-foreground">
            Started {format(new Date(i.started_at), "MMM d, yyyy · HH:mm")} · Completed {format(new Date(i.completed_at), "HH:mm")} · {i.duration_min} min
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-right">
          <MiniStat label="Revenue impact" value={formatMoney(i.revenue_impact)} />
          <MiniStat label="AI confidence" value={`${Math.round(i.ai_confidence * 100)}%`} />
          <MiniStat label="Save opportunity" value={i.retention_opportunity} capitalize />
        </div>
      </div>

      {/* Executive summary */}
      <Card>
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Executive summary</p>
            <p className="mt-1 text-base leading-relaxed">{i.executive_summary}</p>
          </div>
        </div>
      </Card>

      {/* Reasons + root cause */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHead icon={Target} title="Primary churn reason" />
          <p className="text-sm font-medium">{i.primary_reason}</p>
          <div className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Secondary factors</p>
            {i.secondary_factors.length === 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">None identified.</p>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {i.secondary_factors.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                    {f}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Root cause</p>
            <p className="mt-1 text-sm">{i.root_cause}</p>
          </div>
        </Card>

        <Card>
          <CardHead icon={Swords} title="Competitor mentioned" />
          {i.competitor ? (
            <>
              <p className="text-base font-semibold">{i.competitor}</p>
              <p className="mt-2 text-sm text-muted-foreground">{i.competitor_reason}</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No competitor mentioned.</p>
          )}
          {i.expectation_gap && (
            <div className="mt-4 rounded-lg border border-warning/30 bg-warning/5 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-warning">Expectation gap</p>
              <p className="mt-1 text-sm">{i.expectation_gap}</p>
            </div>
          )}
        </Card>
      </div>

      {/* Feature requests + pain points */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHead icon={Lightbulb} title="Requested features" />
          <ListOrEmpty items={i.requested_features} empty="No features requested." />
        </Card>
        <Card>
          <CardHead icon={AlertTriangle} title="Product pain points" />
          <ListOrEmpty items={i.pain_points} empty="No pain points captured." />
        </Card>
        <Card>
          <CardHead icon={Users} title="Workflow problems" />
          <ListOrEmpty items={i.workflow_problems} empty="No workflow problems captured." />
        </Card>
        <Card>
          <CardHead icon={DollarSign} title="Pricing concerns" />
          <ListOrEmpty items={i.pricing_concerns} empty="No pricing concerns captured." />
        </Card>
        <Card>
          <CardHead icon={ShieldCheck} title="Onboarding issues" />
          <ListOrEmpty items={i.onboarding_issues} empty="Onboarding was not cited." />
        </Card>
        <Card>
          <CardHead icon={MessageSquare} title="Support issues" />
          <ListOrEmpty items={i.support_issues} empty="Support was not cited." />
        </Card>
      </div>

      {/* AI recommendations */}
      <Card>
        <CardHead icon={TrendingUp} title="AI recommended actions" subtitle="Ranked by expected impact" />
        <ul className="mt-2 space-y-2">
          {i.recommended_actions.map((a, idx) => (
            <li key={a} className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {idx + 1}
              </span>
              <span className="text-sm">{a}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Tags */}
      <Card>
        <CardHead icon={Tag} title="Auto-generated tags" />
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {CATEGORY_LABEL[i.category]}
          </span>
          {i.tags.map((t) => (
            <span key={t} className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              #{t}
            </span>
          ))}
        </div>
      </Card>

      {/* Transcript */}
      <Card>
        <CardHead icon={MessageSquare} title="Conversation transcript" subtitle="Raw interview — analysis lives above" />
        <div className="space-y-4">
          {i.transcript.map((m, idx) => {
            const isUser = m.role === "user";
            return (
              <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] ${isUser ? "text-right" : ""}`}>
                  <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {isUser ? "Customer" : "Interviewer"} · {format(new Date(m.ts), "HH:mm")}
                  </p>
                  <div className={
                    isUser
                      ? "inline-block rounded-2xl rounded-tr-md bg-foreground px-4 py-2.5 text-sm leading-relaxed text-background"
                      : "inline-block rounded-2xl rounded-tl-md border border-border bg-muted/40 px-4 py-2.5 text-sm leading-relaxed text-foreground"
                  }>
                    {m.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-border bg-card p-5 shadow-soft ${className}`}>{children}</div>;
}
function CardHead({
  icon: Icon, title, subtitle,
}: { icon: React.ComponentType<{ className?: string }>; title: string; subtitle?: string }) {
  return (
    <div className="mb-3 flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}
function ListOrEmpty({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">{empty}</p>;
  return (
    <ul className="space-y-1.5">
      {items.map((x) => (
        <li key={x} className="flex items-start gap-2 text-sm">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
          {x}
        </li>
      ))}
    </ul>
  );
}
function MiniStat({ label, value, capitalize = false }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`text-sm font-semibold ${capitalize ? "capitalize" : ""}`}>{value}</p>
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
