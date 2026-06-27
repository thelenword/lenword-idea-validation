// Trigger re-compilation
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ClipboardList,
  Brain,
  FileText,
  Target,
  Zap,
  BarChart3,
  Lock,
  Menu,
  X,
  ChevronDown,
  Download,
  RotateCcw,
  AlertTriangle,
  Check,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { AnimatedBlobs } from "@/components/AnimatedBlobs";
import { ReportSection, ValidationReport } from "@/components/ReportSection";

export const Route = createFileRoute("/validate")({
  head: () => ({
    meta: [
      { title: "LENWORD Validate — AI Startup Idea Validation" },
      {
        name: "description",
        content: "Answer 8 strategic questions. Get an honest AI validation report in seconds.",
      },
    ],
  }),
  component: LandingPage,
});

// ---------- TypeScript Types ----------

const SAMPLE_REPORT: ValidationReport = {
  meta: {
    id: "SX82K9L1",
    submitted_at: new Date().toISOString(),
    idea_name: "SupplyFlow",
    idea_one_liner: "An automated inventory management system for small coffee shops.",
  },
  scorecard: {
    overall_score: 7.2,
    verdict: "PROMISING",
    fatal_flaw: null,
    risk_flag_count: 2,
    assumption_count: 3,
    next_move_count: 3,
  },
  dimensions: [
    {
      id: "problem_clarity",
      label: "Problem Clarity",
      score: 8.5,
      analysis:
        "The problem of manual inventory in small cafes is well-defined and painful. Cafe owners lose significant time and money on spoilage.",
      fix: "Solidify your problem statement by quantifying the average loss per cafe.",
    },
    {
      id: "customer_specificity",
      label: "Customer Specificity",
      score: 7.0,
      analysis:
        "Small coffee shops are a reachable and homogeneous group, but geographical density matters for your initial roll-out.",
      fix: "Identify a specific metropolitan hub to start your pilot program.",
    },
    {
      id: "market_realism",
      label: "Market Realism",
      score: 6.5,
      analysis:
        "Pricing at $49/mo is plausible but requires proof of ROI for small businesses with tight margins.",
      fix: "Run a survey to see if $49/mo is within the 'no-brainer' budget for cafe owners.",
    },
    {
      id: "monetization_logic",
      label: "Monetization Logic",
      score: 6.0,
      analysis:
        "SaaS model is standard, but customer acquisition costs (CAC) might be high for a fragmented market.",
      fix: "Explore partnership models with wholesale bean suppliers.",
    },
    {
      id: "competitive_awareness",
      label: "Competitive Awareness",
      score: 7.5,
      analysis:
        "You are aware of Square and Shopify but your focused UI for coffee shops is your main moat.",
      fix: "Double down on coffee-specific features like milk shelf-life tracking.",
    },
    {
      id: "execution_feasibility",
      label: "Execution Feasibility",
      score: 8.0,
      analysis:
        "Building an inventory app is technically low-risk, but scaling sales is the real challenge.",
      fix: "Recruit a head of sales with experience in B2B hospitality.",
    },
  ],
  assumptions_risk_matrix: [
    {
      id: 1,
      assumption: "Cafe owners will actually use a digital tool instead of paper.",
      likelihood: 4,
      impact: 8,
      quadrant: "MONITOR",
    },
    {
      id: 2,
      assumption: "Wholesale suppliers will allow integration with their systems.",
      likelihood: 7,
      impact: 9,
      quadrant: "CRITICAL",
    },
    {
      id: 3,
      assumption: "Square doesn't launch a specific coffee shop module next month.",
      likelihood: 6,
      impact: 7,
      quadrant: "WATCH",
    },
  ],
  failure_modes: [
    {
      rank: 1,
      title: "Supplier Blockage",
      description:
        "If major suppliers refuse to integrate, cafe owners will find the manual entry too tedious.",
      impact: 5,
    },
    {
      rank: 2,
      title: "High CAC Drain",
      description:
        "If acquisition costs exceed lifetime value, the company will run out of cash before reaching scale.",
      impact: 4,
    },
  ],
  risk_flags: [
    {
      id: 1,
      severity: "HIGH",
      flag: "Integration dependency on 3rd party wholesale suppliers is a major bottleneck.",
    },
    {
      id: 2,
      severity: "MEDIUM",
      flag: "Low barriers to entry for incumbents like Square to replicate features.",
    },
  ],
  swot: {
    strengths: ["Industry focus", "Simple UI", "Strong team"],
    weaknesses: ["No sales network", "Limited funding", "Integration gaps"],
    opportunities: ["Expansion to bakeries", "Supply marketplace", "White labeling"],
    threats: ["Incumbent feature drift", "Economic downturn", "Hardware costs"],
  },
  market_validation: {
    score: 7.5,
    analysis:
      "Your early interviews show a clear willingness to test a solution that saves at least 3 hours a week. The manual effort currently expended by cafe owners represents a significant hidden cost. Automating this through a vertical SaaS approach is well-timed with the post-COVID push for digital efficiency in high-turnover hospitality environments.",
    evidence_quality: "MODERATE",
    recommended_experiments: ["Run a limited pilot with 3 cafes", "Test $49/mo landing page ads"],
  },
  solution_feasibility: {
    score: 9.0,
    analysis:
      "The technical requirements are well within standard web/mobile development capabilities. Using modern cross-platform frameworks will allow for rapid iteration on both iOS and Android. The primary technical risk is not the build itself, but the long-term maintenance of diverse API integrations with a shifting landscape of wholesale suppliers.",
    technical_complexity: "LOW",
    build_path: "Build a web-based MVP focused on inventory count and low-stock alerts.",
  },
  competitive_landscape: {
    analysis:
      "The market is currently bifurcated between high-end enterprise resource planning (ERP) systems that are too expensive and complex for small cafes, and simple paper-based workflows that are inefficient. Your positioning in the 'Goldilocks' zone—affordable automation—is highly defensible if you can move faster than Square's feature expansion.",
    competitors: [
      {
        name: "Square Inventory",
        advantage: "Built-in POS integration",
        weakness: "Lacks coffee-specific features like spoilage tracking",
      },
      {
        name: "Excel Checklists",
        advantage: "Free and familiar",
        weakness: "No automation or real-time visibility",
      },
    ],
  },
  product_roadmap: {
    strategic_direction:
      "Starting with narrow inventory automation to solve the immediate pain, then expanding into a full supply-chain marketplace where you facilitate the actual ordering process between cafes and suppliers.",
    phases: [
      {
        phase: "Phase 1: MVP",
        milestones: ["Core inventory tracking", "Push notifications", "Manual CSV export"],
        timeline: "0-3 months",
      },
      {
        phase: "Phase 2: Scale",
        milestones: ["API integrations", "Multi-location support", "Predictive ordering"],
        timeline: "3-9 months",
      },
    ],
  },
  deep_narrative_summary:
    "SupplyFlow represents a high-potential play in the vertical SaaS space. By targeting a narrow but highly repetitive pain point—coffee shop inventory—the venture can achieve rapid market penetration. The key to long-term success lies in the transition from a utility tool to a critical node in the supply chain ecosystem. While competition from incumbents like Square is a risk, the hyper-focused UX and coffee-specific logic provide a sufficient moat for early-stage growth. Focus on high-density metropolitan areas to create a network effect among local cafes and their shared suppliers. This is a venture built on operational efficiency and horizontal market expansion potential.",
  next_moves: [
    {
      id: 1,
      title: "Interview 5 Cafe Owners",
      description: "Focus on their current order frequency and spoilage rates.",
      timeline: "This week",
    },
    {
      id: 2,
      title: "Map Supplier APIs",
      description: "Identify which major bean suppliers have open APIs for integration.",
      timeline: "Next 2 weeks",
    },
    {
      id: 3,
      title: "Create MVP Wireframes",
      description: "Design the simplest possible interface for counting stock on a mobile device.",
      timeline: "Month 1",
    },
  ],
};

// ---------- Question Data ----------
type Q = {
  id: string;
  label: string;
  title: string;
  hint: string;
  placeholder: string;
  why: string;
};
const QUESTIONS: Q[] = [
  {
    id: "idea_name",
    label: "Idea Name",
    title: "What is the name of your startup?",
    hint: "Short and memorable is usually best.",
    placeholder: "e.g. LocalCook",
    why: "A name gives your idea a concrete identity from the start.",
  },
  {
    id: "Q01",
    label: "Problem Clarity",
    title: "What specific problem are you solving, and why is it important?",
    hint: "Who experiences this problem and how painful is it?",
    placeholder:
      "e.g. Small business owners spend 5+ hours per week manually reconciling invoices because accounting software is too complex...",
    why: "Problem clarity is the #1 predictor of startup success. Investors need to feel the pain before they believe in the solution.",
  },
  {
    id: "Q02",
    label: "Customer Definition",
    title: "Who are your target customers?",
    hint: "Describe them in detail — demographics, behaviors, pain points, and willingness to pay.",
    placeholder:
      "e.g. B2B SaaS targeting solo-operated retail stores with 1–5 employees, aged 30–50, tech-aware but not tech-savvy...",
    why: "Vague customer definition leads to vague marketing, poor product decisions, and missed revenue.",
  },
  {
    id: "Q03",
    label: "Solution Strength",
    title:
      "What is your solution, and what specifically makes it better than every existing alternative?",
    hint: "Describe the product and its core competitive advantage.",
    placeholder:
      "e.g. A lightweight dashboard that auto-categorizes B2B invoices in real-time. Unlike generic tools, it requires zero setup and is built specifically for solo-retailers...",
    why: "A winning solution must be 10x better than existing workarounds or competitor offerings to overcome customer inertia.",
  },
  {
    id: "Q04",
    label: "Current Stage",
    title: "Where are you right now?",
    hint: "Select the stage that best describes your progress.",
    placeholder:
      "",
    why: "Knowing your current stage allows us to evaluate your project's readiness and suggest the most appropriate next steps for development.",
  },
  {
    id: "Q05",
    label: "Competitive Positioning",
    title: "Who are your main competitors or alternatives, and what differentiates you?",
    hint: "Include both direct competitors and indirect alternatives (e.g. spreadsheets, manual processes).",
    placeholder:
      "e.g. Direct: QuickBooks, Wave. Indirect: Excel spreadsheets. We differ by focusing exclusively on single-operator businesses...",
    why: "If you can't name your competitors, you don't understand your market. If you can't differentiate, you have no moat.",
  },
  {
    id: "Q06",
    label: "Business Model",
    title: "How will your startup generate revenue?",
    hint: "Describe your business model and pricing strategy.",
    placeholder:
      "e.g. SaaS subscription: $19/month per user. Freemium model with 30-day trial. Target CAC < $60, LTV > $400...",
    why: "A great product without a working revenue model is a charity. We evaluate whether your monetization is realistic and sustainable.",
  },
  {
    id: "Q07",
    label: "Customer Acquisition",
    title: "How will your first 100 customers find out you exist?",
    hint: "Describe your distribution channels and user acquisition strategy.",
    placeholder:
      "e.g. Cold outbound emails to local accounting firms, posting in targeted Reddit communities for solo founders, and launching on Product Hunt...",
    why: "Product is only half the battle; distribution is the other. Knowing how you will reach your initial users is critical for survival.",
  },
  {
    id: "Q08",
    label: "Traction Evidence",
    title: "What traction or progress have you achieved so far?",
    hint: "Users, revenue, pilots, metrics, partnerships, or milestones.",
    placeholder:
      "e.g. 3 months in: 120 waitlist signups, 14 paying beta users, $840 MRR, 2 enterprise pilots...",
    why: "Traction is proof. Even small signals of momentum dramatically improve your validation score and investor credibility.",
  },
];

const DEMO_ANSWERS = QUESTIONS.map((q) => q.placeholder.replace(/^e\.g\. /, ""));

// ---------- Page ----------
function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const scrollToId = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden">
      <AnimatedBlobs className="fixed inset-0 z-0 opacity-60 dark:opacity-40 pointer-events-none" />
      <div className="relative z-10">
        <Navbar onCta={() => scrollToId("validate")} />
        <Questionnaire
          onComplete={(name, data, reportId) => {
            navigate({ to: `/reports/${reportId}` });
          }}
        />
        <Features />
        <Footer />
      </div>
    </div>
  );
}

// ---------- Navbar ----------
function Navbar({ onCta }: { onCta: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", f);
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/80 transition-shadow ${scrolled ? "shadow-[0_4px_30px_rgba(108,62,246,0.08)]" : ""}`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-semibold tracking-tight">LENWORD</span>
        </Link>
        <nav className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/"
            hash="how-it-works"
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition"
          >
            How It Works
          </Link>
          <button
            onClick={onCta}
            className="btn-primary text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-primary/20 transition"
          >
            Validate My Idea →
          </button>
        </nav>
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-foreground">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-card px-6 py-4 flex flex-col gap-3">
          <Link
            to="/"
            hash="how-it-works"
            onClick={() => setOpen(false)}
            className="text-left py-2 text-muted-foreground"
          >
            How It Works
          </Link>
          <button
            onClick={() => {
              setOpen(false);
              onCta();
            }}
            className="btn-primary text-white font-semibold px-4 py-3 rounded-xl transition"
          >
            Validate My Idea →
          </button>
        </div>
      )}
    </header>
  );
}



// ---------- Score Gauge ----------





// ---------- Questionnaire ----------
function Questionnaire({
  onComplete,
}: {
  onComplete: (name: string, data: ValidationReport, reportId: string) => void;
}) {
  // step 0..8 = questions
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<string[]>(Array(QUESTIONS.length).fill(""));
  const [loading, setLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);

  const goNext = async () => {
    if (step < QUESTIONS.length - 1) {
      setDirection(1);
      setStep(step + 1);
      return;
    }
    // submit
    setLoading(true);
    setLoadStep(1);

    const interval = setInterval(() => {
      setLoadStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 4000);

    try {
      const response = await apiFetch(`/api/validate-idea`, {
        method: "POST",
        body: JSON.stringify({
          startupName: answers[0], // idea_name is the first question now
          answers: QUESTIONS.map((q, i) => ({
            id: q.id,
            label: q.label,
            question: q.title,
            answer: answers[i] || "",
          })),
        }),
      });

      const report_id = response.report_id;

      const data = await new Promise<ValidationReport>((resolve, reject) => {
        let isDone = false;
        
        // Polling interval
        const checkStatus = async () => {
          if (isDone) return;
          try {
            const row = await apiFetch(`/api/report-status/${report_id}`);
              
            if (row.status === "completed") {
              isDone = true;
              resolve(row.report_data as ValidationReport);
            } else if (row.status === "failed") {
              isDone = true;
              reject(new Error("Validation processing failed."));
            }
          } catch (err) {
            console.error("Error polling report status:", err);
          }
          
          if (!isDone) {
            setTimeout(checkStatus, 2000); // check again in 2 seconds
          }
        };
        
        // Start polling
        checkStatus();
      });

      setLoadStep(4);
      await new Promise((resolve) => setTimeout(resolve, 800));

      clearInterval(interval);
      setLoading(false);
      setLoadStep(0);
      onComplete(answers[0], data, report_id);
    } catch (err) {
      clearInterval(interval);
      setLoading(false);
      setLoadStep(0);
      toast.error((err as Error).message || "Failed to generate validation report.");
    }
  };
  const goBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const setAnswer = (v: string) => {
    const a = [...answers];
    a[step] = v;
    setAnswers(a);
  };

  return (
    <section id="validate" className="py-24 px-6 relative">
      <div className="max-w-3xl mx-auto">
        <Reveal>
          <div className="text-center mb-10">
            <div className="text-xs font-display font-semibold uppercase tracking-[0.18em] text-primary">
              The Validation
            </div>
            <h2 className="mt-3 font-display font-extrabold text-4xl md:text-5xl">
              Validate Your Idea Now
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              8 deep questions. Honest answers in. Honest report out.
            </p>
          </div>
        </Reveal>

        <div className="bg-card border border-border rounded-3xl shadow-xl shadow-primary/5 overflow-hidden">
          {/* Sticky-ish header (in-card) */}
          {!loading && (
            <div className="px-6 md:px-10 pt-8 pb-6 border-b border-border bg-card sticky top-16 z-30">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-display font-semibold uppercase tracking-widest text-muted-foreground">
                  Step {step + 1} of {QUESTIONS.length}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  {Math.round(((step + 1) / QUESTIONS.length) * 100)}% complete
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-border overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-hero rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <div className="mt-4 flex items-center justify-between gap-1.5">
                {QUESTIONS.map((_, i) => (
                  <span
                    key={i}
                    className={`h-2 flex-1 rounded-full transition-all ${
                      i < step
                        ? "bg-primary"
                        : i === step
                          ? "bg-accent animate-pulse-glow"
                          : "bg-border"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="p-6 md:p-10 min-h-[420px]">
            {loading ? (
              <LoadingState step={loadStep} />
            ) : (
              <AnimatePresence mode="wait" custom={direction}>
                <QuestionCard
                  key={step}
                  q={QUESTIONS[step]}
                  value={answers[step]}
                  onChange={setAnswer}
                  direction={direction}
                />
              </AnimatePresence>
            )}
          </div>

          {!loading && (
            <div className="px-6 md:px-10 py-5 border-t border-border bg-background/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={goBack}
                  disabled={step === 0}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-muted-foreground font-medium hover:bg-card disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  onClick={() => {
                    setAnswers(DEMO_ANSWERS);
                    setStep(QUESTIONS.length - 1);
                  }}
                  className="text-xs font-medium text-primary hover:text-primary/80 transition underline underline-offset-2"
                >
                  Fill Demo
                </button>
              </div>
              {step === QUESTIONS.length - 1 ? (
                <button
                  onClick={goNext}
                  disabled={!answers[step]?.trim()}
                  className="flex items-center gap-2 bg-gradient-cta text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-primary/25 hover:scale-[1.03] transition"
                >
                  <Sparkles size={16} /> Generate My Report →
                </button>
              ) : (
                <button
                  onClick={goNext}
                  disabled={!answers[step]?.trim()}
                  className="flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Continue <ArrowRight size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function QuestionCard({
  q,
  value,
  onChange,
  direction,
}: {
  q: Q;
  value: string;
  onChange: (v: string) => void;
  direction: number;
}) {
  const [openWhy, setOpenWhy] = useState(false);
  const max = 500;
  return (
    <motion.div
      initial={{ opacity: 0, x: direction * 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -direction * 40 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs font-display font-bold px-3 py-1 bg-primary/10 text-primary rounded-full tracking-wide">
          {q.id}
        </span>
        <span className="text-xs font-display font-semibold uppercase tracking-widest text-muted-foreground">
          {q.label}
        </span>
      </div>
      <h3 className="mt-4 font-display font-bold text-2xl md:text-3xl leading-tight text-balance">
        {q.title}
      </h3>
      <p className="mt-2 italic text-muted-foreground whitespace-pre-line">{q.hint}</p>

      {q.id === "Q04" ? (
        <div className="mt-5 flex flex-col gap-3">
          {[
            "Idea — concept only",
            "Concept — researched but unbuilt",
            "Prototype — something exists",
            "MVP — real users testing",
            "Revenue — paying customers exist"
          ].map((option, idx) => (
            <label
              key={idx}
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition ${value === option ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"}`}
            >
              <input
                type="radio"
                name="q04_stage"
                value={option}
                checked={value === option}
                onChange={(e) => onChange(e.target.value)}
                className="w-5 h-5 accent-primary cursor-pointer"
              />
              <span className="font-medium text-foreground text-base">{option}</span>
            </label>
          ))}
        </div>
      ) : (
        <div className="mt-5 relative">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value.slice(0, max))}
            placeholder={q.placeholder}
            rows={6}
            className="w-full px-5 py-4 rounded-2xl border-2 border-border bg-card text-foreground resize-none focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition leading-relaxed"
          />
          <div className="absolute bottom-3 right-4 text-xs text-muted-foreground font-medium">
            {value.length} / {max}
          </div>
        </div>
      )}

      <button
        onClick={() => setOpenWhy(!openWhy)}
        className="mt-4 flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition"
      >
        <Lightbulb size={16} /> Why this matters
        <motion.span animate={{ rotate: openWhy ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown size={16} />
        </motion.span>
      </button>
      <AnimatePresence>
        {openWhy && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-4 rounded-xl bg-primary/5 border border-primary/15 text-sm text-muted-foreground leading-relaxed">
              {q.why}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function LoadingState({ step }: { step: number }) {
  const msgs = [
    "Analyzing problem clarity...",
    "Evaluating market opportunity...",
    "Reviewing competitive positioning...",
    "Generating your validation report...",
  ];
  const progressPercent =
    step === 0 ? 10 : step === 1 ? 35 : step === 2 ? 60 : step === 3 ? 85 : 100;

  return (
    <div className="py-12 flex flex-col items-center">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-border" />
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-accent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <h3 className="mt-8 font-display font-bold text-2xl">Crunching your answers…</h3>
      <div className="mt-6 space-y-2 w-full max-w-sm">
        {msgs.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={i < step ? { opacity: 1, x: 0 } : { opacity: 0.3, x: -10 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-3 text-sm"
          >
            {i < step ? (
              <Check size={16} className="text-success" />
            ) : (
              <span className="w-4 h-4 rounded-full border-2 border-border" />
            )}
            <span className={i < step ? "text-foreground" : "text-muted-foreground"}>{m}</span>
          </motion.div>
        ))}
      </div>
      <div className="mt-8 h-2 w-full max-w-md rounded-full bg-border overflow-hidden">
        <motion.div
          className="h-full bg-gradient-hero"
          initial={{ width: "0%" }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}


// ---------- Report ----------



// ---------- Features ----------
function Features() {
  const items = [
    {
      icon: Target,
      t: "Unbiased Analysis",
      d: "No cheerleading. Honest evaluation of your actual answers.",
    },
    { icon: Zap, t: "Instant Results", d: "Get your full validation report in under 60 seconds." },
    {
      icon: BarChart3,
      t: "Structured Report",
      d: "SWOT, dimension scores, red flags, and actionable next steps.",
    },
    { icon: Lock, t: "Private & Secure", d: "Your startup data is never stored or shared." },
  ];
  return (
    <section className="py-20 px-6 bg-card border-y border-border">
      <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((it, i) => (
          <Reveal key={it.t} delay={i * 0.08}>
            <div className="text-center md:text-left">
              <div className="inline-flex w-12 h-12 rounded-2xl bg-primary/10 text-primary items-center justify-center">
                <it.icon size={22} />
              </div>
              <h4 className="mt-4 font-display font-bold text-lg">{it.t}</h4>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{it.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ---------- Footer ----------
function Footer() {
  return (
    <footer className="bg-[#0D0B1E] text-white px-6 py-14">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-start">
        <div>
          <div className="font-display font-extrabold text-2xl text-white">
            LENWORD<span className="text-accent">.</span>
          </div>
          <p className="mt-3 text-white/60 max-w-sm">Helping founders build better, faster.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 md:justify-end text-sm text-white/70">
          <Link to="/" hash="home" className="hover:text-white transition">
            Home
          </Link>
          <Link to="/" hash="how-it-works" className="hover:text-white transition">
            How It Works
          </Link>
          <a href="#validate" className="hover:text-white transition">
            Validate My Idea
          </a>
          <a href="#" className="hover:text-white transition">
            Privacy Policy
          </a>
        </nav>
      </div>
      <div className="mt-10 pt-6 border-t border-white/10 text-xs text-white/40 text-center">
        © {new Date().getFullYear()} LENWORD. All rights reserved.
      </div>
    </footer>
  );
}

// ---------- Reveal helper ----------
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
