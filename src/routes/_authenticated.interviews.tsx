import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { format } from "date-fns";
import { Plus, Search, Link2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { StatusBadge, type InterviewStatus } from "@/components/status-badge";
import { stageLabel, type Stage } from "@/components/interview-progress";
import { toast } from "sonner";
import { createInterviewSession, listInterviewSessions } from "@/lib/interview.functions";

export const Route = createFileRoute("/_authenticated/interviews")({
  head: () => ({ meta: [{ title: "Exit Interviews — ExitIQ" }] }),
  component: InterviewsPage,
});

type FilterTab = "all" | InterviewStatus;

function InterviewsPage() {
  const listFn = useServerFn(listInterviewSessions);
  const { data: sessions = [], isLoading } = useQuery({
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
          <h1 className="text-2xl font-semibold tracking-tight">Exit interviews</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every AI-led customer conversation, in one place.
          </p>
        </div>
        <NewInterviewDialog />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as FilterTab)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="abandoned">Abandoned</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            className="pl-8"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
        {filtered.length === 0 ? (
          <EmptyState tab={tab} hasSessions={sessions.length > 0} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Created</TableHead>
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
                    {stageLabel(s.interview_progress as Stage)}
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

function EmptyState({ tab, hasSessions }: { tab: FilterTab; hasSessions: boolean }) {
  const title =
    !hasSessions
      ? "No interviews yet"
      : tab === "active"
        ? "No active interviews"
        : tab === "completed"
          ? "No completed interviews"
          : tab === "abandoned"
            ? "No abandoned interviews"
            : "No interviews match";
  const desc =
    !hasSessions
      ? "Create your first interview and share the link with a churned customer to start collecting feedback."
      : "Try a different filter or create a new interview session.";
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted">
        <Link2 className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{desc}</p>
      <div className="mt-5">
        <NewInterviewDialog />
      </div>
    </div>
  );
}

function NewInterviewDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const createFn = useServerFn(createInterviewSession);

  const create = useMutation({
    mutationFn: (vars: { customer_name: string; customer_email: string }) =>
      createFn({ data: vars }),
    onSuccess: (session) => {
      qc.invalidateQueries({ queryKey: ["interview-sessions"] });
      const url = `${window.location.origin}/interview/${session.id}`;
      setLink(url);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) { setLink(null); setName(""); setEmail(""); }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> New interview
        </Button>
      </DialogTrigger>
      <DialogContent>
        {!link ? (
          <>
            <DialogHeader>
              <DialogTitle>Create a new exit interview</DialogTitle>
              <DialogDescription>
                We'll generate a unique link you can send to the customer. The AI handles the rest.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="cn">Customer name</Label>
                <Input id="cn" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Cooper" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ce">Customer email</Label>
                <Input id="ce" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@acme.com" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                disabled={create.isPending}
                onClick={() => create.mutate({ customer_name: name, customer_email: email })}
              >
                {create.isPending ? "Creating…" : "Create interview"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Interview link ready</DialogTitle>
              <DialogDescription>
                Share this private link with the customer. They can complete it any time.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs font-mono break-all">
              {link}
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => { navigator.clipboard.writeText(link); toast.success("Link copied"); }}
              >
                Copy link
              </Button>
              <Button
                onClick={() => {
                  setOpen(false);
                  navigate({ to: "/interview/$sessionId", params: { sessionId: link.split("/").pop()! } });
                }}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" /> Open interview
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
