"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { CadWorkspace } from "@/components/CadWorkspace";
import { DeterministicTruthBanner } from "@/components/DeterministicTruthBanner";
import { MechanismInputPanel } from "@/components/MechanismInputPanel";
import { MechanismSelector } from "@/components/MechanismSelector";
import { ResultsPanel } from "@/components/ResultsPanel";
import { SimulationControls } from "@/components/SimulationControls";
import { SliderCrankInputPanel } from "@/components/SliderCrankInputPanel";
import { SliderCrankResultsPanel } from "@/components/SliderCrankResultsPanel";
import { SliderCrankSimulationControls } from "@/components/SliderCrankSimulationControls";
import { SliderCrankWorkspace } from "@/components/SliderCrankWorkspace";
import { ValidationMatrix } from "@/components/ValidationMatrix";
import { WorkflowAndReportSection } from "@/components/WorkflowAndReportSection";
import { analyzeFourBar, analyzeSliderCrank, sweepFourBar, sweepSliderCrank } from "@/lib/api";
import type { AgentWorkflowResponse, FourBarAnalysisResult, FourBarForm, FourBarSweepResponse, MechanismType, SliderCrankAnalysisResult, SliderCrankForm, SliderCrankSweepForm, SliderCrankSweepResponse, SweepForm, SynthesisResponse } from "@/types";

const initialForm: FourBarForm = { l1: 120, l2: 35, l3: 90, l4: 80, theta2_deg: 30, omega2: 10, alpha2: 0 };
const initialSweep: SweepForm = { theta2_start_deg: 0, theta2_end_deg: 360, theta2_step_deg: 10 };
const initialSliderCrankForm: SliderCrankForm = { crank_radius: 30, connecting_rod_length: 100, theta_deg: 30, omega: 10, alpha: 0, offset: 0 };
const initialSliderCrankSweep: SliderCrankSweepForm = { theta_start_deg: 0, theta_end_deg: 360, theta_step_deg: 10 };

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
  const [sliderCrankSweepForm, setSliderCrankSweepForm] = useState<SliderCrankSweepForm>(initialSliderCrankSweep);
  const [sliderCrankSweepResult, setSliderCrankSweepResult] = useState<SliderCrankSweepResponse | null>(null);
  const [selectedSliderCrankSampleIndex, setSelectedSliderCrankSampleIndex] = useState(0);
  const [isSliderCrankPlaying, setIsSliderCrankPlaying] = useState(false);
  const [isSliderCrankSweeping, setIsSliderCrankSweeping] = useState(false);
  const [isSliderCrankLoading, setIsSliderCrankLoading] = useState(false);
  const [sliderCrankError, setSliderCrankError] = useState<string | null>(null);
  const [latestWorkflow, setLatestWorkflow] = useState<AgentWorkflowResponse | null>(null);
  const [latestSynthesisRecommendations, setLatestSynthesisRecommendations] = useState<SynthesisResponse | null>(null);
  const clearLatestWorkflow = useCallback(() => setLatestWorkflow(null), []);
  const clearLatestSynthesisRecommendations = useCallback(() => setLatestSynthesisRecommendations(null), []);

  useEffect(() => {
    setLatestWorkflow(null);
    setLatestSynthesisRecommendations(null);
    setIsPlaying(false);
    setIsSliderCrankPlaying(false);
  }, [selectedMechanism]);

  const selectedSample = sweepResult?.samples[selectedSampleIndex] ?? null;
  const displayResult = useMemo<FourBarAnalysisResult | null>(() => {
    if (!selectedSample || !sweepResult) return result;
    return { mechanism: "four_bar_linkage", valid: selectedSample.valid, grashof_status: sweepResult.grashof_status, mobility: sweepResult.mobility, classification: sweepResult.classification, theta2_deg: selectedSample.theta2_deg, theta3_deg: selectedSample.theta3_deg, theta4_deg: selectedSample.theta4_deg, joint_coordinates: selectedSample.joint_coordinates, velocity_analysis: selectedSample.velocity_analysis, acceleration_analysis: selectedSample.acceleration_analysis, notes: selectedSample.notes };
  }, [result, selectedSample, sweepResult]);

  const selectedSliderCrankSample = sliderCrankSweepResult?.samples[selectedSliderCrankSampleIndex] ?? null;
  const displaySliderCrankResult = useMemo<SliderCrankAnalysisResult | null>(() => {
    if (!selectedSliderCrankSample) return sliderCrankResult;
    return { mechanism: "slider_crank", valid: selectedSliderCrankSample.valid, theta_deg: selectedSliderCrankSample.theta_deg, crank_radius: sliderCrankForm.crank_radius, connecting_rod_length: sliderCrankForm.connecting_rod_length, offset: sliderCrankForm.offset, slider_position: selectedSliderCrankSample.slider_position, transmission_angle_deg: selectedSliderCrankSample.transmission_angle_deg, joint_coordinates: selectedSliderCrankSample.joint_coordinates, velocity_analysis: selectedSliderCrankSample.velocity_analysis, acceleration_analysis: selectedSliderCrankSample.acceleration_analysis, notes: selectedSliderCrankSample.notes };
  }, [selectedSliderCrankSample, sliderCrankForm, sliderCrankResult]);

  const agentAvailableContext = selectedMechanism === "four_bar" ? { ...form, ...(sweepResult ? sweepForm : {}) } : { ...sliderCrankForm, ...(sliderCrankSweepResult ? sliderCrankSweepForm : {}) };
  const reportInputParameters = selectedMechanism === "four_bar" ? form : sliderCrankForm;
  const reportSolverResult = selectedMechanism === "four_bar" ? displayResult || result : displaySliderCrankResult;
  const reportSweepResult = selectedMechanism === "four_bar" ? sweepResult : sliderCrankSweepResult;

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
      setSliderCrankSweepResult(null);
      setIsSliderCrankPlaying(false);
    } catch (analysisError) {
      setSliderCrankError(analysisError instanceof Error ? analysisError.message : "Unable to run slider-crank analysis");
      setSliderCrankResult(null);
    } finally {
      setIsSliderCrankLoading(false);
    }
  }

  useEffect(() => {
    if (!isSliderCrankPlaying || !sliderCrankSweepResult || sliderCrankSweepResult.samples.length === 0) return;
    const interval = window.setInterval(() => setSelectedSliderCrankSampleIndex((index) => (index + 1) % sliderCrankSweepResult.samples.length), 180);
  return () => window.clearInterval(interval);
  }, [isSliderCrankPlaying, sliderCrankSweepResult]);

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

  async function runSliderCrankSweep() {
    setIsSliderCrankSweeping(true);
    setSliderCrankError(null);
    setIsSliderCrankPlaying(false);
    try {
      setSliderCrankSweepResult(await sweepSliderCrank({ ...sliderCrankForm, ...sliderCrankSweepForm }));
      setSelectedSliderCrankSampleIndex(0);
    } catch (sweepError) {
      setSliderCrankError(sweepError instanceof Error ? sweepError.message : "Unable to run slider-crank simulation");
      setSliderCrankSweepResult(null);
    } finally {
      setIsSliderCrankSweeping(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-200 text-slate-900">
      <header className="border-b border-slate-300 bg-white/90 px-8 py-6 shadow-sm"><p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-700">MechSynthCAD</p><h1 className="mt-2 text-3xl font-bold text-slate-950">MechSynthCAD</h1><p className="mt-1 text-lg text-slate-600">AI-Assisted CAD-Based System for Planar Mechanisms</p></header>
      <DeterministicTruthBanner />
      <section className="grid gap-6 p-6 lg:grid-cols-[360px_1fr_380px]">
        <aside className="space-y-5 rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
          <MechanismSelector selectedMechanism={selectedMechanism} onChange={setSelectedMechanism} />
          {selectedMechanism === "four_bar" ? <><MechanismInputPanel form={form} setForm={setForm} onRunAnalysis={runAnalysis} isLoading={isLoading} /><SimulationControls sweepForm={sweepForm} setSweepForm={setSweepForm} onRunSweep={runSweep} isSweeping={isSweeping} /></> : <><SliderCrankInputPanel form={sliderCrankForm} setForm={setSliderCrankForm} onRunAnalysis={runSliderCrankAnalysis} isLoading={isSliderCrankLoading} /><SliderCrankSimulationControls sweepForm={sliderCrankSweepForm} setSweepForm={setSliderCrankSweepForm} onRunSweep={runSliderCrankSweep} isSweeping={isSliderCrankSweeping} /></>}
        </aside>
        {selectedMechanism === "four_bar" ? <CadWorkspace displayResult={displayResult} sweepResult={sweepResult} selectedSampleIndex={selectedSampleIndex} setSelectedSampleIndex={setSelectedSampleIndex} isPlaying={isPlaying} setIsPlaying={setIsPlaying} /> : <SliderCrankWorkspace result={displaySliderCrankResult} sweepResult={sliderCrankSweepResult} selectedSampleIndex={selectedSliderCrankSampleIndex} setSelectedSampleIndex={setSelectedSliderCrankSampleIndex} isPlaying={isSliderCrankPlaying} setIsPlaying={setIsSliderCrankPlaying} />}
        {selectedMechanism === "four_bar" ? <ResultsPanel error={error} displayResult={displayResult} result={result} sweepResult={sweepResult} /> : <SliderCrankResultsPanel error={sliderCrankError} result={displaySliderCrankResult} sweepResult={sliderCrankSweepResult} selectedSampleIndex={selectedSliderCrankSampleIndex} />}
      </section>
      <section className="px-6 pb-8">
        <WorkflowAndReportSection selectedMechanism={selectedMechanism} availableContext={agentAvailableContext} solverResult={reportSolverResult as Record<string, unknown> | null} inputParameters={reportInputParameters} sweepResult={reportSweepResult as Record<string, unknown> | null} latestWorkflow={latestWorkflow} onWorkflowComplete={setLatestWorkflow} onWorkflowCleared={clearLatestWorkflow} latestSynthesisRecommendations={latestSynthesisRecommendations} onSynthesisRecommendationsGenerated={setLatestSynthesisRecommendations} onSynthesisRecommendationsCleared={clearLatestSynthesisRecommendations} />
      </section>
      <section className="px-6 pb-8">
        <ValidationMatrix />
      </section>
    </main>
  );
}
