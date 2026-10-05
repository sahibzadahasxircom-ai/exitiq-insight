import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Get all pricing plans
export const getPricingPlans = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: plans, error } = await supabaseAdmin
      .from("pricing_plans")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Failed to fetch pricing plans:", error);
      return [];
    }

    return plans || [];
  });

// Get current company subscription
export const getCompanySubscription = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabase, user } = await requireSupabaseAuth();

    // Get user's company
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (companyError || !company) {
      return null;
    }

    // Get subscription with plan details
    const { data: subscription, error: subError } = await supabase
      .from("company_subscriptions")
      .select(`
        *,
        pricing_plans (*)
      `)
      .eq("company_id", company.id)
      .single();

    if (subError) {
      console.error("Failed to fetch subscription:", subError);
      return null;
    }

    return subscription;
  });

// Get company usage for current month
export const getCompanyUsage = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabase, user } = await requireSupabaseAuth();

    // Get user's company
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (companyError || !company) {
      return { interviews_count: 0, limit: 5, remaining: 5 };
    }

    // Get subscription
    const { data: subscription, error: subError } = await supabase
      .from("company_subscriptions")
      .select(`
        *,
        pricing_plans (*)
      `)
      .eq("company_id", company.id)
      .single();

    const plan = subscription?.pricing_plans;
    const limit = plan?.monthly_interview_limit || 5;

    // Get current month start and end
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get or create usage record for current month
    const { data: usage, error: usageError } = await supabase
      .from("usage_records")
      .select("*")
      .eq("company_id", company.id)
      .gte("period_start", monthStart.toISOString())
      .lte("period_end", monthEnd.toISOString())
      .single();

    if (usageError || !usage) {
      // Create new usage record
      const { data: newUsage, error: createError } = await supabase
        .from("usage_records")
        .insert({
          company_id: company.id,
          subscription_id: subscription?.id,
          period_start: monthStart.toISOString(),
          period_end: monthEnd.toISOString(),
          interviews_count: 0,
        })
        .select()
        .single();

      if (createError) {
        console.error("Failed to create usage record:", createError);
      }

      return {
        interviews_count: 0,
        limit,
        remaining: limit,
      };
    }

    const remaining = limit !== null ? Math.max(0, limit - usage.interviews_count) : Infinity;

    return {
      interviews_count: usage.interviews_count,
      limit,
      remaining,
    };
  });

// Increment usage when interview is created
export const incrementUsage = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ companyId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Get current month start and end
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get or create usage record
    const { data: usage, error: usageError } = await supabaseAdmin
      .from("usage_records")
      .select("*")
      .eq("company_id", data.companyId)
      .gte("period_start", monthStart.toISOString())
      .lte("period_end", monthEnd.toISOString())
      .single();

    if (usageError || !usage) {
      // Create new usage record
      const { error: createError } = await supabaseAdmin
        .from("usage_records")
        .insert({
          company_id: data.companyId,
          period_start: monthStart.toISOString(),
          period_end: monthEnd.toISOString(),
          interviews_count: 1,
        });

      if (createError) {
        console.error("Failed to create usage record:", createError);
        return false;
      }

      return true;
    }

    // Increment existing usage
    const { error: updateError } = await supabaseAdmin
      .from("usage_records")
      .update({
        interviews_count: usage.interviews_count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", usage.id);

    if (updateError) {
      console.error("Failed to increment usage:", updateError);
      return false;
    }

    return true;
  });

// Check if company can create more interviews
export const canCreateInterview = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabase, user } = await requireSupabaseAuth();

    // Get user's company
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (companyError || !company) {
      return { canCreate: false, reason: "No company found" };
    }

    // Get subscription
    const { data: subscription, error: subError } = await supabase
      .from("company_subscriptions")
      .select(`
        *,
        pricing_plans (*)
      `)
      .eq("company_id", company.id)
      .single();

    const plan = subscription?.pricing_plans;
    const limit = plan?.monthly_interview_limit || 5;

    // Custom plans have no limit
    if (plan?.is_custom || limit === null) {
      return { canCreate: true, remaining: Infinity };
    }

    // Get current month usage
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const { data: usage, error: usageError } = await supabase
      .from("usage_records")
      .select("*")
      .eq("company_id", company.id)
      .gte("period_start", monthStart.toISOString())
      .lte("period_end", monthEnd.toISOString())
      .single();

    const currentUsage = usage?.interviews_count || 0;
    const remaining = Math.max(0, limit - currentUsage);

    if (remaining <= 0) {
      return {
        canCreate: false,
        reason: "limit_reached",
        currentUsage,
        limit,
        planName: plan?.name || "Free",
      };
    }

    return {
      canCreate: true,
      remaining,
      currentUsage,
      limit,
    };
  });

// Create or update subscription (for admin/use with Stripe)
export const updateSubscription = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({
    planId: z.string().uuid(),
    billingCycle: z.enum(["monthly", "yearly"]).optional(),
  }).parse(d))
  .handler(async ({ data }) => {
    const { supabase, user } = await requireSupabaseAuth();

    // Get user's company
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (companyError || !company) {
      return { success: false, error: "No company found" };
    }

    // Check if subscription exists
    const { data: existingSub, error: subError } = await supabase
      .from("company_subscriptions")
      .select("*")
      .eq("company_id", company.id)
      .single();

    if (existingSub) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from("company_subscriptions")
        .update({
          plan_id: data.planId,
          billing_cycle: data.billingCycle || "monthly",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingSub.id);

      if (updateError) {
        console.error("Failed to update subscription:", updateError);
        return { success: false, error: updateError.message };
      }

      return { success: true };
    }

    // Create new subscription
    const { error: createError } = await supabase
      .from("company_subscriptions")
      .insert({
        company_id: company.id,
        plan_id: data.planId,
        billing_cycle: data.billingCycle || "monthly",
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

    if (createError) {
      console.error("Failed to create subscription:", createError);
      return { success: false, error: createError.message };
    }

    return { success: true };
  });
