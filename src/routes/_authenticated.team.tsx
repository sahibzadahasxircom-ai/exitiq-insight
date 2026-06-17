import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/team")({
  head: () => ({ meta: [{ title: "Team — ExitIQ" }] }),
  component: TeamPage,
});

type Member = {
  user_id: string;
  role: "owner" | "member";
  full_name: string;
  email: string;
};

function TeamPage() {
  const { company, role, user } = useAuth();
  const isOwner = role === "owner";
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"owner" | "member">("member");

  async function load() {
    if (!company?.id) return;
    setLoading(true);
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .eq("company_id", company.id);
    const ids = (roles ?? []).map((r) => r.user_id);
    const { data: profiles } = ids.length
      ? await supabase.from("profiles").select("id, full_name, email").in("id", ids)
      : { data: [] as { id: string; full_name: string; email: string }[] };
    const byId = new Map((profiles ?? []).map((p) => [p.id, p]));
    setMembers(
      (roles ?? []).map((r) => ({
        user_id: r.user_id,
        role: r.role as "owner" | "member",
        full_name: byId.get(r.user_id)?.full_name ?? "—",
        email: byId.get(r.user_id)?.email ?? "—",
      })),
    );
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [company?.id]);

  function onInvite(e: React.FormEvent) {
    e.preventDefault();
    // Placeholder — invite emails are not wired up yet.
    toast.success(`Invite queued for ${inviteEmail}`, {
      description: "Email invites will go out once your sender domain is connected.",
    });
    setInviteEmail("");
  }

  async function removeMember(m: Member) {
    if (!company?.id) return;
    if (m.user_id === user?.id) return toast.error("You can't remove yourself.");
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("company_id", company.id)
      .eq("user_id", m.user_id);
    if (error) return toast.error(error.message);
    toast.success("Member removed");
    load();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage who has access to {company?.company_name ?? "your workspace"}.
        </p>
      </div>

      {isOwner && (
        <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
          <h2 className="text-base font-semibold">Invite a teammate</h2>
          <p className="text-sm text-muted-foreground">They'll get an email with a link to join this workspace.</p>
          <form onSubmit={onInvite} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="grid flex-1 gap-1.5">
              <Label htmlFor="invite-email">Work email</Label>
              <Input id="invite-email" type="email" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="teammate@company.com" />
            </div>
            <div className="grid gap-1.5">
              <Label>Role</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "owner" | "member")}>
                <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="gap-2"><Mail className="h-4 w-4" />Send invite</Button>
          </form>
        </section>
      )}

      <section className="rounded-xl border border-border bg-card shadow-soft">
        <div className="border-b border-border p-5">
          <h2 className="text-base font-semibold">Members</h2>
          <p className="text-xs text-muted-foreground">{members.length} {members.length === 1 ? "person" : "people"} in this workspace</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center text-sm text-muted-foreground">Loading…</TableCell></TableRow>
            ) : members.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-sm text-muted-foreground">No members yet.</TableCell></TableRow>
            ) : members.map((m) => (
              <TableRow key={m.user_id}>
                <TableCell className="font-medium">{m.full_name}{m.user_id === user?.id && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}</TableCell>
                <TableCell className="text-muted-foreground">{m.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={m.role === "owner" ? "border-primary/40 text-primary" : ""}>
                    {m.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {isOwner && m.user_id !== user?.id && (
                    <Button size="icon" variant="ghost" onClick={() => removeMember(m)} aria-label="Remove">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
