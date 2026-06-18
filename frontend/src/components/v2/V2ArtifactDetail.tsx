import { useEffect, useId } from "react";
import type React from "react";
import { CadWorkspace } from "@/components/CadWorkspace";
import { ReportPreviewPanel } from "@/components/ReportPreviewPanel";
import { V2SupervisorSubmissionPanel } from "@/components/v2/V2SupervisorSubmissionPanel";
import { SimulationControls } from "@/components/SimulationControls";
import { SliderCrankSimulationControls } from "@/components/SliderCrankSimulationControls";
import { SliderCrankWorkspace } from "@/components/SliderCrankWorkspace";
import { SynthesisRecommendationPanel } from "@/components/SynthesisRecommendationPanel";
import { ValidationMatrix } from "@/components/ValidationMatrix";
import type { V2AgentMessage, V2ArtifactKind, V2MechanismState, V2ProviderStatus } from "@/components/v2/types";
import { V2GuardrailBadge, V2SourceOfTruthBadge, V2ToolPermissionBadge } from "@/components/v2/V2GuardrailBadges";

type DrawerProps = { open: boolean; kind: V2ArtifactKind | null; title: string; subtitle?: string; onClose: () => void; children: React.ReactNode };

const drawerWidth: Record<V2ArtifactKind, string> = { canvas: "max-w-6xl", parameters: "max-w-4xl", result: "max-w-5xl", simulation: "max-w-5xl", report: "max-w-5xl", validation: "max-w-5xl", synthesis: "max-w-5xl" };

export function V2ArtifactDrawer({ open, kind, title, subtitle, onClose, children }: DrawerProps) {
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", onKeyDown); };
  }, [onClose, open]);
  if (!open) return null;
  const width = kind ? drawerWidth[kind] : "max-w-5xl";
  return <div className="fixed inset-0 z-50 flex justify-end overflow-hidden" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-label={title}>
    <button aria-label="Close artifact drawer overlay" className="absolute inset-0 cursor-default bg-black/70 opacity-100 backdrop-blur-sm transition-opacity duration-200" onClick={onClose} />
    <aside className={`v2-scrollbar relative flex h-[100dvh] w-full ${width} translate-x-0 flex-col overflow-hidden border-l border-v2-border bg-[#090807] shadow-2xl transition-transform duration-200 ease-out sm:rounded-l-[1.5rem]`}>
      <div className="sticky top-0 z-10 flex shrink-0 items-start justify-between gap-4 border-b border-v2-border bg-[#090807]/95 px-4 py-4 backdrop-blur sm:px-5">
        <div><p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-500">V2 mission artifact</p><h2 id={titleId} className="mt-1 text-xl font-semibold text-v2-text">{title}</h2>{subtitle ? <p className="mt-1 text-sm text-v2-muted">{subtitle}</p> : null}</div>
        <button aria-label="Close artifact drawer" onClick={onClose} className="min-h-11 rounded-xl border border-v2-border bg-[#151311] px-4 py-2 text-xs font-semibold text-v2-muted outline-none hover:text-amber-500 focus:border-amber-500 focus:text-amber-500 focus:ring-2 focus:ring-amber-500/30">Close</button>
      </div>
      <div className="v2-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-4 pb-[calc(env(safe-area-inset-bottom)+2rem)] sm:p-5">{children}</div>
    </aside>
  </div>;
}

export function V2ArtifactDetail({ kind, state, messages, onCommand, providers = [] }: { kind: V2ArtifactKind; state: V2MechanismState; messages: V2AgentMessage[]; onCommand: (command: string) => void; providers?: V2ProviderStatus[] }) {
  if (kind === "canvas") return <V2CanvasArtifactDetail state={state} />;
  if (kind === "parameters") return <V2ParameterIntakePanel state={state} onCommand={onCommand} />;
  if (kind === "result") return <V2ResultArtifactDetail state={state} onCommand={onCommand} />;
  if (kind === "simulation") return <V2SimulationArtifactDetail state={state} onCommand={onCommand} />;
  if (kind === "report") return <V2ReportArtifactDetail state={state} messages={messages} onCommand={onCommand} providers={providers} />;
  if (kind === "validation") return <V2ValidationArtifactDetail />;
  return <V2SynthesisArtifactDetail state={state} onCommand={onCommand} />;
}

export function V2CompactInspector({ state, onOpenArtifact, onCommand }: { state: V2MechanismState; onOpenArtifact: (kind: V2ArtifactKind) => void; onCommand: (command: string) => void }) {
  const missing = Object.entries(state.inputParameters).filter(([, value]) => typeof value !== "number" || Number.isNaN(value));
  const hasSweep = state.selectedMechanism === "four_bar" ? Boolean(state.sweepResult) : Boolean(state.sliderCrankSweepResult);
  return <div className="space-y-2 text-xs">
    <Row k="Selected mechanism" v={state.selectedMechanism === "four_bar" ? "Four-bar linkage" : "Slider-crank"} />
    <Row k="Parameters" v={missing.length ? `${missing.length} fields need review` : "Ready"} />
    <Row k="Result" v={state.solverResult ? "Available" : "Not generated"} />
    <Row k="Simulation" v={hasSweep ? "Samples available" : "Not run"} />
    <div className="grid grid-cols-2 gap-2 pt-2">
      <Action onClick={() => onOpenArtifact("parameters")}>Edit parameters</Action><Action onClick={() => onCommand("Run analysis")}>Run analysis</Action><Action onClick={() => onCommand("Run simulation")}>Run simulation</Action><Action onClick={() => onOpenArtifact("result")}>Open result</Action><Action onClick={() => onOpenArtifact("simulation")}>Open simulation</Action><Action onClick={() => onOpenArtifact("report")}>Open report</Action>
    </div>
  </div>;
}

export function V2ParameterIntakePanel({ state, onCommand }: { state: V2MechanismState; onCommand: (command: string) => void }) {
  const isFour = state.selectedMechanism === "four_bar";
  const form = isFour ? state.form : state.sliderCrankForm;
  const sweep = isFour ? state.sweepForm : state.sliderCrankSweepForm;
  const setField = (key: string, value: number) => isFour ? state.setForm({ ...state.form, [key]: value }) : state.setSliderCrankForm({ ...state.sliderCrankForm, [key]: value });
  const setSweepField = (key: string, value: number) => isFour ? state.setSweepForm({ ...state.sweepForm, [key]: value }) : state.setSliderCrankSweepForm({ ...state.sliderCrankSweepForm, [key]: value });
  return <DetailShell eyebrow="Parameter intake" title={isFour ? "Four-bar compact inputs" : "Slider-crank compact inputs"}>
    <div className="grid gap-3 lg:grid-cols-3">
      {isFour ? <><FieldGroup title="Link lengths" fields={["l1","l2","l3","l4"]} values={form as Record<string, number>} onChange={setField} /><FieldGroup title="Motion input" fields={["theta2_deg","omega2","alpha2"]} values={form as Record<string, number>} onChange={setField} /><FieldGroup title="Sweep" fields={["theta2_start_deg","theta2_end_deg","theta2_step_deg"]} values={sweep as Record<string, number>} onChange={setSweepField} /></> : <><FieldGroup title="Geometry" fields={["crank_radius","connecting_rod_length","offset"]} values={form as Record<string, number>} onChange={setField} /><FieldGroup title="Motion input" fields={["theta_deg","omega","alpha"]} values={form as Record<string, number>} onChange={setField} /><FieldGroup title="Sweep" fields={["theta_start_deg","theta_end_deg","theta_step_deg"]} values={sweep as Record<string, number>} onChange={setSweepField} /></>}
    </div><div className="mt-4 flex flex-wrap gap-2"><Action onClick={() => void (isFour ? state.runAnalysis() : state.runSliderCrankAnalysis())}>Save/update parameters</Action><Action onClick={() => onCommand("Run analysis")}>Run analysis</Action><Action onClick={() => onCommand("Run simulation")}>Run simulation</Action><Action onClick={() => onCommand("Audit parameters")}>Ask agent to audit parameters</Action></div>
  </DetailShell>;
}

export function V2ResultArtifactDetail({ state, onCommand }: { state: V2MechanismState; onCommand: (command: string) => void }) {
  const result = state.selectedMechanism === "four_bar" ? state.displayResult : state.displaySliderCrankResult;
  if (!result) return <Blocked text="No deterministic solver result is available yet. Run analysis first." action="Run analysis" onAction={() => onCommand("Run analysis")} />;
  const entries = Object.entries(result).filter(([, v]) => typeof v !== "object").slice(0, 8);
  return <DetailShell eyebrow="Deterministic result" title="Solver source-of-truth summary"><div className="mb-3 flex flex-wrap gap-2"><V2SourceOfTruthBadge /><V2GuardrailBadge /></div><div className="grid gap-3 md:grid-cols-4">{entries.map(([k, v]) => <Metric key={k} label={k} value={String(v)} />)}<Metric label="Velocity" value={(result as any).velocity_analysis ? "Available" : "Unavailable"} /><Metric label="Acceleration" value={(result as any).acceleration_analysis ? "Available" : "Unavailable"} /></div><Notes notes={(result as any).notes ?? []} /><div className="mt-4 flex flex-wrap gap-2"><Action onClick={() => onCommand("Explain result")}>Explain result</Action><Action onClick={() => onCommand("Run simulation")}>Run simulation</Action><Action onClick={() => onCommand("Recommend improvement")}>Recommend improvement</Action><Action onClick={() => onCommand("Generate report")}>Generate report</Action></div><Raw data={result} /></DetailShell>;
}

export function V2SimulationArtifactDetail({ state, onCommand }: { state: V2MechanismState; onCommand: (command: string) => void }) { const isFour = state.selectedMechanism === "four_bar"; const sweep = isFour ? state.sweepResult : state.sliderCrankSweepResult; const index = isFour ? state.selectedSampleIndex : state.selectedSliderCrankSampleIndex; if (!sweep) return <Blocked text="No sweep samples are available yet. Run simulation to create motion samples." action="Run simulation" onAction={() => onCommand("Run simulation")} />; return <DetailShell eyebrow="Sweep simulation" title="Motion sample artifact"><div className="grid gap-3 md:grid-cols-4"><Metric label="Samples" value={String(sweep.sample_count)} /><Metric label="Valid" value={String(sweep.valid_sample_count)} /><Metric label="Invalid" value={String(sweep.invalid_sample_count)} /><Metric label="Selected index" value={String(index)} /></div><div className="mt-4 rounded-2xl border border-v2-border bg-[#0d0c0b] p-3">{isFour ? <SimulationControls sweepForm={state.sweepForm} setSweepForm={state.setSweepForm} onRunSweep={state.runSweep} isSweeping={state.isSweeping} /> : <SliderCrankSimulationControls sweepForm={state.sliderCrankSweepForm} setSweepForm={state.setSliderCrankSweepForm} onRunSweep={state.runSliderCrankSweep} isSweeping={state.isSliderCrankSweeping} />}</div><div className="mt-4 flex flex-wrap gap-2"><Action onClick={() => undefined}>View canvas</Action><Action onClick={() => onCommand("Explain motion")}>Explain motion</Action><Action onClick={() => onCommand("Generate report")}>Generate report</Action></div></DetailShell>; }

export function V2CanvasArtifactDetail({ state }: { state: V2MechanismState }) { const isFour = state.selectedMechanism === "four_bar"; return <DetailShell eyebrow="CAD focus" title={isFour ? "Four-bar engineering canvas" : "Slider-crank engineering canvas"}><div className="mb-3 grid gap-3 md:grid-cols-3"><Metric label="Result status" value={state.solverResult ? "Ready" : "Awaiting analysis"} /><Metric label="Mechanism" value={isFour ? "Four-bar" : "Slider-crank"} /><Metric label="Quick action" value="Analysis / simulation ready" /></div><div className="h-[70dvh] min-h-[420px] overflow-auto rounded-2xl border border-v2-border bg-[#050505] p-2">{isFour ? <CadWorkspace displayResult={state.displayResult} sweepResult={state.sweepResult} selectedSampleIndex={state.selectedSampleIndex} setSelectedSampleIndex={state.setSelectedSampleIndex} isPlaying={state.isPlaying} setIsPlaying={state.setIsPlaying} /> : <SliderCrankWorkspace result={state.displaySliderCrankResult} sweepResult={state.sliderCrankSweepResult} selectedSampleIndex={state.selectedSliderCrankSampleIndex} setSelectedSampleIndex={state.setSelectedSliderCrankSampleIndex} isPlaying={state.isSliderCrankPlaying} setIsPlaying={state.setIsSliderCrankPlaying} />}</div></DetailShell>; }
export function V2ReportArtifactDetail({ state, messages, onCommand, providers = [] }: { state: V2MechanismState; messages: V2AgentMessage[]; onCommand: (command: string) => void; providers?: V2ProviderStatus[] }) { return <DetailShell eyebrow="Report draft" title="Report builder and export"><div className="mb-3 flex flex-wrap gap-2"><V2SourceOfTruthBadge /><V2GuardrailBadge label="Numerical sections require solver evidence" /></div><p className="mb-4 rounded-2xl border border-v2-border bg-[#0d0c0b] p-3 text-sm text-v2-muted">Report can be generated from current mission evidence. Supervisor Submission Mode adds an academic white-paper preview, evidence checklist, metadata, copy/download Markdown, and browser print/PDF flow.</p><SectionList items={["Supervisor Submission Mode", "Academic metadata", "Evidence checklist", "Deterministic results", "Sweep data", "Export actions"]} /><div className="mt-4"><V2SupervisorSubmissionPanel state={state} messages={messages} providers={providers} onCommand={onCommand} /></div><details className="mt-4 rounded-2xl border border-v2-border bg-[#0d0c0b] p-3"><summary className="cursor-pointer text-sm font-semibold text-v2-muted">Existing engineering report generator</summary><div className="mt-3"><ReportPreviewPanel mechanismType={state.selectedMechanism} inputParameters={state.inputParameters} solverResult={state.solverResult} sweepResult={state.sweepResultForReport} agentWorkflow={{ messages }} synthesisRecommendations={state.latestSynthesisRecommendations as Record<string, unknown> | null} /></div></details></DetailShell>; }
export function V2ValidationArtifactDetail() { return <DetailShell eyebrow="Validation matrix" title="Workflow capability checks"><p className="mb-4 rounded-2xl border border-v2-border bg-[#121110] p-4 text-sm text-v2-muted">Validation checks ensure solver workflow, artifact readiness, reporting, and deterministic-source-of-truth constraints are satisfied.</p><div className="rounded-2xl border border-v2-border bg-[#0d0c0b] p-3"><ValidationMatrix /></div></DetailShell>; }
export function V2SynthesisArtifactDetail({ state, onCommand }: { state: V2MechanismState; onCommand: (command: string) => void }) { if (!state.solverResult) return <Blocked text="Run deterministic analysis before requesting synthesis recommendations." action="Run analysis" onAction={() => onCommand("Run analysis")} />; return <DetailShell eyebrow="Synthesis recommendation" title="Design improvement artifact"><div className="mb-3 flex flex-wrap gap-2"><V2ToolPermissionBadge /><V2GuardrailBadge label="Advisory, not validated optimization" /></div><SynthesisRecommendationPanel selectedMechanism={state.selectedMechanism} inputParameters={state.inputParameters} solverResult={state.solverResult} sweepResult={state.sweepResultForReport} onRecommendationsGenerated={state.setLatestSynthesisRecommendations} onRecommendationsCleared={() => state.setLatestSynthesisRecommendations(null)} /></DetailShell>; }

function DetailShell({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) { return <section className="rounded-[1.35rem] border border-v2-border bg-[#11100f] p-4 text-v2-text"><p className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-500">{eyebrow}</p><h3 className="mt-1 text-lg font-semibold">{title}</h3><div className="mt-4">{children}</div></section>; }
function FieldGroup({ title, fields, values, onChange }: { title: string; fields: string[]; values: Record<string, number>; onChange: (key: string, value: number) => void }) { return <div className="rounded-2xl border border-v2-border bg-[#0d0c0b] p-3"><p className="mb-3 text-xs font-semibold text-v2-muted">{title}</p>{fields.map((field) => <label key={field} className="mb-2 block text-[11px] text-v2-muted"><span className="mb-1 block uppercase tracking-[0.14em]">{field}</span><input type="number" value={values[field] ?? 0} onChange={(event) => onChange(field, Number(event.target.value))} className="w-full rounded-xl border border-v2-border bg-[#080807] px-3 py-2 text-sm text-v2-text outline-none focus:border-amber-600/50" /></label>)}</div>; }
function Action({ children, onClick }: { children: React.ReactNode; onClick: () => void }) { return <button onClick={onClick} className="rounded-xl border border-v2-border bg-[#191715] px-3 py-2 text-xs font-semibold text-v2-muted hover:border-amber-600/40 hover:text-amber-500">{children}</button>; }
function Row({ k, v }: { k: string; v: string }) { return <div className="flex justify-between gap-3 rounded-xl bg-[#121110] px-3 py-2"><span className="text-v2-muted">{k}</span><span className="text-right font-medium text-v2-text">{v}</span></div>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-v2-border bg-[#0d0c0b] p-3"><p className="text-[10px] uppercase tracking-[0.18em] text-v2-muted">{label}</p><p className="mt-1 break-words text-sm font-semibold text-v2-text">{value}</p></div>; }
function Blocked({ text, action, onAction }: { text: string; action: string; onAction: () => void }) { return <div className="rounded-[1.35rem] border border-dashed border-v2-border bg-[#11100f] p-6 text-v2-muted"><p className="text-sm leading-6">{text}</p><div className="mt-4"><Action onClick={onAction}>{action}</Action></div></div>; }
function Notes({ notes }: { notes: string[] }) { return notes.length ? <div className="mt-4 rounded-2xl border border-v2-border bg-[#0d0c0b] p-3"><p className="text-xs font-semibold text-v2-muted">Validity and notes</p><ul className="mt-2 list-disc pl-5 text-sm text-v2-muted">{notes.map((note) => <li key={note}>{note}</li>)}</ul></div> : null; }
function Raw({ data }: { data: unknown }) { return <details className="mt-4 rounded-2xl border border-v2-border bg-[#0d0c0b] p-3"><summary className="cursor-pointer text-xs font-semibold text-v2-muted">Raw solver output</summary><pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap text-xs text-stone-400">{JSON.stringify(data, null, 2)}</pre></details>; }
function SectionList({ items }: { items: string[] }) { return <div className="grid gap-2 md:grid-cols-3">{items.map((item) => <div key={item} className="rounded-xl border border-v2-border bg-[#0d0c0b] px-3 py-2 text-xs text-v2-muted">{item}</div>)}</div>; }
