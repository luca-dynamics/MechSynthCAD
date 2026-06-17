import type { SweepForm } from "@/types";

type SimulationControlsProps = {
  sweepForm: SweepForm;
  setSweepForm: (sweepForm: SweepForm) => void;
  onRunSweep: () => void;
  isSweeping: boolean;
};

const sweepFields: Array<{ key: keyof SweepForm; label: string; unit: string }> = [
  { key: "theta2_start_deg", label: "Sweep start θ2", unit: "deg" },
  { key: "theta2_end_deg", label: "Sweep end θ2", unit: "deg" },
  { key: "theta2_step_deg", label: "Sweep step θ2", unit: "deg" },
];

export function SimulationControls({ sweepForm, setSweepForm, onRunSweep, isSweeping }: SimulationControlsProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="font-semibold text-slate-900">Simulation Sweep</h3>
      <div className="mt-3 space-y-3">
        {sweepFields.map((field) => (
          <label key={field.key} className="block">
            <span className="text-sm font-medium text-slate-700">{field.label}</span>
            <div className="mt-1 flex overflow-hidden rounded-lg border border-slate-300 bg-white">
              <input className="w-full px-3 py-2 outline-none" type="number" step="any" value={sweepForm[field.key]} onChange={(event) => setSweepForm({ ...sweepForm, [field.key]: Number(event.target.value) })} />
              <span className="border-l border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">{field.unit}</span>
            </div>
          </label>
        ))}
        <button className="w-full rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400" disabled={isSweeping} type="button" onClick={onRunSweep}>
          {isSweeping ? "Running Simulation..." : "Run Simulation"}
        </button>
      </div>
    </div>
  );
}
