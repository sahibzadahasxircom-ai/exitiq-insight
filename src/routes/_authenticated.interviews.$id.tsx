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

  return (
    <div className="mx-auto max-w-4xl space-y-8 md:space-y-10 px-4 md:px-6 py-6 md:py-10">
      <Link
        to="/interviews"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> Cancellations
      </Link>

      {/* Header - Name and Category only */}
      <header className="border-b border-slate-200 pb-6 md:pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
              {session.customer_name || "Anonymous Customer"}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {session.customer_email || "No email provided"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-500">Category</p>
            <p className="mt-1 text-lg font-semibold text-slate-900 capitalize">
              {insight?.category || "Not categorized"}
            </p>
          </div>
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
                    {message.message_content}
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