import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getInterviewSession, getInterviewMessages } from "@/lib/interview.functions";

export const Route = createFileRoute("/_authenticated/interviews/$id")({
  head: ({ params }) => ({ meta: [{ title: `Interview ${params.id} — leaveesy` }] }),
  component: InterviewAnalysis,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center text-sm text-slate-500">
      Interview not found.{" "}
      <Link to="/interviews" className="text-blue-700 hover:underline">Back to cancellations</Link>.
    </div>
  ),
});

/** Build highlight phrases from the insight data */
function buildHighlightPhrases(insight: any): string[] {
  if (!insight) return [];

  const raw = [
    insight.summary || "",
    insight.category || "",
    insight.sentiment || "",
  ]
    .flatMap((s) =>
      s
        .split(/[,.—·\s]+/)
        .map((x) => x.trim())
        .filter((x) => x.length > 4)
    );

  return Array.from(new Set(raw)).sort((a, b) => b.length - a.length);
}

function highlight(text: string, phrases: string[]) {
  if (phrases.length === 0) return text;
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(${phrases.slice(0, 30).map(escape).join("|")})`, "gi");
  const parts = text.split(pattern);
  return parts.map((part, idx) =>
    idx % 2 === 1 ? (
      <mark key={idx} className="rounded-[3px] bg-yellow-200/70 px-0.5 py-0 text-slate-900">
        {part}
      </mark>
    ) : (
      <span key={idx}>{part}</span>
    )
  );
}

function InterviewAnalysis() {
  const { id } = Route.useParams();
  const getInterviewFn = useServerFn(getInterviewSession);
  const getMessagesFn = useServerFn(getInterviewMessages);

  const { data: interviewData, isLoading } = useQuery({
    queryKey: ["interview", id],
    queryFn: () => getInterviewFn({ data: { id } }),
    retry: false,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["interview-messages", id],
    queryFn: () => getMessagesFn({ data: { sessionId: id } }),
    retry: false,
    enabled: !!interviewData?.session,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!interviewData?.session) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center text-sm text-slate-500">
        Interview not found.{" "}
        <Link to="/interviews" className="text-blue-700 hover:underline">Back to cancellations</Link>.
      </div>
    );
  }

  const session = interviewData.session;
  const insight = interviewData.insight;
  const phrases = buildHighlightPhrases(insight);

  return (
    <div className="mx-auto max-w-4xl space-y-8 md:space-y-10 px-4 md:px-6 py-6 md:py-10">
      <Link
        to="/interviews"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> Cancellations
      </Link>

      {/* Header */}
      <header className="border-b border-slate-200 pb-6 md:pb-8">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
          {session.customer_name || "Anonymous Customer"}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {session.customer_email || "No email provided"}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {session.interview_status === 'completed'
            ? `Completed ${format(new Date(session.completed_at || session.created_at), "MMMM d, yyyy · HH:mm")}`
            : `Started ${format(new Date(session.created_at), "MMMM d, yyyy · HH:mm")}`
          }
        </p>

        <div className="mt-4 md:mt-6 grid grid-cols-2 gap-4 md:gap-6">
          <Stat label="Status" value={session.interview_status || "Active"} capitalize />
          <Stat label="Progress" value={session.interview_progress || "Started"} capitalize />
          <Stat label="Primary Category" value={insight?.category || "Not categorized"} capitalize />
          <Stat label="Sentiment" value={insight?.sentiment || "Neutral"} capitalize />
        </div>
      </header>

      {/* Summary */}
      {insight?.summary && (
        <Section title="Summary">
          <p className="text-[15px] leading-relaxed text-slate-800">{insight.summary}</p>
        </Section>
      )}

      {/* Conversation Messages */}
      {messages.length > 0 && (
        <Section title="Conversation">
          <div className="space-y-3 md:space-y-4">
            {messages.map((message: any) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[80%] rounded-lg p-3 md:p-4 ${
                    message.role === 'user'
                      ? 'bg-blue-50 text-slate-900'
                      : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  <p className="text-xs font-medium mb-1 md:mb-2">
                    {message.role === 'user' ? 'Customer' : 'leaveesy'}
                  </p>
                  <p className="text-sm leading-relaxed">
                    {message.role === 'user' ? highlight(message.message_content, phrases) : message.message_content}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 md:mt-2">
                    {format(new Date(message.created_at), "HH:mm")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Key Insights */}
      {insight && (
        <Section title="Key Insights">
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Primary Category</p>
              <p className="mt-1 text-base font-medium text-slate-900">{insight.category || "Not categorized"}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Sentiment</p>
              <p className="mt-1 text-sm text-slate-700">{insight.sentiment || "Neutral"}</p>
            </div>
            {insight.quote && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Notable Quote</p>
                <p className="mt-1 text-sm italic text-slate-700">"{insight.quote}"</p>
              </div>
            )}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold tracking-tight text-slate-900 mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Stat({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={`mt-1.5 font-semibold tracking-tight text-slate-900 ${capitalize ? "capitalize" : ""}`}>{value}</p>
    </div>
  );
}