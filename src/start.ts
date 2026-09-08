import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// CORS middleware for widget events endpoint
const corsMiddleware = createMiddleware().server(async ({ request, next }): Promise<Response> => {
  const url = new URL(request.url);
  
  // Add CORS headers for widget events endpoint
  if (url.pathname === '/api/widget/events') {
    // Handle OPTIONS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }
    
    // Handle POST requests
    if (request.method === 'POST') {
      try {
        const body = await request.json();
        
        // Direct Supabase call (avoiding server function context issue)
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.VITE_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        // Verify company exists
        const { data: company, error: companyError } = await supabase
          .from("companies")
          .select("id")
          .eq("id", body.company_id)
          .single();
        
        if (companyError || !company) {
          return new Response(JSON.stringify({ success: false, error: "Invalid company ID" }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
        
        // Log the event
        console.log("Widget event received:", {
          company_id: body.company_id,
          event_name: body.event_name,
          timestamp: body.timestamp,
          url: body.url,
        });
        
        // Store the event in the database
        const { error: insertError } = await supabase
          .from("widget_events")
          .insert({
            company_id: body.company_id,
            event_name: body.event_name,
            event_data: body.event_data || {},
            timestamp: body.timestamp || new Date().toISOString(),
            url: body.url,
            user_agent: body.user_agent,
          });
        
        if (insertError) {
          console.error("Failed to store widget event:", insertError);
          // Still return success to not break the widget, but log the error
        }
        
        // If this is a SignOut, CancelSubscription, or DeleteAccount event, create an interview session
        let interviewSessionId = null;
        if (body.event_name === "SignOut" || body.event_name === "CancelSubscription" || body.event_name === "DeleteAccount") {
          console.log(`${body.event_name} event detected, creating new interview session`);
          
          // Always create a new interview session for each event
          console.log("Creating new interview session for company:", body.company_id);
          const { data: newSession, error: sessionError } = await supabase
            .from("interview_sessions")
            .insert({
              company_id: body.company_id,
              customer_name: "Widget User",
              customer_email: "widget@example.com",
              interview_status: "active",
              interview_progress: "started",
              source_url: body.url,
            })
            .select("id")
            .single();
          
          if (sessionError) {
            console.error("Failed to create interview session:", sessionError);
          } else {
            interviewSessionId = newSession.id;
            console.log("Created new interview session:", interviewSessionId);
            console.log("Full session data:", newSession);
          }
        }

        // Update company integration status and last event timestamp
        const { error: updateError } = await supabase
          .from("companies")
          .update({
            last_event_at: new Date().toISOString(),
            integration_status: "listening_for_events",
          })
          .eq("id", body.company_id);

        if (updateError) {
          console.error("Failed to update company integration status:", updateError);
        }

        // Also update the widget integration status in integrations table
        const { error: integrationUpdateError } = await supabase
          .from("integrations")
          .update({
            status: "listening_for_events",
            last_event_at: new Date().toISOString(),
          })
          .eq("company_id", body.company_id)
          .eq("integration_type", "javascript");

        if (integrationUpdateError) {
          console.error("Failed to update widget integration status:", integrationUpdateError);
        }
        
        console.log("Returning response with interviewSessionId:", interviewSessionId);
        return new Response(JSON.stringify({ 
          success: true, 
          interviewSessionId: interviewSessionId 
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        });
      } catch (error) {
        console.error("Widget event error:", error);
        return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }
    
    return new Response('Method Not Allowed', { status: 405 });
  }

  // Handle webhook events from billing platforms
  if (url.pathname === '/api/webhook') {
    if (request.method === 'POST') {
      try {
        const body = await request.json();
        
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.VITE_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Extract company_id from webhook URL query parameter
        const companyId = url.searchParams.get('company_id');
        
        if (!companyId) {
          return new Response(JSON.stringify({ success: false, error: "Missing company_id" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        // Verify company exists
        const { data: company, error: companyError } = await supabase
          .from("companies")
          .select("id, webhook_secret")
          .eq("id", companyId)
          .single();
        
        if (companyError || !company) {
          return new Response(JSON.stringify({ success: false, error: "Invalid company ID" }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        // Log the webhook event
        console.log("Webhook event received:", {
          company_id: companyId,
          event_type: body.type || body.event_type,
          timestamp: new Date().toISOString(),
        });

        // Create interview session for cancellation events
        let interviewSessionId = null;
        const eventType = body.type || body.event_type || '';
        
        if (eventType.toLowerCase().includes('cancel') || eventType.toLowerCase().includes('delete')) {
          console.log("Cancellation event detected, creating interview session");
          
          const { data: newSession, error: sessionError } = await supabase
            .from("interview_sessions")
            .insert({
              company_id: companyId,
              customer_name: body.data?.customer_name || "Webhook User",
              customer_email: body.data?.customer_email || "webhook@example.com",
              interview_status: "active",
              interview_progress: "started",
              source_url: body.data?.url || "webhook",
            })
            .select("id")
            .single();
          
          if (sessionError) {
            console.error("Failed to create interview session:", sessionError);
          } else {
            interviewSessionId = newSession.id;
            console.log("Created interview session from webhook:", interviewSessionId);
          }
        }

        // Update company integration status and last event timestamp
        const { error: updateError } = await supabase
          .from("companies")
          .update({
            last_event_at: new Date().toISOString(),
            integration_status: "listening_for_events",
          })
          .eq("id", companyId);

        if (updateError) {
          console.error("Failed to update company integration status:", updateError);
        }

        // Also update the webhook integration status in integrations table
        const { error: integrationUpdateError } = await supabase
          .from("integrations")
          .update({
            status: "listening_for_events",
            last_event_at: new Date().toISOString(),
          })
          .eq("company_id", companyId)
          .eq("integration_type", "webhook");

        if (integrationUpdateError) {
          console.error("Failed to update webhook integration status:", integrationUpdateError);
        }

        return new Response(JSON.stringify({ 
          success: true, 
          interviewSessionId: interviewSessionId 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error("Webhook error:", error);
        return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
    
    return new Response('Method Not Allowed', { status: 405 });
  }
  
  return await next();
});

// API middleware to handle raw API handlers
// Note: Integration endpoints will be implemented as server functions instead
const apiMiddleware = createMiddleware().server(async ({ next }) => {
  return await next();
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [corsMiddleware, apiMiddleware, errorMiddleware],
}));
