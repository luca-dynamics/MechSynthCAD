import { SliderCrankSvg } from "@/components/SliderCrankSvg";
import type { SliderCrankAnalysisResult } from "@/types";

type SliderCrankWorkspaceProps = {
  result: SliderCrankAnalysisResult | null;
};

export function SliderCrankWorkspace({ result }: SliderCrankWorkspaceProps) {
  return (
    <section className="rounded-2xl border border-slate-300 bg-blueprint p-5 text-white shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Slider-Crank CAD Visualization</h2>
          <p className="text-sm text-slate-300">Backend joint coordinates rendered as SVG geometry</p>
        </div>
        <span className="rounded-full border border-sky-300/50 px-3 py-1 text-xs uppercase tracking-widest text-sky-100">Solver View</span>
      </div>
      <div className="mt-5 h-[520px] rounded-xl border border-sky-200/30 bg-[linear-gradient(to_right,var(--tw-gradient-stops)),linear-gradient(to_bottom,var(--tw-gradient-stops))] from-gridline to-gridline bg-[length:32px_32px] p-8">
        <SliderCrankSvg result={result} />
      </div>
    </section>
  );
}
