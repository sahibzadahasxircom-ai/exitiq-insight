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
  console.log("PreForm component mounted with sessionId:", sessionId);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateFn = useServerFn(updateInterviewSession);

  // Fetch company customization
  console.log("Pre-form: About to call useQuery");
  
  const { data: company, isLoading: isLoadingCompany } = useQuery({
    queryKey: ["company", sessionId],
    queryFn: async () => {
      try {
        console.log("Pre-form: Query function executing");
        const supabaseUrl = process.env.VITE_SUPABASE_URL!;
        const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        console.log("Pre-form: Fetching company data for session:", sessionId);

        const { data: session, error: sessionError } = await supabase
          .from("interview_sessions")
          .select("company_id")
          .eq("id", sessionId)
          .single();

        console.log("Pre-form: Session data:", session);
        console.log("Pre-form: Session error:", sessionError);

        if (!session?.company_id) {
          console.log("Pre-form: No company_id in session");
          return null;
        }

        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .select("pre_form_style, pre_form_title, pre_form_description, pre_form_fields, company_name, company_logo, brand_color")
          .eq("id", session.company_id)
          .single();

        console.log("Pre-form: Company data:", companyData);
        console.log("Pre-form: Company error:", companyError);

        return companyData;
      } catch (error) {
        console.error("Pre-form: Query function error:", error);
        throw error;
      }
    },
  });
  
  console.log("Pre-form: useQuery called, isLoading:", isLoadingCompany, "company data:", company);

  // Default values if company customization not set
  const formStyle = company?.pre_form_style || "professional";
  const formTitle = company?.pre_form_title || "We're sorry to see you go";
  const formDescription = company?.pre_form_description || "Help us improve by sharing your feedback";
  const brandColor = company?.brand_color || "#2563eb";
  const companyName = company?.company_name || "Your Company";
  const companyLogo = company?.company_logo;

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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient effect using brand color */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          background: `radial-gradient(circle at 20% 20%, ${brandColor} 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${brandColor} 0%, transparent 50%)`
        }}
      />
      
      {/* Header with company branding */}
      <header className="border-b border-border bg-background/90 backdrop-blur relative z-10">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            {companyLogo ? (
              <img src={companyLogo} alt={companyName} className="h-8 w-8 object-contain" />
            ) : (
              <div 
                className="h-8 w-8 rounded flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: brandColor }}
              >
                {companyName?.charAt(0).toUpperCase() || "E"}
              </div>
            )}
            <span className="font-semibold">{companyName}</span>
          </div>
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-6 py-12 relative z-10">
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
                  Starting Conversation...
                </>
              ) : (
                <>
                  Start Conversation
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
