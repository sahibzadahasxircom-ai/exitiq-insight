import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  company_id: string | null;
};

export type Company = {
  id: string;
  company_name: string;
};

export type Role = "owner" | "member";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  company: Company | null;
  role: Role | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId: string) {
    const { data: p } = await supabase
      .from("profiles")
      .select("id, full_name, email, company_id")
      .eq("id", userId)
      .maybeSingle();
    setProfile(p ?? null);
    if (p?.company_id) {
      const [{ data: c }, { data: r }] = await Promise.all([
        supabase.from("companies").select("id, company_name").eq("id", p.company_id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId).eq("company_id", p.company_id).maybeSingle(),
      ]);
      setCompany(c ?? null);
      setRole((r?.role as Role | undefined) ?? null);
    } else {
      setCompany(null);
      setRole(null);
    }
  }

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) await loadProfile(data.session.user.id);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        // defer to avoid deadlock
        setTimeout(() => loadProfile(s.user.id), 0);
      } else {
        setProfile(null);
        setCompany(null);
        setRole(null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <Ctx.Provider
      value={{
        user: session?.user ?? null,
        session,
        profile,
        company,
        role,
        loading,
        refresh: async () => {
          if (session?.user) await loadProfile(session.user.id);
        },
        signOut: async () => {
          await supabase.auth.signOut();
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
