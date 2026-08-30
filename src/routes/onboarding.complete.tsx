import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Users, MessageSquare, TrendingUp, Lightbulb, LayoutDashboard, Sparkles, Zap, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/onboarding/complete")({
  head: () => ({
    meta: [
      { title: "Setup Complete — leaveesy" },
      { name: "description", content: "Your leaveesy setup is complete." },
    ],
  }),
  component: Complete,
});

function Complete() {
  const navigate = useNavigate();
  const [integrations, setIntegrations] = useState<any[]>([]);

  useEffect(() => {
    const recommended = JSON.parse(localStorage.getItem('recommendedIntegrations') || '[]');
    setIntegrations(recommended);
  }, []);

  const handleGoToDashboard = () => {
    // Clear onboarding data
    localStorage.removeItem('onboardingAnswers');
    localStorage.removeItem('recommendedIntegrations');
    localStorage.removeItem('currentIntegrationIndex');
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-[700px]">
        <div className="bg-white rounded-3xl shadow-xl p-12">
          <div className="text-center mb-10">
            <div className="mb-6 flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
                <CheckCircle2 className="h-12 w-12" />
              </div>
            </div>

            <h1 className="text-4xl font-bold text-slate-900 mb-3">
              leaveesy Is Ready
            </h1>

            <p className="text-lg text-slate-600 mb-6">
              Everything has been connected successfully.
            </p>

            {integrations.length > 0 && (
              <div className="mb-8 p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="text-green-900 font-medium flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  {integrations.length} integration{integrations.length > 1 ? 's' : ''} connected
                </p>
              </div>
            )}
          </div>

          <div className="mb-10 space-y-4">
            <CapabilityCard
              icon={<Zap className="h-6 w-6 text-blue-600" />}
              title="Detect Customers"
              description="Automatically identify when customers leave"
            />
            <CapabilityCard
              icon={<MessageSquare className="h-6 w-6 text-blue-600" />}
              title="Launch AI Interviews"
              description="Conduct intelligent exit interviews"
            />
            <CapabilityCard
              icon={<BarChart3 className="h-6 w-6 text-blue-600" />}
              title="Analyze Feedback"
              description="Extract actionable insights from responses"
            />
            <CapabilityCard
              icon={<Sparkles className="h-6 w-6 text-blue-600" />}
              title="Discover Patterns"
              description="Identify churn trends and root causes"
            />
            <CapabilityCard
              icon={<Lightbulb className="h-6 w-6 text-blue-600" />}
              title="Generate Recommendations"
              description="Get data-driven improvement suggestions"
            />
            <CapabilityCard
              icon={<LayoutDashboard className="h-6 w-6 text-blue-600" />}
              title="Power Dashboard"
              description="Visualize your churn intelligence"
            />
          </div>

          <Button
            size="lg"
            onClick={handleGoToDashboard}
            className="w-full gap-2 h-14 text-base rounded-xl bg-blue-600 hover:bg-blue-700"
          >
            Go to Dashboard
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function CapabilityCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
    </div>
  );
}

