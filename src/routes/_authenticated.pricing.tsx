import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { Check, ArrowRight, Zap, Shield, MessageSquare, BarChart3, Globe, Zap as ZapIcon, Mail, Lock, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPricingPlans, getCompanySubscription, getPaddleConfig, getPaddleCustomerId, createPaddleCustomer } from "@/lib/pricing.functions";

export const Route = createFileRoute("/_authenticated/pricing")({
  head: () => ({ meta: [{ title: "Pricing — leaveesy" }] }),
  component: PricingPage,
});

function PricingPage() {
  const [prices, setPrices] = useState<any[]>([]);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);

  const getPlansFn = useServerFn(getPricingPlans);
  const getSubscriptionFn = useServerFn(getCompanySubscription);
  const getPaddleConfigFn = useServerFn(getPaddleConfig);
  const getPaddleCustomerIdFn = useServerFn(getPaddleCustomerId);
  const createPaddleCustomerFn = useServerFn(createPaddleCustomer);

  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["pricing-plans"],
    queryFn: () => getPlansFn({ data: undefined }),
  });

  const { data: subscription } = useQuery({
    queryKey: ["company-subscription"],
    queryFn: () => getSubscriptionFn({ data: undefined }),
  });

  const { data: paddleConfig } = useQuery({
    queryKey: ["paddle-config"],
    queryFn: () => getPaddleConfigFn({ data: undefined }),
  });

  const { data: paddleCustomerIdData } = useQuery({
    queryKey: ["paddle-customer-id"],
    queryFn: () => getPaddleCustomerIdFn({ data: undefined }),
  });

  const currentPlanId = subscription?.plan_id;

  // Initialize Paddle SDK and fetch prices
  useEffect(() => {
    if (!paddleConfig?.token || !plans.length) return;

    const initializePaddle = async () => {
      try {
        // Load Paddle SDK dynamically
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });

        // @ts-ignore - Paddle SDK types not available
        if (window.Paddle) {
          window.Paddle.Initialize({
            token: paddleConfig.token,
            environment: paddleConfig.environment,
          });

          // Fetch prices for all plans (monthly only)
          const priceIds = plans
            .filter((p: any) => !p.is_custom)
            .map((p: any) => ({
              name: p.name,
              slug: p.slug,
              monthPriceId: p.monthly_price_id || '',
            }));

          setIsLoadingPrices(true);
          const pricePromises = priceIds.map(async (priceItem) => {
            try {
              // @ts-ignore
              const priceData = await window.Paddle.PricePreview({
                items: [{ priceId: priceItem.monthPriceId, quantity: 1 }],
              });
              return {
                ...priceItem,
                priceData,
              };
            } catch (error) {
              console.error(`Failed to fetch price for ${priceItem.name}:`, error);
              return null;
            }
          });

          const results = await Promise.all(pricePromises);
          setPrices(results.filter(r => r !== null));
          setIsLoadingPrices(false);
        }
      } catch (error) {
        console.error('Failed to initialize Paddle:', error);
      }
    };

    initializePaddle();
  }, [paddleConfig, plans]);

  const handleSubscribe = async (plan: any) => {
    try {
      console.log('Subscribe clicked for plan:', plan.name);
      console.log('Plan monthly_price_id:', plan.monthly_price_id);
      
      // Get or create Paddle customer
      let customerId = paddleCustomerIdData?.paddleCustomerId;
      
      if (!customerId) {
        console.log('Creating Paddle customer...');
        const result = await createPaddleCustomerFn();

        if (result.success) {
          customerId = result.customerId;
          console.log('Paddle customer created:', customerId);
        } else {
          console.error('Failed to create Paddle customer:', result.error);
        }
      }

      if (!customerId) {
        alert('Failed to create customer. Please try again.');
        return;
      }

      // Get the monthly price ID
      const priceId = plan.monthly_price_id;

      if (!priceId) {
        alert('Price ID not configured for this plan. Please contact support.');
        return;
      }

      console.log('Opening Paddle checkout with priceId:', priceId);
      
      // Check if Paddle is loaded
      // @ts-ignore
      if (!window.Paddle) {
        alert('Paddle SDK not loaded. Please refresh the page.');
        return;
      }

      // @ts-ignore
      window.Paddle.Checkout.open({
        settings: {
          displayMode: 'overlay',
          variant: 'one-page',
          theme: 'light',
          successUrl: `${window.location.origin}/welcome`,
        },
        customer: {
          email: customerId,
        },
        items: [{ priceId, quantity: 1 }],
      });
    } catch (error) {
      console.error('Failed to open checkout:', error);
      alert('Failed to open checkout. Please try again.');
    }
  };

  if (plansLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Simple, transparent pricing
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Choose the perfect plan for your business needs
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan: any) => {
            const features = Array.isArray(plan.features) ? plan.features : [];
            const isCurrentPlan = currentPlanId === plan.id;
            const isPopular = plan.slug === "starter" || plan.slug === "pro";
            const planPrice = prices.find((p: any) => p.slug === plan.slug);

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border ${
                  isPopular
                    ? "border-blue-500 shadow-xl shadow-blue-500/10"
                    : "border-slate-200"
                } bg-white p-8 flex flex-col ${
                  isCurrentPlan ? "ring-2 ring-blue-500" : ""
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-600 hover:bg-blue-700">Popular</Badge>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-green-600 hover:bg-green-700">Current Plan</Badge>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-slate-900">{plan.name}</h3>
                  <p className="mt-2 text-sm text-slate-600">{plan.description}</p>
                </div>

                <div className="mb-6">
                  {plan.is_custom ? (
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-slate-900">Custom</span>
                    </div>
                  ) : isLoadingPrices ? (
                    <div className="flex items-center gap-2 text-slate-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400"></div>
                      Loading...
                    </div>
                  ) : planPrice?.priceData ? (
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-slate-900">
                        {planPrice.priceData.formattedTotals.total}
                      </span>
                      <span className="ml-2 text-slate-600">/month</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-slate-900">
                        ${plan.price_monthly}
                      </span>
                      <span className="ml-2 text-slate-600">/month</span>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <p className="text-sm text-slate-600">
                    {plan.monthly_interview_limit === null
                      ? "Unlimited interviews"
                      : `${plan.monthly_interview_limit} interviews per month`}
                  </p>
                </div>

                <div className="flex-1 mb-6">
                  <ul className="space-y-3">
                    {features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.is_custom ? (
                  <Button className="w-full" variant="outline" asChild>
                    <Link to="mailto:sales@leaveesy.com">Contact Sales</Link>
                  </Button>
                ) : isCurrentPlan ? (
                  <Button className="w-full" variant="outline" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={() => handleSubscribe(plan)}
                    disabled={!plan.monthly_price_id}
                  >
                    Subscribe
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-20">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
          Compare all features
        </h2>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  Feature
                </th>
                {plans.map((plan: any) => (
                  <th
                    key={plan.id}
                    className="px-6 py-4 text-center text-sm font-semibold text-slate-900"
                  >
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="px-6 py-4 text-sm text-slate-700">Monthly interviews</td>
                {plans.map((plan: any) => (
                  <td key={plan.id} className="px-6 py-4 text-center text-sm text-slate-900">
                    {plan.monthly_interview_limit === null
                      ? "Unlimited"
                      : plan.monthly_interview_limit}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-slate-700">Full access to all features</td>
                {plans.map((plan: any) => (
                  <td key={plan.id} className="px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-600 mx-auto" />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-slate-700">Basic analytics</td>
                {plans.map((plan: any) => (
                  <td key={plan.id} className="px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-600 mx-auto" />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-slate-700">Advanced analytics</td>
                {plans.map((plan: any) => (
                  <td key={plan.id} className="px-6 py-4 text-center">
                    {plan.slug === "free" ? (
                      <span className="text-slate-400">—</span>
                    ) : (
                      <Check className="h-5 w-5 text-green-600 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-slate-700">Email support</td>
                {plans.map((plan: any) => (
                  <td key={plan.id} className="px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-600 mx-auto" />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-slate-700">Priority support</td>
                {plans.map((plan: any) => (
                  <td key={plan.id} className="px-6 py-4 text-center">
                    {plan.slug === "free" ? (
                      <span className="text-slate-400">—</span>
                    ) : (
                      <Check className="h-5 w-5 text-green-600 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-slate-700">Custom branding</td>
                {plans.map((plan: any) => (
                  <td key={plan.id} className="px-6 py-4 text-center">
                    {plan.slug === "free" ? (
                      <span className="text-slate-400">—</span>
                    ) : (
                      <Check className="h-5 w-5 text-green-600 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-slate-700">API access</td>
                {plans.map((plan: any) => (
                  <td key={plan.id} className="px-6 py-4 text-center">
                    {plan.slug === "pro" || plan.slug === "custom" ? (
                      <Check className="h-5 w-5 text-green-600 mx-auto" />
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-slate-700">Webhook integrations</td>
                {plans.map((plan: any) => (
                  <td key={plan.id} className="px-6 py-4 text-center">
                    {plan.slug === "pro" || plan.slug === "custom" ? (
                      <Check className="h-5 w-5 text-green-600 mx-auto" />
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-slate-700">Custom integrations</td>
                {plans.map((plan: any) => (
                  <td key={plan.id} className="px-6 py-4 text-center">
                    {plan.slug === "custom" ? (
                      <Check className="h-5 w-5 text-green-600 mx-auto" />
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-slate-700">SLA guarantee</td>
                {plans.map((plan: any) => (
                  <td key={plan.id} className="px-6 py-4 text-center">
                    {plan.slug === "custom" ? (
                      <Check className="h-5 w-5 text-green-600 mx-auto" />
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 mt-20">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
          Frequently asked questions
        </h2>
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Can I change plans at any time?
            </h3>
            <p className="text-slate-600">
              Yes, you can upgrade or downgrade your plan at any time. When you upgrade,
              you'll be charged the prorated difference. When you downgrade, you'll receive
              credit toward future billing.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              What happens if I exceed my interview limit?
            </h3>
            <p className="text-slate-600">
              You'll receive a notification when you're approaching your limit. If you exceed
              it, you can either upgrade your plan or wait until the next billing cycle.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Do you offer refunds?
            </h3>
            <p className="text-slate-600">
              Yes, we offer a 14-day money-back guarantee. If you're not satisfied with
              leaveesy, contact us within 14 days for a full refund.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Is there a free trial?
            </h3>
            <p className="text-slate-600">
              Yes, our Free plan allows you to try leaveesy with 5 interviews per month at
              no cost. You can upgrade to a paid plan whenever you're ready.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
