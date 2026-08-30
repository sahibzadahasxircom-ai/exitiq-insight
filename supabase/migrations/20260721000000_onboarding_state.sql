-- Add onboarding state tracking to companies table
ALTER TABLE public.companies 
ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN company_website TEXT,
ADD COLUMN company_logo TEXT,
ADD COLUMN industry TEXT,
ADD COLUMN company_size TEXT,
ADD COLUMN primary_contact_email TEXT,
ADD COLUMN brand_color TEXT,
ADD COLUMN brand_template TEXT DEFAULT 'default',
ADD COLUMN customer_journey_type TEXT DEFAULT 'subscription_cancellation';

-- Update existing companies to have default onboarding state
UPDATE public.companies SET onboarding_completed = TRUE WHERE onboarding_completed IS NULL;
