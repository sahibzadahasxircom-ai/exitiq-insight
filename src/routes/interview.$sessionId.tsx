import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Send, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { publicGetInterview, publicSendMessage, publicStartInterview, getCompanyBrandingBySessionId } from "@/lib/interview.functions";

export const Route = createFileRoute("/interview/$sessionId")({
  head: () => ({
    meta: [
      { title: "Conversation — leaveesy" },
      { name: "description", content: "A short AI-guided conversation." },
    ],
  }),
  component: CustomerInterview,
});

function CustomerInterview() {
  const { sessionId } = Route.useParams();
  console.log("CustomerInterview component mounted with sessionId:", sessionId);
  
  const getFn = useServerFn(publicGetInterview);
  const startFn = useServerFn(publicStartInterview);
  const sendFn = useServerFn(publicSendMessage);
  const getCompanyFn = useServerFn(getCompanyBrandingBySessionId);
  const qc = useQueryClient();

  // Fetch company branding using server function
  const { data: company } = useQuery({
    queryKey: ["company-branding", sessionId],
    queryFn: () => getCompanyFn({ data: { sessionId } }),
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["public-interview", sessionId],
    queryFn: () => getFn({ data: { sessionId } }),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data && data.messages.length === 0 && data.session.interview_status === "active") {
      startFn({ data: { sessionId } }).then(() => {
        qc.invalidateQueries({ queryKey: ["public-interview", sessionId] });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.session.id]);

  const send = useMutation({
    mutationFn: (content: string) => sendFn({ data: { sessionId, content } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["public-interview", sessionId] }),
  });

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [data?.messages.length, send.isPending]);

  if (isLoading) return <CenterMessage text="Loading conversation…" />;
  if (error || !data) return <CenterMessage text="This conversation link is invalid or has been removed." />;

  const { session, messages } = data;
  const status = session.interview_status;
  const done = status === "completed" || status === "abandoned";
  
  const brandColor = company?.brand_color || "#2563eb";
  const companyName = company?.company_name || "Your Company";
  const companyLogo = company?.company_logo;

  function handleSend() {
    const v = input.trim();
    if (!v || send.isPending || done) return;
    setInput("");
    send.mutate(v);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background relative overflow-hidden">
      {/* Background gradient effect using brand color */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 20% 20%, ${brandColor} 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${brandColor} 0%, transparent 50%)`
        }}
      />
      
      <header className="border-b border-border bg-background/90 backdrop-blur relative z-10">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            {companyLogo ? (
              <img src={companyLogo} alt={companyName} className="h-8 w-8 object-contain" />
            ) : (
              <div 
                className="h-8 w-8 rounded flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: brandColor }}
              >
                {companyName?.charAt(0).toUpperCase() || "E"}
              </div>
            )}
            <span className="font-semibold">{companyName}</span>
          </div>
          <span className="text-[11px] text-muted-foreground">Confidential conversation</span>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-10">
          {done ? (
            <EndState />
          ) : (
            <div className="space-y-6">
              {messages.length === 0 && <Typing companyName={companyName} />}
              {messages.map((m) => (
                <Bubble key={m.id} role={m.role as "assistant" | "user"} text={m.message_content} companyName={companyName} />
              ))}
              {send.isPending && <Typing companyName={companyName} />}
            </div>
          )}
        </div>
      </div>

      {!done && (
        <div className="border-t border-border bg-background">
          <div className="mx-auto max-w-3xl px-4 py-4">
            <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-soft focus-within:border-foreground/30 focus-within:ring-2 focus-within:ring-foreground/10">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
                placeholder="Type your response…"
                disabled={send.isPending}
                className="max-h-40 min-h-[40px] w-full resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-60"
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || send.isPending}
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

function Bubble({ role, text, companyName }: { role: "assistant" | "user"; text: string; companyName?: string }) {
  if (role === "assistant") {
    return (
      <div className="animate-fade-in">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{companyName || "Team"}</p>
        <p className="mt-1.5 max-w-2xl whitespace-pre-wrap text-base leading-relaxed text-foreground">{text}</p>
      </div>
    );
  }
  return (
    <div className="flex animate-fade-in justify-end">
      <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-tr-md bg-foreground px-4 py-2.5 text-sm leading-relaxed text-background shadow-soft">
        {text}
      </div>
    </div>
  );
}

function Typing({ companyName }: { companyName?: string }) {
  return (
    <div className="animate-fade-in">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{companyName || "Team"}</p>
      <div className="mt-2 flex items-center gap-1.5">
        <Dot delay="0ms" /><Dot delay="150ms" /><Dot delay="300ms" />
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
        Your response has been recorded and will help the team improve the product.
      </p>
      <Link to="/" className="mt-8">
        <Button variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Return home
        </Button>
      </Link>
    </div>
  );
}

function CenterMessage({ text }: { text: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

