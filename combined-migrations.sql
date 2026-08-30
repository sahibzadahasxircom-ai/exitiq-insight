-- ExitIQ Database Schema - Combined Migrations
-- Run this in Supabase SQL Editor for your project

-- Migration 1: Core tables and auth setup
-- Role enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('owner', 'member');
    END IF;
END $$;

-- Companies (workspaces)
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  company_url TEXT,
  company_size TEXT,
  integration_type TEXT,
  setup_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles (per company)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, company_id, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer helpers
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _company_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND company_id = _company_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.user_company_id(_user_id UUID)
RETURNS UUID LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT company_id FROM public.profiles WHERE id = _user_id;
$$;

CREATE OR REPLACE FUNCTION public.is_company_member(_user_id UUID, _company_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND company_id = _company_id);
$$;

-- Policies: companies
DROP POLICY IF EXISTS "Members can view their company" ON public.companies;
DROP POLICY IF EXISTS "Owners can update their company" ON public.companies;
DROP POLICY IF EXISTS "Owners can delete their company" ON public.companies;

CREATE POLICY "Members can view their company" ON public.companies FOR SELECT TO authenticated
  USING (public.is_company_member(auth.uid(), id));
CREATE POLICY "Owners can update their company" ON public.companies FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), id, 'owner'));
CREATE POLICY "Owners can delete their company" ON public.companies FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), id, 'owner'));

-- Policies: profiles
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;

CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR (company_id IS NOT NULL AND public.is_company_member(auth.uid(), company_id)));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid());
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- Policies: user_roles
DROP POLICY IF EXISTS "Members view roles in their company" ON public.user_roles;
DROP POLICY IF EXISTS "Owners manage roles" ON public.user_roles;

CREATE POLICY "Members view roles in their company" ON public.user_roles FOR SELECT TO authenticated
  USING (public.is_company_member(auth.uid(), company_id));
CREATE POLICY "Owners manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), company_id, 'owner'))
  WITH CHECK (public.has_role(auth.uid(), company_id, 'owner'));

-- Auto-create company + profile + owner role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_company_id UUID;
  full_name_val TEXT;
  company_name_val TEXT;
BEGIN
  full_name_val := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  company_name_val := COALESCE(NULLIF(NEW.raw_user_meta_data->>'company_name', ''), full_name_val || '''s Workspace');

  INSERT INTO public.companies (company_name) VALUES (company_name_val) RETURNING id INTO new_company_id;
  INSERT INTO public.profiles (id, full_name, email, company_id) VALUES (NEW.id, full_name_val, NEW.email, new_company_id);
  INSERT INTO public.user_roles (user_id, company_id, role) VALUES (NEW.id, new_company_id, 'owner');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Migration 2: Security hardening
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, UUID, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.user_company_id(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_company_member(UUID, UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Migration 3: Interview tables
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interview_status') THEN
        CREATE TYPE public.interview_status AS ENUM ('active','completed','abandoned');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interview_progress') THEN
        CREATE TYPE public.interview_progress AS ENUM ('started','discovery','deep_dive','root_cause','completed');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interview_role') THEN
        CREATE TYPE public.interview_role AS ENUM ('assistant','user');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.interview_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL DEFAULT '',
  customer_email TEXT NOT NULL DEFAULT '',
  interview_status public.interview_status NOT NULL DEFAULT 'active',
  interview_progress public.interview_progress NOT NULL DEFAULT 'started',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.interview_sessions TO authenticated;
GRANT ALL ON public.interview_sessions TO service_role;

ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members view company sessions" ON public.interview_sessions;
DROP POLICY IF EXISTS "Members insert company sessions" ON public.interview_sessions;
DROP POLICY IF EXISTS "Members update company sessions" ON public.interview_sessions;
DROP POLICY IF EXISTS "Owners delete company sessions" ON public.interview_sessions;

CREATE POLICY "Members view company sessions" ON public.interview_sessions
  FOR SELECT TO authenticated USING (public.is_company_member(auth.uid(), company_id));
CREATE POLICY "Members insert company sessions" ON public.interview_sessions
  FOR INSERT TO authenticated WITH CHECK (public.is_company_member(auth.uid(), company_id));
CREATE POLICY "Members update company sessions" ON public.interview_sessions
  FOR UPDATE TO authenticated USING (public.is_company_member(auth.uid(), company_id));
CREATE POLICY "Owners delete company sessions" ON public.interview_sessions
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), company_id, 'owner'));

CREATE INDEX idx_interview_sessions_company ON public.interview_sessions(company_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.interview_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  role public.interview_role NOT NULL,
  message_content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.interview_messages TO authenticated;
GRANT ALL ON public.interview_messages TO service_role;

ALTER TABLE public.interview_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members view company messages" ON public.interview_messages;
DROP POLICY IF EXISTS "Members insert company messages" ON public.interview_messages;

CREATE POLICY "Members view company messages" ON public.interview_messages
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.interview_sessions s
            WHERE s.id = session_id AND public.is_company_member(auth.uid(), s.company_id))
  );
CREATE POLICY "Members insert company messages" ON public.interview_messages
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.interview_sessions s
            WHERE s.id = session_id AND public.is_company_member(auth.uid(), s.company_id))
  );

CREATE INDEX idx_interview_messages_session ON public.interview_messages(session_id, created_at);

-- Migration 4: Interview insights table
CREATE TABLE IF NOT EXISTS public.interview_insights (
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

DROP POLICY IF EXISTS "Members view company insights" ON public.interview_insights;
DROP POLICY IF EXISTS "Members insert company insights" ON public.interview_insights;
DROP POLICY IF EXISTS "Members update company insights" ON public.interview_insights;

CREATE POLICY "Members view company insights" ON public.interview_insights
  FOR SELECT TO authenticated USING (public.is_company_member(auth.uid(), company_id));
CREATE POLICY "Members insert company insights" ON public.interview_insights
  FOR INSERT TO authenticated WITH CHECK (public.is_company_member(auth.uid(), company_id));
CREATE POLICY "Members update company insights" ON public.interview_insights
  FOR UPDATE TO authenticated USING (public.is_company_member(auth.uid(), company_id));

CREATE INDEX idx_interview_insights_company ON public.interview_insights(company_id, created_at DESC);

-- Migration 5: Additional insight columns
ALTER TABLE public.interview_insights
  ADD COLUMN IF NOT EXISTS secondary_reasons text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS suggestions text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS recommended_actions text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS retention_opportunity text,
  ADD COLUMN IF NOT EXISTS confidence_score numeric,
  ADD COLUMN IF NOT EXISTS support_issue boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS executive_summary text;

-- Migration 6: Product knowledge table
CREATE TABLE IF NOT EXISTS public.product_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'feature',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_knowledge_company_id ON public.product_knowledge(company_id);
CREATE INDEX IF NOT EXISTS idx_product_knowledge_created_at ON public.product_knowledge(created_at DESC);

ALTER TABLE public.product_knowledge ENABLE ROW LEVEL SECURITY;

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

CREATE OR REPLACE FUNCTION public.update_product_knowledge_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS product_knowledge_updated_at ON public.product_knowledge;
CREATE TRIGGER product_knowledge_updated_at
  BEFORE UPDATE ON public.product_knowledge
  FOR EACH ROW
  EXECUTE FUNCTION public.update_product_knowledge_updated_at();
