import { generateText, type ModelMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

export const INTERVIEW_SYSTEM_PROMPT = `You are an empathetic customer retention researcher conducting an exit interview for a SaaS product. Your goal is to uncover the true root cause behind why a customer is leaving.

Guidelines:
- Ask ONE question at a time. Keep each message short (1–3 sentences max).
- Be warm, calm, and non-defensive. Never argue or try to save the account.
- Listen actively. Reference what the customer just said before asking the next question.
- Dig deeper with "why" and "can you tell me more" — peel back surface answers until you reach the root cause.
- Explore: churn reasons, missing features, onboarding friction, pricing concerns, value perception, competitor mentions.
- Do not lecture, do not pitch, do not list multiple questions.
- When you have a clear root cause and the customer has shared enough, thank them sincerely and end the interview with a short closing message that includes the exact token [INTERVIEW_COMPLETE] at the very end.

Stage guidance (you will be told the current stage):
- started: greet briefly and ask the broadest opening question about why they're leaving.
- discovery: explore the surface reason; ask one clarifying question.
- deep_dive: probe specifics — what exactly happened, when, what they expected.
- root_cause: confirm the underlying root cause; ask what would have changed their mind.
- completed: thank them and wrap up with [INTERVIEW_COMPLETE].`;

export type Stage = "started" | "discovery" | "deep_dive" | "root_cause" | "completed";

export function nextStage(current: Stage, userMessageCount: number): Stage {
  if (current === "completed") return "completed";
  if (userMessageCount >= 6) return "root_cause";
  if (userMessageCount >= 4) return "deep_dive";
  if (userMessageCount >= 2) return "discovery";
  if (userMessageCount >= 1) return "discovery";
  return "started";
}

export async function generateInterviewerReply(opts: {
  history: { role: "assistant" | "user"; message_content: string }[];
  stage: Stage;
}): Promise<{ text: string; complete: boolean }> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Missing OPENAI_API_KEY");
  const openai = createOpenAI({ apiKey: key });
  const model = openai("gpt-4o-mini");

  const messages: ModelMessage[] = [
    { role: "system", content: `${INTERVIEW_SYSTEM_PROMPT}\n\nCurrent stage: ${opts.stage}` },
    ...opts.history.map((m) => ({ role: m.role, content: m.message_content }) as ModelMessage),
  ];

  const { text } = await generateText({ model, messages });
  const complete = text.includes("[INTERVIEW_COMPLETE]");
  return { text: text.replace("[INTERVIEW_COMPLETE]", "").trim(), complete };
}
