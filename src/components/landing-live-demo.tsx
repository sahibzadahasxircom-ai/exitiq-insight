import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, DollarSign, Swords, TrendingDown, Sparkles, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/**
 * Auto-playing, fully visual ExitIQ demo for the landing page.
 * - No backend, no OpenAI, no user input.
 * - Rotates through 3 scripted interview scenarios (Missing feature, Pricing, Competitor),
 *   then reveals the founder dashboard aggregating all of them. Loops forever.
 */

type Turn = { role: "ai" | "user"; text: string };
type Scenario = {
  id: string;
  label: string;
  category: string;
  rootCause: string;
  competitor: string | "—";
  pricingIssue: "Yes" | "No";
  revenue: string;
  winback: string;
  script: Turn[];
};

const SCENARIOS: Scenario[] = [
  {
    id: "feature",
    label: "Missing feature",
    category: "Missing features",
    rootCause: "No cohort reporting",
    competitor: "ChartMogul",
    pricingIssue: "No",
    revenue: "$2,400 / mo",
    winback: "High (8/10)",
    script: [
      { role: "ai", text: "Sorry to see you go. Before you cancel — what stopped working for you?" },
      { role: "user", text: "Honestly, the reporting just wasn't flexible enough for my team." },
      { role: "ai", text: "Got it. Which specific report did you try to build first?" },
      { role: "user", text: "A weekly revenue cohort by plan — we ended up exporting to a spreadsheet." },
      { role: "ai", text: "Were you comparing us to another tool while you were trying to build that?" },
      { role: "user", text: "Yeah, we tested ChartMogul last week and the cohort view was already there." },
      { role: "ai", text: "If we shipped flexible cohort reporting next month, would you stay?" },
      { role: "user", text: "Probably yes. That's the only blocker right now." },
      { role: "ai", text: "Thank you — that's incredibly useful. Your feedback has been shared with the product team." },
    ],
  },
  {
    id: "pricing",
    label: "Pricing",
    category: "Pricing",
    rootCause: "Per-seat cost scaled faster than value",
    competitor: "—",
    pricingIssue: "Yes",
    revenue: "$1,850 / mo",
    winback: "Medium (6/10)",
    script: [
      { role: "ai", text: "Before you cancel — can you share what changed for your team recently?" },
      { role: "user", text: "We grew from 8 to 22 seats and the bill nearly tripled overnight." },
      { role: "ai", text: "Understood. Is it the per-seat model itself, or the specific price point?" },
      { role: "user", text: "The per-seat model. Half our seats are read-only viewers." },
      { role: "ai", text: "Got it. Would a viewer-tier at a lower price change your decision?" },
      { role: "user", text: "100%. That would keep us on the platform." },
      { role: "ai", text: "Are you evaluating other tools, or is this purely a cost decision?" },
      { role: "user", text: "Purely cost. The product itself is great." },
      { role: "ai", text: "Thanks — I've flagged this for the pricing team as high-priority." },
    ],
  },
  {
    id: "competitor",
    label: "Competitor switch",
    category: "Competitor",
    rootCause: "Native Slack workflows on competitor",
    competitor: "Linear",
    pricingIssue: "No",
    revenue: "$3,120 / mo",
    winback: "Low (3/10)",
    script: [
      { role: "ai", text: "Sorry to see you go. What made you look at other tools?" },
      { role: "user", text: "Our engineering team standardized on Linear last quarter." },
      { role: "ai", text: "Understood. Was it a specific feature, or a broader workflow fit?" },
      { role: "user", text: "Their Slack triage and cycle planning felt native to how we work." },
      { role: "ai", text: "Did our integrations play a role in the decision?" },
      { role: "user", text: "Yeah — your Slack integration required custom setup for every project." },
      { role: "ai", text: "If we shipped first-class Slack workflows, would you reconsider?" },
      { role: "user", text: "Honestly, we're two months in already. Probably not now." },
      { role: "ai", text: "Appreciated. I've logged Linear as the competitor and shared the workflow gap." },
    ],
  },
];

const ROOT_CAUSES = [
  { name: "Missing features", value: 42, color: "var(--primary)" },
  { name: "Pricing", value: 23, color: "color-mix(in oklab, var(--primary) 65%, var(--muted-foreground))" },
  { name: "Competitor", value: 18, color: "color-mix(in oklab, var(--primary) 40%, var(--muted-foreground))" },
  { name: "Onboarding", value: 11, color: "color-mix(in oklab, var(--muted-foreground) 70%, transparent)" },
  { name: "Other", value: 6, color: "color-mix(in oklab, var(--muted-foreground) 40%, transparent)" },
];

const TREND = [
  { week: "W1", churn: 5.8, saved: 12 },
  { week: "W2", churn: 5.4, saved: 18 },
  { week: "W3", churn: 4.9, saved: 24 },
  { week: "W4", churn: 4.3, saved: 31 },
  { week: "W5", churn: 3.8, saved: 39 },
  { week: "W6", churn: 3.2, saved: 48 },
];

const COMPETITORS = [
  { name: "ChartMogul", mentions: 31 },
  { name: "Linear", mentions: 24 },
  { name: "Baremetrics", mentions: 19 },
  { name: "ProfitWell", mentions: 12 },
];

const FEATURE_REQUESTS = [
  { name: "Cohort reporting", count: 38 },
  { name: "Viewer-tier pricing", count: 27 },
  { name: "Native Slack workflows", count: 21 },
  { name: "SSO / SAML", count: 14 },
];

export function LandingLiveDemo() {
  const [phase, setPhase] = useState<"interview" | "dashboard">("interview");
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [visible, setVisible] = useState<Turn[]>([]);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scenario = SCENARIOS[scenarioIdx];

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    function wait(ms: number) {
      return new Promise<void>((res) => {
        const t = setTimeout(res, ms);
        timers.push(t);
      });
    }

    async function playScenario(idx: number) {
      setScenarioIdx(idx);
      setPhase("interview");
      setVisible([]);
      setTyping(false);
      const script = SCENARIOS[idx].script;
      for (let i = 0; i < script.length; i++) {
        if (cancelled) return;
        const turn = script[i];
        if (turn.role === "ai") {
          setTyping(true);
          await wait(850);
          if (cancelled) return;
          setTyping(false);
          setVisible((v) => [...v, turn]);
        } else {
          await wait(650);
          if (cancelled) return;
          setVisible((v) => [...v, turn]);
        }
        await wait(turn.role === "ai" ? 900 : 1200);
      }
    }

    async function run() {
      while (!cancelled) {
        for (let i = 0; i < SCENARIOS.length && !cancelled; i++) {
          await playScenario(i);
          if (cancelled) return;
          await wait(1200);
        }
        if (cancelled) return;
        setPhase("dashboard");
        await wait(9000);
      }
    }

    run();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [visible, typing]);

  const insightCount = useMemo(() => visible.filter((v) => v.role === "user").length, [visible]);

  return (
    <div className="relative rounded-2xl border border-border bg-card p-3 shadow-elevated">
      {/* faux browser chrome */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
        </div>
        <span className="rounded-md border border-border bg-background px-2 py-0.5 text-[10px] text-muted-foreground">
          {phase === "interview" ? "your-saas.com / cancel" : "app.exitiq.com / dashboard"}
        </span>
        <span className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
          <span className={`h-1.5 w-1.5 rounded-full ${phase === "interview" ? "bg-success animate-pulse" : "bg-primary"}`} />
          {phase === "interview" ? `Live · ${scenario.label}` : "Insights generated"}
        </span>
      </div>

      {/* scenario progress rail */}
      {phase === "interview" && (
        <div className="mx-3 mb-3 flex items-center gap-2">
          {SCENARIOS.map((s, i) => (
            <div key={s.id} className="flex flex-1 items-center gap-2">
              <span
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i < scenarioIdx ? "bg-primary/70" : i === scenarioIdx ? "bg-primary" : "bg-border"
                }`}
              />
              <span
                className={`hidden text-[10px] font-medium sm:inline ${
                  i === scenarioIdx ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        {/* Left: chat / dashboard switch */}
        <div className="md:col-span-3 rounded-xl border border-border/70 bg-muted/30 p-4">
          {phase === "interview" ? (
            <div className="flex h-[440px] flex-col">
              <div className="mb-3 flex items-center gap-2 border-b border-border/60 pb-3">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
                  <span className="text-[9px] font-bold">EQ</span>
                </div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  ExitIQ · AI Interviewer
                </span>
                <span className="ml-auto rounded-full border border-border bg-background px-2 py-0.5 text-[10px] text-muted-foreground">
                  Scenario {scenarioIdx + 1} of {SCENARIOS.length}
                </span>
              </div>
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto pr-1">
                {visible.map((t, i) => (
                  <div
                    key={i}
                    className={`flex ${t.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                        t.role === "user"
                          ? "rounded-tr-md bg-foreground text-background"
                          : "rounded-tl-md bg-background border border-border text-foreground"
                      }`}
                    >
                      {t.text}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="rounded-2xl rounded-tl-md border border-border bg-background px-3 py-2">
                      <TypingDots />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-[440px] flex-col animate-fade-in">
              <div className="mb-3 flex items-center justify-between border-b border-border/60 pb-3">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Churn intelligence · last 30 days
                </span>
                <span className="text-[10px] text-muted-foreground">247 interviews analyzed</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <Kpi icon={<TrendingDown className="h-3.5 w-3.5" />} label="Churn rate" value="3.2%" delta="-2.6%" positive />
                <Kpi icon={<DollarSign className="h-3.5 w-3.5" />} label="Revenue saved" value="$48.2k" delta="+18%" positive />
                <Kpi icon={<Activity className="h-3.5 w-3.5" />} label="Completion" value="91%" delta="+4%" positive />
                <Kpi icon={<Users className="h-3.5 w-3.5" />} label="Interviews" value="247" delta="+62" positive />
              </div>
              <div className="mt-3 grid flex-1 grid-cols-2 gap-2">
                <div className="rounded-lg border border-border bg-background p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[11px] font-medium">Churn trend</span>
                    <span className="text-[10px] text-success">↓ 44%</span>
                  </div>
                  <ResponsiveContainer width="100%" height={140}>
                    <AreaChart data={TREND}>
                      <defs>
                        <linearGradient id="churnFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={9} tickLine={false} axisLine={false} width={22} />
                      <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 11, borderRadius: 8 }} />
                      <Area type="monotone" dataKey="churn" stroke="var(--primary)" strokeWidth={2} fill="url(#churnFill)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[11px] font-medium">Revenue saved</span>
                    <span className="text-[10px] text-muted-foreground">$ thousands</span>
                  </div>
                  <ResponsiveContainer width="100%" height={140}>
                    <LineChart data={TREND}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={9} tickLine={false} axisLine={false} width={22} />
                      <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 11, borderRadius: 8 }} />
                      <Line type="monotone" dataKey="saved" stroke="var(--primary)" strokeWidth={2} dot={{ r: 2.5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: live insights panel */}
        <div className="md:col-span-2 rounded-xl border border-border/70 bg-background p-4">
          <div className="mb-3 flex items-center justify-between border-b border-border/60 pb-3">
            <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              {phase === "interview" ? "Live insights" : "Aggregated intelligence"}
            </span>
            <span className="text-[10px] text-muted-foreground">AI-extracted</span>
          </div>

          {phase === "interview" ? (
            <LiveInsights count={insightCount} scenario={scenario} />
          ) : (
            <div className="space-y-3 animate-fade-in">
              <div>
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Root causes
                </div>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={ROOT_CAUSES} layout="vertical" margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" stroke="var(--muted-foreground)" fontSize={10} width={92} tickLine={false} axisLine={false} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {ROOT_CAUSES.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <Swords className="h-3 w-3" /> Competitor mentions
                </div>
                <ul className="space-y-1.5">
                  {COMPETITORS.map((c) => (
                    <li key={c.name} className="flex items-center justify-between text-xs">
                      <span className="text-foreground">{c.name}</span>
                      <span className="tabular-nums text-muted-foreground">{c.mentions}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Top feature requests
                </div>
                <ul className="space-y-1.5">
                  {FEATURE_REQUESTS.map((f) => (
                    <li key={f.name} className="flex items-center justify-between text-xs">
                      <span className="text-foreground">{f.name}</span>
                      <span className="tabular-nums text-muted-foreground">{f.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LiveInsights({ count, scenario }: { count: number; scenario: Scenario }) {
  const items = [
    { label: "Root cause", value: count >= 2 ? scenario.rootCause : "Detecting…" },
    { label: "Category", value: count >= 1 ? scenario.category : "—" },
    { label: "Competitor", value: count >= 3 ? scenario.competitor : "—" },
    { label: "Pricing issue", value: count >= 3 ? scenario.pricingIssue : "—" },
    { label: "Revenue impact", value: count >= 4 ? scenario.revenue : "—" },
    { label: "Win-back signal", value: count >= 4 ? scenario.winback : "—" },
  ];
  return (
    <ul className="space-y-2.5">
      {items.map((i) => (
        <li key={i.label} className="flex items-start justify-between gap-3 text-xs">
          <span className="text-muted-foreground">{i.label}</span>
          <span
            key={i.value}
            className="max-w-[60%] text-right font-medium text-foreground animate-fade-in"
          >
            {i.value}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Kpi({
  icon,
  label,
  value,
  delta,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-2.5">
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold tracking-tight">{value}</div>
      <div className={`text-[10px] ${positive ? "text-success" : "text-destructive"}`}>{delta}</div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60" />
    </div>
  );
}
