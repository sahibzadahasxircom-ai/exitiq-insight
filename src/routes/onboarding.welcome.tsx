import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Clock, Zap, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/onboarding/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome — leaveesy" },
      { name: "description", content: "Welcome to leaveesy." },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-[700px]">
        <div className="bg-white rounded-3xl shadow-xl p-12">
          <div className="mb-8">
            <div className="mb-2 text-sm font-medium text-slate-500">
              Step 2 of 6
            </div>
            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
                2
              </div>
              <div className="flex-1 h-1 bg-slate-200 rounded-full">
                <div className="h-full w-[33.33%] bg-blue-600 rounded-full" />
              </div>
            </div>
          </div>

          <div className="text-center mb-10">
            <div className="mb-6 flex justify-center">
              <img src="/leaveesy.png" alt="leaveesy" className="h-40 w-auto object-contain" />
            </div>

            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Welcome to leaveesy
            </h1>

            <p className="text-lg text-slate-600 mb-6">
              Your workspace is ready. Let's connect leaveesy to your product.
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
              <Clock className="h-4 w-4" />
              Estimated setup time: 5 minutes
            </div>
          </div>

          <div className="mb-10 space-y-4">
            <FeatureCard
              icon={<Zap className="h-6 w-6 text-blue-600" />}
              title="Detect Customers"
              description="Automatically identify when customers leave"
            />
            <FeatureCard
              icon={<CheckCircle2 className="h-6 w-6 text-blue-600" />}
              title="AI Interviews"
              description="Launch intelligent exit interviews"
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6 text-blue-600" />}
              title="Actionable Insights"
              description="Get churn patterns and recommendations"
            />
          </div>

          <Button
            size="lg"
            onClick={() => navigate({ to: "/onboarding/integration-wizard" })}
            className="w-full gap-2 h-14 text-base rounded-xl bg-blue-600 hover:bg-blue-700"
          >
            Start Integration
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
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

