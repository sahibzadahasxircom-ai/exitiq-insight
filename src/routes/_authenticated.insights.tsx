import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { format } from "date-fns";
import { Sparkles, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { listInsights } from "@/lib/interview.functions";

export const Route = createFileRoute("/_authenticated/insights")({
  head: () => ({ meta: [{ title: "Insights — ExitIQ" }] }),
  component: Insights,
});

function Insights() {
  const fn = useServerFn(listInsights);
  const { data: insights = [], isLoading } = useQuery({ queryKey: ["insights"], queryFn: () => fn() });

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Insights</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Structured intelligence extracted from every completed exit interview.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : insights.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No insights yet. Once a customer completes an interview, ExitIQ will extract structured findings here.
        </div>
      ) : (
        <div className="grid gap-4">
          {insights.map((i) => (
            <Link
              to="/interviews/$id"
              params={{ id: i.session_id }}
              key={i.id}
              className="group block rounded-xl border border-border bg-card p-6 shadow-soft transition-colors hover:border-foreground/30"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold">{i.churn_reason ?? "Untitled insight"}</h3>
                    {i.category && <Badge variant="outline" className="capitalize">{i.category}</Badge>}
                    {i.sentiment && <Badge variant="outline" className="capitalize">{i.sentiment}</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{i.summary}</p>
                  {i.quote && (
                    <p className="mt-3 border-l-2 border-foreground/30 pl-3 text-sm italic text-foreground/80">
                      "{i.quote}"
                    </p>
                  )}
                  <p className="mt-3 text-xs text-muted-foreground">
                    {format(new Date(i.created_at), "MMM d, yyyy · HH:mm")}
                  </p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
