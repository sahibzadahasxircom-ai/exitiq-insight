import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Inbox, Settings, Palette, Plug, BookOpen, Activity, User, AlertCircle } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCompanyUsage, canCreateInterview } from "@/lib/pricing.functions";

const intelligence = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "Cancellations", url: "/interviews", icon: Inbox },
];

const productKnowledge = [
  { title: "Product Knowledge", url: "/product-knowledge", icon: BookOpen },
];

const integrations = [
  { title: "Integrations", url: "/integrations", icon: Plug },
];

const workspace = [
  { title: "Workspace", url: "/workspace", icon: Palette },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Usage", url: "/usage", icon: Activity },
  { title: "Account", url: "/account", icon: User },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [integrationData, setIntegrationData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    loadIntegrations();
    loadUserInfo();
  }, []);

  const loadIntegrations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile) return;

      const { data: integrationsData } = await (supabase as any)
        .from("integrations")
        .select("*")
        .eq("company_id", profile.company_id);

      setIntegrationData(integrationsData || []);
    } catch (error) {
      console.error("Failed to load integrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
      }
    } catch (error) {
      console.error("Failed to load user info:", error);
    }
  };

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

  const renderItems = (items: typeof intelligence) =>
    items.map((item) => {
      const isActive = pathname === item.url || pathname.startsWith(item.url + "/");
      return (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
            <Link to={item.url}>
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border pb-0 -mt-8">
        <Link to="/" className="flex items-center gap-2">
          <img src="/leaveesy.png" alt="leaveesy" className="h-8 w-auto object-contain md:h-32" />
        </Link>
      </SidebarHeader>
      <SidebarContent className="-mt-6">
        <SidebarGroup>
          <SidebarGroupLabel>Intelligence</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(intelligence)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Product Knowledge</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(productKnowledge)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Integrations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(integrations)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(workspace)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {usage && (
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="px-2 py-2 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Usage</span>
                  <span className="font-medium">
                    {usage.interviews_count}/{usage.limit === Infinity ? '∞' : usage.limit}
                  </span>
                </div>
                {usage.remaining <= 0 && (
                  <div className="flex items-center gap-1 text-destructive text-[11px]">
                    <AlertCircle className="h-3 w-3" />
                    <span>Limit reached</span>
                  </div>
                )}
                {usage.remaining > 0 && usage.remaining <= 3 && (
                  <div className="text-amber-600 text-[11px]">
                    {usage.remaining} interviews left
                  </div>
                )}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
      </SidebarFooter>
    </Sidebar>
  );
}

