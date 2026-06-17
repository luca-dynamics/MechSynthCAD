import type { FourBarAnalysisResult, Point } from "@/types";

type FourBarSvgProps = {
  result: FourBarAnalysisResult | null;
};

type SvgPoint = { x: number; y: number };

const WIDTH = 640;
const HEIGHT = 420;
const PADDING = 56;

function isFinitePoint(point: Point | null | undefined): point is Point {
  return Array.isArray(point) && point.length === 2 && point.every(Number.isFinite);
}

function midpoint(start: SvgPoint, end: SvgPoint): SvgPoint {
  return { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
}

function buildTransform(points: Point[]) {
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rangeX = Math.max(maxX - minX, 1);
  const rangeY = Math.max(maxY - minY, 1);
  const scale = Math.min((WIDTH - PADDING * 2) / rangeX, (HEIGHT - PADDING * 2) / rangeY);
  const drawingWidth = rangeX * scale;
  const drawingHeight = rangeY * scale;
  const offsetX = (WIDTH - drawingWidth) / 2;
  const offsetY = (HEIGHT - drawingHeight) / 2;

  return ([x, y]: Point): SvgPoint => ({
    x: offsetX + (x - minX) * scale,
    y: HEIGHT - (offsetY + (y - minY) * scale),
  });
}

function Link({ start, end, stroke, label }: { start: SvgPoint; end: SvgPoint; stroke: string; label: string }) {
  const labelPoint = midpoint(start, end);

  return (
    <g>
      <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="#0f172a" strokeWidth="9" strokeLinecap="round" opacity="0.22" />
      <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={stroke} strokeWidth="6" strokeLinecap="round" />
      <text x={labelPoint.x} y={labelPoint.y - 10} textAnchor="middle" className="fill-slate-100 text-[13px] font-semibold drop-shadow">
        {label}
      </text>
    </g>
  );
}

function Joint({ point, label, ground = false }: { point: SvgPoint; label: string; ground?: boolean }) {
  return (
    <g>
      {ground && <circle cx={point.x} cy={point.y} r="17" fill="#0f172a" stroke="#bae6fd" strokeWidth="2" opacity="0.8" />}
      <circle cx={point.x} cy={point.y} r={ground ? 9 : 8} fill="#e0f2fe" stroke="#0284c7" strokeWidth="3" />
      <circle cx={point.x} cy={point.y} r="2.5" fill="#0f172a" />
      <text x={point.x + 14} y={point.y - 13} className="fill-slate-50 text-[18px] font-bold drop-shadow">
        {label}
      </text>
    </g>
  );
}

function Message({ title, detail }: { title: string; detail: string }) {
  return (
    <g>
      <rect x="118" y="154" width="404" height="112" rx="14" fill="#0f172a" opacity="0.82" stroke="#7dd3fc" strokeWidth="1.5" />
      <text x="320" y="198" textAnchor="middle" className="fill-sky-100 text-[20px] font-bold">
        {title}
      </text>
      <text x="320" y="228" textAnchor="middle" className="fill-slate-200 text-[14px]">
        {detail}
      </text>
    </g>
  );
}

export function FourBarSvg({ result }: FourBarSvgProps) {
  const coordinates = result?.joint_coordinates;
  const availablePoints = [coordinates?.A, coordinates?.B, coordinates?.C, coordinates?.D].filter(isFinitePoint);
  const toSvg = availablePoints.length >= 2 ? buildTransform(availablePoints) : null;
  const A = isFinitePoint(coordinates?.A) && toSvg ? toSvg(coordinates.A) : null;
  const B = isFinitePoint(coordinates?.B) && toSvg ? toSvg(coordinates.B) : null;
  const C = isFinitePoint(coordinates?.C) && toSvg ? toSvg(coordinates.C) : null;
  const D = isFinitePoint(coordinates?.D) && toSvg ? toSvg(coordinates.D) : null;
  const canDrawMechanism = Boolean(result?.valid && A && B && C && D);

  return (
    <svg className="h-full w-full" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Four-bar linkage CAD drawing">
      <rect width={WIDTH} height={HEIGHT} fill="transparent" />
      {canDrawMechanism && A && B && C && D && (
        <>
          <Link start={A} end={D} stroke="#38bdf8" label="Ground L1" />
          <Link start={A} end={B} stroke="#facc15" label="Crank L2" />
          <Link start={B} end={C} stroke="#fb7185" label="Coupler L3" />
          <Link start={D} end={C} stroke="#34d399" label="Rocker L4" />
          <Joint point={A} label="A" ground />
          <Joint point={B} label="B" />
          <Joint point={C} label="C" />
          <Joint point={D} label="D" ground />
        </>
      )}

      {!canDrawMechanism && A && B && D && (
        <>
          <Link start={A} end={D} stroke="#38bdf8" label="Ground L1" />
          <Link start={A} end={B} stroke="#facc15" label="Crank L2" />
          <Joint point={A} label="A" ground />
          <Joint point={B} label="B" />
          <Joint point={D} label="D" ground />
        </>
      )}

      {!result && <Message title="No analysis result" detail="Run the deterministic four-bar solver to render joint coordinates." />}
      {result && !canDrawMechanism && <Message title="Invalid configuration" detail="C-dependent coupler and rocker links cannot be drawn for this result." />}
    </svg>
  );
}
