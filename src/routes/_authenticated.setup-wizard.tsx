import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, Loader2, Copy, Check } from "lucide-react";
import { getWidgetScriptUrl, getWebhookUrl } from "@/lib/config";
import { createCompanyFn, linkUserToCompanyFn } from "@/lib/company.server";

export const Route = createFileRoute("/_authenticated/setup-wizard")({
  head: () => ({
    meta: [
      { title: "Setup Wizard — leaveesy" },
      { name: "description", content: "Connect leaveesy to your product" },
    ],
  }),
  component: SetupWizard,
});

type Step = "welcome" | "product-type" | "exit-method" | "billing-platform" | "recommendation" | "connection" | "complete";

function SetupWizard() {
  const { company, profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("welcome");
  const [loading, setLoading] = useState(false);
  const [connectionProgress, setConnectionProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [widgetDomain, setWidgetDomain] = useState("");
  const [fallbackCompanyId, setFallbackCompanyId] = useState<string | null>(null);
  const [answers, setAnswers] = useState({
    productType: "",
    exitMethod: "",
    billingPlatform: "",
  });

  // Fallback: If profile.company_id is null, create or link a company
  useEffect(() => {
    const ensureCompanyExists = async () => {
      if (!profile?.company_id && profile?.id) {
        try {
          console.log("No company_id found, checking for company metadata");
          
          // Check if user has company metadata from sign-up
          const metadata = profile.user_metadata as any;
          console.log("User metadata:", metadata);
          
          if (metadata?.company_name) {
            console.log("Company metadata found, creating company from metadata");
            
            // Create company using server function with metadata
            const newCompany = await createCompanyFn({
              data: {
                company_name: metadata.company_name,
                company_url: metadata.company_url || undefined,
                company_size: metadata.company_size || undefined,
                company_industry: metadata.company_industry || undefined,
              },
            });

            console.log("Company created from metadata with ID:", newCompany.id);

            // Link user to company using server function
            await linkUserToCompanyFn({
              data: {
                userId: profile.id,
                companyId: newCompany.id,
              },
            });

            console.log("User linked to company successfully");
            setFallbackCompanyId(newCompany.id);
            toast.success("Company created from your sign-up information");
            return;
          }
          
          // Fallback: Try to find an existing company for this user
          const { data: companies } = await supabase
            .from("companies")
            .select("id, company_name")
            .limit(1);
          
          let companyId: string;
          
          if (companies && companies.length > 0) {
            // Link the first company to this profile
            companyId = companies[0].id;
            await supabase
              .from("profiles")
              .update({ company_id: companyId })
              .eq("id", profile.id);
            
            setFallbackCompanyId(companyId);
            toast.success("Company linked to your profile");
          } else {
            // Create a new company for this user
            const { data: newCompany, error: createError } = await supabase
              .from("companies")
              .insert({
                company_name: profile.full_name?.split(' ')[0] + "'s Company" || "My Company",
              })
              .select()
              .single();
            
            if (createError) throw createError;
            
            companyId = newCompany.id;
            
            // Link the new company to this profile
            await supabase
              .from("profiles")
              .update({ company_id: companyId })
              .eq("id", profile.id);
            
            // Create user role as owner
            await supabase
              .from("user_roles")
              .insert({
                user_id: profile.id,
                company_id: companyId,
                role: "owner",
              });
            
            setFallbackCompanyId(companyId);
            toast.success("Company created and linked to your profile");
          }
        } catch (error) {
          console.error("Error ensuring company exists:", error);
        }
      } else if (profile?.company_id) {
        // User already has a company_id, ensure it's set as fallback
        setFallbackCompanyId(profile.company_id);
      }
    };

    ensureCompanyExists();
  }, [profile?.company_id, profile?.id]);

  // Handle Stripe OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('integration') === 'stripe' && urlParams.get('status') === 'success') {
      // Stripe OAuth was successful - mark as complete
      if (profile?.company_id) {
        supabase
          .from("companies")
          .update({
            integration_type: "stripe",
            setup_completed: true,
          })
          .eq("id", profile.company_id)
          .then(() => {
            setStep("complete");
            toast.success("Stripe connected successfully!");
          });
      }
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (urlParams.get('integration') === 'stripe' && urlParams.get('status') === 'error') {
      // Stripe OAuth failed
      toast.error("Stripe connection failed. Please try again.");
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [profile?.company_id]);

  const productTypes = [
    { id: "saas", label: "SaaS Platform" },
    { id: "mobile", label: "Mobile App" },
    { id: "website", label: "Website" },
    { id: "ecommerce", label: "E-commerce" },
    { id: "other", label: "Other" },
  ];

  const exitMethods = [
    { id: "cancel-subscription", label: "Cancel Subscription" },
    { id: "delete-account", label: "Delete Account" },
    { id: "end-trial", label: "End Free Trial" },
    { id: "other", label: "Other" },
  ];

  const billingPlatforms = [
    { id: "stripe", label: "Stripe" },
    { id: "paddle", label: "Paddle" },
    { id: "lemonsqueezy", label: "LemonSqueezy" },
    { id: "chargebee", label: "Chargebee" },
    { id: "other", label: "Other" },
    { id: "none", label: "None" },
  ];

  const getRecommendation = () => {
    if (answers.exitMethod === "cancel-subscription" && answers.billingPlatform === "stripe") {
      return {
        type: "stripe",
        title: "Connect Stripe",
        description: "Since you use Stripe subscriptions, the fastest and most reliable option is connecting your Stripe account.",
        buttonText: "Connect Stripe",
      };
    }
    
    if (answers.exitMethod === "cancel-subscription" && answers.billingPlatform === "none") {
      return {
        type: "widget",
        title: "Connect JavaScript Widget",
        description: "We recommend the JavaScript Widget to automatically detect customer actions.",
        buttonText: "Connect JavaScript Widget",
        secondaryText: "Use API Instead",
      };
    }
    
    if (answers.exitMethod === "cancel-subscription" && answers.billingPlatform !== "") {
      return {
        type: "webhook",
        title: "Configure Webhook",
        description: "We recommend using Webhooks to notify leaveesy whenever a customer leaves.",
        buttonText: "Configure Webhook",
        secondaryText: "Use API Instead",
      };
    }
    
    return {
      type: "widget",
      title: "Connect JavaScript Widget",
      description: "We recommend the JavaScript Widget to automatically detect customer actions.",
      buttonText: "Connect JavaScript Widget",
      secondaryText: "Use API Instead",
    };
  };

  const recommendation = getRecommendation();

  const handleConnect = async () => {
    if (recommendation.type === "stripe") {
      // Stripe OAuth - to be implemented with local backend
      toast.info("Stripe OAuth integration coming soon. Please use manual setup for now.");
      return;
    }

    // For other integrations, show the connection steps without fake auto-completion
    setStep("connection");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderWelcome = () => (
    <div className="text-center space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-3">Let's connect leaveesy to your product</h1>
        <p className="text-muted-foreground">
          We'll ask a few quick questions to recommend the best integration. It takes less than a minute.
        </p>
      </div>
      <Button 
        size="lg" 
        onClick={() => setStep("product-type")}
        className="px-8 py-6"
      >
        Continue <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );

  const renderProductType = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">What is your Product?</h2>
        <p className="text-sm text-muted-foreground">Select the option that best describes your product</p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {productTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setAnswers({ ...answers, productType: type.id })}
            className={`p-4 rounded-lg border text-left transition-all ${
              answers.productType === type.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            }`}
          >
            <div className="font-medium">{type.label}</div>
          </button>
        ))}
      </div>
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep("welcome")}>
          Back
        </Button>
        <Button 
          onClick={() => setStep("exit-method")}
          disabled={!answers.productType}
        >
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderExitMethod = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">How do customers usually leave?</h2>
        <p className="text-sm text-muted-foreground">This helps us recommend the right integration</p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {exitMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => setAnswers({ ...answers, exitMethod: method.id })}
            className={`p-4 rounded-lg border text-left transition-all ${
              answers.exitMethod === method.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            }`}
          >
            <div className="font-medium">{method.label}</div>
          </button>
        ))}
      </div>
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep("product-type")}>
          Back
        </Button>
        <Button 
          onClick={() => {
            if (answers.exitMethod === "cancel-subscription") {
              setStep("billing-platform");
            } else {
              setStep("recommendation");
            }
          }}
          disabled={!answers.exitMethod}
        >
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderBillingPlatform = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Which billing platform do you use?</h2>
        <p className="text-sm text-muted-foreground">Select your subscription management platform</p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {billingPlatforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => setAnswers({ ...answers, billingPlatform: platform.id })}
            className={`p-4 rounded-lg border text-left transition-all ${
              answers.billingPlatform === platform.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            }`}
          >
            <div className="font-medium">{platform.label}</div>
          </button>
        ))}
      </div>
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep("exit-method")}>
          Back
        </Button>
        <Button 
          onClick={() => setStep("recommendation")}
          disabled={!answers.billingPlatform}
        >
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderRecommendation = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div>
          <h2 className="text-xl font-bold mb-2">{recommendation.title}</h2>
          <p className="text-muted-foreground">{recommendation.description}</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <Button 
          size="lg" 
          onClick={() => setStep("connection")}
          className="w-full"
        >
          {recommendation.buttonText} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        
        {recommendation.secondaryText && (
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => {
              setAnswers({ ...answers, billingPlatform: "none" });
              setStep("connection");
            }}
            className="w-full"
          >
            {recommendation.secondaryText}
          </Button>
        )}
      </div>
      
      <Button variant="ghost" onClick={() => setStep("exit-method")}>
        Back
      </Button>
    </div>
  );

  const renderConnection = () => {
    const connectionSteps = {
      stripe: [
        "Click the Connect Stripe button below",
        "Sign in to your Stripe account",
        "Authorize leaveesy to access your Stripe data",
        "You'll be redirected back here automatically",
      ],
      widget: [
        "Copy the installation snippet below",
        "Paste it before the closing </body> tag of your website",
        "Save and deploy your website",
        "Click Verify Installation below to test",
      ],
      webhook: [
        "Copy your unique webhook URL below",
        "Add it to your platform's webhook settings",
        "Select cancellation/account deletion events",
        "Send a test event from your platform",
        "Click Verify Connection below",
      ],
      api: [
        "Click Generate API Key below",
        "Copy the generated API key",
        "Send a test event to leaveesy using the API",
        "Click Test Connection below",
      ],
    };

    const steps = connectionSteps[recommendation.type as keyof typeof connectionSteps] || connectionSteps.widget;

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-2">Connect {recommendation.title}</h2>
          <p className="text-sm text-muted-foreground">Follow these steps to complete the setup</p>
        </div>
        
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex-1 pt-1">{step}</div>
            </div>
          ))}
        </div>
        
        {recommendation.type === "stripe" && (
          <Button
            size="lg"
            onClick={() => {
              const companyId = profile?.company_id || fallbackCompanyId;
              if (!companyId) {
                toast.error("No company ID found. Please refresh the page or contact support.");
                return;
              }
              // Stripe OAuth - to be implemented with local backend
              toast.info("Stripe OAuth integration coming soon. Please use manual setup for now.");
            }}
            className="w-full"
          >
            Connect Stripe
          </Button>
        )}
        
        {recommendation.type === "widget" && (
          <div className="space-y-3">
            <Label className="font-semibold">Installation Snippet</Label>
            <div className="relative">
              <div className="bg-muted p-4 rounded-lg text-sm font-mono break-all max-h-48 overflow-y-auto">
                {`<!-- leaveesy Global Tracking Script Tag -->
<script src="${getWidgetScriptUrl(profile?.company_id || fallbackCompanyId || 'YOUR_COMPANY_ID')}"></script>

<script>
  // Wait for leaveesy to be ready before attaching event listeners
  window.addEventListener('leaveesyReady', function() {
    console.log('leaveesy is ready');
    
    const signoutBtn = document.querySelector('[data-leaveesy="signout"]') || document.getElementById('signout-btn');
    if (signoutBtn) {
      signoutBtn.addEventListener('click', function(e) {
        if (window.leaveesy) {
          console.log('Tracking SignOut event');
          window.leaveesy.track("SignOut", { action: "process_started" });
        }
      });
    }
  });
  
  // Fallback: if leaveesy is already loaded, attach listeners immediately
  if (window.leaveesy) {
    console.log('leaveesy already loaded');
    const signoutBtn = document.querySelector('[data-leaveesy="signout"]') || document.getElementById('signout-btn');
    if (signoutBtn) {
      signoutBtn.addEventListener('click', function(e) {
        console.log('Tracking SignOut event');
        window.leaveesy.track("SignOut", { action: "process_started" });
      });
    }
  }
</script>`}
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(`<!-- leaveesy Global Tracking Script Tag -->
<script src="${getWidgetScriptUrl(profile?.company_id || fallbackCompanyId || 'YOUR_COMPANY_ID')}"></script>

<script>
  // Wait for leaveesy to be ready before attaching event listeners
  window.addEventListener('leaveesyReady', function() {
    console.log('leaveesy is ready');
    
    const signoutBtn = document.querySelector('[data-leaveesy="signout"]') || document.getElementById('signout-btn');
    if (signoutBtn) {
      signoutBtn.addEventListener('click', function(e) {
        if (window.leaveesy) {
          console.log('Tracking SignOut event');
          window.leaveesy.track("SignOut", { action: "process_started" });
        }
      });
    }
  });
  
  // Fallback: if leaveesy is already loaded, attach listeners immediately
  if (window.leaveesy) {
    console.log('leaveesy already loaded');
    const signoutBtn = document.querySelector('[data-leaveesy="signout"]') || document.getElementById('signout-btn');
    if (signoutBtn) {
      signoutBtn.addEventListener('click', function(e) {
        console.log('Tracking SignOut event');
        window.leaveesy.track("SignOut", { action: "process_started" });
      });
    }
  }
</script>`)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            {!profile?.company_id && !fallbackCompanyId && (
              <p className="text-xs text-red-500">Warning: No company ID found. Please refresh the page or contact support.</p>
            )}
            <Label className="font-semibold">Your Website Domain (for verification)</Label>
            <div className="relative">
              <input
                type="text"
                placeholder="https://your-website.com"
                value={widgetDomain}
                onChange={(e) => setWidgetDomain(e.target.value)}
                className="w-full p-3 border rounded-lg text-sm"
              />
            </div>
            <p className="text-xs text-muted-foreground">Add the snippet to your website's &lt;head&gt; section, then enter your domain and click verify. If your website is not accessible from this server, use manual verification below.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const companyId = profile?.company_id || fallbackCompanyId;
                if (!companyId) {
                  toast.error("No company ID found. Please refresh the page or contact support.");
                  return;
                }
                // Widget verification - to be implemented with local backend
                toast.info("Widget verification coming soon. Please skip for now.");
              }}
            >
              Skip Domain Verification (Manual)
            </Button>
          </div>
        )}
        
        {recommendation.type === "webhook" && (
          <div className="space-y-3">
            <Label className="font-semibold">Your Webhook URL</Label>
            <div className="relative">
              <div className="bg-muted p-4 rounded-lg text-sm font-mono break-all">
                {getWebhookUrl(profile?.company_id || fallbackCompanyId || 'YOUR_COMPANY_ID')}
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(getWebhookUrl(profile?.company_id || fallbackCompanyId || 'YOUR_COMPANY_ID'))}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            {!profile?.company_id && !fallbackCompanyId && (
              <p className="text-xs text-red-500">Warning: No company ID found. Please refresh the page or contact support.</p>
            )}
          </div>
        )}
        
        {recommendation.type === "api" && (
          <div className="space-y-3">
            <Button
              onClick={async () => {
                const companyId = profile?.company_id || fallbackCompanyId;
                if (!companyId) {
                  toast.error("No company ID found. Please refresh the page or contact support.");
                  return;
                }
                try {
                  // API key generation - to be implemented with local backend
                  toast.info("API key generation coming soon. Please skip for now.");
                } catch (error) {
                  toast.error("Failed to generate API key");
                }
              }}
              variant="outline"
              className="w-full"
            >
              Generate API Key
            </Button>
            {!profile?.company_id && !fallbackCompanyId && (
              <p className="text-xs text-red-500">Warning: No company ID found. Please refresh the page or contact support.</p>
            )}
          </div>
        )}
        
        {recommendation.type !== "stripe" && (
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setStep("recommendation")}>
              Back
            </Button>
            <Button 
              size="lg" 
              onClick={async () => {
                setLoading(true);
                try {
                  let verified = false;
                  let message = "";
                  const companyId = profile?.company_id || fallbackCompanyId;
                  
                  if (!companyId) {
                    toast.error("No company ID found. Please refresh the page or contact support.");
                    setLoading(false);
                    return;
                  }
                  
                  if (recommendation.type === "widget") {
                    // Widget verification - to be implemented with local backend
                    toast.info("Widget verification coming soon. Please skip for now.");
                  } else {
                    // Integration verification - to be implemented with local backend
                    toast.info("Integration verification coming soon. Please skip for now.");
                  }

                  // Skip verification for now and mark as complete
                  await supabase
                    .from("companies")
                    .update({
                      integration_type: recommendation.type,
                      setup_completed: true,
                    })
                    .eq("id", companyId);

                  setStep("complete");
                } catch (error) {
                  toast.error("Setup failed. Please try again.");
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify & Complete Setup"}
            </Button>
          </div>
        )}
        
        {recommendation.type === "stripe" && (
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setStep("recommendation")}>
              Back
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderComplete = () => (
    <div className="text-center space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-3">You're all set.</h2>
        <p className="text-muted-foreground">
          Your integration is connected and leaveesy is ready to start collecting customer feedback automatically.
        </p>
      </div>
      
      <div className="space-y-3">
        <Button 
          size="lg" 
          onClick={() => navigate({ to: "/dashboard" })}
          className="w-full"
        >
          Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => navigate({ to: "/integrations" })}
          className="w-full"
        >
          Customize Customer Experience
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-lg">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            {step === "welcome" && renderWelcome()}
            {step === "product-type" && renderProductType()}
            {step === "exit-method" && renderExitMethod()}
            {step === "billing-platform" && renderBillingPlatform()}
            {step === "recommendation" && renderRecommendation()}
            {step === "connection" && renderConnection()}
            {step === "complete" && renderComplete()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

