-- Add Paddle-specific columns to existing tables

-- Add paddle_customer_id to companies table
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS paddle_customer_id TEXT;

-- Add Paddle-specific columns to company_subscriptions table
ALTER TABLE public.company_subscriptions 
ADD COLUMN IF NOT EXISTS paddle_customer_id TEXT,
ADD COLUMN IF NOT EXISTS paddle_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS paddle_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS paddle_price_id TEXT,
ADD COLUMN IF NOT EXISTS paddle_product_id TEXT;

-- Add index for paddle_customer_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_companies_paddle_customer_id 
ON public.companies(paddle_customer_id);

CREATE INDEX IF NOT EXISTS idx_company_subscriptions_paddle_customer_id 
ON public.company_subscriptions(paddle_customer_id);

-- Add unique constraint for paddle_subscription_id
ALTER TABLE public.company_subscriptions 
DROP CONSTRAINT IF EXISTS company_subscriptions_paddle_subscription_id_key;

ALTER TABLE public.company_subscriptions 
ADD CONSTRAINT company_subscriptions_paddle_subscription_id_key 
UNIQUE (paddle_subscription_id);

-- Grant permissions
GRANT ALL ON public.companies TO service_role;
GRANT ALL ON public.company_subscriptions TO service_role;
