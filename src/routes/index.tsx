import { createFileRoute, Link, useLocation } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Sparkles, ArrowRight, ShieldCheck, TrendingUp, Target, Zap,
  BarChart3, Brain, Rocket, CheckCircle2, Star, ClipboardList, FileText,
  Menu, X, Plus, Minus
} from "lucide-react";
import { AuroraBackground } from "@/components/AuroraBackground";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LENWORD Validate — Validate startups with confidence" },
      { name: "description", content: "AI-powered startup validation, market analysis, and investor readiness reports for founders." },
      { property: "og:title", content: "LENWORD Validate" },
      { property: "og:description", content: "AI-powered startup validation, market analysis, and investor readiness reports for founders." },
    ],
  }),
  component: Landing,
});

const fadeUp: import("framer-motion").Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const, delay: i * 0.08 } }),
};

function Nav() {
  const { user, profile, loading } = useAuth();
  const [open, setOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, targetId: string) => {
    e.preventDefault();
    setOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      window.history.pushState(null, "", `#${targetId}`);
    }
  };

  return (
    <header className="relative z-30">
      <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-semibold tracking-tight">LENWORD</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#home" onClick={(e) => handleNavClick(e, "home")} className="hover:text-foreground transition">Home</a>
          <a href="#how-it-works" onClick={(e) => handleNavClick(e, "how-it-works")} className="hover:text-foreground transition">How It Works</a>
          <a href="#features" onClick={(e) => handleNavClick(e, "features")} className="hover:text-foreground transition">Features</a>
          <a href="#faq" onClick={(e) => handleNavClick(e, "faq")} className="hover:text-foreground transition">FAQ</a>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {!loading && user ? (
            <Link to="/app/settings" className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground transition">
              <Avatar className="h-8 w-8 border border-border/50">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="text-xs">
                  {profile?.full_name?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <span>{profile?.full_name?.split(' ')[0] || "Profile"}</span>
            </Link>
          ) : (
            <Link to="/app/dashboard" className="hidden sm:inline-flex text-sm font-medium text-foreground/80 hover:text-foreground transition">Sign in</Link>
          )}
          <Link to="/app/dashboard" className="btn-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
            Get Started <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-foreground focus:outline-none hover:text-primary transition"
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {/* Mobile navigation */}
      {open && (
        <div className="md:hidden border-b border-border/60 bg-background px-6 py-4 flex flex-col gap-3 absolute top-full left-0 right-0 z-50 shadow-[var(--shadow-soft)]">
          <button
            onClick={(e) => handleNavClick(e, "home")}
            className="text-left py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition"
          >
            Home
          </button>
          <button
            onClick={(e) => handleNavClick(e, "how-it-works")}
            className="text-left py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition"
          >
            How It Works
          </button>
          <button
            onClick={(e) => handleNavClick(e, "features")}
            className="text-left py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition"
          >
            Features
          </button>
          <button
            onClick={(e) => handleNavClick(e, "faq")}
            className="text-left py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition"
          >
            FAQ
          </button>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section id="home" className="relative overflow-hidden">
      <AuroraBackground />
      <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-32 lg:pt-24 lg:pb-40">


        <motion.h1
          initial="hidden" animate="visible" custom={1} variants={fadeUp}
          className="mt-6 text-center text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Validate your startup<br />
          before <span className="gradient-text italic">you build it.</span>
        </motion.h1>

        <motion.p initial="hidden" animate="visible" custom={2} variants={fadeUp}
          className="mt-6 mx-auto max-w-2xl text-center text-lg text-muted-foreground">
          LENWORD runs your startup idea through a structured analyst framework scoring it across different dimensions, exposing wrong assumptions, and telling you exactly why it might fail.
        </motion.p>

        <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}
          className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/validate" className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium">
            Get your validation score <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>



        <FloatingPreview />
      </div>
    </section>
  );
}

function FloatingPreview() {
  return (
    <div id="preview" className="relative mt-20 mx-auto max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="relative"
      >
        {/* Floating side cards */}
        <motion.div
          initial={{ opacity: 0, x: -40, y: 20 }} whileInView={{ opacity: 1, x: 0, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          className="hidden lg:block absolute -left-10 top-16 z-20 animate-float"
        >
          <ScoreCard />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40, y: 20 }} whileInView={{ opacity: 1, x: 0, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.45 }}
          className="hidden lg:block absolute -right-8 top-28 z-20 animate-float-delay"
        >
          <InvestorCard />
        </motion.div>

        {/* Main dashboard glass panel */}
        <div className="glass-strong rounded-3xl p-3 shadow-[var(--shadow-elev)]">
          <div className="rounded-2xl bg-white border border-border/60 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60 bg-white/60">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
              </div>
              <div className="ml-3 text-xs text-muted-foreground">app.lenword.com / dashboard</div>
            </div>
            <DashboardPreviewBody />
          </div>
        </div>

        {/* Floating analytics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.6 }}
          className="hidden md:block absolute -bottom-10 left-1/2 -translate-x-1/2 z-20 animate-float"
        >
          <AnalyticsCard />
        </motion.div>
      </motion.div>
    </div>
  );
}

function ScoreCard() {
  return (
    <div className="glass-strong rounded-2xl p-5 w-64">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Validation Score</span>
        <span className="text-emerald-600 font-medium">+12 this week</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-4xl font-semibold tracking-tight"><AnimatedCounter value={87} /></span>
        <span className="text-sm text-muted-foreground">/ 100</span>
      </div>
      <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
        <motion.div initial={{ width: 0 }} whileInView={{ width: "87%" }} viewport={{ once: true }} transition={{ duration: 1.6, ease: "easeOut" }}
          className="h-full rounded-full" style={{ background: "var(--gradient-primary)" }} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
        <div><div className="text-foreground font-medium text-sm">A+</div>Problem</div>
        <div><div className="text-foreground font-medium text-sm">A</div>Market</div>
        <div><div className="text-foreground font-medium text-sm">B+</div>Moat</div>
      </div>
    </div>
  );
}

function InvestorCard() {
  return (
    <div className="glass-strong rounded-2xl p-5 w-72">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg,#EC4899,#A855F7)" }}>
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-medium">Investor Readiness</div>
          <div className="text-xs text-muted-foreground">Seed-stage benchmark</div>
        </div>
      </div>
      <div className="mt-4 space-y-2.5">
        {[
          ["Team", 92, "emerald"],
          ["Traction", 74, "violet"],
          ["TAM clarity", 81, "pink"],
        ].map(([label, val]) => (
          <div key={label as string}>
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>{label}</span><span className="text-foreground">{val}%</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div initial={{ width: 0 }} whileInView={{ width: `${val}%` }} viewport={{ once: true }} transition={{ duration: 1.2 }}
                className="h-full" style={{ background: "var(--gradient-primary)" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsCard() {
  const bars = [40, 65, 50, 72, 58, 85, 70, 92, 80];
  return (
    <div className="glass-strong rounded-2xl px-5 py-4 w-[22rem]">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground">Startup performance</div>
          <div className="text-lg font-semibold">+34.2% <span className="text-xs font-normal text-emerald-600">MoM</span></div>
        </div>
        <div className="h-9 w-9 rounded-lg bg-foreground/5 flex items-center justify-center">
          <TrendingUp className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 flex items-end gap-1.5 h-14">
        {bars.map((h, i) => (
          <motion.div key={i} initial={{ height: 0 }} whileInView={{ height: `${h}%` }} viewport={{ once: true }}
            transition={{ duration: 0.9, delay: i * 0.05, ease: "easeOut" }}
            className="flex-1 rounded-sm" style={{ background: "var(--gradient-primary)", opacity: 0.4 + (i / bars.length) * 0.6 }} />
        ))}
      </div>
    </div>
  );
}

function DashboardPreviewBody() {
  return (
    <div className="grid grid-cols-12 gap-4 p-5 bg-background">
      {[
        { label: "Validation", value: "87", icon: Target, tint: "from-violet-500/15 to-fuchsia-500/15" },
        { label: "Market", value: "$4.2B", icon: BarChart3, tint: "from-pink-500/15 to-violet-500/15" },
        { label: "Investor", value: "A-", icon: ShieldCheck, tint: "from-emerald-500/15 to-cyan-500/15" },
        { label: "Reports", value: "12", icon: Sparkles, tint: "from-amber-500/15 to-pink-500/15" },
      ].map((m) => (
        <div key={m.label} className={`col-span-3 rounded-xl border border-border/60 bg-gradient-to-br ${m.tint} p-3`}>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>{m.label}</span><m.icon className="h-3 w-3" />
          </div>
          <div className="mt-1 text-lg font-semibold">{m.value}</div>
        </div>
      ))}
      <div className="col-span-8 rounded-xl bg-white border border-border/60 p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Validation trend</span><span>Last 30 days</span>
        </div>
        <svg viewBox="0 0 400 120" className="mt-2 w-full h-28">
          <defs>
            <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#6C55F9" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#6C55F9" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0,90 C50,70 80,80 120,55 C160,30 200,60 240,40 C280,22 320,35 400,15 L400,120 L0,120 Z" fill="url(#g1)" />
          <path d="M0,90 C50,70 80,80 120,55 C160,30 200,60 240,40 C280,22 320,35 400,15" stroke="#6C55F9" strokeWidth="2" fill="none" />
        </svg>
      </div>
      <div className="col-span-4 rounded-xl bg-white border border-border/60 p-4">
        <div className="text-xs text-muted-foreground">AI Recommendations</div>
        <div className="mt-2 space-y-2 text-xs">
          {["Sharpen ICP positioning", "Run 5 customer interviews", "Validate $39 price point"].map((t) => (
            <div key={t} className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 rounded-full" style={{ background: "var(--gradient-primary)" }} />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      icon: ClipboardList,
      title: "Answer 8 Questions",
      text: "Tell us about your problem, solution, target market, and stage through a guided questionnaire.",
    },
    {
      n: "02",
      icon: Brain,
      title: "LENWORD Analyzes Your Idea",
      text: "LENWORD evaluates your answers across 8 startup dimensions and identifies strengths, gaps, and risks.",
    },
    {
      n: "03",
      icon: FileText,
      title: "Receive Your Validation Report",
      text: "Get a structured report with actionable insights, a SWOT analysis, and specific recommendations.",
    },
  ];
  return (
    <section id="how-it-works" className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8 }} className="text-center max-w-2xl mx-auto">
          <div className="text-xs font-display font-semibold uppercase tracking-[0.18em] text-primary">
            How It Works
          </div>
          <h2 className="mt-3 font-display font-extrabold text-4xl md:text-5xl">
            How LENWORD Works
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Three steps. Nine questions. One honest report.
          </p>
        </motion.div>
        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <motion.div key={s.n} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, delay: i * 0.1 }} className="relative bg-card border border-border rounded-3xl p-8 h-full hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 transition-all overflow-hidden">
              <span className="absolute top-2 right-4 font-display font-extrabold text-7xl text-primary-light/15 select-none">
                {s.n}
              </span>
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-hero flex items-center justify-center text-white">
                  <s.icon size={22} />
                </div>
                <div className="mt-5 text-xs font-display font-semibold uppercase tracking-widest text-text-light">
                  Step {s.n}
                </div>
                <h3 className="mt-1 font-display font-bold text-2xl">{s.title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">{s.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { icon: Brain, title: "AI Validation Engine", desc: "Pressure-test idea, market, and moat with a model fine-tuned on 50k YC applications.", tint: "from-violet-500 to-fuchsia-500" },
    { icon: Target, title: "Market Opportunity Map", desc: "Live TAM/SAM/SOM modeling with competitor heatmaps and pricing insights.", tint: "from-pink-500 to-rose-500" },
    { icon: ShieldCheck, title: "Investor Readiness", desc: "Get a seed/Series A scorecard, with a deck-grade summary investors actually open.", tint: "from-emerald-500 to-teal-500" },
    { icon: Zap, title: "60-second Reports", desc: "From idea to a beautiful, sharable report in under a minute. No deck required.", tint: "from-amber-500 to-orange-500" },
  ];
  return (
    <section id="features" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Built for founders</p>
          <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Everything you need to <span className="gradient-text italic">de-risk</span> your next bet.
          </h2>
          <p className="mt-4 text-muted-foreground">Replace gut feel with a system. LENWORD Validate combines market data, founder benchmarks, and an AI partner that's brutally honest.</p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <motion.div key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} custom={i} variants={fadeUp}
              className="group relative rounded-2xl p-6 bg-white border border-border/60 hover:shadow-[var(--shadow-soft)] transition-all hover:-translate-y-1">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${f.tint} shadow-md`}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              <div className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}





function CTA() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative overflow-hidden rounded-[2rem] p-12 md:p-20 text-center" style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d2840 50%, #1a1a4a 100%)" }}>
          <div className="pointer-events-none absolute -top-32 -left-20 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-40 animate-aurora" style={{ background: "var(--primary)" }} />
          <div className="pointer-events-none absolute -bottom-32 -right-20 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-40 animate-aurora" style={{ background: "var(--accent)", animationDelay: "-5s" }} />
          <div className="relative">
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight text-white" style={{ fontFamily: "var(--font-display)" }}>
              Stop guessing. <span className="italic gradient-text">Start validating.</span>
            </h2>
            <p className="mt-5 max-w-xl mx-auto text-white/70">Built for founders who want truth, not comfort</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 items-center justify-center">
              <Link to="/validate" className="btn-primary inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium">
                Start free validation <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative py-12 border-t border-border/60">
      <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg" style={{ background: "var(--gradient-primary)" }} />
          <span>© 2026 LENWORD</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="mailto:info.lenword@gmail.com" className="hover:text-foreground">Email</a>
        </div>
      </div>
    </footer>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "Is LENWORD completely free?",
      a: "Yes. LENWORD's AI Idea Validator is currently free to use while we continue improving the platform and adding new features."
    },
    {
      q: "How does LENWORD evaluate my startup idea?",
      a: "LENWORD analyzes your startup idea across multiple dimensions including problem validation, solution strength, uniqueness, market potential, business viability, possible risks, and actionable improvements before generating a detailed AI report."
    },
    {
      q: "Will LENWORD steal or share my startup idea?",
      a: "No. Your startup ideas are treated as private and are not publicly displayed or shared without your permission."
    },
    {
      q: "Does LENWORD guarantee startup success?",
      a: "No. LENWORD provides AI-powered analysis and feedback to help founders make better decisions, but no AI tool can guarantee the success of a business."
    },
    {
      q: "Can I validate multiple startup ideas?",
      a: "Yes. You can submit and validate as many startup ideas as you like."
    },
    {
      q: "What features are coming next?",
      a: (
        <div>
          <p>Our roadmap includes:</p>
          <ul className="mt-2 space-y-1.5 pl-1">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>AI Business Plan Generator</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Mentor Marketplace</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Investor Dashboard</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Founder Community</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Startup Progress Tracking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Advanced Startup Analytics</span>
            </li>
          </ul>
        </div>
      )
    }
  ];

  return (
    <section id="faq" className="py-24 px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <div className="text-xs font-display font-semibold uppercase tracking-[0.18em] text-primary">
            FAQ
          </div>
          <h2 className="mt-3 font-display font-extrabold text-4xl md:text-5xl">
            Frequently Asked Questions
          </h2>
        </motion.div>
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="rounded-2xl border border-border/60 bg-white/50 dark:bg-card/50 overflow-hidden transition-colors duration-300"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left font-medium text-lg hover:text-primary transition-colors focus:outline-none"
                >
                  <span className="font-semibold pr-4 text-foreground">{faq.q}</span>
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 text-muted-foreground text-sm leading-relaxed border-t border-border/10 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Landing() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace(/^#/, "");
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } else if (window.location.hash) {
      const id = window.location.hash.replace(/^#/, "");
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Nav />
      <Hero />
      <HowItWorks />
      <Features />
      <FAQSection />
      <CTA />
      <Footer />
    </div>
  );
}
