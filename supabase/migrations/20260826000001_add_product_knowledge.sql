-- Minimal migration for Product Knowledge feature
-- Run this if you already have existing tables

-- Add new columns to companies table if they don't exist
DO $$
BEGIN
    -- Check and add company_url
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' AND column_name = 'company_url'
    ) THEN
        ALTER TABLE public.companies ADD COLUMN company_url TEXT;
    END IF;

    -- Check and add company_size
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' AND column_name = 'company_size'
    ) THEN
        ALTER TABLE public.companies ADD COLUMN company_size TEXT;
    END IF;

    -- Check and add integration_type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' AND column_name = 'integration_type'
    ) THEN
        ALTER TABLE public.companies ADD COLUMN integration_type TEXT;
    END IF;

    -- Check and add setup_completed
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' AND column_name = 'setup_completed'
    ) THEN
        ALTER TABLE public.companies ADD COLUMN setup_completed BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Create product_knowledge table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.product_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'feature',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_product_knowledge_company_id ON public.product_knowledge(company_id);
CREATE INDEX IF NOT EXISTS idx_product_knowledge_created_at ON public.product_knowledge(created_at DESC);

-- Enable RLS if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'product_knowledge' AND rowsecurity = true
    ) THEN
        ALTER TABLE public.product_knowledge ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Drop existing policies if they exist, then create them
DROP POLICY IF EXISTS "Users can view their company's product knowledge" ON public.product_knowledge;
DROP POLICY IF EXISTS "Users can insert product knowledge for their company" ON public.product_knowledge;
DROP POLICY IF EXISTS "Users can update their company's product knowledge" ON public.product_knowledge;
DROP POLICY IF EXISTS "Users can delete their company's product knowledge" ON public.product_knowledge;

CREATE POLICY "Users can view their company's product knowledge"
  ON public.product_knowledge FOR SELECT
  USING (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Users can insert product knowledge for their company"
  ON public.product_knowledge FOR INSERT
  WITH CHECK (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Users can update their company's product knowledge"
  ON public.product_knowledge FOR UPDATE
  USING (public.is_company_member(auth.uid(), company_id));

CREATE POLICY "Users can delete their company's product knowledge"
  ON public.product_knowledge FOR DELETE
  USING (public.is_company_member(auth.uid(), company_id));

-- Create or replace the update function
CREATE OR REPLACE FUNCTION public.update_product_knowledge_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists, then create it
DROP TRIGGER IF EXISTS product_knowledge_updated_at ON public.product_knowledge;
CREATE TRIGGER product_knowledge_updated_at
  BEFORE UPDATE ON public.product_knowledge
  FOR EACH ROW
  EXECUTE FUNCTION public.update_product_knowledge_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_knowledge TO authenticated;
GRANT ALL ON public.product_knowledge TO service_role;

-- Add INSERT policy for companies table (missing from original schema)
DROP POLICY IF EXISTS "Authenticated users can insert companies" ON public.companies;
CREATE POLICY "Authenticated users can insert companies"
  ON public.companies FOR INSERT
  TO authenticated
  WITH CHECK (true);
