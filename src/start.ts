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
        
        // If this is a SignOut event, create an interview session
        let interviewSessionId = null;
        if (body.event_name === "SignOut") {
          console.log("SignOut event detected, creating interview session");
          
          // Check if there's already an active interview session for this company from the same URL
          const { data: existingSession, error: existingError } = await supabase
            .from("interview_sessions")
            .select("id")
            .eq("company_id", body.company_id)
            .eq("interview_status", "active")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          
          if (existingError) {
            console.error("Error checking existing session:", existingError);
          }
          
          if (existingSession) {
            interviewSessionId = existingSession.id;
            console.log("Using existing active interview session:", interviewSessionId);
          } else {
            // Create a new interview session
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
