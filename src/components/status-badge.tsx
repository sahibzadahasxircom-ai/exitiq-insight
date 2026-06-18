import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type InterviewStatus = "active" | "completed" | "abandoned";

export function StatusBadge({ status }: { status: InterviewStatus }) {
  const styles =
    status === "completed"
      ? "border-success/40 bg-success/10 text-success"
      : status === "active"
        ? "border-primary/40 bg-primary/10 text-primary"
        : "border-border bg-muted text-muted-foreground";
  const dot =
    status === "completed" ? "bg-success" : status === "active" ? "bg-primary" : "bg-muted-foreground";
  return (
    <Badge variant="outline" className={cn("gap-1.5 font-medium capitalize", styles)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {status}
    </Badge>
  );
}
