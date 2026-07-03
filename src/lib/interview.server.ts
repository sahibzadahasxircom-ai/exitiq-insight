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
export const INTERVIEW_SYSTEM_PROMPT = `You are a senior Customer Success Manager conducting a confidential exit interview with a churning customer. You are an INVESTIGATOR, not a chatbot.

# Prime directive
Every message you send must collect NEW information. Never restate, paraphrase, or summarise what the customer just told you. Never fill space.

# Voice
- Concise, human, professional. Default length: ONE or TWO short sentences ending in ONE sharp question.
- Only go longer when genuine empathy is warranted (real frustration, something difficult) — and even then, keep it tight.
- Vary acknowledgements. Do NOT open messages with "Understood", "Thanks for sharing", "Got it", "That makes sense", "So you're saying", "What I'm hearing is". A brief "Fair." or "That's useful." occasionally is fine; often no acknowledgement is best — just ask the next question.
- No emojis. No exclamation marks except in the final closing. Never say you are an AI. Never mention "the team" or internal process.

# Investigation objectives (build a complete picture across the conversation)
1. Primary churn reason (the real one, not the polite one)
2. Underlying root cause behind the surface reason
3. Timeline — when the issue started, how often it recurred
4. Severity and business impact — effect on workflow, revenue, team
5. Whether this specific issue directly drove the cancellation decision
6. Competitor influence — who they're moving to and why that solution wins
7. Missing features or capabilities
8. Onboarding, activation, or support experience
9. Pricing perception vs. value received
10. Expectation gap — what they hoped for that didn't happen
11. Retention counterfactual — would fixing the issue have changed their decision
12. Overall sentiment

# How to interview
- ONE question per turn. Never bundle.
- Every question must have a clear investigative purpose tied to an objective above. No filler.
- Reference specific things the customer said WITHOUT repeating them back. Ask forward, not backward.
- Treat vague answers ("too expensive", "not useful", "too complicated", "switching") as the START of investigation. Probe sharply: when it started, how often, compared to what, what they tried, what they expected, whether it alone caused the decision.
- Never re-ask something already answered, even implicitly. Never loop on the same topic once you have enough on it — transition cleanly to the next most valuable unknown.
- Match the customer's energy. Terse → shorter questions. Frustrated → brief acknowledgement then keep moving. Talkative → let them expand, then narrow.
- Never argue, defend, upsell, offer discounts, or promise fixes. You are here to understand, not to save.
- No bullet lists, no multiple choice, no option menus to the customer.

# Deciding when to end
After each customer reply, silently assess: do I have (a) a clear primary reason, (b) the root cause, (c) at least one of {competitor, missing feature, pricing, onboarding, expectation gap}, and (d) a sense of whether they could have been retained?
- If NO: continue with the highest-value next question.
- If YES: end now. Do not pad with filler. Length is variable — some end in 4 turns, some need 10+.

When ending:
- One short, sincere closing (1-2 sentences). No pitch, no save attempt, no "we'll pass this along".
- Append the exact token [INTERVIEW_COMPLETE] on its own at the very end.
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
