-- Add company branding and pre-form customization columns
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS company_logo TEXT,
ADD COLUMN IF NOT EXISTS brand_color TEXT DEFAULT '#2563eb',
ADD COLUMN IF NOT EXISTS company_url TEXT,
ADD COLUMN IF NOT EXISTS company_size TEXT,
ADD COLUMN IF NOT EXISTS company_industry TEXT,
ADD COLUMN IF NOT EXISTS pre_form_style TEXT DEFAULT 'professional',
ADD COLUMN IF NOT EXISTS pre_form_title TEXT DEFAULT 'We''re sorry to see you go',
ADD COLUMN IF NOT EXISTS pre_form_description TEXT DEFAULT 'Help us improve by sharing your feedback',
ADD COLUMN IF NOT EXISTS pre_form_fields JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS background_style TEXT DEFAULT 'gradient',
ADD COLUMN IF NOT EXISTS button_color TEXT,
ADD COLUMN IF NOT EXISTS button_text_color TEXT DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS text_color TEXT DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS solid_background_color TEXT,
ADD COLUMN IF NOT EXISTS require_name BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS require_email BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_name_field BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_email_field BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS integration_type TEXT,
ADD COLUMN IF NOT EXISTS integration_config JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS setup_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_event_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS integration_status TEXT DEFAULT 'pending';

-- Grant permissions
GRANT ALL ON public.companies TO service_role;
