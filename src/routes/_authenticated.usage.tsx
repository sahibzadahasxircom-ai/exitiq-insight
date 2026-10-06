import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Activity, AlertCircle, Check, CreditCard, ArrowRight, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getCompanyUsage, getCompanySubscription, getPricingPlans } from "@/lib/pricing.functions";

export const Route = createFileRoute("/_authenticated/usage")({
  head: () => ({ meta: [{ title: "Usage — leaveesy" }] }),
  component: UsagePage,
});

function UsagePage() {
  const getUsageFn = useServerFn(getCompanyUsage);
  const getSubscriptionFn = useServerFn(getCompanySubscription);
  const getPlansFn = useServerFn(getPricingPlans);

  const { data: usage } = useQuery({
    queryKey: ["company-usage"],
    queryFn: () => getUsageFn({ data: undefined }),
  });

  const { data: subscription } = useQuery({
    queryKey: ["company-subscription"],
    queryFn: () => getSubscriptionFn({ data: undefined }),
  });

  const { data: plans = [] } = useQuery({
    queryKey: ["pricing-plans"],
    queryFn: () => getPlansFn({ data: undefined }),
  });

  const currentPlan = subscription?.pricing_plans;
  const isLimitReached = usage?.remaining === 0;
  const isNearLimit = usage?.remaining !== undefined && usage?.remaining > 0 && usage?.remaining <= 3;
  const usagePercentage = usage?.limit !== Infinity ? ((usage?.interviews_count || 0) / (usage?.limit || 1)) * 100 : 0;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Usage & Billing</h1>
          <p className="mt-2 text-slate-600">
            Track your interview usage and manage your subscription
          </p>
        </div>

        {/* Current Plan Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{currentPlan?.name || "Free"}</h2>
                <p className="text-slate-600">{currentPlan?.description || "Perfect for getting started"}</p>
              </div>
              <Badge variant={isLimitReached ? "destructive" : isNearLimit ? "outline" : "default"} className="text-base px-4 py-2">
                {isLimitReached ? "Limit Reached" : isNearLimit ? "Near Limit" : "Active"}
              </Badge>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Monthly Interviews</span>
                  <span className="text-sm text-slate-600">
                    {usage?.interviews_count || 0} / {usage?.limit === Infinity ? "∞" : usage?.limit || 5}
                  </span>
                </div>
                {usage?.limit !== Infinity && (
                  <Progress value={usagePercentage} className="h-2" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Remaining</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {usage?.remaining === Infinity ? "∞" : usage?.remaining || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Billing Cycle</p>
                  <p className="text-sm text-slate-900 capitalize">
                    {subscription?.billing_cycle || "monthly"}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-slate-500 mb-1">Current Period</p>
                <p className="text-sm text-slate-900">
                  {monthStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {monthEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Card */}
        {isLimitReached && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-amber-600 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Interview limit reached
                  </h3>
                  <p className="text-slate-700 mb-4">
                    You've used all {usage?.limit} interviews for this month. Upgrade to continue collecting customer feedback.
                  </p>
                  <Link to="/pricing">
                    <Button className="gap-2">
                      <CreditCard className="h-4 w-4" />
                      Upgrade Plan
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plan Features */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Plan Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {Array.isArray(currentPlan?.features) ? currentPlan.features.map((feature: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-700">{feature}</span>
                </li>
              )) : (
                <li className="text-sm text-slate-500">No features available</li>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Usage History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Usage Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-600">This Month</p>
                  <p className="text-2xl font-bold text-slate-900">{usage?.interviews_count || 0}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Limit</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {usage?.limit === Infinity ? "∞" : usage?.limit || 5}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-2">Interviews will reset on:</p>
                <p className="text-lg font-semibold text-slate-900">
                  {monthEnd.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Plan */}
        <div className="mt-6 text-center">
          <Link to="/pricing">
            <Button variant="outline" className="gap-2">
              <CreditCard className="h-4 w-4" />
              View All Plans
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
