import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ArrowLeft, Sparkles } from "lucide-react";
import { ReportSection, ValidationReport } from "@/components/ReportSection";
import { apiFetch } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/reports/$reportId")({
  head: () => ({ meta: [{ title: "Your Startup Report — LENWORD Validate" }] }),
  component: PublicReportView,
});

function PublicReportView() {
  const { reportId } = Route.useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [startupName, setStartupName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        // If they are actually logged in, redirect them to the real dashboard view
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate({ to: "/app/reports/$reportId", params: { reportId } });
          return;
        }

        const row = await apiFetch(`/api/report-status/${reportId}`);
        if (row.report_data) {
          setReport(row.report_data as ValidationReport);
        }
        if (row.startup_name) {
          setStartupName(row.startup_name);
        }
      } catch (err) {
        toast.error((err as Error).message || "Failed to load report preview.");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [reportId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p>Loading your report preview...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold mb-2">Report not found</h2>
        <p className="text-muted-foreground mb-6">The report you are looking for does not exist.</p>
        <button
          onClick={() => navigate({ to: "/validate" })}
          className="btn-primary px-6 py-2 rounded-xl"
        >
          Validate a New Idea
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative pt-10">
      <div className="max-w-5xl mx-auto px-6 pb-4 flex items-center relative z-20">
        <button
          onClick={() => navigate({ to: "/validate" })}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Validation
        </button>
      </div>

      <div className="relative z-10">
        {/* Blurred Background Report */}
        <div className="opacity-40 blur-md pointer-events-none select-none overflow-hidden h-[85vh]">
          <ReportSection
            name={startupName}
            report={report}
            onRestart={() => { }}
          />
        </div>

        {/* Overlay Popup */}
        <div className="absolute inset-0 flex items-center justify-center p-6 bg-background/20 backdrop-blur-[2px] z-10">
          <div className="bg-card shadow-2xl p-10 rounded-3xl max-w-lg text-center border border-border relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-accent/10 blur-2xl pointer-events-none" />

            <div className="relative z-10">

              <h3 className="text-3xl font-display font-bold mb-4">🎉 Your Lenword report is ready!</h3>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                Create a free LENWORD account or log in to unlock your complete report and save it to your personal dashboard.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    localStorage.setItem('pending_report_id', reportId);
                    navigate({ to: '/auth/signup' });
                  }}
                  className="w-full btn-primary py-3.5 rounded-xl font-medium shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition text-lg"
                >
                  Sign Up
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem('pending_report_id', reportId);
                    navigate({ to: '/auth/login' });
                  }}
                  className="w-full bg-card border-2 border-primary text-primary py-3.5 rounded-xl font-medium hover:bg-primary/5 transition text-lg"
                >
                  Log In
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
