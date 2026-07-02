
ALTER TABLE public.interview_insights
  ADD COLUMN IF NOT EXISTS secondary_reasons text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS suggestions text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS recommended_actions text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS retention_opportunity text,
  ADD COLUMN IF NOT EXISTS confidence_score numeric,
  ADD COLUMN IF NOT EXISTS support_issue boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS executive_summary text;
