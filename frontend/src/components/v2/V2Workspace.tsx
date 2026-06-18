import { CadWorkspace } from "@/components/CadWorkspace";
import { SliderCrankWorkspace } from "@/components/SliderCrankWorkspace";
import type { V2MechanismState } from "@/components/v2/types";

export function V2Workspace({ state, activeTask }: { state: V2MechanismState; activeTask: string }) {
  const mechanismLabel = state.selectedMechanism === "four_bar" ? "Four-bar linkage" : "Slider-crank";
  const sampleCount = state.selectedMechanism === "four_bar" ? state.sweepResult?.sample_count ?? 0 : state.sliderCrankSweepResult?.sample_count ?? 0;
  return <section className="space-y-4">
    <div className="v2-surface border-v2-border overflow-hidden rounded-[1.5rem] border">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-v2-border px-4 py-3">
        <div><p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-500">Engineering canvas</p><h2 className="mt-1 text-xl font-semibold">{mechanismLabel}</h2></div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-v2-border bg-v2-control px-3 py-1 text-v2-muted">{activeTask}</span>
          <button onClick={() => void (state.selectedMechanism === "four_bar" ? state.runAnalysis() : state.runSliderCrankAnalysis())} className="rounded-full border border-amber-700/35 bg-amber-900/10 px-3 py-1 font-semibold text-amber-500">Analyze</button>
          <button onClick={() => void (state.selectedMechanism === "four_bar" ? state.runSweep() : state.runSliderCrankSweep())} className="rounded-full border border-v2-border bg-v2-control px-3 py-1 font-semibold text-v2-muted hover:text-amber-500">Simulate</button>
        </div>
      </div>
      <div className="v2-canvas-grid bg-v2-input p-2 sm:p-4">
        <div className="overflow-hidden rounded-[1.25rem] border border-v2-border bg-v2-control shadow-inner shadow-black/20">
          {state.selectedMechanism === "four_bar" ? <CadWorkspace displayResult={state.displayResult} sweepResult={state.sweepResult} selectedSampleIndex={state.selectedSampleIndex} setSelectedSampleIndex={state.setSelectedSampleIndex} isPlaying={state.isPlaying} setIsPlaying={state.setIsPlaying} /> : <SliderCrankWorkspace result={state.displaySliderCrankResult} sweepResult={state.sliderCrankSweepResult} selectedSampleIndex={state.selectedSliderCrankSampleIndex} setSelectedSampleIndex={state.setSelectedSliderCrankSampleIndex} isPlaying={state.isSliderCrankPlaying} setIsPlaying={state.setIsSliderCrankPlaying} />}
        </div>
      </div>
    </div>
    <div className="v2-surface-soft border-v2-border grid gap-3 rounded-[1.25rem] border p-4 md:grid-cols-[1.2fr_0.8fr]">
      <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">Agent status</p><p className="mt-2 text-sm leading-6 text-v2-muted">The local agent may select deterministic analysis and sweep tools, interpret returned values, and prepare next steps without calculating engineering quantities itself.</p></div>
      <div className="grid grid-cols-2 gap-2 text-sm"><div className="rounded-2xl border border-v2-border bg-v2-control p-3"><p className="text-xs text-v2-muted">Samples</p><p className="mt-1 font-semibold">{sampleCount}</p></div><div className="rounded-2xl border border-v2-border bg-v2-control p-3"><p className="text-xs text-v2-muted">Source</p><p className="mt-1 font-semibold">Backend solver</p></div></div>
    </div>
  </section>;
}
