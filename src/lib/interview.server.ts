import { generateText, generateObject, type ModelMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";

export const INTERVIEW_SYSTEM_PROMPT = `You are an elite SaaS churn intelligence interviewer.

Your job is to discover the TRUE reason a customer is leaving.

Rules:
- Ask ONLY ONE question per response. Never bundle multiple questions.
- Do NOT follow any fixed script. Every question must be adapted to the customer's previous answer.
- Always dig deeper into vague responses. Reference what they just said before asking the next question.
- Identify hidden reasons behind surface answers — peel back until you reach a real root cause.

Investigate (when relevant to the conversation):
- onboarding friction
- missing features
- pricing perception
- competitor comparisons
- product value gaps
- user experience issues
- activation failure

Behavior:
- Act like a senior customer success manager.
- Empathetic, professional, concise. 1-3 sentences max per message.
- Never argue, never pitch, never try to save the account.
- Never lecture. Never list options. Just one sharp, contextual question.

Ending:
- End the interview ONLY when you have clear root cause AND enough specifics that a product team could act on it.
- When ending: thank them briefly (1-2 sentences) and append the exact token [INTERVIEW_COMPLETE] at the very end.
- Do NOT end prematurely on the first vague answer. Do NOT drag on past a clear root cause.`;

function client() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Missing OPENAI_API_KEY");
  return createOpenAI({ apiKey: key });
}

export async function generateInterviewerReply(opts: {
  history: { role: "assistant" | "user"; message_content: string }[];
}): Promise<{ text: string; complete: boolean }> {
  const openai = client();
  const messages: ModelMessage[] = [
    { role: "system", content: INTERVIEW_SYSTEM_PROMPT },
    ...opts.history.map((m) => ({ role: m.role, content: m.message_content }) as ModelMessage),
  ];
  const { text } = await generateText({ model: openai("gpt-4.1-mini"), messages });
  const complete = text.includes("[INTERVIEW_COMPLETE]");
  return { text: text.replace("[INTERVIEW_COMPLETE]", "").trim(), complete };
}

const InsightSchema = z.object({
  churn_reason: z.string().describe("One-line plain-language reason the customer churned."),
  root_cause: z.string().describe("The deeper root cause behind the surface reason."),
  category: z.enum([
    "onboarding",
    "features",
    "pricing",
    "competitor",
    "value",
    "ux",
    "activation",
    "other",
  ]),
  competitor_mentioned: z.string().nullable(),
  missing_features: z.array(z.string()),
  pricing_issue: z.boolean(),
  onboarding_issue: z.boolean(),
  sentiment: z.enum(["positive", "negative", "neutral"]),
  journey_failure_point: z.enum([
    "signup",
    "onboarding",
    "activation",
    "first_use",
    "upgrade",
    "other",
  ]),
  quote: z.string().describe("The single most revealing direct quote from the customer."),
  summary: z.string().describe("2-3 sentence executive summary for a founder."),
});

export type ExtractedInsight = z.infer<typeof InsightSchema>;

export async function extractInsights(
  history: { role: "assistant" | "user"; message_content: string }[],
): Promise<ExtractedInsight> {
  const openai = client();
  const transcript = history
    .map((m) => `${m.role === "user" ? "Customer" : "Interviewer"}: ${m.message_content}`)
    .join("\n");
  const { object } = await generateObject({
    model: openai("gpt-4.1"),
    schema: InsightSchema,
    system:
      "You are a senior SaaS churn analyst. Read the exit interview transcript and extract structured insight. Be precise; never invent facts not present in the transcript. If something isn't mentioned, leave arrays empty or use null/neutral defaults.",
    prompt: `Exit interview transcript:\n\n${transcript}`,
  });
  return object;
}
