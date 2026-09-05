import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { updateInterviewSession, getCompanyBySessionId } from "@/lib/interview.functions";
import { useQuery } from "@tanstack/react-query";

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
  const getCompanyFn = useServerFn(getCompanyBySessionId);

  // Fetch company customization using server function
  console.log("Pre-form: About to call useQuery");
  
  const { data: company, isLoading: isLoadingCompany } = useQuery({
    queryKey: ["company", sessionId],
    queryFn: () => getCompanyFn({ data: { sessionId } }),
  });
  
  console.log("Pre-form: useQuery called, isLoading:", isLoadingCompany, "company data:", company);

  // Default values if company customization not set
  const formStyle = company?.pre_form_style || "professional";
  const formTitle = company?.pre_form_title || "We're sorry to see you go";
  const formDescription = company?.pre_form_description || "Help us improve by sharing your feedback";
  const brandColor = company?.brand_color || "#2563eb";
  const companyName = company?.company_name || "Your Company";
  const companyLogo = company?.company_logo;
  const backgroundStyle = company?.background_style || "gradient";
  const buttonColor = company?.button_color || brandColor;
  const buttonTextColor = company?.button_text_color || "#ffffff";
  const textColor = company?.text_color || "#000000";
  const solidBackgroundColor = company?.solid_background_color || "";

  // Render background based on style
  const renderBackground = () => {
    switch (backgroundStyle) {
      case "mesh":
        return (
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: `
                radial-gradient(at 40% 20%, ${brandColor} 0px, transparent 50%),
                radial-gradient(at 80% 0%, ${brandColor} 0px, transparent 50%),
                radial-gradient(at 0% 50%, ${brandColor} 0px, transparent 50%),
                radial-gradient(at 80% 50%, ${brandColor} 0px, transparent 50%),
                radial-gradient(at 0% 100%, ${brandColor} 0px, transparent 50%),
                radial-gradient(at 80% 100%, ${brandColor} 0px, transparent 50%)
              `
            }}
          />
        );
      case "aurora":
        return (
          <div 
            className="absolute inset-0 opacity-15"
            style={{
              background: `
                linear-gradient(135deg, ${brandColor} 0%, transparent 50%),
                linear-gradient(225deg, ${brandColor} 0%, transparent 50%),
                linear-gradient(45deg, ${brandColor} 0%, transparent 50%)
              `
            }}
          />
        );
      case "dots":
        return (
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle, ${brandColor} 1px, transparent 1px)`,
              backgroundSize: '20px 20px'
            }}
          />
        );
      case "layers":
        return (
          <>
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                background: `linear-gradient(180deg, ${brandColor} 0%, transparent 100%)`
              }}
            />
            <div 
              className="absolute inset-0 opacity-5"
              style={{
                background: `linear-gradient(180deg, transparent 0%, ${brandColor} 100%)`
              }}
            />
          </>
        );
      default: // gradient
        return (
          <div 
            className="absolute inset-0 opacity-15"
            style={{
              background: `radial-gradient(circle at 20% 20%, ${brandColor} 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${brandColor} 0%, transparent 50%)`
            }}
          />
        );
    }
  };

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
          className={`w-full max-w-md shadow-soft relative overflow-hidden ${
            formStyle === "casual" ? "rounded-2xl border-2" : 
            formStyle === "minimal" ? "border-none shadow-none bg-transparent" : ""
          }`}
          style={{ backgroundColor: solidBackgroundColor || (backgroundStyle === "none" ? "transparent" : "white") }}
        >
          {/* Background effect for the card - only show if no solid background */}
          {!solidBackgroundColor && (
            <>
              {backgroundStyle === "mesh" && (
                <div 
                  className="absolute inset-0 opacity-40 pointer-events-none"
                  style={{
                    background: `
                      radial-gradient(at 40% 20%, ${brandColor} 0px, transparent 50%),
                      radial-gradient(at 80% 0%, ${brandColor} 0px, transparent 50%),
                      radial-gradient(at 0% 50%, ${brandColor} 0px, transparent 50%),
                      radial-gradient(at 80% 50%, ${brandColor} 0px, transparent 50%),
                      radial-gradient(at 0% 100%, ${brandColor} 0px, transparent 50%),
                      radial-gradient(at 80% 100%, ${brandColor} 0px, transparent 50%)
                    `
                  }}
                />
              )}
              {backgroundStyle === "aurora" && (
                <div 
                  className="absolute inset-0 opacity-30 pointer-events-none"
                  style={{
                    background: `
                      linear-gradient(135deg, ${brandColor} 0%, transparent 50%),
                      linear-gradient(225deg, ${brandColor} 0%, transparent 50%),
                      linear-gradient(45deg, ${brandColor} 0%, transparent 50%)
                    `
                  }}
                />
              )}
              {backgroundStyle === "dots" && (
                <div 
                  className="absolute inset-0 opacity-25 pointer-events-none"
                  style={{
                    backgroundImage: `radial-gradient(circle, ${brandColor} 2px, transparent 2px)`,
                    backgroundSize: '30px 30px'
                  }}
                />
              )}
              {backgroundStyle === "layers" && (
                <>
                  <div 
                    className="absolute inset-0 opacity-25 pointer-events-none"
                    style={{
                      background: `linear-gradient(180deg, ${brandColor} 0%, transparent 100%)`
                    }}
                  />
                  <div 
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                      background: `linear-gradient(180deg, transparent 0%, ${brandColor} 100%)`
                    }}
                  />
                </>
              )}
              {backgroundStyle === "gradient" && (
                <div 
                  className="absolute inset-0 opacity-30 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 20% 20%, ${brandColor} 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${brandColor} 0%, transparent 50%)`
                  }}
                />
              )}
            </>
          )}
          
          <div className="relative z-10" style={{ color: textColor }}>
          <CardHeader className={`space-y-1 ${formStyle === "minimal" ? "text-center" : ""}`}>
            <CardTitle className={`${
              formStyle === "casual" ? "text-3xl font-semibold" :
              formStyle === "minimal" ? "text-xl font-medium" : "text-2xl font-bold"
            } tracking-tight`} style={{ color: textColor }}>
              {formTitle}
            </CardTitle>
            <CardDescription className={`${
              formStyle === "casual" ? "text-lg" :
              formStyle === "minimal" ? "text-sm" : "text-base"
            }`} style={{ color: textColor, opacity: 0.8 }}>
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
              style={{ backgroundColor: buttonColor, color: buttonTextColor }}
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
          </div>
        </Card>
      </div>
    </div>
  );
}
