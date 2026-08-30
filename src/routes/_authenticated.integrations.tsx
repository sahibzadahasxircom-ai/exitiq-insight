import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CreditCard, 
  Code, 
  Webhook, 
  Zap, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  Trash2,
  Plus,
  Settings
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { IntegrationModals } from "@/components/integrations/IntegrationModals";

interface IntegrationData {
  id: string;
  integration_type: "stripe" | "api" | "javascript" | "webhook";
  status: "pending" | "connecting" | "connected" | "disconnected" | "failed" | "needs_attention";
  config: any;
  connected_at: string | null;
  last_sync_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
  company_id: string;
}

export const Route = createFileRoute("/_authenticated/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations — leaveesy" },
      { name: "description", content: "Manage your leaveesy integrations." },
    ],
  }),
  component: Integrations,
});

function Integrations() {
  const router = useRouter();
  const [integrations, setIntegrations] = useState<IntegrationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [modalIntegration, setModalIntegration] = useState<string | null>(null);
  const [modalIntegrationId, setModalIntegrationId] = useState<string | null>(null);

  useEffect(() => {
    loadIntegrations();
    
    // Check if we just returned from OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('integration') === 'stripe' && urlParams.get('status') === 'connected') {
      // Refresh integrations after OAuth completion
      setTimeout(() => loadIntegrations(), 1000);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const loadIntegrations = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.navigate({ to: "/auth" });
        return;
      }

      // Get company ID from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile) {
        router.navigate({ to: "/auth" });
        return;
      }

      setCompanyId(profile.company_id);

      // Load company data to get integration info
      const { data: company, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", profile.company_id)
        .single();

      if (error) {
        console.error("Failed to load company:", error);
        return;
      }

      // Build integrations list from company data
      const integrationList: IntegrationData[] = [];
      
      if (company.integration_type) {
        integrationList.push({
          id: company.id,
          integration_type: company.integration_type,
          status: company.setup_completed ? "connected" : "pending",
          config: company.integration_config,
          connected_at: company.updated_at,
          last_sync_at: company.updated_at,
          last_error: null,
          created_at: company.created_at,
          updated_at: company.updated_at,
          company_id: company.id,
        });
      }

      setIntegrations(integrationList);
    } catch (error) {
      console.error("Error loading integrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case "stripe": return <CreditCard className="h-4 w-4" />;
      case "api": return <Code className="h-4 w-4" />;
      case "javascript": return <Zap className="h-4 w-4" />;
      case "webhook": return <Webhook className="h-4 w-4" />;
      default: return <Code className="h-4 w-4" />;
    }
  };

  const getIntegrationName = (type: string) => {
    switch (type) {
      case "stripe": return "Stripe";
      case "api": return "REST API";
      case "javascript": return "JavaScript Widget";
      case "webhook": return "Webhooks";
      default: return type;
    }
  };

  const getIntegrationDescription = (type: string) => {
    switch (type) {
      case "stripe": return "Connect payment data";
      case "api": return "Build custom integrations";
      case "javascript": return "Add to your website";
      case "webhook": return "Real-time notifications";
      default: return "";
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case "connected":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <Check className="h-3 w-3 mr-1" />
            Connected
          </span>
        );
      case "connecting":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Connecting
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            Pending
          </span>
        );
      case "disconnected":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            Not Connected
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </span>
        );
      case "needs_attention":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
            <AlertCircle className="h-3 w-3 mr-1" />
            Needs Setup
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            {status}
          </span>
        );
    }
  };

  const handleDisconnect = async (integrationId: string, type: string) => {
    if (!confirm(`Are you sure you want to disconnect ${getIntegrationName(type)}?`)) {
      return;
    }

    try {
      const { error } = await (supabase as any)
        .from("integrations")
        .update({
          status: "disconnected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", integrationId);

      if (error) {
        console.error("Failed to disconnect integration:", error);
        alert("Failed to disconnect integration");
      } else {
        await loadIntegrations();
      }
    } catch (error) {
      console.error("Error disconnecting integration:", error);
      alert("Failed to disconnect integration");
    }
  };

  const handleConnect = (type: string) => {
    // Open the modal for the integration type
    setModalIntegration(type);
    setModalIntegrationId(null);
  };

  const handleReconnect = async (integrationId: string, type: string) => {
    // Open the modal for existing integration
    setModalIntegration(type);
    setModalIntegrationId(integrationId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const availableIntegrations = [
    { id: "stripe", name: "Stripe", icon: CreditCard, description: "Connect payment data" },
    { id: "api", name: "REST API", icon: Code, description: "Build custom integrations" },
    { id: "javascript", name: "JavaScript Widget", icon: Zap, description: "Add to your website" },
    { id: "webhook", name: "Webhooks", icon: Webhook, description: "Real-time notifications" },
  ];

  const connectedIntegrations = integrations.filter(i => i.status === "connected");
  const disconnectedIntegrations = integrations.filter(i => i.status !== "connected");

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 md:px-6 md:py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your connected platforms and services
        </p>
      </div>

      {connectedIntegrations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-medium mb-4">Connected</h2>
          <div className="space-y-2">
            {connectedIntegrations.map((integration) => (
              <Card key={integration.id} className="card-hover">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
                        {getIntegrationIcon(integration.integration_type)}
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{getIntegrationName(integration.integration_type)}</h3>
                        <p className="text-xs text-muted-foreground">{getIntegrationDescription(integration.integration_type)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusChip(integration.status)}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setModalIntegration(integration.integration_type);
                          setModalIntegrationId(integration.id);
                        }}
                      >
                        <Settings className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDisconnect(integration.id, integration.integration_type)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {disconnectedIntegrations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-medium mb-4">Available</h2>
          <div className="space-y-2">
            {disconnectedIntegrations.map((integration) => (
              <Card key={integration.id} className="card-hover">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
                        {getIntegrationIcon(integration.integration_type)}
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{getIntegrationName(integration.integration_type)}</h3>
                        <p className="text-xs text-muted-foreground">{getIntegrationDescription(integration.integration_type)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusChip(integration.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => handleReconnect(integration.id, integration.integration_type)}
                      >
                        Configure
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Show available integrations that aren't connected */}
      {availableIntegrations
        .filter(available => !integrations.some(i => i.integration_type === available.id))
        .map((available) => (
          <Card key={available.id} className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
                    <available.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{available.name}</h3>
                    <p className="text-xs text-muted-foreground">{available.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                    Not Connected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => handleConnect(available.id)}
                  >
                    Connect
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

      <IntegrationModals
        integrationType={modalIntegration}
        integrationId={modalIntegrationId}
        onClose={() => {
          setModalIntegration(null);
          setModalIntegrationId(null);
        }}
      />
    </div>
  );
}

