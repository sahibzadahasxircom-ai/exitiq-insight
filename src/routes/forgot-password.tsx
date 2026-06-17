import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — ExitIQ" }] }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setSent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-soft">
        <h1 className="text-xl font-semibold tracking-tight">Forgot your password?</h1>
        <p className="mt-1 text-sm text-muted-foreground">We'll email you a link to reset it.</p>
        {sent ? (
          <div className="mt-6 rounded-md border border-border bg-muted/40 p-4 text-sm">
            If an account exists for <strong>{email}</strong>, a reset link is on its way.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="fp-email">Email</Label>
              <Input id="fp-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        )}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/auth" className="hover:text-foreground">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}
