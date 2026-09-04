import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { updateInterviewSession } from "@/lib/interview.functions";

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
        <Card className="w-full max-w-md shadow-soft">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">
              We're sorry to see you go
            </CardTitle>
            <CardDescription className="text-base">
              Help us improve by sharing your feedback
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
              />
            </div>
            <Button 
              onClick={handleContinue}
              className="w-full gap-2"
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
            <p className="text-center text-xs text-muted-foreground">
              Your responses will help us improve our service
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
