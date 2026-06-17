import type { SliderCrankSweepSample } from "@/types";

const WIDTH = 640;
const HEIGHT = 260;
const PADDING = { top: 24, right: 32, bottom: 52, left: 64 };

export function SliderCrankChart({ samples }: { samples: SliderCrankSweepSample[] }) {
  const valid = samples.filter((sample) => sample.valid && typeof sample.slider_position === "number" && Number.isFinite(sample.slider_position));
  if (valid.length === 0) return <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Run a sweep with valid samples to display slider-position graphs.</div>;
  const minX = Math.min(...samples.map((sample) => sample.theta_deg));
  const maxX = Math.max(...samples.map((sample) => sample.theta_deg));
  const minY = Math.min(...valid.map((sample) => sample.slider_position as number));
  const maxY = Math.max(...valid.map((sample) => sample.slider_position as number));
  const xRange = Math.max(maxX - minX, 1);
  const yRange = Math.max(maxY - minY, 1);
  const xScale = (value: number) => PADDING.left + ((value - minX) / xRange) * (WIDTH - PADDING.left - PADDING.right);
  const yScale = (value: number) => HEIGHT - PADDING.bottom - ((value - minY) / yRange) * (HEIGHT - PADDING.top - PADDING.bottom);
  let openSegment = false;
  const path = samples.map((sample) => {
    if (!sample.valid || sample.slider_position === null || !Number.isFinite(sample.slider_position)) { openSegment = false; return ""; }
    const command = openSegment ? "L" : "M";
    openSegment = true;
    return `${command} ${xScale(sample.theta_deg).toFixed(2)} ${yScale(sample.slider_position).toFixed(2)}`;
  }).filter(Boolean).join(" ");
  return <svg className="h-full w-full" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Slider-crank position chart"><rect width={WIDTH} height={HEIGHT} rx="14" fill="#f8fafc" /><line x1={PADDING.left} y1={HEIGHT - PADDING.bottom} x2={WIDTH - PADDING.right} y2={HEIGHT - PADDING.bottom} stroke="#334155" strokeWidth="1.5" /><line x1={PADDING.left} y1={PADDING.top} x2={PADDING.left} y2={HEIGHT - PADDING.bottom} stroke="#334155" strokeWidth="1.5" /><text x={WIDTH / 2} y={HEIGHT - 14} textAnchor="middle" className="fill-slate-700 text-[13px] font-semibold">θ input angle (deg)</text><text x="18" y={HEIGHT / 2} textAnchor="middle" transform={`rotate(-90 18 ${HEIGHT / 2})`} className="fill-slate-700 text-[13px] font-semibold">slider position</text><text x={PADDING.left} y={HEIGHT - PADDING.bottom + 20} textAnchor="middle" className="fill-slate-500 text-[12px]">{minX.toFixed(1)}</text><text x={WIDTH - PADDING.right} y={HEIGHT - PADDING.bottom + 20} textAnchor="middle" className="fill-slate-500 text-[12px]">{maxX.toFixed(1)}</text><text x={PADDING.left - 8} y={yScale(minY)} textAnchor="end" dominantBaseline="middle" className="fill-slate-500 text-[12px]">{minY.toFixed(1)}</text><text x={PADDING.left - 8} y={yScale(maxY)} textAnchor="end" dominantBaseline="middle" className="fill-slate-500 text-[12px]">{maxY.toFixed(1)}</text><path d={path} fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /><g transform={`translate(${WIDTH - 190} 24)`}><line x1="0" x2="24" y1="0" y2="0" stroke="#38bdf8" strokeWidth="4" /><text x="34" y="4" className="fill-slate-700 text-[13px] font-semibold">Slider position</text></g></svg>;
}
