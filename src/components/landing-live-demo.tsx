import { useEffect, useRef, useState } from "react";
import { Activity, DollarSign, Swords, TrendingDown } from "lucide-react";
import {
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
 * - Plays a scripted 8-turn interview, then reveals the founder dashboard
 *   (charts + insights) populated with fake data. Loops forever.
 */

type Turn = { role: "ai" | "user"; text: string };

const SCRIPT: Turn[] = [
  { role: "ai", text: "Sorry to see you go. Before you cancel — what stopped working for you?" },
  { role: "user", text: "Honestly, the reporting just wasn't flexible enough for my team." },
  { role: "ai", text: "Got it. Which specific report did you try to build first?" },
  { role: "user", text: "A weekly revenue cohort by plan — we ended up exporting to a spreadsheet." },
  { role: "ai", text: "Were you comparing us to another tool while you were trying to build that?" },
  { role: "user", text: "Yeah, we tested ChartMogul last week and the cohort view was already there." },
  { role: "ai", text: "Was pricing a factor, or was it really the missing cohort reporting?" },
  { role: "user", text: "Pricing is fine. It's the cohort reporting — that's the dealbreaker." },
  { role: "ai", text: "If we shipped flexible cohort reporting next month, would you stay?" },
  { role: "user", text: "Probably yes. That's the only blocker right now." },
  { role: "ai", text: "Last one — how painful is this for your team today, on a scale of 1–10?" },
  { role: "user", text: "A solid 8. We spend 3 hours every Monday rebuilding it manually." },
  { role: "ai", text: "Thank you — that's incredibly useful. Your feedback has been shared with the product team." },
];

const ROOT_CAUSES = [
  { name: "Missing features", value: 42, color: "var(--primary)" },
  { name: "Pricing", value: 23, color: "var(--chart-2, #94a3b8)" },
  { name: "Competitor", value: 18, color: "var(--chart-3, #64748b)" },
  { name: "Onboarding", value: 11, color: "var(--chart-4, #475569)" },
  { name: "Other", value: 6, color: "var(--chart-5, #334155)" },
];

const TREND = [
  { week: "W1", churn: 5.8 },
  { week: "W2", churn: 5.4 },
  { week: "W3", churn: 4.9 },
  { week: "W4", churn: 4.3 },
  { week: "W5", churn: 3.8 },
  { week: "W6", churn: 3.2 },
];

const COMPETITORS = [
  { name: "ChartMogul", mentions: 31 },
  { name: "Baremetrics", mentions: 19 },
  { name: "ProfitWell", mentions: 12 },
  { name: "Stripe Sigma", mentions: 7 },
];

export function LandingLiveDemo() {
  const [phase, setPhase] = useState<"interview" | "dashboard">("interview");
  const [visible, setVisible] = useState<Turn[]>([]);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let timers: ReturnType<typeof setTimeout>[] = [];

    async function run() {
      // reset
      setPhase("interview");
      setVisible([]);
      setTyping(false);

      for (let i = 0; i < SCRIPT.length; i++) {
        if (cancelled) return;
        const turn = SCRIPT[i];
        if (turn.role === "ai") {
          setTyping(true);
          await wait(900);
          if (cancelled) return;
          setTyping(false);
          setVisible((v) => [...v, turn]);
        } else {
          await wait(700);
          if (cancelled) return;
          setVisible((v) => [...v, turn]);
        }
        await wait(turn.role === "ai" ? 1100 : 1400);
      }
      if (cancelled) return;
      await wait(1200);
      setPhase("dashboard");
      await wait(8000);
      if (!cancelled) run();
    }

    function wait(ms: number) {
      return new Promise<void>((res) => {
        const t = setTimeout(res, ms);
        timers.push(t);
      });
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
          {phase === "interview" ? "Live interview" : "Insights generated"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        {/* Left: chat / dashboard switch */}
        <div className="md:col-span-3 rounded-xl border border-border/70 bg-muted/30 p-4">
          {phase === "interview" ? (
            <div className="flex h-[420px] flex-col">
              <div className="mb-3 flex items-center gap-2 border-b border-border/60 pb-3">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
                  <span className="text-[9px] font-bold">EQ</span>
                </div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  ExitIQ · AI Interviewer
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
            <div className="flex h-[420px] flex-col animate-fade-in">
              <div className="mb-3 flex items-center justify-between border-b border-border/60 pb-3">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Churn intelligence · last 30 days
                </span>
                <span className="text-[10px] text-muted-foreground">247 interviews analyzed</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Kpi icon={<TrendingDown className="h-3.5 w-3.5" />} label="Churn rate" value="3.2%" delta="-2.6%" positive />
                <Kpi icon={<DollarSign className="h-3.5 w-3.5" />} label="Revenue saved" value="$48.2k" delta="+18%" positive />
                <Kpi icon={<Activity className="h-3.5 w-3.5" />} label="Completion" value="91%" delta="+4%" positive />
              </div>
              <div className="mt-3 flex-1 rounded-lg border border-border bg-background p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium">Churn trend</span>
                  <span className="text-[10px] text-success">↓ 44% over 6 weeks</span>
                </div>
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={TREND}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={10} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={10} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 11 }} />
                    <Line type="monotone" dataKey="churn" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Right: live insights panel */}
        <div className="md:col-span-2 rounded-xl border border-border/70 bg-background p-4">
          <div className="mb-3 flex items-center justify-between border-b border-border/60 pb-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {phase === "interview" ? "Live insights" : "Top root causes"}
            </span>
            <span className="text-[10px] text-muted-foreground">AI-extracted</span>
          </div>

          {phase === "interview" ? (
            <LiveInsights count={visible.filter((v) => v.role === "user").length} />
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={ROOT_CAUSES} layout="vertical" margin={{ left: 8, right: 8 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" stroke="var(--muted-foreground)" fontSize={10} width={100} />
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LiveInsights({ count }: { count: number }) {
  const items = [
    { label: "Root cause", value: count >= 2 ? "Missing cohort reporting" : "Detecting…" },
    { label: "Category", value: count >= 1 ? "Missing features" : "—" },
    { label: "Competitor", value: count >= 3 ? "ChartMogul" : "—" },
    { label: "Pricing issue", value: count >= 4 ? "No" : "—" },
    { label: "Revenue impact", value: count >= 5 ? "$2,400 / mo" : "—" },
    { label: "Win-back signal", value: count >= 5 ? "High (8/10)" : "—" },
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
