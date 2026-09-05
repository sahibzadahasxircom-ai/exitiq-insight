import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Create whats_new entry
export const createWhatsNew = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      title: z.string().min(1),
      content: z.string().min(1),
      type: z.enum(["feature", "update", "bugfix", "improvement"]).default("feature"),
      file_url: z.string().optional(),
      file_name: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const { userId, supabase } = await requireSupabaseAuth();

    // Get user's company_id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", userId)
      .single();

    if (profileError || !profile?.company_id) {
      throw new Error("Company not found");
    }

    const { data: whatsNew, error } = await supabase
      .from("whats_new")
      .insert({
        company_id: profile.company_id,
        title: data.title,
        content: data.content,
        type: data.type,
        file_url: data.file_url,
        file_name: data.file_name,
      })
      .select()
      .single();

    if (error) throw error;
    return whatsNew;
  });

// List whats_new for company
export const listWhatsNew = createServerFn({ method: "GET" })
  .handler(async () => {
    const { userId, supabase } = await requireSupabaseAuth();

    // Get user's company_id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", userId)
      .single();

    if (profileError || !profile?.company_id) {
      throw new Error("Company not found");
    }

    const { data, error } = await supabase
      .from("whats_new")
      .select("*")
      .eq("company_id", profile.company_id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  });

// Get single whats_new entry
export const getWhatsNew = createServerFn({ method: "GET" })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { userId, supabase } = await requireSupabaseAuth();

    const { data: whatsNew, error } = await supabase
      .from("whats_new")
      .select("*")
      .eq("id", data.id)
      .single();

    if (error) throw error;

    // Verify user has access to this company's data
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", userId)
      .single();

    if (profile?.company_id !== whatsNew?.company_id) {
      throw new Error("Access denied");
    }

    return whatsNew;
  });

// Update whats_new entry
export const updateWhatsNew = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string().uuid(),
      title: z.string().min(1).optional(),
      content: z.string().min(1).optional(),
      type: z.enum(["feature", "update", "bugfix", "improvement"]).optional(),
      file_url: z.string().optional(),
      file_name: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const { userId, supabase } = await requireSupabaseAuth();

    // Verify ownership
    const { data: existing } = await supabase
      .from("whats_new")
      .select("company_id")
      .eq("id", data.id)
      .single();

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", userId)
      .single();

    if (profile?.company_id !== existing?.company_id) {
      throw new Error("Access denied");
    }

    const { data: whatsNew, error } = await supabase
      .from("whats_new")
      .update({
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
        ...(data.type && { type: data.type }),
        ...(data.file_url !== undefined && { file_url: data.file_url }),
        ...(data.file_name !== undefined && { file_name: data.file_name }),
      })
      .eq("id", data.id)
      .select()
      .single();

    if (error) throw error;
    return whatsNew;
  });

// Delete whats_new entry
export const deleteWhatsNew = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { userId, supabase } = await requireSupabaseAuth();

    // Verify ownership
    const { data: existing } = await supabase
      .from("whats_new")
      .select("company_id")
      .eq("id", data.id)
      .single();

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", userId)
      .single();

    if (profile?.company_id !== existing?.company_id) {
      throw new Error("Access denied");
    }

    const { error } = await supabase
      .from("whats_new")
      .delete()
      .eq("id", data.id);

    if (error) throw error;
    return { success: true };
  });

// Get whats_new for AI context (public/internal use)
export async function getWhatsNewForAI(companyId: string): Promise<string> {
  const { createClient } = await import("@supabase/supabase-js");
  const supabaseUrl = process.env.VITE_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data, error } = await supabase
    .from("whats_new")
    .select("id, title, content, type, created_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return "";
  }

  // Format as context for AI with feature IDs for tracking
  const context = data
    .map((item) => {
      const date = new Date(item.created_at).toLocaleDateString();
      return `[${item.type.toUpperCase()} - ${date} - ID: ${item.id}] ${item.title}\n${item.content}`;
    })
    .join("\n\n");

  return context;
}
