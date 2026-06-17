import type { Point, SliderCrankAnalysisResult } from "@/types";

type SliderCrankSvgProps = { result: SliderCrankAnalysisResult | null };
type SvgPoint = { x: number; y: number };

const WIDTH = 640;
const HEIGHT = 420;
const PADDING = 64;

function isFinitePoint(point: Point | null | undefined): point is Point {
  return Array.isArray(point) && point.length === 2 && point.every(Number.isFinite);
}

function buildTransform(points: Point[], offset: number) {
  const guidePad = 60;
  const allPoints: Point[] = [...points, [Math.min(...points.map(([x]) => x)) - guidePad, offset], [Math.max(...points.map(([x]) => x)) + guidePad, offset]];
  const xs = allPoints.map(([x]) => x);
  const ys = allPoints.map(([, y]) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const scale = Math.min((WIDTH - PADDING * 2) / Math.max(maxX - minX, 1), (HEIGHT - PADDING * 2) / Math.max(maxY - minY, 1));
  const drawingWidth = (maxX - minX) * scale;
  const drawingHeight = (maxY - minY) * scale;
  const offsetX = (WIDTH - drawingWidth) / 2;
  const offsetY = (HEIGHT - drawingHeight) / 2;
  return ([x, y]: Point): SvgPoint => ({ x: offsetX + (x - minX) * scale, y: HEIGHT - (offsetY + (y - minY) * scale) });
}

function Link({ start, end, stroke, label }: { start: SvgPoint; end: SvgPoint; stroke: string; label: string }) {
  return <g><line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="#0f172a" strokeWidth="9" strokeLinecap="round" opacity="0.22" /><line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={stroke} strokeWidth="6" strokeLinecap="round" /><text x={(start.x + end.x) / 2} y={(start.y + end.y) / 2 - 10} textAnchor="middle" className="fill-slate-100 text-[13px] font-semibold drop-shadow">{label}</text></g>;
}

function Joint({ point, label, ground = false }: { point: SvgPoint; label: string; ground?: boolean }) {
  return <g>{ground && <circle cx={point.x} cy={point.y} r="17" fill="#0f172a" stroke="#bae6fd" strokeWidth="2" opacity="0.8" />}<circle cx={point.x} cy={point.y} r={ground ? 9 : 8} fill="#e0f2fe" stroke="#0284c7" strokeWidth="3" /><circle cx={point.x} cy={point.y} r="2.5" fill="#0f172a" /><text x={point.x + 14} y={point.y - 13} className="fill-slate-50 text-[18px] font-bold drop-shadow">{label}</text></g>;
}

function Message({ title, detail }: { title: string; detail: string }) {
  return <g><rect x="106" y="154" width="428" height="112" rx="14" fill="#0f172a" opacity="0.82" stroke="#7dd3fc" strokeWidth="1.5" /><text x="320" y="198" textAnchor="middle" className="fill-sky-100 text-[20px] font-bold">{title}</text><text x="320" y="228" textAnchor="middle" className="fill-slate-200 text-[14px]">{detail}</text></g>;
}

export function SliderCrankSvg({ result }: SliderCrankSvgProps) {
  const coordinates = result?.joint_coordinates;
  const points = [coordinates?.O, coordinates?.A, coordinates?.B].filter(isFinitePoint);
  const toSvg = points.length >= 2 ? buildTransform(points, result?.offset ?? 0) : null;
  const O = isFinitePoint(coordinates?.O) && toSvg ? toSvg(coordinates.O) : null;
  const A = isFinitePoint(coordinates?.A) && toSvg ? toSvg(coordinates.A) : null;
  const B = isFinitePoint(coordinates?.B) && toSvg ? toSvg(coordinates.B) : null;
  const guideStart = toSvg ? toSvg([Math.min(...points.map(([x]) => x)) - 60, result?.offset ?? 0]) : null;
  const guideEnd = toSvg ? toSvg([Math.max(...points.map(([x]) => x)) + 60, result?.offset ?? 0]) : null;
  const canDraw = Boolean(result?.valid && O && A && B && guideStart && guideEnd);

  return (
    <svg className="h-full w-full" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Slider-crank CAD drawing">
      <rect width={WIDTH} height={HEIGHT} fill="transparent" />
      {canDraw && O && A && B && guideStart && guideEnd && <><line x1={guideStart.x} y1={guideStart.y} x2={guideEnd.x} y2={guideEnd.y} stroke="#7dd3fc" strokeWidth="3" strokeDasharray="10 8" /><Link start={O} end={A} stroke="#facc15" label="Crank r" /><Link start={A} end={B} stroke="#fb7185" label="Rod l" /><rect x={B.x - 23} y={B.y - 16} width="46" height="32" rx="5" fill="#e0f2fe" stroke="#0284c7" strokeWidth="3" /><Joint point={O} label="O" ground /><Joint point={A} label="A" /><Joint point={B} label="B" /></>}
      {!result && <Message title="No analysis result" detail="Run the deterministic slider-crank solver to render geometry." />}
      {result && !canDraw && <Message title="Invalid configuration" detail="The connecting rod cannot reach the slider guide for this input." />}
    </svg>
  );
}
