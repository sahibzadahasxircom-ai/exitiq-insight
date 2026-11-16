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
      { name: "description", content: "Executive overview of user cancellations, churn drivers, and revenue at risk." },
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
  const userQuotes = insights
    .filter((i: any) => i.quote)
    .map((i: any) => ({
      quote: i.quote,
      attribution: `User • ${new Date(i.created_at).toLocaleDateString()}`,
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
    userQuotes,
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
      users: count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
      trend: Math.random() > 0.5 ? 'up' : 'down' as any,
      issues: categoryDetails[name]?.slice(0, 3) || [],
    }))
    .sort((a, b) => b.users - a.users)
    .slice(0, 5);
}

function generateRecommendations(insights: any[]) {
  const recommendations = [];
  const categoryMap: Record<string, any[]> = {};

  // Group insights by category
  insights.forEach((insight) => {
    const category = insight.category || 'other';
    if (!categoryMap[category]) {
      categoryMap[category] = [];
    }
    categoryMap[category].push(insight);
  });

  // Generate specific recommendations based on actual insights - one per category
  Object.entries(categoryMap).forEach(([category, categoryInsights]) => {
    const summaries = categoryInsights.map(i => i.summary).filter(Boolean);
    const uniqueSummaries = [...new Set(summaries)];
    const categoryDisplay = category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    // Always create a recommendation for each category with insights
    if (category === 'ai_assistant') {
      recommendations.push({
        id: `rec-${category}-1`,
        recommendation: `Improve AI assistant capabilities by ${uniqueSummaries.slice(0, 1).join(', ').toLowerCase()}. Enhance context retention and memory to provide more accurate and consistent responses across conversations.`,
        problem: uniqueSummaries.slice(0, 1).join(', '),
        solution_to: 'AI assistant limitations',
        expected_impact: 'High',
        confidence: 0.85,
      });
    } else if (category === 'ux' || category === 'workflow') {
      recommendations.push({
        id: `rec-${category}-1`,
        recommendation: `Fix workflow issues by ${uniqueSummaries.slice(0, 1).join(', ').toLowerCase()}. Simplify navigation and reduce the number of steps required to complete common tasks.`,
        problem: uniqueSummaries.slice(0, 1).join(', '),
        solution_to: 'Complex workflow issues',
        expected_impact: 'Medium',
        confidence: 0.75,
      });
    } else if (category === 'design') {
      recommendations.push({
        id: `rec-${category}-1`,
        recommendation: `Address design problems by ${uniqueSummaries.slice(0, 1).join(', ').toLowerCase()}. Improve visual hierarchy, enhance readability, and create a more intuitive user interface layout.`,
        problem: uniqueSummaries.slice(0, 1).join(', '),
        solution_to: 'Design-related complaints',
        expected_impact: 'Medium',
        confidence: 0.70,
      });
    } else if (category === 'feature') {
      recommendations.push({
        id: `rec-${category}-1`,
        recommendation: `Add missing features by ${uniqueSummaries.slice(0, 1).join(', ').toLowerCase()}. Develop and launch the most requested capabilities to increase product value and meet user needs.`,
        problem: uniqueSummaries.slice(0, 1).join(', '),
        solution_to: 'Missing feature requests',
        expected_impact: 'High',
        confidence: 0.80,
      });
    } else if (category === 'support') {
      recommendations.push({
        id: `rec-${category}-1`,
        recommendation: `Improve user support by ${uniqueSummaries.slice(0, 1).join(', ').toLowerCase()}. Enhance response times, add live chat options, and provide better self-service resources.`,
        problem: uniqueSummaries.slice(0, 1).join(', '),
        solution_to: 'Customer support complaints',
        expected_impact: 'Medium',
        confidence: 0.65,
      });
    } else if (category === 'pricing') {
      recommendations.push({
        id: `rec-${category}-1`,
        recommendation: `Address pricing concerns by ${uniqueSummaries.slice(0, 1).join(', ').toLowerCase()}. Reevaluate the pricing structure to align with market rates and offer more flexible plans.`,
        problem: uniqueSummaries.slice(0, 1).join(', '),
        solution_to: 'Pricing-related cancellations',
        expected_impact: 'High',
        confidence: 0.78,
      });
    } else {
      // Generic recommendation for other categories
      recommendations.push({
        id: `rec-${category}-1`,
        recommendation: `Resolve ${categoryDisplay.toLowerCase()} issues by ${uniqueSummaries.slice(0, 1).join(', ').toLowerCase()}. Analyze the specific problems and implement targeted solutions to improve user satisfaction.`,
        problem: uniqueSummaries.slice(0, 1).join(', '),
        solution_to: `${categoryDisplay}-related issues`,
        expected_impact: 'Medium',
        confidence: 0.65,
      });
    }
  });

  // If no specific recommendations, provide generic ones based on data
  if (recommendations.length === 0 && insights.length > 0) {
    const topIssues = insights.slice(0, 3).map(i => i.summary).filter(Boolean);
    recommendations.push({
      id: 'rec-generic-1',
      recommendation: `Address user issues by ${topIssues.slice(0, 1).join(', ').toLowerCase()}. Improve the most frequently mentioned problems to enhance product experience and reduce churn.`,
      problem: topIssues.slice(0, 1).join(', '),
      solution_to: 'Overall user feedback',
      expected_impact: 'High',
      confidence: 0.70,
    });
  }

  return recommendations.slice(0, 5);
}

function generateExecutiveSummary(insights: any[], churnDrivers: any[]) {
  if (insights.length === 0) {
    return "Start collecting user feedback to get detailed insights into cancellation patterns.";
  }

  const totalInsights = insights.length;

  if (churnDrivers.length === 0) {
    return `Analyzing ${totalInsights} user interviews. Collect more data to identify specific churn patterns.`;
  }

  // Build summary covering all churn drivers - each on new line
  const driverSummaries = churnDrivers.map((driver, index) => {
    const specificIssues = driver.issues?.slice(0, 2) || [];
    const issuesText = specificIssues.length > 0
      ? ` (${specificIssues.join(", ")})`
      : "";
    // Bold the first/main cause only and always bold percentages
    const mainCause = index === 0 ? `<strong>${driver.name.toLowerCase()}</strong>` : driver.name.toLowerCase();
    const boldPct = `<strong>${driver.pct}%</strong>`;
    return `${boldPct} ${mainCause}${issuesText}`;
  });

  const driversText = driverSummaries.join(".\n");
  
  return `Cancellation analysis shows:\n${driversText}.\n${totalInsights} interviews analyzed to identify key pain points driving user churn.`;
}

function highlightSummary(text: string, churnDrivers: any[]) {
  if (!churnDrivers || churnDrivers.length === 0) return text;

  // Bold percentages in the text and preserve newlines and bold tags
  const boldPercentages = text.replace(/(\d+%)/g, '<strong>$1</strong>');
  const withLineBreaks = boldPercentages.replace(/\n/g, '<br />');

  return <span dangerouslySetInnerHTML={{ __html: withLineBreaks }} />;
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
          try {
            const { data: company } = await supabase
              .from("companies")
              .select("integration_type, setup_completed")
              .eq("id", profile.company_id)
              .single();
            
            setIntegrationStatus(company);
          } catch (error) {
            console.error("Failed to load integration status:", error);
          }
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
              Executive summary of user cancellations and churn drivers.
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
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <p className="text-red-500">Error loading dashboard</p>
            <p className="text-sm text-muted-foreground">{error.message || 'Unknown error'}</p>
            <Button onClick={() => window.location.reload()}>Try again</Button>
          </div>
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
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
        <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

/* ---------- 2. Executive Brief ---------- */
function ExecutiveBrief({ data }: { data: any }) {
  const executiveSummary = data?.executiveSummary || "Start collecting user feedback to get detailed insights into cancellation patterns.";
  const churnDrivers = data?.churnDrivers || [];
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 md:p-8 shadow-sm">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          User Cancellation Analysis
        </h1>
        <div className="mt-5 rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
          <p 
            className="text-sm leading-relaxed text-gray-700 whitespace-pre-line" 
            style={{
              display: !expanded ? '-webkit-box' : 'block',
              WebkitLineClamp: !expanded ? 7 : 'unset',
              WebkitBoxOrient: 'vertical',
              overflow: !expanded ? 'hidden' : 'visible'
            }}
          >
            {highlightSummary(executiveSummary, churnDrivers)}
          </p>
          {churnDrivers.length > 2 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
            >
              {expanded ? (
                <>Show less <ArrowUpRight className="h-3 w-3" /></>
              ) : (
                <>Show more <ArrowDownRight className="h-3 w-3" /></>
              )}
            </button>
          )}
        </div>
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

  // Generate mock monthly data for line chart
  const generateMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => {
      const dataPoint: any = { month };
      rows.forEach((r: any, index) => {
        // Simulate different trends for each category
        const baseValue = r.users * (0.5 + Math.random() * 0.5);
        dataPoint[r.name] = Math.round(baseValue * (0.8 + Math.random() * 0.4));
      });
      return dataPoint;
    });
  };

  const monthlyData = generateMonthlyData();
  const colors = ['#2563eb', '#16a34a', '#d97706', '#7c3aed', '#64748b'];

  return (
    <section>
      <SectionHead title="Cancellation reasons" subtitle="Top reasons for user cancellations." />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left - Table/List */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 text-sm font-semibold text-gray-700">Reason</th>
                <th className="text-right py-3 text-sm font-semibold text-gray-700">% share in churn</th>
                <th className="text-right py-3 text-sm font-semibold text-gray-700">Users</th>
                <th className="text-right py-3 text-sm font-semibold text-gray-700"></th>
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? (
                rows.map((r: any, index) => (
                  <tr key={r.name} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="py-4">
                      <span className="font-medium text-gray-900">{r.name}</span>
                    </td>
                    <td className="text-right py-4">
                      <span className="text-base font-semibold text-gray-900">{r.pct}%</span>
                    </td>
                    <td className="text-right py-4">
                      <span className="text-base font-semibold text-gray-900">{r.users}</span>
                    </td>
                    <td className="text-right py-4">
                      <button 
                        onClick={() => onSelectDriver(r)}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        View details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500">
                    No churn data yet. Collect more interviews to see cancellation reasons.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Right - Line Chart */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Churn Over Time</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <Tooltip />
                  <Legend />
                  {rows.map((r: any, index) => (
                    <Line
                      key={r.name}
                      type="monotone"
                      dataKey={r.name}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
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
        <SectionHead title="Users Voice" subtitle="What users said in their own words." />
        <div className="rounded-lg border border-gray-200 bg-white p-5 md:p-6">
          <p className="text-center text-gray-500">
            No user quotes yet. Complete more interviews to see user feedback here.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <SectionHead title="Users Voice" subtitle="What users said in their own words." />
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
      <div className="grid grid-cols-1 gap-5 md:gap-6 md:grid-cols-2 xl:grid-cols-3">
        {recommendations.length > 0 ? (
          recommendations.map((r: any, i: number) => (
            <article key={r.id} className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer" onClick={() => onSelectRecommendation(r)}>
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-bold text-white shadow-md">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Action</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 mb-2">Recommended Action</p>
                  <p className="text-sm font-medium text-gray-900 leading-relaxed">{r.recommendation}</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Problem</p>
                  <p className="text-xs text-gray-600 line-clamp-2">{r.problem}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Impact</p>
                    <p className="text-sm font-semibold text-gray-900">{r.expected_impact}</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Success rate</p>
                    <p className="text-sm font-semibold text-green-600">{Math.round(r.confidence * 100)}%</p>
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="col-span-full rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <Activity className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-base text-gray-500">
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
              {driver.name.toLowerCase()} is a leading cause of cancellations with {driver.users} affected users ({driver.pct}% of total cancellations).
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
              Addressing {driver.name.toLowerCase()} issues could significantly reduce churn by targeting the specific pain points that drive users away.
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
      <div className="max-w-md w-full rounded-lg bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recommendation Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          <div className="rounded-lg bg-blue-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-700">Recommended Action</p>
            <p className="mt-1 text-sm text-gray-800">{recommendation.recommendation}</p>
          </div>
          <div className="rounded-lg bg-red-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-red-700">Problem</p>
            <p className="mt-1 text-sm text-gray-700">{recommendation.problem}</p>
          </div>
          <div className="rounded-lg bg-green-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-green-700">Specific Solution</p>
            <p className="mt-1 text-sm text-gray-700">{recommendation.solution_to}</p>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 rounded-lg bg-gray-50 p-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Impact</p>
              <p className="mt-1 text-sm text-gray-700">{recommendation.expected_impact}</p>
            </div>
            <div className="flex-1 rounded-lg bg-gray-50 p-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Confidence</p>
              <p className="mt-1 text-sm font-medium text-gray-700">{Math.round(recommendation.confidence * 100)}%</p>
            </div>
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
            Set up your workspace to start collecting user feedback.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Complete your setup wizard to configure integrations and start tracking user cancellations.
          </p>
          <Button onClick={onClose} className="w-full">
            Go to Setup Wizard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}