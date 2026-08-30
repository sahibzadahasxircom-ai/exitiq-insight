// Client-side configuration utility
// This file is safe to import in both client and server code
// Only uses VITE_ prefixed env vars which are safe for the browser

export function getAppConfig() {
  const appUrl = import.meta.env.VITE_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8080');
  
  // For local development, default to localhost
  const isLocal = appUrl.includes('localhost') || appUrl.includes('127.0.0.1');
  
  return {
    appUrl,
    apiUrl: import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:8080' : appUrl),
    widgetUrl: import.meta.env.VITE_WIDGET_URL || (isLocal ? 'http://localhost:8080/widget.js' : `${appUrl}/widget.js`),
    webhookUrl: import.meta.env.VITE_WEBHOOK_URL || (isLocal ? 'http://localhost:8080/api/webhook' : `${appUrl}/api/webhook`),
  };
}

// Helper to get widget script URL with company ID
export function getWidgetScriptUrl(companyId: string): string {
  const { widgetUrl } = getAppConfig();
  // If widgetUrl already has query params, append, otherwise add
  const separator = widgetUrl.includes('?') ? '&' : '?';
  return `${widgetUrl}${separator}data-company-id=${companyId}`;
}

// Helper to get webhook URL for a company
export function getWebhookUrl(companyId: string): string {
  const { webhookUrl } = getAppConfig();
  return `${webhookUrl}/${companyId}`;
}
