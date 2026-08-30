import { useEffect, useState } from "react";
import { MousePointer2, MessageSquare, TrendingUp, Lightbulb, BarChart3, CheckCircle2, ArrowRight, User, Zap, Database } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

type DemoPhase = "website" | "text1" | "text2" | "form" | "interview" | "flow" | "dashboard";

const USERS = [
  { name: "Mark", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" },
  { name: "Harry", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face" },
  { name: "Tom", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" },
  { name: "Sarah", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" },
  { name: "Genna", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" },
];

const INTERVIEW_SCRIPT = [
  { role: "ai" as const, text: "Thank you for using our platform. What prompted your decision to leave?" },
  { role: "user" as const, text: "We needed more advanced reporting features for our enterprise team." },
  { role: "ai" as const, text: "Could you share which specific reports were most important to you?" },
  { role: "user" as const, text: "Custom cohort analysis by plan type and revenue attribution." },
  { role: "ai" as const, text: "Did you evaluate any alternatives before making this decision?" },
  { role: "user" as const, text: "Yes, we tested Mixpanel and Amplitude for comparison." },
  { role: "ai" as const, text: "What stood out about those platforms compared to ours?" },
  { role: "user" as const, text: "Their custom report builders and real-time data streaming." },
  { role: "ai" as const, text: "We appreciate your honest feedback. This will help us improve." },
];

const DASHBOARD_DATA = {
  causes: [
    { name: "Missing features", value: 42, color: "#3b82f6" },
    { name: "Pricing", value: 23, color: "#64748b" },
    { name: "Competitor", value: 18, color: "#94a3b8" },
    { name: "Onboarding", value: 11, color: "#cbd5e1" },
    { name: "Other", value: 6, color: "#e2e8f0" },
  ],
  trend: [
    { week: "W1", causes: 12 },
    { week: "W2", causes: 18 },
    { week: "W3", causes: 24 },
    { week: "W4", causes: 31 },
    { week: "W5", causes: 39 },
    { week: "W6", causes: 48 },
  ],
};

export function LandingLiveDemo() {
  const [phase, setPhase] = useState<DemoPhase>("website");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [messages, setMessages] = useState<{ role: "ai" | "user"; text: string }[]>([]);
  const [typing, setTyping] = useState(false);
  const [overlayText, setOverlayText] = useState("");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [signOutClicked, setSignOutClicked] = useState(false);
  const [centerTextLines, setCenterTextLines] = useState<string[]>([]);
  const [showTextOverlay, setShowTextOverlay] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    function wait(ms: number) {
      return new Promise<void>((res) => {
        const t = setTimeout(res, ms);
        timers.push(t);
      });
    }

    async function playFullFlow() {
      while (!cancelled && isPlaying) {
        // Phase 1: SaaS Website with background cards
        setPhase("website");
        setShowForm(false);
        setMessages([]);
        setSignOutClicked(false);
        setCenterTextLines([]);
        setShowTextOverlay(false);
        setOverlayText("");
        setZoomLevel(1);
        await wait(3000);

        // Phase 2: Animated text "Your Users Cancel Subscription or Sign Out" (wipe effect)
        setPhase("text1");
        setCenterTextLines(["Your Users Cancel Subscription or Sign Out"]);
        setShowTextOverlay(true);
        await wait(4000);

        // Phase 3: Add second line "leaveesy activates instantly when users sign out"
        setPhase("text2");
        setCenterTextLines(["Your Users Cancel Subscription or Sign Out", "leaveesy activates instantly when users sign out"]);
        await wait(3000);

        // Sign out button turns red
        setSignOutClicked(true);
        await wait(1500);

        // Phase 4: Form
        setPhase("form");
        setShowForm(true);
        setCenterTextLines([]);
        setShowTextOverlay(false);
        setOverlayText("leaveesy pre-form appears");
        await wait(6000);

        // Phase 5: Interview
        setPhase("interview");
        setShowForm(false);
        setOverlayText("AI-powered conversation extracts insights");
        setMessages([]);
        
        for (const turn of INTERVIEW_SCRIPT) {
          if (cancelled || !isPlaying) return;
          if (turn.role === "ai") {
            setTyping(true);
            await wait(1000); // Faster typing
            if (cancelled || !isPlaying) return;
            setTyping(false);
          } else {
            await wait(800); // Faster user response
          }
          setMessages((prev) => [...prev, turn]);
          await wait(1500); // Faster message display
        }
        if (cancelled || !isPlaying) return;
        await wait(1500);

        // Phase 6: Flow Visualization
        setPhase("flow");
        setOverlayText("Interviews flow through leaveesy extraction");
        await wait(6000);

        // Phase 7: Zoom to Dashboard
        setOverlayText("Dashboard reveals actionable intelligence");
        setZoomLevel(1.8);
        await wait(3000);

        // Phase 8: Dashboard
        setPhase("dashboard");
        await wait(500);
        setZoomLevel(1);
        setOverlayText("");
        await wait(7000);
      }
    }

    playFullFlow();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [isPlaying]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
      <div className="relative h-[500px] w-full overflow-hidden">
        
        {/* Play Button Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center z-50">
            <h2 className="text-3xl font-bold text-white mb-4">HOW IT WORKS?</h2>
            <button
              onClick={() => setIsPlaying(true)}
              className="h-16 w-16 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-colors shadow-xl shadow-blue-500/30"
            >
              <svg className="h-8 w-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <p className="text-slate-300 mt-4 text-sm">Click to start demo</p>
          </div>
        )}
        
        {/* Overlay Text Bar - Left side */}
        {overlayText && isPlaying && (
          <>
            <div className="absolute bottom-4 left-4 z-50 bg-slate-900/90 text-white px-4 py-2 rounded-lg shadow-xl backdrop-blur-sm transition-all duration-300">
              <p className="text-xs font-medium whitespace-nowrap">{overlayText}</p>
            </div>
          </>
        )}

        {/* Phase 1: SaaS Website with background cards */}
        {(phase === "website" || phase === "text1" || phase === "text2") && (
          <div className="absolute inset-0 bg-white flex flex-col">
            {/* Header */}
            <div className="border-b border-slate-200 bg-white px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                  <span className="font-semibold text-slate-900">Your Software</span>
                </div>
                <button 
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                    signOutClicked ? "bg-red-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Content - Empty cards */}
            <div className="flex-1 p-6 relative">
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 rounded-xl bg-slate-50 border border-slate-200 p-4">
                      <div className="h-4 w-20 bg-slate-200 rounded mb-3" />
                      <div className="h-8 w-16 bg-slate-300 rounded" />
                    </div>
                  ))}
                </div>
                <div className="h-64 rounded-xl bg-slate-50 border border-slate-200 p-4">
                  <div className="h-4 w-32 bg-slate-200 rounded mb-4" />
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-12 bg-slate-100 rounded-lg" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Text overlay with wipe effect - background stays visible */}
              {showTextOverlay && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    {centerTextLines.map((line, i) => (
                      <h1 
                        key={i} 
                        className="text-3xl font-bold text-slate-900 animate-in slide-in-from-bottom-4 duration-700"
                        style={{ animationDelay: `${i * 300}ms` }}
                      >
                        {line}
                      </h1>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Phase 2: Form */}
        {phase === "form" && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                  <div>
                    <div className="font-semibold text-base text-slate-900">Your Software</div>
                    <div className="text-xs text-slate-500">Exit Interview</div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Before you go, help us improve
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  We'd love to understand why you're leaving. Your feedback helps us build better products.
                </p>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors">
                Let's Continue
              </button>

              <div className="mt-4 text-center text-xs text-slate-500">
                Powered by leaveesy
              </div>
            </div>
          </div>
        )}

        {/* Phase 3: Interview */}
        {phase === "interview" && (
          <div className="absolute inset-0 bg-slate-50">
            <div className="h-full flex flex-col">
              <div className="border-b border-slate-200 bg-white px-6 py-4">
                <div className="flex items-center justify-between max-w-3xl mx-auto">
                  <div className="flex items-center gap-2">
                    <img src="/leaveesy.png" alt="leaveesy" className="h-16 w-auto object-contain" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-slate-500">Live</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-8">
                <div className="max-w-3xl mx-auto space-y-4">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex items-start gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      {msg.role === "ai" && (
                        <div className="flex flex-col items-center gap-1">
                          <img src="/leaveesy.png" alt="leaveesy" className="h-14 w-auto object-contain" />
                          <span className="text-[10px] text-slate-500">leaveesy</span>
                        </div>
                      )}
                      <div className={`max-w-[60%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "rounded-tr-md bg-slate-900 text-white"
                          : "rounded-tl-md bg-white border border-slate-200 text-slate-900"
                      }`}>
                        {msg.text}
                      </div>
                      {msg.role === "user" && (
                        <div className="flex flex-col items-center">
                          <div className="h-10 w-10 rounded-full bg-slate-700 overflow-hidden shrink-0">
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" alt="Mark" className="h-full w-full object-cover" />
                          </div>
                          <span className="text-[10px] text-slate-500 mt-1">Mark</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {typing && (
                    <div className="flex items-start gap-2 justify-start">
                      <div className="flex flex-col items-center gap-1">
                        <img src="/leaveesy.png" alt="leaveesy" className="h-14 w-auto object-contain" />
                        <span className="text-[10px] text-slate-500">leaveesy</span>
                      </div>
                      <div className="rounded-xl rounded-tl-md bg-white border border-slate-200 px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "0.15s" }} />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "0.3s" }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Phase 4: Flow Visualization */}
        {phase === "flow" && (
          <div className="absolute inset-0 bg-white flex items-center justify-center p-8">
            <div className="w-full max-w-7xl">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">leaveesy Data Extraction</h2>
                <p className="text-sm text-slate-500">Powered by high professional LLMs model</p>
              </div>
              
              <div className="flex items-center justify-between gap-8">
                {/* Users with individual lines */}
                <div className="flex flex-col gap-6 w-56">
                  {USERS.map((user, i) => (
                    <div key={user.name} className="flex items-center gap-3">
                      <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-slate-300 shadow-md shrink-0">
                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-900 text-sm font-semibold">{user.name}</span>
                      </div>
                      {/* Individual line */}
                      <div className="flex-1 h-0.5 bg-slate-200 relative overflow-hidden ml-3">
                        <div className="absolute inset-0 bg-slate-900 animate-pulse" />
                        <div
                          className="absolute h-2 w-2 bg-slate-900 rounded-full"
                          style={{
                            animation: `travelLine 1.5s ease-in-out infinite`,
                            animationDelay: `${i * 0.3}s`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Lines converge to single line */}
                <div className="relative">
                  <svg className="w-40 h-64" viewBox="0 0 160 256">
                    <path d="M 0 26 L 160 128" stroke="#1e293b" strokeWidth="2" fill="none" className="animate-pulse" />
                    <path d="M 0 77 L 160 128" stroke="#1e293b" strokeWidth="2" fill="none" className="animate-pulse" style={{ animationDelay: "0.1s" }} />
                    <path d="M 0 128 L 160 128" stroke="#1e293b" strokeWidth="2" fill="none" className="animate-pulse" style={{ animationDelay: "0.2s" }} />
                    <path d="M 0 179 L 160 128" stroke="#1e293b" strokeWidth="2" fill="none" className="animate-pulse" style={{ animationDelay: "0.3s" }} />
                    <path d="M 0 230 L 160 128" stroke="#1e293b" strokeWidth="2" fill="none" className="animate-pulse" style={{ animationDelay: "0.4s" }} />
                    <circle r="5" fill="#3b82f6" className="animate-ping" style={{ animationDuration: "1s" }} />
                  </svg>
                </div>

                {/* Data Extraction Block */}
                <div className="bg-white rounded-2xl p-8 text-center border-2 border-slate-900 shadow-2xl w-64">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Database className="h-12 w-12 text-slate-900 animate-pulse" />
                    <div className="h-3 w-3 bg-green-500 rounded-full animate-ping" />
                  </div>
                  <div className="text-slate-900 font-bold text-xl mb-2">Data Extraction</div>
                  <div className="text-slate-500 text-sm mb-1">Trained LLM</div>
                  <div className="text-slate-400 text-xs">leaveesy</div>
                  <div className="flex gap-1 justify-center mt-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-1.5 w-12 bg-slate-400 rounded animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                </div>

                {/* Single line to dashboard */}
                <div className="flex-1 h-0.5 bg-slate-200 relative overflow-hidden">
                  <div className="absolute inset-0 bg-slate-900 animate-pulse" />
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute h-2 w-2 bg-slate-900 rounded-full"
                      style={{
                        animation: `travelLine 1.5s ease-in-out infinite`,
                        animationDelay: `${i * 0.5}s`,
                      }}
                    />
                  ))}
                </div>

                {/* Dashboard Block */}
                <div className="bg-white rounded-2xl p-8 text-center border-2 border-slate-900 shadow-2xl w-64">
                  <BarChart3 className="h-12 w-12 text-slate-900 mx-auto mb-4 animate-pulse" />
                  <div className="text-slate-900 font-bold text-xl mb-2">Dashboard</div>
                  <div className="text-slate-500 text-sm">Executive Brief</div>
                </div>
              </div>
            </div>
            <style>{`
              @keyframes travelLine {
                0% { left: 0%; opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { left: 100%; opacity: 0; }
              }
            `}</style>
          </div>
        )}

        {/* Phase 5 & 6: Dashboard */}
        {phase === "dashboard" && (
          <div 
            className="absolute inset-0 bg-slate-100 p-4 transition-transform duration-1000 overflow-hidden"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 px-2 shrink-0">
                <img src="/leaveesy.png" alt="leaveesy" className="h-14 w-auto object-contain" />
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">Last 30 days</span>
                  <div className="h-6 w-6 rounded-full bg-slate-300" />
                </div>
              </div>

              {/* Dashboard Grid */}
              <div className="flex-1 grid grid-cols-4 grid-rows-4 gap-3 overflow-hidden">
                {/* Top Stats Row */}
                <div className="col-span-1 row-span-1 bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                  <div className="text-[10px] text-slate-500 mb-1">Total Interviews</div>
                  <div className="text-xl font-bold text-slate-900">247</div>
                  <div className="text-[10px] text-green-600 mt-1">+23 this week</div>
                </div>
                <div className="col-span-1 row-span-1 bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                  <div className="text-[10px] text-slate-500 mb-1">Churn Rate</div>
                  <div className="text-xl font-bold text-slate-900">3.2%</div>
                  <div className="text-[10px] text-red-600 mt-1">+0.5%</div>
                </div>
                <div className="col-span-1 row-span-1 bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                  <div className="text-[10px] text-slate-500 mb-1">Avg Response</div>
                  <div className="text-xl font-bold text-slate-900">4.2min</div>
                  <div className="text-[10px] text-green-600 mt-1">-12%</div>
                </div>
                <div className="col-span-1 row-span-1 bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                  <div className="text-[10px] text-slate-500 mb-1">Insights Found</div>
                  <div className="text-xl font-bold text-slate-900">89</div>
                  <div className="text-[10px] text-green-600 mt-1">+15%</div>
                </div>

                {/* Executive Brief - Large */}
                <div className="col-span-2 row-span-2 bg-white rounded-lg p-4 border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-sm text-slate-900">Executive Brief</span>
                  </div>
                  <div className="space-y-2 overflow-hidden">
                    <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <p className="text-xs text-slate-900 leading-relaxed font-medium">
                        <span className="bg-yellow-200 px-1">Missing cohort reporting</span> is the primary churn driver. 
                        <span className="bg-yellow-200 px-1">42% of users</span> cite this as the main reason.
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-900 leading-relaxed">
                        <span className="bg-yellow-200 px-1">Pricing concerns</span> affect 23% of cancellations. 
                        Consider <span className="bg-yellow-200 px-1">viewer-tier pricing</span> to reduce friction.
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-900 leading-relaxed">
                        <span className="bg-yellow-200 px-1">Mixpanel & Amplitude</span> mentioned as competitors by 18% of users.
                      </p>
                    </div>
                  </div>
                </div>

                {/* What to Fix Section */}
                <div className="col-span-2 row-span-1 bg-white rounded-lg p-4 border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-sm text-slate-900">What to Fix</span>
                  </div>
                  <div className="space-y-2 overflow-hidden">
                    <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                      <div className="h-2 w-2 bg-red-500 rounded-full shrink-0" />
                      <span className="text-xs text-slate-900">Add custom cohort analysis reports</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                      <div className="h-2 w-2 bg-orange-500 rounded-full shrink-0" />
                      <span className="text-xs text-slate-900">Implement real-time data streaming</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                      <div className="h-2 w-2 bg-yellow-500 rounded-full shrink-0" />
                      <span className="text-xs text-slate-900">Introduce viewer-tier pricing plans</span>
                    </div>
                  </div>
                </div>

                {/* Churn Causes Graph */}
                <div className="col-span-2 row-span-1 bg-white rounded-lg p-4 border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-sm text-slate-900">Churn Causes</span>
                  </div>
                  <ResponsiveContainer width="100%" height={70}>
                    <BarChart data={DASHBOARD_DATA.causes} margin={{ left: 0, right: 8, top: 4, bottom: 4 }} layout="vertical">
                      <XAxis type="number" stroke="#94a3b8" fontSize={8} tickLine={false} axisLine={false} />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={8} tickLine={false} axisLine={false} width={60} />
                      <Bar dataKey="value" radius={[0, 3, 3, 0]} barSize={16}>
                        {DASHBOARD_DATA.causes.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Trend Graph */}
                <div className="col-span-2 row-span-1 bg-white rounded-lg p-4 border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-sm text-slate-900">Churn Trend</span>
                    <span className="ml-auto text-xs text-green-600 font-medium">+300%</span>
                  </div>
                  <ResponsiveContainer width="100%" height={60}>
                    <AreaChart data={DASHBOARD_DATA.trend}>
                      <defs>
                        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="week" stroke="#94a3b8" fontSize={8} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={8} tickLine={false} axisLine={false} width={25} />
                      <Area type="monotone" dataKey="causes" stroke="#3b82f6" strokeWidth={2} fill="url(#trendFill)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Customer Voice */}
                <div className="col-span-2 row-span-1 bg-white rounded-lg p-4 border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-sm text-slate-900">Customer Voice</span>
                  </div>
                  <div className="space-y-2 overflow-hidden">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <p className="text-[11px] text-slate-900">"<span className="bg-yellow-200 px-0.5">Custom cohort analysis</span> was critical for us"</p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="h-4 w-4 rounded-full overflow-hidden">
                          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" alt="Mark" className="h-full w-full object-cover" />
                        </div>
                        <span className="text-[9px] text-slate-500">Mark</span>
                      </div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <p className="text-[11px] text-slate-900">"<span className="bg-yellow-200 px-0.5">Real-time streaming</span> is a must-have feature"</p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="h-4 w-4 rounded-full overflow-hidden">
                          <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" alt="Sarah" className="h-full w-full object-cover" />
                        </div>
                        <span className="text-[9px] text-slate-500">Sarah</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

