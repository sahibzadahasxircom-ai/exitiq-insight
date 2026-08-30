import { createFileRoute } from "@tanstack/react-router";
import { Swords, ArrowRight, ArrowUpRight, ArrowDownRight, Minus, Lightbulb } from "lucide-react";
import { COMPETITORS, formatMoney } from "@/lib/mock-intelligence";

export const Route = createFileRoute("/_authenticated/competitors")({
  head: () => ({ meta: [{ title: "Competitor Intelligence — leaveesy" }] }),
  component: Competitors,
});

function Competitors() {
  const maxMentions = Math.max(1, ...COMPETITORS.map((c) => c.mentions));

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Competitor intelligence</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ranked by mentions across completed interviews. Includes reasons customers switched and features they cited.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {COMPETITORS.map((c) => (
          <article key={c.name} className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Swords className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-base font-semibold">{c.name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {c.mentions} mentions · {formatMoney(c.revenue)} ARR lost
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TrendPill trend={c.trend} />
                <div className="w-40">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(c.mentions / maxMentions) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 border-t border-border pt-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Why customers switched
                </p>
                <ul className="space-y-1.5">
                  {c.reasons.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground/60" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Features they mentioned
                </p>
                {c.features.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No specific features cited.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {c.features.map((f) => (
                      <span key={f} className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        <Lightbulb className="h-3 w-3" /> {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function TrendPill({ trend }: { trend: "up" | "down" | "flat" }) {
  if (trend === "up") return <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive"><ArrowUpRight className="h-3 w-3" /> gaining</span>;
  if (trend === "down") return <span className="inline-flex items-center gap-1 text-xs font-medium text-success"><ArrowDownRight className="h-3 w-3" /> losing ground</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground"><Minus className="h-3 w-3" /> steady</span>;
}

