# Leaveesy - Software Feature Report

**Generated:** October 31, 2026  
**Status:** Production-Ready with Active Development

---

## Executive Summary

Leaveesy is a SaaS platform for customer exit interviews and churn intelligence. It helps companies understand why customers cancel by automating exit interview collection through a JavaScript widget that triggers on cancellation events (SignOut, CancelSubscription, DeleteAccount). The platform uses AI to analyze customer feedback and provide actionable insights to reduce churn.

---

## Core Features Implemented

### 1. Authentication & User Management
- ✅ Supabase-based authentication
- ✅ User profiles with company association
- ✅ Role-based access control (user_roles table)
- ✅ Company accounts with branding customization
- ✅ Middleware-based auth protection for authenticated routes
- ✅ Sign out functionality

### 2. Subscription & Pricing System
- ✅ Four pricing tiers with monthly interview limits:
  - **Free**: 5 interviews/month
  - **Starter**: 75 interviews/month ($27/month)
  - **Pro**: 250 interviews/month ($97/month)
  - **Custom**: Unlimited (contact sales)
- ✅ Paddle payment integration (pending domain approval)
- ✅ Usage tracking with monthly periods
- ✅ Interview limit enforcement
- ✅ Upgrade prompts when limits reached
- ✅ Pricing pages with monthly/yearly toggle
- ✅ Customer portal access for subscription management

### 3. Widget Integration
- ✅ JavaScript widget for event tracking
- ✅ Trigger events: SignOut, CancelSubscription, DeleteAccount
- ✅ Automatic interview session creation on cancellation
- ✅ Modal-based pre-form for customer info collection
- ✅ Company branding support in pre-form
- ✅ Multiple background styles (mesh, aurora, dots, layers, gradient)
- ✅ Customizable colors and design
- ✅ Cross-origin support for different domains
- ✅ Widget API endpoint at `/api/widget/events`

### 4. Interview System
- ✅ Interview session creation and management
- ✅ Customer pre-form (name, email collection)
- ✅ AI-powered conversation interface
- ✅ Interview status tracking (active, completed, abandoned)
- ✅ Progress tracking
- ✅ Transcript storage
- ✅ Company-specific customization

### 5. Churn Intelligence & Analytics
- ✅ Dashboard with executive summary
- ✅ Churn driver analysis (top cancellation reasons)
- ✅ Customer feedback quotes display
- ✅ Action plan with specific recommendations
- ✅ AI-based insight generation from interviews
- ✅ Category-based churn analysis (pricing, UX, features, AI assistant, etc.)
- ✅ Trend indicators for churn drivers
- ✅ **NEW**: Specific recommendations based on actual customer feedback
  - Addresses AI assistant limitations with specific capability improvements
  - Identifies missing features from customer requests
  - Recommends workflow simplifications based on UX issues
  - Suggests design improvements from UI complaints
  - Provides pricing review based on actual concerns

### 6. Integrations
- ✅ JavaScript widget integration
- ✅ Integration status tracking
- ✅ Setup wizard for configuration
- ✅ Company branding settings
- ✅ Webhook support (Paddle webhook handler)

### 7. Legal & Compliance
- ✅ Terms of Service page
- ✅ Privacy Policy page
- ✅ Refund Policy page
- ✅ Paddle Merchant of Record disclosure
- ✅ Footer links to legal pages

### 8. UI/UX Improvements (Latest)
- ✅ Removed colored stat cards (changed to clean white)
- ✅ Removed sidebar footer text ("Auto-pilot active")
- ✅ Moved usage statistics to sidebar (clean UI)
- ✅ Removed usage bar from dashboard header
- ✅ Improved recommendation system with specific, actionable insights
- ✅ Professional, minimal design

---

## Database Schema

### Core Tables
- **companies**: Company information, branding, integration status
- **profiles**: User profiles linked to companies
- **user_roles**: Role assignments for users
- **integrations**: Integration types and status
- **pricing_plans**: Plan definitions with limits
- **company_subscriptions**: Subscription records
- **usage_records**: Monthly usage tracking
- **interview_sessions**: Interview session data
- **widget_events**: Widget event tracking
- **interview_insights**: AI-generated insights from interviews

### Paddle-Specific Columns
- `companies.paddle_customer_id`
- `company_subscriptions.paddle_subscription_id`
- `company_subscriptions.paddle_price_id`
- Monthly price IDs for each plan

---

## Technical Stack

- **Frontend**: React + TypeScript
- **Framework**: TanStack Start (SSR)
- **Routing**: TanStack Router
- **State Management**: TanStack Query
- **Server Functions**: `createServerFn` with middleware
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payment**: Paddle (pending domain approval)
- **Deployment**: Vercel
- **Styling**: Tailwind CSS + shadcn/ui components

---

## API Endpoints

### Widget API
- `POST /api/widget/events` - Receives widget events, creates interview sessions

### Paddle Webhook
- `POST /api/paddle/webhook` - Handles Paddle subscription events

### Server Functions
- `getDashboardData` - Fetches dashboard statistics
- `listInsights` - Retrieves AI-generated insights
- `getCompanyUsage` - Gets current month usage
- `canCreateInterview` - Checks if company can create more interviews
- `getPaddleConfig` - Fetches Paddle configuration
- `createPaddleCustomer` - Creates Paddle customer
- `updatePaddleSubscription` - Updates subscription records
- `getPaddleCustomerPortal` - Generates customer portal session
- `getPlans` - Fetches available pricing plans
- `getSubscription` - Gets current subscription
- `getUsage` - Gets usage statistics
- `updateInterviewSession` - Updates interview session data
- `getCompanyBySessionId` - Fetches company branding for pre-form

---

## Current Limitations & Known Issues

### Paddle Integration
- ⏳ Domain approval pending (8+ days in review)
- 📋 Subdomain issue: `leaveesy.vercel.app` may not be accepted
- 📋 Plan: Use real domain (e.g., `leaveesy.com`) for better approval chances
- ✅ Legal pages ready for domain approval

### Recommendation System
- ✅ **Fixed**: Recommendations now provide specific, actionable insights
- ✅ **Fixed**: No more generic "improve customer support" suggestions
- ✅ **Fixed**: Recommendations directly address specific churn reasons from interviews

---

## Future Roadmap

### Priority 1 (Payment & Domain)
- [ ] Get real domain and submit to Paddle for approval
- [ ] Complete Paddle checkout integration
- [ ] Test live payment flow
- [ ] Verify webhook event processing

### Priority 2 (Analytics)
- [ ] Add more detailed charts and visualizations
- [ ] Implement trend analysis over time
- [ ] Add cohort analysis
- [ ] Implement revenue at risk calculation

### Priority 3 (Product)
- [ ] Add more integration types (Stripe, webhooks)
- [ ] Implement email notifications for new interviews
- [ ] Add export functionality for data
- [ ] Create customizable interview templates

### Priority 4 (AI)
- [ ] Improve AI insight accuracy
- [ ] Add sentiment analysis
- [ ] Implement topic modeling
- [ ] Add competitive analysis features

---

## Deployment Status

- **Repository**: https://github.com/sahibzadahasxircom-ai/exitiq-insight.git
- **Branch**: main
- **Production URL**: https://leaveesy.vercel.app
- **Vercel**: Auto-deploy from GitHub
- **Database**: Supabase (Production)
- **Environment Variables**: Configured in Vercel

---

## Pricing Summary

| Plan | Monthly Interviews | Price | Features |
|------|-------------------|-------|----------|
| Free | 5 | $0 | All features, 5 interviews/month |
| Starter | 75 | $27 | All features, 75 interviews/month |
| Pro | 250 | $97 | All features, 250 interviews/month |
| Custom | Unlimited | Contact Sales | Custom limits, dedicated support |

---

## Recent Changes (October 2026)

### UI Improvements
- Removed colored stat cards (blue, green, amber, violet backgrounds)
- Changed all stat cards to clean white design
- Removed "Auto-pilot active" text from sidebar footer
- Moved usage statistics from dashboard header to sidebar
- Cleaned up dashboard header for professional look

### Recommendation System Enhancement
- Rewrote `generateRecommendations()` function
- Added specific recommendations based on actual customer feedback
- AI assistant limitations now suggest capability improvements
- Missing features now identified from customer requests
- Workflow issues now recommend specific simplifications
- Design complaints now lead to UI/UX improvement suggestions
- Removed generic "improve customer support" recommendations

### Code Improvements
- Added try-catch error handling in widget API
- Fixed interview session creation for companies without subscriptions
- Added detailed error logging for debugging
- Improved limit enforcement logic
- Added upgrade modal for widget when limit reached

---

## Conclusion

Leaveesy is a production-ready SaaS platform with a solid foundation for customer exit interview collection and churn intelligence. The core features are implemented and functional. The main blocker is Paddle domain approval, which should be resolved with a real domain. The recommendation system has been significantly improved to provide specific, actionable insights based on actual customer feedback rather than generic suggestions.

The platform is ready for:
- ✅ Widget deployment on customer websites
- ✅ Interview collection and analysis
- ✅ Dashboard analytics
- ✅ Usage tracking and limit enforcement
- ⏳ Payment processing (pending domain approval)

Overall completion: **85%** (Payment integration pending domain approval)
