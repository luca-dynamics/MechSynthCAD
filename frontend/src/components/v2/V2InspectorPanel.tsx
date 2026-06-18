import { useState } from "react";
import { MechanismInputPanel } from "@/components/MechanismInputPanel";
import { MechanismSelector } from "@/components/MechanismSelector";
import { ResultsPanel } from "@/components/ResultsPanel";
import { SimulationControls } from "@/components/SimulationControls";
import { SliderCrankInputPanel } from "@/components/SliderCrankInputPanel";
import { SliderCrankResultsPanel } from "@/components/SliderCrankResultsPanel";
import { SliderCrankSimulationControls } from "@/components/SliderCrankSimulationControls";
import { SynthesisRecommendationPanel } from "@/components/SynthesisRecommendationPanel";
import type { V2InspectorTab, V2MechanismState } from "@/components/v2/types";

const tabs: V2InspectorTab[] = ["Parameters", "Results", "Simulation", "Synthesis", "Report"];

export function V2InspectorPanel({ state, onOpenReports }: { state: V2MechanismState; onOpenReports: () => void }) {
  const [tab, setTab] = useState<V2InspectorTab>("Parameters");
  const mechanism = state.selectedMechanism === "four_bar" ? "Four-bar linkage" : "Slider-crank";
  const hasResult = Boolean(state.solverResult);
  return <aside className="v2-surface border-v2-border rounded-[1.5rem] border p-4 lg:sticky lg:top-[81px] lg:max-h-[calc(100vh-98px)] lg:overflow-auto">
    <div className="mb-4 rounded-2xl border border-v2-border bg-v2-control p-3"><p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-500">Inspector</p><h2 className="mt-1 text-lg font-semibold">{mechanism}</h2><p className="mt-1 text-xs text-v2-muted">{hasResult ? "Deterministic result available" : "Awaiting solver output"}</p></div>
    <div className="rounded-2xl border border-v2-border bg-v2-control p-3"><MechanismSelector selectedMechanism={state.selectedMechanism} onChange={state.setSelectedMechanism} /></div>
    <div className="my-4 flex gap-1 overflow-x-auto rounded-2xl border border-v2-border bg-v2-control p-1">{tabs.map((item) => <button key={item} onClick={() => setTab(item)} className={`shrink-0 rounded-xl px-3 py-2 text-xs font-semibold transition ${tab === item ? "bg-amber-900/20 text-amber-500 ring-1 ring-amber-700/30" : "text-v2-muted hover:text-v2-text"}`}>{item}</button>)}</div>
    <div className="space-y-4 rounded-2xl border border-v2-border bg-v2-control p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-v2-muted">{tab} module</p>
      {tab === "Parameters" && (state.selectedMechanism === "four_bar" ? <MechanismInputPanel form={state.form} setForm={state.setForm} onRunAnalysis={(e) => { e.preventDefault(); void state.runAnalysis(); }} isLoading={state.isLoading} /> : <SliderCrankInputPanel form={state.sliderCrankForm} setForm={state.setSliderCrankForm} onRunAnalysis={(e) => { e.preventDefault(); void state.runSliderCrankAnalysis(); }} isLoading={state.isSliderCrankLoading} />)}
      {tab === "Results" && (hasResult ? (state.selectedMechanism === "four_bar" ? <ResultsPanel error={state.error} displayResult={state.displayResult} result={state.result} sweepResult={state.sweepResult} /> : <SliderCrankResultsPanel error={state.sliderCrankError} result={state.displaySliderCrankResult} sweepResult={state.sliderCrankSweepResult} selectedSampleIndex={state.selectedSliderCrankSampleIndex} />) : <EmptyState text="Run analysis to populate deterministic solver results." />)}
      {tab === "Simulation" && (state.selectedMechanism === "four_bar" ? <SimulationControls sweepForm={state.sweepForm} setSweepForm={state.setSweepForm} onRunSweep={state.runSweep} isSweeping={state.isSweeping} /> : <SliderCrankSimulationControls sweepForm={state.sliderCrankSweepForm} setSweepForm={state.setSliderCrankSweepForm} onRunSweep={state.runSliderCrankSweep} isSweeping={state.isSliderCrankSweeping} />)}
      {tab === "Synthesis" && (hasResult ? <SynthesisRecommendationPanel selectedMechanism={state.selectedMechanism} inputParameters={state.inputParameters} solverResult={state.solverResult} sweepResult={state.sweepResultForReport} onRecommendationsGenerated={state.setLatestSynthesisRecommendations} onRecommendationsCleared={() => state.setLatestSynthesisRecommendations(null)} /> : <EmptyState text="Generate synthesis recommendations after solver output exists." />)}
      {tab === "Report" && <div className="rounded-2xl border border-v2-border p-4"><p className="text-sm text-v2-muted">Generate structured Markdown and print/PDF reports from the Reports workspace.</p><button className="mt-3 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white" onClick={onOpenReports}>Open report builder</button></div>}
    </div>
  </aside>;
}
function EmptyState({ text }: { text: string }) { return <div className="rounded-2xl border border-dashed border-v2-border bg-v2-input p-5 text-sm text-v2-muted">{text}</div>; }
