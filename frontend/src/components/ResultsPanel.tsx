import { formatNumber, formatVector } from "@/lib/format";
import type { FourBarAnalysisResult, FourBarSweepResponse } from "@/types";

type ResultsPanelProps = {
  error: string | null;
  displayResult: FourBarAnalysisResult | null;
  result: FourBarAnalysisResult | null;
  sweepResult: FourBarSweepResponse | null;
};

export function ResultsPanel({ error, displayResult, result, sweepResult }: ResultsPanelProps) {
  return (
    <aside className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">Results & AI Explanation</h2>
      <p className="mt-1 text-sm text-slate-500">Structured solver summaries and future assistive explanation space.</p>
      {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {displayResult && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <h3 className="font-semibold text-slate-900">Analysis Summary</h3>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2"><dt className="font-medium">Valid</dt><dd>{String(displayResult.valid)}</dd><dt className="font-medium">Grashof status</dt><dd>{displayResult.grashof_status}</dd><dt className="font-medium">θ3</dt><dd>{formatNumber(displayResult.theta3_deg, "°")}</dd><dt className="font-medium">θ4</dt><dd>{formatNumber(displayResult.theta4_deg, "°")}</dd></dl>
          <h4 className="mt-4 font-semibold text-slate-900">Velocity</h4>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2"><dt>ω2</dt><dd>{formatNumber(displayResult.velocity_analysis.omega2, " rad/s")}</dd><dt>ω3</dt><dd>{formatNumber(displayResult.velocity_analysis.omega3, " rad/s")}</dd><dt>ω4</dt><dd>{formatNumber(displayResult.velocity_analysis.omega4, " rad/s")}</dd><dt>V_B</dt><dd>{formatVector(displayResult.velocity_analysis.velocity_B, " mm/s")}</dd><dt>V_C</dt><dd>{formatVector(displayResult.velocity_analysis.velocity_C, " mm/s")}</dd></dl>
          <h4 className="mt-4 font-semibold text-slate-900">Acceleration</h4>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2"><dt>α2</dt><dd>{formatNumber(displayResult.acceleration_analysis.alpha2, " rad/s²")}</dd><dt>α3</dt><dd>{formatNumber(displayResult.acceleration_analysis.alpha3, " rad/s²")}</dd><dt>α4</dt><dd>{formatNumber(displayResult.acceleration_analysis.alpha4, " rad/s²")}</dd><dt>A_B</dt><dd>{formatVector(displayResult.acceleration_analysis.acceleration_B, " mm/s²")}</dd><dt>A_C</dt><dd>{formatVector(displayResult.acceleration_analysis.acceleration_C, " mm/s²")}</dd></dl>
        </div>
      )}
      {sweepResult && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><h3 className="font-semibold">Sweep Summary</h3><dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2"><dt>Samples</dt><dd>{sweepResult.sample_count}</dd><dt>Valid</dt><dd>{sweepResult.valid_sample_count}</dd><dt>Invalid</dt><dd>{sweepResult.invalid_sample_count}</dd></dl></div>}
      <pre className="mt-4 min-h-[320px] overflow-auto rounded-xl bg-slate-950 p-4 text-sm text-slate-100">{sweepResult ? JSON.stringify(sweepResult, null, 2) : result ? JSON.stringify(result, null, 2) : "Run an analysis or simulation to display the API response."}</pre>
      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><strong>AI layer placeholder:</strong> Future releases will explain solver outputs without replacing deterministic calculations.</div>
    </aside>
  );
}
