# ExitIQ Integration System - Setup Guide

This guide explains how to set up and configure the production-grade integration system for ExitIQ.

## Overview

ExitIQ supports four types of integrations:

1. **Stripe Connect OAuth** - Real OAuth flow for Stripe account connection
2. **REST API** - Secure API key-based integration with Bearer authentication
3. **JavaScript Widget** - Client-side widget for tracking user events
4. **Webhooks** - Incoming webhook support for multiple platforms

## Prerequisites

- Supabase project with database migrations applied
- Stripe Connect application (for Stripe integration)
- Environment variables configured

## Database Setup

Run the integration migration in your Supabase SQL Editor:

```sql
-- Run the contents of: supabase/migrations/20240714_integrations.sql
```

This creates the following tables:
- `integrations` - Integration status and configuration
- `stripe_connections` - Encrypted Stripe OAuth tokens
- `api_keys` - Encrypted API keys with scopes
- `webhooks` - Webhook configurations
- `webhook_events` - Incoming webhook event logs
- `widget_installations` - JavaScript widget installations
- `oauth_states` - OAuth state tokens for CSRF protection

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Required
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ENCRYPTION_KEY=your_secure_encryption_key

# Stripe (required for Stripe integration)
STRIPE_CLIENT_ID=your_stripe_client_id
STRIPE_CLIENT_SECRET=your_stripe_client_secret
STRIPE_REDIRECT_URI=https://your-app-domain.com/api/integrations/stripe/oauth/callback

# AI (required for interview functionality)
GEMINI_API_KEY=your_gemini_api_key
```

### Generate Encryption Key

```bash
openssl rand -base64 32
```

## Stripe Connect Setup

### 1. Create Stripe Connect Application

1. Go to [Stripe Connect](https://connect.stripe.com/)
2. Create a new Connect application
3. Configure redirect URI: `https://your-domain.com/api/integrations/stripe/oauth/callback`
4. Copy Client ID and Client Secret to environment variables

### 2. Configure Webhook Events

After connecting Stripe, configure these webhook events:
- `customer.subscription.deleted`
- `customer.subscription.updated`
- `customer.subscription.created`
- `checkout.session.completed`
- `invoice.payment_failed`
- `invoice.paid`

## API Integration Setup

### Generate API Key

Call the API key generation endpoint:

```bash
POST /api/integrations/api-keys/generate
{
  "companyId": "your-company-id",
  "name": "Production API Key",
  "scopes": ["events", "customers", "subscriptions", "cancellations"]
}
```

Response:
```json
{
  "success": true,
  "apiKey": "eq_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "keyPrefix": "eq_live_",
  "keyId": "uuid",
  "scopes": ["events", "customers", "subscriptions", "cancellations"]
}
```

### Use API Key

Include in Authorization header:

```bash
Authorization: Bearer eq_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### API Endpoints

#### Send Event
```bash
POST /api/v1/events
Authorization: Bearer your_api_key
{
  "eventType": "cancellation",
  "customerId": "customer_123",
  "customerEmail": "user@example.com",
  "customerName": "John Doe",
  "subscriptionId": "sub_123"
}
```

#### Create Customer
```bash
POST /api/v1/customers
Authorization: Bearer your_api_key
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

#### Create Subscription
```bash
POST /api/v1/subscriptions
Authorization: Bearer your_api_key
{
  "customerId": "customer_123",
  "planId": "pro",
  "status": "active",
  "amount": 29.99
}
```

#### Handle Cancellation
```bash
POST /api/v1/cancellations
Authorization: Bearer your_api_key
{
  "customerId": "customer_123",
  "subscriptionId": "sub_123",
  "reason": "Too expensive"
}
```

## JavaScript Widget Setup

### Installation

Add this snippet to your website before the closing `</body>` tag:

```html
<script src="https://cdn.exitiq.com/widget.js"></script>
<script>
  ExitIQ.init({
    apiKey: "eq_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    domain: "your-domain.com"
  });
</script>
```

### Track Events

```javascript
// Track cancellation button click
document.querySelector('[data-exitiq-trigger="cancel"]').addEventListener('click', () => {
  ExitIQ.track('cancel', {
    email: 'user@example.com',
    name: 'John Doe'
  });
});

// Track logout
ExitIQ.track('logout', {
  email: 'user@example.com'
});

// Track custom events
ExitIQ.track('downgrade', {
  plan: 'pro',
  newPlan: 'basic'
});
```

### Verify Installation

```bash
POST /api/integrations/javascript/verify
{
  "companyId": "your-company-id",
  "domain": "your-domain.com",
  "apiKey": "eq_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

## Webhook Integration Setup

### Generate Webhook URL

```bash
POST /api/integrations/webhooks/generate
{
  "companyId": "your-company-id",
  "sourcePlatform": "stripe"
}
```

Response:
```json
{
  "success": true,
  "webhookId": "uuid",
  "webhookUrl": "https://api.exitiq.com/webhooks/xxxxxxxx",
  "webhookSecret": "base64_secret",
  "sourcePlatform": "stripe"
}
```

### Configure in Your Platform

Add the webhook URL to your billing platform settings:
- **Stripe**: Dashboard → Developers → Webhooks → Add endpoint
- **Paddle**: Dashboard → Developer tools → Webhooks
- **Chargebee**: Settings → Configure Webhooks
- **Custom**: Configure in your billing system

### Webhook Signature Verification

ExitIQ automatically verifies webhook signatures using the secret.

### Supported Platforms

- Stripe
- Paddle
- Chargebee
- Lemon Squeezy
- Recurly
- Custom systems

## Security Features

### Encryption

All sensitive data is encrypted using AES-256-GCM:
- Stripe OAuth tokens
- API keys
- Webhook secrets
- Refresh tokens

### Authentication

- API keys use SHA-256 hashing for storage
- Bearer token authentication for REST API
- OAuth state tokens for CSRF protection
- Webhook signature verification

### Rate Limiting

Configure rate limiting in your reverse proxy or API gateway.

## Integration Management

### View Integrations

Navigate to `/integrations` in your dashboard to see all connected integrations.

### Disconnect Integration

```bash
POST /api/integrations/disconnect
{
  "companyId": "your-company-id",
  "integrationType": "stripe"
}
```

### Reconnect Integration

```bash
POST /api/integrations/reconnect
{
  "companyId": "your-company-id",
  "integrationType": "stripe"
}
```

## Troubleshooting

### Stripe OAuth Fails

- Verify redirect URI matches Stripe Connect settings
- Check that STRIPE_CLIENT_ID and STRIPE_CLIENT_SECRET are correct
- Ensure ENCRYPTION_KEY is set

### API Key Validation Fails

- Verify API key is active in database
- Check that key hasn't expired
- Ensure Bearer token format is correct

### Webhook Events Not Received

- Verify webhook URL is configured correctly
- Check webhook secret matches
- Ensure webhook is active in database
- Check webhook event logs in dashboard

### JavaScript Widget Not Verified

- Ensure widget is loaded on the correct domain
- Check that API key is valid
- Verify widget is sending events
- Check browser console for errors

## Monitoring

### Check Integration Status

```sql
SELECT * FROM integrations WHERE company_id = 'your-company-id';
```

### View Webhook Events

```sql
SELECT * FROM webhook_events 
WHERE company_id = 'your-company-id' 
ORDER BY received_at DESC 
LIMIT 10;
```

### View API Key Usage

```sql
SELECT * FROM api_keys 
WHERE company_id = 'your-company-id';
```

## API Documentation

Full API documentation is available at `/api/docs` (if configured) or by inspecting the route files in `src/routes/api/`.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review database logs in Supabase
3. Check browser console for client-side errors
4. Review server logs for backend errors
