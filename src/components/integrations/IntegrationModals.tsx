import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Copy, RefreshCw, AlertCircle, Settings, Key, Globe, Code, Zap, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getWidgetScriptUrl } from "@/lib/config";

interface IntegrationModalsProps {
  integrationType: string | null;
  integrationId: string | null;
  onClose: () => void;
}

export function IntegrationModals({ integrationType, integrationId, onClose }: IntegrationModalsProps) {
  if (!integrationType) return null;

  return (
    <>
      {integrationType === "stripe" && <StripeModal integrationId={integrationId} onClose={onClose} />}
      {integrationType === "api" && <APIModal integrationId={integrationId} onClose={onClose} />}
      {integrationType === "webhook" && <WebhookModal integrationId={integrationId} onClose={onClose} />}
      {integrationType === "javascript" && <WidgetModal integrationId={integrationId} onClose={onClose} />}
    </>
  );
}

function StripeModal({ integrationId, onClose }: { integrationId: string | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "connecting">("disconnected");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (integrationId) {
      loadIntegrationStatus();
    } else {
      setLoading(false);
    }
  }, [integrationId]);

  const loadIntegrationStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("integrations")
        .select("status")
        .eq("id", integrationId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setConnectionStatus(data.status === "connected" ? "connected" : "disconnected");
      }
    } catch (error) {
      console.error("Failed to load integration status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnect = async () => {
    setConnecting(true);
    setConnectionStatus("connecting");

    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No session");
      }

      // Call OAuth start endpoint
      const response = await fetch("/api/integrations/stripe/oauth/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to initiate OAuth");
      }

      // Redirect to Stripe OAuth
      window.location.href = data.authUrl;
    } catch (error) {
      console.error("Failed to connect Stripe:", error);
      setConnecting(false);
      setConnectionStatus("disconnected");
    }
  };

  const handleDisconnect = async () => {
    if (!integrationId) return;

    try {
      const { error } = await supabase
        .from("integrations")
        .update({ status: "disconnected" })
        .eq("id", integrationId);

      if (error) throw error;

      setConnectionStatus("disconnected");
      onClose();
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-[700px] max-h-[80vh] overflow-y-auto animate-scale-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Stripe Configuration
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm">Connection Status</h3>
                {connectionStatus === "connected" && (
                  <Badge className="bg-green-100 text-green-700">
                    <Check className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                )}
                {connectionStatus === "connecting" && (
                  <Badge className="bg-blue-100 text-blue-700">
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Connecting
                  </Badge>
                )}
                {connectionStatus === "disconnected" && (
                  <Badge className="bg-slate-100 text-slate-600">
                    Not Connected
                  </Badge>
                )}
              </div>
              {connectionStatus === "connected" && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Connected Account</span>
                    <span className="font-mono text-xs">acct_1xxxxxxxxxxx</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Sync</span>
                    <span>2 hours ago</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {connectionStatus === "connected" && (
            <>
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium text-sm mb-3">Webhook Status</h3>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Webhooks configured and receiving events</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium text-sm mb-3">Recent Events</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-muted-foreground">customer.subscription.deleted</span>
                      <span className="text-xs">2h ago</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-muted-foreground">customer.subscription.updated</span>
                      <span className="text-xs">5h ago</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-muted-foreground">invoice.payment_failed</span>
                      <span className="text-xs">1d ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          <div className="flex gap-2 pt-4">
            {connectionStatus === "disconnected" ? (
              <Button onClick={handleConnect} disabled={connecting} className="flex-1">
                {connecting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Connect Stripe
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button variant="outline" className="flex-1" onClick={handleConnect}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reconnect
                </Button>
                <Button variant="outline" className="flex-1 text-red-600 hover:text-red-700" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function APIModal({ integrationId, onClose }: { integrationId: string | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const apiKey = "eq_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-[700px] max-h-[80vh] overflow-y-auto animate-scale-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Configuration
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-sm mb-3">API Key</h3>
              <div className="flex gap-2">
                <Input value={apiKey} readOnly className="font-mono text-sm" />
                <Button variant="outline" size="icon" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Keep this key secret. Do not share it or commit it to version control.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm">Actions</h3>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Rotate Key
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  Delete Key
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-sm mb-3">Usage</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Requests this month</span>
                  <span>1,234 / 10,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate limit</span>
                  <span>100 req/min</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-sm mb-3">Scopes</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">interviews:read</Badge>
                <Badge variant="secondary">interviews:write</Badge>
                <Badge variant="secondary">insights:read</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WebhookModal({ integrationId, onClose }: { integrationId: string | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const webhookUrl = "https://api.leaveesy.com/webhooks/stripe";
  const signingSecret = "whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-[700px] max-h-[80vh] overflow-y-auto animate-scale-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Webhook Configuration
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-sm mb-3">Endpoint URL</h3>
              <div className="flex gap-2">
                <Input value={webhookUrl} readOnly className="font-mono text-sm" />
                <Button variant="outline" size="icon" onClick={() => handleCopy(webhookUrl)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-sm mb-3">Signing Secret</h3>
              <div className="flex gap-2">
                <Input value={signingSecret} readOnly className="font-mono text-sm" />
                <Button variant="outline" size="icon" onClick={() => handleCopy(signingSecret)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Use this secret to verify webhook signatures from leaveesy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-sm mb-3">Recent Deliveries</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>subscription.cancelled</span>
                  </div>
                  <span className="text-xs text-muted-foreground">2h ago</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>account.deleted</span>
                  </div>
                  <span className="text-xs text-muted-foreground">5h ago</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span>trial.ended</span>
                  </div>
                  <span className="text-xs text-muted-foreground">1d ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WidgetModal({ integrationId, onClose }: { integrationId: string | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const snippet = `<script src="${getWidgetScriptUrl(integrationId || 'your-company-id')}"></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-[700px] max-h-[80vh] overflow-y-auto animate-scale-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            JavaScript Widget
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-sm mb-3">Installation Snippet</h3>
              <div className="relative">
                <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg text-xs font-mono overflow-x-auto">
                  {snippet}
                </pre>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={handleCopy}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Add this snippet to your website's <code className="bg-slate-100 px-1 rounded">&lt;head&gt;</code> section.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-sm mb-3">Installed Domains</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm">app.yourcompany.com</span>
                  <Badge className="bg-green-100 text-green-700">Verified</Badge>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">dashboard.yourcompany.com</span>
                  <Badge className="bg-green-100 text-green-700">Verified</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-sm mb-3">Verify Installation</h3>
              <Button variant="outline" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Installation
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

