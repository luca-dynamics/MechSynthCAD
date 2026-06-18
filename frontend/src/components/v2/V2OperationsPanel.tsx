import { V2InspectorPanel } from "@/components/v2/V2InspectorPanel";
import type { V2MechanismState } from "@/components/v2/types";

export function V2OperationsPanel({ state, activeTask, onOpenReports }: { state: V2MechanismState; activeTask: string; onOpenReports: () => void }) {
  const mechanism = state.selectedMechanism === "four_bar" ? "Four-bar linkage" : "Slider-crank";
  const hasSweep = state.selectedMechanism === "four_bar" ? Boolean(state.sweepResult) : Boolean(state.sliderCrankSweepResult);
  return <aside className="v2-scrollbar hidden h-[calc(100vh-1rem)] overflow-y-auto rounded-[1.4rem] border border-v2-border bg-[#080807] p-3 xl:block xl:sticky xl:top-2">
    <Panel title="Model Assignment"><Rows rows={[["Orchestrator", "Local Deterministic Agent"], ["Solver", "Backend deterministic solver"], ["Reporter", "Local report builder"], ["Validator", "Local validation matrix"], ["External models", "Coming soon"]]} /></Panel>
    <Panel title="Mechanism Context"><Rows rows={[["Selected", mechanism], ["Input completeness", "Numeric fields ready"], ["Result state", state.solverResult ? "Result available" : "Awaiting analysis"], ["Sweep state", hasSweep ? "Samples available" : "No sweep run"]]} /></Panel>
    <Panel title="Mission Checklist"><Checklist items={["Parameter intake", "Analysis", "Simulation", "Synthesis", "Report", "Validation"]} active={state.solverResult ? 2 : 1} /></Panel>
    <Panel title="Progress Log"><div className="space-y-2 text-xs text-v2-muted"><p>Now · {activeTask}</p><p>Recent · Mission shell initialized</p><p>Recent · Deterministic tools registered</p><p>Recent · Report and validation panels available</p></div></Panel>
    <Panel title="Tool Status"><Rows rows={[["API health", "Placeholder ready"], ["Solver", "Deterministic active"], ["Report builder", "Available"], ["Validation", "Available"]]} /></Panel>
    <div className="mt-3"><V2InspectorPanel state={state} onOpenReports={onOpenReports} /></div>
  </aside>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <section className="mb-3 rounded-2xl border border-v2-border bg-[#0d0c0b] p-3"><p className="mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-amber-500">{title}</p>{children}</section>; }
function Rows({ rows }: { rows: string[][] }) { return <div className="space-y-2">{rows.map(([key, value]) => <div key={key} className="flex items-start justify-between gap-3 rounded-xl bg-[#121110] px-3 py-2 text-xs"><span className="text-v2-muted">{key}</span><span className="max-w-[55%] text-right font-medium text-v2-text">{value}</span></div>)}</div>; }
function Checklist({ items, active }: { items: string[]; active: number }) { return <div className="space-y-1.5">{items.map((item, index) => <div key={item} className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-xs"><span className={`h-2 w-2 rounded-full ${index <= active ? "bg-amber-500" : "bg-stone-700"}`} /><span className={index <= active ? "text-v2-text" : "text-v2-muted"}>{item}</span></div>)}</div>; }
