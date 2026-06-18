import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { format } from "date-fns";
import { ArrowLeft, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatusBadge, type InterviewStatus } from "@/components/status-badge";
import { InterviewProgress, stageLabel, type Stage } from "@/components/interview-progress";
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

  const { session, messages } = data;
  const status = session.interview_status as InterviewStatus;
  const stage = session.interview_progress as Stage;


  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">
      <div>
        <Link
          to="/interviews"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All interviews
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {session.customer_name || "Anonymous customer"}
            </h1>
            <StatusBadge status={status} />
          </div>
          <p className="text-sm text-muted-foreground">{session.customer_email || "No email on file"}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => {
            const url = `${window.location.origin}/interview/${session.id}`;
            navigator.clipboard.writeText(url);
            toast.success("Interview link copied");
          }}
        >
          <Copy className="h-4 w-4" /> Copy interview link
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <InterviewProgress stage={stage} />
          <Separator />
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <Meta label="Status" value={status} />
            <Meta label="Current stage" value={stageLabel(stage)} />
            <Meta label="Created" value={format(new Date(session.created_at), "MMM d, yyyy · HH:mm")} />
            <Meta
              label="Completed"
              value={session.completed_at ? format(new Date(session.completed_at), "MMM d, yyyy · HH:mm") : "—"}
            />
          </div>
        </CardContent>
      </Card>

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

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium capitalize text-foreground">{value}</p>
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
