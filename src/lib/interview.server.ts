import { z } from "zod";
import { getGeminiModel } from "./ai-gateway.server";
import { getProductKnowledgeForAI } from "./product-knowledge.functions";

/**
 * Senior Customer Success interviewer.
 *
 * The AI is NOT a chatbot and NOT a questionnaire. It runs a genuine
 * investigation: reason about what is still unknown, ask ONE sharp,
 * contextual follow-up that references the customer's own words, dig
 * until the real root cause is clear, then close.
 */
export const INTERVIEW_SYSTEM_PROMPT = `You are a senior Product Researcher and Customer Success expert conducting a confidential exit interview with a churning customer. You are an INVESTIGATOR whose job is to uncover ACTIONABLE BUSINESS INSIGHTS for the founder — not a chatbot that asks follow-up questions.

# Output rule (ABSOLUTE — never break)
Your visible reply to the customer is ONLY the final conversational message: at most one or two natural sentences ending in a single question (or the closing line when ending). All reasoning is SILENT and INTERNAL. Never output, mention, label, or hint at:
  - the words KNOW, INFER, UNKNOWN, "objective", "reasoning", "step", "analysis", "framework", "investigation plan"
  - numbered or bulleted lists of what you know, don't know, or plan to ask
  - meta-commentary about your process, thinking, or how you decided the question
  - preambles like "Based on what you said...", "Let me think...", "My next question is..."
No headings, no markdown, no brackets, no stage directions. Just the human sentence(s) a Customer Success Manager would actually say out loud. If any reasoning artifact would appear in your output, delete it before sending.

# Prime directive
Every question must produce NEW business intelligence. Before you speak, silently (in your head only, never in the reply) run this loop:
  1. What do you already know from the transcript?
  2. What can you infer without asking?
  3. What is still missing across the 12 investigation objectives?
  4. Which single question yields the highest-value insight right now?
  5. Phrase it so it advances the investigation instead of restating what the customer said.

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

export async function generateInterviewerReply(opts: {
  history: { role: "assistant" | "user"; message_content: string }[];
  companyId?: string;
}): Promise<{ text: string; complete: boolean }> {
  const model = getGeminiModel("gemini-3.6-flash");
  
  let prompt = INTERVIEW_SYSTEM_PROMPT + "\n\n";

  // Add product knowledge if companyId is provided
  let productKnowledgeContext = "";
  if (opts.companyId) {
    productKnowledgeContext = await getProductKnowledgeForAI(opts.companyId);
  }

  if (productKnowledgeContext) {
    prompt += `# Product Knowledge Context\nYou are interviewing a customer of this company. Here is information about their product, features, and recent updates that you should reference when relevant:\n\n${productKnowledgeContext}\n\n`;
    prompt += `When the customer mentions specific features, updates, or aspects of the product, reference this knowledge to provide more contextual and informed responses. For example, if they mention a "sidebar redesign" and you know about a recent sidebar update, acknowledge that context in your follow-up.\n\n`;
  }

  // Bootstrap: no prior turns — open the conversation.
  if (opts.history.length === 0) {
    prompt += "Open with ONE short, human sentence acknowledging their decision to cancel, then ONE open question about what led to it. Maximum two sentences total. No thanks-for-your-business, no introductions, no AI mentions.\n\n";
  } else {
    // Add conversation history
    const transcript = opts.history
      .map((m) => `${m.role === "user" ? "Customer" : "Interviewer"}: ${m.message_content}`)
      .join("\n");
    prompt += `Conversation so far:\n${transcript}\n\n`;
    
    // Ongoing: force investigator reasoning about what's still unknown.
    prompt += "Think silently, output only the human reply. Internally figure out what you already know, what you can infer, what is still missing across the 12 objectives, and which single next question yields the highest-value insight (deeper probe on the current topic — nature → impact → causal weight → retention counterfactual — or a clean transition to a new objective if covered). Your VISIBLE output must be ONE or TWO short natural sentences ending in ONE sharp question, and nothing else. Never expose your reasoning: no words like KNOW, INFER, UNKNOWN, objective, step, framework, analysis; no lists; no meta preambles ('Based on what you shared', 'Let me think', 'My next question'); no headings, brackets, or markdown. Never restate or paraphrase the customer's last message. Never ask something already inferable. Never open with 'Understood', 'Thanks', 'Got it', 'That makes sense', or 'So you're saying'. If primary reason, root cause, one of {competitor / missing feature / pricing nature / onboarding / expectation gap}, business impact, and retention counterfactual are all clear — end the interview now with a short human closing (no reasoning shown) instead of asking another question.\n\n";
  }

  const result = await model.generateContent(prompt);
  const text = result.response.text();

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
  const model = getGeminiModel("gemini-3.6-flash");
  const transcript = history
    .map((m) => `${m.role === "user" ? "Customer" : "Interviewer"}: ${m.message_content}`)
    .join("\n");
  
  const prompt = `You are a senior SaaS churn analyst. Read the exit interview transcript and produce a rigorous structured intelligence report. Be precise and specific. NEVER invent facts that are not supported by the transcript. If something is not mentioned, use an empty array, null, or a neutral value. Prefer the customer's own words in the quote. Recommended actions must be concrete and derived from what the customer actually said.

Exit interview transcript:

${transcript}

Return your response as a valid JSON object with this exact structure:
{
  "executive_summary": "2-4 sentence executive summary written for a founder. Concrete, no fluff.",
  "churn_reason": "One-line plain-language PRIMARY reason the customer churned.",
  "secondary_reasons": ["Other contributing factors mentioned. Empty array if none."],
  "root_cause": "The deeper underlying root cause behind the surface reason.",
  "category": "onboarding|features|pricing|competitor|value|ux|activation|support|other",
  "competitor_mentioned": "Name of competitor mentioned, or null if none.",
  "missing_features": ["List of missing features mentioned. Empty array if none."],
  "suggestions": ["Product/experience improvements the customer suggested or clearly implied. Empty array if none."],
  "pricing_issue": true|false,
  "onboarding_issue": true|false,
  "support_issue": true|false,
  "sentiment": "positive|negative|neutral|frustrated|disappointed",
  "journey_failure_point": "signup|onboarding|activation|first_use|ongoing_use|upgrade|other",
  "retention_opportunity": "One sentence: is there a realistic path to have retained this customer, and what would it have required? Say 'None' if no.",
  "confidence_score": 0.0-1.0,
  "recommended_actions": ["2-5 concrete actions the product/CS team should take based on this interview."],
  "tags": ["3-6 short lowercase tags categorising this interview (e.g. 'pricing', 'stripe-competitor', 'missing-api', 'onboarding-friction')."],
  "quote": "The single most revealing direct quote from the customer, verbatim.",
  "summary": "Short 1-2 sentence summary (used as a dashboard subtitle)."
}

Respond ONLY with the JSON object, no other text.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  // Parse JSON response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse JSON response from Gemini");
  }
  
  const parsed = JSON.parse(jsonMatch[0]);
  return InsightSchema.parse(parsed);
}
