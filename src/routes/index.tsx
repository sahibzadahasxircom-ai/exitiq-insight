import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingLiveDemo } from "@/components/landing-live-demo";


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
            Embedded churn intelligence — install once, runs forever
          </div>
          <h1 className="mx-auto max-w-3xl text-balance text-5xl font-semibold tracking-tight md:text-[64px] md:leading-[1.05]">
            Every cancellation,{" "}
            <span className="text-muted-foreground">automatically interviewed.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-muted-foreground">
            ExitIQ embeds into your cancel flow. The moment a customer tries to leave, our AI runs an adaptive
            exit interview and turns the conversation into churn intelligence — automatically.
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
                title: "Conversational interviews",
                body: "An empathetic interviewer talks to every churning customer — adaptive follow-ups, no human required.",
              },
              {
                title: "Pattern detection",
                body: "Cluster thousands of responses into the few root causes that actually move retention.",
              },
              {
                title: "Founder dashboard",
                body: "A single view of churn reasons, revenue at risk, and what to do about it next.",
              },
            ].map((f, i) => (
              <div key={f.title} className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <span className="text-xs font-semibold tabular-nums tracking-wider text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
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
              { step: "01", title: "Install once", body: "Drop in a script tag or connect Stripe. Setup takes under five minutes." },
              { step: "02", title: "Auto-interview every cancel", body: "When a customer hits cancel, the AI runs an adaptive interview — 3 to 15 questions, no humans involved." },
              { step: "03", title: "Intelligence in your dashboard", body: "Root causes, competitor mentions, and recommended actions update automatically." },
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
              { title: "Reduce churn", body: "Catch root causes early and ship targeted fixes that compound." },
              { title: "Improve retention", body: "Win-back signals surface customers worth a personal follow-up." },
              { title: "Operate on evidence", body: "Stop debating opinions. Start shipping based on customer truth." },
            ].map((b) => (
              <div key={b.title} className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <h3 className="text-lg font-semibold">{b.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 flex flex-col items-center justify-between gap-6 rounded-2xl border border-border bg-card p-8 shadow-soft md:flex-row">
            <div>
              <h3 className="text-xl font-semibold tracking-tight">See ExitIQ in action</h3>
              <p className="mt-1 text-sm text-muted-foreground">Try the customer-facing interview, then explore the founder dashboard.</p>
            </div>
            <div className="flex gap-3">
              <Link to="/auth"><Button>Get started</Button></Link>
              <Link to="/exit-interview"><Button variant="outline">See demo</Button></Link>
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
