import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { updateInterviewSession } from "@/lib/interview.functions";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";

export const Route = createFileRoute("/pre-form/$sessionId")({
  head: () => ({
    meta: [
      { title: "Exit Interview — leaveesy" },
      { name: "description", content: "Tell us why you're leaving" },
    ],
  }),
  component: PreForm,
});

function PreForm() {
  const { sessionId } = Route.useParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateFn = useServerFn(updateInterviewSession);

  // Fetch company customization
  const { data: company, isLoading: isLoadingCompany } = useQuery({
    queryKey: ["company", sessionId],
    queryFn: async () => {
      const supabaseUrl = process.env.VITE_SUPABASE_URL!;
      const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data: session } = await supabase
        .from("interview_sessions")
        .select("company_id")
        .eq("id", sessionId)
        .single();

      if (!session?.company_id) return null;

      const { data: companyData } = await supabase
        .from("companies")
        .select("pre_form_style, pre_form_title, pre_form_description, pre_form_fields")
        .eq("id", session.company_id)
        .single();

      return companyData;
    },
  });

  // Default values if company customization not set
  const formStyle = company?.pre_form_style || "professional";
  const formTitle = company?.pre_form_title || "We're sorry to see you go";
  const formDescription = company?.pre_form_description || "Help us improve by sharing your feedback";

  const handleContinue = async () => {
    setIsSubmitting(true);
    try {
      // Update the interview session with user data
      await updateFn({ 
        data: { 
          sessionId, 
          customer_name: name || undefined,
          customer_email: email || undefined,
        } 
      });
      
      // Redirect to interview with the session ID
      window.location.href = `/interview/${sessionId}`;
    } catch (error) {
      console.error("Failed to update session:", error);
      setIsSubmitting(false);
    }
  };

  if (isLoadingCompany) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src="/leaveesy.png" alt="leaveesy" className="h-8 w-auto object-contain" />
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-6 py-12">
        <Card 
          className={`w-full max-w-md shadow-soft ${
            formStyle === "casual" ? "rounded-2xl border-2" : 
            formStyle === "minimal" ? "border-none shadow-none bg-transparent" : ""
          }`}
        >
          <CardHeader className={`space-y-1 ${formStyle === "minimal" ? "text-center" : ""}`}>
            <CardTitle className={`${
              formStyle === "casual" ? "text-3xl font-semibold" :
              formStyle === "minimal" ? "text-xl font-medium" : "text-2xl font-bold"
            } tracking-tight`}>
              {formTitle}
            </CardTitle>
            <CardDescription className={`${
              formStyle === "casual" ? "text-lg" :
              formStyle === "minimal" ? "text-sm" : "text-base"
            }`}>
              {formDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your name (optional)</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={formStyle === "minimal" ? "border-b rounded-none px-0" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Your email (optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={formStyle === "minimal" ? "border-b rounded-none px-0" : ""}
              />
            </div>
            <Button 
              onClick={handleContinue}
              className={`w-full gap-2 ${
                formStyle === "casual" ? "rounded-full text-lg py-6" :
                formStyle === "minimal" ? "border-2 bg-transparent hover:bg-muted" : ""
              }`}
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Starting Interview...
                </>
              ) : (
                <>
                  Continue to Interview
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
            <p className={`text-center text-xs text-muted-foreground ${
              formStyle === "minimal" ? "hidden" : ""
            }`}>
              Your responses will help us improve our service
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
