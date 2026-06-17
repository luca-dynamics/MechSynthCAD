"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CadWorkspace } from "@/components/CadWorkspace";
import { MechanismInputPanel } from "@/components/MechanismInputPanel";
import { ResultsPanel } from "@/components/ResultsPanel";
import { SimulationControls } from "@/components/SimulationControls";
import { analyzeFourBar, sweepFourBar } from "@/lib/api";
import type { FourBarAnalysisResult, FourBarForm, FourBarSweepResponse, SweepForm } from "@/types";

const initialForm: FourBarForm = { l1: 120, l2: 35, l3: 90, l4: 80, theta2_deg: 30, omega2: 10, alpha2: 0 };
const initialSweep: SweepForm = { theta2_start_deg: 0, theta2_end_deg: 360, theta2_step_deg: 10 };

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
    return {
      mechanism: "four_bar_linkage",
      valid: selectedSample.valid,
      grashof_status: sweepResult.grashof_status,
      mobility: sweepResult.mobility,
      classification: sweepResult.classification,
      theta2_deg: selectedSample.theta2_deg,
      theta3_deg: selectedSample.theta3_deg,
      theta4_deg: selectedSample.theta4_deg,
      joint_coordinates: selectedSample.joint_coordinates,
      velocity_analysis: selectedSample.velocity_analysis,
      acceleration_analysis: selectedSample.acceleration_analysis,
      notes: selectedSample.notes,
    };
  }, [result, selectedSample, sweepResult]);

  useEffect(() => {
    if (!isPlaying || !sweepResult || sweepResult.samples.length === 0) return;
    const interval = window.setInterval(() => setSelectedSampleIndex((index) => (index + 1) % sweepResult.samples.length), 180);
    return () => window.clearInterval(interval);
  }, [isPlaying, sweepResult]);

  async function runAnalysis(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      setResult(await analyzeFourBar(form));
      setSweepResult(null);
      setIsPlaying(false);
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : "Unable to run analysis");
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function runSweep() {
    setIsSweeping(true);
    setError(null);
    setIsPlaying(false);
    try {
      setSweepResult(await sweepFourBar({ ...form, ...sweepForm }));
      setSelectedSampleIndex(0);
    } catch (sweepError) {
      setError(sweepError instanceof Error ? sweepError.message : "Unable to run simulation");
      setSweepResult(null);
    } finally {
      setIsSweeping(false);
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
        <aside className="space-y-5 rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
          <MechanismInputPanel form={form} setForm={setForm} onRunAnalysis={runAnalysis} isLoading={isLoading} />
          <SimulationControls sweepForm={sweepForm} setSweepForm={setSweepForm} onRunSweep={runSweep} isSweeping={isSweeping} />
        </aside>
        <CadWorkspace displayResult={displayResult} sweepResult={sweepResult} selectedSampleIndex={selectedSampleIndex} setSelectedSampleIndex={setSelectedSampleIndex} isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
        <ResultsPanel error={error} displayResult={displayResult} result={result} sweepResult={sweepResult} />
      </section>
    </main>
  );
}
