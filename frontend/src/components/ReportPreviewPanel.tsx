import { useState } from "react";
import { generateMechanismReport } from "@/lib/api";
import type { ReportMechanismType, ReportResponse } from "@/types";

type ReportPreviewPanelProps = {
  mechanismType: ReportMechanismType;
  inputParameters: Record<string, unknown>;
  solverResult: Record<string, unknown> | null;
  sweepResult: Record<string, unknown> | null;
  agentWorkflow: Record<string, unknown> | null;
};

export function ReportPreviewPanel({ mechanismType, inputParameters, solverResult, sweepResult, agentWorkflow }: ReportPreviewPanelProps) {
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function buildMarkdownFilename() {
    const mechanismSlug = mechanismType.toLowerCase().replace(/_/g, "-").replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    return `mech-synthcad-${mechanismSlug}-report.md`;
  }

  function downloadMarkdownReport() {
    if (!report) return;
    const blob = new Blob([report.markdown], { type: "text/markdown;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = buildMarkdownFilename();
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  }

  async function generateReport() {
    setIsLoading(true);
    setError(null);
    try {
      setReport(await generateMechanismReport({ mechanism_type: mechanismType, input_parameters: inputParameters, solver_result: solverResult, sweep_result: sweepResult, agent_workflow: agentWorkflow }));
    } catch (reportError) {
      setError(reportError instanceof Error ? reportError.message : "Unable to generate report preview");
      setReport(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">Engineering Report Preview</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Structured report generation</h2>
          <p className="mt-2 text-sm text-slate-600">Generated from deterministic solver output and agent workflow summary. Numerical values originate from solver outputs.</p>
          <p className="mt-1 text-sm font-semibold text-emerald-700">Markdown export available. PDF export deferred.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-emerald-300" onClick={generateReport} disabled={isLoading}>{isLoading ? "Generating..." : "Generate Engineering Report"}</button>
          {report ? <button type="button" className="rounded-lg border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm hover:bg-emerald-50" onClick={downloadMarkdownReport}>Download Markdown Report</button> : null}
        </div>
      </div>
      {error ? <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {report ? (
        <div className="mt-5 space-y-5 border-t border-slate-200 pt-5">
          <div><h3 className="text-2xl font-bold text-slate-950">{report.title}</h3><p className="mt-1 text-sm text-slate-500">Mechanism: {report.mechanism_type.replace("_", "-")}</p></div>
          {report.validation_notes.length > 0 ? <div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><h4 className="text-sm font-semibold uppercase tracking-wide text-amber-800">Validation notes</h4><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">{report.validation_notes.map((note) => <li key={note}>{note}</li>)}</ul></div> : null}
          <div className="space-y-4">{report.sections.map((section) => <article key={section.heading} className="rounded-xl border border-slate-200 p-4"><h4 className="text-lg font-semibold text-slate-950">{section.heading}</h4><p className="mt-2 text-sm text-slate-700">{section.content}</p>{section.bullets.length > 0 ? <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul> : null}</article>)}</div>
          <details className="rounded-xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer text-sm font-semibold text-slate-800">Markdown preview</summary><pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap text-xs text-slate-700">{report.markdown}</pre></details>
        </div>
      ) : null}
    </section>
  );
}
