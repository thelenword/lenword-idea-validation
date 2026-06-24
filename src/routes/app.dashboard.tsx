import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Target, BarChart3, ShieldCheck, FileText, TrendingUp, ArrowUpRight,
  Sparkles, ArrowRight, Brain, Zap, Activity, Calendar, CheckCircle2,
  CircleDashed, Inbox, PlusCircle, Users2, Download,
} from "lucide-react";
import {
  Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
} from "recharts";
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

const trend: any[] = [];

const metrics: any[] = [];

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const item: import("framer-motion").Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

function MiniSpark({ data, stroke }: { data: number[]; stroke: string }) {
  const points = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={36}>
      <AreaChart data={points} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`spk-${stroke.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.4} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={stroke} strokeWidth={1.8} fill={`url(#spk-${stroke.slice(1)})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function Dashboard() {
  const { user, profile } = useAuth();
  
  const rawName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Founder";
  const displayName = rawName.split(' ')[0];
  
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("validation_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (data) setReports(data);
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
          <p className="mt-1 text-sm text-muted-foreground">Your validation score moved +12 points this week. Here's what changed.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="glass rounded-xl px-4 py-2 text-sm font-medium inline-flex items-center gap-2 hover:-translate-y-0.5 transition"><Download className="h-4 w-4" /> Export CSV</button>
          <Link to="/validate" className="btn-primary rounded-xl px-4 py-2 text-sm font-medium inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> New report
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <motion.div initial="hidden" animate="visible" variants={stagger}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => {
          const sparkColor = ["#00FFD4","#5465FF","#10b981","#F59E0B"][idx];
          return (
            <motion.div key={m.label} variants={item}
              className="group glass-card glass-card-hover border-gradient rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition" style={{ background: `radial-gradient(circle, ${sparkColor}, transparent 60%)` }} />
              <div className="relative flex items-start justify-between">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-md bg-gradient-to-br ${m.tint}`}>
                  <m.icon className="h-5 w-5" />
                </div>
                <span className="text-[11px] text-emerald-600 font-medium inline-flex items-center gap-0.5 bg-emerald-50/80 border border-emerald-100 rounded-full px-1.5 py-0.5">
                  <ArrowUpRight className="h-3 w-3" />{m.change}
                </span>
              </div>
              <div className="relative mt-4 text-xs text-muted-foreground">{m.label}</div>
              <div className="relative mt-1 text-3xl font-semibold tracking-tight">
                {m.label === "Market Opportunity" && <span className="text-muted-foreground">$</span>}
                <AnimatedCounter value={m.value} suffix={m.suffix} decimals={(m as { decimals?: number }).decimals ?? 0} />
              </div>
              <div className="relative mt-1 text-[11px] text-muted-foreground">{m.note}</div>
              <div className="relative mt-3 -mx-1">
                <MiniSpark data={m.spark} stroke={sparkColor} />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-base font-semibold tracking-tight">Startup performance trend</h3>
              <p className="text-xs text-muted-foreground">Validation vs. market benchmark · last 8 weeks</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: "var(--primary)" }} /> You</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: "var(--accent)" }} /> Benchmark</span>
              </div>
              <div className="flex gap-1 text-xs glass rounded-xl p-1">
                {["1M","3M","6M","1Y"].map((t,i) => (
                  <button key={t} className={`px-2.5 py-1 rounded-lg transition ${i===1 ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{t}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" style={{ stopColor: "var(--primary)", stopOpacity: 0.5 }}/>
                    <stop offset="100%" style={{ stopColor: "var(--primary)", stopOpacity: 0 }}/>
                  </linearGradient>
                  <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" style={{ stopColor: "var(--accent)", stopOpacity: 0.28 }}/>
                    <stop offset="100%" style={{ stopColor: "var(--accent)", stopOpacity: 0 }}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="d" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} dy={6} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} width={30} />
                <Tooltip
                  cursor={{ stroke: "var(--primary)", strokeWidth: 1, strokeDasharray: "4 4", strokeOpacity: 0.25 }}
                  contentStyle={{
                    borderRadius: 14,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    backdropFilter: "blur(16px)",
                    boxShadow: "var(--shadow-elev)",
                    padding: "10px 12px",
                  }}
                  labelStyle={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}
                  itemStyle={{ fontSize: 12, fontWeight: 500 }}
                />
                <Area type="monotone" dataKey="m" name="Benchmark" stroke="var(--accent)" strokeWidth={2} fill="url(#grad2)" />
                <Area type="monotone" dataKey="v" name="You" stroke="var(--primary)" strokeWidth={2.5} fill="url(#grad1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Premium dark readiness card with score ring */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-2xl p-6 relative overflow-hidden text-white" style={{ background: "linear-gradient(135deg,#0a1628 0%,#0d2840 55%,#1a1a4a 130%)" }}>
          <div className="absolute -top-24 -right-20 h-72 w-72 rounded-full blur-3xl opacity-60 animate-aurora" style={{ background: "radial-gradient(circle, var(--accent), transparent 60%)" }} />
          <div className="absolute -bottom-28 -left-16 h-72 w-72 rounded-full blur-3xl opacity-40 animate-aurora" style={{ background: "radial-gradient(circle, var(--primary), transparent 60%)", animationDelay: "-7s" }} />
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 text-[11px] text-white/80 bg-white/10 backdrop-blur rounded-full px-2 py-1">
                <Brain className="h-3 w-3" /> AI Validation
              </div>
              <span className="text-[10px] text-white/60">Updated 2m ago</span>
            </div>
            <h3 className="mt-3 text-base font-medium">Overall readiness</h3>

            <div className="mt-4 flex flex-col items-center">
              <ScoreRing value={87} size={180} stroke={12} label="readiness" />
              <div className="mt-3 text-[11px] text-white/65 text-center max-w-[16rem]">
                You're outperforming <span className="text-white font-medium">84%</span> of seed-stage founders in your sector.
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              {[
                { l: "Market", v: 92 },
                { l: "Product", v: 81 },
                { l: "Team", v: 88 },
              ].map((s) => (
                <div key={s.l} className="rounded-xl bg-white/8 border border-white/10 backdrop-blur p-2">
                  <div className="text-sm font-semibold tabular-nums">{s.v}</div>
                  <div className="text-[10px] text-white/60 uppercase tracking-wider">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Widgets row: Today's focus / Activity / AI recs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's focus widget */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold tracking-tight flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" /> Today's focus
            </h3>
            <span className="text-[10px] text-muted-foreground">Thu · Jun 13</span>
          </div>
          <ul className="mt-4 space-y-2">
            {([] as any[]).map((task) => (
              <li key={task.t} className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/60 transition">
                {task.done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : (
                  <CircleDashed className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary transition" />
                )}
                <span className={`flex-1 text-sm ${task.done ? "text-muted-foreground line-through" : ""}`}>{task.t}</span>
                <span className="text-[10px] text-muted-foreground tabular-nums">{task.time}</span>
              </li>
            ))}
          </ul>
          <button className="mt-3 w-full text-xs text-primary inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-primary/30 hover:bg-primary/5 transition">
            <PlusCircle className="h-3.5 w-3.5" /> Add focus item
          </button>
        </motion.div>

        {/* Activity feed */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.05 }}
          className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold tracking-tight flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Recent activity
            </h3>
            <button className="text-xs text-primary hover:underline">All</button>
          </div>
          <ol className="mt-4 relative">
            <span className="absolute left-[11px] top-1 bottom-1 w-px bg-gradient-to-b from-primary/40 via-pink-400/30 to-transparent" />
            {([] as any[]).map((a, i) => (
              <li key={i} className="relative pl-8 pb-3 last:pb-0">
                <span className={`absolute left-0 top-1 h-6 w-6 rounded-full bg-gradient-to-br ${a.tint} ring-4 ring-white shadow`} />
                <div className="text-sm">
                  <span className="font-medium">{a.who}</span>{" "}
                  <span className="text-muted-foreground">{a.what}</span>
                </div>
                <div className="text-[11px] text-muted-foreground">{a.when}</div>
              </li>
            ))}
          </ol>
        </motion.div>

        {/* AI recommendations */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-card rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full blur-3xl opacity-30" style={{ background: "var(--gradient-primary)" }} />
          <div className="relative flex items-center justify-between">
            <h3 className="text-base font-semibold tracking-tight flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> AI Recommendations
            </h3>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">4 new</span>
          </div>
          <ul className="relative mt-4 space-y-2">
            {([] as any[]).map((r) => (
              <li key={r.t} className="group flex gap-3 p-3 rounded-xl hover:bg-card hover:shadow-[var(--shadow-soft)] transition cursor-pointer">
                <div className="mt-0.5 h-8 w-8 shrink-0 rounded-lg flex items-center justify-center text-white shadow-md" style={{ background: "var(--gradient-primary)" }}>
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{r.t}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">{r.tag}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{r.d}</div>
                </div>
                <ArrowRight className="h-4 w-4 self-center text-muted-foreground -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition" />
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Recent reports + Empty-state Investors widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold tracking-tight">Recent reports</h3>
            <button className="text-xs text-primary hover:underline inline-flex items-center gap-1">View all <ArrowRight className="h-3 w-3" /></button>
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
                {reports.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">No reports generated yet.</td></tr>
                ) : reports.map((r) => {
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
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> 3 reports improved this week</span>
            <span>Showing 4 of 12</span>
          </div>
        </motion.div>

        {/* Premium empty state */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-card rounded-2xl p-6 relative overflow-hidden flex flex-col">
          <div className="absolute inset-0 opacity-50" style={{ background: "radial-gradient(at 80% 0%, rgba(236,72,153,0.18), transparent 60%), radial-gradient(at 0% 100%, rgba(108,85,249,0.16), transparent 60%)" }} />
          <div className="relative flex items-center gap-2 text-sm font-semibold tracking-tight">
            <Users2 className="h-4 w-4 text-primary" /> Investor matches
          </div>
          <div className="relative mt-8 flex-1 flex flex-col items-center justify-center text-center px-2">
            <div className="relative h-20 w-20 rounded-2xl glass-strong flex items-center justify-center mb-4">
              <div className="absolute inset-0 rounded-2xl animate-pulse-glow" style={{ boxShadow: "0 0 0 1px rgba(108,85,249,0.2), 0 20px 50px -20px rgba(108,85,249,0.5)" }} />
              <Inbox className="h-8 w-8 text-primary" />
            </div>
            <div className="text-sm font-medium">No matches yet</div>
            <p className="mt-1 text-xs text-muted-foreground max-w-[18rem]">
              Connect your deck and we'll surface seed funds aligned with your sector and traction.
            </p>
            <button className="mt-4 btn-primary rounded-xl px-3.5 py-2 text-xs font-medium inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Match me with investors
            </button>
          </div>
          <div className="relative mt-4 grid grid-cols-3 gap-2 text-center">
            {["Sequoia","a16z","YC"].map((f) => (
              <div key={f} className="rounded-lg bg-white/70 border border-white/80 py-1.5 text-[10px] text-muted-foreground">{f}</div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
