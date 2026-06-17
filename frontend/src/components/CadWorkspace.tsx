import { AngleChart } from "@/components/AngleChart";
import { FourBarSvg } from "@/components/FourBarSvg";
import type { FourBarAnalysisResult, FourBarSweepResponse } from "@/types";

type CadWorkspaceProps = {
  displayResult: FourBarAnalysisResult | null;
  sweepResult: FourBarSweepResponse | null;
  selectedSampleIndex: number;
  setSelectedSampleIndex: (index: number | ((index: number) => number)) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
};

export function CadWorkspace({ displayResult, sweepResult, selectedSampleIndex, setSelectedSampleIndex, isPlaying, setIsPlaying }: CadWorkspaceProps) {
  const sampleCount = sweepResult?.samples.length ?? 0;
  const selectedSample = sweepResult?.samples[selectedSampleIndex] ?? null;

  return (
    <section className="rounded-2xl border border-slate-300 bg-blueprint p-5 text-white shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">CAD-Style 2D Visualization</h2>
          <p className="text-sm text-slate-300">Backend joint coordinates rendered as SVG geometry</p>
        </div>
        <span className="rounded-full border border-sky-300/50 px-3 py-1 text-xs uppercase tracking-widest text-sky-100">Solver View</span>
      </div>
      <div className="mt-5 h-[520px] rounded-xl border border-sky-200/30 bg-[linear-gradient(to_right,var(--tw-gradient-stops)),linear-gradient(to_bottom,var(--tw-gradient-stops))] from-gridline to-gridline bg-[length:32px_32px] p-8">
        <FourBarSvg result={displayResult} />
      </div>
      {sweepResult && (
        <div className="mt-4 rounded-xl border border-sky-200/30 bg-slate-950/40 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <button className="rounded-lg bg-white px-3 py-2 font-semibold text-slate-900" onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? "Pause" : "Play"}</button>
            <button className="rounded-lg border border-sky-200/40 px-3 py-2" onClick={() => setSelectedSampleIndex(Math.max(0, selectedSampleIndex - 1))}>Previous</button>
            <button className="rounded-lg border border-sky-200/40 px-3 py-2" onClick={() => setSelectedSampleIndex(Math.min(sampleCount - 1, selectedSampleIndex + 1))}>Next</button>
            <span className="text-sm text-slate-200">Sample {selectedSampleIndex + 1} / {sampleCount} · θ2 {selectedSample?.theta2_deg ?? "N/A"}° · {selectedSample?.valid ? "valid" : "invalid"}</span>
          </div>
          <input className="mt-3 w-full" type="range" min="0" max={Math.max(sampleCount - 1, 0)} value={selectedSampleIndex} onChange={(event) => setSelectedSampleIndex(Number(event.target.value))} />
        </div>
      )}
      {sweepResult && <div className="mt-4 h-[300px]"><AngleChart samples={sweepResult.samples} /></div>}
    </section>
  );
}
