import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { ReportSection, ValidationReport } from "@/components/ReportSection";

export const Route = createFileRoute("/app/reports/$reportId")({
  head: () => ({ meta: [{ title: "View Report — LENWORD Validate" }] }),
  component: ReportView,
});

function ReportView() {
  const { reportId } = Route.useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [startupName, setStartupName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate({ to: "/auth/login" });
          return;
        }

        const { data, error } = await supabase
          .from("validation_reports")
          .select("*")
          .eq("id", reportId)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Report not found");
        const row = data as any;

        if (row.report_data) {
          setReport(row.report_data as ValidationReport);
        }
        if (row.startup_name) {
          setStartupName(row.startup_name);
        }
      } catch (err) {
        toast.error((err as Error).message || "Failed to load report.");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [reportId, navigate]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p>Loading your report...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold mb-2">Report not found</h2>
        <p className="text-muted-foreground mb-6">The report you are looking for does not exist or you don't have access.</p>
        <button
          onClick={() => navigate({ to: "/app/reports" })}
          className="btn-primary px-6 py-2 rounded-xl"
        >
          Back to Reports
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center">
        <button
          onClick={() => navigate({ to: "/app/reports" })}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Reports
        </button>
      </div>
      <ReportSection
        name={startupName}
        report={report}
        onRestart={() => navigate({ to: "/validate" })}
      />
    </div>
  );
}
