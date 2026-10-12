import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Get Paddle client-side token and environment
export const getPaddleConfig = createServerFn({ method: "GET" })
  .handler(async () => {
    return {
      token: process.env.PADDLE_CLIENT_SIDE_TOKEN,
      environment: process.env.PADDLE_ENVIRONMENT || 'sandbox',
    };
  });

// Get current user's Paddle customer ID
export const getPaddleCustomerId = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabase, user } = await requireSupabaseAuth();

    // Get user's company
    const { data: company } = await supabase
      .from("companies")
      .select("paddle_customer_id")
      .eq("user_id", user.id)
      .single();

    return {
      paddleCustomerId: company?.paddle_customer_id || null,
    };
  });

// Create or update Paddle customer
export const createPaddleCustomer = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({
    email: z.string().email(),
    name: z.string().optional(),
  }).parse(d))
  .handler(async ({ data }) => {
    const { supabase, user } = await requireSupabaseAuth();

    // Get user's company
    const { data: company } = await supabase
      .from("companies")
      .select("id, paddle_customer_id")
      .eq("user_id", user.id)
      .single();

    if (!company) {
      return { success: false, error: "Company not found" };
    }

    // If company already has a paddle_customer_id, return it
    if (company.paddle_customer_id) {
      return { success: true, customerId: company.paddle_customer_id };
    }

    // Import Paddle SDK
    const { initializeSdk } = await import('@paddle/paddle-node-sdk');
    
    const paddle = initializeSdk({
      apiKey: process.env.PADDLE_API_KEY,
      environment: process.env.PADDLE_ENVIRONMENT === 'production' ? 'production' : 'sandbox',
    });

    // Create customer in Paddle
    const customer = await paddle.customers.create({
      email: data.email,
      name: data.name || company.company_name,
    });

    // Update company with paddle_customer_id
    await supabase
      .from("companies")
      .update({
        paddle_customer_id: customer.id,
      })
      .eq("id", company.id);

    return { success: true, customerId: customer.id };
  });

// Update subscription with Paddle IDs
export const updatePaddleSubscription = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({
    paddleSubscriptionId: z.string(),
    paddleCustomerId: z.string(),
    paddlePriceId: z.string(),
    paddleProductId: z.string(),
  }).parse(d))
  .handler(async ({ data }) => {
    const { supabase, user } = await requireSupabaseAuth();

    // Get user's company
    const { data: company } = await supabase
      .from("companies")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!company) {
      return { success: false, error: "Company not found" };
    }

    // Update company_subscriptions with Paddle IDs
    await supabase
      .from("company_subscriptions")
      .update({
        paddle_subscription_id: data.paddleSubscriptionId,
        paddle_customer_id: data.paddleCustomerId,
        paddle_price_id: data.paddlePriceId,
        paddle_product_id: data.paddleProductId,
        updated_at: new Date().toISOString(),
      })
      .eq("company_id", company.id);

    return { success: true };
  });

// Generate Paddle customer portal session
export const generateCustomerPortalSession = createServerFn({ method: "POST" })
  .handler(async () => {
    const { supabase, user } = await requireSupabaseAuth();

    // Get user's company
    const { data: company } = await supabase
      .from("companies")
      .select("paddle_customer_id")
      .eq("user_id", user.id)
      .single();

    if (!company || !company.paddle_customer_id) {
      return { success: false, error: "No Paddle customer found" };
    }

    // Import Paddle SDK
    const { initializeSdk } = await import('@paddle/paddle-node-sdk');
    
    const paddle = initializeSdk({
      apiKey: process.env.PADDLE_API_KEY,
      environment: process.env.PADDLE_ENVIRONMENT === 'production' ? 'production' : 'sandbox',
    });

    // Generate customer portal session
    const session = await paddle.customerPortal.generateSession({
      customerId: company.paddle_customer_id,
    });

    return { success: true, url: session.url };
  });
