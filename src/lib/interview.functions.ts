import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------- Public functions (no auth required) ----------

export const getCompanyBySessionId = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ sessionId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    const { data: session } = await supabaseAdmin
      .from("interview_sessions")
      .select("company_id")
      .eq("id", data.sessionId)
      .single();

    if (!session?.company_id) return null;

    const { data: company } = await supabaseAdmin
      .from("companies")
      .select("pre_form_style, pre_form_title, pre_form_description, pre_form_fields, company_name, company_logo, brand_color")
      .eq("id", session.company_id)
      .single();

    return company;
  });

export const getCompanyBrandingBySessionId = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ sessionId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    const { data: session } = await supabaseAdmin
      .from("interview_sessions")
      .select("company_id")
      .eq("id", data.sessionId)
      .single();

    if (!session?.company_id) return null;

    const { data: company } = await supabaseAdmin
      .from("companies")
      .select("company_name, company_logo, brand_color")
      .eq("id", session.company_id)
      .single();

    return company;
  });

// ---------- TEMPORARY: test route helper (remove when done) ----------
export const publicCreateTestSession = createServerFn({ method: "POST" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let { data: company } = await supabaseAdmin
      .from("companies")
      .select("id")
      .limit(1)
      .maybeSingle();
    if (!company) {
      const { data: created, error: cErr } = await supabaseAdmin
        .from("companies")
        .insert({ company_name: "Test Workspace" })
        .select("id")
        .single();
      if (cErr) throw cErr;
      company = created;
    }
    const { data: session, error } = await supabaseAdmin
      .from("interview_sessions")
      .insert({
        company_id: company.id,
        customer_name: "Test Customer",
        customer_email: "test@example.com",
        interview_status: "active",
        interview_progress: "started",
      })
      .select("id")
      .single();
    if (error) throw error;
    return { sessionId: session.id as string };
  });

// ---------- Authenticated (founders / team) ----------

export const createInterviewSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        customer_name: z.string().trim().default(""),
        customer_email: z.string().trim().default(""),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", userId)
      .maybeSingle();
    if (pErr) throw pErr;
    if (!profile?.company_id) throw new Error("No workspace found");

    const { data: session, error } = await supabase
      .from("interview_sessions")
      .insert({
        company_id: profile.company_id,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
      })
      .select()
      .single();
    if (error) throw error;
    return session;
  });

export const listInterviewSessions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("interview_sessions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const getInterviewSession = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: session, error } = await context.supabase
      .from("interview_sessions")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw error;
    if (!session) throw new Error("Not found");
    const { data: messages, error: mErr } = await context.supabase
      .from("interview_messages")
      .select("*")
      .eq("session_id", data.id)
      .order("created_at", { ascending: true });
    if (mErr) throw mErr;
    const { data: insight } = await context.supabase
      .from("interview_insights")
      .select("*")
      .eq("session_id", data.id)
      .maybeSingle();
    return { session, messages: messages ?? [], insight: insight ?? null };
  });

export const deleteInterviewSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("interview_sessions").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// Dashboard aggregates from real interview_insights
export const getDashboardData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", userId)
      .maybeSingle();
    if (!profile?.company_id) return null;

    const [{ data: sessions }, { data: insights }] = await Promise.all([
      supabase
        .from("interview_sessions")
        .select("id, interview_status, created_at, completed_at")
        .eq("company_id", profile.company_id),
      supabase
        .from("interview_insights")
        .select("*")
        .eq("company_id", profile.company_id)
        .order("created_at", { ascending: false }),
    ]);
    return { sessions: sessions ?? [], insights: insights ?? [] };
  });

export const listInsights = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("interview_insights")
      .select("*, interview_sessions(customer_name, customer_email, created_at)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

// ---------- Public (customer interview link) ----------

export const publicGetInterview = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ sessionId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: session, error } = await supabaseAdmin
      .from("interview_sessions")
      .select("id, customer_name, interview_status, created_at, completed_at")
      .eq("id", data.sessionId)
      .maybeSingle();
    if (error) throw error;
    if (!session) throw new Error("Interview not found");
    const { data: messages, error: mErr } = await supabaseAdmin
      .from("interview_messages")
      .select("id, role, message_content, created_at")
      .eq("session_id", data.sessionId)
      .order("created_at", { ascending: true });
    if (mErr) throw mErr;
    return { session, messages: messages ?? [] };
  });

export const updateInterviewSession = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => 
    z.object({ 
      sessionId: z.string().uuid(),
      customer_name: z.string().trim().optional(),
      customer_email: z.string().trim().email().optional(),
    }).parse(d)
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    const { error } = await supabaseAdmin
      .from("interview_sessions")
      .update({
        customer_name: data.customer_name || "Anonymous",
        customer_email: data.customer_email || null,
      })
      .eq("id", data.sessionId);
    
    if (error) throw error;
    return { success: true };
  });

export const publicStartInterview = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ sessionId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { generateInterviewerReply } = await import("./interview.server");

    const { data: session } = await supabaseAdmin
      .from("interview_sessions")
      .select("id, company_id, interview_status")
      .eq("id", data.sessionId)
      .maybeSingle();
    if (!session) throw new Error("Interview not found");
    if (session.interview_status !== "active") return { ok: true, skipped: true };

    const { count } = await supabaseAdmin
      .from("interview_messages")
      .select("id", { count: "exact", head: true })
      .eq("session_id", data.sessionId);
    if ((count ?? 0) > 0) return { ok: true, skipped: true };

    const { text } = await generateInterviewerReply({ history: [], companyId: session.company_id });
    await supabaseAdmin
      .from("interview_messages")
      .insert({ session_id: data.sessionId, role: "assistant", message_content: text });
    return { ok: true, text };
  });

export const publicSendMessage = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ sessionId: z.string().uuid(), content: z.string().trim().min(1).max(4000) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { generateInterviewerReply, extractInsights } = await import("./interview.server");

    const { data: session, error } = await supabaseAdmin
      .from("interview_sessions")
      .select("id, company_id, interview_status")
      .eq("id", data.sessionId)
      .maybeSingle();
    if (error) throw error;
    if (!session) throw new Error("Interview not found");
    if (session.interview_status !== "active") throw new Error("Interview already closed");

    await supabaseAdmin
      .from("interview_messages")
      .insert({ session_id: data.sessionId, role: "user", message_content: data.content });

    const { data: history } = await supabaseAdmin
      .from("interview_messages")
      .select("role, message_content")
      .eq("session_id", data.sessionId)
      .order("created_at", { ascending: true });

    const fullHistory = (history ?? []) as { role: "assistant" | "user"; message_content: string }[];
    const { text, complete } = await generateInterviewerReply({ history: fullHistory, companyId: session.company_id });

    await supabaseAdmin
      .from("interview_messages")
      .insert({ session_id: data.sessionId, role: "assistant", message_content: text });

    if (complete) {
      await supabaseAdmin
        .from("interview_sessions")
        .update({
          interview_status: "completed",
          interview_progress: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", data.sessionId);

      // Extract structured insight (best-effort; don't fail the message on extraction error)
      try {
        const finalHistory = [
          ...fullHistory,
          { role: "assistant" as const, message_content: text },
        ];
        const insight = await extractInsights(finalHistory);
        await supabaseAdmin.from("interview_insights").upsert(
          {
            session_id: data.sessionId,
            company_id: session.company_id,
            churn_reason: insight.churn_reason,
            root_cause: insight.root_cause,
            category: insight.category,
            competitor_mentioned: insight.competitor_mentioned,
            missing_features: insight.missing_features,
            pricing_issue: insight.pricing_issue,
            onboarding_issue: insight.onboarding_issue,
            support_issue: insight.support_issue,
            sentiment: insight.sentiment,
            journey_failure_point: insight.journey_failure_point,
            quote: insight.quote,
            summary: insight.summary,
            executive_summary: insight.executive_summary,
            secondary_reasons: insight.secondary_reasons,
            suggestions: insight.suggestions,
            recommended_actions: insight.recommended_actions,
            tags: insight.tags,
            retention_opportunity: insight.retention_opportunity,
            confidence_score: insight.confidence_score,
          },
          { onConflict: "session_id" },
        );
      } catch (e) {
        console.error("Insight extraction failed", e);
      }
    }

    return { text, complete };
  });
