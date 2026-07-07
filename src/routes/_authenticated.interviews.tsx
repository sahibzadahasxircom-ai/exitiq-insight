import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MOCK_INTERVIEWS, formatMoney } from "@/lib/mock-intelligence";

export const Route = createFileRoute("/_authenticated/interviews")({
  head: () => ({ meta: [{ title: "Cancellations — ExitIQ" }] }),
  component: InterviewLibrary,
});

function InterviewLibrary() {
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MOCK_INTERVIEWS.filter((i) => {
      if (plan !== "all" && i.plan !== plan) return false;
      if (!q) return true;
      return (
        i.customer_name.toLowerCase().includes(q) ||
        i.company.toLowerCase().includes(q) ||
        i.primary_reason.toLowerCase().includes(q)
      );
    });
  }, [search, plan]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Cancellations</h1>
        <p className="mt-1 text-sm text-slate-600">
          {MOCK_INTERVIEWS.length} customer interviews. Each one is a structured report you can open.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer, company, or reason…"
            className="pl-8"
          />
        </div>
        <select
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          <option value="all">All plans</option>
          <option value="Starter">Starter</option>
          <option value="Growth">Growth</option>
          <option value="Scale">Scale</option>
          <option value="Enterprise">Enterprise</option>
        </select>
        <span className="ml-auto text-xs text-slate-500">{filtered.length} shown</span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Nothing matches these filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((i) => (
            <Link
              key={i.id}
              to="/interviews/$id"
              params={{ id: i.id }}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-blue-300"
            >
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-slate-900">{i.customer_name}</p>
                  <p className="text-xs text-slate-500">{i.company} · {i.plan}</p>
                </div>
                <p className="text-xs text-slate-500">{format(new Date(i.completed_at), "MMM d")}</p>
              </div>

              <div className="mt-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Primary reason</p>
                <p className="mt-1 text-sm font-medium text-slate-900">{i.primary_reason}</p>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-600 line-clamp-3">{i.executive_summary}</p>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                <span>{formatMoney(i.mrr)} MRR</span>
                <span className="inline-flex items-center gap-1 font-medium text-blue-700">
                  Read interview
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
