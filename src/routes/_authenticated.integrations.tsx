import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Code, 
  Webhook, 
  Zap, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  Trash2,
  Plus,
  Settings,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { IntegrationModals } from "@/components/integrations/IntegrationModals";
import { getWidgetScriptUrl, getWebhookUrl } from "@/lib/config";

interface IntegrationData {
  id: string;
  integration_type: "javascript" | "webhook";
  status: "not_connected" | "waiting_for_verification" | "connected" | "listening_for_events";
  config: any;
  connected_at: string | null;
  last_event_at: string | null;
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
  const [company, setCompany] = useState<any>(null);
  const [modalIntegration, setModalIntegration] = useState<string | null>(null);
  const [modalIntegrationId, setModalIntegrationId] = useState<string | null>(null);
  const [showSnippetModal, setShowSnippetModal] = useState(false);
  const [snippetContent, setSnippetContent] = useState<string>("");

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
    setLoading(true);
    try {
      const { data: profile } = await supabase.auth.getUser();
      if (!profile?.user?.id) {
        console.error("No user found");
        return;
      }

      // Get company_id from profiles table (similar to setup wizard)
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", profile.user.id)
        .single();

      if (profileError || !profileData?.company_id) {
        console.error("No company_id found in profile:", profileError);
        setLoading(false);
        return;
      }

      const companyId = profileData.company_id;
      setCompanyId(companyId);

      // Load company data
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("*")
        .eq("id", companyId)
        .single();

      if (companyError) {
        console.error("Failed to load company:", companyError);
        setLoading(false);
        return;
      }

      setCompany(company);

      // Load integrations from the integrations table
      const { data: integrationsData, error: integrationsError } = await supabase
        .from("integrations")
        .select("*")
        .eq("company_id", companyId);

      if (integrationsError) {
        console.error("Failed to load integrations:", integrationsError);
        setLoading(false);
        return;
      }

      const integrationList: IntegrationData[] = (integrationsData || []).map((integration) => ({
        id: integration.id,
        integration_type: integration.integration_type as "javascript" | "webhook",
        status: integration.status as "not_connected" | "waiting_for_verification" | "connected" | "listening_for_events",
        config: integration.config,
        connected_at: integration.connected_at,
        last_event_at: company.last_event_at,
        last_error: integration.last_error,
        created_at: integration.created_at,
        updated_at: integration.updated_at,
        company_id: integration.company_id,
      }));

      setIntegrations(integrationList);
    } catch (error) {
      console.error("Error loading integrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case "javascript": return <Zap className="h-4 w-4" />;
      case "webhook": return <Webhook className="h-4 w-4" />;
      default: return <Code className="h-4 w-4" />;
    }
  };

  const getIntegrationName = (type: string) => {
    switch (type) {
      case "javascript": return "JavaScript Widget";
      case "webhook": return "Webhooks";
      default: return type;
    }
  };

  const getIntegrationDescription = (type: string) => {
    switch (type) {
      case "javascript": return "Track button clicks on your website";
      case "webhook": return "Receive events from billing platforms";
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
      case "listening_for_events":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <Check className="h-3 w-3 mr-1" />
            Listening for events
          </span>
        );
      case "waiting_for_verification":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Waiting for connection...
          </span>
        );
      case "not_connected":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            Not Connected
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
    if (!confirm("Are you sure you want to disconnect this integration?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("integrations")
        .delete()
        .eq("id", integrationId);

      if (error) {
        toast.error("Failed to disconnect integration");
        console.error(error);
      } else {
        toast.success("Integration disconnected successfully");
        loadIntegrations();
      }
    } catch (error) {
      console.error("Error disconnecting integration:", error);
      toast.error("Failed to disconnect integration");
    }
  };

  const handleReconnect = async (integrationId: string, type: string) => {
    // Redirect to setup wizard for reconnection
    router.push("/setup-wizard");
  };

  const handleConnect = (type: string) => {
    // Redirect to setup wizard for new connection
    router.push("/setup-wizard");
  };

  const handleViewSnippet = (integration: IntegrationData) => {
    if (integration.integration_type === "javascript") {
      const buttonName = integration.config?.buttonName || "Sign Out";
      const companyId = integration.company_id;
      const snippet = `<!-- leaveesy Global Tracking Script Tag -->
<script src="${getWidgetScriptUrl(companyId)}"></script>

<script>
  // Wait for leaveesy to be ready before attaching event listeners
  window.addEventListener('leaveesyReady', function() {
    console.log('leaveesy is ready');
    
    // Auto-detect buttons by text
    const buttons = document.querySelectorAll('button, a');
    buttons.forEach(function(btn) {
      const buttonText = btn.textContent?.trim().toLowerCase();
      if (buttonText === '${buttonName.toLowerCase()}' || buttonText === 'sign out' || buttonText === 'log out' || buttonText === 'delete account' || buttonText === 'cancel subscription') {
        btn.addEventListener('click', function(e) {
          if (window.leaveesy) {
            console.log('Tracking event');
            window.leaveesy.track("SignOut", { action: "process_started" });
          }
        });
      }
    });
  });
  
  // Fallback: if leaveesy is already loaded, attach listeners immediately
  if (window.leaveesy) {
    console.log('leaveesy already loaded');
    const buttons = document.querySelectorAll('button, a');
    buttons.forEach(function(btn) {
      const buttonText = btn.textContent?.trim().toLowerCase();
      if (buttonText === '${buttonName.toLowerCase()}' || buttonText === 'sign out' || buttonText === 'log out' || buttonText === 'delete account' || buttonText === 'cancel subscription') {
        btn.addEventListener('click', function(e) {
          console.log('Tracking event');
          window.leaveesy.track("SignOut", { action: "process_started" });
        });
      }
    });
  }
</script>`;
      setSnippetContent(snippet);
    } else if (integration.integration_type === "webhook") {
      const webhookUrl = getWebhookUrl(integration.company_id);
      const snippet = `Webhook URL: ${webhookUrl}

Add this webhook URL to your billing platform's webhook settings.
Select cancellation events to send to this endpoint.

Example webhook payload:
{
  "type": "customer.subscription.deleted",
  "data": {
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "url": "https://your-website.com"
  }
}`;
      setSnippetContent(snippet);
    }
    setShowSnippetModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const availableIntegrations = [
    { id: "javascript", name: "JavaScript Widget", icon: Zap, description: "Track button clicks on your website" },
    { id: "webhook", name: "Webhooks", icon: Webhook, description: "Receive events from billing platforms" },
  ];

  const connectedIntegrations = integrations.filter(i => i.status === "connected" || i.status === "listening_for_events");
  const disconnectedIntegrations = integrations.filter(i => i.status !== "connected" && i.status !== "listening_for_events");

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
                        {integration.config?.eventTypes && integration.config.eventTypes.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Tracking: {integration.config.eventTypes.map((t: string) => t.replace('_', ' ')).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusChip(integration.status)}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleViewSnippet(integration)}
                        title="View Snippet"
                      >
                        <Code className="h-4 w-4 text-muted-foreground" />
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

      {company?.company_name && (
        <div className="mb-8">
          <p className="text-xs text-muted-foreground">
            These integrations are configured for <span className="font-medium">{company.company_name}</span> only
          </p>
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

      {/* Snippet Modal */}
      {showSnippetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">Integration Snippet</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSnippetModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <pre className="bg-muted p-4 rounded-lg text-sm font-mono whitespace-pre-wrap break-all">
                {snippetContent}
              </pre>
            </div>
            <div className="p-4 border-t">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(snippetContent);
                  toast.success("Snippet copied to clipboard");
                }}
                className="w-full"
              >
                Copy Snippet
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
