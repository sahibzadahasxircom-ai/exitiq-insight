import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { UserMenu } from "@/components/user-menu";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { loading, session, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      navigate({ to: "/auth", search: { redirect: window.location.pathname } as never, replace: true });
    }
  }, [loading, session, navigate]);

  useEffect(() => {
    const handleRouting = async () => {
      if (loading || !session || !profile) return;

      // Only redirect if we're on the base authenticated path
      if (window.location.pathname === "/_authenticated" || window.location.pathname === "/") {
        if (profile.company_id) {
          // Check if user has verified integrations
          const { data: integrations } = await supabase
            .from("integrations")
            .select("*")
            .eq("company_id", profile.company_id);

          const hasConnectedIntegration = integrations?.some(
            (i) => i.status === "connected" || i.status === "listening_for_events"
          );

          if (hasConnectedIntegration) {
            // User has verified integrations, go to dashboard
            navigate({ to: "/dashboard", replace: true });
          } else {
            // User has company but no verified integrations, go to setup-wizard
            navigate({ to: "/setup-wizard", replace: true });
          }
        } else {
          // No company_id, go to setup-wizard
          navigate({ to: "/setup-wizard", replace: true });
        }
      }
    };

    handleRouting();
  }, [loading, session, profile, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading workspace…</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger />
            <div className="h-5 w-px bg-border" />
            <span className="text-sm text-muted-foreground">leaveesy Console</span>
            <div className="ml-auto">
              <UserMenu />
            </div>
          </header>
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

