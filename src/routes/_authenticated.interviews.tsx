import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/interviews")({
  head: () => ({ meta: [{ title: "Exit Interviews — ExitIQ" }] }),
  component: Interviews,
});

const rows = [
  { name: "Sarah Chen", company: "Loomly", reason: "Onboarding friction", status: "Completed", date: "Jun 14" },
  { name: "Daniel Park", company: "Northwind", reason: "Price", status: "Completed", date: "Jun 13" },
  { name: "Priya Shah", company: "Aircove", reason: "Missing features", status: "In progress", date: "Jun 13" },
  { name: "Marcus Webb", company: "Driftly", reason: "Switched to competitor", status: "Completed", date: "Jun 12" },
  { name: "Elena Ruiz", company: "Quanta", reason: "Other", status: "Abandoned", date: "Jun 11" },
];

function Interviews() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Exit interviews</h1>
          <p className="mt-1 text-sm text-muted-foreground">Every customer conversation, in one place.</p>
        </div>
        <Link to="/exit-interview" target="_blank">
          <Button size="sm" variant="outline">Open customer demo</Button>
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-soft">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Primary reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.name}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell className="text-muted-foreground">{r.company}</TableCell>
                <TableCell>{r.reason}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      r.status === "Completed" ? "border-success/40 text-success" :
                      r.status === "In progress" ? "border-primary/40 text-primary" :
                      "border-border text-muted-foreground"
                    }
                  >
                    {r.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">{r.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
