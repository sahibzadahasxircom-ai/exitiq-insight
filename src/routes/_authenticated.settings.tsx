import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plug } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — ExitIQ" },
      { name: "description", content: "Manage your ExitIQ workspace, integrations, and notifications." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { company, role, refresh } = useAuth();
  const isOwner = role === "owner";
  const [companyName, setCompanyName] = useState("");
  const [saving, setSaving] = useState(false);
  const [notify, setNotify] = useState(true);
  const [weekly, setWeekly] = useState(false);

  useEffect(() => { setCompanyName(company?.company_name ?? ""); }, [company?.company_name]);

  async function saveCompany() {
    if (!company?.id) return;
    setSaving(true);
    const { error } = await supabase.from("companies").update({ company_name: companyName }).eq("id", company.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    await refresh();
    toast.success("Company updated");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Workspace, integrations, and notifications.</p>
      </div>

      <Section title="Company" description="How your workspace appears across ExitIQ.">
        <div className="grid gap-2">
          <Label htmlFor="company">Company name</Label>
          <Input id="company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} disabled={!isOwner} />
          {!isOwner && <p className="text-xs text-muted-foreground">Only owners can change company settings.</p>}
        </div>
        {isOwner && (
          <div className="flex justify-end">
            <Button size="sm" onClick={saveCompany} disabled={saving || !companyName.trim()}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        )}
      </Section>

      <Section title="Integrations" description="Connect ExitIQ to your billing and CRM tools.">
        <Integration name="Stripe" desc="Pull churn events and revenue context." />
        <Integration name="HubSpot" desc="Sync customer profiles and lifecycle stages." />
        <Integration name="Intercom" desc="Trigger interviews from cancellation conversations." />
      </Section>

      <Section title="Notifications" description="Control when ExitIQ emails you.">
        <ToggleRow
          label="New interview completed"
          desc="Get an email each time a customer finishes an exit interview."
          checked={notify} onChange={setNotify}
        />
        <ToggleRow
          label="Weekly insights digest"
          desc="A Monday-morning summary of churn reasons and recommended actions."
          checked={weekly} onChange={setWeekly}
        />
      </Section>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
      <div className="mb-5">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Integration({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Plug className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold">{name}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      <Button size="sm" variant="outline">Connect</Button>
    </div>
  );
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-6 rounded-lg border border-border bg-background p-4">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
