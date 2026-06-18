
CREATE TYPE public.interview_status AS ENUM ('active','completed','abandoned');
CREATE TYPE public.interview_progress AS ENUM ('started','discovery','deep_dive','root_cause','completed');
CREATE TYPE public.interview_role AS ENUM ('assistant','user');

CREATE TABLE public.interview_sessions (
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

CREATE POLICY "Members view company sessions" ON public.interview_sessions
  FOR SELECT TO authenticated USING (public.is_company_member(auth.uid(), company_id));
CREATE POLICY "Members insert company sessions" ON public.interview_sessions
  FOR INSERT TO authenticated WITH CHECK (public.is_company_member(auth.uid(), company_id));
CREATE POLICY "Members update company sessions" ON public.interview_sessions
  FOR UPDATE TO authenticated USING (public.is_company_member(auth.uid(), company_id));
CREATE POLICY "Owners delete company sessions" ON public.interview_sessions
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), company_id, 'owner'));

CREATE INDEX idx_interview_sessions_company ON public.interview_sessions(company_id, created_at DESC);

CREATE TABLE public.interview_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  role public.interview_role NOT NULL,
  message_content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.interview_messages TO authenticated;
GRANT ALL ON public.interview_messages TO service_role;

ALTER TABLE public.interview_messages ENABLE ROW LEVEL SECURITY;

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
