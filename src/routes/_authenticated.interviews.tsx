import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { format } from "date-fns";
import { Search, Inbox, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { StatusBadge, type InterviewStatus } from "@/components/status-badge";
import { listInterviewSessions } from "@/lib/interview.functions";

export const Route = createFileRoute("/_authenticated/interviews")({
  head: () => ({ meta: [{ title: "Cancellations — ExitIQ" }] }),
  component: InterviewsPage,
});

type FilterTab = "all" | InterviewStatus;

function InterviewsPage() {
  const listFn = useServerFn(listInterviewSessions);
  const { data: sessions = [] } = useQuery({
    queryKey: ["interview-sessions"],
    queryFn: () => listFn(),
  });

  const [tab, setTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      if (tab !== "all" && s.interview_status !== tab) return false;
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        s.customer_name.toLowerCase().includes(q) ||
        s.customer_email.toLowerCase().includes(q)
      );
    });
  }, [sessions, tab, search]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cancellations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every customer who attempted to cancel — automatically interviewed by ExitIQ.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success">
          <Zap className="h-3 w-3" /> Auto-pilot active
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as FilterTab)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">In progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="abandoned">Skipped</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer"
            className="pl-8"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
        {filtered.length === 0 ? (
          <EmptyState hasSessions={sessions.length > 0} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Triggered</TableHead>
                <TableHead className="text-right">Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow
                  key={s.id}
                  className="cursor-pointer"
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest("a,button")) return;
                    window.location.href = `/interviews/${s.id}`;
                  }}
                >
                  <TableCell className="font-medium">
                    <Link to="/interviews/$id" params={{ id: s.id }} className="hover:underline">
                      {s.customer_name || "Anonymous customer"}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.customer_email || "—"}</TableCell>
                  <TableCell>
                    <StatusBadge status={s.interview_status as InterviewStatus} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(s.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {s.completed_at ? format(new Date(s.completed_at), "MMM d, yyyy") : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

function EmptyState({ hasSessions }: { hasSessions: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted">
        <Inbox className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold">
        {hasSessions ? "Nothing matches this filter" : "No cancellations yet"}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {hasSessions
          ? "Try another tab or clear the search."
          : "Once you install the ExitIQ widget or connect Stripe, every cancellation attempt will appear here automatically."}
      </p>
      {!hasSessions && (
        <Link
          to="/install"
          className="mt-5 inline-flex items-center rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted"
        >
          Install ExitIQ →
        </Link>
      )}
    </div>
  );
}
