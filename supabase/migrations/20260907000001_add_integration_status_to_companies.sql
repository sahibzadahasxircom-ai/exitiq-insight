-- Migration: Add integration_status to companies table
-- This migration adds integration status tracking directly to the companies table

-- Add integration_status column to companies table
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS integration_status TEXT DEFAULT 'not_connected';

-- Add last_event_at column to track when the last event was received
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS last_event_at TIMESTAMPTZ;

-- Add webhook_secret column for webhook verification
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS webhook_secret TEXT;

-- Create index on integration_status for faster queries
CREATE INDEX IF NOT EXISTS idx_companies_integration_status ON public.companies(integration_status);

-- Add comment to explain the integration_status values
COMMENT ON COLUMN public.companies.integration_status IS 'Integration status: not_connected, waiting_for_verification, connected, listening_for_events';
