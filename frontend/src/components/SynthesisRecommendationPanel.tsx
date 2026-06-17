import { useEffect, useMemo, useState } from "react";
import { generateSynthesisRecommendations } from "@/lib/api";
import type { MechanismType, SynthesisResponse, SynthesisTargetDirection } from "@/types";

type Props = {
  selectedMechanism: MechanismType;
  inputParameters: Record<string, unknown>;
  solverResult: Record<string, unknown> | null;
  sweepResult: Record<string, unknown> | null;
  onRecommendationsGenerated?: (response: SynthesisResponse) => void;
  onRecommendationsCleared?: () => void;
};

const metricsByMechanism: Record<MechanismType, string[]> = {
  four_bar: ["theta4_deg", "theta3_deg", "transmission_quality", "valid_sample_count", "invalid_sample_count"],
  slider_crank: ["slider_position", "transmission_angle_deg", "slider_velocity", "slider_acceleration", "valid_sample_count", "invalid_sample_count"],
};

const directions: SynthesisTargetDirection[] = ["increase", "decrease", "match", "minimize", "maximize"];

export function SynthesisRecommendationPanel({ selectedMechanism, inputParameters, solverResult, sweepResult, onRecommendationsGenerated, onRecommendationsCleared }: Props) {
  const metrics = useMemo(() => metricsByMechanism[selectedMechanism], [selectedMechanism]);
  const [metric, setMetric] = useState(metrics[0]);
  const [direction, setDirection] = useState<SynthesisTargetDirection>("increase");
  const [targetValue, setTargetValue] = useState("");
  const [tolerance, setTolerance] = useState("");
  const [description, setDescription] = useState("");
  const [response, setResponse] = useState<SynthesisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const synthesisInputSignature = useMemo(
    () => JSON.stringify({ selectedMechanism, inputParameters, solverResult, sweepResult }),
    [selectedMechanism, inputParameters, solverResult, sweepResult],
  );

  useEffect(() => {
    setMetric(metrics[0]);
  }, [metrics]);

  useEffect(() => {
    setResponse(null);
    onRecommendationsCleared?.();
  }, [synthesisInputSignature, onRecommendationsCleared]);

  async function generateRecommendations() {
    setIsLoading(true);
    setError(null);
    try {
      const synthesisResponse = await generateSynthesisRecommendations({
        mechanism_type: selectedMechanism,
        input_parameters: inputParameters,
        solver_result: solverResult,
        sweep_result: sweepResult,
        targets: [{
          metric,
          direction,
          target_value: targetValue === "" ? null : Number(targetValue),
          tolerance: tolerance === "" ? null : Number(tolerance),
          description: description.trim() || null,
        }],
      });
      setResponse(synthesisResponse);
      onRecommendationsGenerated?.(synthesisResponse);
    } catch (recommendationError) {
      setError(recommendationError instanceof Error ? recommendationError.message : "Unable to generate synthesis recommendations");
      setResponse(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-700">Design Iteration / Synthesis Assistant</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Target Design Goal</h2>
          <p className="mt-2 text-sm text-slate-600">Compare supplied deterministic solver outputs against user goals. No final dimensions are invented.</p>
          <p className="mt-1 text-sm font-semibold text-indigo-700">Selected mechanism: {selectedMechanism.replace("_", "-")}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-5">
        <label className="text-sm font-medium text-slate-700">Metric<select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" value={metric} onChange={(event) => setMetric(event.target.value)}>{metrics.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label className="text-sm font-medium text-slate-700">Parameter Adjustment Direction<select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" value={direction} onChange={(event) => setDirection(event.target.value as SynthesisTargetDirection)}>{directions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label className="text-sm font-medium text-slate-700">Target value<input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" type="number" step="any" value={targetValue} onChange={(event) => setTargetValue(event.target.value)} placeholder="Optional" /></label>
        <label className="text-sm font-medium text-slate-700">Tolerance<input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" type="number" step="any" value={tolerance} onChange={(event) => setTolerance(event.target.value)} placeholder="Optional" /></label>
        <label className="text-sm font-medium text-slate-700">Description<input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Optional note" /></label>
      </div>
      <button type="button" className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-indigo-300" onClick={generateRecommendations} disabled={isLoading}>{isLoading ? "Generating..." : "Generate Design Iteration Recommendations"}</button>
      {error ? <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {response ? <div className="mt-5 grid gap-4 md:grid-cols-2">
        <List title="Interpreted targets" items={response.interpreted_targets} />
        <List title="Current observations" items={response.current_observations} />
        <List title="Target gaps" items={response.target_gaps} />
        <List title="Next solver actions" items={response.next_solver_actions} />
        <article className="rounded-xl border border-slate-200 p-4 md:col-span-2"><h3 className="font-semibold text-slate-950">Recommendations</h3><ul className="mt-2 space-y-2 text-sm text-slate-700">{response.recommendations.map((item, index) => <li key={`${item.parameter}-${index}`} className="rounded-lg bg-slate-50 p-3"><span className="font-semibold">{item.parameter}</span>: {item.suggested_direction} ({item.confidence}) — {item.reason}<br /><span className="text-indigo-700">Requires deterministic solver rerun: {item.requires_solver_rerun ? "yes" : "no"}</span></li>)}</ul></article>
        <List title="Safety notes" items={response.safety_notes} />
      </div> : null}
    </section>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return <article className="rounded-xl border border-slate-200 p-4"><h3 className="font-semibold text-slate-950">{title}</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">{items.map((item) => <li key={item}>{item}</li>)}</ul></article>;
}
