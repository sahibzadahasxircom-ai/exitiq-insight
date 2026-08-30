// Mock intelligence data for Leaveesy founder dashboard.
// Replace with live AI-generated data later; keep the shape identical.

export type Sentiment = "positive" | "neutral" | "frustrated" | "angry";
export type Priority = "critical" | "high" | "medium" | "low";
export type Retention = "high" | "medium" | "low";
export type Trend = "up" | "down" | "flat";

export type CategoryKey =
  | "pricing" | "ux" | "performance" | "features" | "support"
  | "onboarding" | "bugs" | "competitor" | "billing" | "integrations"
  | "not_needed" | "other";

export const CATEGORY_LABEL: Record<CategoryKey, string> = {
  pricing: "Pricing",
  ux: "UX & Design",
  performance: "Performance",
  features: "Missing Features",
  support: "Support",
  onboarding: "Onboarding",
  bugs: "Bugs",
  competitor: "Competitors",
  billing: "Billing",
  integrations: "Integration Problems",
  not_needed: "No Longer Needed",
  other: "Other",
};

export interface MockMessage {
  role: "assistant" | "user";
  content: string;
  ts: string; // ISO
}

export interface MockInterview {
  id: string;
  customer_name: string;
  customer_email: string;
  company: string;
  plan: "Starter" | "Growth" | "Scale" | "Enterprise";
  country: string;
  segment: "SMB" | "Mid-market" | "Enterprise";
  mrr: number;
  started_at: string;
  completed_at: string;
  duration_min: number;
  status: "completed" | "active" | "abandoned";

  // Intelligence
  executive_summary: string;
  primary_reason: string;
  category: CategoryKey;
  secondary_factors: string[];
  root_cause: string;
  sentiment: Sentiment;
  sentiment_confidence: number; // 0-1
  competitor?: string;
  competitor_reason?: string;
  requested_features: string[];
  pain_points: string[];
  workflow_problems: string[];
  onboarding_issues: string[];
  support_issues: string[];
  pricing_concerns: string[];
  expectation_gap?: string;
  retention_opportunity: Retention;
  revenue_impact: number;
  ai_confidence: number; // 0-1
  priority: Priority;
  recommended_actions: string[];
  tags: string[];

  transcript: MockMessage[];
}

const NAMES = [
  ["Sarah Chen", "sarah.chen@brightloop.io", "Brightloop"],
  ["Marcus Alvarez", "marcus@northstack.co", "Northstack"],
  ["Priya Raman", "priya.r@fernway.com", "Fernway"],
  ["Elena Kowalski", "elena@vela-labs.com", "Vela Labs"],
  ["Tomás Ribeiro", "tomas@harborhq.com", "Harbor HQ"],
  ["Aisha Bello", "aisha@lumenkit.io", "Lumenkit"],
  ["Ryan O'Neill", "ryan@arcstudio.co", "Arc Studio"],
  ["Mei Watanabe", "mei@paperplane.dev", "Paperplane"],
  ["Jonas Berg", "jonas@nordicflow.se", "Nordicflow"],
  ["Fatima Haddad", "fatima@atlasgrid.com", "Atlasgrid"],
  ["Diego Fuentes", "diego@quantalane.com", "Quantalane"],
  ["Hannah Weber", "hannah@modeltrail.io", "Modeltrail"],
  ["Kwame Owusu", "kwame@ledgerbay.com", "Ledgerbay"],
  ["Ines Lambert", "ines@nimbusframe.co", "Nimbusframe"],
  ["Amir Nazari", "amir@relaystack.io", "Relaystack"],
  ["Yuki Tanaka", "yuki@dovetailops.com", "Dovetail Ops"],
  ["Rachel Adler", "rachel@bramblewire.com", "Bramblewire"],
  ["Oliver Grant", "oliver@fernrun.co", "Fernrun"],
  ["Zara Malik", "zara@piperbase.io", "Piperbase"],
  ["Noah Delacroix", "noah@caravelhq.com", "Caravel HQ"],
  ["Sofia Rossi", "sofia@meridianfox.com", "Meridian Fox"],
  ["Ethan Park", "ethan@stackorbit.io", "Stackorbit"],
  ["Leila Farah", "leila@haloframe.co", "Haloframe"],
  ["Kai Andersen", "kai@nordwave.io", "Nordwave"],
];

const PLANS: MockInterview["plan"][] = ["Starter", "Growth", "Scale", "Enterprise"];
const COUNTRIES = ["US", "UK", "DE", "FR", "CA", "AU", "BR", "IN", "JP", "SE"];
const SEGMENTS: MockInterview["segment"][] = ["SMB", "Mid-market", "Enterprise"];

// Scenario templates — realistic, varied intelligence.
type Scenario = Omit<MockInterview,
  "id" | "customer_name" | "customer_email" | "company" | "plan" | "country" |
  "segment" | "mrr" | "started_at" | "completed_at" | "duration_min" | "status" | "transcript"
> & { transcript_seed: [string, string][] };

const SCENARIOS: Scenario[] = [
  {
    executive_summary:
      "Churned to Notion after 4 months. Team-wide adoption stalled because docs and tasks live in separate tools. Would have stayed with a native docs surface.",
    primary_reason: "Fragmented workspace — needs docs and tasks in one place",
    category: "competitor",
    secondary_factors: ["Weak search across content", "No inline collaboration on docs"],
    root_cause: "Missing unified docs surface forces context switching",
    sentiment: "neutral",
    sentiment_confidence: 0.86,
    competitor: "Notion",
    competitor_reason: "All-in-one workspace; team already had accounts",
    requested_features: ["Native docs", "Bi-directional linking", "Global search"],
    pain_points: ["Docs in a second tool", "Search misses attachments"],
    workflow_problems: ["Weekly planning happens in Notion, tasks live here"],
    onboarding_issues: [],
    support_issues: [],
    pricing_concerns: [],
    expectation_gap: "Expected native docs based on landing page",
    retention_opportunity: "high",
    revenue_impact: 4788,
    ai_confidence: 0.92,
    priority: "high",
    recommended_actions: [
      "Ship a minimal docs surface with backlinks in Q3",
      "Add cross-content global search",
      "Offer 20% discount to at-risk Notion evaluators",
    ],
    tags: ["notion", "docs", "workspace", "high-value"],
    transcript_seed: [
      ["assistant", "Thanks for making the time. What pushed you to cancel today?"],
      ["user", "Honestly the team just kept drifting back to Notion for planning. Splitting docs and tasks got exhausting."],
      ["assistant", "When did that split start to bite?"],
      ["user", "About two months in. Once we hit ~20 pages of specs, search stopped surfacing anything useful."],
      ["assistant", "If we shipped a native docs surface with backlinks, would that have kept you?"],
      ["user", "Probably yes. That was the main thing."],
    ],
  },
  {
    executive_summary:
      "SMB on Growth plan cancelled citing price after a competitor undercut them. Value perception dropped when their usage plateaued in month 3.",
    primary_reason: "Perceived price-to-value gap at plan cap",
    category: "pricing",
    secondary_factors: ["Usage plateau", "Cheaper alternative appeared"],
    root_cause: "Growth plan pricing not aligned with SMB usage patterns",
    sentiment: "frustrated",
    sentiment_confidence: 0.79,
    competitor: "Airtable",
    competitor_reason: "40% cheaper for the same seat count",
    requested_features: ["Usage-based billing", "Annual discount"],
    pain_points: ["Paying for seats we don't use"],
    workflow_problems: [],
    onboarding_issues: [],
    support_issues: [],
    pricing_concerns: ["Growth plan too steep", "No per-seat flexibility"],
    expectation_gap: "Expected consumption pricing after seeing docs",
    retention_opportunity: "high",
    revenue_impact: 2988,
    ai_confidence: 0.88,
    priority: "critical",
    recommended_actions: [
      "Introduce a per-seat SMB tier at $19/user",
      "Add annual billing with 20% off",
      "Trigger save-flow with 30% credit on cancel intent",
    ],
    tags: ["pricing", "airtable", "smb", "save-play"],
    transcript_seed: [
      ["assistant", "What made this the right time to cancel?"],
      ["user", "The renewal came up and honestly the price didn't match what we're getting anymore."],
      ["assistant", "Anything specific — seats, features, usage?"],
      ["user", "Half the seats haven't logged in for six weeks. We just don't need this many."],
      ["assistant", "Would a per-seat plan or annual discount have kept you?"],
      ["user", "Per-seat, yes. Annual, maybe."],
    ],
  },
  {
    executive_summary:
      "Enterprise customer left after repeated performance issues in the reporting module. Reports over 10k rows time out; blocks weekly exec review.",
    primary_reason: "Reporting performance blocking core workflow",
    category: "performance",
    secondary_factors: ["Slow initial load", "Timeouts on export"],
    root_cause: "Server-side aggregation not paginated for large datasets",
    sentiment: "angry",
    sentiment_confidence: 0.94,
    competitor: "Built in-house",
    competitor_reason: "Needed predictable performance at their scale",
    requested_features: ["Async export", "Materialized views", "Cached dashboards"],
    pain_points: ["Report timeouts", "Slow filter changes"],
    workflow_problems: ["Weekly exec review delayed 2h waiting on exports"],
    onboarding_issues: [],
    support_issues: ["3 tickets, no ETA"],
    pricing_concerns: [],
    expectation_gap: "Enterprise plan promised 'unlimited reporting'",
    retention_opportunity: "medium",
    revenue_impact: 24000,
    ai_confidence: 0.95,
    priority: "critical",
    recommended_actions: [
      "Ship async CSV export within 2 sprints",
      "Add materialized view for top 5 report shapes",
      "Assign named CSM to all Enterprise accounts",
    ],
    tags: ["performance", "enterprise", "reporting", "sev-1"],
    transcript_seed: [
      ["assistant", "What was the last straw?"],
      ["user", "Our Monday exec report timed out three weeks running. I can't defend the spend anymore."],
      ["assistant", "How large is the dataset when it fails?"],
      ["user", "Somewhere north of 30k rows. Anything past 10k is unusable."],
      ["assistant", "If exports moved to async and dashboards cached, would that change things?"],
      ["user", "It would, but I need to see it working before I come back."],
    ],
  },
  {
    executive_summary:
      "New user churned in trial after failing to complete setup. Blocked on Slack integration and gave up after 20 minutes.",
    primary_reason: "Failed activation — Slack integration blocker",
    category: "onboarding",
    secondary_factors: ["Unclear setup docs", "No in-product guidance"],
    root_cause: "Slack OAuth flow requires workspace admin — not communicated",
    sentiment: "frustrated",
    sentiment_confidence: 0.83,
    requested_features: ["In-app onboarding checklist", "Non-admin Slack fallback"],
    pain_points: ["Couldn't connect Slack without admin"],
    workflow_problems: [],
    onboarding_issues: ["Integration step blocked non-admins", "No fallback path"],
    support_issues: ["No response in 6h"],
    pricing_concerns: [],
    expectation_gap: "Landing page implied 2-minute setup",
    retention_opportunity: "high",
    revenue_impact: 588,
    ai_confidence: 0.9,
    priority: "high",
    recommended_actions: [
      "Add non-admin Slack invite flow",
      "Ship interactive onboarding checklist",
      "Auto-reply within 15m for trial users",
    ],
    tags: ["onboarding", "slack", "activation", "trial"],
    transcript_seed: [
      ["assistant", "Sorry setup didn't work out. Where did it break?"],
      ["user", "Slack. I'm not an admin so I couldn't connect it and I just gave up."],
      ["assistant", "Did you see any workaround in the setup screen?"],
      ["user", "No. Just a red error. I emailed support and heard nothing."],
      ["assistant", "If a non-admin Slack path existed, would you try again?"],
      ["user", "Yeah, honestly that's all I needed."],
    ],
  },
  {
    executive_summary:
      "Cancelled because product no longer fits — team pivoted away from the workflow this tool serves.",
    primary_reason: "No longer needed — internal pivot",
    category: "not_needed",
    secondary_factors: [],
    root_cause: "Customer roadmap change; not a product issue",
    sentiment: "neutral",
    sentiment_confidence: 0.72,
    requested_features: [],
    pain_points: [],
    workflow_problems: [],
    onboarding_issues: [],
    support_issues: [],
    pricing_concerns: [],
    retention_opportunity: "low",
    revenue_impact: 1188,
    ai_confidence: 0.86,
    priority: "low",
    recommended_actions: ["Add to win-back sequence in 6 months"],
    tags: ["pivot", "no-fit", "winback"],
    transcript_seed: [
      ["assistant", "What's changed for the team?"],
      ["user", "We stopped doing outbound so we don't need the sequences anymore."],
      ["assistant", "Anything about the product itself that we should know?"],
      ["user", "No, product's good. Just not what we do anymore."],
    ],
  },
  {
    executive_summary:
      "Mid-market team switched to Linear citing UX speed and keyboard-first flow. Sentiment on our UI was consistently negative.",
    primary_reason: "UI slowness and friction vs. competitor",
    category: "ux",
    secondary_factors: ["Slow keyboard shortcuts", "Cluttered nav"],
    root_cause: "Legacy navigation shell adds 200-400ms per interaction",
    sentiment: "frustrated",
    sentiment_confidence: 0.88,
    competitor: "Linear",
    competitor_reason: "Instant feel, cmd-k everywhere",
    requested_features: ["Command palette", "Faster navigation"],
    pain_points: ["Slow page transitions", "Too many clicks"],
    workflow_problems: ["Creating a ticket takes 5 clicks"],
    onboarding_issues: [],
    support_issues: [],
    pricing_concerns: [],
    retention_opportunity: "medium",
    revenue_impact: 5988,
    ai_confidence: 0.91,
    priority: "high",
    recommended_actions: [
      "Ship global command palette",
      "Audit navigation shell for perf regressions",
      "Reduce ticket creation to 2 clicks",
    ],
    tags: ["ux", "linear", "speed", "keyboard"],
    transcript_seed: [
      ["assistant", "You mentioned Linear — what did it do better?"],
      ["user", "Everything is a keystroke. Here I click through three menus for the same thing."],
      ["assistant", "If we shipped a command palette, would it matter?"],
      ["user", "It'd help. But the whole thing needs to feel snappier."],
    ],
  },
  {
    executive_summary:
      "Growth customer left over billing surprise. Auto-upgrade at seat threshold triggered a 3x invoice with no warning.",
    primary_reason: "Billing surprise from silent auto-upgrade",
    category: "billing",
    secondary_factors: ["No notification before upgrade", "Refund process slow"],
    root_cause: "Seat threshold auto-upgrade lacks proactive notification",
    sentiment: "angry",
    sentiment_confidence: 0.93,
    requested_features: ["Upgrade preview", "Seat alerts", "Manual approval"],
    pain_points: ["Surprise invoice"],
    workflow_problems: [],
    onboarding_issues: [],
    support_issues: ["Refund took 11 days"],
    pricing_concerns: ["Auto-upgrade felt predatory"],
    retention_opportunity: "medium",
    revenue_impact: 3588,
    ai_confidence: 0.94,
    priority: "critical",
    recommended_actions: [
      "Send seat-threshold email 7 days before upgrade",
      "Require admin approval for tier changes",
      "Auto-refund partial invoices within 48h",
    ],
    tags: ["billing", "trust", "auto-upgrade"],
    transcript_seed: [
      ["assistant", "What triggered the cancellation?"],
      ["user", "You silently moved us to the next tier and charged 3x. That's not okay."],
      ["assistant", "Did you get any notification before the change?"],
      ["user", "Nothing. Just the invoice."],
    ],
  },
  {
    executive_summary:
      "Cancelled because Zapier integration was flaky. Multi-step workflow broke twice per week; team lost trust.",
    primary_reason: "Unreliable Zapier integration",
    category: "integrations",
    secondary_factors: ["Silent failures", "No retry visibility"],
    root_cause: "Webhook signing rotation not backwards-compatible",
    sentiment: "frustrated",
    sentiment_confidence: 0.87,
    requested_features: ["Native integrations", "Failure alerts", "Retry logs"],
    pain_points: ["Zaps break silently"],
    workflow_problems: ["Lead routing missed 40+ prospects last month"],
    onboarding_issues: [],
    support_issues: ["Told 'issue is on Zapier side'"],
    pricing_concerns: [],
    retention_opportunity: "high",
    revenue_impact: 3588,
    ai_confidence: 0.9,
    priority: "high",
    recommended_actions: [
      "Ship native HubSpot + Salesforce connectors",
      "Add integration failure alerts",
      "Own end-to-end reliability for critical Zaps",
    ],
    tags: ["integrations", "zapier", "reliability"],
    transcript_seed: [
      ["assistant", "You mentioned integrations — what specifically broke?"],
      ["user", "Zapier. Our lead routing zap failed twice a week and no one told us."],
      ["assistant", "Would a native HubSpot connector have solved it?"],
      ["user", "Yes, that's what we actually needed."],
    ],
  },
  {
    executive_summary:
      "Customer hit a critical bug in bulk import; corrupted 200 records. Lost trust and cancelled after partial recovery.",
    primary_reason: "Critical data bug in bulk import",
    category: "bugs",
    secondary_factors: ["Slow recovery", "No audit log"],
    root_cause: "CSV parser silently truncates fields over 255 chars",
    sentiment: "angry",
    sentiment_confidence: 0.96,
    requested_features: ["Import validation preview", "Audit log", "Rollback"],
    pain_points: ["Corrupted records", "No rollback"],
    workflow_problems: [],
    onboarding_issues: [],
    support_issues: ["Response took 2 days"],
    pricing_concerns: [],
    retention_opportunity: "low",
    revenue_impact: 7188,
    ai_confidence: 0.97,
    priority: "critical",
    recommended_actions: [
      "Ship pre-import validation UI",
      "Add per-record audit log with rollback",
      "P0 SLA for data-loss tickets",
    ],
    tags: ["bug", "data-loss", "trust", "critical"],
    transcript_seed: [
      ["assistant", "What happened with the import?"],
      ["user", "It silently truncated 200 rows. We didn't catch it for a week."],
      ["assistant", "Was support able to recover the data?"],
      ["user", "Partially. Two days later. That's not acceptable at our scale."],
    ],
  },
  {
    executive_summary:
      "Requested features never shipped — customer cited roadmap uncertainty and left for a competitor.",
    primary_reason: "Missing SSO + audit log for their compliance requirement",
    category: "features",
    secondary_factors: ["No visible roadmap", "Sales couldn't commit to timelines"],
    root_cause: "Enterprise feature set incomplete for regulated buyers",
    sentiment: "neutral",
    sentiment_confidence: 0.81,
    competitor: "Notion",
    competitor_reason: "SSO and audit log shipping",
    requested_features: ["SAML SSO", "SOC 2 audit log", "SCIM provisioning"],
    pain_points: ["Compliance review blocked"],
    workflow_problems: [],
    onboarding_issues: [],
    support_issues: [],
    pricing_concerns: [],
    retention_opportunity: "medium",
    revenue_impact: 11988,
    ai_confidence: 0.89,
    priority: "high",
    recommended_actions: [
      "Ship SAML SSO by end of quarter",
      "Publish a public trust page",
      "Publish a rolling 90-day roadmap",
    ],
    tags: ["enterprise", "sso", "compliance", "roadmap"],
    transcript_seed: [
      ["assistant", "What blocked you from staying?"],
      ["user", "Our security team required SSO and an audit log. Neither had a date."],
      ["assistant", "Would a firm ship date have changed the decision?"],
      ["user", "Yes. We can wait a quarter, not indefinitely."],
    ],
  },
  {
    executive_summary:
      "Support quality drove churn — long response times and generic answers on a paid plan.",
    primary_reason: "Poor support experience on paid plan",
    category: "support",
    secondary_factors: ["Slow first response", "Canned answers"],
    root_cause: "No tier-aware queueing; paid tickets sit behind free",
    sentiment: "frustrated",
    sentiment_confidence: 0.85,
    requested_features: ["Priority support", "Named CSM"],
    pain_points: ["Slow responses"],
    workflow_problems: [],
    onboarding_issues: [],
    support_issues: ["48h+ response times", "Generic answers"],
    pricing_concerns: [],
    retention_opportunity: "high",
    revenue_impact: 2388,
    ai_confidence: 0.87,
    priority: "high",
    recommended_actions: [
      "Introduce tier-aware ticket routing",
      "Assign CSMs for Growth+ accounts",
      "Publish response-time SLAs",
    ],
    tags: ["support", "sla", "csm"],
    transcript_seed: [
      ["assistant", "What was the support experience like?"],
      ["user", "Two days for a first reply, then a copy-pasted answer. That's not what I'm paying for."],
    ],
  },
  {
    executive_summary:
      "Positive sentiment overall — team simply consolidated tools during budget review.",
    primary_reason: "Budget consolidation across tools",
    category: "not_needed",
    secondary_factors: ["Overlap with existing subscription"],
    root_cause: "External finance decision; not product-driven",
    sentiment: "positive",
    sentiment_confidence: 0.78,
    requested_features: [],
    pain_points: [],
    workflow_problems: [],
    onboarding_issues: [],
    support_issues: [],
    pricing_concerns: ["Duplicate spend with Notion"],
    retention_opportunity: "medium",
    revenue_impact: 1788,
    ai_confidence: 0.83,
    priority: "low",
    recommended_actions: [
      "Add to 90-day win-back sequence",
      "Send bundle discount if Notion contract lapses",
    ],
    tags: ["budget", "consolidation", "winback"],
    transcript_seed: [
      ["assistant", "Anything about the product that pushed you out?"],
      ["user", "Nope, we like it. Finance told us to cut overlapping tools this quarter."],
    ],
  },
];

function pick<T>(arr: T[], i: number): T { return arr[i % arr.length]; }

function daysAgo(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString();
}

function buildTranscript(seed: [string, string][], start: string): MockMessage[] {
  const startMs = new Date(start).getTime();
  return seed.map(([role, content], i) => ({
    role: role as "assistant" | "user",
    content,
    ts: new Date(startMs + i * 45_000).toISOString(),
  }));
}

// Deterministically build a rich set of interviews.
function buildInterviews(): MockInterview[] {
  const out: MockInterview[] = [];
  const total = 42;
  for (let i = 0; i < total; i++) {
    const [name, email, company] = pick(NAMES, i);
    const scenario = pick(SCENARIOS, i);
    const daysBack = 1 + Math.floor(i * 2.3) % 90;
    const started = daysAgo(daysBack);
    const durationMin = 4 + (i % 9);
    const completed = new Date(new Date(started).getTime() + durationMin * 60_000).toISOString();
    const plan = pick(PLANS, i + 1);
    const mrr = plan === "Enterprise" ? 2000 : plan === "Scale" ? 499 : plan === "Growth" ? 199 : 49;
    const status: MockInterview["status"] =
      i % 13 === 0 ? "active" : i % 17 === 0 ? "abandoned" : "completed";

    out.push({
      id: `mock-${String(i + 1).padStart(3, "0")}`,
      customer_name: name,
      customer_email: email,
      company,
      plan,
      country: pick(COUNTRIES, i + 2),
      segment: pick(SEGMENTS, i),
      mrr,
      started_at: started,
      completed_at: completed,
      duration_min: durationMin,
      status,
      ...scenario,
      // scale revenue impact by MRR a bit
      revenue_impact: Math.round(scenario.revenue_impact * (0.7 + ((i % 5) * 0.15))),
      transcript: buildTranscript(scenario.transcript_seed, started),
    });
  }
  return out;
}

export const MOCK_INTERVIEWS: MockInterview[] = buildInterviews();

// ---------- Aggregate intelligence ----------

const completed = MOCK_INTERVIEWS.filter((i) => i.status === "completed");
const active = MOCK_INTERVIEWS.filter((i) => i.status === "active");

export const KPIS = {
  total_interviews: MOCK_INTERVIEWS.length,
  completed_interviews: completed.length,
  active_interviews: active.length,
  customers_interviewed: new Set(MOCK_INTERVIEWS.map((i) => i.company)).size,
  revenue_lost: completed.reduce((s, i) => s + i.mrr * 12, 0),
  revenue_saveable: completed
    .filter((i) => i.retention_opportunity === "high")
    .reduce((s, i) => s + i.mrr * 12, 0),
  ai_health_score: 96, // %
  top_churn_category: "competitor" as CategoryKey,
  fastest_growing_category: "pricing" as CategoryKey,
};

// Category distribution
export const CATEGORY_DISTRIBUTION = Object.entries(
  completed.reduce<Record<string, number>>((acc, i) => {
    acc[i.category] = (acc[i.category] ?? 0) + 1;
    return acc;
  }, {}),
).map(([key, count]) => ({
  key: key as CategoryKey,
  label: CATEGORY_LABEL[key as CategoryKey],
  count,
  pct: Math.round((count / completed.length) * 100),
  revenue: completed.filter((i) => i.category === key).reduce((s, x) => s + x.mrr * 12, 0),
})).sort((a, b) => b.count - a.count);

// 12-month churn trend (mocked but shaped)
export const CHURN_TREND = [
  { month: "Jul", churned: 8, revenue: 5988, sentiment: 62, pricing: 1800, ux: 2200, features: 1988 },
  { month: "Aug", churned: 12, revenue: 8988, sentiment: 58, pricing: 2800, ux: 3200, features: 2988 },
  { month: "Sep", churned: 10, revenue: 7488, sentiment: 61, pricing: 2200, ux: 2700, features: 2588 },
  { month: "Oct", churned: 14, revenue: 12588, sentiment: 55, pricing: 4200, ux: 4600, features: 3788 },
  { month: "Nov", churned: 18, revenue: 15988, sentiment: 51, pricing: 5500, ux: 5800, features: 4688 },
  { month: "Dec", churned: 16, revenue: 14200, sentiment: 54, pricing: 4800, ux: 5200, features: 4200 },
  { month: "Jan", churned: 21, revenue: 21588, sentiment: 49, pricing: 7500, ux: 7800, features: 6288 },
  { month: "Feb", churned: 19, revenue: 18800, sentiment: 52, pricing: 6500, ux: 7000, features: 5300 },
  { month: "Mar", churned: 24, revenue: 26988, sentiment: 47, pricing: 9500, ux: 9800, features: 7688 },
  { month: "Apr", churned: 22, revenue: 22400, sentiment: 51, pricing: 8200, ux: 8600, features: 5600 },
  { month: "May", churned: 27, revenue: 31988, sentiment: 46, pricing: 12000, ux: 12500, features: 7488 },
  { month: "Jun", churned: 31, revenue: 38400, sentiment: 44, pricing: 14500, ux: 15000, features: 8900 },
];

export const INTERVIEW_VOLUME = CHURN_TREND.map((m) => ({
  month: m.month,
  interviews: Math.round(m.churned * (1.4 + Math.random() * 0.2)),
  completed: Math.round(m.churned * 0.86),
}));

export const SENTIMENT_DISTRIBUTION = [
  { label: "Positive", value: completed.filter((i) => i.sentiment === "positive").length },
  { label: "Neutral", value: completed.filter((i) => i.sentiment === "neutral").length },
  { label: "Frustrated", value: completed.filter((i) => i.sentiment === "frustrated").length },
  { label: "Angry", value: completed.filter((i) => i.sentiment === "angry").length },
];

// Competitors
export const COMPETITORS = (() => {
  const map = new Map<string, { name: string; mentions: number; revenue: number; reasons: Set<string>; features: Set<string> }>();
  for (const i of completed) {
    if (!i.competitor) continue;
    const entry = map.get(i.competitor) ?? { name: i.competitor, mentions: 0, revenue: 0, reasons: new Set<string>(), features: new Set<string>() };
    entry.mentions += 1;
    entry.revenue += i.mrr * 12;
    if (i.competitor_reason) entry.reasons.add(i.competitor_reason);
    i.requested_features.forEach((f) => entry.features.add(f));
    map.set(i.competitor, entry);
  }
  return [...map.values()]
    .map((c, idx) => ({
      name: c.name,
      mentions: c.mentions,
      revenue: c.revenue,
      reasons: [...c.reasons],
      features: [...c.features].slice(0, 5),
      trend: (["up", "up", "flat", "down"] as Trend[])[idx % 4],
    }))
    .sort((a, b) => b.mentions - a.mentions);
})();

// Feature requests
export const FEATURE_REQUESTS = (() => {
  const map = new Map<string, { name: string; count: number; revenue: number; customers: Set<string> }>();
  for (const i of completed) {
    for (const f of i.requested_features) {
      const entry = map.get(f) ?? { name: f, count: 0, revenue: 0, customers: new Set<string>() };
      entry.count += 1;
      entry.revenue += i.mrr * 12;
      entry.customers.add(i.company);
      map.set(f, entry);
    }
  }
  return [...map.values()]
    .map((f, idx) => ({
      name: f.name,
      mentions: f.count,
      revenue: f.revenue,
      customers: f.customers.size,
      priority: (f.revenue > 15000 ? "critical" : f.revenue > 8000 ? "high" : f.count > 2 ? "medium" : "low") as Priority,
      trend: (["up", "up", "flat", "up", "down"] as Trend[])[idx % 5],
    }))
    .sort((a, b) => b.revenue - a.revenue);
})();

// Root causes
export const ROOT_CAUSES = (() => {
  const map = new Map<string, { name: string; count: number; revenue: number; customers: Set<string>; category: CategoryKey; fix: string }>();
  const fixes: Record<string, string> = {
    "Fragmented workspace — needs docs and tasks in one place":
      "Ship a native docs surface with backlinks and unified search",
    "Perceived price-to-value gap at plan cap":
      "Introduce per-seat SMB pricing and annual discount",
    "Reporting performance blocking core workflow":
      "Async exports + materialized views for top report shapes",
    "Failed activation — Slack integration blocker":
      "Non-admin Slack invite flow + interactive onboarding checklist",
    "UI slowness and friction vs. competitor":
      "Global command palette + navigation shell perf audit",
    "Billing surprise from silent auto-upgrade":
      "Proactive seat-threshold alerts + admin approval for tier changes",
    "Unreliable Zapier integration":
      "Native HubSpot/Salesforce connectors + integration failure alerts",
    "Critical data bug in bulk import":
      "Pre-import validation UI + per-record audit log with rollback",
    "Missing SSO + audit log for their compliance requirement":
      "Ship SAML SSO and publish a public trust page this quarter",
    "Poor support experience on paid plan":
      "Tier-aware ticket routing + named CSMs for Growth+",
  };
  for (const i of completed) {
    const key = i.primary_reason;
    const entry = map.get(key) ?? { name: key, count: 0, revenue: 0, customers: new Set<string>(), category: i.category, fix: fixes[key] ?? i.recommended_actions[0] ?? "Investigate further" };
    entry.count += 1;
    entry.revenue += i.mrr * 12;
    entry.customers.add(i.company);
    map.set(key, entry);
  }
  return [...map.values()]
    .map((r, idx) => ({
      name: r.name,
      category: r.category,
      mentions: r.count,
      revenue: r.revenue,
      customers: r.customers.size,
      priority: (r.revenue > 15000 ? "critical" : r.revenue > 8000 ? "high" : "medium") as Priority,
      trend: (["up", "flat", "up", "down", "up"] as Trend[])[idx % 5],
      recommended_fix: r.fix,
    }))
    .sort((a, b) => b.revenue - a.revenue);
})();

// AI Recommendations synthesized across signals
export const RECOMMENDATIONS: Array<{
  id: string;
  problem: string;
  recommendation: string;
  expected_impact: string;
  priority: Priority;
  confidence: number;
  affected_revenue: number;
  affected_customers: number;
}> = [
  {
    id: "rec-1",
    problem: "31% of churn cites competitor with a unified docs+tasks surface (Notion).",
    recommendation: "Ship a native docs surface with backlinks and global search by end of Q3.",
    expected_impact: "Retains est. 22% of at-risk Growth accounts",
    priority: "critical",
    confidence: 0.92,
    affected_revenue: 38400,
    affected_customers: 14,
  },
  {
    id: "rec-2",
    problem: "SMB customers on Growth plan cite price-to-value gap when usage plateaus.",
    recommendation: "Introduce per-seat SMB tier at $19/user + annual discount.",
    expected_impact: "Reduces price-driven churn by est. 35%",
    priority: "critical",
    confidence: 0.88,
    affected_revenue: 21988,
    affected_customers: 9,
  },
  {
    id: "rec-3",
    problem: "Silent Zapier failures and lack of native connectors cause workflow breakage.",
    recommendation: "Ship native HubSpot & Salesforce connectors, add integration failure alerts.",
    expected_impact: "Saves est. $18k ARR from at-risk mid-market accounts",
    priority: "high",
    confidence: 0.9,
    affected_revenue: 17988,
    affected_customers: 7,
  },
  {
    id: "rec-4",
    problem: "Enterprise reporting times out on large datasets, blocking exec workflows.",
    recommendation: "Ship async CSV export and cached dashboards for top 5 report shapes.",
    expected_impact: "Removes #1 Enterprise churn driver",
    priority: "critical",
    confidence: 0.95,
    affected_revenue: 48000,
    affected_customers: 4,
  },
  {
    id: "rec-5",
    problem: "Compliance buyers blocked by missing SAML SSO and audit log.",
    recommendation: "Prioritise SAML SSO + trust page + rolling 90-day roadmap.",
    expected_impact: "Unblocks est. 6 enterprise deals worth $120k ARR",
    priority: "high",
    confidence: 0.87,
    affected_revenue: 23988,
    affected_customers: 5,
  },
  {
    id: "rec-6",
    problem: "Support latency on paid plans is repeatedly cited by frustrated churners.",
    recommendation: "Introduce tier-aware queueing and assign CSMs to Growth+ accounts.",
    expected_impact: "Improves paid-plan CSAT by est. 22 points",
    priority: "high",
    confidence: 0.84,
    affected_revenue: 14988,
    affected_customers: 8,
  },
];

// Intelligence Center: top cards
export const INTELLIGENCE_CARDS = [
  {
    title: "Top Root Cause",
    value: ROOT_CAUSES[0]?.name ?? "—",
    pct: ROOT_CAUSES[0] ? Math.round((ROOT_CAUSES[0].mentions / completed.length) * 100) : 0,
    customers: ROOT_CAUSES[0]?.customers ?? 0,
    revenue: ROOT_CAUSES[0]?.revenue ?? 0,
    priority: ROOT_CAUSES[0]?.priority ?? "medium",
    trend: "up" as Trend,
  },
  {
    title: "Most Requested Feature",
    value: FEATURE_REQUESTS[0]?.name ?? "—",
    pct: FEATURE_REQUESTS[0] ? Math.round((FEATURE_REQUESTS[0].mentions / completed.length) * 100) : 0,
    customers: FEATURE_REQUESTS[0]?.customers ?? 0,
    revenue: FEATURE_REQUESTS[0]?.revenue ?? 0,
    priority: FEATURE_REQUESTS[0]?.priority ?? "medium",
    trend: "up" as Trend,
  },
  {
    title: "Top Competitor",
    value: COMPETITORS[0]?.name ?? "—",
    pct: COMPETITORS[0] ? Math.round((COMPETITORS[0].mentions / completed.length) * 100) : 0,
    customers: COMPETITORS[0]?.mentions ?? 0,
    revenue: COMPETITORS[0]?.revenue ?? 0,
    priority: "high" as Priority,
    trend: "up" as Trend,
  },
  {
    title: "Highest Revenue Risk",
    value: ROOT_CAUSES[0]?.category ? CATEGORY_LABEL[ROOT_CAUSES[0].category] : "—",
    pct: 100,
    customers: completed.filter((i) => i.retention_opportunity === "high").length,
    revenue: completed
      .filter((i) => i.retention_opportunity === "high")
      .reduce((s, i) => s + i.mrr * 12, 0),
    priority: "critical" as Priority,
    trend: "up" as Trend,
  },
];

export function getMockInterview(id: string): MockInterview | undefined {
  return MOCK_INTERVIEWS.find((i) => i.id === id);
}

export function formatMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return `$${n}`;
}

// ---------- Executive narrative layer ----------

export const EXECUTIVE_BRIEFING = {
  headline:
    "41% of this week's cancellations trace back to workspace navigation problems introduced in the March redesign.",
  detail:
    "Customers on the Growth and Scale plans describe the new workspace as slower and harder to navigate. The pattern is concentrated in teams that adopted the product before Q1 — long-time users whose muscle memory broke. Every affected account cites the same three flows: creating a ticket, finding a saved view, and switching between projects.",
  driver: "Navigation & Discoverability regressions in the workspace redesign",
  product_area: "Workspace shell · global navigation · command surface",
  revenue_at_risk: 38400,
  affected_customers: 14,
  confidence: 0.93,
  next_best_action:
    "Ship a global command palette and restore one-click access to saved views. Roll a targeted re-onboarding email to pre-Q1 accounts within 10 days.",
  window: "Last 7 days · 27 completed interviews",
};

export const CUSTOMER_VOICE: Array<{ quote: string; attribution: string; category: CategoryKey }> = [
  { quote: "Honestly, I loved the product until the redesign made simple tasks difficult.", attribution: "Sarah C. · Growth plan · 14 months", category: "ux" },
  { quote: "Everything feels hidden now.", attribution: "Marcus A. · Scale plan · 22 months", category: "ux" },
  { quote: "The product is still powerful, but my workflow became slower.", attribution: "Priya R. · Growth plan · 9 months", category: "performance" },
  { quote: "We didn't leave because of price. We left because we couldn't get our team to actually use it.", attribution: "Elena K. · Enterprise · 7 months", category: "onboarding" },
  { quote: "Support answered in two days with a copy-paste. On a paid plan that's the answer.", attribution: "Ryan O. · Growth plan · 11 months", category: "support" },
  { quote: "Notion isn't better. It's just where the team already lives.", attribution: "Mei W. · Scale plan · 18 months", category: "competitor" },
  { quote: "The reports timed out three weeks in a row. I can't defend the spend.", attribution: "Tomás R. · Enterprise · 3 years", category: "performance" },
  { quote: "You silently moved us to the next tier. That broke trust more than the invoice did.", attribution: "Hannah W. · Growth plan · 8 months", category: "billing" },
];

export const WEEKLY_BRIEF = {
  week_of: "Week of Jun 24",
  sections: [
    { title: "What changed this week", body: "Navigation-related churn surged +42% week over week and is now the single largest driver, overtaking pricing. Three long-tenured Scale accounts cited the same friction in the workspace redesign. This is not a general UX complaint — it is a specific regression against previously-learned muscle memory." },
    { title: "New customer behaviour patterns", body: "Multi-tool consolidation appeared in 6 interviews this week (up from 1 last week). Buyers are auditing overlapping subscriptions and cutting whichever tool has weakest team adoption. Adoption depth, not feature parity, is deciding these renewals." },
    { title: "Emerging churn trends", body: "A silent auto-upgrade billing pattern is starting to show up in negative sentiment — 4 mentions this week, all from admins who felt blindsided. This is currently a trust issue, not a pricing one, and it compounds every other complaint they raise." },
    { title: "Competitor activity", body: "Notion mentions rose 28% WoW. In every case, the pivot reason was 'the team already uses Notion for docs' — not feature superiority. Linear is a distant second, mentioned almost exclusively by product-led teams citing keyboard-driven flow." },
    { title: "Growing feature requests", body: "Native docs surface, command palette, and per-seat SMB pricing are the three requests with the highest revenue attached. Together they touch $79k ARR across 26 at-risk accounts." },
    { title: "Recommended priorities", body: "1) Command palette and saved-view restoration — highest revenue-per-effort ratio. 2) Introduce per-seat SMB tier before the next renewal cliff. 3) Add pre-upgrade billing notification with 7-day admin approval. Everything else can wait a sprint." },
  ],
};

const LEAKAGE_DECISIONS: Record<CategoryKey, string> = {
  competitor: "Delayed unification of docs and tasks into a single workspace",
  ux: "Workspace redesign shipped without preserving muscle-memory affordances",
  pricing: "Growth-tier price step doesn't reflect SMB usage patterns",
  performance: "Reporting layer never re-architected for enterprise dataset sizes",
  onboarding: "Slack integration requires admin — no non-admin fallback path",
  support: "No tier-aware ticket routing; paid customers wait behind free",
  integrations: "Reliance on third-party Zapier for critical mid-market workflows",
  bugs: "Bulk import lacks pre-validation preview and per-record rollback",
  billing: "Silent auto-upgrade with no advance admin notification",
  features: "Enterprise compliance surface (SSO, audit log) incomplete",
  not_needed: "External customer pivots — largely non-preventable",
  other: "Uncategorised — needs deeper investigation",
};

export const REVENUE_LEAKAGE = CATEGORY_DISTRIBUTION.slice(0, 6).map((c, idx) => ({
  category: c.key,
  label: c.label,
  revenue: c.revenue,
  customers: c.count,
  pct: c.pct,
  product_decision: LEAKAGE_DECISIONS[c.key],
  trend: (["up", "up", "flat", "up", "down", "up"] as Trend[])[idx],
})).sort((a, b) => b.revenue - a.revenue);

/** Normalized business-language churn drivers (not raw customer wording). */
export const CHURN_DRIVERS = ROOT_CAUSES.slice(0, 6).map((r) => {
  const businessName: Record<string, string> = {
    "Fragmented workspace — needs docs and tasks in one place": "Workspace Fragmentation",
    "Perceived price-to-value gap at plan cap": "Price-to-Value Misalignment",
    "Reporting performance blocking core workflow": "Enterprise Reporting Performance",
    "Failed activation — Slack integration blocker": "Activation & Onboarding Friction",
    "UI slowness and friction vs. competitor": "Navigation & Discoverability Issues",
    "Billing surprise from silent auto-upgrade": "Billing Transparency Failures",
    "Unreliable Zapier integration": "Integration Reliability",
    "Critical data bug in bulk import": "Data Integrity Incidents",
    "Missing SSO + audit log for their compliance requirement": "Enterprise Compliance Gaps",
    "Poor support experience on paid plan": "Paid-Tier Support Experience",
  };
  const explanation: Record<string, string> = {
    "Fragmented workspace — needs docs and tasks in one place": "Customers consistently describe having to switch between our product and a second tool for documentation, breaking planning workflows and eroding team-wide adoption.",
    "Perceived price-to-value gap at plan cap": "As usage plateaus mid-contract, teams re-evaluate the Growth-tier price and find it doesn't scale down to their actual seat activity.",
    "Reporting performance blocking core workflow": "Large-dataset reports time out or lag, blocking recurring executive workflows that the product is specifically bought for.",
    "Failed activation — Slack integration blocker": "Non-admin users hit a hard stop during setup with no fallback path, abandoning the trial before reaching first value.",
    "UI slowness and friction vs. competitor": "Repetitive actions take too many clicks and page transitions feel slow compared to keyboard-driven alternatives customers use elsewhere.",
    "Billing surprise from silent auto-upgrade": "Automatic tier changes trigger invoices without advance notice, causing an immediate trust breakdown that no product improvement can recover.",
  };
  return {
    name: businessName[r.name] ?? r.name,
    pct: Math.round((r.mentions / completed.length) * 100),
    revenue: r.revenue,
    customers: r.customers,
    trend: r.trend,
    explanation: explanation[r.name] ?? r.recommended_fix,
    category: r.category,
  };
});


// ---------- Trend datasets for the Business Trends section ----------
export const CATEGORY_TREND = [
  { month: "Jan", "Navigation & UX": 4, "Missing Features": 3, Pricing: 5, Performance: 2, Integrations: 1 },
  { month: "Feb", "Navigation & UX": 5, "Missing Features": 4, Pricing: 5, Performance: 2, Integrations: 2 },
  { month: "Mar", "Navigation & UX": 9, "Missing Features": 4, Pricing: 4, Performance: 3, Integrations: 2 },
  { month: "Apr", "Navigation & UX": 12, "Missing Features": 5, Pricing: 4, Performance: 3, Integrations: 2 },
  { month: "May", "Navigation & UX": 14, "Missing Features": 6, Pricing: 3, Performance: 4, Integrations: 3 },
  { month: "Jun", "Navigation & UX": 17, "Missing Features": 7, Pricing: 3, Performance: 4, Integrations: 3 },
];

export const COMPETITOR_TREND = [
  { month: "Jan", Notion: 3, Linear: 2, Airtable: 2 },
  { month: "Feb", Notion: 4, Linear: 2, Airtable: 2 },
  { month: "Mar", Notion: 6, Linear: 3, Airtable: 2 },
  { month: "Apr", Notion: 8, Linear: 3, Airtable: 3 },
  { month: "May", Notion: 10, Linear: 4, Airtable: 3 },
  { month: "Jun", Notion: 13, Linear: 5, Airtable: 3 },
];
