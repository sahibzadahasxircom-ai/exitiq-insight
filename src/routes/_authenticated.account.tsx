import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { User, Activity, ChevronRight, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCompanyUsage } from "@/lib/pricing.functions";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "Account — leaveesy" }] }),
  component: AccountPage,
});

function AccountPage() {
  const { profile, company } = useAuth();

  const getUsageFn = useServerFn(getCompanyUsage);
  const { data: usage } = useQuery({
    queryKey: ["company-usage"],
    queryFn: () => getUsageFn({ data: undefined }),
    retry: false,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Account</h1>
          <p className="mt-2 text-slate-600">
            Manage your profile and settings
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
              <div className="pt-4">
                <Link to="/settings">
                  <Button variant="outline" size="sm" className="gap-2">
                    Edit Profile
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
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
                  <div className="text-red-600 text-sm">
                    Limit reached - upgrade your plan
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

        {/* Settings Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link to="/workspace" className="block">
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <span className="text-slate-700">Workspace</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </Link>
              <Link to="/product-knowledge" className="block">
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <span className="text-slate-700">Product Knowledge</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </Link>
              <Link to="/integrations" className="block">
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <span className="text-slate-700">Integrations</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
