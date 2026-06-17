import type { FormEvent } from "react";
import type { FourBarForm } from "@/types";

type MechanismInputPanelProps = {
  form: FourBarForm;
  setForm: (form: FourBarForm) => void;
  onRunAnalysis: (event: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
};

const fields: Array<{ key: keyof FourBarForm; label: string; unit: string }> = [
  { key: "l1", label: "Ground link L1", unit: "mm" },
  { key: "l2", label: "Crank link L2", unit: "mm" },
  { key: "l3", label: "Coupler link L3", unit: "mm" },
  { key: "l4", label: "Rocker link L4", unit: "mm" },
  { key: "theta2_deg", label: "Input crank angle θ2", unit: "deg" },
  { key: "omega2", label: "Input angular velocity ω2", unit: "rad/s" },
  { key: "alpha2", label: "Input angular acceleration α2", unit: "rad/s²" },
];

export function MechanismInputPanel({ form, setForm, onRunAnalysis, isLoading }: MechanismInputPanelProps) {
  return (
    <div>
      <div>
        <h2 className="text-xl font-semibold">Mechanism Inputs</h2>
        <p className="mt-1 text-sm text-slate-500">Four-bar linkage design parameters for deterministic backend solvers.</p>
      </div>
      <form className="mt-4 space-y-4" onSubmit={onRunAnalysis}>
        {fields.map((field) => (
          <label key={field.key} className="block">
            <span className="text-sm font-medium text-slate-700">{field.label}</span>
            <div className="mt-1 flex overflow-hidden rounded-lg border border-slate-300 bg-white focus-within:ring-2 focus-within:ring-sky-500">
              <input className="w-full px-3 py-2 outline-none" type="number" step="any" value={form[field.key]} onChange={(event) => setForm({ ...form, [field.key]: Number(event.target.value) })} />
              <span className="border-l border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">{field.unit}</span>
            </div>
          </label>
        ))}
        <button className="w-full rounded-lg bg-sky-700 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-400" disabled={isLoading} type="submit">
          {isLoading ? "Running Analysis..." : "Run Analysis"}
        </button>
      </form>
    </div>
  );
}
