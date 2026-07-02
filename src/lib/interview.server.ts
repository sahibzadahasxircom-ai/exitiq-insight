import { generateText, generateObject, type ModelMessage } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

/**
 * Senior Customer Success interviewer.
 *
 * The AI is NOT a chatbot and NOT a questionnaire. It runs a genuine
 * investigation: reason about what is still unknown, ask ONE sharp,
 * contextual follow-up that references the customer's own words, dig
 * until the real root cause is clear, then close.
 */
export const INTERVIEW_SYSTEM_PROMPT = `You are a senior Customer Success Manager conducting a confidential exit interview with a churning customer.

# Your identity
- Experienced, calm, respectful, genuinely curious.
- Your ONLY goal is to understand WHY they are leaving. You are NOT here to save the account, pitch, defend the product, or offer discounts.
- You listen like a human, not a survey.

# Investigation objectives (build understanding of ALL of these over the conversation)
1. Primary churn reason (the real one, not the polite one)
2. Secondary contributing factors
3. Underlying root cause behind the surface reason
4. Any competitor they are moving to (name + why)
5. Missing features or capabilities
6. Onboarding, activation, or support problems
7. Pricing perception vs. value received
8. Unmet expectations (what did they hope for that didn't happen)
9. Overall sentiment (frustrated / disappointed / neutral / positive)
10. Any suggestions that would meaningfully improve the product
11. Whether there is a realistic retention opportunity (only observe — never act on it)

# How to actually interview
- Ask ONLY ONE question per turn. Never bundle.
- Every question must reference something specific the customer just said. No generic prompts.
- Treat vague answers ("too expensive", "not useful", "too complicated", "switching", "didn't work for us") as the START of investigation, not the end. Peel back with concrete follow-ups: what specifically, when, compared to what, what did you expect instead, what were you trying to do.
- Never repeat a question you already asked, and never re-ask something the customer already answered — even implicitly.
- Never jump topics. Finish exploring the current thread before opening a new one.
- Vary phrasing. Do not sound like a template.
- Match the customer's energy. If they are frustrated, acknowledge briefly ("That's fair.") and keep going. If they are terse, ask shorter, sharper questions. If they are talkative, let them expand.
- Do NOT thank them for every answer. Do NOT summarise their answer back to them ("So what I'm hearing is..."). Just ask the next intelligent question.
- Do NOT mention that you are an AI. Do NOT mention "the team", "the founders", or internal process.
- Keep every message to 1-3 short sentences, conversational, warm but professional.

# Ending the interview
Before ending, silently check: do I understand the primary reason, the root cause behind it, and at least the most important of {competitor, missing feature, pricing, onboarding, expectation gap}?
- If NO: keep going. Some interviews need 4 turns, others need 10+. Length is never fixed.
- If YES: end. Do not drag on asking filler questions.

When ending:
- One short, sincere closing (1-2 sentences). No pitch, no save attempt, no "we'll pass this to the team".
- Then append the exact token [INTERVIEW_COMPLETE] on its own at the very end.

# Never do
- Never argue, defend, justify, upsell, or offer to fix things.
- Never give lists, bullets, or multiple-choice options to the customer.
- Never use emojis. Never use exclamation marks except in the closing thanks.
- Never say "as an AI".
`;

function gateway() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key);
}

export async function generateInterviewerReply(opts: {
  history: { role: "assistant" | "user"; message_content: string }[];
}): Promise<{ text: string; complete: boolean }> {
  const provider = gateway();
  const messages: ModelMessage[] = [
    { role: "system", content: INTERVIEW_SYSTEM_PROMPT },
    ...opts.history.map(
      (m) => ({ role: m.role, content: m.message_content }) as ModelMessage,
    ),
  ];

  // Bootstrap: no prior turns — open the conversation warmly.
  if (opts.history.length === 0) {
    messages.push({
      role: "system",
      content:
        "Open the interview with a single warm, human sentence acknowledging they've decided to cancel, then ask one open question about what led to the decision. Do not thank them for their business. Do not introduce yourself as an AI.",
    });
  } else {
    // Ongoing: force real reasoning about what's still unknown.
    messages.push({
      role: "system",
      content:
        "Silently review the transcript. Identify (a) what churn signals are already covered, (b) what is still vague or unknown from the objectives list, and (c) the single most valuable thing to explore next given the customer's LAST message. Then respond with ONE contextual follow-up question that references their own words. If — and only if — you already have a clear primary reason, root cause, and at least one of {competitor / missing feature / pricing / onboarding / expectation gap}, close the interview per the ending rules.",
    });
  }

  const { text } = await generateText({
    model: provider("google/gemini-2.5-flash"),
    messages,
    temperature: 0.7,
  });

  const complete = text.includes("[INTERVIEW_COMPLETE]");
  return { text: text.replace("[INTERVIEW_COMPLETE]", "").trim(), complete };
}

const InsightSchema = z.object({
  executive_summary: z
    .string()
    .describe("2-4 sentence executive summary written for a founder. Concrete, no fluff."),
  churn_reason: z
    .string()
    .describe("One-line plain-language PRIMARY reason the customer churned."),
  secondary_reasons: z
    .array(z.string())
    .describe("Other contributing factors mentioned. Empty array if none."),
  root_cause: z
    .string()
    .describe("The deeper underlying root cause behind the surface reason."),
  category: z.enum([
    "onboarding",
    "features",
    "pricing",
    "competitor",
    "value",
    "ux",
    "activation",
    "support",
    "other",
  ]),
  competitor_mentioned: z.string().nullable(),
  missing_features: z.array(z.string()),
  suggestions: z
    .array(z.string())
    .describe("Product/experience improvements the customer suggested or clearly implied."),
  pricing_issue: z.boolean(),
  onboarding_issue: z.boolean(),
  support_issue: z.boolean(),
  sentiment: z.enum(["positive", "negative", "neutral", "frustrated", "disappointed"]),
  journey_failure_point: z.enum([
    "signup",
    "onboarding",
    "activation",
    "first_use",
    "ongoing_use",
    "upgrade",
    "other",
  ]),
  retention_opportunity: z
    .string()
    .describe(
      "One sentence: is there a realistic path to have retained this customer, and what would it have required? Say 'None' if no.",
    ),
  confidence_score: z
    .number()
    .describe("0.0-1.0 confidence that the extracted insight reflects the true churn reason."),
  recommended_actions: z
    .array(z.string())
    .describe("2-5 concrete actions the product/CS team should take based on this interview."),
  tags: z
    .array(z.string())
    .describe("3-6 short lowercase tags categorising this interview (e.g. 'pricing', 'stripe-competitor', 'missing-api', 'onboarding-friction')."),
  quote: z
    .string()
    .describe("The single most revealing direct quote from the customer, verbatim."),
  summary: z
    .string()
    .describe("Short 1-2 sentence summary (used as a dashboard subtitle)."),
});

export type ExtractedInsight = z.infer<typeof InsightSchema>;

export async function extractInsights(
  history: { role: "assistant" | "user"; message_content: string }[],
): Promise<ExtractedInsight> {
  const provider = gateway();
  const transcript = history
    .map((m) => `${m.role === "user" ? "Customer" : "Interviewer"}: ${m.message_content}`)
    .join("\n");
  const { object } = await generateObject({
    model: provider("google/gemini-2.5-pro"),
    schema: InsightSchema,
    system:
      "You are a senior SaaS churn analyst. Read the exit interview transcript and produce a rigorous structured intelligence report. Be precise and specific. NEVER invent facts that are not supported by the transcript. If something is not mentioned, use an empty array, null, or a neutral value. Prefer the customer's own words in the quote. Recommended actions must be concrete and derived from what the customer actually said.",
    prompt: `Exit interview transcript:\n\n${transcript}`,
    temperature: 0.2,
  });
  return object;
}
