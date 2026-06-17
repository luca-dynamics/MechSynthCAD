type ValidationRow = {
  capability: string;
  status: string;
  numericalSource: string;
  verificationRequirement: string;
};

const validationRows: ValidationRow[] = [
  { capability: "Four-bar single-angle analysis", status: "Ready", numericalSource: "Deterministic backend solver", verificationRequirement: "Rerun solver after parameter changes; independent engineering verification required" },
  { capability: "Four-bar sweep simulation", status: "Ready", numericalSource: "Deterministic backend sweep solver", verificationRequirement: "Rerun sweep after parameter or range changes; inspect invalid samples" },
  { capability: "Four-bar SVG CAD visualization", status: "Ready", numericalSource: "Supplied solver joint coordinates", verificationRequirement: "Verify visualization against current solver output" },
  { capability: "Four-bar velocity/acceleration", status: "Ready", numericalSource: "Deterministic backend solver", verificationRequirement: "Confirm input angular rates and rerun solver after changes" },
  { capability: "Slider-crank single-angle analysis", status: "Ready", numericalSource: "Deterministic backend solver", verificationRequirement: "Rerun solver after parameter changes; independent engineering verification required" },
  { capability: "Slider-crank sweep simulation", status: "Ready", numericalSource: "Deterministic backend sweep solver", verificationRequirement: "Rerun sweep after parameter or range changes; inspect invalid samples" },
  { capability: "Slider-crank SVG CAD visualization", status: "Ready", numericalSource: "Supplied solver joint coordinates", verificationRequirement: "Verify visualization against current solver output" },
  { capability: "Slider-crank velocity/acceleration", status: "Ready", numericalSource: "Deterministic backend solver", verificationRequirement: "Confirm input angular rates and rerun solver after changes" },
  { capability: "Agentic engineering workflow", status: "Demo Ready", numericalSource: "Deterministic solver context supplied to workflow", verificationRequirement: "Use as planning and interpretation support only" },
  { capability: "Design iteration / synthesis recommendations", status: "Demo Ready", numericalSource: "Supplied solver output and user targets", verificationRequirement: "Rerun deterministic solver to validate every recommendation" },
  { capability: "Engineering report preview", status: "Demo Ready", numericalSource: "Generated from solver, workflow, and synthesis context", verificationRequirement: "Regenerate report after input or result changes" },
  { capability: "Markdown report export", status: "Demo Ready", numericalSource: "Frontend export from generated report", verificationRequirement: "Review exported report and verify numerical values" },
  { capability: "Browser print / Save-as-PDF", status: "Demo Ready", numericalSource: "Browser print rendering of generated report", verificationRequirement: "Use browser preview and independent engineering verification" },
];

export function ValidationMatrix() {
  return (
    <section className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-600">Validation Matrix</p>
        <h2 className="mt-1 text-xl font-bold text-slate-950">Demo Readiness and Verification Required</h2>
        <p className="mt-2 text-sm text-slate-600">
          This matrix identifies the numerical source of truth for each demonstrated capability and the verification expected before engineering use.
        </p>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
              <th className="px-3 py-3 font-semibold">Capability</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3 font-semibold">Numerical Source</th>
              <th className="px-3 py-3 font-semibold">Verification Requirement</th>
            </tr>
          </thead>
          <tbody>
            {validationRows.map((row) => (
              <tr key={row.capability} className="border-b border-slate-100 align-top last:border-0">
                <td className="px-3 py-3 font-medium text-slate-900">{row.capability}</td>
                <td className="px-3 py-3"><span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">{row.status}</span></td>
                <td className="px-3 py-3 text-slate-700">{row.numericalSource}</td>
                <td className="px-3 py-3 text-slate-700">{row.verificationRequirement}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
