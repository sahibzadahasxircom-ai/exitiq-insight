
CREATE TABLE public.interview_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL UNIQUE REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  churn_reason TEXT,
  root_cause TEXT,
  category TEXT,
  competitor_mentioned TEXT,
  missing_features TEXT[] NOT NULL DEFAULT '{}',
  pricing_issue BOOLEAN NOT NULL DEFAULT false,
  onboarding_issue BOOLEAN NOT NULL DEFAULT false,
  sentiment TEXT,
  journey_failure_point TEXT,
  revenue_impact NUMERIC,
  quote TEXT,
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.interview_insights TO authenticated;
GRANT ALL ON public.interview_insights TO service_role;

ALTER TABLE public.interview_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view company insights" ON public.interview_insights
  FOR SELECT TO authenticated USING (public.is_company_member(auth.uid(), company_id));
CREATE POLICY "Members insert company insights" ON public.interview_insights
  FOR INSERT TO authenticated WITH CHECK (public.is_company_member(auth.uid(), company_id));
CREATE POLICY "Members update company insights" ON public.interview_insights
  FOR UPDATE TO authenticated USING (public.is_company_member(auth.uid(), company_id));

CREATE INDEX idx_interview_insights_company ON public.interview_insights(company_id, created_at DESC);
