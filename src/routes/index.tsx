import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Building2, LineChart, Rocket, Target, Users, Workflow, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingLiveDemo } from "@/components/landing-live-demo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ExitIQ — Understand why customers leave. Know what to fix." },
      {
        name: "description",
        content:
          "AI-powered exit interviews that automatically uncover churn reasons, competitor insights, revenue risks, and product opportunities.",
      },
      { property: "og:title", content: "ExitIQ — Churn intelligence for modern SaaS" },
      {
        property: "og:description",
        content:
          "Replace one-line cancel forms with professional AI conversations. Turn every cancellation into structured, actionable customer intelligence.",
      },
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
            <a href="#product" className="hover:text-foreground transition-colors">Product</a>
            <a href="#dashboard" className="hover:text-foreground transition-colors">Dashboard</a>
            <a href="#teams" className="hover:text-foreground transition-colors">Teams</a>
            <a href="#workflow" className="hover:text-foreground transition-colors">Workflow</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm">Get started</Button>
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
        <div className="mx-auto max-w-6xl px-6 pt-24 pb-24 text-center">
          <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Embedded churn intelligence for modern Softwares
          </div>
          <h1 className="mx-auto max-w-3xl text-balance text-5xl font-semibold tracking-tight md:text-[64px] md:leading-[1.05]">
            Understand why customers leave.{" "}
            <span className="text-muted-foreground">Know what to fix.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
            AI-powered exit interviews that automatically uncover churn reasons, competitor insights,
            revenue risks, and product opportunities.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link to="/auth">
              <Button size="lg" className="gap-2">
                Start free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/exit-interview">
              <Button size="lg" variant="outline">See the widget</Button>
            </Link>
          </div>

          {/* Live auto-playing demo */}
          <div className="mx-auto mt-16 max-w-5xl text-left">
            <LandingLiveDemo />
          </div>
        </div>
      </section>

      {/* Problem */}
      <section id="product" className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-sm font-medium text-primary">Stop losing the reason behind churn</p>
          <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">
            Most businesses know who left. ExitIQ shows you why.
          </h2>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground">
            Replace one-line cancellation forms with professional AI conversations that uncover the
            real reasons customers decide to leave.
          </p>
        </div>
      </section>

      {/* Interview quality */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-sm font-medium text-primary">Every customer gets a professional exit interview</p>
          <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">
            AI that asks better questions — and finds better answers.
          </h2>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground">
            Every interview adapts in real time, asks intelligent follow-up questions, and uncovers
            insights that traditional surveys never capture.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                icon: Workflow,
                title: "Adaptive conversations",
                body: "The interviewer changes direction based on each answer, drilling into the root cause instead of collecting checkboxes.",
              },
              {
                icon: Target,
                title: "Structured extraction",
                body: "Every conversation is parsed into category, root cause, competitor, pricing signal, and revenue impact.",
              },
              {
                icon: Zap,
                title: "Zero manual work",
                body: "Installs once. Runs on every cancellation. No forms to design, no interviews to schedule, no analysis to do by hand.",
              },
            ].map((f, i) => (
              <div key={f.title} className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <f.icon className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-semibold tabular-nums tracking-wider text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard capabilities */}
      <section id="dashboard" className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-sm font-medium text-primary">Everything your team needs in one dashboard</p>
          <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">
            From one conversation to company-wide intelligence.
          </h2>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground">
            ExitIQ automatically surfaces the metrics leadership, product, and success teams need — no
            spreadsheets, no manual tagging.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              "Root causes",
              "Churn trends",
              "Revenue at risk",
              "Competitor mentions",
              "Feature requests",
              "Customer sentiment",
              "Journey drop-offs",
              "AI recommendations",
            ].map((label) => (
              <div key={label} className="rounded-lg border border-border bg-card p-4 shadow-soft">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prioritization */}
      <section className="border-t border-border/60">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-20 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-medium text-primary">Know what to fix first</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Prioritize improvements based on real customer evidence.
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Identify the biggest churn drivers, understand their business impact, and focus your team
              on the improvements that matter most.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Priority queue
              </span>
              <span className="text-[10px] text-muted-foreground">Ranked by revenue impact</span>
            </div>
            <ul className="mt-4 space-y-3">
              {[
                { name: "Ship cohort reporting", impact: "$12.4k / mo", tag: "Product" },
                { name: "Launch viewer-tier pricing", impact: "$8.9k / mo", tag: "Pricing" },
                { name: "Rebuild Slack integration", impact: "$6.1k / mo", tag: "Product" },
                { name: "Fix onboarding drop-off (step 3)", impact: "$3.4k / mo", tag: "Growth" },
              ].map((row, i) => (
                <li key={row.name} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md border border-border bg-muted text-[10px] font-semibold tabular-nums">
                      {i + 1}
                    </span>
                    <div>
                      <div className="text-sm font-medium">{row.name}</div>
                      <div className="text-[11px] text-muted-foreground">{row.tag}</div>
                    </div>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-primary">{row.impact}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Teams */}
      <section id="teams" className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-sm font-medium text-primary">Built for every team</p>
          <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">
            One platform. Shared customer intelligence.
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Rocket, role: "Founders", body: "Understand why customers leave and where the business is bleeding." },
              { icon: Target, role: "Product teams", body: "Discover what to build next based on evidence, not opinion." },
              { icon: Users, role: "Customer success", body: "Identify retention opportunities and win-back candidates in real time." },
              { icon: LineChart, role: "Marketing", body: "Learn why prospects choose competitors and sharpen positioning." },
              { icon: BarChart3, role: "Leadership", body: "Track churn, revenue risk, and long-term retention trends in one view." },
              { icon: Building2, role: "RevOps", body: "Feed structured churn data back into your CRM, warehouse, and forecasts." },
            ].map((t) => (
              <div key={t.role} className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <t.icon className="h-4 w-4" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{t.role}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-sm font-medium text-primary">Fully automated</p>
          <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">
            Runs automatically every time a customer leaves.
          </h2>
          <ol className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-4">
            {[
              { step: "01", title: "Customer clicks cancel", body: "ExitIQ activates the moment cancellation begins." },
              { step: "02", title: "AI runs the interview", body: "An adaptive conversation captures the real reason — no forms, no humans." },
              { step: "03", title: "Responses are analyzed", body: "Every answer is parsed into category, root cause, competitor, and revenue impact." },
              { step: "04", title: "Insights appear instantly", body: "Your dashboard updates in real time. No manual work required." },
            ].map((s) => (
              <li key={s.step} className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground">{s.step}</span>
                <h3 className="mt-3 text-base font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Feedback to action */}
      <section className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-sm font-medium text-primary">From feedback to action</p>
          <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">
            More than customer feedback. A clear action plan.
          </h2>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground">
            Every interview ends with structured insights, business impact, and AI-powered
            recommendations your team can act on immediately.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-border bg-card p-10 text-center shadow-soft md:flex-row md:text-left">
            <div>
              <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Understand every customer exit. Improve every business decision.
              </h3>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Install ExitIQ once and turn every cancellation into clear, actionable customer
                intelligence.
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/auth">
                <Button size="lg" className="gap-2">
                  Start free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/exit-interview">
                <Button size="lg" variant="outline">See demo</Button>
              </Link>
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
