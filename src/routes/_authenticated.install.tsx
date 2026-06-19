import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Copy, Code2, Webhook, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/install")({
  head: () => ({ meta: [{ title: "Install — ExitIQ" }] }),
  component: InstallPage,
});

function InstallPage() {
  const { company } = useAuth();
  const workspaceKey = company?.id ? `wk_${company.id.slice(0, 18)}` : "wk_••••••••••••••••";
  const webhookUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/public/cancellation/${company?.id ?? "your-workspace"}`
      : "https://exitiq.app/api/public/cancellation/your-workspace";

  const snippet = `<!-- ExitIQ widget — install once, runs automatically on every cancel -->
<script src="https://cdn.exitiq.app/v1/widget.js" defer></script>
<script>
  window.ExitIQ = window.ExitIQ || [];
  ExitIQ.init({
    workspaceKey: "${workspaceKey}",
    trigger: "[data-cancel-subscription]", // any element that starts cancellation
    user: { id: currentUser.id, email: currentUser.email, name: currentUser.name },
  });
</script>`;

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Install ExitIQ</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Install once. ExitIQ activates automatically whenever a customer tries to cancel.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatusCard icon={Code2} label="Widget" value="Not detected" muted />
        <StatusCard icon={Webhook} label="Stripe webhook" value="Not connected" muted />
        <StatusCard icon={Zap} label="Auto-pilot" value="Ready" />
      </div>

      <Section
        step="01"
        title="Drop in the widget"
        description="Add this snippet to your app shell. The widget intercepts any element matching the trigger selector and runs the AI interview before letting the cancel through."
      >
        <CodeBlock code={snippet} />
      </Section>

      <Section
        step="02"
        title="Or connect via Stripe"
        description="Prefer a no-code path? Point Stripe's customer.subscription.deleted webhook at this endpoint and we'll email a personal interview link to every cancelling customer."
      >
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs">
          <span className="break-all">{webhookUrl}</span>
          <CopyButton text={webhookUrl} />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Selected events: <code className="font-mono">customer.subscription.deleted</code>,{" "}
          <code className="font-mono">customer.subscription.updated</code>
        </p>
      </Section>

      <Section
        step="03"
        title="That's it — sit back"
        description="Cancellations flow into the dashboard automatically. The AI decides how deep to dig per customer; you only see the synthesized intelligence."
      >
        <ul className="space-y-2 text-sm">
          {[
            "Interviews trigger automatically on every cancel attempt",
            "Adaptive AI — 3 questions for one customer, 15 for another",
            "Insights, competitors, and recommended actions update in real time",
            "No surveys to design, no links to send, nothing to schedule",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-muted-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <div className="text-xs text-muted-foreground">
            All customer responses are encrypted at rest and never used to train external models.
            ExitIQ is SOC 2 Type II and GDPR compliant.
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  step, title, description, children,
}: { step: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
      <div className="mb-4 flex items-start gap-4">
        <span className="rounded-md border border-border bg-background px-2 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground">
          {step}
        </span>
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function StatusCard({
  icon: Icon, label, value, muted,
}: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; muted?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className={`mt-2 text-sm font-medium ${muted ? "text-muted-foreground" : "text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-lg border border-border bg-[oklch(0.18_0_0)] p-4 text-[12.5px] leading-relaxed text-[oklch(0.92_0_0)]">
        <code>{code}</code>
      </pre>
      <div className="absolute right-2 top-2">
        <CopyButton text={code} />
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size="sm"
      variant="outline"
      className="h-7 gap-1.5 px-2 text-xs"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}
