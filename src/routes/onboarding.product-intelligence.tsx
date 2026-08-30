import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, Globe, FileText, BookOpen } from "lucide-react";

export const Route = createFileRoute("/onboarding/product-intelligence")({
  head: () => ({
    meta: [
      { title: "Product Intelligence — leaveesy" },
      { name: "description", content: "Help leaveesy understand your product." },
    ],
  }),
  component: ProductIntelligence,
});

function ProductIntelligence() {
  const navigate = useNavigate();
  const [website, setWebsite] = useState("");
  const [changelog, setChangelog] = useState("");
  const [blog, setBlog] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate AI learning process
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsLoading(false);
    navigate({ to: "/onboarding/welcome", replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-[700px]">
          <div className="bg-white rounded-3xl shadow-xl p-12">
            <div className="text-center mb-12">
              <div className="mb-6 flex justify-center">
                <img src="/leaveesy.png" alt="leaveesy" className="h-32 w-auto object-contain" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-3">
                Learning Your Product
              </h1>
              <p className="text-slate-600">leaveesy is analyzing your product to provide intelligent insights.</p>
            </div>

            <div className="space-y-3">
              <LoadingItem text="Reading website" delay={0} />
              <LoadingItem text="Understanding product features" delay={500} />
              <LoadingItem text="Reading changelog" delay={1000} />
              <LoadingItem text="Learning company updates" delay={1500} />
            </div>

            <div className="mt-8 text-center">
              <p className="text-green-600 font-semibold text-lg">Product Intelligence Complete</p>
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
              Step 1 of 6
            </div>
            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
                1
              </div>
              <div className="flex-1 h-1 bg-slate-200 rounded-full">
                <div className="h-full w-[16.67%] bg-blue-600 rounded-full" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              Product Intelligence
            </h1>
            <p className="text-slate-600">
              Help leaveesy understand your product to provide intelligent insights during exit interviews.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="website" className="text-base font-semibold flex items-center gap-2">
                <Globe className="h-4 w-4 text-slate-400" />
                Company Website
                <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="website"
                  type="url"
                  placeholder="https://company.com"
                  required
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="h-14 pl-12 text-base rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                />
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500">
                leaveesy will analyze your website to understand your product, features, navigation, and positioning.
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="changelog" className="text-base font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-400" />
                Changelog URL
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  Recommended
                </span>
              </Label>
              <div className="relative">
                <Input
                  id="changelog"
                  type="url"
                  placeholder="https://company.com/changelog"
                  value={changelog}
                  onChange={(e) => setChangelog(e.target.value)}
                  className="h-14 pl-12 text-base rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                />
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500">
                Allows leaveesy to understand recent releases, new features, and product improvements.
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="blog" className="text-base font-semibold flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-slate-400" />
                Blog URL
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  Recommended
                </span>
              </Label>
              <div className="relative">
                <Input
                  id="blog"
                  type="url"
                  placeholder="https://company.com/blog"
                  value={blog}
                  onChange={(e) => setBlog(e.target.value)}
                  className="h-14 pl-12 text-base rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                />
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500">
                Allows leaveesy to learn product announcements, company direction, and customer communication.
              </p>
            </div>

            <div className="flex items-center justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: "/auth" })}
                className="gap-2 h-12 px-6 rounded-xl"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button type="submit" className="gap-2 h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700">
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function LoadingItem({ text, delay }: { text: string; delay: number }) {
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), delay);
    setTimeout(() => setChecked(true), delay + 800);
  }, [delay]);

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg border border-slate-200 bg-white transition-all ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`flex h-6 w-6 items-center justify-center rounded-full ${checked ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
        {checked ? (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <div className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
        )}
      </div>
      <span className={`text-sm font-medium ${checked ? 'text-slate-900' : 'text-slate-500'}`}>{text}</span>
    </div>
  );
}

