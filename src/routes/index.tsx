import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, MessageSquareText, Sparkles, ShieldCheck, LineChart, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ExitIQ — Understand why customers leave" },
      { name: "description", content: "AI-powered exit interviews and churn intelligence. Stop guessing why customers leave — fix churn before it grows." },
      { property: "og:title", content: "ExitIQ — Churn intelligence for SaaS" },
      { property: "og:description", content: "Run AI-driven exit interviews and surface the real reasons customers leave." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <Logo />
            <span className="text-base font-semibold tracking-tight">ExitIQ</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground transition-colors">Product</a>
            <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#benefits" className="hover:text-foreground transition-colors">Benefits</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">View dashboard</Button>
            </Link>
            <Link to="/exit-interview">
              <Button size="sm">Try demo</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(80% 50% at 50% 0%, color-mix(in oklab, var(--primary) 12%, transparent), transparent 70%)",
          }}
        />
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-24 text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground shadow-soft">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI-powered churn intelligence
          </div>
          <h1 className="mx-auto max-w-3xl text-balance text-5xl font-semibold tracking-tight md:text-6xl">
            Understand why customers leave.{" "}
            <span className="text-muted-foreground">Fix churn before it grows.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-muted-foreground">
            ExitIQ runs AI-driven exit interviews with your churning customers and turns raw feedback into clear, founder-ready insights.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link to="/exit-interview">
              <Button size="lg" className="gap-2">
                Start exit interview demo <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline">View dashboard</Button>
            </Link>
          </div>

          {/* Preview mock */}
          <div className="mx-auto mt-16 max-w-4xl rounded-2xl border border-border bg-card p-3 shadow-elevated">
            <div className="rounded-xl border border-border/70 bg-muted/40 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                  { label: "Churned customers", value: "248" },
                  { label: "Revenue at risk", value: "$42,180" },
                  { label: "Top churn reason", value: "Onboarding friction" },
                ].map((k) => (
                  <div key={k.label} className="rounded-lg border border-border bg-background p-4 text-left">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{k.label}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight">{k.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-sm font-medium text-primary">What it does</p>
          <h2 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
            Replace one-line cancel forms with real conversations.
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                icon: MessageSquareText,
                title: "AI exit interviews",
                body: "An empathetic AI interviewer talks to every churning customer — no human required.",
              },
              {
                icon: Brain,
                title: "Pattern detection",
                body: "Cluster thousands of responses into the few root causes that actually move retention.",
              },
              {
                icon: BarChart3,
                title: "Founder dashboard",
                body: "A single view of churn reasons, revenue at risk, and what to do about it next.",
              },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-sm font-medium text-primary">How it works</p>
          <h2 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
            From cancellation to clarity in three steps.
          </h2>
          <ol className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { step: "01", title: "Customer cancels", body: "Trigger ExitIQ from your cancel flow, billing webhook, or CRM." },
              { step: "02", title: "AI runs the interview", body: "Adaptive follow-ups extract the real reason — not just a checkbox." },
              { step: "03", title: "You get insights", body: "Trends, quotes, and recommended actions land in your dashboard." },
            ].map((s) => (
              <li key={s.step} className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground">{s.step}</span>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-sm font-medium text-primary">Why teams use ExitIQ</p>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { icon: LineChart, title: "Reduce churn", body: "Catch root causes early and ship targeted fixes that compound." },
              { icon: ShieldCheck, title: "Improve retention", body: "Win-back signals surface customers worth a personal follow-up." },
              { icon: Brain, title: "Find root causes", body: "Stop debating opinions. Start operating on customer evidence." },
            ].map((b) => (
              <div key={b.title} className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <b.icon className="h-5 w-5 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">{b.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{b.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 flex flex-col items-center justify-between gap-6 rounded-2xl border border-border bg-card p-8 shadow-soft md:flex-row">
            <div>
              <h3 className="text-xl font-semibold tracking-tight">See ExitIQ in action</h3>
              <p className="mt-1 text-sm text-muted-foreground">Try the customer-facing interview, then explore the founder dashboard.</p>
            </div>
            <div className="flex gap-3">
              <Link to="/exit-interview"><Button>Start demo</Button></Link>
              <Link to="/dashboard"><Button variant="outline">Open dashboard</Button></Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Logo />
            <span>ExitIQ</span>
          </div>
          <p>© {new Date().getFullYear()} ExitIQ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function Logo() {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-soft">
      <span className="text-[11px] font-bold tracking-tight">EQ</span>
    </div>
  );
}
