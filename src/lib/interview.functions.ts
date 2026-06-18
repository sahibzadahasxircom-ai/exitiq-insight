import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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
    return { session, messages: messages ?? [] };
  });

export const deleteInterviewSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("interview_sessions").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// ---------- Public (customer interview link) ----------
// These run with service role but are strictly scoped to the provided sessionId.

export const publicGetInterview = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ sessionId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: session, error } = await supabaseAdmin
      .from("interview_sessions")
      .select("id, customer_name, interview_status, interview_progress, created_at, completed_at")
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

export const publicStartInterview = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ sessionId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { generateInterviewerReply } = await import("./interview.server");

    const { data: session } = await supabaseAdmin
      .from("interview_sessions")
      .select("id, interview_status")
      .eq("id", data.sessionId)
      .maybeSingle();
    if (!session) throw new Error("Interview not found");
    if (session.interview_status !== "active") return { ok: true, skipped: true };

    const { count } = await supabaseAdmin
      .from("interview_messages")
      .select("id", { count: "exact", head: true })
      .eq("session_id", data.sessionId);
    if ((count ?? 0) > 0) return { ok: true, skipped: true };

    const { text } = await generateInterviewerReply({ history: [], stage: "started" });
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
    const { generateInterviewerReply, nextStage } = await import("./interview.server");

    const { data: session, error } = await supabaseAdmin
      .from("interview_sessions")
      .select("id, interview_status, interview_progress")
      .eq("id", data.sessionId)
      .maybeSingle();
    if (error) throw error;
    if (!session) throw new Error("Interview not found");
    if (session.interview_status !== "active") throw new Error("Interview already closed");

    // Persist user message
    await supabaseAdmin
      .from("interview_messages")
      .insert({ session_id: data.sessionId, role: "user", message_content: data.content });

    // Load full history (ordered)
    const { data: history } = await supabaseAdmin
      .from("interview_messages")
      .select("role, message_content")
      .eq("session_id", data.sessionId)
      .order("created_at", { ascending: true });

    const userTurns = (history ?? []).filter((m) => m.role === "user").length;
    const stage = nextStage(session.interview_progress as never, userTurns);

    const { text, complete } = await generateInterviewerReply({
      history: (history ?? []) as { role: "assistant" | "user"; message_content: string }[],
      stage,
    });

    await supabaseAdmin
      .from("interview_messages")
      .insert({ session_id: data.sessionId, role: "assistant", message_content: text });

    const finalStage = complete ? "completed" : stage;
    await supabaseAdmin
      .from("interview_sessions")
      .update({
        interview_progress: finalStage,
        interview_status: complete ? "completed" : "active",
        completed_at: complete ? new Date().toISOString() : null,
      })
      .eq("id", data.sessionId);

    return { text, stage: finalStage, complete };
  });
