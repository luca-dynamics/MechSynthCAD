import type { V2AgentMessage, V2MechanismState, V2NavItem } from "@/components/v2/types";
import { V2AgentQuestionCards } from "@/components/v2/V2AgentQuestionCards";
import { V2ArtifactCard } from "@/components/v2/V2ArtifactCard";
import { V2CanvasArtifact } from "@/components/v2/V2CanvasArtifact";
import { V2CommandDock } from "@/components/v2/V2CommandDock";
import { V2InspectorPanel } from "@/components/v2/V2InspectorPanel";
import { V2ReportPanel } from "@/components/v2/V2ReportPanel";
import { V2SettingsPanel } from "@/components/v2/V2SettingsPanel";
import { V2ToolRunCard } from "@/components/v2/V2ToolRunCard";
import { V2ValidationPanel } from "@/components/v2/V2ValidationPanel";
import type { V2Theme } from "@/components/v2/types";

export function V2MissionCenter({ active, state, messages, activeTask, onCommand, onNavigate, theme, onThemeChange }: { active: V2NavItem; state: V2MechanismState; messages: V2AgentMessage[]; activeTask: string; onCommand: (command: string, modelProvider?: string) => void; onNavigate: (item: V2NavItem) => void; theme: V2Theme; onThemeChange: (theme: V2Theme) => void }) {
  if (active === "Reports") return <V2ReportPanel state={state} messages={messages} />;
  if (active === "Validation") return <V2ValidationPanel />;
  if (active === "Settings") return <V2SettingsPanel theme={theme} onThemeChange={onThemeChange} />;
  if (active === "Results") return <V2InspectorPanel state={state} onOpenReports={() => onNavigate("Reports")} />;
  const mechanism = state.selectedMechanism === "four_bar" ? "Four-Bar Linkage" : "Slider-Crank";
  const sampleCount = state.selectedMechanism === "four_bar" ? state.sweepResult?.sample_count ?? 0 : state.sliderCrankSweepResult?.sample_count ?? 0;
  return <section className="v2-scrollbar h-[calc(100vh-1rem)] overflow-y-auto rounded-[1.4rem] border border-v2-border bg-[#0d0c0b] p-4 pb-36">
    <header className="rounded-3xl border border-v2-border bg-[#080807] p-5"><p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-500">Active agent mission</p><div className="mt-2 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-semibold tracking-tight">{mechanism} — Analysis Mission</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-v2-muted">Local deterministic agent coordinates parameter intake, solver tool execution, interpretation, reporting, and validation without external model calls.</p></div><span className="rounded-full border border-amber-600/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-500">{activeTask}</span></div></header>
    <div className="mt-4"><V2CanvasArtifact state={state} /></div>
    <div className="mt-4"><V2CommandDock onSubmit={onCommand} /></div>
    <div className="mt-4"><V2AgentQuestionCards state={state} onRun={onCommand} /></div>
    <div className="mt-4 grid gap-3 md:grid-cols-3"><V2ArtifactCard title="Deterministic Result" status={state.solverResult ? "ready" : "waiting"} summary={state.solverResult ? "Backend solver output is available for interpretation." : "Run analysis to create a result artifact."} action="Run analysis" onAction={() => onCommand("Run analysis")} /><V2ArtifactCard title="Sweep Simulation" status={sampleCount ? "ready" : "idle"} summary={sampleCount ? `${sampleCount} deterministic samples stored.` : "Run a sweep to populate motion samples."} action="Run simulation" onAction={() => onCommand("Run simulation")} /><V2ArtifactCard title="Report Draft" status="available" summary="Build Markdown, print, or save PDF from current mission evidence." action="Open reports" onAction={() => onNavigate("Reports")} /></div>
    <div className="mt-4 space-y-3"><p className="text-[11px] font-bold uppercase tracking-[0.24em] text-stone-500">Mission execution timeline</p>{messages.map((message) => <V2ToolRunCard key={message.id} message={message} onAction={onCommand} />)}</div>
  </section>;
}
