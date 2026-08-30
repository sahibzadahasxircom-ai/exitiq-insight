import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { format } from "date-fns";
import { Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { listInterviewSessions } from "@/lib/interview.functions";
import { MOCK_INTERVIEWS, formatMoney } from "@/lib/mock-intelligence";

export const Route = createFileRoute("/_authenticated/interviews")({
  head: () => ({ meta: [{ title: "Cancellations — leaveesy" }] }),
  component: InterviewLibrary,
});

function InterviewLibrary() {
  const [search, setSearch] = useState("");
  const listFn = useServerFn(listInterviewSessions);
  const { data: sessions = [], isLoading, error } = useQuery({
    queryKey: ["interview-sessions"],
    queryFn: () => listFn({ data: undefined }),
    retry: false, // Don't retry on error to avoid hanging
  });

  // For now, use mock data for display
  // TODO: Replace with real data when interviews exist
  const displayData = sessions.length > 0 ? sessions : MOCK_INTERVIEWS;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return displayData.filter((i) => {
      if (!q) return true;
      const name = i.customer_name?.toLowerCase() || "";
      const email = i.customer_email?.toLowerCase() || "";
      return name.includes(q) || email.includes(q);
    });
  }, [search, displayData]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 px-4 py-6 md:px-6 md:py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Cancellations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {displayData.length} customer interviews. Each one is a structured report you can open.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer or email…"
            className="pl-8"
          />
        </div>
        <span className="ml-auto text-xs text-slate-500">{filtered.length} shown</span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-muted-foreground">
          Nothing matches these filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((i) => (
            <Link
              key={i.id}
              to="/interviews/$id"
              params={{ id: i.id }}
              className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 card-hover"
            >
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-slate-900">{i.customer_name || "Anonymous"}</p>
                  <p className="text-xs text-slate-500">{i.customer_email || i.company}</p>
                </div>
                <p className="text-xs text-slate-500">{format(new Date(i.created_at || i.completed_at), "MMM d")}</p>
              </div>

              <div className="mt-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Primary reason</p>
                <p className="mt-1 text-sm font-medium text-slate-900">{i.primary_reason || capitalize(i.interview_status || "Active")}</p>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-600 line-clamp-3">{i.executive_summary || "Interview in progress..."}</p>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                <span>{i.mrr ? formatMoney(i.mrr) + " MRR" : capitalize(i.interview_progress || "Started")}</span>
                <span className="inline-flex items-center gap-1 font-medium text-blue-700">
                  View interview
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

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function LibraryLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-1/3 rounded bg-slate-200" />
        <div className="h-4 w-1/4 rounded bg-slate-200" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded bg-slate-200" />
          ))}
        </div>
      </div>
    </div>
  );
}

function LibraryError() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-lg font-medium text-red-900">Failed to load interviews</p>
        <p className="mt-2 text-sm text-red-700">Please refresh the page or try again later.</p>
      </div>
    </div>
  );
}

