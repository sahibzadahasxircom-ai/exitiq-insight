import { createFileRoute } from "@tanstack/react-router";
import { Lightbulb, TrendingDown, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/insights")({
  head: () => ({ meta: [{ title: "Insights — ExitIQ" }] }),
  component: Insights,
});

const insights = [
  { icon: TrendingDown, title: "Onboarding is the #1 churn driver", body: "42% of cancelled customers cite friction in the first 10 minutes. Streamlining setup is the highest-leverage fix this quarter.", tag: "Critical" },
  { icon: TrendingUp, title: "Annual plans correlate with retention", body: "Customers on annual plans churn 38% less than monthly. Consider promoting annual upgrades during onboarding.", tag: "Opportunity" },
  { icon: Lightbulb, title: "Missing reporting filters appear repeatedly", body: "21% of churn quotes mention reporting limitations. A targeted release could win back recently-churned accounts.", tag: "Product" },
];

function Insights() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Insights</h1>
        <p className="mt-1 text-sm text-muted-foreground">AI-generated patterns from your exit interviews.</p>
      </div>
      <div className="grid gap-4">
        {insights.map((i) => (
          <article key={i.title} className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <i.icon className="h-4 w-4" />
                </span>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{i.tag}</span>
                  <h3 className="mt-0.5 text-base font-semibold">{i.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{i.body}</p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
