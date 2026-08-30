-- Migration: Integration Storage
-- This migration adds tables for storing integration connections, tokens, and webhook events

-- Integration status enum
CREATE TYPE public.integration_status AS ENUM ('pending', 'connecting', 'connected', 'disconnected', 'failed', 'needs_attention');

-- Integration type enum
CREATE TYPE public.integration_type AS ENUM ('stripe', 'api', 'javascript', 'webhook');

-- Integrations table - stores connection status for each integration type
CREATE TABLE public.integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  integration_type public.integration_type NOT NULL,
  status public.integration_status NOT NULL DEFAULT 'pending',
  config JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  connected_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, integration_type)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.integrations TO authenticated;
GRANT ALL ON public.integrations TO service_role;

ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view company integrations" ON public.integrations
  FOR SELECT TO authenticated USING (public.is_company_member(auth.uid(), company_id));
CREATE POLICY "Members insert company integrations" ON public.integrations
  FOR INSERT TO authenticated WITH CHECK (public.is_company_member(auth.uid(), company_id));
CREATE POLICY "Members update company integrations" ON public.integrations
  FOR UPDATE TO authenticated USING (public.is_company_member(auth.uid(), company_id));
CREATE POLICY "Owners delete company integrations" ON public.integrations
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), company_id, 'owner'));

CREATE INDEX idx_integrations_company_type ON public.integrations(company_id, integration_type);
CREATE INDEX idx_integrations_status ON public.integrations(status);

-- Stripe connections table - stores OAuth tokens securely
CREATE TABLE public.stripe_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  stripe_account_id TEXT NOT NULL,
  stripe_user_id TEXT,
  access_token TEXT NOT NULL, -- Encrypted
  refresh_token TEXT NOT NULL, -- Encrypted
  token_type TEXT NOT NULL DEFAULT 'bearer',
  scope TEXT NOT NULL,
  livemode BOOLEAN NOT NULL DEFAULT false,
  publishable_key TEXT, -- Encrypted
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.stripe_connections TO authenticated;
GRANT ALL ON public.stripe_connections TO service_role;

ALTER TABLE public.stripe_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view company stripe connections" ON public.stripe_connections
  FOR SELECT TO authenticated USING (public.is_company_member(auth.uid(), company_id));
CREATE POLICY "Service role manages stripe connections" ON public.stripe_connections
  FOR ALL TO service_role;

-- API keys table - stores generated API keys
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  key_prefix TEXT NOT NULL, -- First 8 characters for display
  key_hash TEXT NOT NULL UNIQUE, -- Hashed full key for verification
  key_secret TEXT NOT NULL, -- Encrypted secret key
  name TEXT NOT NULL DEFAULT 'Default API Key',
  scopes TEXT[] NOT NULL DEFAULT '{events,customers,subscriptions,cancellations}'::text[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.api_keys TO authenticated;
GRANT ALL ON public.api_keys TO service_role;

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view company api keys" ON public.api_keys
  FOR SELECT TO authenticated USING (public.is_company_member(auth.uid(), company_id));
CREATE POLICY "Members insert company api keys" ON public.api_keys
  FOR INSERT TO authenticated WITH CHECK (public.is_company_member(auth.uid(), company_id));
CREATE POLICY "Members update company api keys" ON public.api_keys
  FOR UPDATE TO authenticated USING (public.is_company_member(auth.uid(), company_id));
CREATE POLICY "Owners delete company api keys" ON public.api_keys
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), company_id, 'owner'));

CREATE INDEX idx_api_keys_company ON public.api_keys(company_id);
CREATE INDEX idx_api_keys_hash ON public.api_keys(key_hash);
CREATE INDEX idx_api_keys_active ON public.api_keys(is_active);

-- Webhooks table - stores webhook configurations
CREATE TABLE public.webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  webhook_url TEXT NOT NULL UNIQUE,
  webhook_secret TEXT NOT NULL, -- Encrypted signing secret
  source_platform TEXT NOT NULL, -- stripe, paddle, chargebee, custom, etc.
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_event_received_at TIMESTAMPTZ,
  last_delivery_at TIMESTAMPTZ,
  retry_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.webhooks TO authenticated;
GRANT ALL ON public.webhooks TO service_role;

ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view company webhooks" ON public.webhooks
  FOR SELECT TO authenticated USING (public.is_company_member(auth.uid(), company_id));
CREATE POLICY "Members insert company webhooks" ON public.webhooks
  FOR INSERT TO authenticated WITH CHECK (public.is_company_member(auth.uid(), company_id));
CREATE POLICY "Members update company webhooks" ON public.webhooks
  FOR UPDATE TO authenticated USING (public.is_company_member(auth.uid(), company_id));
CREATE POLICY "Owners delete company webhooks" ON public.webhooks
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), company_id, 'owner'));

CREATE INDEX idx_webhooks_company ON public.webhooks(company_id);
CREATE INDEX idx_webhooks_url ON public.webhooks(webhook_url);
CREATE INDEX idx_webhooks_active ON public.webhooks(is_active);

-- Webhook events table - logs incoming webhook events
CREATE TABLE public.webhook_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id UUID NOT NULL REFERENCES public.webhooks(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_id TEXT, -- External event ID (e.g., Stripe event ID)
  payload JSONB NOT NULL,
  signature TEXT,
  processed BOOLEAN NOT NULL DEFAULT false,
  processing_error TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

GRANT SELECT, INSERT, UPDATE ON public.webhook_events TO authenticated;
GRANT ALL ON public.webhook_events TO service_role;

ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view company webhook events" ON public.webhook_events
  FOR SELECT TO authenticated USING (public.is_company_member(auth.uid(), company_id));
CREATE POLICY "Service role manages webhook events" ON public.webhook_events
  FOR ALL TO service_role;

CREATE INDEX idx_webhook_events_webhook ON public.webhook_events(webhook_id, received_at DESC);
CREATE INDEX idx_webhook_events_company ON public.webhook_events(company_id, received_at DESC);
CREATE INDEX idx_webhook_events_processed ON public.webhook_events(processed);
CREATE INDEX idx_webhook_events_event_id ON public.webhook_events(event_id);

-- JavaScript widget installations table
CREATE TABLE public.widget_installations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  widget_version TEXT,
  first_event_at TIMESTAMPTZ,
  last_event_at TIMESTAMPTZ,
  event_count INTEGER NOT NULL DEFAULT 0,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, domain)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.widget_installations TO authenticated;
GRANT ALL ON public.widget_installations TO service_role;

ALTER TABLE public.widget_installations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view company widget installations" ON public.widget_installations
  FOR SELECT TO authenticated USING (public.is_company_member(auth.uid(), company_id));
CREATE POLICY "Service role manages widget installations" ON public.widget_installations
  FOR ALL TO service_role;

CREATE INDEX idx_widget_installations_company ON public.widget_installations(company_id);
CREATE INDEX idx_widget_installations_domain ON public.widget_installations(domain);
CREATE INDEX idx_widget_installations_verified ON public.widget_installations(is_verified);

-- OAuth state table - for CSRF protection during OAuth flows
CREATE TABLE public.oauth_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  state_token TEXT NOT NULL UNIQUE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  integration_type public.integration_type NOT NULL,
  redirect_uri TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.oauth_states TO authenticated;
GRANT ALL ON public.oauth_states TO service_role;

CREATE INDEX idx_oauth_states_token ON public.oauth_states(state_token);
CREATE INDEX idx_oauth_states_expires ON public.oauth_states(expires_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stripe_connections_updated_at BEFORE UPDATE ON public.stripe_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON public.webhooks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_widget_installations_updated_at BEFORE UPDATE ON public.widget_installations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to clean up expired OAuth states
CREATE OR REPLACE FUNCTION public.cleanup_expired_oauth_states()
RETURNS void AS $$
BEGIN
  DELETE FROM public.oauth_states WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Clean up expired states every hour
-- Note: This would need to be set up as a cron job in Supabase
