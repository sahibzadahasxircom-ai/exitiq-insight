import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — leaveesy" },
      { name: "description", content: "Sign in to your leaveesy workspace." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { session, loading, profile } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const [checkingCompany, setCheckingCompany] = useState(true);

  useEffect(() => {
    const checkCompanyDetails = async () => {
      if (!loading && session && profile?.company_id) {
        try {
          const { data: company } = await supabase
            .from("companies")
            .select("company_name, company_url, company_size")
            .eq("id", profile.company_id)
            .maybeSingle();

          // If company has basic details filled, go to setup-wizard, otherwise go to company-details
          if (company && company.company_name) {
            navigate({ to: search.redirect ?? "/setup-wizard", replace: true });
          } else {
            navigate({ to: "/company-details", replace: true });
          }
        } catch (error) {
          console.error("Error checking company details:", error);
          navigate({ to: "/company-details", replace: true });
        }
      } else if (!loading && session) {
        // No company_id, go to company-details
        navigate({ to: "/company-details", replace: true });
      }
      setCheckingCompany(false);
    };

    checkCompanyDetails();
  }, [loading, session, profile, navigate, search.redirect]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-4 flex items-center justify-center gap-2">
          <img src="/leaveesy.png" alt="leaveesy" className="h-32 w-auto object-contain" />
        </Link>

        <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="pt-5"><SignInForm /></TabsContent>
            <TabsContent value="signup" className="pt-5"><SignUpForm /></TabsContent>
          </Tabs>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing you agree to our terms and privacy policy.
        </p>
      </div>
    </div>
  );
}

function GoogleButton() {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const result = await lovable.auth.signInWithOAuth("google", {
            redirect_uri: window.location.origin + "/company-details",
          });
          if (result.error) {
            toast.error("Google sign-in failed");
            setBusy(false);
          }
        } catch (error) {
          toast.error("Google sign-in failed");
          setBusy(false);
        }
      }}
    >
      Continue with Google
    </Button>
  );
}

function Divider() {
  return (
    <div className="my-4 flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
      <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function SignInForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      // Handle specific errors with better messages
      if (error.message.includes("Email not confirmed")) {
        toast.error("Please check your email to confirm your account, or try signing up again.");
      } else if (error.message.includes("Invalid login credentials")) {
        toast.error("Invalid email or password. Please try again.");
      } else if (error.message.includes("too many")) {
        toast.error("Too many attempts. Please wait a moment and try again.");
      } else {
        toast.error(error.message);
      }
      return;
    }
    toast.success("Welcome back");
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <GoogleButton />
      <Divider />
      <div className="grid gap-1.5">
        <Label htmlFor="si-email">Work email</Label>
        <Input id="si-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="grid gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="si-password">Password</Label>
          <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">Forgot?</Link>
        </div>
        <Input id="si-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

function SignUpForm() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    
    console.log("Sign-up attempt:", { email, firstName, lastName, company, companyUrl });
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/company-details",
        data: { first_name: firstName, last_name: lastName, company_name: company, company_url: companyUrl },
      },
    });
    
    console.log("Sign-up response:", { authData, authError });
    
    if (authError) {
      console.error("Sign-up error:", authError);
      setBusy(false);
      if (authError.message.includes("already registered")) {
        toast.error("An account with this email already exists. Please sign in instead.");
      } else {
        toast.error(authError.message);
      }
      return;
    }
    
    setBusy(false);
    
    // Check if email confirmation is required
    if (!authData.session) {
      console.log("Email confirmation required - session not returned");
      toast.success("Account created! Please check your email to confirm your account.");
      return;
    }
    
    // If session exists (auto-confirmed), proceed to company details
    console.log("Auto-confirmed - session exists, navigating to company-details");
    toast.success(`Account created for "${company}"`);
    navigate({ to: "/company-details", replace: true });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <GoogleButton />
      <Divider />
      <div className="grid gap-1.5">
        <Label htmlFor="su-firstname">First name</Label>
        <Input id="su-firstname" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="su-lastname">Last name</Label>
        <Input id="su-lastname" required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Cooper" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="su-company">Company name</Label>
        <Input id="su-company" required value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme, Inc." />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="su-company-url">Company website</Label>
        <Input id="su-company-url" type="url" required value={companyUrl} onChange={(e) => setCompanyUrl(e.target.value)} placeholder="https://acme.com" />
        <p className="text-xs text-muted-foreground">We'll learn about your product to provide better insights.</p>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="su-email">Work email</Label>
        <Input id="su-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="su-password">Password</Label>
        <Input id="su-password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        <p className="text-xs text-muted-foreground">At least 8 characters.</p>
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Creating workspace…" : "Create workspace"}
      </Button>
    </form>
  );
}

