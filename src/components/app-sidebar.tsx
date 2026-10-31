import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Inbox, Palette, Plug, BookOpen, User, LogOut, ChevronRight } from "lucide-react";
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
import { useAuth } from "@/hooks/use-auth";

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
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [integrationData, setIntegrationData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { signOut } = useAuth();
  const navigate = useNavigate();

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

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/auth", replace: true });
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
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/account">
                    <User className="h-4 w-4" />
                    <span>Account</span>
                    <ChevronRight className="ml-auto h-4 w-4" />
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
      </SidebarFooter>
    </Sidebar>
  );
}

