"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AgentWorkflowPanel } from "@/components/AgentWorkflowPanel";
import { CadWorkspace } from "@/components/CadWorkspace";
import { MechanismInputPanel } from "@/components/MechanismInputPanel";
import { ReportPreviewPanel } from "@/components/ReportPreviewPanel";
import { ResultsPanel } from "@/components/ResultsPanel";
import { SimulationControls } from "@/components/SimulationControls";
import { SliderCrankInputPanel } from "@/components/SliderCrankInputPanel";
import { SliderCrankResultsPanel } from "@/components/SliderCrankResultsPanel";
import { SliderCrankSvg } from "@/components/SliderCrankSvg";
import { analyzeFourBar, analyzeSliderCrank, sweepFourBar } from "@/lib/api";
import type { AgentWorkflowResponse, FourBarAnalysisResult, FourBarForm, FourBarSweepResponse, SliderCrankAnalysisResult, SliderCrankForm, SweepForm } from "@/types";

const initialForm: FourBarForm = { l1: 120, l2: 35, l3: 90, l4: 80, theta2_deg: 30, omega2: 10, alpha2: 0 };
const initialSweep: SweepForm = { theta2_start_deg: 0, theta2_end_deg: 360, theta2_step_deg: 10 };
const initialSliderCrankForm: SliderCrankForm = { crank_radius: 30, connecting_rod_length: 100, theta_deg: 30, omega: 10, alpha: 0, offset: 0 };

type MechanismType = "four_bar" | "slider_crank";

export default function Home() {
  const [selectedMechanism, setSelectedMechanism] = useState<MechanismType>("four_bar");
  const [form, setForm] = useState<FourBarForm>(initialForm);
  const [sweepForm, setSweepForm] = useState<SweepForm>(initialSweep);
  const [result, setResult] = useState<FourBarAnalysisResult | null>(null);
  const [sweepResult, setSweepResult] = useState<FourBarSweepResponse | null>(null);
  const [selectedSampleIndex, setSelectedSampleIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSweeping, setIsSweeping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sliderCrankForm, setSliderCrankForm] = useState<SliderCrankForm>(initialSliderCrankForm);
  const [sliderCrankResult, setSliderCrankResult] = useState<SliderCrankAnalysisResult | null>(null);
  const [isSliderCrankLoading, setIsSliderCrankLoading] = useState(false);
  const [sliderCrankError, setSliderCrankError] = useState<string | null>(null);
  const [latestWorkflow, setLatestWorkflow] = useState<AgentWorkflowResponse | null>(null);

  const selectedSample = sweepResult?.samples[selectedSampleIndex] ?? null;
  const displayResult = useMemo<FourBarAnalysisResult | null>(() => {
    if (!selectedSample || !sweepResult) return result;
    return { mechanism: "four_bar_linkage", valid: selectedSample.valid, grashof_status: sweepResult.grashof_status, mobility: sweepResult.mobility, classification: sweepResult.classification, theta2_deg: selectedSample.theta2_deg, theta3_deg: selectedSample.theta3_deg, theta4_deg: selectedSample.theta4_deg, joint_coordinates: selectedSample.joint_coordinates, velocity_analysis: selectedSample.velocity_analysis, acceleration_analysis: selectedSample.acceleration_analysis, notes: selectedSample.notes };
  }, [result, selectedSample, sweepResult]);

  const agentAvailableContext = selectedMechanism === "four_bar" ? { ...form, ...(sweepResult ? sweepForm : {}) } : sliderCrankForm;
  const agentSolverResult = selectedMechanism === "four_bar" ? displayResult : sliderCrankResult;

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

  async function runSliderCrankAnalysis(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSliderCrankLoading(true);
    setSliderCrankError(null);
    try {
      setSliderCrankResult(await analyzeSliderCrank(sliderCrankForm));
    } catch (analysisError) {
      setSliderCrankError(analysisError instanceof Error ? analysisError.message : "Unable to run slider-crank analysis");
      setSliderCrankResult(null);
    } finally {
      setIsSliderCrankLoading(false);
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
      <header className="border-b border-slate-300 bg-white/90 px-8 py-6 shadow-sm"><p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-700">MechSynthCAD</p><h1 className="mt-2 text-3xl font-bold text-slate-950">MechSynthCAD</h1><p className="mt-1 text-lg text-slate-600">AI-Assisted CAD-Based System for Planar Mechanisms</p></header>
      <section className="grid gap-6 p-6 lg:grid-cols-[360px_1fr_380px]">
        <aside className="space-y-5 rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
          <div><h2 className="text-xl font-semibold">Mechanism Type</h2><select className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2" value={selectedMechanism} onChange={(event) => setSelectedMechanism(event.target.value as MechanismType)}><option value="four_bar">Four-bar linkage</option><option value="slider_crank">Slider-crank</option></select></div>
          {selectedMechanism === "four_bar" ? <><MechanismInputPanel form={form} setForm={setForm} onRunAnalysis={runAnalysis} isLoading={isLoading} /><SimulationControls sweepForm={sweepForm} setSweepForm={setSweepForm} onRunSweep={runSweep} isSweeping={isSweeping} /></> : <SliderCrankInputPanel form={sliderCrankForm} setForm={setSliderCrankForm} onRunAnalysis={runSliderCrankAnalysis} isLoading={isSliderCrankLoading} />}
        </aside>
        {selectedMechanism === "four_bar" ? <CadWorkspace displayResult={displayResult} sweepResult={sweepResult} selectedSampleIndex={selectedSampleIndex} setSelectedSampleIndex={setSelectedSampleIndex} isPlaying={isPlaying} setIsPlaying={setIsPlaying} /> : <section className="rounded-2xl border border-slate-300 bg-blueprint p-5 text-white shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold">Slider-Crank CAD Visualization</h2><p className="text-sm text-slate-300">Backend joint coordinates rendered as SVG geometry</p></div><span className="rounded-full border border-sky-300/50 px-3 py-1 text-xs uppercase tracking-widest text-sky-100">Solver View</span></div><div className="mt-5 h-[520px] rounded-xl border border-sky-200/30 bg-[linear-gradient(to_right,var(--tw-gradient-stops)),linear-gradient(to_bottom,var(--tw-gradient-stops))] from-gridline to-gridline bg-[length:32px_32px] p-8"><SliderCrankSvg result={sliderCrankResult} /></div></section>}
        {selectedMechanism === "four_bar" ? <ResultsPanel error={error} displayResult={displayResult} result={result} sweepResult={sweepResult} /> : <SliderCrankResultsPanel error={sliderCrankError} result={sliderCrankResult} />}
      </section>
      <section className="px-6 pb-8">
        <div className="space-y-6"><AgentWorkflowPanel mechanismType={selectedMechanism} availableContext={agentAvailableContext} solverResult={agentSolverResult as Record<string, unknown> | null} onWorkflowComplete={setLatestWorkflow} /><ReportPreviewPanel mechanismType={selectedMechanism} inputParameters={selectedMechanism === "four_bar" ? form : sliderCrankForm} solverResult={(selectedMechanism === "four_bar" ? displayResult || result : sliderCrankResult) as Record<string, unknown> | null} sweepResult={selectedMechanism === "four_bar" ? (sweepResult as Record<string, unknown> | null) : null} agentWorkflow={latestWorkflow as Record<string, unknown> | null} /></div>
      </section>
    </main>
  );
}
