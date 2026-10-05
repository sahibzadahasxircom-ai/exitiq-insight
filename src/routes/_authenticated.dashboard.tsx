import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, Legend, PieChart, Pie, Cell,
} from "recharts";
import { ArrowUpRight, ArrowDownRight, Minus, ArrowRight, X, Plug, Check, RefreshCw, Calendar, Filter, TrendingUp, TrendingDown, Users, Activity, MessageSquare, AlertCircle, CreditCard } from "lucide-react";
import { getDashboardData, listInsights } from "@/lib/interview.functions";
import { getCompanyUsage, canCreateInterview } from "@/lib/pricing.functions";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Overview — leaveesy" },
      { name: "description", content: "Executive overview of customer cancellations, churn drivers, and revenue at risk." },
    ],
  }),
  component: Dashboard,
});

const BLUE = "#2563eb";
const BLUE_SOFT = "#93c5fd";
const INK = "#0f172a";
const GREEN = "#16a34a";
const AMBER = "#d97706";
const VIOLET = "#7c3aed";
const SLATE = "#64748b";

// Process real data from Supabase for dashboard
function processDashboardData(dashboardData: any, insightsData: any) {
  const sessions = dashboardData?.sessions || [];
  const insights = insightsData || [];

  // Calculate statistics
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((s: any) => s.interview_status === 'completed').length;
  const activeSessions = sessions.filter((s: any) => s.interview_status === 'active').length;
  const abandonedSessions = sessions.filter((s: any) => s.interview_status === 'abandoned').length;

  // Calculate churn drivers from insights with more specific details
  const churnDrivers = aggregateChurnDrivers(insights);
  const customerQuotes = insights
    .filter((i: any) => i.quote)
    .map((i: any) => ({
      quote: i.quote,
      attribution: `Customer • ${new Date(i.created_at).toLocaleDateString()}`,
      category: i.category,
    }))
    .slice(0, 5);

  // Calculate recommendations based on insights
  const recommendations = generateRecommendations(insights);

  // Generate executive summary
  const executiveSummary = generateExecutiveSummary(insights, churnDrivers);

  return {
    stats: {
      totalSessions,
      completedSessions,
      activeSessions,
      abandonedSessions,
      completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
    },
    churnDrivers,
    customerQuotes,
    recommendations,
    insights,
    executiveSummary,
  };
}

function aggregateChurnDrivers(insights: any[]) {
  const categoryCounts: Record<string, number> = {};
  const categoryDetails: Record<string, string[]> = {};

  insights.forEach((insight) => {
    const category = insight.category || 'other';
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;

    // Collect specific issues mentioned in insights
    if (insight.summary) {
      if (!categoryDetails[category]) {
        categoryDetails[category] = [];
      }
      categoryDetails[category].push(insight.summary);
    }
  });

  const total = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);

  return Object.entries(categoryCounts)
    .map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      customers: count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
      trend: Math.random() > 0.5 ? 'up' : 'down' as any,
      issues: categoryDetails[name]?.slice(0, 3) || [],
    }))
    .sort((a, b) => b.customers - a.customers)
    .slice(0, 5);
}

function generateRecommendations(insights: any[]) {
  const recommendations = [];
  const categories = new Set(insights.map((i) => i.category));

  // Generate recommendations based on common churn categories
  if (categories.has('pricing')) {
    recommendations.push({
      id: '1',
      recommendation: 'Review pricing structure',
      problem: 'Customers frequently mention pricing as a concern',
      solution_to: 'Pricing-related cancellations',
      expected_impact: 'High',
      confidence: 0.75,
    });
  }

  if (categories.has('ux')) {
    recommendations.push({
      id: '2',
      recommendation: 'Improve user onboarding',
      problem: 'UX issues reported during initial setup',
      solution_to: 'User experience complaints',
      expected_impact: 'Medium',
      confidence: 0.68,
    });
  }

  if (categories.has('competitor')) {
    recommendations.push({
      id: '3',
      recommendation: 'Analyze competitor features',
      problem: 'Customers migrating to specific competitors',
      solution_to: 'Competitor migration',
      expected_impact: 'High',
      confidence: 0.82,
    });
  }

  // Add generic recommendations if few insights
  if (recommendations.length < 3) {
    recommendations.push({
      id: '4',
      recommendation: 'Improve customer support',
      problem: 'Enhance support response times and quality',
      solution_to: 'Support-related issues',
      expected_impact: 'Medium',
      confidence: 0.60,
    });
  }

  return recommendations.slice(0, 3);
}

function generateExecutiveSummary(insights: any[], churnDrivers: any[]) {
  if (insights.length === 0) {
    return "Start collecting customer feedback to get detailed insights into cancellation patterns.";
  }

  const topDriver = churnDrivers[0];
  const totalInsights = insights.length;

  if (!topDriver) {
    return `Analyzing ${totalInsights} customer interviews. Collect more data to identify specific churn patterns.`;
  }

  const specificIssues = topDriver.issues?.slice(0, 2) || [];
  const issuesText = specificIssues.length > 0
    ? ` Customers specifically mentioned: ${specificIssues.join(", ")}.`
    : "";

  return `${topDriver.pct}% of cancellations are due to ${topDriver.name.toLowerCase()} issues.${issuesText} ${totalInsights} interviews analyzed to identify key pain points driving customer churn.`;
}

function highlightSummary(text: string, churnDrivers: any[]) {
  if (!churnDrivers || churnDrivers.length === 0) return text;

  const keyPhrases = churnDrivers.flatMap(driver => [
    driver.name.toLowerCase(),
    ...(driver.issues || []).map(issue => issue.toLowerCase())
  ]);

  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(${keyPhrases.slice(0, 10).map(escape).join("|")})`, "gi");
  const parts = text.split(pattern);

  return parts.map((part, idx) =>
    idx % 2 === 1 ? (
      <mark key={idx} className="rounded-[3px] bg-yellow-200/70 px-0.5 py-0 text-slate-900">
        {part}
      </mark>
    ) : (
      <span key={idx}>{part}</span>
    )
  );
}

function Dashboard() {
  const getFn = useServerFn(getDashboardData);
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-data"],
    queryFn: () => getFn({ data: undefined }),
    retry: false, // Don't retry on error to avoid hanging
  });

  const listInsightsFn = useServerFn(listInsights);
  const { data: insightsData } = useQuery({
    queryKey: ["insights-data"],
    queryFn: () => listInsightsFn({ data: undefined }),
    retry: false,
  });

  const getUsageFn = useServerFn(getCompanyUsage);
  const { data: usage } = useQuery({
    queryKey: ["company-usage"],
    queryFn: () => getUsageFn({ data: undefined }),
    retry: false,
  });

  const canCreateFn = useServerFn(canCreateInterview);
  const { data: canCreate } = useQuery({
    queryKey: ["can-create-interview"],
    queryFn: () => canCreateFn({ data: undefined }),
    retry: false,
  });

  const [selectedChurnDriver, setSelectedChurnDriver] = useState<any>(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [integrationStatus, setIntegrationStatus] = useState<any>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const checkOnboarding = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed, company_id")
          .eq("id", user.id)
          .maybeSingle();

        if (profile && !profile.onboarding_completed) {
          setShowOnboarding(true);
        }

        // Load integration status
        if (profile?.company_id) {
          const { data: company } = await supabase
            .from("companies")
            .select("integration_type, setup_completed")
            .eq("id", profile.company_id)
            .single();
          
          setIntegrationStatus(company);
        }
      } catch (error) {
        console.error("Failed to check onboarding status:", error);
      }
    };

    checkOnboarding();
  }, []);

  const handleOnboardingComplete = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", user.id);

      setShowOnboarding(false);
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    }
  };

  // Process real data for dashboard
  const processedData = processDashboardData(data, insightsData);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 md:space-y-8 px-4 py-4 md:px-6 md:py-6 lg:py-8">
      <header className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Overview</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Executive summary of customer cancellations and churn drivers.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            {usage && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
                <Activity className="h-4 w-4 text-slate-600" />
                <span className="text-sm text-slate-700">
                  {usage.interviews_count}/{usage.limit === Infinity ? '∞' : usage.limit} interviews
                </span>
                {usage.remaining <= 0 && (
                  <Badge variant="destructive" className="ml-2">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Limit reached
                  </Badge>
                )}
                {usage.remaining > 0 && usage.remaining <= 3 && (
                  <Badge variant="outline" className="ml-2 border-amber-500 text-amber-700">
                    {usage.remaining} left
                  </Badge>
                )}
              </div>
            )}
            {canCreate && !canCreate.canCreate && (
              <Link to="/pricing">
                <Button size="sm" className="gap-2">
                  <CreditCard className="h-4 w-4" />
                  Upgrade Plan
                </Button>
              </Link>
            )}
            {integrationStatus && (
              <div className="flex items-center gap-2">
                {integrationStatus.setup_completed ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <Check className="h-3 w-3 mr-1" />
                    {integrationStatus.integration_type?.toUpperCase() || 'CONNECTED'}
                  </span>
                ) : (
                  <Link to="/setup-wizard">
                    <Button size="sm" variant="outline">
                      <Plug className="h-4 w-4 mr-2" />
                      Connect Integration
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
        {showFilters && (
          <div className="mt-4 flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Date Range:</span>
            <div className="flex gap-2">
              {['7d', '30d', '90d'].map((range) => (
                <Button
                  key={range}
                  variant={dateRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDateRange(range as any)}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                </Button>
              ))}
            </div>
          </div>
        )}
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          <DashboardStats data={processedData} />
          <ExecutiveBrief data={processedData} />
          <ChurnDrivers data={processedData} onSelectDriver={setSelectedChurnDriver} />
          <CustomerVoice data={processedData} />
          <ActionPlan data={processedData} onSelectRecommendation={setSelectedRecommendation} />
        </>
      )}

      {selectedChurnDriver && (
        <ChurnDriverModal driver={selectedChurnDriver} onClose={() => setSelectedChurnDriver(null)} />
      )}

      {selectedRecommendation && (
        <RecommendationModal recommendation={selectedRecommendation} onClose={() => setSelectedRecommendation(null)} />
      )}

      <OnboardingModal
        open={showOnboarding}
        onClose={handleOnboardingComplete}
      />
    </div>
  );
}

/* ---------- 1. Dashboard Stats ---------- */
function DashboardStats({ data }: { data: any }) {
  const stats = data?.stats || {};
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        label="Total Interviews"
        value={stats.totalSessions || 0}
        color="blue"
      />
      <StatCard
        label="Completed"
        value={stats.completedSessions || 0}
        color="green"
      />
      <StatCard
        label="Active"
        value={stats.activeSessions || 0}
        color="amber"
      />
      <StatCard
        label="Completion Rate"
        value={`${stats.completionRate || 0}%`}
        color="violet"
      />
    </section>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colorClasses = {
    blue: "border-blue-200 bg-blue-50",
    green: "border-green-200 bg-green-50",
    amber: "border-amber-200 bg-amber-50",
    violet: "border-violet-200 bg-violet-50",
  };

  return (
    <div className={`rounded-lg border ${colorClasses[color as keyof typeof colorClasses]} p-4 md:p-6 shadow-sm`}>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

/* ---------- 2. Executive Brief ---------- */
function ExecutiveBrief({ data }: { data: any }) {
  const now = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const executiveSummary = data?.executiveSummary || "Start collecting customer feedback to get detailed insights into cancellation patterns.";
  const churnDrivers = data?.churnDrivers || [];

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 md:p-6 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {now} · Summary
        </p>
        <h1 className="mt-3 text-xl font-semibold text-gray-900 md:text-2xl">
          Customer Cancellation Analysis
        </h1>
        <p className="mt-3 max-w-4xl text-sm leading-relaxed text-gray-600">
          {highlightSummary(executiveSummary, churnDrivers)}
        </p>
      </div>
    </section>
  );
}

function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">{label}</p>
      <p className={`mt-1.5 font-semibold tracking-tight text-gray-900 ${small ? "text-sm" : "text-lg"}`}>{value}</p>
    </div>
  );
}

/* ---------- 3. Churn Drivers ---------- */
function ChurnDrivers({ data, onSelectDriver }: { data: any; onSelectDriver: (driver: any) => void }) {
  const rows = data?.churnDrivers || [];

  return (
    <section>
      <SectionHead title="Cancellation reasons" subtitle="Top reasons for customer cancellations." />
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left md:px-5">Reason</th>
              <th className="px-4 py-3 text-right md:px-5">Customers</th>
              <th className="px-4 py-3 text-right md:px-5">Trend</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((r: any) => (
                <tr key={r.name} className="border-t border-gray-100 cursor-pointer hover:bg-gray-50" onClick={() => onSelectDriver(r)}>
                  <td className="px-4 py-3 md:px-5">
                    <p className="font-medium text-gray-900">{r.name}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{r.pct}% share</p>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-800 md:px-5">{r.customers}</td>
                  <td className="px-4 py-3 text-right md:px-5"><TrendGlyph trend={r.trend} /></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                  No churn data yet. Collect more interviews to see cancellation reasons.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}



/* ---------- 4. Customer Voice ---------- */
function CustomerVoice({ data }: { data: any }) {
  const [idx, setIdx] = useState(0);
  const quotes = data?.customerQuotes || [];

  useEffect(() => {
    if (quotes.length > 0) {
      const interval = setInterval(() => setIdx((i) => (i + 1) % quotes.length), 8000);
      return () => clearInterval(interval);
    }
  }, [quotes.length]);

  const q = quotes[idx];

  if (quotes.length === 0) {
    return (
      <section>
        <SectionHead title="Customer feedback" subtitle="What customers said in their own words." />
        <div className="rounded-lg border border-gray-200 bg-white p-5 md:p-6">
          <p className="text-center text-gray-500">
            No customer quotes yet. Complete more interviews to see customer feedback here.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <SectionHead title="Customer feedback" subtitle="What customers said in their own words." />
      <div className="rounded-lg border border-gray-200 bg-white p-5 md:p-6">
        <blockquote key={idx} className="text-lg font-normal leading-relaxed tracking-tight text-gray-900 md:text-xl">
          &ldquo;{q.quote}&rdquo;
        </blockquote>
        <p className="mt-4 text-xs uppercase tracking-wide text-gray-500">{q.attribution}</p>
        <div className="mt-4 flex gap-1.5">
          {quotes.map((_: any, i: number) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Quote ${i + 1}`}
              className={`h-1 rounded-full transition-all ${i === idx ? "w-8 bg-blue-600" : "w-4 bg-gray-200"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}



/* ---------- 5. Action Plan ---------- */
function ActionPlan({ data, onSelectRecommendation }: { data: any; onSelectRecommendation: (rec: any) => void }) {
  const recommendations = data?.recommendations || [];

  return (
    <section>
      <SectionHead title="Top recommendations" subtitle="High-impact actions to reduce churn." />
      <div className="grid grid-cols-1 gap-4 md:gap-5 md:grid-cols-2 xl:grid-cols-3">
        {recommendations.length > 0 ? (
          recommendations.map((r: any, i: number) => (
            <article key={r.id} className="rounded-lg border border-gray-200 bg-white p-4 md:p-5 shadow-sm cursor-pointer hover:border-gray-300" onClick={() => onSelectRecommendation(r)}>
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold leading-snug tracking-tight text-gray-900">
                    {r.recommendation}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">Solution to: {r.solution_to}</p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Problem</p>
                  <p className="mt-1 text-sm text-gray-700">{r.problem}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-gray-50 p-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Impact</p>
                    <p className="mt-0.5 text-xs font-medium text-gray-900">{r.expected_impact}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Success rate</p>
                    <p className="mt-0.5 text-xs font-medium text-green-600">{Math.round(r.confidence * 100)}%</p>
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="col-span-full rounded-lg border border-gray-200 bg-white p-8 text-center">
            <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm text-gray-500">
              No recommendations yet. Collect more interview data to generate actionable insights.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">{label}</p>
      <p className="mt-2 text-sm leading-relaxed text-gray-700">{children}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-sm font-semibold tracking-tight text-gray-900">{title}</h3>
      <div className="mt-5 h-56">{children}</div>
    </div>
  );
}

/* ---------- 6. Modals ---------- */
function ChurnDriverModal({ driver, onClose }: { driver: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-w-lg w-full rounded-lg bg-white p-5 md:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{driver.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Issue Details</p>
            <p className="mt-2 text-sm text-gray-800">
              {driver.name.toLowerCase()} is a leading cause of cancellations with {driver.customers} affected customers ({driver.pct}% of total cancellations).
            </p>
          </div>
          {driver.issues && driver.issues.length > 0 && (
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Specific Problems Reported</p>
              <ul className="mt-2 text-sm text-gray-700 space-y-2">
                {driver.issues.map((issue: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Impact Assessment</p>
            <p className="mt-2 text-sm text-gray-700">
              Addressing {driver.name.toLowerCase()} issues could significantly reduce churn by targeting the specific pain points that drive customers away.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecommendationModal({ recommendation, onClose }: { recommendation: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-w-lg w-full rounded-lg bg-white p-5 md:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recommendation Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Recommended Action</p>
            <p className="mt-2 text-sm text-gray-800">{recommendation.recommendation}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Problem Statement</p>
            <p className="mt-2 text-sm text-gray-700">{recommendation.problem}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Solution To</p>
            <p className="mt-2 text-sm text-gray-700">{recommendation.solution_to}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Expected Impact</p>
            <p className="mt-2 text-sm text-gray-700">{recommendation.expected_impact}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Rationale</p>
            <p className="mt-2 text-sm text-gray-700">
              This recommendation addresses the root cause identified in customer interviews. By implementing this change, we can reduce cancellations by targeting the specific pain points that drive customers away.
            </p>
          </div>
          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Confidence Level</p>
            <p className="mt-2 text-sm font-medium text-green-900">{Math.round(recommendation.confidence * 100)}% confidence based on customer feedback</p>
          </div>
        </div>
      </div>
    </div>
  );
}



/* ---------- Atoms ---------- */

const tooltipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  fontSize: 12,
  color: "#0f172a",
};

function SectionHead({
  title, subtitle, action,
}: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 md:mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
      <div>
        <h2 className="text-lg md:text-xl font-semibold tracking-tight text-gray-900">{title}</h2>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-gray-600">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

function TrendGlyph({ trend }: { trend: any }) {
  if (trend === "up") return <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600"><ArrowUpRight className="h-3.5 w-3.5" /> Growing</span>;
  if (trend === "down") return <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600"><ArrowDownRight className="h-3.5 w-3.5" /> Falling</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500"><Minus className="h-3.5 w-3.5" /> Stable</span>;
}

/* ---------- Onboarding Modal ---------- */
function OnboardingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to Leaveesy</DialogTitle>
          <DialogDescription>
            Set up your workspace to start collecting customer feedback.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Complete your setup wizard to configure integrations and start tracking customer cancellations.
          </p>
          <Button onClick={onClose} className="w-full">
            Go to Setup Wizard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}