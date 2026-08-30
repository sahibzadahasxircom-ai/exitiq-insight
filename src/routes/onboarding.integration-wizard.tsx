import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, Globe, Smartphone, Monitor, Building2, CreditCard, Clock, Users, Code } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/onboarding/integration-wizard")({
  head: () => ({
    meta: [
      { title: "Integration Setup — leaveesy" },
      { name: "description", content: "Configure your leaveesy integration." },
    ],
  }),
  component: IntegrationWizard,
});

function IntegrationWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({
    productType: "",
    triggerActions: [] as string[],
    hasSubscriptions: "",
    billingPlatform: "",
    timing: "",
    technicalLevel: "",
  });

  const totalSteps = 6;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save answers and navigate to recommendations
      localStorage.setItem('onboardingAnswers', JSON.stringify(answers));
      navigate({ to: "/onboarding/recommendations", replace: true });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleAction = (action: string) => {
    setAnswers(prev => ({
      ...prev,
      triggerActions: prev.triggerActions.includes(action)
        ? prev.triggerActions.filter(a => a !== action)
        : [...prev.triggerActions, action]
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-[700px]">
        <div className="bg-white rounded-3xl shadow-xl p-12">
          <div className="mb-8">
            <div className="mb-2 text-sm font-medium text-slate-500">
              Step {currentStep + 2} of 6
            </div>
            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
                {currentStep + 2}
              </div>
              <div className="flex-1 h-1 bg-slate-200 rounded-full">
                <div className={`h-full rounded-full bg-blue-600 transition-all`} style={{ width: `${((currentStep + 2) / 6) * 100}%` }} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              {getStepTitle(currentStep)}
            </h1>
            <p className="text-slate-600">
              {getStepDescription(currentStep)}
            </p>
          </div>

          <div className="mb-8">
            {currentStep === 1 && (
              <Question1 value={answers.productType} onChange={(v) => setAnswers(prev => ({ ...prev, productType: v }))} />
            )}
            {currentStep === 2 && (
              <Question2 value={answers.triggerActions} onChange={toggleAction} />
            )}
            {currentStep === 3 && (
              <Question3 value={answers.hasSubscriptions} onChange={(v) => setAnswers(prev => ({ ...prev, hasSubscriptions: v }))} />
            )}
            {currentStep === 4 && answers.hasSubscriptions === "Yes" && (
              <Question4 value={answers.billingPlatform} onChange={(v) => setAnswers(prev => ({ ...prev, billingPlatform: v }))} />
            )}
            {currentStep === 4 && answers.hasSubscriptions !== "Yes" && (
              <div className="text-center py-8">
                <p className="text-slate-600">Skipping billing platform question since you don't have subscriptions.</p>
              </div>
            )}
            {currentStep === 5 && (
              <Question5 value={answers.timing} onChange={(v) => setAnswers(prev => ({ ...prev, timing: v }))} />
            )}
            {currentStep === 6 && (
              <Question6 value={answers.technicalLevel} onChange={(v) => setAnswers(prev => ({ ...prev, technicalLevel: v }))} />
            )}
          </div>

          <div className="flex items-center justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="gap-2 h-12 px-6 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              disabled={!isStepValid(currentStep, answers)}
              className="gap-2 h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              {currentStep === totalSteps ? "Get Recommendations" : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function isStepValid(step: number, answers: any): boolean {
  switch (step) {
    case 1: return !!answers.productType;
    case 2: return answers.triggerActions.length > 0;
    case 3: return !!answers.hasSubscriptions;
    case 4: return answers.hasSubscriptions !== "Yes" || !!answers.billingPlatform;
    case 5: return !!answers.timing;
    case 6: return !!answers.technicalLevel;
    default: return false;
  }
}

function getStepTitle(step: number): string {
  switch (step) {
    case 1: return "Product Type";
    case 2: return "Trigger Actions";
    case 3: return "Subscriptions";
    case 4: return "Billing Platform";
    case 5: return "Timing";
    case 6: return "Technical Level";
    default: return "";
  }
}

function getStepDescription(step: number): string {
  switch (step) {
    case 1: return "What type of product do you have?";
    case 2: return "Which customer actions should trigger leaveesy?";
    case 3: return "Does your product have paid subscriptions?";
    case 4: return "Which billing platform do you use?";
    case 5: return "When should leaveesy appear?";
    case 6: return "How technical is your team?";
    default: return "";
  }
}

function ProgressIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-all ${
            i < currentStep ? 'bg-blue-600' : 'bg-slate-200'
          }`}
        />
      ))}
    </div>
  );
}

function Question1({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const options = [
    { value: "SaaS Website", icon: <Globe className="h-6 w-6" />, description: "Web-based application" },
    { value: "Mobile App", icon: <Smartphone className="h-6 w-6" />, description: "iOS or Android app" },
    { value: "Desktop Application", icon: <Monitor className="h-6 w-6" />, description: "Mac, Windows, or Linux" },
    { value: "Website + Mobile App", icon: <Globe className="h-6 w-6" />, description: "Both web and mobile" },
    { value: "Internal Software", icon: <Building2 className="h-6 w-6" />, description: "Internal tools" },
    { value: "Other", icon: <Code className="h-6 w-6" />, description: "Something else" },
  ];

  return (
    <div className="grid gap-3">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
            value === option.value
              ? 'border-blue-500 bg-blue-50 text-blue-900'
              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
            value === option.value ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
          }`}>
            {option.icon}
          </div>
          <div className="flex-1">
            <span className="font-semibold block">{option.value}</span>
            <span className="text-sm text-slate-500">{option.description}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

function Question2({ value, onChange }: { value: string[]; onChange: (v: string) => void }) {
  const options = [
    { value: "Subscription Cancellation", icon: <CreditCard className="h-5 w-5" /> },
    { value: "Sign Out", icon: <Users className="h-5 w-5" /> },
    { value: "Delete Account", icon: <Users className="h-5 w-5" /> },
    { value: "Downgrade Plan", icon: <CreditCard className="h-5 w-5" /> },
    { value: "Leave Workspace", icon: <Building2 className="h-5 w-5" /> },
    { value: "Trial Expired", icon: <Clock className="h-5 w-5" /> },
    { value: "Other", icon: <Code className="h-5 w-5" /> },
  ];

  return (
    <div className="grid gap-3">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
            value.includes(option.value)
              ? 'border-blue-500 bg-blue-50 text-blue-900'
              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            value.includes(option.value) ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
          }`}>
            {option.icon}
          </div>
          <span className="font-semibold flex-1">{option.value}</span>
          <Checkbox checked={value.includes(option.value)} disabled className="pointer-events-none" />
        </button>
      ))}
    </div>
  );
}

function Question3({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const options = [
    { value: "Yes", icon: <CreditCard className="h-6 w-6" />, description: "Has paid subscriptions" },
    { value: "No", icon: <Code className="h-6 w-6" />, description: "Free or one-time purchase" },
  ];

  return (
    <div className="grid gap-3">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
            value === option.value
              ? 'border-blue-500 bg-blue-50 text-blue-900'
              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
            value === option.value ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
          }`}>
            {option.icon}
          </div>
          <div className="flex-1">
            <span className="font-semibold block">{option.value}</span>
            <span className="text-sm text-slate-500">{option.description}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

function Question4({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const options = [
    { value: "Stripe", icon: <CreditCard className="h-6 w-6" />, description: "Popular payment platform" },
    { value: "Paddle", icon: <CreditCard className="h-6 w-6" />, description: "Merchant of record" },
    { value: "Lemon Squeezy", icon: <CreditCard className="h-6 w-6" />, description: "SaaS platform" },
    { value: "Chargebee", icon: <CreditCard className="h-6 w-6" />, description: "Subscription management" },
    { value: "Recurly", icon: <CreditCard className="h-6 w-6" />, description: "Recurring billing" },
    { value: "Custom Billing", icon: <Code className="h-6 w-6" />, description: "Custom implementation" },
    { value: "Other", icon: <Code className="h-6 w-6" />, description: "Different platform" },
  ];

  return (
    <div className="grid gap-3">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
            value === option.value
              ? 'border-blue-500 bg-blue-50 text-blue-900'
              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
            value === option.value ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
          }`}>
            {option.icon}
          </div>
          <div className="flex-1">
            <span className="font-semibold block">{option.value}</span>
            <span className="text-sm text-slate-500">{option.description}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

function Question5({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const options = [
    { value: "before", icon: <Clock className="h-6 w-6" />, label: "Before cancellation", description: "Show exit interview when user initiates cancellation" },
    { value: "after", icon: <Clock className="h-6 w-6" />, label: "After cancellation", description: "Send exit interview email after cancellation is complete" },
    { value: "both", icon: <Clock className="h-6 w-6" />, label: "Both (Recommended)", description: "Show interview before and follow up after for maximum insights" },
  ];

  return (
    <div className="grid gap-3">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
            value === option.value
              ? 'border-blue-500 bg-blue-50 text-blue-900'
              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
            value === option.value ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
          }`}>
            {option.icon}
          </div>
          <div className="flex-1">
            <span className="font-semibold block">{option.label}</span>
            <span className="text-sm text-slate-500">{option.description}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

function Question6({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const options = [
    { value: "We have developers", icon: <Users className="h-6 w-6" />, description: "Can implement custom integrations" },
    { value: "We don't have developers", icon: <Code className="h-6 w-6" />, description: "Need no-code solutions" },
    { value: "Not sure", icon: <Code className="h-6 w-6" />, description: "We'll find the best fit" },
  ];

  return (
    <div className="grid gap-3">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
            value === option.value
              ? 'border-blue-500 bg-blue-50 text-blue-900'
              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
            value === option.value ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
          }`}>
            {option.icon}
          </div>
          <div className="flex-1">
            <span className="font-semibold block">{option.value}</span>
            <span className="text-sm text-slate-500">{option.description}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

