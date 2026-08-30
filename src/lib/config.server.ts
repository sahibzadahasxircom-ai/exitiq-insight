import process from "node:process";

// Server-only config. The .server.ts suffix prevents Vite from bundling
// this file into the client — values here never reach the browser.
//
// On Cloudflare Workers, env binds at REQUEST time. Module-scope reads
// (e.g. `const x = process.env.X`) resolve to undefined — always read
// process.env INSIDE a function or handler.
//
// When to use which env-access pattern:
//   - .server.ts module (this file): server-only helpers reused across
//     handlers. Wrap reads in a function so they run per-request.
//   - inline process.env inside a createServerFn handler: one-off reads
//     not reused elsewhere.
//   - import.meta.env.VITE_FOO: PUBLIC config readable from both client
//     and server (analytics IDs, public URLs). Define in .env with the
//     VITE_ prefix. Never put secrets here — they ship to the browser.

export function getServerConfig() {
  const appUrl = process.env.VITE_APP_URL || 'http://localhost:8080';
  const isLocal = appUrl.includes('localhost') || appUrl.includes('127.0.0.1');

  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    appUrl,
    apiUrl: process.env.VITE_API_URL || (isLocal ? 'http://localhost:8080' : appUrl),
    widgetUrl: process.env.VITE_WIDGET_URL || (isLocal ? 'http://localhost:8080/widget.js' : `${appUrl}/widget.js`),
    webhookUrl: process.env.VITE_WEBHOOK_URL || (isLocal ? 'http://localhost:8080/api/webhook' : `${appUrl}/api/webhook`),
    // Stripe configuration (server-side only)
    stripeClientId: process.env.STRIPE_CLIENT_ID,
    stripeClientSecret: process.env.STRIPE_CLIENT_SECRET,
    stripeRedirectUri: process.env.STRIPE_REDIRECT_URI || `${appUrl}/api/integrations/stripe/oauth/callback`,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    // AI configuration
    geminiApiKey: process.env.GEMINI_API_KEY,
    // Security
    encryptionKey: process.env.ENCRYPTION_KEY,
  };
}
