import type { FormEvent } from "react";
import type { SliderCrankForm } from "@/types";

type SliderCrankInputPanelProps = {
  form: SliderCrankForm;
  setForm: (form: SliderCrankForm) => void;
  onRunAnalysis: (event: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
};

const fields: Array<{ key: keyof SliderCrankForm; label: string; unit: string }> = [
  { key: "crank_radius", label: "Crank radius r", unit: "mm" },
  { key: "connecting_rod_length", label: "Connecting rod length l", unit: "mm" },
  { key: "theta_deg", label: "Crank angle θ", unit: "deg" },
  { key: "omega", label: "Angular velocity ω", unit: "rad/s" },
  { key: "alpha", label: "Angular acceleration α", unit: "rad/s²" },
  { key: "offset", label: "Slider offset", unit: "mm" },
];

export function SliderCrankInputPanel({ form, setForm, onRunAnalysis, isLoading }: SliderCrankInputPanelProps) {
  return (
    <div>
      <div>
        <h2 className="text-xl font-semibold">Slider-Crank Inputs</h2>
        <p className="mt-1 text-sm text-slate-500">Deterministic crank, rod, and slider-line parameters.</p>
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
          {isLoading ? "Running Slider-Crank Analysis..." : "Run Slider-Crank Analysis"}
        </button>
      </form>
    </div>
  );
}
