import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { format } from "date-fns";
import { Search, ArrowRight, Users, MessageSquare, Activity, RefreshCw, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { listInterviewSessions, listInsights, getInterviewSession, getInterviewMessages } from "@/lib/interview.functions";

export const Route = createFileRoute("/_authenticated/interviews")({
  head: () => ({ meta: [{ title: "Cancellations — leaveesy" }] }),
  component: InterviewLibrary,
});

function InterviewLibrary() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'active'>('all');
  const [selectedInterview, setSelectedInterview] = useState<any>(null);
  const listFn = useServerFn(listInterviewSessions);
  const listInsightsFn = useServerFn(listInsights);
  const getInterviewFn = useServerFn(getInterviewSession);
  const getMessagesFn = useServerFn(getInterviewMessages);
  
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
      // Search filter
      if (q) {
        const name = i.customer_name?.toLowerCase() || "";
        const email = i.customer_email?.toLowerCase() || "";
        if (!name.includes(q) && !email.includes(q)) return false;
      }
      
      // Status filter
      if (statusFilter === 'completed' && i.interview_status !== 'completed') return false;
      if (statusFilter === 'active' && i.interview_status !== 'active') return false;
      
      return true;
    });
  }, [search, displayData, statusFilter]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 md:space-y-8 px-4 md:px-6 py-4 md:py-6 lg:py-8">
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
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            All
          </Button>
          <Button
            variant={statusFilter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('completed')}
          >
            Completed
          </Button>
          <Button
            variant={statusFilter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('active')}
          >
            Active
          </Button>
        </div>
        <span className="ml-auto text-xs text-slate-500">{filtered.length} shown</span>
      </div>

      {/* Interview Detail Modal */}
      <Dialog open={!!selectedInterview} onOpenChange={() => setSelectedInterview(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Interview Details</DialogTitle>
            <DialogDescription>
              {selectedInterview?.customer_name || "Anonymous Customer"}
            </DialogDescription>
          </DialogHeader>
          <InterviewDetailContent interviewId={selectedInterview?.id} />
        </DialogContent>
      </Dialog>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filtered.map((session) => (
          <button
            key={session.id}
            onClick={() => setSelectedInterview(session)}
            className="group block rounded-lg border border-gray-200 bg-white p-4 md:p-5 shadow-sm hover:border-gray-300 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {session.customer_name || "Anonymous Customer"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {session.customer_email || "No email"}
                </p>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                session.interview_status === 'completed' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {session.interview_status === 'completed' ? 'Completed' : 'Active'}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="truncate">{session.primary_reason}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Activity className="h-3.5 w-3.5" />
                <span>{session.sentiment}</span>
              </div>
              <p className="text-xs text-gray-500">
                {format(new Date(session.created_at), "MMM d, yyyy")}
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-blue-600 group-hover:text-blue-700">
              View details <ArrowRight className="h-3 w-3" />
            </div>
          </button>
        ))}
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

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function InterviewDetailContent({ interviewId }: { interviewId: string }) {
  const getInterviewFn = useServerFn(getInterviewSession);
  const getMessagesFn = useServerFn(getInterviewMessages);

  const { data: interviewData, isLoading } = useQuery({
    queryKey: ["interview", interviewId],
    queryFn: () => getInterviewFn({ data: { id: interviewId } }),
    retry: false,
    enabled: !!interviewId,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["interview-messages", interviewId],
    queryFn: () => getMessagesFn({ data: { sessionId: interviewId } }),
    retry: false,
    enabled: !!interviewData?.session,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!interviewData?.session) {
    return (
      <div className="text-center text-sm text-slate-500 py-12">
        Interview not found
      </div>
    );
  }

  const session = interviewData.session;
  const insight = interviewData.insight;
  const phrases = buildHighlightPhrases(insight);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</p>
            <p className="mt-1 font-semibold text-slate-900 capitalize">{session.interview_status || "Active"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Progress</p>
            <p className="mt-1 font-semibold text-slate-900 capitalize">{session.interview_progress || "Started"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Category</p>
            <p className="mt-1 font-semibold text-slate-900 capitalize">{insight?.category || "Not categorized"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Sentiment</p>
            <p className="mt-1 font-semibold text-slate-900 capitalize">{insight?.sentiment || "Neutral"}</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      {insight?.summary && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Summary</h3>
          <p className="text-sm leading-relaxed text-slate-800">{insight.summary}</p>
        </div>
      )}

      {/* Conversation Messages */}
      {messages.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Conversation</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {messages.map((message: any) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-50 text-slate-900'
                      : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  <p className="text-xs font-medium mb-1">
                    {message.role === 'user' ? 'Customer' : 'leaveesy'}
                  </p>
                  <p className="text-sm leading-relaxed">
                    {message.role === 'user' ? highlight(message.message_content, phrases) : message.message_content}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {format(new Date(message.created_at), "HH:mm")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Insights */}
      {insight && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Key Insights</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Primary Category</p>
              <p className="mt-1 text-sm text-slate-900">{insight.category || "Not categorized"}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Sentiment</p>
              <p className="mt-1 text-sm text-slate-700">{insight.sentiment || "Neutral"}</p>
            </div>
            {insight.quote && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Notable Quote</p>
                <p className="mt-1 text-sm italic text-slate-700">"{insight.quote}"</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function buildHighlightPhrases(insight: any): string[] {
  if (!insight) return [];

  const raw = [
    insight.summary || "",
    insight.category || "",
    insight.sentiment || "",
  ]
    .flatMap((s) =>
      s
        .split(/[,.—·\s]+/)
        .map((x) => x.trim())
        .filter((x) => x.length > 4)
    );

  return Array.from(new Set(raw)).sort((a, b) => b.length - a.length);
}

function highlight(text: string, phrases: string[]) {
  if (phrases.length === 0) return text;
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(${phrases.slice(0, 30).map(escape).join("|")})`, "gi");
  const parts = text.split(pattern);
  return parts.map((part, idx) =>
    idx % 2 === 1 ? (
      <mark key={idx} className="rounded-[3px] bg-yellow-200/70 px-0.5 py-0 text-slate-900">
        {part}
      </mark>
    ) : (
      <span key={idx}>{part}</span>
    )
  );
}



