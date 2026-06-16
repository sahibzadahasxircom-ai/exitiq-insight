import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/exit-interview")({
  head: () => ({
    meta: [
      { title: "Exit Interview — ExitIQ" },
      { name: "description", content: "A short AI-guided exit interview to help us understand why you're leaving." },
    ],
  }),
  component: ExitInterview,
});

type Message = {
  id: string;
  role: "ai" | "user";
  text: string;
  ts: number;
};

const AI_SCRIPT = [
  "Hi, we noticed you decided to leave. We'd really appreciate 2 minutes of feedback to help us improve.",
  "To start — what was the main reason you decided to leave?",
  "Thanks for sharing. Was there anything specific that disappointed you?",
  "Got it. Did you choose an alternative tool? If so, which one?",
  "Last one — what could we have done differently to keep you as a customer?",
];

const TOTAL_STEPS = 4;
const THANKS = "Thank you — that's incredibly helpful. Your feedback will be reviewed by our team.";

function ExitInterview() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "m0", role: "ai", text: AI_SCRIPT[0], ts: Date.now() },
  ]);
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState(0);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [done, setDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const t = setTimeout(() => sendAI(AI_SCRIPT[1]), 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (!done) inputRef.current?.focus();
  }, [done, typing]);

  function sendAI(text: string) {
    setTyping(true);
    const delay = 700 + Math.min(text.length * 18, 1400);
    setTimeout(() => {
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "ai", text, ts: Date.now() }]);
      setTyping(false);
      setStep((s) => s + 1);
    }, delay);
  }

  function handleSend() {
    const value = input.trim();
    if (!value || typing || done) return;
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", text: value, ts: Date.now() }]);
    setInput("");
    setAnswers((a) => Math.min(a + 1, TOTAL_STEPS));

    if (step < AI_SCRIPT.length) {
      sendAI(AI_SCRIPT[step]);
    } else {
      setTyping(true);
      setTimeout(() => {
        setMessages((m) => [...m, { id: crypto.randomUUID(), role: "ai", text: THANKS, ts: Date.now() }]);
        setTyping(false);
        setTimeout(() => setDone(true), 800);
      }, 900);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const progress = Math.min((answers / TOTAL_STEPS) * 100, 100);
  const currentStep = Math.min(answers + 1, TOTAL_STEPS);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4">
          <div className="flex h-14 items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background">
                <span className="text-[11px] font-bold">EQ</span>
              </div>
              <span className="text-sm font-semibold tracking-tight">ExitIQ</span>
            </Link>
            <span className="text-xs font-medium text-muted-foreground">
              {done ? "Complete" : `Question ${currentStep} of ${TOTAL_STEPS}`}
            </span>
          </div>
          {/* Progress bar */}
          <div className="pb-3">
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground transition-all duration-500 ease-out"
                style={{ width: `${done ? 100 : progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Chat */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-10">
          {done ? (
            <EndState />
          ) : (
            <div className="space-y-6">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
              {typing && <TypingIndicator />}
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      {!done && (
        <div className="border-t border-border bg-background">
          <div className="mx-auto max-w-3xl px-4 py-4">
            <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-soft focus-within:border-foreground/30 focus-within:ring-2 focus-within:ring-foreground/10">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder="Type your response…"
                disabled={typing}
                className="max-h-40 min-h-[40px] w-full resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-60"
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || typing}
                aria-label="Send"
                className="h-9 w-9 shrink-0 rounded-xl"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 px-1 text-[11px] text-muted-foreground">
              Your response is confidential and only shared with the product team.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isAI = message.role === "ai";
  if (isAI) {
    return (
      <div className="animate-fade-in">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Interviewer
        </p>
        <p className="mt-1.5 max-w-2xl text-base leading-relaxed text-foreground">
          {message.text}
        </p>
      </div>
    );
  }
  return (
    <div className="flex animate-fade-in justify-end">
      <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-foreground px-4 py-2.5 text-sm leading-relaxed text-background shadow-soft">
        {message.text}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="animate-fade-in">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Interviewer
      </p>
      <div className="mt-2 flex items-center gap-1.5">
        <Dot delay="0ms" />
        <Dot delay="150ms" />
        <Dot delay="300ms" />
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/70"
      style={{ animationDelay: delay, animationDuration: "1s" }}
    />
  );
}

function EndState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
        <CheckCircle2 className="h-7 w-7" />
      </div>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">Thank you for your feedback</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Your response will help us improve the product for everyone who comes next.
      </p>
      <div className="mt-8 flex gap-3">
        <Link to="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Return to homepage
          </Button>
        </Link>
      </div>
    </div>
  );
}
