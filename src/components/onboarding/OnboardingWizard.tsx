import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Check, CreditCard, Code, Zap, Webhook, Building2, Globe, Mail, Users, Palette, Layout } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const STEPS = [
  { id: 1, title: "Company Information", description: "Tell us about your business" },
  { id: 2, title: "Quick Setup", description: "Customize your workspace" },
  { id: 3, title: "Ready to Go", description: "Your workspace is ready" },
];

const BRAND_TEMPLATES = [
  { id: "default", name: "Default", colors: ["#2563eb", "#1e40af"] },
  { id: "modern", name: "Modern", colors: ["#7c3aed", "#5b21b6"] },
  { id: "minimal", name: "Minimal", colors: ["#0f172a", "#1e293b"] },
  { id: "warm", name: "Warm", colors: ["#dc2626", "#991b1b"] },
];

interface OnboardingWizardProps {
  companyId: string;
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingWizard({ companyId, onComplete, onSkip }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [companyData, setCompanyData] = useState({
    company_name: "",
    company_website: "",
    company_logo: "",
    industry: "",
    company_size: "",
    primary_contact_email: "",
    brand_color: "#2563eb",
    brand_template: "default",
  });

  useEffect(() => {
    loadCompanyData();
  }, [companyId]);

  const loadCompanyData = async () => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", companyId)
        .maybeSingle();

      if (data && !error) {
        setCompanyData({
          company_name: data.company_name || "",
          company_website: (data as any).company_website || "",
          company_logo: (data as any).company_logo || "",
          industry: (data as any).industry || "",
          company_size: (data as any).company_size || "",
          primary_contact_email: (data as any).primary_contact_email || "",
          brand_color: (data as any).brand_color || "#2563eb",
          brand_template: (data as any).brand_template || "default",
        });
      }
    } catch (error) {
      console.error("Failed to load company data:", error);
    }
  };

  const saveProgress = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("companies")
        .update({
          company_name: companyData.company_name,
          company_website: companyData.company_website,
          company_logo: companyData.company_logo,
          industry: companyData.industry,
          company_size: companyData.company_size,
          primary_contact_email: companyData.primary_contact_email,
          brand_color: companyData.brand_color,
          brand_template: companyData.brand_template,
        } as any)
        .eq("id", companyId);

      if (error) {
        console.error("Failed to save progress:", error);
      }
    } catch (error) {
      console.error("Failed to save progress:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentStep < 3) {
      await saveProgress();
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    await saveProgress();
    onSkip();
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      await saveProgress();

      const { error } = await supabase
        .from("companies")
        .update({ onboarding_completed: true } as any)
        .eq("id", companyId);

      if (error) {
        console.error("Failed to complete onboarding:", error);
      } else {
        onComplete();
      }
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return companyData.company_name.trim().length > 0;
      case 2:
        return true; // Can skip branding
      case 3:
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1CompanyInfo
            data={companyData}
            onChange={setCompanyData}
          />
        );
      case 2:
        return (
          <Step2Branding
            data={companyData}
            onChange={setCompanyData}
          />
        );
      case 3:
        return (
          <Step3Success
            companyData={companyData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <Card className="w-full max-w-[500px] max-h-[85vh] overflow-y-auto shadow-2xl animate-scale-in">
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{STEPS[currentStep - 1].title}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{STEPS[currentStep - 1].description}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              className="text-slate-400 hover:text-slate-600 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-600">
                Step {currentStep} of {STEPS.length}
              </span>
              <span className="text-xs text-slate-400">
                {Math.round((currentStep / STEPS.length) * 100)}%
              </span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-6 min-h-[200px]">
            {renderStep()}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              disabled={currentStep === 1 || loading}
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1.5" />
              Back
            </Button>

            {currentStep < 5 ? (
              <Button
                size="sm"
                onClick={handleNext}
                disabled={!canProceed() || loading}
              >
                {loading ? "Saving..." : "Next"}
                <ChevronRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleComplete}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? "Completing..." : "Go to Dashboard"}
                <Check className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            )}
          </div>

          {/* Skip Button */}
          {currentStep < 3 && (
            <div className="mt-3 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                disabled={loading}
                className="text-slate-400 hover:text-slate-600 text-xs h-8"
              >
                Skip for now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Step 1: Company Information
function Step1CompanyInfo({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="company_name" className="text-xs">Company Name *</Label>
        <Input
          id="company_name"
          value={data.company_name}
          onChange={(e) => onChange({ ...data, company_name: e.target.value })}
          placeholder="Your Company Inc."
          className="mt-1.5 h-9 text-sm"
        />
      </div>

      <div>
        <Label htmlFor="company_website" className="text-xs">Company Website</Label>
        <div className="relative mt-1.5">
          <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            id="company_website"
            value={data.company_website}
            onChange={(e) => onChange({ ...data, company_website: e.target.value })}
            placeholder="https://yourcompany.com"
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="industry" className="text-xs">Industry</Label>
        <Input
          id="industry"
          value={data.industry}
          onChange={(e) => onChange({ ...data, industry: e.target.value })}
          placeholder="SaaS, E-commerce, etc."
          className="mt-1.5 h-9 text-sm"
        />
      </div>

      <div>
        <Label htmlFor="company_size" className="text-xs">Company Size</Label>
        <select
          id="company_size"
          value={data.company_size}
          onChange={(e) => onChange({ ...data, company_size: e.target.value })}
          className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm h-9"
        >
          <option value="">Select size</option>
          <option value="1-10">1-10 employees</option>
          <option value="11-50">11-50 employees</option>
          <option value="51-200">51-200 employees</option>
          <option value="201-500">201-500 employees</option>
          <option value="500+">500+ employees</option>
        </select>
      </div>

      <div>
        <Label htmlFor="primary_contact_email" className="text-xs">Primary Contact Email</Label>
        <div className="relative mt-1.5">
          <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            id="primary_contact_email"
            type="email"
            value={data.primary_contact_email}
            onChange={(e) => onChange({ ...data, primary_contact_email: e.target.value })}
            placeholder="contact@yourcompany.com"
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>
    </div>
  );
}

// Step 2: Quick Setup (Branding)
function Step2Branding({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 mb-4">
        Choose a brand color for your workspace. You can customize this later in Settings.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {BRAND_TEMPLATES.map((template) => {
          const isSelected = data.brand_template === template.id;

          return (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all ${
                isSelected ? "border-blue-500 bg-blue-50" : "hover:border-blue-300"
              }`}
              onClick={() => onChange({ ...data, brand_template: template.id, brand_color: template.colors[0] })}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="h-8 w-8 rounded-full"
                    style={{ background: `linear-gradient(135deg, ${template.colors[0]}, ${template.colors[1]})` }}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{template.name}</h3>
                    <div className="flex gap-1 mt-1">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: template.colors[0] }} />
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: template.colors[1] }} />
                    </div>
                  </div>
                  {isSelected && <Check className="h-5 w-5 text-blue-600" />}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-slate-50 rounded-lg p-4">
        <p className="text-sm text-slate-600">
          <strong>Note:</strong> You can fully customize your workspace branding in Workspace → Branding.
        </p>
      </div>
    </div>
  );
}

// Step 3: Success
function Step3Success({ companyData }: { companyData: any }) {
  return (
    <div className="space-y-4 text-center">
      <div className="flex justify-center">
        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
          <Check className="h-8 w-8 text-green-600" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900">You're all set!</h3>
        <p className="text-sm text-slate-600 mt-2">
          Your workspace <strong>{companyData.company_name || "Your Company"}</strong> is ready to use.
        </p>
      </div>

      <div className="bg-slate-50 rounded-lg p-4 text-left">
        <p className="text-sm font-medium text-slate-900 mb-2">Next steps:</p>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>• Connect your integrations from the sidebar</li>
          <li>• Customize your customer experience in Workspace</li>
          <li>• Start collecting exit interviews</li>
        </ul>
      </div>
    </div>
  );
}

