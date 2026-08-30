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
        
        return new Response(JSON.stringify({ success: true }), {
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
