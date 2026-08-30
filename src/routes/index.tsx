import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Target, Database, Bot, Shield, Zap, CheckCircle2, Settings, FileText, BarChart2, Users, Lock, Zap as Lightning, MessageSquare, Lightbulb, Code, Globe, BookOpen, Sparkles, Heart, DollarSign, LayoutDashboard, TrendingUp, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingLiveDemo } from "@/components/landing-live-demo";
import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "leaveesy — Your software knows its features. Now it knows your customers." },
      {
        name: "description",
        content:
          "leaveesy reads your changelogs, understands your product, and asks customers the right questions. Turn every cancellation into actionable intelligence with AI-powered exit interviews.",
      },
      { property: "og:title", content: "leaveesy — AI-powered churn intelligence for modern SaaS" },
      {
        property: "og:description",
        content:
          "Your software knows its features. Now it knows your customers. leaveesy learns your product and asks intelligent questions to uncover churn reasons, competitor insights, and revenue risks.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src="/leaveesy.png" alt="leaveesy" className="h-32 w-auto object-contain" />
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Animated grid pattern background */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
        {/* Soft mesh gradient overlay */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.15), transparent),
              radial-gradient(ellipse 60% 40% at 80% 50%, rgba(139, 92, 246, 0.1), transparent),
              radial-gradient(ellipse 60% 40% at 20% 80%, rgba(168, 85, 247, 0.08), transparent)
            `,
          }}
        />
        <div className="mx-auto max-w-7xl px-6 pt-32 pb-24">
          <div className="text-center">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-soft animate-fade-in">
              <Sparkles className="h-3 w-3 text-primary" />
              AI-powered churn intelligence for modern SaaS
            </div>
            <h1 className="mx-auto max-w-4xl text-balance text-5xl font-semibold tracking-tight md:text-[72px] md:leading-[1.1] animate-slide-up">
              Understand why customers leave. Know what to fix.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-xl text-muted-foreground leading-relaxed animate-slide-up">
              AI-powered exit interviews that automatically uncover churn reasons, competitor insights, revenue risks, and product opportunities.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-slide-up stagger-2">
              <Link to="/auth">
                <Button size="lg" className="gap-2 h-12 px-8 text-base hover-lift">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <button
                onClick={() => document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="h-12 px-8 text-base border border-border bg-background hover:bg-muted rounded-lg transition-colors"
              >
                Explore leaveesy
              </button>
            </div>
          </div>

          {/* Live auto-playing demo */}
          <div id="demo-section" className="mx-auto mt-16 max-w-6xl animate-slide-up stagger-3">
            <LandingLiveDemo />
          </div>
        </div>
      </section>

      {/* Leaveesy AI Knows Your Software */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              leaveesy AI knows your software
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Simply provide your URLs. leaveesy learns your features, updates, and product context automatically.
            </p>
          </div>

          <div className="mt-16 space-y-6">
            <div className="group">
              <div className="border border-border rounded-lg p-6 hover:border-border/80 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Globe className="h-5 w-5 text-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">Changelog URLs</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add your changelog or release notes URL. leaveesy scrapes and learns about your latest features and updates.
                    </p>
                    <div className="rounded-md bg-muted border border-border p-3">
                      <code className="text-sm text-foreground font-mono">
                        https://yourproduct.com/changelog
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="border border-border rounded-lg p-6 hover:border-border/80 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">Documentation URLs</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Link your docs. leaveesy understands your product capabilities, features, and use cases.
                    </p>
                    <div className="rounded-md bg-muted border border-border p-3">
                      <code className="text-sm text-foreground font-mono">
                        https://docs.yourproduct.com
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conversation Example */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              AI that understands your product
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              leaveesy asks relevant questions based on your product knowledge, not generic scripts.
            </p>
          </div>

          <div className="mx-auto max-w-2xl">
            <div className="border border-border rounded-lg p-6 bg-card">
              <div className="space-y-4">
                <div className="flex gap-3 justify-end">
                  <div className="flex-1 max-w-[80%] rounded-lg bg-muted p-4 text-sm">
                    The reporting feature doesn't have the filters I need.
                  </div>
                </div>
                <div className="flex gap-3">
                  <img src="/leaveesy.png" alt="leaveesy" className="h-8 w-auto object-contain shrink-0" />
                  <div className="flex-1 rounded-lg bg-muted border border-border p-4 text-sm">
                    I understand. Are you looking for custom date range filters or specific data field filtering in your reports?
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Know What to Fix */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Know what to fix
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Visual breakdown of churn causes with trend analysis to identify patterns.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Churn Causes</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                See exactly why customers cancel with visual breakdown by category, feature, and competitor.
              </p>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-foreground">Missing features</span>
                    <span className="text-muted-foreground">42%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-foreground rounded-full" style={{ width: '42%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-foreground">Pricing</span>
                    <span className="text-muted-foreground">23%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-foreground rounded-full" style={{ width: '23%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-foreground">Competitor</span>
                    <span className="text-muted-foreground">18%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-foreground rounded-full" style={{ width: '18%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <LineChart className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Trend Analysis</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Track churn trends over time to identify patterns and measure the impact of your fixes.
              </p>
              <div className="rounded-md bg-muted border border-border p-4">
                <div className="flex items-end gap-2 h-24">
                  <div className="flex-1 bg-muted-foreground/40 rounded-t" style={{ height: '40%' }} />
                  <div className="flex-1 bg-muted-foreground/40 rounded-t" style={{ height: '55%' }} />
                  <div className="flex-1 bg-muted-foreground/40 rounded-t" style={{ height: '45%' }} />
                  <div className="flex-1 bg-muted-foreground/40 rounded-t" style={{ height: '70%' }} />
                  <div className="flex-1 bg-muted-foreground/40 rounded-t" style={{ height: '60%' }} />
                  <div className="flex-1 bg-foreground rounded-t" style={{ height: '35%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leaveesy AI Recommendations */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              leaveesy AI recommendations
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              AI-generated actions to reduce churn and improve retention based on real customer feedback.
            </p>
          </div>

          <div className="mt-16 space-y-4">
            <div className="border border-border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Lightbulb className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Add cohort reporting</h3>
                    <p className="text-sm text-muted-foreground">HIGH IMPACT</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Reduce churn by 23%
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Customers need to analyze user behavior by segments. This feature was mentioned in 23% of cancellations.
              </p>
            </div>

            <div className="border border-border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Lightbulb className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Viewer-tier pricing</h3>
                    <p className="text-sm text-muted-foreground">MEDIUM</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Save $12k/mo revenue
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Introduce a lower-cost plan for read-only users. Could save $12k/mo in revenue.
              </p>
            </div>

            <div className="border border-border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Lightbulb className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Improve onboarding</h3>
                    <p className="text-sm text-muted-foreground">QUICK WIN</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Reduce churn by 18%
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Simplify the setup process. 18% of users cited complexity as their primary reason for leaving.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customize Your Own */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Customize your own
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Professional pre-form templates that change automatically. Choose the perfect fit for your brand.
            </p>
          </div>

          <div className="mt-16">
            <TemplateCarousel />
          </div>
        </div>
      </section>

      {/* Invite Your Team */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Invite your team
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Collaborate with your team through email invitations. Share insights and work together on retention.
            </p>
          </div>

          <div className="mt-16 max-w-2xl mx-auto">
            <div className="border border-border rounded-lg p-6">
              <div className="mb-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-foreground font-semibold">
                  JD
                </div>
                <div>
                  <h3 className="text-base font-semibold">John Doe</h3>
                  <p className="text-sm text-muted-foreground">Product Manager</p>
                </div>
              </div>
              <div className="rounded-md bg-muted border border-border p-4 mb-6">
                <div className="text-xs text-muted-foreground mb-2">Email Invitation</div>
                <div className="text-sm text-foreground">
                  Join our leaveesy workspace to collaborate on customer insights and churn reduction strategies.
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="flex-1">Send Invitation</Button>
                <Button variant="outline" className="flex-1">Copy Link</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Features */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Powerful dashboard features
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Comprehensive analytics and insights at your fingertips to drive retention decisions.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Churn Analytics</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Visual breakdown of cancellation reasons and trends
              </p>
            </div>

            <div className="border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Revenue at Risk</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Track MRR impact and revenue loss from churn
              </p>
            </div>

            <div className="border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Customer Voice</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Direct quotes and feedback from customers
              </p>
            </div>

            <div className="border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <Lightbulb className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="text-lg font-semibold">AI Recommendations</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Actionable insights to reduce churn
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-4xl px-6 py-32 text-center">
          <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Ready to understand your customers?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start your free trial today. Turn every cancellation into actionable intelligence.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="gap-2 h-12 px-8 text-base">
                Start free trial <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/exit-interview">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                See live demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src="/leaveesy.png" alt="leaveesy" className="h-32 w-auto object-contain" />
          </div>
          <p> 2023 leaveesy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function Logo() {
  return (
    <img src="/leaveesy.png" alt="leaveesy" className="h-7 w-7 object-contain" />
  );
}

// Template Carousel Component
function TemplateCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const templates = [
    {
      name: "Professional",
      icon: FileText,
      desc: "Clean and minimal design for enterprise teams",
      questions: ["What made you decide to leave?", "What could we have done differently?", "Would you consider returning?"]
    },
    {
      name: "Conversational",
      icon: MessageSquare,
      desc: "Friendly chat-style for SaaS products",
      questions: ["Hey! Sorry to see you go. What happened?", "Got it. Anything else we should know?", "Thanks for your feedback!"]
    },
    {
      name: "Quick Survey",
      icon: Zap,
      desc: "Fast multi-choice for high-volume feedback",
      questions: ["Primary reason for leaving?", "How long did you use our product?", "Rate your overall experience"]
    },
    {
      name: "Detailed Analysis",
      icon: BarChart3,
      desc: "In-depth questions for product insights",
      questions: ["Which features did you use most?", "What was missing for your needs?", "How did we compare to alternatives?"]
    },
    {
      name: "Empathy Focus",
      icon: Heart,
      desc: "Personal approach for customer retention",
      questions: ["We're sorry to see you go. Can you tell us why?", "How can we make this right for you?", "What would make you stay?"]
    },
    {
      name: "AI-Powered",
      icon: Sparkles,
      desc: "Smart adaptive questions based on responses",
      questions: ["What specific feature wasn't working for you?", "Did you try our documentation for help?", "What would convince you to upgrade?"]
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % templates.length);
        setIsAnimating(false);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, [templates.length]);

  const currentTemplate = templates[activeIndex];

  return (
    <div className="relative">
      <div className={`border border-border rounded-lg p-8 transition-all duration-300 ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
        <div className="flex items-center gap-4 mb-6">
          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
            <currentTemplate.icon className="h-6 w-6 text-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">{currentTemplate.name}</h3>
            <p className="text-sm text-muted-foreground">{currentTemplate.desc}</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {currentTemplate.questions.map((question, i) => (
            <div key={i} className="border border-border rounded-lg p-4 bg-muted/50">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0">
                  {i + 1}
                </div>
                <p className="text-sm text-foreground">{question}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {templates.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`h-2 rounded-full transition-all ${i === activeIndex ? 'w-8 bg-foreground' : 'w-2 bg-muted'}`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {activeIndex + 1} of {templates.length}
          </span>
        </div>
      </div>
    </div>
  );
}

// Browser Frame Dashboard Component with Glassmorphic Design
function BrowserFrameDashboard() {
  const churnData = [
    { name: "Missing features", value: 42, color: "#6366f1" },
    { name: "Pricing", value: 23, color: "#8b5cf6" },
    { name: "Competitor", value: 18, color: "#a855f7" },
    { name: "Onboarding", value: 11, color: "#d946ef" },
  ];

  const customerVoice = [
    { quote: "The reporting wasn't flexible enough for my team", company: "Acme Corp", avatar: "A" },
    { quote: "Pricing scaled faster than our value", company: "TechStart", avatar: "T" },
    { quote: "Native Slack workflows on competitor", company: "DevFlow", avatar: "D" },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-background/50 backdrop-blur-xl shadow-2xl">
      {/* Browser Window Header */}
      <div className="flex items-center gap-2 border-b border-border/60 bg-card/80 px-4 py-3">
        <div className="flex gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-green-500/80" />
        </div>
        <div className="ml-4 flex-1 rounded-md bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
          dashboard.leaveesy.com
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="bg-gradient-to-br from-slate-50/80 to-white/80 dark:from-slate-900/80 dark:to-slate-800/80 p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Churn Causes Chart */}
          <div className="rounded-2xl border border-border/50 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span className="font-semibold text-slate-900 dark:text-white">Churn Causes</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={churnData} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={30} />
                <Tooltip contentStyle={{ background: "rgba(255,255,255,0.95)", border: "1px solid #e2e8f0", fontSize: 12, borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                <Bar dataKey="value" radius={[8, 8, 8, 8]}>
                  {churnData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Customer Voice */}
          <div className="rounded-2xl border border-border/50 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-primary" />
              <span className="font-semibold text-slate-900 dark:text-white">Customer Voice</span>
            </div>
            <div className="space-y-3">
              {customerVoice.map((voice, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100/50 dark:border-indigo-800/30">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-semibold text-sm shadow-md">
                    {voice.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-900 dark:text-white leading-relaxed">"{voice.quote}"</p>
                    <p className="text-xs text-slate-500 mt-1">{voice.company}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Interactive Feature Tour Component
function InteractiveFeatureTour() {
  const [activeTab, setActiveTab] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  const tabs = [
    {
      id: 0,
      title: "Product Knowledge",
      description: "Scrapes changelogs/docs seamlessly",
      icon: BookOpen,
      content: (
        <div className="h-full flex flex-col justify-center p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-xl">
              <Database className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Knowledge Base</h3>
              <p className="text-sm text-slate-500">Auto-synced every 6 hours</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 border border-border/50 shadow-lg">
              <div className="text-3xl font-bold text-primary">1,842</div>
              <div className="text-xs text-muted-foreground mt-1">Changelog entries</div>
            </div>
            <div className="rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 border border-border/50 shadow-lg">
              <div className="text-3xl font-bold text-primary">89</div>
              <div className="text-xs text-muted-foreground mt-1">Documentation pages</div>
            </div>
            <div className="rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 border border-border/50 shadow-lg">
              <div className="text-3xl font-bold text-primary">247</div>
              <div className="text-xs text-muted-foreground mt-1">Features tracked</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 1,
      title: "Auto-Triggered Interviews",
      description: "Captures cancellation events via AI",
      icon: Bot,
      content: (
        <div className="h-full flex flex-col justify-center p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-xl">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">AI Interviewer</h3>
              <p className="text-sm text-slate-500">Contextual conversations</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex gap-2">
              <img src="/leaveesy.png" alt="leaveesy" className="h-10 w-auto object-contain shrink-0" />
              <div className="flex-1 rounded-2xl rounded-tl-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-3 border border-border/50 shadow-lg text-sm">
                Sorry to see you go. What stopped working for you?
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <div className="flex-1 rounded-2xl rounded-tr-md bg-gradient-to-br from-slate-800 to-slate-900 text-white p-3 text-sm max-w-[80%] shadow-lg">
                The reporting wasn't flexible enough.
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: "Actionable Insights",
      description: "Extracts competitor & revenue risks",
      icon: Lightbulb,
      content: (
        <div className="h-full flex flex-col justify-center p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-xl">
              <Lightbulb className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Smart Insights</h3>
              <p className="text-sm text-slate-500">AI-powered recommendations</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-100/50 dark:border-red-800/30 shadow-lg">
              <div className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-bold shrink-0">HIGH</div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Add cohort reporting feature</p>
                <p className="text-xs text-slate-500 mt-1">Reduce churn by 23%</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-100/50 dark:border-yellow-800/30 shadow-lg">
              <div className="px-2 py-1 rounded-lg bg-yellow-500 text-white text-xs font-bold shrink-0">MED</div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Introduce viewer-tier pricing</p>
                <p className="text-xs text-slate-500 mt-1">Save $12k/mo revenue</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (!isAutoRotating) return;

    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % tabs.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoRotating, tabs.length]);

  const handleTabClick = (id: number) => {
    setActiveTab(id);
    setIsAutoRotating(false);
  };

  return (
    <section className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <p className="text-sm font-medium text-primary">Interactive Tour</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            See leaveesy in action
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Explore how leaveesy transforms cancellations into intelligence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Left Panel - Timeline Tabs */}
          <div className="md:col-span-2 order-2 md:order-1">
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible pb-4 md:pb-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-300 text-left whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-xl scale-[1.02]"
                      : "bg-card hover:bg-card/80 border border-border/60"
                  }`}
                >
                  <tab.icon className={`h-5 w-5 shrink-0 mt-0.5 ${activeTab === tab.id ? "text-primary-foreground" : "text-muted-foreground"}`} />
                  <div>
                    <h3 className={`font-semibold ${activeTab === tab.id ? "text-primary-foreground" : "text-foreground"}`}>
                      {tab.title}
                    </h3>
                    <p className={`text-sm mt-1 ${activeTab === tab.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {tab.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Panel - Stage */}
          <div className="md:col-span-3 order-1 md:order-2">
            <div className="relative h-[400px] md:h-[500px] rounded-2xl border border-border/60 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 shadow-2xl overflow-hidden">
              <div
                key={activeTab}
                className="absolute inset-0 animate-fade-in-up"
              >
                {tabs[activeTab].content}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

