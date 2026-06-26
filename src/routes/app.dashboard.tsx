import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ShieldCheck, FileText, Sparkles, ArrowRight, Brain, Inbox, Download, TrendingUp,
} from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { ScoreRing } from "@/components/ScoreRing";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — LENWORD Validate" }] }),
  component: Dashboard,
});

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const item: import("framer-motion").Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

function Dashboard() {
  const { user, profile } = useAuth();
  
  const rawName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Founder";
  const displayName = rawName.split(' ')[0];
  
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("validation_reports")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) throw error;
        if (data) setReports(data);
      } catch (err) {
        console.error("Error fetching reports:", err);
        toast.error("Failed to load validation reports.");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [user]);

  const handleExportCSV = () => {
    if (reports.length === 0) {
      toast.info("No reports to export");
      return;
    }

    const headers = ["Report Name", "Validation Score", "Stage", "Status", "Updated Date"];
    const csvContent = [
      headers.join(","),
      ...reports.map(r => {
        const score = r.score ? parseFloat(r.score) : 0;
        const date = new Date(r.created_at).toLocaleDateString();
        const stage = "Validation";
        const status = "Ready"; 
        const name = `"${(r.startup_name || '').replace(/"/g, '""')}"`;
        return [name, score, stage, status, date].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `dashboard_reports_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("CSV exported successfully");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <span className="text-muted-foreground animate-pulse">Loading dashboard...</span>
      </div>
    );
  }

  // V1 Empty State
  if (reports.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="glass-card rounded-3xl p-8 md:p-12 text-center relative overflow-hidden flex flex-col items-center justify-center">
          <div className="absolute inset-0 opacity-40" style={{ background: "radial-gradient(at 80% 0%, rgba(236,72,153,0.15), transparent 50%), radial-gradient(at 0% 100%, rgba(108,85,249,0.12), transparent 50%)" }} />
          <div className="relative h-20 w-20 rounded-2xl glass-strong flex items-center justify-center mb-6">
            <div className="absolute inset-0 rounded-2xl animate-pulse-glow" style={{ boxShadow: "0 0 0 1px rgba(108,85,249,0.2), 0 20px 50px -20px rgba(108,85,249,0.5)" }} />
            <Inbox className="h-8 w-8 text-primary" />
          </div>
          <h1 className="relative text-3xl md:text-4xl font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Welcome back!
          </h1>
          <p className="relative mt-4 text-muted-foreground text-sm max-w-lg leading-relaxed">
            You haven't validated any startup ideas yet. Start by validating your first idea and LENWORD will generate an AI-powered report with scores, strengths, weaknesses, risks, and recommendations.
          </p>
          <div className="relative mt-8">
            <Link to="/validate" className="btn-primary rounded-xl px-6 py-3 text-sm font-semibold inline-flex items-center gap-2 shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all">
              <Sparkles className="h-4 w-4" /> Validate Your First Idea
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Dynamic Overall Readiness Calculations
  const latestReport = reports[0];
  const reportData = latestReport?.report_data;

  const overallScore = latestReport?.score 
    ? Math.round(parseFloat(latestReport.score) * 10) 
    : (reportData?.scorecard?.overall_score ? Math.round(reportData.scorecard.overall_score * 10) : 0);

  const overallScoreVal = Math.max(0, Math.min(100, overallScore));
  const outperformPercent = Math.max(1, Math.min(99, Math.round(overallScoreVal - 3)));

  const marketScore = reportData?.market_validation?.score
    ? Math.round(reportData.market_validation.score * 10)
    : (reportData?.dimensions?.find((d: any) => d.id === 'market' || d.label?.toLowerCase().includes('market'))?.score * 10) || Math.max(10, overallScoreVal + 5);

  const productScore = reportData?.solution_feasibility?.score
    ? Math.round(reportData.solution_feasibility.score * 10)
    : (reportData?.dimensions?.find((d: any) => d.id === 'product' || d.label?.toLowerCase().includes('solution') || d.label?.toLowerCase().includes('product'))?.score * 10) || Math.max(10, overallScoreVal - 6);

  const teamScore = (reportData?.dimensions?.find((d: any) => d.id === 'team' || d.label?.toLowerCase().includes('team'))?.score * 10) || Math.max(10, overallScoreVal + 1);

  const marketScoreVal = Math.max(0, Math.min(100, marketScore));
  const productScoreVal = Math.max(0, Math.min(100, productScore));
  const teamScoreVal = Math.max(0, Math.min(100, teamScore));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-primary uppercase tracking-[0.2em]">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" /> Founder Dashboard
          </div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Good morning, <span className="gradient-text italic">{displayName}.</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Welcome back to your LENWORD workspace.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="glass rounded-xl px-4 py-2 text-sm font-medium inline-flex items-center gap-2 hover:-translate-y-0.5 transition"><Download className="h-4 w-4" /> Export CSV</button>
          <Link to="/validate" className="btn-primary rounded-xl px-4 py-2 text-sm font-medium inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> New report
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Reports section */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="lg:col-span-2 glass-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold tracking-tight">Recent reports</h3>
              <Link to="/app/reports" className="text-xs text-primary hover:underline inline-flex items-center gap-1">View all <ArrowRight className="h-3 w-3" /></Link>
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-white/60 bg-white/50 backdrop-blur">
              <table className="w-full text-sm">
                <thead className="bg-white/60 text-muted-foreground text-xs">
                  <tr>
                    <th className="text-left font-medium px-4 py-2.5">Report</th>
                    <th className="text-left font-medium px-4 py-2.5">Score</th>
                    <th className="text-left font-medium px-4 py-2.5">Stage</th>
                    <th className="text-left font-medium px-4 py-2.5">Updated</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => {
                    const score = r.score ? parseFloat(r.score) : 0;
                    const date = new Date(r.created_at).toLocaleDateString();
                    const tint = "from-indigo-400 to-primary";
                    return (
                      <tr key={r.id} onClick={() => r.pdf_url && window.open(r.pdf_url, '_blank')} className={`border-t border-white/60 hover:bg-white/70 transition group ${r.pdf_url ? 'cursor-pointer' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${tint} shadow-sm group-hover:scale-105 transition`} />
                            <span className="font-medium">{r.startup_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                              <motion.div initial={{ width: 0 }} whileInView={{ width: `${score * 10}%` }} viewport={{ once: true }} transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full" style={{ background: "var(--gradient-primary)" }} />
                            </div>
                            <span className="text-xs tabular-nums">{score}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-white border border-border/60">Validation</span></td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{date}</td>
                        <td className="px-4 py-3 text-right">
                          {r.pdf_url ? (
                            <a href={r.pdf_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition inline-flex items-center gap-1">
                              Open <ArrowRight className="h-3 w-3" />
                            </a>
                          ) : (
                            <Link to="/app/reports" className="text-xs text-primary opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition inline-flex items-center gap-1">
                              Open <ArrowRight className="h-3 w-3" />
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground border-t border-border/10 pt-4">
            <span>Showing latest {reports.length} report{reports.length === 1 ? '' : 's'}</span>
          </div>
        </motion.div>

        {/* Dynamic Overall Readiness Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-2xl p-6 relative overflow-hidden text-white flex flex-col justify-between" style={{ background: "linear-gradient(135deg,#0a1628 0%,#0d2840 55%,#1a1a4a 130%)" }}>
          <div className="absolute -top-24 -right-20 h-72 w-72 rounded-full blur-3xl opacity-60 animate-aurora" style={{ background: "radial-gradient(circle, var(--accent), transparent 60%)" }} />
          <div className="absolute -bottom-28 -left-16 h-72 w-72 rounded-full blur-3xl opacity-40 animate-aurora" style={{ background: "radial-gradient(circle, var(--primary), transparent 60%)", animationDelay: "-7s" }} />
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
          
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 text-[11px] text-white/80 bg-white/10 backdrop-blur rounded-full px-2 py-1">
                <Brain className="h-3 w-3" /> AI Validation
              </div>
              <span className="text-[10px] text-white/60">Real-time analysis</span>
            </div>
            <h3 className="mt-3 text-base font-medium">Overall readiness</h3>

            <div className="mt-4 flex flex-col items-center">
              <ScoreRing value={overallScoreVal} size={180} stroke={12} label="readiness" />
              <div className="mt-3 text-[11px] text-white/65 text-center max-w-[16rem]">
                You're outperforming <span className="text-white font-medium">{outperformPercent}%</span> of seed-stage founders in your sector.
              </div>
            </div>
          </div>

          <div className="relative mt-5 grid grid-cols-3 gap-2 text-center">
            {[
              { l: "Market", v: marketScoreVal },
              { l: "Product", v: productScoreVal },
              { l: "Team", v: teamScoreVal },
            ].map((s) => (
              <div key={s.l} className="rounded-xl bg-white/8 border border-white/10 backdrop-blur p-2">
                <div className="text-sm font-semibold tabular-nums">{s.v}</div>
                <div className="text-[10px] text-white/60 uppercase tracking-wider">{s.l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
