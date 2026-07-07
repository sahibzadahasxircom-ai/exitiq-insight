import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, Legend,
} from "recharts";
import { ArrowUpRight, ArrowDownRight, Minus, ArrowRight } from "lucide-react";
import {
  EXECUTIVE_BRIEFING, CUSTOMER_VOICE, CHURN_DRIVERS, RECOMMENDATIONS,
  CHURN_TREND, CATEGORY_TREND, COMPETITOR_TREND, MOCK_INTERVIEWS,
  formatMoney,
} from "@/lib/mock-intelligence";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Overview — ExitIQ" },
      { name: "description", content: "Executive overview of customer cancellations, churn drivers, and revenue at risk." },
    ],
  }),
  component: Dashboard,
});

const BLUE = "#2563eb";
const BLUE_SOFT = "#93c5fd";
const INK = "#0f172a";
const GREEN = "#16a34a";
const AMBER = "#d97706";
const VIOLET = "#7c3aed";
const SLATE = "#64748b";

function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-16 px-6 py-10">
      <ExecutiveBrief />
      <ChurnDrivers />
      <CustomerVoice />
      <ActionPlan />
      <Trends />
      <LibraryPreview />
    </div>
  );
}

/* ---------- 1. Executive Brief ---------- */
function ExecutiveBrief() {
  const b = EXECUTIVE_BRIEFING;
  const now = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  return (
    <section>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {now} · Executive brief
      </p>
      <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-slate-900 md:text-[36px] md:leading-[1.15]">
        {b.headline}
      </h1>
      <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-slate-600">
        {b.detail}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-6 border-t border-slate-200 pt-6 md:grid-cols-4">
        <Stat label="Revenue at risk" value={formatMoney(b.revenue_at_risk)} />
        <Stat label="Customers affected" value={String(b.affected_customers)} />
        <Stat label="Primary area" value={b.product_area} small />
        <Stat label="Interviews analysed" value={String(MOCK_INTERVIEWS.length)} />
      </div>

      <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50/60 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700">Next best action</p>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-800">{b.next_best_action}</p>
      </div>
    </section>
  );
}

function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={`mt-1.5 font-semibold tracking-tight text-slate-900 ${small ? "text-sm" : "text-lg"}`}>{value}</p>
    </div>
  );
}

/* ---------- 2. Biggest Churn Drivers ---------- */
function ChurnDrivers() {
  const rows = CHURN_DRIVERS.slice(0, 5);
  return (
    <section>
      <SectionHead title="Biggest churn drivers" subtitle="The top five reasons customers cancelled this quarter." />
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            <tr>
              <th className="px-6 py-3 text-left">Reason</th>
              <th className="px-6 py-3 text-right">Customers</th>
              <th className="px-6 py-3 text-right">Revenue impact</th>
              <th className="px-6 py-3 text-right">Trend</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-t border-slate-100">
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-900">{r.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{r.pct}% of cancellations</p>
                </td>
                <td className="px-6 py-4 text-right tabular-nums text-slate-800">{r.customers}</td>
                <td className="px-6 py-4 text-right font-semibold tabular-nums text-slate-900">{formatMoney(r.revenue)}</td>
                <td className="px-6 py-4 text-right"><TrendGlyph trend={r.trend} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ---------- 3. Customer Voice ---------- */
function CustomerVoice() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % CUSTOMER_VOICE.length), 5500);
    return () => clearInterval(t);
  }, []);
  const q = CUSTOMER_VOICE[idx];
  return (
    <section>
      <SectionHead title="Customer voice" subtitle="What customers said in their own words." />
      <div className="rounded-2xl border border-slate-200 bg-white p-10 md:p-14">
        <blockquote key={idx} className="text-2xl font-normal leading-[1.35] tracking-tight text-slate-900 md:text-[32px] md:leading-[1.25] animate-in fade-in duration-700">
          &ldquo;{q.quote}&rdquo;
        </blockquote>
        <p className="mt-8 text-xs uppercase tracking-[0.16em] text-slate-500">{q.attribution}</p>
        <div className="mt-8 flex gap-1.5">
          {CUSTOMER_VOICE.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Quote ${i + 1}`}
              className={`h-1 rounded-full transition-all ${i === idx ? "w-8 bg-blue-600" : "w-4 bg-slate-200"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 4. Action Plan ---------- */
function ActionPlan() {
  return (
    <section>
      <SectionHead title="Action plan" subtitle="Concrete initiatives ranked by revenue impact." />
      <div className="space-y-4">
        {RECOMMENDATIONS.slice(0, 5).map((r, i) => (
          <article key={r.id} className="rounded-2xl border border-slate-200 bg-white p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div className="flex items-baseline gap-4">
                <span className="text-xs font-semibold tabular-nums text-slate-400">0{i + 1}</span>
                <h3 className="max-w-2xl text-lg font-semibold leading-snug tracking-tight text-slate-900">
                  {r.recommendation}
                </h3>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700">
                {formatMoney(r.affected_revenue)} at stake
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 border-t border-slate-100 pt-6 md:grid-cols-2 lg:grid-cols-4">
              <Block label="Problem">{r.problem}</Block>
              <Block label="Evidence">
                Referenced in {r.affected_customers} customer interviews across Growth, Scale, and Enterprise plans.
              </Block>
              <Block label="Revenue impact">
                {formatMoney(r.affected_revenue)} ARR currently attached to this issue.
              </Block>
              <Block label="Expected outcome">{r.expected_impact}.</Block>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-700">{children}</p>
    </div>
  );
}

/* ---------- 5. Trends ---------- */
function Trends() {
  return (
    <section>
      <SectionHead title="Business trends" subtitle="Three signals worth watching over time." />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Churn reasons">
          <ResponsiveContainer>
            <LineChart data={CATEGORY_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke={SLATE} fontSize={11} />
              <YAxis stroke={SLATE} fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10 }} iconType="circle" />
              <Line type="monotone" dataKey="Navigation & UX" stroke={BLUE} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Missing Features" stroke={VIOLET} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Pricing" stroke={AMBER} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Performance" stroke={GREEN} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Integrations" stroke={SLATE} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue lost">
          <ResponsiveContainer>
            <BarChart data={CHURN_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke={SLATE} fontSize={11} />
              <YAxis stroke={SLATE} fontSize={11} tickFormatter={(v) => `$${Math.round(Number(v) / 1000)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatMoney(v)} />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]} fill={BLUE} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Competitor mentions">
          <ResponsiveContainer>
            <LineChart data={COMPETITOR_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke={SLATE} fontSize={11} />
              <YAxis stroke={SLATE} fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10 }} iconType="circle" />
              <Line type="monotone" dataKey="Notion" stroke={BLUE} strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Linear" stroke={INK} strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Airtable" stroke={BLUE_SOFT} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </section>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="text-sm font-semibold tracking-tight text-slate-900">{title}</h3>
      <div className="mt-5 h-56">{children}</div>
    </div>
  );
}

/* ---------- 6. Interview Library preview ---------- */
function LibraryPreview() {
  const recent = MOCK_INTERVIEWS.slice(0, 4);
  return (
    <section>
      <SectionHead
        title="Interview library"
        subtitle="Every cancellation, structured as a searchable customer report."
        action={<Link to="/interviews" className="text-sm font-medium text-blue-700 hover:underline">Open library →</Link>}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {recent.map((i) => (
          <Link
            key={i.id}
            to="/interviews/$id"
            params={{ id: i.id }}
            className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-blue-300"
          >
            <div className="flex items-baseline justify-between">
              <p className="text-base font-semibold text-slate-900">{i.customer_name}</p>
              <p className="text-xs text-slate-500">{i.plan}</p>
            </div>
            <p className="mt-1 text-xs text-slate-500">{i.company}</p>

            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Primary reason</p>
            <p className="mt-1 text-sm font-medium text-slate-800 line-clamp-2">{i.primary_reason}</p>

            <p className="mt-4 text-sm leading-relaxed text-slate-600 line-clamp-2">{i.executive_summary}</p>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
              <span>{formatMoney(i.mrr)} MRR</span>
              <span className="inline-flex items-center gap-1 font-medium text-blue-700">
                Full analysis
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ---------- Atoms ---------- */

const tooltipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  fontSize: 12,
  color: "#0f172a",
};

function SectionHead({
  title, subtitle, action,
}: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-slate-600">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function TrendGlyph({ trend }: { trend: "up" | "down" | "flat" }) {
  if (trend === "up") return <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600"><ArrowUpRight className="h-3.5 w-3.5" /> Growing</span>;
  if (trend === "down") return <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600"><ArrowDownRight className="h-3.5 w-3.5" /> Falling</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500"><Minus className="h-3.5 w-3.5" /> Stable</span>;
}
