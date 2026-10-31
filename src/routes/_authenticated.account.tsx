import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ExternalLink, CreditCard, RefreshCw, CheckCircle2, AlertCircle, Settings, Activity, User, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { generateCustomerPortalSession, getPaddleCustomerId, getCompanyUsage } from "@/lib/pricing.functions";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "Account — leaveesy" }] }),
  component: AccountPage,
});

function AccountPage() {
  const { profile, company } = useAuth();
  const getCustomerIdFn = useServerFn(getPaddleCustomerId);
  const { data: paddleData, isLoading } = useQuery({
    queryKey: ["paddle-customer-id"],
    queryFn: () => getCustomerIdFn({ data: undefined }),
  });

  const getUsageFn = useServerFn(getCompanyUsage);
  const { data: usage } = useQuery({
    queryKey: ["company-usage"],
    queryFn: () => getUsageFn({ data: undefined }),
    retry: false,
  });

  const generateSessionFn = useServerFn(generateCustomerPortalSession);

  const handleOpenPortal = async () => {
    const result = await generateSessionFn({ data: undefined });
    if (result.success && result.url) {
      window.location.href = result.url;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Account</h1>
          <p className="mt-2 text-slate-600">
            Manage your profile, usage, and subscription
          </p>
        </div>

        {/* Profile Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Name</p>
                <p className="text-slate-900 font-medium">{profile?.full_name || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Email</p>
                <p className="text-slate-900 font-medium">{profile?.email || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Company</p>
                <p className="text-slate-900 font-medium">{company?.company_name || 'Not set'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Section */}
        {usage && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700">Interviews Used</span>
                  <span className="font-medium text-slate-900">
                    {usage.interviews_count}/{usage.limit === Infinity ? '∞' : usage.limit}
                  </span>
                </div>
                {usage.remaining <= 0 && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>Limit reached - upgrade your plan</span>
                  </div>
                )}
                {usage.remaining > 0 && usage.remaining <= 3 && (
                  <div className="text-amber-600 text-sm">
                    {usage.remaining} interviews remaining this month
                  </div>
                )}
                <Link to="/usage">
                  <Button variant="outline" size="sm" className="gap-2">
                    View Details
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2 text-slate-500">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : paddleData?.paddleCustomerId ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-slate-700">Paddle customer connected</span>
                </div>
                <div className="text-sm text-slate-600">
                  Customer ID: <code className="bg-slate-100 px-2 py-1 rounded">{paddleData.paddleCustomerId}</code>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <span className="text-slate-700">No active subscription</span>
                </div>
                <p className="text-sm text-slate-600">
                  You don't have an active subscription. Choose a plan to get started.
                </p>
                <Link to="/pricing">
                  <Button size="sm" className="gap-2">
                    View Plans
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paddle Customer Portal */}
        {paddleData?.paddleCustomerId && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Manage Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Update payment method, cancel subscription, or view invoices in the Paddle customer portal.
              </p>
              <Button onClick={handleOpenPortal} className="gap-2">
                Open Customer Portal
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Settings Link */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Manage your workspace settings, integrations, and preferences.
            </p>
            <Link to="/settings">
              <Button variant="outline" size="sm" className="gap-2">
                Open Settings
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Billing Information */}
        <Card>
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Billing Provider</p>
                <p className="text-slate-900 font-medium">Paddle</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Environment</p>
                <Badge variant="outline">
                  {process.env.PADDLE_ENVIRONMENT === 'production' ? 'Live' : 'Sandbox'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
