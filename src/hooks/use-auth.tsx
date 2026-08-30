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
    try {
      const { data: p, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email, company_id")
        .eq("id", userId)
        .maybeSingle();
      
      if (profileError) {
        console.error("Profile load error:", profileError);
      }
      
      setProfile(p ?? null);
      
      if (p?.company_id) {
        const [{ data: c, error: companyError }, { data: r, error: roleError }] = await Promise.all([
          supabase.from("companies").select("id, company_name").eq("id", p.company_id).maybeSingle(),
          supabase.from("user_roles").select("role").eq("user_id", userId).eq("company_id", p.company_id).maybeSingle(),
        ]);
        
        if (companyError) console.error("Company load error:", companyError);
        if (roleError) console.error("Role load error:", roleError);
        
        setCompany(c ?? null);
        setRole((r?.role as Role | undefined) ?? null);
      } else {
        setCompany(null);
        setRole(null);
      }
    } catch (error) {
      console.error("loadProfile error:", error);
    }
  }

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) {
        await loadProfile(data.session.user.id);
      }
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        // Only load profile if session actually changed, not just token refresh
        if (_event !== 'TOKEN_REFRESHED') {
          loadProfile(s.user.id);
        }
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

