import { createFileRoute } from "@tanstack/react-router";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { Users, DollarSign, AlertTriangle, CheckCircle2, ArrowUpRight, ArrowDownRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — ExitIQ" },
      { name: "description", content: "Founder analytics: churn reasons, revenue at risk, and AI-recommended actions." },
    ],
  }),
  component: Dashboard,
});

const churnReasons = [
  { name: "Onboarding friction", value: 42 },
  { name: "Missing features", value: 21 },
  { name: "Price", value: 15 },
  { name: "Switched to competitor", value: 13 },
  { name: "Other", value: 9 },
];

const COLORS = ["hsl(var(--primary))", "#8b5cf6", "#f59e0b", "#ef4444", "#64748b"];

const trend = [
  { m: "Jan", churn: 18 },
  { m: "Feb", churn: 22 },
  { m: "Mar", churn: 19 },
  { m: "Apr", churn: 27 },
  { m: "May", churn: 31 },
  { m: "Jun", churn: 24 },
];

const quotes = [
  { who: "Sarah · Marketing SaaS", text: "Onboarding felt too long. We needed value in the first 10 minutes." },
  { who: "Daniel · Fintech", text: "Pricing jumped at the wrong time. Hard to justify to finance." },
  { who: "Priya · Agency", text: "The reporting features we needed were on the roadmap, not shipped." },
];

function Dashboard() {
  const { company } = useAuth();
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-0.5 text-[11px] font-medium text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Auto-pilot active
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{company?.company_name ?? "Workspace"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Automated churn intelligence — updated as new cancellations roll in.
          </p>
        </div>
        <Select defaultValue="30">
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Kpi icon={Users} label="Churned customers" value="248" delta="+12%" up />
        <Kpi icon={DollarSign} label="Revenue lost" value="$42,180" delta="+8%" up />
        <Kpi icon={CheckCircle2} label="Interview completion" value="71%" delta="-3%" />
        <Kpi icon={AlertTriangle} label="Top churn reason" value="Onboarding" delta="42% of cancels mentioned setup friction" note />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHead title="Why customers leave" subtitle="Top reasons, last 30 days" />
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={churnReasons} dataKey="value" nameKey="name" innerRadius={56} outerRadius={92} paddingAngle={2}>
                  {churnReasons.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1.5 text-sm">
            {churnReasons.map((r, i) => (
              <li key={r.name} className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  {r.name}
                </span>
                <span className="font-medium text-foreground">{r.value}%</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="lg:col-span-3">
          <CardHead title="Churn trend" subtitle="Cancellations per month" />
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="m" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="churn" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex items-start justify-between">
          <div>
            <span className="inline-flex items-center rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Insight of the week
            </span>
            <h3 className="mt-2 text-lg font-semibold tracking-tight">Onboarding is your largest churn driver</h3>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              42% of churned customers cited onboarding friction. The most common phrase: "too many steps before value."
              Shortening time-to-first-value is the highest-leverage fix for this quarter.
            </p>
          </div>
          <Button size="sm" variant="outline">Export</Button>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {quotes.map((q) => (
            <div key={q.text} className="rounded-lg border border-border bg-background p-4">
              <Quote className="h-4 w-4 text-muted-foreground" />
              <p className="mt-2 text-sm">"{q.text}"</p>
              <p className="mt-3 text-xs text-muted-foreground">{q.who}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHead title="Recommended actions" subtitle="Generated from this period's interviews" />
        <ul className="divide-y divide-border">
          {[
            { t: "Streamline onboarding to first value", d: "Cut steps in setup wizard from 7 to 3." },
            { t: "Ship requested reporting filters", d: "Mentioned in 21% of churn reasons." },
            { t: "Add annual-plan price lock", d: "Reduce churn driven by mid-cycle price changes." },
          ].map((a) => (
            <li key={a.t} className="flex items-start justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-medium">{a.t}</p>
                <p className="text-xs text-muted-foreground">{a.d}</p>
              </div>
              <Button size="sm" variant="ghost">Create task</Button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-border bg-card p-6 shadow-soft ${className}`}>{children}</section>;
}

function CardHead({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-base font-semibold">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function Kpi({
  icon: Icon, label, value, delta, up, note,
}: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; delta: string; up?: boolean; note?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      {note ? (
        <p className="mt-1 text-xs text-muted-foreground">{delta}</p>
      ) : (
        <p className={`mt-1 inline-flex items-center gap-1 text-xs ${up ? "text-destructive" : "text-success"}`}>
          {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {delta} vs prev period
        </p>
      )}
    </div>
  );
}
