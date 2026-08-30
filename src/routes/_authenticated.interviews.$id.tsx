import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { getMockInterview, formatMoney, type MockInterview } from "@/lib/mock-intelligence";

export const Route = createFileRoute("/_authenticated/interviews/$id")({
  head: ({ params }) => ({ meta: [{ title: `Interview ${params.id} — leaveesy` }] }),
  loader: ({ params }) => {
    const interview = getMockInterview(params.id);
    if (!interview) throw notFound();
    return { interview };
  },
  component: InterviewAnalysis,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center text-sm text-slate-500">
      Interview not found.{" "}
      <Link to="/interviews" className="text-blue-700 hover:underline">Back to cancellations</Link>.
    </div>
  ),
});

/** Build highlight phrases from the structured intelligence,
 * then wrap them (case-insensitive) inside customer statements. */
function buildHighlightPhrases(i: MockInterview): string[] {
  const raw = [
    ...i.pain_points,
    ...i.workflow_problems,
    ...i.pricing_concerns,
    ...i.onboarding_issues,
    ...i.support_issues,
    ...i.requested_features,
    i.competitor ?? "",
    i.expectation_gap ?? "",
  ]
    .flatMap((s) =>
      s
        .split(/[,.—·]/)
        .map((x) => x.trim())
        .filter((x) => x.length > 4)
    );
  // Also add notable keywords derived from primary_reason (nouns > 4 chars)
  const nouns = i.primary_reason
    .split(/[\s—,·]+/)
    .map((w) => w.replace(/[^\w-]/g, ""))
    .filter((w) => w.length > 4);

  return Array.from(new Set([...raw, ...nouns])).sort((a, b) => b.length - a.length);
}

function highlight(text: string, phrases: string[]) {
  if (phrases.length === 0) return text;
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(${phrases.slice(0, 30).map(escape).join("|")})`, "gi");
  const parts = text.split(pattern);
  return parts.map((part, idx) =>
    idx % 2 === 1 ? (
      <mark key={idx} className="rounded-[3px] bg-blue-200/70 px-0.5 py-0 text-slate-900">
        {part}
      </mark>
    ) : (
      <span key={idx}>{part}</span>
    )
  );
}

function InterviewAnalysis() {
  const { interview: i } = Route.useLoaderData() as { interview: MockInterview };
  const phrases = buildHighlightPhrases(i);

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-6 py-10">
      <Link
        to="/interviews"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> Cancellations
      </Link>

      {/* Header */}
      <header className="border-b border-slate-200 pb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          {i.customer_name}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {i.company} · {i.plan} plan · {i.segment} · {i.country}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Interviewed {format(new Date(i.completed_at), "MMMM d, yyyy · HH:mm")} · {i.duration_min} minute conversation
        </p>

        <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
          <Stat label="Monthly revenue" value={formatMoney(i.mrr)} />
          <Stat label="Annual revenue lost" value={formatMoney(i.mrr * 12)} />
          <Stat label="Retention opportunity" value={i.retention_opportunity} capitalize />
          <Stat label="Tenure signal" value={i.sentiment_confidence > 0.85 ? "Strong" : "Moderate"} />
        </div>
      </header>

      {/* Summary */}
      <Section title="Summary">
        <p className="text-[15px] leading-relaxed text-slate-800">{i.executive_summary}</p>
      </Section>

      {/* Why they left */}
      <Section title="Why they left">
        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Primary reason</p>
            <p className="mt-1 text-base font-medium text-slate-900">{i.primary_reason}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Root cause</p>
            <p className="mt-1 text-[15px] leading-relaxed text-slate-800">{i.root_cause}</p>
          </div>
          {i.secondary_factors.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Contributing factors</p>
              <ul className="mt-2 space-y-1.5">
                {i.secondary_factors.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Section>

      {/* Competitor / expectation gap */}
      {(i.competitor || i.expectation_gap) && (
        <Section title="Context">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {i.competitor && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Chose instead</p>
                <p className="mt-1 text-base font-semibold text-slate-900">{i.competitor}</p>
                {i.competitor_reason && <p className="mt-1 text-sm text-slate-600">{i.competitor_reason}</p>}
              </div>
            )}
            {i.expectation_gap && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Expectation gap</p>
                <p className="mt-1 text-sm text-slate-700">{i.expectation_gap}</p>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Feedback columns */}
      <Section title="What they told us">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <FeedbackList title="Product pain points" items={i.pain_points} />
          <FeedbackList title="Workflow problems" items={i.workflow_problems} />
          <FeedbackList title="Requested features" items={i.requested_features} />
          <FeedbackList title="Pricing concerns" items={i.pricing_concerns} />
          <FeedbackList title="Onboarding issues" items={i.onboarding_issues} />
          <FeedbackList title="Support issues" items={i.support_issues} />
        </div>
      </Section>

      {/* Recommended actions */}
      <Section title="Recommended actions">
        <ol className="space-y-3">
          {i.recommended_actions.map((a, idx) => (
            <li key={a} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                {idx + 1}
              </span>
              <span className="text-sm text-slate-800">{a}</span>
            </li>
          ))}
        </ol>
      </Section>

      {/* Transcript with yellow highlights */}
      <Section
        title="Interview transcript"
        subtitle="Customer statements are shown as-said. Key phrases are highlighted."
      >
        <div className="space-y-6">
          {i.transcript.map((m, idx) => {
            const isCustomer = m.role === "user";
            return (
              <div key={idx} className="border-l-2 pl-4" style={{ borderColor: isCustomer ? "#2563eb" : "#e2e8f0" }}>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {isCustomer ? "Customer" : "Interviewer"} · {format(new Date(m.ts), "HH:mm")}
                </p>
                <p className="text-[15px] leading-relaxed text-slate-800">
                  {isCustomer ? highlight(m.content, phrases) : m.content}
                </p>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function FeedbackList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</p>
      <ul className="mt-2 space-y-1.5">
        {items.map((x) => (
          <li key={x} className="flex items-start gap-2 text-sm text-slate-700">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value, capitalize = false }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={`mt-1.5 text-sm font-semibold text-slate-900 ${capitalize ? "capitalize" : ""}`}>{value}</p>
    </div>
  );
}

