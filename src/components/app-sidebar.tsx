import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Inbox, Users, Settings, Palette, Plug, BookOpen } from "lucide-react";
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
  { title: "Team", url: "/team", icon: Users },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [integrationData, setIntegrationData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIntegrations();
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
          <img src="/leaveesy.png" alt="leaveesy" className="h-32 w-auto object-contain" />
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
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-2 py-2 text-[11px] leading-relaxed text-muted-foreground group-data-[collapsible=icon]:hidden">
          <p className="font-medium text-foreground">Auto-pilot active</p>
          <p>Interviews trigger on every cancellation event.</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

