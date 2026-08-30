import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Clock, CheckCircle2, Zap, Globe, CreditCard, Webhook, Code, Star } from "lucide-react";

export const Route = createFileRoute("/onboarding/recommendations")({
  head: () => ({
    meta: [
      { title: "Recommended Setup — leaveesy" },
      { name: "description", content: "Your personalized integration recommendations." },
    ],
  }),
  component: Recommendations,
});

function Recommendations() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Generate recommendations based on answers using rule-based logic
    const answers = JSON.parse(localStorage.getItem('onboardingAnswers') || '{}');
    
    // Generate recommendations based on answers
    const recs = generateRecommendations(answers);
    setRecommendations(recs);
    setIsLoading(false);
  }, []);

  const handleBeginSetup = () => {
    localStorage.setItem('recommendedIntegrations', JSON.stringify(recommendations));
    localStorage.setItem('currentIntegrationIndex', '0');
    navigate({ to: "/onboarding/install", replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-[700px]">
          <div className="bg-white rounded-3xl shadow-xl p-12">
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <img src="/leaveesy.png" alt="leaveesy" className="h-32 w-auto object-contain" />
              </div>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyzing Your Setup</h2>
              <p className="text-slate-600">leaveesy is analyzing your requirements to recommend the best integrations.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-[700px]">
        <div className="bg-white rounded-3xl shadow-xl p-12">
          <div className="mb-8">
            <div className="mb-2 text-sm font-medium text-slate-500">
              Step 5 of 6
            </div>
            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
                5
              </div>
              <div className="flex-1 h-1 bg-slate-200 rounded-full">
                <div className="h-full w-[83.33%] bg-blue-600 rounded-full" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              Recommended Setup
            </h1>
            <p className="text-slate-600">
              Based on your responses, here are the integrations we recommend for your leaveesy setup.
            </p>
          </div>

          {recommendations.length > 0 && (
            <div className="mb-8 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 p-4 bg-green-50 rounded-xl border border-green-200">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xs text-green-700 font-medium">Coverage</p>
                  <p className="text-lg font-bold text-green-900">{calculateCoverage(recommendations)}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-xs text-blue-700 font-medium">Setup Time</p>
                  <p className="text-lg font-bold text-blue-900">{calculateTotalTime(recommendations)} min</p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8 space-y-4">
            {recommendations.map((rec, index) => (
              <RecommendationCard key={index} recommendation={rec} index={index} />
            ))}
          </div>

          <div className="flex items-center justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/onboarding/integration-wizard" })}
              className="gap-2 h-12 px-6 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              type="button"
              onClick={handleBeginSetup}
              className="gap-2 h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              Begin Setup
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateCoverage(recommendations: any[]) {
  if (recommendations.length === 0) return 0;
  const avgCoverage = recommendations.reduce((sum, rec) => {
    const coverage = parseInt(rec.coverage) || 0;
    return sum + coverage;
  }, 0) / recommendations.length;
  return Math.round(avgCoverage);
}

function calculateTotalTime(recommendations: any[]) {
  return recommendations.reduce((sum, rec) => {
    const time = parseInt(rec.setupTime) || 0;
    return sum + time;
  }, 0);
}

function generateRecommendations(answers: any) {
  const recommendations: any[] = [];
  const { productType, triggerActions, hasSubscriptions, billingPlatform, technicalLevel } = answers;

  // Rule-based recommendation logic
  
  // JavaScript Widget - recommended for website-based products or when website actions are triggers
  const hasWebsiteProduct = productType?.includes("Website") || productType?.includes("SaaS") || productType?.includes("Website + Mobile App");
  const hasWebsiteTriggers = triggerActions?.some((action: string) => 
    ["Sign Out", "Delete Account", "Downgrade Plan"].includes(action)
  );
  
  if (hasWebsiteProduct || hasWebsiteTriggers) {
    recommendations.push({
      name: "JavaScript Widget",
      icon: "⚡",
      reason: "Detect website actions like Sign Out, Delete Account, Downgrade, and Cancel button clicks.",
      whatItDetects: "User interactions with cancellation-related UI elements",
      setupTime: "5 minutes",
      coverage: "95%",
    });
  }

  // REST API - recommended for technical teams, mobile apps, or custom billing
  const hasDevelopers = technicalLevel === "We have developers";
  const hasMobileProduct = productType?.includes("Mobile App") || productType?.includes("Desktop Application");
  const hasCustomBilling = billingPlatform === "Custom Billing";
  
  if (hasDevelopers && (hasMobileProduct || hasCustomBilling)) {
    recommendations.push({
      name: "REST API",
      icon: "🔌",
      reason: "Flexible integration for custom workflows and advanced use cases.",
      whatItDetects: "Custom events and triggers",
      setupTime: "15 minutes",
      coverage: "100%",
    });
  }

  // Stripe - recommended if they use Stripe billing
  if (billingPlatform === "Stripe") {
    recommendations.push({
      name: "Stripe",
      icon: "💳",
      reason: "Automatically detect completed subscription cancellations via Stripe webhooks.",
      whatItDetects: "Subscription cancellations and downgrades",
      setupTime: "10 minutes",
      coverage: "100%",
    });
  }

  // Webhooks - recommended for other billing platforms (Paddle, Lemon Squeezy, Chargebee, Recurly, etc.)
  const hasOtherBilling = ["Paddle", "Lemon Squeezy", "Chargebee", "Recurly", "Other"].includes(billingPlatform);
  if (hasSubscriptions === "Yes" && hasOtherBilling && hasDevelopers) {
    recommendations.push({
      name: "Webhooks",
      icon: "🔔",
      reason: "Receive real-time notifications when customers cancel or downgrade.",
      whatItDetects: "Real-time cancellation events",
      setupTime: "8 minutes",
      coverage: "100%",
    });
  }

  // If no recommendations, provide a default
  if (recommendations.length === 0) {
    if (hasDevelopers) {
      recommendations.push({
        name: "REST API",
        icon: "🔌",
        reason: "Flexible integration for custom workflows and advanced use cases.",
        whatItDetects: "Custom events and triggers",
        setupTime: "15 minutes",
        coverage: "100%",
      });
    } else {
      recommendations.push({
        name: "JavaScript Widget",
        icon: "⚡",
        reason: "Simple integration for detecting customer actions on your website.",
        whatItDetects: "User interactions with cancellation-related UI elements",
        setupTime: "5 minutes",
        coverage: "95%",
      });
    }
  }

  return recommendations;
}

function RecommendationCard({ recommendation, index }: { recommendation: any; index: number }) {
  const getIcon = (name: string) => {
    switch (name) {
      case "JavaScript Widget": return <Zap className="h-6 w-6" />;
      case "REST API": return <Code className="h-6 w-6" />;
      case "Stripe": return <CreditCard className="h-6 w-6" />;
      case "Webhooks": return <Webhook className="h-6 w-6" />;
      default: return <Globe className="h-6 w-6" />;
    }
  };

  return (
    <div className="p-6 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
          {getIcon(recommendation.name)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-slate-900">{recommendation.name}</h3>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
              <Star className="h-3 w-3" />
              Recommended
            </div>
          </div>
          <p className="text-slate-600 mb-4">{recommendation.reason}</p>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-200">
              <Clock className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-slate-500">Setup Time</p>
                <p className="text-sm font-semibold text-slate-900">{recommendation.setupTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-slate-500">Coverage</p>
                <p className="text-sm font-semibold text-slate-900">{recommendation.coverage}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

