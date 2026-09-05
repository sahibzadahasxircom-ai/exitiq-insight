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
import { createCompanyFn, linkUserToCompanyFn } from "@/lib/company.server";

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
        // User has company, go to setup-wizard
        navigate({ to: search.redirect ?? "/setup-wizard", replace: true });
      } else if (!loading && session) {
        // No company_id, go to setup-wizard (company should be created during sign-up)
        navigate({ to: "/setup-wizard", replace: true });
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
            redirect_uri: window.location.origin + "/setup-wizard",
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
  const [companySize, setCompanySize] = useState("");
  const [companyIndustry, setCompanyIndustry] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    
    console.log("Sign-up attempt:", { email, firstName, lastName, company, companyUrl, companySize, companyIndustry });
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/setup-wizard",
        data: { 
          first_name: firstName, 
          last_name: lastName, 
          company_name: company, 
          company_url: companyUrl,
          company_size: companySize,
          company_industry: companyIndustry,
        },
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
      console.log("Company data stored in metadata for post-confirmation creation");
      toast.success("Account created! Please check your email to confirm your account.");
      return;
    }
    
    // If session exists (auto-confirmed), create company and proceed to setup wizard
    console.log("Auto-confirmed - session exists, creating company");
    
    try {
      // Create company using server function
      const newCompany = await createCompanyFn({
        data: {
          company_name: company,
          company_url: companyUrl || undefined,
          company_size: companySize || undefined,
          company_industry: companyIndustry || undefined,
        },
      });

      console.log("Company created with ID:", newCompany.id);

      // Get the user ID from auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not found after sign-up");
      }

      // Link user to company using server function
      await linkUserToCompanyFn({
        data: {
          userId: user.id,
          companyId: newCompany.id,
        },
      });

      console.log("User linked to company successfully");
      toast.success(`Account created for "${company}"`);
      
      // Navigate to setup wizard
      navigate({ to: "/setup-wizard", replace: true });
    } catch (error) {
      console.error("Error creating company during sign-up:", error);
      toast.error("Account created but failed to create company. Please try again.");
      // Still navigate to setup wizard, they can try again later
      navigate({ to: "/setup-wizard", replace: true });
    }
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
        <Label htmlFor="su-company-size">Company size</Label>
        <select
          id="su-company-size"
          value={companySize}
          onChange={(e) => setCompanySize(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select size</option>
          <option value="1-10">1-10 employees</option>
          <option value="11-50">11-50 employees</option>
          <option value="51-200">51-200 employees</option>
          <option value="201-500">201-500 employees</option>
          <option value="500+">500+ employees</option>
        </select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="su-company-industry">Industry</Label>
        <Input id="su-company-industry" value={companyIndustry} onChange={(e) => setCompanyIndustry(e.target.value)} placeholder="SaaS, E-commerce, etc." />
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

