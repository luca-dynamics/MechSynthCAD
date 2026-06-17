"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AngleChart } from "@/components/AngleChart";
import { FourBarSvg } from "@/components/FourBarSvg";
import type { FourBarAnalysisResult, FourBarSweepResponse } from "@/types";

type FourBarForm = { l1: number; l2: number; l3: number; l4: number; theta2_deg: number; omega2: number; alpha2: number };
type SweepForm = { theta2_start_deg: number; theta2_end_deg: number; theta2_step_deg: number };

const initialForm: FourBarForm = { l1: 120, l2: 35, l3: 90, l4: 80, theta2_deg: 30, omega2: 10, alpha2: 0 };
const initialSweep: SweepForm = { theta2_start_deg: 0, theta2_end_deg: 360, theta2_step_deg: 10 };

const fields: Array<{ key: keyof FourBarForm; label: string; unit: string }> = [
  { key: "l1", label: "Ground link L1", unit: "mm" },
  { key: "l2", label: "Crank link L2", unit: "mm" },
  { key: "l3", label: "Coupler link L3", unit: "mm" },
  { key: "l4", label: "Rocker link L4", unit: "mm" },
  { key: "theta2_deg", label: "Input crank angle θ2", unit: "deg" },
  { key: "omega2", label: "Input angular velocity ω2", unit: "rad/s" },
  { key: "alpha2", label: "Input angular acceleration α2", unit: "rad/s²" },
];

const sweepFields: Array<{ key: keyof SweepForm; label: string; unit: string }> = [
  { key: "theta2_start_deg", label: "Sweep start θ2", unit: "deg" },
  { key: "theta2_end_deg", label: "Sweep end θ2", unit: "deg" },
  { key: "theta2_step_deg", label: "Sweep step θ2", unit: "deg" },
];

export default function Home() {
  const [form, setForm] = useState<FourBarForm>(initialForm);
  const [sweepForm, setSweepForm] = useState<SweepForm>(initialSweep);
  const [result, setResult] = useState<FourBarAnalysisResult | null>(null);
  const [sweepResult, setSweepResult] = useState<FourBarSweepResponse | null>(null);
  const [selectedSampleIndex, setSelectedSampleIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSweeping, setIsSweeping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedSample = sweepResult?.samples[selectedSampleIndex] ?? null;
  const displayResult = useMemo<FourBarAnalysisResult | null>(() => {
    if (!selectedSample || !sweepResult) return result;
    return { mechanism: "four_bar_linkage", valid: selectedSample.valid, grashof_status: sweepResult.grashof_status, mobility: sweepResult.mobility, classification: sweepResult.classification, theta2_deg: selectedSample.theta2_deg, theta3_deg: selectedSample.theta3_deg, theta4_deg: selectedSample.theta4_deg, joint_coordinates: selectedSample.joint_coordinates, notes: selectedSample.notes };
  }, [result, selectedSample, sweepResult]);

  useEffect(() => {
    if (!isPlaying || !sweepResult || sweepResult.samples.length === 0) return;
    const interval = window.setInterval(() => setSelectedSampleIndex((index) => (index + 1) % sweepResult.samples.length), 180);
    return () => window.clearInterval(interval);
  }, [isPlaying, sweepResult]);

  async function runAnalysis(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setIsLoading(true); setError(null);
    try {
      const response = await fetch("http://localhost:8000/api/mechanisms/fourbar/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!response.ok) throw new Error(`Backend returned ${response.status}`);
      setResult((await response.json()) as FourBarAnalysisResult); setSweepResult(null); setIsPlaying(false);
    } catch (analysisError) { setError(analysisError instanceof Error ? analysisError.message : "Unable to run analysis"); setResult(null); }
    finally { setIsLoading(false); }
  }

  async function runSweep() {
    setIsSweeping(true); setError(null); setIsPlaying(false);
    try {
      const response = await fetch("http://localhost:8000/api/mechanisms/fourbar/sweep", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, ...sweepForm }) });
      if (!response.ok) throw new Error(`Backend returned ${response.status}`);
      const data = (await response.json()) as FourBarSweepResponse;
      setSweepResult(data); setSelectedSampleIndex(0);
    } catch (sweepError) { setError(sweepError instanceof Error ? sweepError.message : "Unable to run simulation"); setSweepResult(null); }
    finally { setIsSweeping(false); }
  }

  const sampleCount = sweepResult?.samples.length ?? 0;

  return (
    <main className="min-h-screen bg-slate-200 text-slate-900">
      <header className="border-b border-slate-300 bg-white/90 px-8 py-6 shadow-sm"><p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-700">MechSynthCAD</p><h1 className="mt-2 text-3xl font-bold text-slate-950">MechSynthCAD</h1><p className="mt-1 text-lg text-slate-600">AI-Assisted CAD-Based System for Planar Mechanisms</p></header>
      <section className="grid gap-6 p-6 lg:grid-cols-[360px_1fr_380px]">
        <aside className="space-y-5 rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
          <div><h2 className="text-xl font-semibold">Mechanism Inputs</h2><p className="mt-1 text-sm text-slate-500">Four-bar linkage design parameters for deterministic backend solvers.</p></div>
          <form className="space-y-4" onSubmit={runAnalysis}>{fields.map((field) => <label key={field.key} className="block"><span className="text-sm font-medium text-slate-700">{field.label}</span><div className="mt-1 flex overflow-hidden rounded-lg border border-slate-300 bg-white focus-within:ring-2 focus-within:ring-sky-500"><input className="w-full px-3 py-2 outline-none" type="number" step="any" value={form[field.key]} onChange={(event) => setForm({ ...form, [field.key]: Number(event.target.value) })} /><span className="border-l border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">{field.unit}</span></div></label>)}<button className="w-full rounded-lg bg-sky-700 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-400" disabled={isLoading} type="submit">{isLoading ? "Running Analysis..." : "Run Analysis"}</button></form>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><h3 className="font-semibold text-slate-900">Simulation Sweep</h3><div className="mt-3 space-y-3">{sweepFields.map((field) => <label key={field.key} className="block"><span className="text-sm font-medium text-slate-700">{field.label}</span><div className="mt-1 flex overflow-hidden rounded-lg border border-slate-300 bg-white"><input className="w-full px-3 py-2 outline-none" type="number" step="any" value={sweepForm[field.key]} onChange={(event) => setSweepForm({ ...sweepForm, [field.key]: Number(event.target.value) })} /><span className="border-l border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">{field.unit}</span></div></label>)}<button className="w-full rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400" disabled={isSweeping} type="button" onClick={runSweep}>{isSweeping ? "Running Simulation..." : "Run Simulation"}</button></div></div>
        </aside>
        <section className="rounded-2xl border border-slate-300 bg-blueprint p-5 text-white shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold">CAD-Style 2D Visualization</h2><p className="text-sm text-slate-300">Backend joint coordinates rendered as SVG geometry</p></div><span className="rounded-full border border-sky-300/50 px-3 py-1 text-xs uppercase tracking-widest text-sky-100">Solver View</span></div><div className="mt-5 h-[520px] rounded-xl border border-sky-200/30 bg-[linear-gradient(to_right,var(--tw-gradient-stops)),linear-gradient(to_bottom,var(--tw-gradient-stops))] from-gridline to-gridline bg-[length:32px_32px] p-8"><FourBarSvg result={displayResult} /></div>{sweepResult && <div className="mt-4 rounded-xl border border-sky-200/30 bg-slate-950/40 p-4"><div className="flex flex-wrap items-center gap-3"><button className="rounded-lg bg-white px-3 py-2 font-semibold text-slate-900" onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? "Pause" : "Play"}</button><button className="rounded-lg border border-sky-200/40 px-3 py-2" onClick={() => setSelectedSampleIndex(Math.max(0, selectedSampleIndex - 1))}>Previous</button><button className="rounded-lg border border-sky-200/40 px-3 py-2" onClick={() => setSelectedSampleIndex(Math.min(sampleCount - 1, selectedSampleIndex + 1))}>Next</button><span className="text-sm text-slate-200">Sample {selectedSampleIndex + 1} / {sampleCount} · θ2 {selectedSample?.theta2_deg ?? "N/A"}° · {selectedSample?.valid ? "valid" : "invalid"}</span></div><input className="mt-3 w-full" type="range" min="0" max={Math.max(sampleCount - 1, 0)} value={selectedSampleIndex} onChange={(event) => setSelectedSampleIndex(Number(event.target.value))} /></div>} {sweepResult && <div className="mt-4 h-[300px]"><AngleChart samples={sweepResult.samples} /></div>}</section>
        <aside className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm"><h2 className="text-xl font-semibold">Results & AI Explanation</h2><p className="mt-1 text-sm text-slate-500">Structured solver summaries and future assistive explanation space.</p>{error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}{result && <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"><h3 className="font-semibold text-slate-900">Single Analysis Summary</h3><dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2"><dt className="font-medium">Valid</dt><dd>{String(result.valid)}</dd><dt className="font-medium">Grashof status</dt><dd>{result.grashof_status}</dd><dt className="font-medium">θ3</dt><dd>{result.theta3_deg === null ? "N/A" : `${result.theta3_deg}°`}</dd><dt className="font-medium">θ4</dt><dd>{result.theta4_deg === null ? "N/A" : `${result.theta4_deg}°`}</dd></dl></div>}{sweepResult && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><h3 className="font-semibold">Sweep Summary</h3><dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2"><dt>Samples</dt><dd>{sweepResult.sample_count}</dd><dt>Valid</dt><dd>{sweepResult.valid_sample_count}</dd><dt>Invalid</dt><dd>{sweepResult.invalid_sample_count}</dd></dl></div>}<pre className="mt-4 min-h-[320px] overflow-auto rounded-xl bg-slate-950 p-4 text-sm text-slate-100">{sweepResult ? JSON.stringify(sweepResult, null, 2) : result ? JSON.stringify(result, null, 2) : "Run an analysis or simulation to display the API response."}</pre><div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><strong>AI layer placeholder:</strong> Future releases will explain solver outputs without replacing deterministic calculations.</div></aside>
      </section>
    </main>
  );
}
