-- Create product_knowledge table to store product features and updates
CREATE TABLE IF NOT EXISTS public.product_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'feature', -- 'feature', 'update', 'general'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_product_knowledge_company_id ON public.product_knowledge(company_id);
CREATE INDEX IF NOT EXISTS idx_product_knowledge_created_at ON public.product_knowledge(created_at DESC);

-- Enable RLS
ALTER TABLE public.product_knowledge ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only company members can read/write their product knowledge
CREATE POLICY "Users can view their company's product knowledge"
  ON public.product_knowledge FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.user_roles
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert product knowledge for their company"
  ON public.product_knowledge FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.user_roles
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their company's product knowledge"
  ON public.product_knowledge FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM public.user_roles
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their company's product knowledge"
  ON public.product_knowledge FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM public.user_roles
      WHERE user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_product_knowledge_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER product_knowledge_updated_at
  BEFORE UPDATE ON public.product_knowledge
  FOR EACH ROW
  EXECUTE FUNCTION public.update_product_knowledge_updated_at();
