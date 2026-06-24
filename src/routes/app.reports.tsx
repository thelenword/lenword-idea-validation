import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Filter, Download, Search, MoreHorizontal, FileText, Sparkles, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/app/reports")({
  validateSearch: (search: Record<string, unknown>): { q?: string } => {
    return { q: search.q as string | undefined };
  },
  head: () => ({ meta: [{ title: "Reports — LENWORD Validate" }] }),
  component: Reports,
});

const statusStyles: Record<string, string> = {
  Ready: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60",
  "In review": "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800/60",
  Draft: "bg-muted text-muted-foreground border-border/60",
};

function Reports() {
  const { q } = Route.useSearch();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState(q || "");

  useEffect(() => {
    if (q !== undefined) {
      setLocalSearch(q);
    }
  }, [q]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        const { data, error } = await supabase
          .from("validation_reports")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setReports(data || []);
      } catch (err) {
        toast.error("Failed to load reports.");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const filteredReports = reports.filter(r => {
    const term = localSearch.toLowerCase();
    const nameMatch = r.startup_name?.toLowerCase().includes(term);
    const descMatch = r.idea_description?.toLowerCase().includes(term);
    return !term || nameMatch || descMatch;
  });

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
    link.setAttribute("download", `reports_export_${new Date().toISOString().split('T')[0]}.csv`);
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
          <div className="text-xs text-primary uppercase tracking-[0.2em]">History</div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Reports <span className="gradient-text italic">history</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Every validation run, scored, versioned, and shareable.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="glass rounded-xl px-4 py-2 text-sm font-medium inline-flex items-center gap-2"><Download className="h-4 w-4" /> Export CSV</button>
          <Link to="/validate" className="btn-primary rounded-xl px-4 py-2 text-sm font-medium inline-flex items-center gap-2"><Sparkles className="h-4 w-4" /> New report</Link>
        </div>
      </div>

      {/* Filter bar */}
      <div className="glass rounded-2xl p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            placeholder="Search by name, tag, stage…" 
            className="w-full bg-white/70 rounded-xl border border-border/60 pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" 
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>
        {["All", "Ready", "In review", "Draft"].map((t,i) => (
          <button key={t} className={`px-3 py-1.5 text-xs rounded-lg ${i===0 ? "bg-foreground text-background" : "bg-white border border-border/60 text-muted-foreground hover:text-foreground"}`}>{t}</button>
        ))}
        <button className="ml-auto px-3 py-1.5 text-xs rounded-lg bg-white border border-border/60 inline-flex items-center gap-1.5"><Filter className="h-3.5 w-3.5" /> Filters</button>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="rounded-2xl bg-white border border-border/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground text-xs">
            <tr>
              <th className="text-left font-medium px-5 py-3">Report</th>
              <th className="text-left font-medium px-5 py-3">Validation Score</th>
              <th className="text-left font-medium px-5 py-3">Stage</th>
              <th className="text-left font-medium px-5 py-3">Status</th>
              <th className="text-left font-medium px-5 py-3">Updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                  <Loader2 className="h-8 w-8 mx-auto text-primary animate-spin mb-3" />
                  <div>Loading reports...</div>
                </td>
              </tr>
            ) : filteredReports.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
                  <div>No reports found matching your search.</div>
                </td>
              </tr>
            ) : filteredReports.map((r, i) => {
              const score = r.score ? parseFloat(r.score) : 0;
              const date = new Date(r.created_at).toLocaleDateString();
              
              return (
              <motion.tr key={r.id}
                onClick={() => r.pdf_url && window.open(r.pdf_url, '_blank')}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.04 }}
                className={`border-t border-border/60 hover:bg-muted/30 transition group ${r.pdf_url ? 'cursor-pointer' : ''}`}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-400 to-primary flex items-center justify-center text-white shadow-md`}>
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">{r.startup_name}</div>
                      <div className="text-xs text-muted-foreground">Validation Run</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-28 h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${score * 10}%` }} transition={{ duration: 1, delay: 0.1 + i * 0.04 }}
                        className="h-full" style={{ background: "var(--gradient-primary)" }} />
                    </div>
                    <span className="text-sm font-medium tabular-nums">{score}</span>
                  </div>
                </td>
                <td className="px-5 py-4"><span className="text-xs px-2 py-1 rounded-full bg-muted">Validation</span></td>
                <td className="px-5 py-4"><span className={`text-xs px-2 py-1 rounded-full border ${statusStyles["Ready"]}`}>Ready</span></td>
                <td className="px-5 py-4 text-xs text-muted-foreground">{date}</td>
                <td className="px-5 py-4 text-right">
                  <button className="h-8 w-8 rounded-lg hover:bg-muted inline-flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </motion.tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-5 py-3 border-t border-border/60 text-xs text-muted-foreground">
          <span>Showing 8 of 24 reports</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded-lg hover:bg-muted">Previous</button>
            <button className="px-3 py-1 rounded-lg bg-foreground text-background">1</button>
            <button className="px-3 py-1 rounded-lg hover:bg-muted">2</button>
            <button className="px-3 py-1 rounded-lg hover:bg-muted">3</button>
            <button className="px-3 py-1 rounded-lg hover:bg-muted">Next</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
