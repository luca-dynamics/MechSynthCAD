import { useState } from "react";
import { CadWorkspace } from "@/components/CadWorkspace";
import { SliderCrankWorkspace } from "@/components/SliderCrankWorkspace";
import type { V2MechanismState } from "@/components/v2/types";

export function V2CanvasArtifact({ state }: { state: V2MechanismState }) {
  const [expanded, setExpanded] = useState(false);
  const isFourBar = state.selectedMechanism === "four_bar";
  return <section className="rounded-2xl border border-v2-border bg-[#121110]">
    <div className="flex items-center justify-between gap-3 border-b border-v2-border px-4 py-3"><div><p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-500">Mission artifact</p><h3 className="text-sm font-semibold">Compact CAD Preview</h3></div><button onClick={() => setExpanded((value) => !value)} className="rounded-xl border border-v2-border bg-[#191715] px-3 py-2 text-xs text-v2-muted hover:text-amber-500">{expanded ? "Compact" : "Expand"}</button></div>
    <div className={`${expanded ? "h-[620px]" : "h-[340px]"} overflow-hidden bg-[#0d0c0b] p-2`}>
      {isFourBar ? <CadWorkspace displayResult={state.displayResult} sweepResult={state.sweepResult} selectedSampleIndex={state.selectedSampleIndex} setSelectedSampleIndex={state.setSelectedSampleIndex} isPlaying={state.isPlaying} setIsPlaying={state.setIsPlaying} /> : <SliderCrankWorkspace result={state.displaySliderCrankResult} sweepResult={state.sliderCrankSweepResult} selectedSampleIndex={state.selectedSliderCrankSampleIndex} setSelectedSampleIndex={state.setSelectedSliderCrankSampleIndex} isPlaying={state.isSliderCrankPlaying} setIsPlaying={state.setIsSliderCrankPlaying} />}
    </div>
  </section>;
}
