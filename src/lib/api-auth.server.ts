import { createClient } from "@supabase/supabase-js";
import { hashApiKey } from "./crypto.server";

/**
 * Authentication middleware for REST API endpoints
 * Validates Bearer token (API key) and returns company context
 */

export interface AuthContext {
  companyId: string;
  keyId: string;
  keyPrefix: string;
  scopes: string[];
  name: string;
}

export interface AuthResult {
  success: boolean;
  context?: AuthContext;
  error?: string;
}

/**
 * Extract and validate Bearer token from Authorization header
 */
export async function authenticateRequest(
  authorizationHeader: string | null
): Promise<AuthResult> {
  if (!authorizationHeader) {
    return {
      success: false,
      error: "Missing Authorization header",
    };
  }

  // Extract Bearer token
  const parts = authorizationHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return {
      success: false,
      error: "Invalid Authorization header format. Expected: Bearer <api_key>",
    };
  }

  const apiKey = parts[1];

  if (!apiKey) {
    return {
      success: false,
      error: "Missing API key in Authorization header",
    };
  }

  // Get environment variables
  const encryptionKey = process.env.ENCRYPTION_KEY;

  if (!encryptionKey) {
    return {
      success: false,
      error: "Server configuration error",
    };
  }

  // Initialize Supabase client
  const supabaseUrl = process.env.VITE_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Hash the provided API key
  const apiKeyHash = hashApiKey(apiKey);

  // Look up the API key in database
  const { data: apiKeyData, error: lookupError } = await supabase
    .from("api_keys")
    .select("*")
    .eq("key_hash", apiKeyHash)
    .eq("is_active", true)
    .single();

  if (lookupError || !apiKeyData) {
    return {
      success: false,
      error: "Invalid or inactive API key",
    };
  }

  // Check if API key has expired
  if (apiKeyData.expires_at && new Date(apiKeyData.expires_at) < new Date()) {
    return {
      success: false,
      error: "API key has expired",
    };
  }

  // Update last used timestamp
  await supabase
    .from("api_keys")
    .update({
      last_used_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", apiKeyData.id);

  // Return authentication context
  return {
    success: true,
    context: {
      companyId: apiKeyData.company_id,
      keyId: apiKeyData.id,
      keyPrefix: apiKeyData.key_prefix,
      scopes: apiKeyData.scopes,
      name: apiKeyData.name,
    },
  };
}

/**
 * Check if the authenticated context has required scope
 */
export function hasScope(context: AuthContext, requiredScope: string): boolean {
  return context.scopes.includes(requiredScope);
}

/**
 * Check if the authenticated context has any of the required scopes
 */
export function hasAnyScope(context: AuthContext, requiredScopes: string[]): boolean {
  return requiredScopes.some(scope => context.scopes.includes(scope));
}

/**
 * Error response helper for authentication failures
 */
export function authErrorResponse(error: string): Response {
  return new Response(
    JSON.stringify({
      error: "Authentication failed",
      message: error,
    }),
    {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

/**
 * Error response helper for authorization failures (missing scope)
 */
export function authorizationErrorResponse(requiredScope: string): Response {
  return new Response(
    JSON.stringify({
      error: "Authorization failed",
      message: `Missing required scope: ${requiredScope}`,
    }),
    {
      status: 403,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
