import { CadWorkspace } from "@/components/CadWorkspace";
import { SliderCrankWorkspace } from "@/components/SliderCrankWorkspace";
import type { V2MechanismState } from "@/components/v2/types";

export function V2Workspace({ state, activeTask }: { state: V2MechanismState; activeTask: string }) {
  return <section className="space-y-4">
    <div className="v2-surface border-v2-border rounded-3xl border p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-500">CAD hero canvas</p><h2 className="mt-1 text-xl font-semibold">{state.selectedMechanism === "four_bar" ? "Four-bar linkage" : "Slider-crank"} workspace</h2></div>
        <div className="rounded-full border border-v2-border px-3 py-1 text-xs text-v2-muted">{activeTask}</div>
      </div>
      <div className="overflow-hidden rounded-3xl border border-v2-border">
        {state.selectedMechanism === "four_bar" ? <CadWorkspace displayResult={state.displayResult} sweepResult={state.sweepResult} selectedSampleIndex={state.selectedSampleIndex} setSelectedSampleIndex={state.setSelectedSampleIndex} isPlaying={state.isPlaying} setIsPlaying={state.setIsPlaying} /> : <SliderCrankWorkspace result={state.displaySliderCrankResult} sweepResult={state.sliderCrankSweepResult} selectedSampleIndex={state.selectedSliderCrankSampleIndex} setSelectedSampleIndex={state.setSelectedSliderCrankSampleIndex} isPlaying={state.isSliderCrankPlaying} setIsPlaying={state.setIsSliderCrankPlaying} />}
      </div>
    </div>
    <div className="v2-surface-soft border-v2-border rounded-3xl border p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">Current task state</p>
      <p className="mt-2 text-sm text-v2-muted">Run deterministic analysis or a sweep from the inspector or bottom agent composer. The agent can select tools and interpret returned solver values, but it does not calculate engineering quantities.</p>
    </div>
  </section>;
}
