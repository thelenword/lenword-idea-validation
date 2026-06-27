import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { AlertTriangle, Check, Brain, Download, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export interface ValidationReport {
  meta: {
    id: string;
    submitted_at: string;
    idea_name: string;
    idea_one_liner: string;
  };
  scorecard: {
    overall_score: number;
    verdict: "NEEDS WORK" | "PROMISING" | "STRONG" | "EXCEPTIONAL";
    fatal_flaw: string | null;
    risk_flag_count: number;
    assumption_count: number;
    next_move_count: number;
  };
  dimensions: {
    id: string;
    label: string;
    score: number;
    analysis: string;
    fix: string;
  }[];
  assumptions_risk_matrix: {
    id: number;
    assumption: string;
    likelihood: number;
    impact: number;
    quadrant: "CRITICAL" | "WATCH" | "MONITOR" | "LOW_PRIORITY";
  }[];
  failure_modes: {
    rank: number;
    title: string;
    description: string;
    impact: number;
  }[];
  risk_flags: {
    id: number;
    severity: "CRITICAL" | "HIGH" | "MEDIUM";
    flag: string;
  }[];
  next_moves: {
    id: number;
    title: string;
    description: string;
    timeline: string;
  }[];
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  market_validation: {
    score: number;
    analysis: string;
    evidence_quality: "NONE" | "ANECDOTAL" | "WEAK" | "MODERATE" | "STRONG";
    recommended_experiments: string[];
  };
  solution_feasibility: {
    score: number;
    analysis: string;
    technical_complexity: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
    build_path: string;
  };
  competitive_landscape: {
    analysis: string;
    competitors: { name: string; advantage: string; weakness: string }[];
  };
  product_roadmap: {
    strategic_direction: string;
    phases: { phase: string; milestones: string[]; timeline: string }[];
  };
  deep_narrative_summary: string;
  provider?: string;
  version?: string;
}


export function ScoreGauge({ value, size = 200 }: { value: number; size?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (inView) {
      let s = 0;
      const i = setInterval(() => {
        s += 2;
        setV(Math.min(s, value));
        if (s >= value) clearInterval(i);
      }, 16);
      return () => clearInterval(i);
    }
  }, [inView, value]);
  const r = size / 2 - 12;
  const c = 2 * Math.PI * r;
  const offset = c - (v / 100) * c;
  return (
    <svg ref={ref} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6C3EF6" />
          <stop offset="100%" stopColor="#00C8FF" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#E8E4F8" strokeWidth="10" fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="url(#gaugeGrad)"
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.1s linear" }}
      />
      <text
        x="50%"
        y="48%"
        textAnchor="middle"
        className="font-display font-extrabold fill-text-dark"
        style={{ fontSize: size * 0.26 }}
      >
        {v}
      </text>
      <text
        x="50%"
        y="65%"
        textAnchor="middle"
        className="fill-text-light"
        style={{ fontSize: size * 0.08, fontWeight: 600 }}
      >
        / 100
      </text>
    </svg>
  );
}


export function RadarChart({ dimensions }: { dimensions: { label: string; score: number }[] }) {
  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const r = 100;
  const n = dimensions.length;

  const angleFor = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pointFor = (i: number, val: number) => {
    const a = angleFor(i);
    const rv = (val / 10) * r;
    return [cx + rv * Math.cos(a), cy + rv * Math.sin(a)];
  };
  const labelFor = (i: number) => {
    const a = angleFor(i);
    const lr = r + 35;
    return [cx + lr * Math.cos(a), cy + lr * Math.sin(a)];
  };

  const gridLevels = [2, 4, 6, 8, 10];
  const dataPoints = dimensions.map((d, i) => pointFor(i, d.score));
  const dataPath =
    dataPoints
      .map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`)
      .join(" ") + " Z";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
      {gridLevels.map((gl) => {
        const pts = Array.from({ length: n }, (_, i) => {
          const a = angleFor(i);
          const rv = (gl / 10) * r;
          return `${(cx + rv * Math.cos(a)).toFixed(1)},${(cy + rv * Math.sin(a)).toFixed(1)}`;
        }).join(" ");
        return <polygon key={gl} points={pts} fill="none" stroke="#D3D1C7" strokeWidth="0.5" />;
      })}
      {Array.from({ length: n }, (_, i) => {
        const [x2, y2] = pointFor(i, 10);
        return <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke="#D3D1C7" strokeWidth="0.5" />;
      })}
      <motion.path
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        d={dataPath}
        fill="rgba(108, 62, 246, 0.15)"
        stroke="#6C3EF6"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {dataPoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={4} fill="#6C3EF6" />
      ))}
      {dimensions.map((d, i) => {
        const [lx, ly] = labelFor(i);
        const anchor = lx < cx - 5 ? "end" : lx > cx + 5 ? "start" : "middle";
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize="10"
            fill="#5F5E5A"
            fontWeight="600"
          >
            {d.label.split(" ").map((word, idx) => (
              <tspan x={lx} dy={idx === 0 ? 0 : 12} key={idx}>
                {word}
              </tspan>
            ))}
          </text>
        );
      })}
    </svg>
  );
}


export function RiskMatrix({ assumptions }: { assumptions: ValidationReport["assumptions_risk_matrix"] }) {
  const size = 300;
  const pad = 40;
  const w = size - pad * 2;
  const h = size - pad * 2;
  const toX = (l: number) => pad + ((l - 1) / 9) * w;
  const toY = (im: number) => pad + ((10 - im) / 9) * h;

  const quadrants = [
    { label: "CRITICAL", x: pad + w / 2, y: pad, color: "#FCEBEB", textColor: "#E24B4A" },
    { label: "MONITOR", x: pad, y: pad, color: "#F1EFE8", textColor: "#888780" },
    { label: "WATCH", x: pad + w / 2, y: pad + h / 2, color: "#FAEEDA", textColor: "#BA7517" },
    { label: "LOW", x: pad, y: pad + h / 2, color: "#EAF3DE", textColor: "#3B6D11" },
  ];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {quadrants.map((q) => (
        <rect key={q.label} x={q.x} y={q.y} width={w / 2} height={h / 2} fill={q.color} />
      ))}
      <line x1={pad} y1={pad} x2={pad} y2={pad + h} stroke="#B4B2A9" strokeWidth="1" />
      <line x1={pad} y1={pad + h} x2={pad + w} y2={pad + h} stroke="#B4B2A9" strokeWidth="1" />
      <line
        x1={pad + w / 2}
        y1={pad}
        x2={pad + w / 2}
        y2={pad + h}
        stroke="#B4B2A9"
        strokeWidth="1"
        strokeDasharray="4,3"
      />
      <line
        x1={pad}
        y1={pad + h / 2}
        x2={pad + w}
        y2={pad + h / 2}
        stroke="#B4B2A9"
        strokeWidth="1"
        strokeDasharray="4,3"
      />

      <text
        x={pad + w / 2}
        y={size - 10}
        textAnchor="middle"
        fontSize="10"
        fill="#888780"
        fontWeight="600"
      >
        LIKELIHOOD →
      </text>
      <text
        x={15}
        y={pad + h / 2}
        textAnchor="middle"
        fontSize="10"
        fill="#888780"
        fontWeight="600"
        transform={`rotate(-90, 15, ${pad + h / 2})`}
      >
        ↑ IMPACT
      </text>

      {assumptions.map((a) => {
        const x = toX(a.likelihood);
        const y = toY(a.impact);
        const color =
          a.quadrant === "CRITICAL"
            ? "#E24B4A"
            : a.quadrant === "WATCH"
              ? "#BA7517"
              : a.quadrant === "MONITOR"
                ? "#185FA5"
                : "#639922";
        return (
          <g key={a.id}>
            <circle
              cx={x}
              cy={y}
              r={12}
              fill={color}
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
            />
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fill="white"
              fontWeight="bold"
            >
              {a.id}
            </text>
          </g>
        );
      })}
    </svg>
  );
}


export function BulletText({ text, className }: { text: string; className?: string }) {
  if (!text) return null;
  const lines = text.split('\n').filter((l) => l.trim() !== "");
  
  if (lines.length === 1 && !lines[0].trim().startsWith("-")) {
    return <p className={className}>{text}</p>;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {lines.map((line, idx) => {
        const t = line.trim();
        if (t.startsWith("-")) {
          return (
            <div key={idx} className="flex gap-2 text-sm text-muted-foreground leading-relaxed">
              <span className="text-primary mt-0.5 flex-shrink-0">&bull;</span>
              <span>{t.substring(1).trim()}</span>
            </div>
          );
        }
        return <p key={idx} className="text-sm text-muted-foreground leading-relaxed">{line}</p>;
      })}
    </div>
  );
}


export function SwotCard({
  color,
  title,
  items,
}: {
  color: "success" | "highlight" | "accent" | "primary";
  title: string;
  items: string[];
}) {
  const map = {
    success: "border-success/30 bg-success/5",
    highlight: "border-highlight/30 bg-highlight/5",
    accent: "border-accent/30 bg-accent/5",
    primary: "border-primary/30 bg-primary/5",
  } as const;
  const dot = {
    success: "bg-success",
    highlight: "bg-highlight",
    accent: "bg-accent",
    primary: "bg-primary",
  } as const;
  return (
    <div className={`rounded-2xl border-2 p-5 ${map[color]}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-3 h-3 rounded-full ${dot[color]}`} />
        <h4 className="font-display font-bold text-lg">{title}</h4>
      </div>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it} className="text-sm text-muted-foreground flex gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${dot[color]} mt-2 flex-shrink-0`} />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}


export function DimBar({ l, v, c }: { l: string; v: number; c: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  return (
    <div ref={ref}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-foreground">{l}</span>
        <span className="text-sm font-display font-bold text-foreground">{v}/10</span>
      </div>
      <div className="h-2.5 bg-border rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${v * 10}%` } : { width: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className={`h-full rounded-full ${c}`}
        />
      </div>
    </div>
  );
}


export function ReportSection({
  name,
  report,
  onRestart,
}: {
  name: string;
  report: ValidationReport;
  onRestart: () => void;
}) {
  const [openSummary, setOpenSummary] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const getDimColor = (score: number) => {
    if (score >= 7) return "bg-success";
    if (score >= 5) return "bg-yellow-400";
    return "bg-highlight";
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      const reportName = report.meta.idea_name || name || "startup";
      
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${apiBaseUrl}/api/export-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          ...report,
          startupName: reportName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to export PDF: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const sanitizedName = reportName
        .trim()
        .replace(/[^a-zA-Z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      a.download = `${sanitizedName || "startup"}-validation-report.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("PDF report downloaded successfully!");
    } catch (err) {
      toast.error((err as Error).message || "Failed to download PDF report.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-white to-bg-base">
      <div className="max-w-5xl mx-auto">
        <div className="bg-card border border-border rounded-3xl shadow-2xl shadow-primary/10 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-hero p-8 md:p-10 text-white relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-card/10 blur-2xl" />
            <div className="relative flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xs font-display font-semibold uppercase tracking-[0.2em] opacity-80">
                  Analytical Validation Report
                </div>
                <h2 className="mt-2 font-display font-extrabold text-3xl md:text-4xl">
                  {report.meta.idea_name}
                </h2>
                <div className="mt-3 text-sm opacity-80">
                  ID: {report.meta.id} · Submitted{" "}
                  {new Date(report.meta.submitted_at).toLocaleDateString()}
                </div>
                <div className="mt-2 text-xs font-semibold text-accent bg-card/10 px-3 py-1.5 rounded-lg inline-block">
                  AI Provider Engine: GEMINI | Generated via LENWORD Validate Executive Summary
                </div>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-card/15 backdrop-blur-sm rounded-full text-xs font-semibold">
                <Brain size={14} /> Expert Analysis
              </div>
            </div>
          </div>

          {/* Scorecard Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 border-b border-border bg-background/30">
            {[
              { label: "OVERALL SCORE", val: report.scorecard.overall_score, sub: "/10" },
              { label: "RISK FLAGS", val: report.scorecard.risk_flag_count, sub: "" },
              { label: "ASSUMPTIONS", val: report.scorecard.assumption_count, sub: "" },
              { label: "NEXT MOVES", val: report.scorecard.next_move_count, sub: "" },
            ].map((s) => (
              <div key={s.label} className="p-6 text-center border-r border-border last:border-r-0">
                <div className="text-[10px] font-bold text-muted-foreground tracking-widest">
                  {s.label}
                </div>
                <div className="text-2xl font-bold text-foreground mt-1">
                  {s.val}
                  <span className="text-sm font-normal text-muted-foreground">{s.sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Overall Score + Fatal Flaw */}
          <div className="p-8 md:p-10 grid md:grid-cols-5 gap-8 items-center border-b border-border">
            <div className="md:col-span-2 flex flex-col items-center">
              <ScoreGauge value={report.scorecard.overall_score * 10} size={200} />
              <div
                className={`mt-4 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase
                  ${
                    report.scorecard.verdict === "EXCEPTIONAL"
                      ? "bg-primary/10 text-primary"
                      : report.scorecard.verdict === "STRONG"
                        ? "bg-success/10 text-success"
                        : report.scorecard.verdict === "PROMISING"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-highlight/10 text-highlight"
                  }`}
              >
                {report.scorecard.verdict}
              </div>
            </div>
            <div className="md:col-span-3">
              {report.scorecard.fatal_flaw ? (
                <div className="bg-highlight/10 border-2 border-highlight/30 rounded-2xl p-6">
                  <div className="flex items-center gap-2 text-highlight mb-3">
                    <AlertTriangle size={20} />
                    <span className="text-xs font-bold tracking-widest uppercase">
                      Fatal Flaw Analysis
                    </span>
                  </div>
                  <p className="text-highlight font-semibold text-lg leading-relaxed">
                    {report.scorecard.fatal_flaw}
                  </p>
                </div>
              ) : (
                <div className="bg-success/10 border-2 border-success/30 rounded-2xl p-6">
                  <div className="flex items-center gap-2 text-success mb-3">
                    <Check size={20} />
                    <span className="text-xs font-bold tracking-widest uppercase">
                      No Fatal Flaws
                    </span>
                  </div>
                  <p className="text-success font-semibold text-lg leading-relaxed">
                    No single execution-killing flaw identified. Continue with caution on individual
                    risks.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Visual Analytics */}
          <div className="p-8 md:p-10 border-b border-border grid md:grid-cols-2 gap-12">
            <div className="text-center">
              <div className="text-xs font-bold text-muted-foreground tracking-widest uppercase mb-8">
                Dimension Radar
              </div>
              <div className="flex justify-center">
                <RadarChart dimensions={report.dimensions} />
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-muted-foreground tracking-widest uppercase mb-8 text-center md:text-left">
                Dimension Breakdown
              </div>
              <div className="space-y-6">
                {report.dimensions.map((d) => (
                  <DimBar
                    key={d.id}
                    l={d.label}
                    v={d.score}
                    c={
                      d.score >= 7 ? "bg-success" : d.score >= 5 ? "bg-yellow-400" : "bg-highlight"
                    }
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Dimension Deep Dives */}
          <div className="p-8 md:p-10 border-b border-border">
            <h3 className="text-xs font-bold text-muted-foreground tracking-widest uppercase mb-8">
              Strategic Deep Dive
            </h3>
            <div className="space-y-12">
              {report.dimensions.map((d, i) => (
                <div key={d.id} className="relative pl-10">
                  <div className="absolute left-0 top-0 text-3xl font-display font-extrabold text-primary/10 select-none">
                    {(i + 1).toString().padStart(2, "0")}
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-display font-bold text-xl">{d.label}</h4>
                    <span
                      className={`text-lg font-bold ${d.score >= 7 ? "text-success" : d.score >= 5 ? "text-yellow-600" : "text-highlight"}`}
                    >
                      {d.score}
                      <span className="text-xs font-normal text-muted-foreground font-sans ml-1">
                        /10
                      </span>
                    </span>
                  </div>
                  <BulletText text={d.analysis} className="mb-4" />
                  <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-xl">
                    <div className="text-[10px] font-bold text-primary tracking-widest uppercase mb-1">
                      Recommendation
                    </div>
                    <p className="text-sm font-medium text-foreground">{d.fix}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Matrix */}
          <div className="p-8 md:p-10 border-b border-border grid lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2">
              <div className="text-xs font-bold text-muted-foreground tracking-widest uppercase mb-8">
                Assumptions Risk Matrix
              </div>
              <div className="flex justify-center">
                <RiskMatrix assumptions={report.assumptions_risk_matrix} />
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="text-xs font-bold text-muted-foreground tracking-widest uppercase mb-8">
                Critical Assumptions
              </div>
              <div className="space-y-4">
                {report.assumptions_risk_matrix.map((a) => (
                  <div
                    key={a.id}
                    className="bg-background border border-border p-4 rounded-xl flex gap-4"
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white
                        ${a.quadrant === "CRITICAL" ? "bg-highlight" : a.quadrant === "WATCH" ? "bg-yellow-500" : "bg-primary"}`}
                    >
                      {a.id}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground leading-snug mb-2">
                        {a.assumption}
                      </p>
                      <div className="flex gap-3">
                        <span className="text-[10px] text-muted-foreground font-bold">
                          L:{a.likelihood}/10
                        </span>
                        <span className="text-[10px] text-muted-foreground font-bold">
                          I:{a.impact}/10
                        </span>
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-widest
                            ${a.quadrant === "CRITICAL" ? "text-highlight" : a.quadrant === "WATCH" ? "text-yellow-600" : "text-success"}`}
                        >
                          {a.quadrant}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Failure Modes */}
          <div className="p-8 md:p-10 border-b border-border">
            <h3 className="text-xs font-bold text-muted-foreground tracking-widest uppercase mb-8">
              Existential Failure Modes
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {report.failure_modes.map((f) => (
                <div
                  key={f.rank}
                  className="bg-card border border-border p-6 rounded-2xl relative overflow-hidden group hover:border-primary/30 transition-colors"
                >
                  <div className="absolute top-0 right-0 p-4 font-display font-black text-4xl text-primary/5 group-hover:text-primary/10 transition-colors">
                    #{f.rank}
                  </div>
                  <h4 className="font-bold text-lg text-foreground mb-3 relative pr-8">{f.title}</h4>
                  <BulletText text={f.description} className="mb-4" />
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${i < f.impact ? "bg-highlight" : "bg-border"}`}
                      />
                    ))}
                  </div>
                  <div className="text-[9px] font-bold text-highlight tracking-widest uppercase mt-2">
                    Impact: {f.impact}/5
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SWOT */}
          <div className="p-8 md:p-10 border-b border-border">
            <h3 className="text-xs font-bold text-muted-foreground tracking-widest uppercase mb-8">
              SWOT Analysis
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <SwotCard color="success" title="Strengths" items={report.swot.strengths} />
              <SwotCard color="highlight" title="Weaknesses" items={report.swot.weaknesses} />
              <SwotCard color="accent" title="Opportunities" items={report.swot.opportunities} />
              <SwotCard color="primary" title="Threats" items={report.swot.threats} />
            </div>
          </div>

          {/* Validation & Feasibility */}
          <div className="p-8 md:p-10 border-b border-border grid md:grid-cols-2 gap-12">
            <div>
              <div className="text-xs font-bold text-muted-foreground tracking-widest uppercase mb-4">
                Market Validation
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-3xl font-display font-black text-primary">
                  {report.market_validation.score}
                  <span className="text-sm font-sans font-normal text-muted-foreground ml-1">/10</span>
                </div>
                <div className="px-3 py-1 bg-primary/5 border border-primary/20 rounded-full text-[10px] font-bold text-primary tracking-widest uppercase">
                  Quality: {report.market_validation.evidence_quality}
                </div>
              </div>
              <BulletText text={report.market_validation.analysis} className="mb-6" />
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mb-2">
                  Recommended Experiments
                </div>
                {report.market_validation.recommended_experiments.map((e, i) => (
                  <div key={i} className="flex gap-2 text-sm text-foreground font-medium">
                    <Sparkles size={14} className="text-primary flex-shrink-0 mt-0.5" />
                    {e}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-muted-foreground tracking-widest uppercase mb-4">
                Solution Feasibility
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-3xl font-display font-black text-accent">
                  {report.solution_feasibility.score}
                  <span className="text-sm font-sans font-normal text-muted-foreground ml-1">/10</span>
                </div>
                <div className="px-3 py-1 bg-accent/5 border border-accent/20 rounded-full text-[10px] font-bold text-accent tracking-widest uppercase">
                  Complexity: {report.solution_feasibility.technical_complexity}
                </div>
              </div>
              <BulletText text={report.solution_feasibility.analysis} className="mb-6" />
              <div className="bg-accent/5 border-l-4 border-accent p-4 rounded-r-xl">
                <div className="text-[10px] font-bold text-accent tracking-widest uppercase mb-1">
                  MVP Build Path
                </div>
                <BulletText text={report.solution_feasibility.build_path} className="font-medium text-foreground" />
              </div>
            </div>
          </div>

          {/* Solution & Roadmaps */}
          <div className="p-8 md:p-10 border-b border-border">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xs font-bold text-muted-foreground tracking-widest uppercase mb-4 text-center md:text-left">
                  Product Roadmap
                </h3>
                <BulletText text={report.product_roadmap.strategic_direction} className="mb-6 italic" />
                <div className="space-y-4">
                  {report.product_roadmap.phases.map((p, i) => (
                    <div key={i} className="border-l-2 border-primary/20 pl-4 py-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-foreground">{p.phase}</h4>
                        <span className="text-[10px] font-bold text-muted-foreground">{p.timeline}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {p.milestones.map((m, j) => (
                          <span
                            key={j}
                            className="text-[10px] px-2 py-0.5 bg-background rounded border border-border text-muted-foreground"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-muted-foreground tracking-widest uppercase mb-4 text-center md:text-left">
                  Competitive Edge
                </h3>
                  <BulletText text={report.competitive_landscape.analysis} className="mb-6" />
                <div className="space-y-4">
                  {report.competitive_landscape.competitors.map((c, i) => (
                    <div key={i} className="bg-background p-4 rounded-xl border border-border">
                      <div className="font-bold text-sm text-foreground mb-2">{c.name}</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-[9px] font-bold text-success uppercase mb-1">
                            Their Edge
                          </div>
                          <div className="text-[10px] leading-snug">{c.advantage}</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-bold text-highlight uppercase mb-1">
                            Our Advantage
                          </div>
                          <div className="text-[10px] leading-snug">{c.weakness}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Deep Narrative Summary */}
          <div className="p-8 md:p-10 border-b border-border bg-primary/5">
            <h3 className="text-xs font-bold text-primary tracking-widest uppercase mb-6 text-center">
              Executive Narrative Summary
            </h3>
            <div className="max-w-3xl mx-auto">
              <BulletText text={report.deep_narrative_summary} className="font-medium leading-relaxed" />
            </div>
          </div>

          {/* Next Moves */}
          <div className="p-8 md:p-10 border-b border-border">
            <h3 className="text-xs font-bold text-muted-foreground tracking-widest uppercase mb-8">
              What You Should Do This Week
            </h3>
            <div className="space-y-4">
              {report.next_moves.map((m) => (
                <div
                  key={m.id}
                  className="flex gap-6 items-start bg-card border border-border p-6 rounded-2xl hover:border-primary/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-cta flex items-center justify-center text-white font-display font-black flex-shrink-0">
                    {m.id.toString().padStart(2, "0")}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <h4 className="font-bold text-lg text-foreground">{m.title}</h4>
                      <span className="px-3 py-1 bg-background border border-border rounded-lg text-[10px] font-bold text-muted-foreground tracking-widest uppercase">
                        Timeline: {m.timeline}
                      </span>
                    </div>
                    <BulletText text={m.description} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="p-8 md:p-10 flex flex-col sm:flex-row gap-3 justify-center bg-background/30">
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="bg-gradient-cta text-white font-semibold px-8 py-4 rounded-xl shadow-xl shadow-primary/25 hover:scale-[1.03] transition inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Download size={20} /> {downloading ? "Formatting PDF..." : "Download Full Report"}
            </button>
            <button
              onClick={onRestart}
              className="border-2 border-primary text-primary font-semibold px-8 py-4 rounded-xl hover:bg-primary/5 transition inline-flex items-center justify-center gap-2"
            >
              <RotateCcw size={20} /> New Idea Validation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
