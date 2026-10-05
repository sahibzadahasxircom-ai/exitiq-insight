-- Create pricing_plans table
CREATE TABLE IF NOT EXISTS public.pricing_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  monthly_interview_limit INTEGER DEFAULT 5,
  price_monthly DECIMAL(10, 2) DEFAULT 0,
  price_yearly DECIMAL(10, 2),
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  is_custom BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create company_subscriptions table
CREATE TABLE IF NOT EXISTS public.company_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.pricing_plans(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id)
);

-- Create usage_records table
CREATE TABLE IF NOT EXISTS public.usage_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.company_subscriptions(id) ON DELETE SET NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  interviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, period_start, period_end)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_company_subscriptions_company_id ON public.company_subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_company_subscriptions_plan_id ON public.company_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_company_id ON public.usage_records(company_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_period ON public.usage_records(period_start, period_end);

-- Enable RLS
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;

-- RLS policies for pricing_plans (read-only for public)
CREATE POLICY "Public can view pricing plans" ON public.pricing_plans
  FOR SELECT USING (true);

-- RLS policies for company_subscriptions
CREATE POLICY "Users can view own company subscription" ON public.company_subscriptions
  FOR SELECT USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage subscriptions" ON public.company_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- RLS policies for usage_records
CREATE POLICY "Users can view own company usage" ON public.usage_records
  FOR SELECT USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage usage records" ON public.usage_records
  FOR ALL USING (auth.role() = 'service_role');

-- Insert default pricing plans
INSERT INTO public.pricing_plans (name, slug, description, monthly_interview_limit, price_monthly, price_yearly, features, is_custom, sort_order) VALUES
(
  'Free',
  'free',
  'Perfect for getting started with leaveesy',
  5,
  0,
  0,
  '["5 interviews per month", "Full access to all features", "Basic analytics", "Email support"]'::jsonb,
  false,
  1
),
(
  'Starter',
  'starter',
  'For growing teams that need more insights',
  75,
  27,
  270,
  '["75 interviews per month", "Full access to all features", "Advanced analytics", "Priority email support", "Custom branding"]'::jsonb,
  false,
  2
),
(
  'Pro',
  'pro',
  'For businesses with high volume needs',
  250,
  97,
  970,
  '["250 interviews per month", "Full access to all features", "Advanced analytics & insights", "Priority support", "Custom branding", "API access", "Webhook integrations"]'::jsonb,
  false,
  3
),
(
  'Custom',
  'custom',
  'Tailored solution for enterprise needs',
  NULL,
  NULL,
  NULL,
  '["Unlimited interviews", "Full access to all features", "Advanced analytics & insights", "Dedicated support", "Custom branding", "API access", "Webhook integrations", "Custom integrations", "SLA guarantee"]'::jsonb,
  true,
  4
)
ON CONFLICT (slug) DO NOTHING;

-- Grant permissions
GRANT ALL ON public.pricing_plans TO service_role;
GRANT ALL ON public.company_subscriptions TO service_role;
GRANT ALL ON public.usage_records TO service_role;
GRANT SELECT ON public.pricing_plans TO authenticated;
GRANT SELECT ON public.company_subscriptions TO authenticated;
GRANT SELECT ON public.usage_records TO authenticated;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_pricing_plans_updated_at BEFORE UPDATE ON public.pricing_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_subscriptions_updated_at BEFORE UPDATE ON public.company_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_records_updated_at BEFORE UPDATE ON public.usage_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
