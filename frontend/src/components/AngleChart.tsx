import type { FourBarSweepSample } from "@/types";

type AngleChartProps = {
  samples: FourBarSweepSample[];
};

type SeriesKey = "theta3_deg" | "theta4_deg";

const WIDTH = 640;
const HEIGHT = 260;
const PADDING = { top: 24, right: 32, bottom: 52, left: 60 };
const series: Array<{ key: SeriesKey; label: string; color: string }> = [
  { key: "theta3_deg", label: "θ3 coupler", color: "#fb7185" },
  { key: "theta4_deg", label: "θ4 rocker", color: "#34d399" },
];

function finiteValues(samples: FourBarSweepSample[]) {
  return samples.flatMap((sample) => [sample.theta2_deg, sample.theta3_deg, sample.theta4_deg]).filter((value): value is number => typeof value === "number" && Number.isFinite(value));
}

function pathFor(samples: FourBarSweepSample[], key: SeriesKey, xScale: (value: number) => number, yScale: (value: number) => number) {
  const commands: string[] = [];
  let openSegment = false;

  samples.forEach((sample) => {
    const yValue = sample[key];
    if (!sample.valid || yValue === null || !Number.isFinite(yValue)) {
      openSegment = false;
      return;
    }

    const command = openSegment ? "L" : "M";
    commands.push(`${command} ${xScale(sample.theta2_deg).toFixed(2)} ${yScale(yValue).toFixed(2)}`);
    openSegment = true;
  });

  return commands.join(" ");
}

export function AngleChart({ samples }: AngleChartProps) {
  const values = finiteValues(samples);
  const validAngles = samples.flatMap((sample) => [sample.theta3_deg, sample.theta4_deg]).filter((value): value is number => typeof value === "number" && Number.isFinite(value));

  if (samples.length === 0 || values.length === 0 || validAngles.length === 0) {
    return <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Run a sweep with valid samples to display θ3/θ4 angle graphs.</div>;
  }

  const minX = Math.min(...samples.map((sample) => sample.theta2_deg));
  const maxX = Math.max(...samples.map((sample) => sample.theta2_deg));
  const minY = Math.min(...validAngles);
  const maxY = Math.max(...validAngles);
  const xRange = Math.max(maxX - minX, 1);
  const yRange = Math.max(maxY - minY, 1);
  const xScale = (value: number) => PADDING.left + ((value - minX) / xRange) * (WIDTH - PADDING.left - PADDING.right);
  const yScale = (value: number) => HEIGHT - PADDING.bottom - ((value - minY) / yRange) * (HEIGHT - PADDING.top - PADDING.bottom);

  return (
    <svg className="h-full w-full" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Four-bar output angle chart">
      <rect width={WIDTH} height={HEIGHT} rx="14" fill="#f8fafc" />
      <line x1={PADDING.left} y1={HEIGHT - PADDING.bottom} x2={WIDTH - PADDING.right} y2={HEIGHT - PADDING.bottom} stroke="#334155" strokeWidth="1.5" />
      <line x1={PADDING.left} y1={PADDING.top} x2={PADDING.left} y2={HEIGHT - PADDING.bottom} stroke="#334155" strokeWidth="1.5" />
      <text x={WIDTH / 2} y={HEIGHT - 14} textAnchor="middle" className="fill-slate-700 text-[13px] font-semibold">θ2 input angle (deg)</text>
      <text x="18" y={HEIGHT / 2} textAnchor="middle" transform={`rotate(-90 18 ${HEIGHT / 2})`} className="fill-slate-700 text-[13px] font-semibold">output angle (deg)</text>
      <text x={PADDING.left} y={HEIGHT - PADDING.bottom + 20} textAnchor="middle" className="fill-slate-500 text-[12px]">{minX.toFixed(1)}</text>
      <text x={WIDTH - PADDING.right} y={HEIGHT - PADDING.bottom + 20} textAnchor="middle" className="fill-slate-500 text-[12px]">{maxX.toFixed(1)}</text>
      <text x={PADDING.left - 8} y={yScale(minY)} textAnchor="end" dominantBaseline="middle" className="fill-slate-500 text-[12px]">{minY.toFixed(1)}</text>
      <text x={PADDING.left - 8} y={yScale(maxY)} textAnchor="end" dominantBaseline="middle" className="fill-slate-500 text-[12px]">{maxY.toFixed(1)}</text>
      {series.map((item) => <path key={item.key} d={pathFor(samples, item.key, xScale, yScale)} fill="none" stroke={item.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />)}
      <g transform={`translate(${WIDTH - 190} 24)`}>
        {series.map((item, index) => <g key={item.key} transform={`translate(0 ${index * 22})`}><line x1="0" x2="24" y1="0" y2="0" stroke={item.color} strokeWidth="4" /><text x="34" y="4" className="fill-slate-700 text-[13px] font-semibold">{item.label}</text></g>)}
      </g>
    </svg>
  );
}
