import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create product knowledge entry
export const createProductKnowledge = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      title: z.string().min(1),
      content: z.string().min(1),
      type: z.enum(["feature", "update", "general"]).default("feature"),
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

    const { data: knowledge, error } = await supabase
      .from("product_knowledge")
      .insert({
        company_id: profile.company_id,
        title: data.title,
        content: data.content,
        type: data.type,
      })
      .select()
      .single();

    if (error) throw error;
    return knowledge;
  });

// List product knowledge for company
export const listProductKnowledge = createServerFn({ method: "GET" })
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
      .from("product_knowledge")
      .select("*")
      .eq("company_id", profile.company_id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  });

// Get single product knowledge entry
export const getProductKnowledge = createServerFn({ method: "GET" })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { userId, supabase } = await requireSupabaseAuth();

    const { data: knowledge, error } = await supabase
      .from("product_knowledge")
      .select("*")
      .eq("id", data.id)
      .single();

    if (error) throw error;

    // Verify user has access to this company's knowledge
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", userId)
      .single();

    if (profile?.company_id !== knowledge?.company_id) {
      throw new Error("Access denied");
    }

    return knowledge;
  });

// Update product knowledge entry
export const updateProductKnowledge = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string().uuid(),
      title: z.string().min(1).optional(),
      content: z.string().min(1).optional(),
      type: z.enum(["feature", "update", "general"]).optional(),
    })
  )
  .handler(async ({ data }) => {
    const { userId, supabase } = await requireSupabaseAuth();

    // Verify ownership
    const { data: existing } = await supabase
      .from("product_knowledge")
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

    const { data: knowledge, error } = await supabase
      .from("product_knowledge")
      .update({
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
        ...(data.type && { type: data.type }),
      })
      .eq("id", data.id)
      .select()
      .single();

    if (error) throw error;
    return knowledge;
  });

// Delete product knowledge entry
export const deleteProductKnowledge = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { userId, supabase } = await requireSupabaseAuth();

    // Verify ownership
    const { data: existing } = await supabase
      .from("product_knowledge")
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
      .from("product_knowledge")
      .delete()
      .eq("id", data.id);

    if (error) throw error;
    return { success: true };
  });

// Get product knowledge for AI context (public/internal use)
export async function getProductKnowledgeForAI(companyId: string): Promise<string> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data, error } = await supabase
    .from("product_knowledge")
    .select("title, content, type, created_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return "";
  }

  // Format as context for AI
  const context = data
    .map((item) => {
      const date = new Date(item.created_at).toLocaleDateString();
      return `[${item.type.toUpperCase()} - ${date}] ${item.title}\n${item.content}`;
    })
    .join("\n\n");

  return context;
}
