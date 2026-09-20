-- Add missing columns to integrations table
ALTER TABLE public.integrations 
ADD COLUMN IF NOT EXISTS last_event_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS integration_status TEXT DEFAULT 'pending';

-- Grant permissions
GRANT ALL ON public.integrations TO service_role;
