import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type Stage = "started" | "discovery" | "deep_dive" | "root_cause" | "completed";

const STAGES: { key: Stage; label: string }[] = [
  { key: "started", label: "Started" },
  { key: "discovery", label: "Discovery" },
  { key: "deep_dive", label: "Deep Dive" },
  { key: "root_cause", label: "Root Cause" },
  { key: "completed", label: "Completed" },
];

export function InterviewProgress({ stage }: { stage: Stage }) {
  const currentIdx = STAGES.findIndex((s) => s.key === stage);
  return (
    <div className="flex w-full items-center gap-1.5">
      {STAGES.map((s, i) => {
        const done = i < currentIdx || stage === "completed";
        const active = i === currentIdx && stage !== "completed";
        return (
          <div key={s.key} className="flex flex-1 items-center gap-1.5">
            <div
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-medium transition-colors",
                done && "border-foreground bg-foreground text-background",
                active && "border-foreground bg-background text-foreground",
                !done && !active && "border-border bg-background text-muted-foreground",
              )}
            >
              {done ? <Check className="h-3 w-3" /> : i + 1}
            </div>
            <span
              className={cn(
                "hidden truncate text-[11px] font-medium sm:inline",
                done || active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {s.label}
            </span>
            {i < STAGES.length - 1 && (
              <div className={cn("h-px flex-1", done ? "bg-foreground" : "bg-border")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function stageLabel(stage: Stage) {
  return STAGES.find((s) => s.key === stage)?.label ?? stage;
}
