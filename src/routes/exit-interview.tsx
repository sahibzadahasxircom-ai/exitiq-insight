import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Pause,
  Play,
  RotateCcw,
  ArrowLeft,
  TrendingDown,
  Swords,
  Lightbulb,
  Activity,
  DollarSign,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/exit-interview")({
  head: () => ({
    meta: [
      { title: "Live Demo — leaveesy" },
      {
        name: "description",
        content:
          "Watch leaveesy run a live cancellation interview and turn the conversation into churn intelligence in real time.",
      },
    ],
  }),
  component: DemoPlayer,
});

/* ---------------- Scenario data (static, no API) ---------------- */

type Sentiment = "negative" | "neutral" | "positive";
type Impact = "Low" | "Medium" | "High";

type Turn =
  | { role: "ai"; text: string }
  | { role: "user"; text: string };

type InsightSnapshot = {
  rootCause?: string;
  competitor?: string;
  featureGap?: string;
  sentiment?: Sentiment;
  revenueImpact?: Impact;
};

type Scenario = {
  id: string;
  title: string;
  tag: string;
  turns: Turn[];
  /** Insights revealed after the matching turn index (0-based). */
  reveals: { afterTurn: number; patch: InsightSnapshot }[];
  finalSummary: Required<InsightSnapshot> & { headline: string };
};

const SCENARIOS: Scenario[] = [
  {
    id: "pricing",
    title: "Pricing churn",
    tag: "Pricing",
    turns: [
      { role: "ai", text: "We're sorry to see you go. What made you decide to cancel today?" },
      { role: "user", text: "Honestly, it's just gotten too expensive for our team." },
      { role: "ai", text: "Got it. Compared to what — a competitor, an internal tool, or just budget cuts?" },
      { role: "user", text: "We're moving to Competitor X. It's roughly half the price." },
      { role: "ai", text: "Makes sense. Beyond price, what made Competitor X feel like the right switch?" },
      { role: "user", text: "It was way easier to set up. We were live in a day." },
    ],
    reveals: [
      { afterTurn: 1, patch: { sentiment: "negative", rootCause: "Pricing perception" } },
      { afterTurn: 3, patch: { competitor: "Competitor X", revenueImpact: "High" } },
      { afterTurn: 5, patch: { featureGap: "Faster onboarding / setup" } },
    ],
    finalSummary: {
      headline: "Price-sensitive churn driven by setup friction",
      rootCause: "Pricing perception",
      competitor: "Competitor X",
      featureGap: "Faster onboarding / setup",
      sentiment: "negative",
      revenueImpact: "High",
    },
  },
  {
    id: "competitor",
    title: "Competitor switch",
    tag: "Competitor",
    turns: [
      { role: "ai", text: "Thanks for the years with us. What's prompting the move today?" },
      { role: "user", text: "We're consolidating onto Notion for everything." },
      { role: "ai", text: "Makes sense. What does Notion unlock that you couldn't get here?" },
      { role: "user", text: "Docs, wiki, and project tracking in one place. Less tool sprawl." },
      { role: "ai", text: "If we had a stronger docs/wiki layer, would that have changed your decision?" },
      { role: "user", text: "Probably yes. The all-in-one story is what won us over." },
    ],
    reveals: [
      { afterTurn: 1, patch: { sentiment: "neutral", competitor: "Notion" } },
      { afterTurn: 3, patch: { rootCause: "Tool consolidation", featureGap: "Native docs & wiki" } },
      { afterTurn: 5, patch: { revenueImpact: "High" } },
    ],
    finalSummary: {
      headline: "Lost to all-in-one workspace consolidation",
      rootCause: "Tool consolidation",
      competitor: "Notion",
      featureGap: "Native docs & wiki",
      sentiment: "neutral",
      revenueImpact: "High",
    },
  },
  {
    id: "onboarding",
    title: "Onboarding failure",
    tag: "Onboarding",
    turns: [
      { role: "ai", text: "Sorry to see you go. What got in the way during your first few weeks?" },
      { role: "user", text: "We never really got it set up properly." },
      { role: "ai", text: "Where did it stall — data import, invites, or configuring the first workflow?" },
      { role: "user", text: "The data import. We couldn't get our CSV mapped correctly." },
      { role: "ai", text: "Did you reach out for help, or try to push through?" },
      { role: "user", text: "We tried docs, gave up after a day, and moved on." },
    ],
    reveals: [
      { afterTurn: 1, patch: { sentiment: "negative", rootCause: "Failed activation" } },
      { afterTurn: 3, patch: { featureGap: "Guided CSV import / mapping" } },
      { afterTurn: 5, patch: { revenueImpact: "Medium", competitor: "—" } },
    ],
    finalSummary: {
      headline: "Never activated — blocked at data import",
      rootCause: "Failed activation",
      competitor: "—",
      featureGap: "Guided CSV import / mapping",
      sentiment: "negative",
      revenueImpact: "Medium",
    },
  },
  {
    id: "missing-features",
    title: "Missing features",
    tag: "Feature gap",
    turns: [
      { role: "ai", text: "Appreciate you being upfront. What was missing for your team?" },
      { role: "user", text: "We needed real role-based permissions and an audit log." },
      { role: "ai", text: "Got it — is that a compliance requirement or an internal policy?" },
      { role: "user", text: "Compliance. We're going through SOC 2 right now." },
      { role: "ai", text: "If we shipped granular roles + audit logs next quarter, would you reconsider?" },
      { role: "user", text: "Yes — happy to revisit if that lands." },
    ],
    reveals: [
      { afterTurn: 1, patch: { sentiment: "neutral", rootCause: "Missing enterprise controls" } },
      { afterTurn: 3, patch: { featureGap: "RBAC + audit log (SOC 2)" } },
      { afterTurn: 5, patch: { revenueImpact: "High", competitor: "—" } },
    ],
    finalSummary: {
      headline: "Win-back candidate — blocked by compliance gap",
      rootCause: "Missing enterprise controls",
      competitor: "—",
      featureGap: "RBAC + audit log (SOC 2)",
      sentiment: "neutral",
      revenueImpact: "High",
    },
  },
  {
    id: "activation",
    title: "Poor activation",
    tag: "Activation",
    turns: [
      { role: "ai", text: "Before you go — did the product end up fitting into your day-to-day?" },
      { role: "user", text: "Not really. Only one person on the team actually used it." },
      { role: "ai", text: "What stopped the rest of the team from picking it up?" },
      { role: "user", text: "It felt like extra work on top of what they already do in Slack." },
      { role: "ai", text: "If it surfaced inside Slack automatically, would adoption have looked different?" },
      { role: "user", text: "Probably. We live in Slack." },
    ],
    reveals: [
      { afterTurn: 1, patch: { sentiment: "negative", rootCause: "Low team activation" } },
      { afterTurn: 3, patch: { featureGap: "Slack-native workflow" } },
      { afterTurn: 5, patch: { revenueImpact: "Medium", competitor: "—" } },
    ],
    finalSummary: {
      headline: "Single-seat usage — never spread to the team",
      rootCause: "Low team activation",
      competitor: "—",
      featureGap: "Slack-native workflow",
      sentiment: "negative",
      revenueImpact: "Medium",
    },
  },
  {
    id: "trial",
    title: "Trial expiry",
    tag: "Trial",
    turns: [
      { role: "ai", text: "Your trial ended without converting — what was the blocker?" },
      { role: "user", text: "We just didn't get enough time to evaluate it properly." },
      { role: "ai", text: "What would you have wanted to test that you didn't get to?" },
      { role: "user", text: "Running it on a real project with the whole team." },
      { role: "ai", text: "Would an extended trial with a guided pilot have helped?" },
      { role: "user", text: "Yes — that's exactly what we needed." },
    ],
    reveals: [
      { afterTurn: 1, patch: { sentiment: "neutral", rootCause: "Insufficient evaluation time" } },
      { afterTurn: 3, patch: { featureGap: "Guided team pilot" } },
      { afterTurn: 5, patch: { revenueImpact: "Medium", competitor: "—" } },
    ],
    finalSummary: {
      headline: "Trial too short for team-wide evaluation",
      rootCause: "Insufficient evaluation time",
      competitor: "—",
      featureGap: "Guided team pilot",
      sentiment: "neutral",
      revenueImpact: "Medium",
    },
  },
  {
    id: "support",
    title: "Support issues",
    tag: "Support",
    turns: [
      { role: "ai", text: "Sorry to hear you're leaving. Was there a specific moment things went wrong?" },
      { role: "user", text: "We had an outage and it took 3 days to hear back." },
      { role: "ai", text: "That's not okay. Was the issue eventually resolved?" },
      { role: "user", text: "Yes, but trust was already gone by then." },
      { role: "ai", text: "Would faster response SLAs have changed the outcome?" },
      { role: "user", text: "Honestly, yes. Response time is everything for us." },
    ],
    reveals: [
      { afterTurn: 1, patch: { sentiment: "negative", rootCause: "Support response time" } },
      { afterTurn: 3, patch: { featureGap: "Priority support SLA" } },
      { afterTurn: 5, patch: { revenueImpact: "High", competitor: "—" } },
    ],
    finalSummary: {
      headline: "Trust broken by slow incident response",
      rootCause: "Support response time",
      competitor: "—",
      featureGap: "Priority support SLA",
      sentiment: "negative",
      revenueImpact: "High",
    },
  },
  {
    id: "value",
    title: "Not enough value realized",
    tag: "Value",
    turns: [
      { role: "ai", text: "Before you cancel — did the product deliver what you hoped?" },
      { role: "user", text: "It was fine, but we never saw a clear ROI." },
      { role: "ai", text: "What outcome were you hoping to measure?" },
      { role: "user", text: "Time saved per week on reporting. We couldn't quantify it." },
      { role: "ai", text: "If the product showed that ROI in-app each week, would that change things?" },
      { role: "user", text: "Definitely. We need to justify every tool to finance." },
    ],
    reveals: [
      { afterTurn: 1, patch: { sentiment: "neutral", rootCause: "Unclear ROI" } },
      { afterTurn: 3, patch: { featureGap: "In-app ROI / value reporting" } },
      { afterTurn: 5, patch: { revenueImpact: "Medium", competitor: "—" } },
    ],
    finalSummary: {
      headline: "Value delivered but never made visible",
      rootCause: "Unclear ROI",
      competitor: "—",
      featureGap: "In-app ROI / value reporting",
      sentiment: "neutral",
      revenueImpact: "Medium",
    },
  },
];

/* ---------------- Player ---------------- */

const AI_TYPING_MS = 900;
const USER_DELAY_MS = 1100;
const TYPEWRITER_MS_PER_CHAR = 18;

type RenderedMessage = {
  key: string;
  role: "ai" | "user";
  fullText: string;
  shownText: string;
  done: boolean;
};

function DemoPlayer() {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const scenario = useMemo(
    () => SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0],
    [scenarioId],
  );

  const [turnIdx, setTurnIdx] = useState(0); // next turn to play
  const [messages, setMessages] = useState<RenderedMessage[]>([]);
  const [typingAI, setTypingAI] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [insights, setInsights] = useState<InsightSnapshot>({});
  const [completed, setCompleted] = useState(false);

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  function clearTimers() {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  }
  function later(fn: () => void, ms: number) {
    const t = setTimeout(fn, ms);
    timeoutsRef.current.push(t);
  }

  // Reset whenever scenario changes
  useEffect(() => {
    clearTimers();
    setMessages([]);
    setTurnIdx(0);
    setInsights({});
    setCompleted(false);
    setTypingAI(false);
    setPlaying(true);
  }, [scenarioId]);

  // Driver loop
  useEffect(() => {
    if (!playing || completed) return;
    if (turnIdx >= scenario.turns.length) {
      // finalize
      later(() => {
        setInsights({
          rootCause: scenario.finalSummary.rootCause,
          competitor: scenario.finalSummary.competitor,
          featureGap: scenario.finalSummary.featureGap,
          sentiment: scenario.finalSummary.sentiment,
          revenueImpact: scenario.finalSummary.revenueImpact,
        });
        setCompleted(true);
      }, 400);
      return;
    }

    const turn = scenario.turns[turnIdx];
    if (turn.role === "ai") {
      setTypingAI(true);
      later(() => {
        setTypingAI(false);
        const key = `m-${turnIdx}`;
        setMessages((m) => [...m, { key, role: "ai", fullText: turn.text, shownText: "", done: false }]);
        // typewriter
        const chars = turn.text.split("");
        chars.forEach((_, i) => {
          later(() => {
            setMessages((m) =>
              m.map((msg) =>
                msg.key === key
                  ? { ...msg, shownText: turn.text.slice(0, i + 1), done: i + 1 === chars.length }
                  : msg,
              ),
            );
            if (i + 1 === chars.length) {
              applyReveals(turnIdx);
              later(() => setTurnIdx((n) => n + 1), 450);
            }
          }, (i + 1) * TYPEWRITER_MS_PER_CHAR);
        });
      }, AI_TYPING_MS);
    } else {
      later(() => {
        const key = `m-${turnIdx}`;
        setMessages((m) => [
          ...m,
          { key, role: "user", fullText: turn.text, shownText: turn.text, done: true },
        ]);
        applyReveals(turnIdx);
        later(() => setTurnIdx((n) => n + 1), 500);
      }, USER_DELAY_MS);
    }

    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, turnIdx, scenario, completed]);

  function applyReveals(idx: number) {
    const reveal = scenario.reveals.find((r) => r.afterTurn === idx);
    if (reveal) setInsights((prev) => ({ ...prev, ...reveal.patch }));
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typingAI]);

  function handleReplay() {
    clearTimers();
    setMessages([]);
    setTurnIdx(0);
    setInsights({});
    setCompleted(false);
    setTypingAI(false);
    setPlaying(true);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src="/leaveesy.png" alt="leaveesy" className="h-32 w-auto object-contain" />
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
          </Link>
        </div>
      </header>

      {/* Controls */}
      <div className="border-b border-border bg-muted/30">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Scenario
            </span>
            <Select value={scenarioId} onValueChange={setScenarioId}>
              <SelectTrigger className="h-9 w-[240px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCENARIOS.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPlaying((p) => !p)}
              disabled={completed}
              className="gap-1.5"
            >
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {playing ? "Pause" : "Play"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleReplay} className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" /> Replay
            </Button>
          </div>
        </div>
      </div>

      {/* Split */}
      <div className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-0 px-0 lg:grid-cols-[1fr_380px]">
        {/* Chat */}
        <section className="flex min-h-[560px] flex-col border-border lg:border-r">
          <div className="border-b border-border px-6 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              your-saas.com · Cancellation flow
            </p>
            <p className="mt-0.5 text-sm font-medium">leaveesy widget — live conversation</p>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8">
            <div className="mx-auto max-w-2xl space-y-6">
              {messages.map((m) => (
                <Bubble key={m.key} role={m.role} text={m.shownText} typing={!m.done && m.role === "ai"} />
              ))}
              {typingAI && <Thinking />}
              {completed && <CompleteRow headline={scenario.finalSummary.headline} />}
            </div>
          </div>
        </section>

        {/* Insights */}
        <aside className="border-t border-border bg-muted/20 lg:border-t-0">
          <div className="sticky top-0 px-6 py-6">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Live insights
              </p>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                  completed
                    ? "border-success/40 bg-success/10 text-success"
                    : "border-primary/40 bg-primary/10 text-primary",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    completed ? "bg-success" : "bg-primary animate-pulse",
                  )}
                />
                {completed ? "Locked" : "Analyzing"}
              </span>
            </div>
            <h3 className="mt-2 text-lg font-semibold tracking-tight">
              {completed ? scenario.finalSummary.headline : "Extracting churn signal…"}
            </h3>

            <div className="mt-6 space-y-3">
              <InsightRow
                icon={<TrendingDown className="h-3.5 w-3.5" />}
                label="Root cause"
                value={insights.rootCause}
              />
              <InsightRow
                icon={<Swords className="h-3.5 w-3.5" />}
                label="Competitor"
                value={insights.competitor}
              />
              <InsightRow
                icon={<Lightbulb className="h-3.5 w-3.5" />}
                label="Feature gap"
                value={insights.featureGap}
              />
              <InsightRow
                icon={<Activity className="h-3.5 w-3.5" />}
                label="Sentiment"
                value={insights.sentiment ? capitalize(insights.sentiment) : undefined}
                valueClass={
                  insights.sentiment === "negative"
                    ? "text-destructive"
                    : insights.sentiment === "positive"
                      ? "text-success"
                      : undefined
                }
              />
              <InsightRow
                icon={<DollarSign className="h-3.5 w-3.5" />}
                label="Revenue impact"
                value={insights.revenueImpact}
              />
            </div>

            {completed && (
              <div className="mt-6 rounded-xl border border-border bg-card p-4 shadow-soft animate-fade-in">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Insight saved
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  This conversation has been clustered, tagged, and added to your churn intelligence
                  dashboard automatically.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ---------------- Bits ---------------- */

function Bubble({
  role,
  text,
  typing,
}: {
  role: "ai" | "user";
  text: string;
  typing?: boolean;
}) {
  if (role === "ai") {
    return (
      <div className="animate-fade-in">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Interviewer
        </p>
        <p className="mt-1.5 max-w-2xl text-base leading-relaxed text-foreground">
          {text}
          {typing && <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 animate-pulse bg-foreground/70" />}
        </p>
      </div>
    );
  }
  return (
    <div className="flex animate-fade-in justify-end">
      <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-foreground px-4 py-2.5 text-sm leading-relaxed text-background shadow-soft">
        {text}
      </div>
    </div>
  );
}

function Thinking() {
  return (
    <div className="animate-fade-in">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Interviewer
      </p>
      <div className="mt-2 flex items-center gap-1.5">
        <Dot delay="0ms" />
        <Dot delay="150ms" />
        <Dot delay="300ms" />
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/70"
      style={{ animationDelay: delay, animationDuration: "1s" }}
    />
  );
}

function CompleteRow({ headline }: { headline: string }) {
  return (
    <div className="mt-6 flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 px-3 py-2 text-xs text-success animate-fade-in">
      <CheckCircle2 className="h-3.5 w-3.5" />
      <span className="font-medium">Interview complete · {headline}</span>
    </div>
  );
}

function InsightRow({
  icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  valueClass?: string;
}) {
  const empty = !value;
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 shadow-soft transition-all",
        empty && "opacity-60",
      )}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="flex h-5 w-5 items-center justify-center rounded bg-muted">{icon}</span>
        <span className="text-xs font-medium">{label}</span>
      </div>
      <span
        className={cn(
          "max-w-[55%] truncate text-right text-xs font-semibold",
          empty ? "text-muted-foreground" : "text-foreground",
          valueClass,
        )}
      >
        {value ?? "Pending…"}
      </span>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

