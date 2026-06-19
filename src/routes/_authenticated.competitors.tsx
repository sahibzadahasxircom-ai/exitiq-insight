import { createFileRoute } from "@tanstack/react-router";
import { Swords, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/competitors")({
  head: () => ({ meta: [{ title: "Competitors — ExitIQ" }] }),
  component: Competitors,
});

const competitors = [
  {
    name: "Notion",
    mentions: 38,
    share: 28,
    reasons: ["All-in-one workspace", "Better docs & wiki", "Team already uses it"],
  },
  {
    name: "Linear",
    mentions: 24,
    share: 18,
    reasons: ["Cleaner UX", "Keyboard-first workflow", "Faster ticket creation"],
  },
  {
    name: "Airtable",
    mentions: 17,
    share: 12,
    reasons: ["More flexible data model", "Cheaper at our team size", "Better integrations"],
  },
  {
    name: "Built in-house",
    mentions: 11,
    share: 8,
    reasons: ["Cost control", "Custom workflow needs", "Engineering bandwidth available"],
  },
];

function Competitors() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Competitor intelligence</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Who customers switched to — and why they said so.
        </p>
      </div>

      <div className="grid gap-4">
        {competitors.map((c) => (
          <article key={c.name} className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Swords className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-base font-semibold">{c.name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Mentioned in {c.mentions} cancellations · {c.share}% of churn
                  </p>
                </div>
              </div>
              <div className="w-40">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-foreground"
                    style={{ width: `${Math.min(c.share * 3, 100)}%` }}
                  />
                </div>
              </div>
            </div>
            <ul className="mt-5 space-y-2 border-t border-border pt-4">
              {c.reasons.map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground/60" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
