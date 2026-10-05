-- Create default subscriptions for existing companies
INSERT INTO public.company_subscriptions (company_id, plan_id, status, billing_cycle, current_period_start, current_period_end)
SELECT 
  c.id,
  (SELECT id FROM public.pricing_plans WHERE slug = 'free' LIMIT 1),
  'active',
  'monthly',
  NOW(),
  NOW() + INTERVAL '30 days'
FROM public.companies c
WHERE NOT EXISTS (
  SELECT 1 FROM public.company_subscriptions cs WHERE cs.company_id = c.id
);
