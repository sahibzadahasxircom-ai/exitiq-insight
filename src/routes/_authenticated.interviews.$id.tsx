import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { format } from "date-fns";
import { ArrowLeft, Copy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, type InterviewStatus } from "@/components/status-badge";
import { getInterviewSession } from "@/lib/interview.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/interviews/$id")({
  head: ({ params }) => ({ meta: [{ title: `Interview ${params.id.slice(0, 8)} — ExitIQ` }] }),
  component: InterviewDetail,
});

function InterviewDetail() {
  const { id } = Route.useParams();
  const getFn = useServerFn(getInterviewSession);
  const { data, isLoading, error } = useQuery({
    queryKey: ["interview-session", id],
    queryFn: () => getFn({ data: { id } }),
  });

  if (isLoading) return <div className="px-6 py-10 text-sm text-muted-foreground">Loading…</div>;
  if (error || !data) return <div className="px-6 py-10 text-sm text-muted-foreground">Interview not found.</div>;

  const { session, messages, insight } = data;
  const status = session.interview_status as InterviewStatus;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">
      <Link to="/interviews" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All cancellations
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {session.customer_name || "Anonymous customer"}
            </h1>
            <StatusBadge status={status} />
          </div>
          <p className="text-sm text-muted-foreground">{session.customer_email || "No email on file"}</p>
          <p className="text-xs text-muted-foreground">
            Started {format(new Date(session.created_at), "MMM d, yyyy · HH:mm")}
            {session.completed_at && ` · Completed ${format(new Date(session.completed_at), "MMM d · HH:mm")}`}
          </p>
        </div>
        <Button
          variant="outline" size="sm" className="gap-2"
          onClick={() => {
            const url = `${window.location.origin}/interview/${session.id}`;
            navigator.clipboard.writeText(url);
            toast.success("Interview link copied");
          }}
        >
          <Copy className="h-4 w-4" /> Copy interview link
        </Button>
      </div>

      {insight && (
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-foreground" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                AI insight
              </span>
            </div>
            <div>
              <h3 className="text-base font-semibold">{insight.churn_reason}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{insight.summary}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {insight.category && <Badge variant="outline" className="capitalize">{insight.category}</Badge>}
              {insight.sentiment && <Badge variant="outline" className="capitalize">{insight.sentiment}</Badge>}
              {insight.journey_failure_point && (
                <Badge variant="outline" className="capitalize">Failure: {insight.journey_failure_point.replace("_", " ")}</Badge>
              )}
              {insight.competitor_mentioned && (
                <Badge variant="outline">Competitor: {insight.competitor_mentioned}</Badge>
              )}
              {insight.pricing_issue && <Badge variant="outline">Pricing</Badge>}
              {insight.onboarding_issue && <Badge variant="outline">Onboarding</Badge>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Block label="Root cause" value={insight.root_cause ?? "—"} />
              <Block
                label="Missing features"
                value={
                  insight.missing_features && insight.missing_features.length > 0
                    ? insight.missing_features.join(", ")
                    : "—"
                }
              />
            </div>
            {insight.quote && (
              <blockquote className="rounded-lg border-l-2 border-foreground/40 bg-muted/30 px-4 py-3 text-sm italic text-foreground">
                "{insight.quote}"
              </blockquote>
            )}
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold tracking-tight">Transcript</h2>
        {messages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            The interview hasn't started yet.
          </div>
        ) : (
          <Card>
            <CardContent className="space-y-5 p-5">
              {messages.map((m) => (
                <Transcript key={m.id} role={m.role as "assistant" | "user"} text={m.message_content} ts={m.created_at} />
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function Block({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-foreground">{value}</p>
    </div>
  );
}

function Transcript({ role, text, ts }: { role: "assistant" | "user"; text: string; ts: string }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] ${isUser ? "items-end text-right" : "items-start"}`}>
        <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {isUser ? "Customer" : "Interviewer"} · {format(new Date(ts), "HH:mm")}
        </p>
        <div
          className={
            isUser
              ? "inline-block rounded-2xl rounded-tr-md bg-foreground px-4 py-2.5 text-sm leading-relaxed text-background"
              : "inline-block rounded-2xl rounded-tl-md border border-border bg-muted/40 px-4 py-2.5 text-sm leading-relaxed text-foreground"
          }
        >
          {text}
        </div>
      </div>
    </div>
  );
}
