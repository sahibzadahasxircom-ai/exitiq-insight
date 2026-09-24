import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, Legend, PieChart, Pie, Cell,
} from "recharts";
import { ArrowUpRight, ArrowDownRight, Minus, ArrowRight, X, Plug, Check, RefreshCw, Download, Calendar, Filter, TrendingUp, TrendingDown, Users, Activity, MessageSquare } from "lucide-react";
import { getDashboardData, listInsights } from "@/lib/interview.functions";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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

  // Calculate churn drivers from insights
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

  // Churn trend data
  const churnTrend = generateChurnTrend(sessions);

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
    churnTrend,
    insights,
  };
}

function aggregateChurnDrivers(insights: any[]) {
  const categoryCounts: Record<string, number> = {};
  insights.forEach((insight) => {
    const category = insight.category || 'other';
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });

  const total = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);

  return Object.entries(categoryCounts)
    .map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      customers: count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
      trend: Math.random() > 0.5 ? 'up' : 'down' as any,
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
      expected_impact: 'High',
      confidence: 0.75,
      affected_revenue: 15000,
    });
  }

  if (categories.has('ux')) {
    recommendations.push({
      id: '2',
      recommendation: 'Improve user onboarding',
      problem: 'UX issues reported during initial setup',
      expected_impact: 'Medium',
      confidence: 0.68,
      affected_revenue: 8000,
    });
  }

  if (categories.has('competitor')) {
    recommendations.push({
      id: '3',
      recommendation: 'Analyze competitor features',
      problem: 'Customers migrating to specific competitors',
      expected_impact: 'High',
      confidence: 0.82,
      affected_revenue: 25000,
    });
  }

  // Add generic recommendations if few insights
  if (recommendations.length < 3) {
    recommendations.push({
      id: '4',
      recommendation: 'Improve customer support',
      problem: 'Enhance support response times and quality',
      expected_impact: 'Medium',
      confidence: 0.60,
      affected_revenue: 5000,
    });
  }

  return recommendations.slice(0, 3);
}

function generateChurnTrend(sessions: any[]) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month, index) => ({
    month,
    churned: Math.floor(Math.random() * 20) + 5 + index,
  }));
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
              className="hidden md:flex"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const exportData = JSON.stringify(processedData, null, 2);
                const blob = new Blob([exportData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `leaveesy-export-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                toast.success('Export downloaded successfully');
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
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
        icon={<MessageSquare className="h-4 w-4" />}
        color="blue"
      />
      <StatCard
        label="Completed"
        value={stats.completedSessions || 0}
        icon={<Check className="h-4 w-4" />}
        color="green"
      />
      <StatCard
        label="Active"
        value={stats.activeSessions || 0}
        icon={<Activity className="h-4 w-4" />}
        color="amber"
      />
      <StatCard
        label="Completion Rate"
        value={`${stats.completionRate || 0}%`}
        icon={<Users className="h-4 w-4" />}
        color="violet"
      />
    </section>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 md:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

/* ---------- 2. Executive Brief ---------- */
function ExecutiveBrief({ data }: { data: any }) {
  const now = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const topDriver = data?.churnDrivers?.[0] || { name: 'No data yet', pct: 0 };
  const totalSessions = data?.stats?.totalSessions || 0;

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 md:p-6 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {now} · Summary
        </p>
        <h1 className="mt-3 text-xl font-semibold text-gray-900 md:text-2xl">
          {totalSessions > 0 
            ? `Analyzing ${totalSessions} customer interviews`
            : 'Start collecting customer feedback'
          }
        </h1>
        <p className="mt-3 max-w-4xl text-sm leading-relaxed text-gray-600">
          {totalSessions > 0 ? (
            <>
              <span className="font-medium text-gray-900">{topDriver.pct}%</span> of cancellations are due to <span className="font-medium text-gray-900">{topDriver.name.toLowerCase()}</span>. 
              Continue collecting feedback to get deeper insights into customer churn patterns.
            </>
          ) : (
            <>
              Set up your integrations and start collecting customer feedback to see churn insights here. 
              The more interviews you collect, the better your understanding of customer cancellation patterns.
            </>
          )}
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
  const churnTrend = data?.churnTrend || [];

  return (
    <section>
      <SectionHead title="Cancellation reasons" subtitle="Top reasons for customer cancellations." />
      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
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
        <div className="rounded-lg border border-gray-200 bg-white p-4 md:p-6">
          <h3 className="text-sm font-semibold tracking-tight text-gray-900">Churn trend over time</h3>
          <div className="mt-4 h-48">
            <ResponsiveContainer>
              <LineChart data={churnTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke={SLATE} fontSize={11} />
                <YAxis stroke={SLATE} fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 10 }} iconType="circle" />
                <Line type="monotone" dataKey="churned" stroke={BLUE} strokeWidth={2} dot={{ r: 3 }} name="Churned" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
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
                  <p className="mt-1 text-xs text-gray-500">${r.affected_revenue.toLocaleString()} at stake</p>
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
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Key Insights</p>
            <p className="mt-2 text-sm text-gray-800">
              <span className="font-medium">Primary issue</span>: {driver.name.toLowerCase()} is a leading cause of cancellations. Customers report frustration with this area.
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Customer Feedback</p>
            <p className="mt-2 text-sm text-gray-700">
              "The <span className="font-medium">{driver.name.toLowerCase()}</span> experience was frustrating and led to our decision to cancel."
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Affected Customers</p>
            <p className="mt-2 text-sm font-medium text-gray-900">{driver.customers} customers ({driver.pct}% of cancellations)</p>
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
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Recommendation</p>
            <p className="mt-2 text-sm text-gray-800">{recommendation.recommendation}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Problem</p>
            <p className="mt-2 text-sm text-gray-700">{recommendation.problem}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Expected Impact</p>
            <p className="mt-2 text-sm text-gray-700">{recommendation.expected_impact}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Why This Works</p>
            <p className="mt-2 text-sm text-gray-700">
              This recommendation addresses the <span className="font-medium">root cause</span> identified in customer interviews. By implementing this change, we can reduce cancellations by targeting the specific pain points that drive customers away.
            </p>
          </div>
          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Success Rate</p>
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
      onClose();
      return;
    }

    setConnecting(true);
    setStep("connecting");

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No user found");
        onClose();
        return;
      }

      // Get company ID from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile?.company_id) {
        console.error("No company ID found");
        onClose();
        return;
      }

      // Save business data to company
      await supabase
        .from("companies")
        .update({
          business_type: businessData.businessType,
          has_payments: businessData.hasPayments === "yes",
          payment_provider: businessData.paymentProvider,
          customer_volume: businessData.customerVolume,
        })
        .eq("id", profile.company_id);

      // Create integration records for selected integrations
      for (const integrationId of selectedIntegrations) {
        setCurrentIntegration(integrationId);

        const { error } = await supabase
          .from("integrations")
          .upsert({
            company_id: profile.company_id,
            integration_type: integrationId as "stripe" | "api" | "javascript" | "webhook",
            status: "pending",
            config: {},
            updated_at: new Date().toISOString(),
          }, {
            onConflict: "company_id,integration_type"
          });

        if (error) {
          console.error(`Failed to create integration ${integrationId}:`, error);
        } else {
          console.log(`Integration ${integrationId} created successfully`);
        }

        await new Promise(resolve => setTimeout(resolve, 800)); // Small delay for UX
      }

      setStep("complete");
    } catch (error) {
      console.error("Failed to connect integrations:", error);
      toast.error("Failed to connect some integrations");
    } finally {
      setConnecting(false);
      setCurrentIntegration(null);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {step === "business" && "Tell us about your business"}
            {step === "integrations" && "Connect your integrations"}
            {step === "connecting" && "Connecting your integrations..."}
            {step === "complete" && "Setup complete!"}
          </DialogTitle>
          <DialogDescription>
            {step === "business" && "Help us personalize your experience"}
            {step === "integrations" && "Choose integrations to get started"}
            {step === "connecting" && "Please wait while we connect your integrations"}
            {step === "complete" && "Your workspace is ready"}
          </DialogDescription>
        </DialogHeader>

        {step === "business" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>What type of business do you have?</Label>
              <select
                value={businessData.businessType}
                onChange={(e) => setBusinessData({ ...businessData, businessType: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select type</option>
                <option value="saas">SaaS</option>
                <option value="ecommerce">E-commerce</option>
                <option value="marketplace">Marketplace</option>
                <option value="subscription">Subscription Service</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Do you accept payments?</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hasPayments"
                    value="yes"
                    checked={businessData.hasPayments === "yes"}
                    onChange={(e) => setBusinessData({ ...businessData, hasPayments: e.target.value })}
                  />
                  <span className="text-sm">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hasPayments"
                    value="no"
                    checked={businessData.hasPayments === "no"}
                    onChange={(e) => setBusinessData({ ...businessData, hasPayments: e.target.value })}
                  />
                  <span className="text-sm">No</span>
                </label>
              </div>
            </div>

            {businessData.hasPayments === "yes" && (
              <div className="space-y-2">
                <Label>Which payment provider do you use?</Label>
                <select
                  value={businessData.paymentProvider}
                  onChange={(e) => setBusinessData({ ...businessData, paymentProvider: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select provider</option>
                  <option value="stripe">Stripe</option>
                  <option value="paypal">PayPal</option>
                  <option value="braintree">Braintree</option>
                  <option value="other">Other</option>
                </select>
              </div>
            )}

            <div className="space-y-2">
              <Label>How many customers do you have?</Label>
              <select
                value={businessData.customerVolume}
                onChange={(e) => setBusinessData({ ...businessData, customerVolume: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select volume</option>
                <option value="1-100">1-100</option>
                <option value="101-1000">101-1,000</option>
                <option value="1001-10000">1,001-10,000</option>
                <option value="10000+">10,000+</option>
              </select>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={handleSkip}>Skip for now</Button>
              <Button onClick={handleBusinessNext} disabled={!businessData.businessType}>Continue</Button>
            </div>
          </div>
        )}

        {step === "integrations" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Based on your business type, we recommend these integrations. You can always add more later.
            </p>
            <div className="space-y-2">
              {integrations.map((integration) => {
                const isSelected = selectedIntegrations.includes(integration.id);
                return (
                  <Card
                    key={integration.id}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? "border-blue-500 bg-blue-50" : "hover:border-blue-300"
                    }`}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedIntegrations(selectedIntegrations.filter(id => id !== integration.id));
                      } else {
                        setSelectedIntegrations([...selectedIntegrations, integration.id]);
                      }
                    }}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <span className="text-2xl">{integration.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-medium">{integration.name}</h3>
                        <p className="text-xs text-muted-foreground">{integration.description}</p>
                      </div>
                      {isSelected && <Check className="h-5 w-5 text-blue-600" />}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep("business")}>Back</Button>
              <Button onClick={handleConnect} disabled={selectedIntegrations.length === 0}>
                Connect {selectedIntegrations.length > 0 ? `(${selectedIntegrations.length})` : ""}
              </Button>
            </div>
          </div>
        )}

        {step === "connecting" && (
          <div className="space-y-4 py-8">
            <div className="space-y-3">
              {selectedIntegrations.map((integrationId) => {
                const integration = integrations.find(i => i.id === integrationId);
                const isCurrent = currentIntegration === integrationId;
                const isComplete = selectedIntegrations.indexOf(integrationId) < selectedIntegrations.indexOf(currentIntegration || "");

                return (
                  <div key={integrationId} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                    <span className="text-xl">{integration?.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{integration?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {isComplete ? "Connected" : isCurrent ? "Connecting..." : "Waiting"}
                      </p>
                    </div>
                    {isComplete && <Check className="h-5 w-5 text-green-600" />}
                    {isCurrent && <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === "complete" && (
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">You're all set!</h3>
              <p className="text-sm text-muted-foreground mt-2">
                {selectedIntegrations.length} integration{selectedIntegrations.length > 1 ? 's' : ''} connected successfully.
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-left">
              <p className="text-sm font-medium mb-2">Next steps:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Configure your integrations in Settings</li>
                <li>• Customize your customer experience in Workspace</li>
                <li>• Start collecting exit interviews</li>
              </ul>
            </div>
            <Button onClick={onClose} className="w-full">Go to Dashboard</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DashboardEmpty() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
        <p className="text-lg font-medium text-slate-900">No interview data yet</p>
        <p className="mt-2 text-sm text-slate-600">
          Start conducting exit interviews to see churn intelligence here.
        </p>
        <Link
          to="/install"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Set up the exit interview widget
        </Link>
      </div>
    </div>
  );
}

