
-- Role enum
CREATE TYPE public.app_role AS ENUM ('owner', 'member');

-- Companies (workspaces)
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE TABLE public.profiles (
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
CREATE TABLE public.user_roles (
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
CREATE POLICY "Members can view their company" ON public.companies FOR SELECT TO authenticated
  USING (public.is_company_member(auth.uid(), id));
CREATE POLICY "Owners can update their company" ON public.companies FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), id, 'owner'));
CREATE POLICY "Owners can delete their company" ON public.companies FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), id, 'owner'));

-- Policies: profiles
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR (company_id IS NOT NULL AND public.is_company_member(auth.uid(), company_id)));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid());
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- Policies: user_roles
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
