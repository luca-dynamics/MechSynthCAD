"use client";

import { FormEvent, useState } from "react";
import { FourBarSvg } from "@/components/FourBarSvg";
import type { FourBarAnalysisResult } from "@/types";

type FourBarForm = {
  l1: number;
  l2: number;
  l3: number;
  l4: number;
  theta2_deg: number;
  omega2: number;
  alpha2: number;
};

const initialForm: FourBarForm = {
  l1: 120,
  l2: 35,
  l3: 90,
  l4: 80,
  theta2_deg: 30,
  omega2: 10,
  alpha2: 0,
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

export default function Home() {
  const [form, setForm] = useState<FourBarForm>(initialForm);
  const [result, setResult] = useState<FourBarAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runAnalysis(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/api/mechanisms/fourbar/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`);
      }

      setResult((await response.json()) as FourBarAnalysisResult);
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : "Unable to run analysis");
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-200 text-slate-900">
      <header className="border-b border-slate-300 bg-white/90 px-8 py-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-700">MechSynthCAD</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">MechSynthCAD</h1>
        <p className="mt-1 text-lg text-slate-600">AI-Assisted CAD-Based System for Planar Mechanisms</p>
      </header>

      <section className="grid gap-6 p-6 lg:grid-cols-[360px_1fr_380px]">
        <aside className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Mechanism Inputs</h2>
          <p className="mt-1 text-sm text-slate-500">Four-bar linkage design parameters for the deterministic solver contract.</p>

          <form className="mt-6 space-y-4" onSubmit={runAnalysis}>
            {fields.map((field) => (
              <label key={field.key} className="block">
                <span className="text-sm font-medium text-slate-700">{field.label}</span>
                <div className="mt-1 flex overflow-hidden rounded-lg border border-slate-300 bg-white focus-within:ring-2 focus-within:ring-sky-500">
                  <input
                    className="w-full px-3 py-2 outline-none"
                    type="number"
                    step="any"
                    value={form[field.key]}
                    onChange={(event) => setForm({ ...form, [field.key]: Number(event.target.value) })}
                  />
                  <span className="border-l border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">{field.unit}</span>
                </div>
              </label>
            ))}

            <button
              className="w-full rounded-lg bg-sky-700 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? "Running Analysis..." : "Run Analysis"}
            </button>
          </form>
        </aside>

        <section className="rounded-2xl border border-slate-300 bg-blueprint p-5 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">CAD-Style 2D Visualization</h2>
              <p className="text-sm text-slate-300">Deterministic backend joint coordinates rendered as SVG geometry</p>
            </div>
            <span className="rounded-full border border-sky-300/50 px-3 py-1 text-xs uppercase tracking-widest text-sky-100">Solver View</span>
          </div>

          <div className="mt-5 h-[620px] rounded-xl border border-sky-200/30 bg-[linear-gradient(to_right,var(--tw-gradient-stops)),linear-gradient(to_bottom,var(--tw-gradient-stops))] from-gridline to-gridline bg-[length:32px_32px] p-8">
            <FourBarSvg result={result} />
          </div>
        </section>

        <aside className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Results & AI Explanation</h2>
          <p className="mt-1 text-sm text-slate-500">Backend JSON response and future assistive explanation space.</p>

          {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          {result && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <h3 className="font-semibold text-slate-900">Structured Solver Summary</h3>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                <dt className="font-medium">Valid</dt>
                <dd>{String(result.valid)}</dd>
                <dt className="font-medium">Grashof status</dt>
                <dd>{result.grashof_status}</dd>
                <dt className="font-medium">Classification</dt>
                <dd>{result.classification}</dd>
                <dt className="font-medium">θ3</dt>
                <dd>{result.theta3_deg === null ? "N/A" : `${result.theta3_deg}°`}</dd>
                <dt className="font-medium">θ4</dt>
                <dd>{result.theta4_deg === null ? "N/A" : `${result.theta4_deg}°`}</dd>
              </dl>
              {result.notes.length > 0 && (
                <div className="mt-3">
                  <p className="font-medium text-slate-900">Backend notes</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    {result.notes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <pre className="mt-4 min-h-[320px] overflow-auto rounded-xl bg-slate-950 p-4 text-sm text-slate-100">
            {result ? JSON.stringify(result, null, 2) : "Run an analysis to display the scaffold API response."}
          </pre>

          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <strong>AI layer placeholder:</strong> Future releases will explain solver outputs, validate assumptions, and help produce engineering reports without replacing deterministic calculations.
          </div>
        </aside>
      </section>
    </main>
  );
}
