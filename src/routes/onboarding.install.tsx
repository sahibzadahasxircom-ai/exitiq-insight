import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Copy, ExternalLink, AlertCircle, Zap, Code, CreditCard, Webhook, Globe, RefreshCw, Loader2 } from "lucide-react";
import { IntegrationStatus, Integration, VerificationResult } from "@/lib/integration-types";
import { verifyIntegration, initiateStripeOAuth } from "@/lib/integration-verification";
import { supabase } from "@/integrations/supabase/client";
import { getWidgetScriptUrl, getWebhookUrl } from "@/lib/config";

export const Route = createFileRoute("/onboarding/install")({
  head: () => ({
    meta: [
      { title: "Setup Integration — leaveesy" },
      { name: "description", content: "Configure your leaveesy integration." },
    ],
  }),
  component: Install,
});

function Install() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [currentIntegration, setCurrentIntegration] = useState<Integration | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthInProgress, setOauthInProgress] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    // Get the actual company UUID from the user's profile
    const fetchCompanyId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Get the company ID from the profiles table (which has company_id column)
        const { data: profileData } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.id)
          .single();
        
        if (profileData && profileData.company_id) {
          setCompanyId(profileData.company_id);
        } else {
          console.error("No company_id found in user profile");
        }
      }
    };

    fetchCompanyId();

    const recommended = JSON.parse(localStorage.getItem('recommendedIntegrations') || '[]');
    const index = parseInt(localStorage.getItem('currentIntegrationIndex') || '0');
    
    if (recommended.length === 0 || index >= recommended.length) {
      // All integrations done, go to summary
      navigate({ to: "/onboarding/complete", replace: true });
      return;
    }

    // Convert to Integration type with proper status
    const typedIntegrations: Integration[] = recommended.map((rec: any) => ({
      id: rec.name.toLowerCase().replace(/\s+/g, '-'),
      name: rec.name,
      reason: rec.reason,
      setupTime: rec.setupTime,
      status: rec.status || 'not_connected',
      icon: rec.icon,
      type: getIntegrationType(rec.name)
    }));

    setIntegrations(typedIntegrations);
    setCurrentIndex(index);
    setCurrentIntegration(typedIntegrations[index]);
  }, [navigate]);

  const getIntegrationType = (name: string): "javascript" | "api" | "stripe" | "webhook" => {
    if (name.includes("JavaScript")) return "javascript";
    if (name.includes("API")) return "api";
    if (name.includes("Stripe")) return "stripe";
    if (name.includes("Webhook")) return "webhook";
    return "api";
  };

  const handleVerify = async () => {
    if (!currentIntegration) return;

    setIsVerifying(true);
    setError(null);

    // Update status to waiting
    const updatedIntegrations = [...integrations];
    updatedIntegrations[currentIndex] = { ...updatedIntegrations[currentIndex], status: 'waiting' };
    setIntegrations(updatedIntegrations);
    setCurrentIntegration(updatedIntegrations[currentIndex]);

    try {
      // Call verification function based on integration type
      const result: VerificationResult = await verifyIntegration(
        currentIntegration.type,
        getVerificationConfig(currentIntegration)
      );

      if (result.success) {
        // Update status to connected
        const successIntegrations = [...integrations];
        successIntegrations[currentIndex] = { ...successIntegrations[currentIndex], status: 'connected' };
        setIntegrations(successIntegrations);
        setCurrentIntegration(successIntegrations[currentIndex]);
      } else {
        // Update status to failed
        const failedIntegrations = [...integrations];
        failedIntegrations[currentIndex] = { ...failedIntegrations[currentIndex], status: 'failed' };
        setIntegrations(failedIntegrations);
        setCurrentIntegration(failedIntegrations[currentIndex]);
        setError(result.error || "Verification failed");
      }
    } catch (err) {
      // Update status to failed
      const failedIntegrations = [...integrations];
      failedIntegrations[currentIndex] = { ...failedIntegrations[currentIndex], status: 'failed' };
      setIntegrations(failedIntegrations);
      setCurrentIntegration(failedIntegrations[currentIndex]);
      setError("An unexpected error occurred during verification");
    } finally {
      setIsVerifying(false);
    }
  };

  const getVerificationConfig = (integration: Integration): any => {
    // Return config based on integration type
    // This would be populated with actual data from the UI
    switch (integration.type) {
      case "javascript":
        return { 
          snippet: getJavaScriptSnippet(),
          companyId: companyId || "",
          domain: window.location.hostname,
          apiKey: getAPIKey()
        };
      case "api":
        return { 
          apiKey: getAPIKey(), 
          endpoint: getAPIEndpoint(),
          companyId: companyId || ""
        };
      case "stripe":
        return { 
          oauthCode: "", // Will be populated after OAuth
          companyId: companyId || ""
        };
      case "webhook":
        return { 
          webhookUrl: getWebhookURL(), 
          webhookSecret: getWebhookSecret(),
          companyId: companyId || ""
        };
      default:
        return {};
    }
  };

  const handleStripeOAuth = async () => {
    setOauthInProgress(true);
    setError(null);

    try {
      // Backend automatically resolves company_id from authenticated user's profile
      const result = await initiateStripeOAuth();
      if (result.success && result.authUrl) {
        // Redirect to Stripe OAuth
        window.location.href = result.authUrl;
        
        // Update status to waiting
        const updatedIntegrations = [...integrations];
        updatedIntegrations[currentIndex] = { ...updatedIntegrations[currentIndex], status: 'waiting' };
        setIntegrations(updatedIntegrations);
        setCurrentIntegration(updatedIntegrations[currentIndex]);
      } else {
        setError(result.error || "Failed to initiate Stripe OAuth");
      }
    } catch (err) {
      setError("Failed to initiate Stripe OAuth");
    } finally {
      setOauthInProgress(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    // Reset status to not_connected
    const updatedIntegrations = [...integrations];
    updatedIntegrations[currentIndex] = { ...updatedIntegrations[currentIndex], status: 'not_connected' };
    setIntegrations(updatedIntegrations);
    setCurrentIntegration(updatedIntegrations[currentIndex]);
  };

  const handleContinue = () => {
    // Move to next integration
    const nextIndex = currentIndex + 1;
    if (nextIndex < integrations.length) {
      localStorage.setItem('currentIntegrationIndex', nextIndex.toString());
      localStorage.setItem('recommendedIntegrations', JSON.stringify(integrations));
      setCurrentIndex(nextIndex);
      setCurrentIntegration(integrations[nextIndex]);
    } else {
      // All done, go to summary
      localStorage.setItem('recommendedIntegrations', JSON.stringify(integrations));
      navigate({ to: "/onboarding/complete", replace: true });
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      localStorage.setItem('currentIntegrationIndex', prevIndex.toString());
      localStorage.setItem('recommendedIntegrations', JSON.stringify(integrations));
      setCurrentIndex(prevIndex);
      setCurrentIntegration(integrations[prevIndex]);
    } else {
      navigate({ to: "/onboarding/recommendations", replace: true });
    }
  };

  // Placeholder functions - these would be replaced with real data
  const getJavaScriptSnippet = () => `<script src="${getWidgetScriptUrl(companyId || 'your-company-id')}"></script>`;
  const getAPIKey = () => `eq_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`;
  const getAPIEndpoint = () => `${import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8080')}/api/events`;
  const getWebhookURL = () => getWebhookUrl(companyId || 'your-company-id');
  const getWebhookSecret = () => `whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`;

  if (!currentIntegration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-[700px]">
          <div className="bg-white rounded-3xl shadow-xl p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading integration setup...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-[700px]">
        <div className="bg-white rounded-3xl shadow-xl p-12">
          <div className="mb-8">
            <div className="mb-2 text-sm font-medium text-slate-500">
              Step 6 of 6
            </div>
            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
                6
              </div>
              <div className="flex-1 h-1 bg-slate-200 rounded-full">
                <div className="h-full w-[100%] bg-blue-600 rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-slate-900">
                Setup {currentIntegration.name}
              </h1>
              <div className="text-sm font-medium text-slate-600">
                {currentIndex + 1} of {integrations.length}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {integrations.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    i < currentIndex ? 'bg-green-500' : 
                    i === currentIndex ? 'bg-blue-600' : 
                    'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>

          <IntegrationSetup
            integration={currentIntegration}
            isVerifying={isVerifying}
            error={error}
            onVerify={handleVerify}
            onStripeOAuth={handleStripeOAuth}
            onRetry={handleRetry}
            oauthInProgress={oauthInProgress}
          />

          <div className="flex items-center justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="gap-2 h-12 px-6 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            {currentIntegration?.status === 'connected' ? (
              <Button
                type="button"
                onClick={handleContinue}
                className="gap-2 h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                {currentIndex < integrations.length - 1 ? 'Next Integration' : 'Complete Setup'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : currentIntegration?.status === 'failed' ? (
              <Button
                type="button"
                onClick={handleRetry}
                className="gap-2 h-12 px-8 rounded-xl bg-slate-600 hover:bg-slate-700"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleVerify}
                disabled={isVerifying || currentIntegration?.status === 'waiting'}
                className="gap-2 h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : currentIntegration?.status === 'waiting' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Waiting for verification...
                  </>
                ) : (
                  'Verify Connection'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function IntegrationSetup({ integration, isVerifying, error, onVerify, onStripeOAuth, onRetry, oauthInProgress }: {
  integration: Integration;
  isVerifying: boolean;
  error: string | null;
  onVerify: () => void;
  onStripeOAuth: () => void;
  onRetry: () => void;
  oauthInProgress: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const setupContent = getSetupContent(integration.name, integration.type);

  const getIcon = (name: string) => {
    switch (name) {
      case "JavaScript Widget": return <Zap className="h-6 w-6" />;
      case "REST API": return <Code className="h-6 w-6" />;
      case "Stripe": return <CreditCard className="h-6 w-6" />;
      case "Webhooks": return <Webhook className="h-6 w-6" />;
      default: return <Globe className="h-6 w-6" />;
    }
  };

  const getStatusBadge = (status: IntegrationStatus) => {
    switch (status) {
      case "not_connected":
        return (
          <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-medium rounded-full">
            Not Connected
          </span>
        );
      case "waiting":
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            Waiting for Verification
          </span>
        );
      case "connected":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full flex items-center gap-2">
            <CheckCircle2 className="h-3 w-3" />
            Connected
          </span>
        );
      case "failed":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full flex items-center gap-2">
            <AlertCircle className="h-3 w-3" />
            Failed
          </span>
        );
    }
  };

  if (integration.status === 'connected') {
    return (
      <div className="p-8 rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500 text-white shadow-lg">
            <CheckCircle2 className="h-10 w-10" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-green-900 mb-2">
          {integration.name} Connected
        </h2>
        <p className="text-green-700">
          Your {integration.name} integration has been successfully configured.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-sm">
      <div className="flex items-start gap-4 mb-8 p-4 bg-white rounded-xl border border-slate-200">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
          {getIcon(integration.name)}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-slate-900">{integration.name}</h3>
            {getStatusBadge(integration.status)}
          </div>
          <p className="text-slate-600">{integration.reason}</p>
          <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
            <Clock className="h-4 w-4" />
            <span>Est. {integration.setupTime}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-red-900">Connection Failed</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {integration.status === 'waiting' && (
        <div className="mb-6 p-4 rounded-xl bg-yellow-50 border border-yellow-200 flex items-start gap-3">
          <Loader2 className="h-5 w-5 text-yellow-600 mt-0.5 animate-spin" />
          <div className="flex-1">
            <p className="font-medium text-yellow-900">Waiting for Verification</p>
            <p className="text-sm text-yellow-700">
              {integration.type === 'stripe' 
                ? 'Please complete the Stripe OAuth authorization in the opened window.'
                : 'Please complete the installation steps and then verify your connection.'}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {setupContent.map((step, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold shadow-md">
                {index + 1}
              </div>
              {index < setupContent.length - 1 && (
                <div className="w-px h-full bg-slate-200 my-2" />
              )}
            </div>
            <div className="flex-1 pb-6">
              <p className="font-semibold text-slate-900 mb-2 text-lg">{step.title}</p>
              <p className="text-sm text-slate-600 mb-4">{step.description}</p>
              {step.code && (
                <div className="bg-slate-900 rounded-xl p-4 relative mb-4">
                  <pre className="text-sm text-slate-100 overflow-x-auto font-mono">
                    <code>{step.code}</code>
                  </pre>
                  <button
                    onClick={() => handleCopy(step.code!)}
                    className="absolute top-3 right-3 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 hover:text-white transition"
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              )}
              {"link" in step && "linkText" in step && step.link && step.linkText && (
                <a
                  href={step.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
                >
                  {step.linkText}
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              {step.button && step.buttonType === 'oauth' && (
                <Button
                  onClick={onStripeOAuth}
                  disabled={oauthInProgress || isVerifying}
                  className="mt-3 h-12 rounded-xl bg-purple-600 hover:bg-purple-700"
                >
                  {oauthInProgress ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Opening OAuth...
                    </>
                  ) : (
                    step.buttonText
                  )}
                </Button>
              )}
              {step.button && step.buttonType === 'verify' && (
                <Button
                  onClick={onVerify}
                  disabled={isVerifying || integration.status === 'waiting'}
                  className="mt-3 h-12 rounded-xl bg-blue-600 hover:bg-blue-700"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : (
                    step.buttonText
                  )}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getSetupContent(name: string, type: "javascript" | "api" | "stripe" | "webhook") {
  switch (name) {
    case "JavaScript Widget":
      return [
        {
          title: "Copy the JavaScript snippet",
          description: "Copy this code snippet and paste it before the closing </body> tag of your website.",
          code: `<script src="https://cdn.leaveesy.com/widget.js" data-api-key="eq_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"></script>`,
        },
        {
          title: "Install the snippet",
          description: "Paste the code in your HTML before the closing </body> tag or use your tag manager.",
        },
        {
          title: "Configure trigger elements",
          description: "Add data-leaveesy-trigger attributes to your cancellation buttons.",
          code: `<button data-leaveesy-trigger="cancel">Cancel Subscription</button>`,
        },
        {
          title: "Verify Installation",
          description: "After installing the snippet, click verify to confirm leaveesy can detect it on your website.",
          button: true,
          buttonText: "Verify Installation",
          buttonType: "verify" as const,
        },
      ];
    case "REST API":
      return [
        {
          title: "Your API Key",
          description: "Your unique API key for authenticating requests to leaveesy.",
          code: `eq_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`,
        },
        {
          title: "API Endpoint",
          description: "Use this endpoint to send cancellation events to leaveesy.",
          code: `https://api.leaveesy.com/v1/events`,
        },
        {
          title: "View Documentation",
          description: "Learn how to integrate the API into your application.",
          link: "https://docs.leaveesy.com/api",
          linkText: "View API Documentation",
        },
        {
          title: "Verify Connection",
          description: "Test your API key and connection to leaveesy.",
          button: true,
          buttonText: "Verify Connection",
          buttonType: "verify" as const,
        },
      ];
    case "Stripe":
      return [
        {
          title: "Connect with Stripe",
          description: "Authorize leaveesy to access your Stripe account and webhook events.",
          button: true,
          buttonText: "Connect Stripe",
          buttonType: "oauth" as const,
        },
        {
          title: "Waiting for Authorization",
          description: "Complete the Stripe OAuth authorization in the opened window.",
        },
        {
          title: "Verify Connection",
          description: "After authorization, verify that leaveesy can receive Stripe webhook events.",
          button: true,
          buttonText: "Verify Connection",
          buttonType: "verify" as const,
        },
      ];
    case "Webhooks":
      return [
        {
          title: "Your Webhook URL",
          description: "Use this URL to send cancellation events to leaveesy.",
          code: `https://api.leaveesy.com/webhooks/YOUR_WEBHOOK_SECRET`,
        },
        {
          title: "Your Webhook Secret",
          description: "Use this secret to verify webhook signatures.",
          code: `whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`,
        },
        {
          title: "Configure in your billing system",
          description: "Add the webhook URL to your billing platform settings.",
        },
        {
          title: "Send Test Webhook",
          description: "Send a test event to verify your webhook endpoint is working.",
          button: true,
          buttonText: "Send Test Webhook",
          buttonType: "verify" as const,
        },
        {
          title: "Verify Webhook",
          description: "Confirm that leaveesy is receiving webhooks from your billing system.",
          button: true,
          buttonText: "Verify Webhook",
          buttonType: "verify" as const,
        },
      ];
    default:
      return [
        {
          title: "Get your API credentials",
          description: "Generate credentials from your leaveesy dashboard.",
        },
        {
          title: "Configure the integration",
          description: "Follow the integration-specific setup instructions.",
        },
        {
          title: "Test the connection",
          description: "Verify the integration is working correctly.",
          button: true,
          buttonText: "Verify Connection",
          buttonType: "verify" as const,
        },
      ];
  }
}

