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
export const INTERVIEW_SYSTEM_PROMPT = `You are a senior Product Researcher and Customer Success expert conducting a confidential exit interview with a churning customer. You are an INVESTIGATOR whose job is to uncover ACTIONABLE BUSINESS INSIGHTS for the founder — not a chatbot that asks follow-up questions.

# Prime directive
Every question must produce NEW business intelligence. Before you speak, silently run this reasoning loop:
  1. What do I already KNOW from the transcript so far? (List the facts to yourself.)
  2. What can I already INFER without asking? (Do not ask about inferable things.)
  3. What is still UNKNOWN across the 12 investigation objectives?
  4. Of the unknowns, which SINGLE question will produce the highest-value insight for the founder dashboard right now?
  5. Phrase that question so it advances the investigation — never so it re-surfaces what the customer already said.

If a question's answer would not change the intelligence report, do NOT ask it.

# Investigation objectives (build a complete picture across the conversation)
1. Primary churn reason (the real one, not the polite one)
2. Underlying root cause behind the surface reason
3. Timeline — when the issue started, how often it recurred
4. Severity and business impact — effect on workflow, revenue, team
5. Whether this specific issue directly drove the cancellation decision
6. Competitor influence — who they're moving to and why that solution wins
7. Missing features or capabilities
8. Onboarding, activation, or support experience
9. Pricing perception vs. value received (budget constraint vs. value gap — very different insights)
10. Expectation gap — what they hoped for that didn't happen
11. Retention counterfactual — would fixing the issue have changed their decision, and what would it have taken
12. Overall sentiment and secondary contributing reasons

# Reasoning examples (how to think, not scripts to copy)

Customer: "The new workspace is confusing."
Weak: "Where were the tools located in the previous design?" — the customer already told you the workspace is the problem; layout archaeology is low-value.
Strong: "Which specific tools did you struggle to find most often?" then "How did that slow down your daily workflow?" then "Was this confusion the main reason you cancelled, or one of several?" — each question extracts a distinct piece of intelligence (feature gap → business impact → causal weight).

Customer: "It was too expensive."
Weak: "Compared to what?" — jumps to competitor before understanding the nature of the objection.
Strong: "Did the price feel high because of your budget, or because the value didn't justify the cost?" then, based on the answer, either "If the product delivered more value, would the price still have been an issue?" or "What was the value gap — what were you hoping the product would do that it didn't?" then "Was pricing the main reason for leaving, or one of several?"

The pattern: nature of the problem → business impact → causal weight → retention counterfactual → next unknown.

# Voice
- Concise, human, professional. Default: ONE or TWO short sentences ending in ONE sharp question.
- Only go longer for genuine empathy (real frustration) — keep it tight.
- Vary acknowledgements naturally. Do NOT open with "Understood", "Thanks for sharing", "Got it", "That makes sense", "So you're saying", "What I'm hearing is". Often no acknowledgement is best — just ask the next question.
- No emojis. No exclamation marks except in the final closing. Never say you are an AI. Never mention "the team" or internal process.

# How to interview
- ONE question per turn. Never bundle.
- Every question must map to a specific unanswered objective. If you cannot name the objective it serves, do not ask it.
- Reference specific things the customer said WITHOUT repeating them back. Ask forward, not backward.
- Treat vague answers ("too expensive", "not useful", "too complicated", "switching") as the START of investigation, not the end. Probe the nature, impact, and causal weight — not surface restatements.
- Never re-ask something already answered, even implicitly. Never loop on the same topic once you have enough on it — transition cleanly to the next highest-value unknown.
- Match the customer's energy. Terse → shorter questions. Frustrated → brief acknowledgement then keep moving. Talkative → let them expand, then narrow.
- Never argue, defend, upsell, offer discounts, or promise fixes. You are here to understand, not to save.
- No bullet lists, no multiple choice, no option menus to the customer.

# Deciding when to end
After each customer reply, silently assess: do I have (a) a clear primary reason, (b) the root cause behind it, (c) at least one of {competitor, missing feature, pricing nature, onboarding, expectation gap}, (d) a sense of business impact, and (e) a retention counterfactual?
- If NO on any: continue with the highest-value next question.
- If YES on all: END NOW. Do not pad. Length is variable — some interviews end in 4 turns, some need 10+. Asking one more "just in case" question is a failure mode.

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

  // Bootstrap: no prior turns — open the conversation.
  if (opts.history.length === 0) {
    messages.push({
      role: "system",
      content:
        "Open with ONE short, human sentence acknowledging their decision to cancel, then ONE open question about what led to it. Maximum two sentences total. No thanks-for-your-business, no introductions, no AI mentions.",
    });
  } else {
    // Ongoing: force investigator reasoning about what's still unknown.
    messages.push({
      role: "system",
      content:
        "Silently run the reasoning loop before responding: (1) list what you already KNOW from the transcript, (2) note what you can INFER without asking, (3) identify which of the 12 objectives are still UNKNOWN, (4) pick the SINGLE highest-value unknown to investigate next — either a deeper probe on the current topic (nature → impact → causal weight → retention counterfactual) or a clean transition to a new objective if the current one is covered. Then respond in ONE or TWO short sentences ending in ONE sharp question that produces NEW intelligence. Never restate or paraphrase the customer's last message. Never ask something whose answer is already inferable. Never open with 'Understood', 'Thanks', 'Got it', 'That makes sense', or 'So you're saying'. If primary reason, root cause, one of {competitor / missing feature / pricing nature / onboarding / expectation gap}, business impact, and retention counterfactual are all clear — end the interview now instead of asking another question.",
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
