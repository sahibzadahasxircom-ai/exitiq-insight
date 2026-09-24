import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { format } from "date-fns";
import { Search, ArrowRight, Users, MessageSquare, Activity, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { listInterviewSessions, listInsights } from "@/lib/interview.functions";

export const Route = createFileRoute("/_authenticated/interviews")({
  head: () => ({ meta: [{ title: "Cancellations — leaveesy" }] }),
  component: InterviewLibrary,
});

function InterviewLibrary() {
  const [search, setSearch] = useState("");
  const listFn = useServerFn(listInterviewSessions);
  const listInsightsFn = useServerFn(listInsights);
  
  const { data: sessions = [], isLoading, error } = useQuery({
    queryKey: ["interview-sessions"],
    queryFn: () => listFn({ data: undefined }),
    retry: false,
  });

  const { data: insights = [] } = useQuery({
    queryKey: ["interview-insights"],
    queryFn: () => listInsightsFn({ data: undefined }),
    retry: false,
  });

  // Combine sessions with insights data
  const displayData = useMemo(() => {
    return sessions.map((session: any) => {
      const insight = insights.find((i: any) => i.session_id === session.id);
      return {
        ...session,
        primary_reason: insight?.category || "In progress",
        executive_summary: insight?.summary || "Interview in progress...",
        sentiment: insight?.sentiment || "neutral",
      };
    });
  }, [sessions, insights]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return displayData.filter((i) => {
      if (!q) return true;
      const name = i.customer_name?.toLowerCase() || "";
      const email = i.customer_email?.toLowerCase() || "";
      return name.includes(q) || email.includes(q);
    });
  }, [search, displayData]);

  // Calculate stats
  const stats = {
    total: sessions.length,
    completed: sessions.filter((s: any) => s.interview_status === 'completed').length,
    active: sessions.filter((s: any) => s.interview_status === 'active').length,
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 md:space-y-8 px-4 py-4 md:px-6 md:py-6 lg:py-8">
      <header className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Cancellations</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {displayData.length} customer interviews collected
            </p>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 md:gap-6">
        <StatCard label="Total" value={stats.total} icon={<Users className="h-4 w-4" />} color="blue" />
        <StatCard label="Completed" value={stats.completed} icon={<MessageSquare className="h-4 w-4" />} color="green" />
        <StatCard label="Active" value={stats.active} icon={<Activity className="h-4 w-4" />} color="amber" />
      </div>

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

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-muted-foreground">
          {displayData.length === 0 ? (
            <>
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No interviews yet. Start collecting customer feedback to see cancellations here.</p>
            </>
          ) : (
            "Nothing matches these filters."
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                  <p className="text-xs text-slate-500">{i.customer_email || "No email"}</p>
                </div>
                <p className="text-xs text-slate-500">{format(new Date(i.created_at), "MMM d")}</p>
              </div>

              <div className="mt-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Status</p>
                <p className="mt-1 text-sm font-medium text-slate-900">{capitalize(i.interview_status || "Active")}</p>
              </div>

              <div className="mt-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Category</p>
                <p className="mt-1 text-sm font-medium text-slate-900">{i.primary_reason || "Not categorized"}</p>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-600 line-clamp-2">{i.executive_summary || "Interview in progress..."}</p>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                <span>{capitalize(i.interview_progress || "Started")}</span>
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

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 md:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}



