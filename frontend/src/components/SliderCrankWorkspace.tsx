import { SliderCrankChart } from "@/components/SliderCrankChart";
import { SliderCrankSvg } from "@/components/SliderCrankSvg";
import type { SliderCrankAnalysisResult, SliderCrankSweepResponse } from "@/types";

type Props = {
  result: SliderCrankAnalysisResult | null;
  sweepResult?: SliderCrankSweepResponse | null;
  selectedSampleIndex?: number;
  setSelectedSampleIndex?: (index: number | ((index: number) => number)) => void;
  isPlaying?: boolean;
  setIsPlaying?: (isPlaying: boolean) => void;
};

type SliderCrankAnimationControlsProps = {
  isPlaying: boolean;
  sampleCount: number;
  selectedSampleIndex: number;
  selectedSample: SliderCrankSweepResponse["samples"][number] | null;
  onPlayPause: () => void;
  onSelectSample: (index: number) => void;
};

function SliderCrankAnimationControls({
  isPlaying,
  sampleCount,
  selectedSampleIndex,
  selectedSample,
  onPlayPause,
  onSelectSample,
}: SliderCrankAnimationControlsProps) {
  return (
    <div className="mt-4 rounded-xl border border-sky-200/30 bg-slate-950/40 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <button className="rounded-lg bg-white px-3 py-2 font-semibold text-slate-900" onClick={onPlayPause}>
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button className="rounded-lg border border-sky-200/40 px-3 py-2" onClick={() => onSelectSample(selectedSampleIndex - 1)}>
          Previous
        </button>
        <button className="rounded-lg border border-sky-200/40 px-3 py-2" onClick={() => onSelectSample(selectedSampleIndex + 1)}>
          Next
        </button>
        <span className="text-sm text-slate-200">
          Sample {selectedSampleIndex + 1} / {sampleCount} · θ {selectedSample?.theta_deg ?? "N/A"}° · {selectedSample?.valid ? "valid" : "invalid"}
        </span>
      </div>
      <input
        className="mt-3 w-full"
        type="range"
        min="0"
        max={Math.max(sampleCount - 1, 0)}
        value={selectedSampleIndex}
        onChange={(event) => onSelectSample(Number(event.target.value))}
      />
    </div>
  );
}

export function SliderCrankWorkspace({
  result,
  sweepResult = null,
  selectedSampleIndex = 0,
  setSelectedSampleIndex,
  isPlaying = false,
  setIsPlaying,
}: Props) {
  const sampleCount = sweepResult?.samples.length ?? 0;
  const selectedSample = sweepResult?.samples[selectedSampleIndex] ?? null;
  const displayResult = selectedSample && sweepResult
    ? {
        mechanism: "slider_crank" as const,
        valid: selectedSample.valid,
        theta_deg: selectedSample.theta_deg,
        crank_radius: result?.crank_radius ?? 0,
        connecting_rod_length: result?.connecting_rod_length ?? 0,
        offset: result?.offset ?? 0,
        slider_position: selectedSample.slider_position,
        transmission_angle_deg: selectedSample.transmission_angle_deg,
        joint_coordinates: selectedSample.joint_coordinates,
        velocity_analysis: selectedSample.velocity_analysis,
        acceleration_analysis: selectedSample.acceleration_analysis,
        notes: selectedSample.notes,
      }
    : result;

  const updateIndex = (index: number) => {
    setSelectedSampleIndex?.(Math.max(0, Math.min(sampleCount - 1, index)));
  };

  return (
    <section className="rounded-2xl border border-slate-300 bg-blueprint p-5 text-white shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Slider-Crank CAD Visualization</h2>
          <p className="text-sm text-slate-300">Backend joint coordinates rendered as SVG geometry</p>
        </div>
        <span className="rounded-full border border-sky-300/50 px-3 py-1 text-xs uppercase tracking-widest text-sky-100">
          Solver View
        </span>
      </div>
      <div className="mt-5 h-[520px] rounded-xl border border-sky-200/30 bg-[linear-gradient(to_right,var(--tw-gradient-stops)),linear-gradient(to_bottom,var(--tw-gradient-stops))] from-gridline to-gridline bg-[length:32px_32px] p-8">
        <SliderCrankSvg result={displayResult} />
      </div>
      {sweepResult ? (
        <>
          <SliderCrankAnimationControls
            isPlaying={isPlaying}
            sampleCount={sampleCount}
            selectedSampleIndex={selectedSampleIndex}
            selectedSample={selectedSample}
            onPlayPause={() => setIsPlaying?.(!isPlaying)}
            onSelectSample={updateIndex}
          />
          <div className="mt-4 h-[300px]">
            <SliderCrankChart samples={sweepResult.samples} />
          </div>
        </>
      ) : null}
    </section>
  );
}
