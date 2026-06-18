import type { V2AgentMessage, V2ArtifactKind, V2MechanismState, V2NavItem, V2ProviderId, V2ProviderStatus } from "@/components/v2/types";
import { V2AgentQuestionCards } from "@/components/v2/V2AgentQuestionCards";
import { V2ArtifactCard } from "@/components/v2/V2ArtifactCard";
import { V2ArtifactDetail, V2ArtifactDrawer } from "@/components/v2/V2ArtifactDetail";
import { V2CanvasArtifact } from "@/components/v2/V2CanvasArtifact";
import { V2CommandDock } from "@/components/v2/V2CommandDock";
import { V2ReportPanel } from "@/components/v2/V2ReportPanel";
import { V2SettingsPanel } from "@/components/v2/V2SettingsPanel";
import { V2ToolRunCard } from "@/components/v2/V2ToolRunCard";
import { V2ValidationPanel } from "@/components/v2/V2ValidationPanel";
import type { V2Theme } from "@/components/v2/types";
import { v2MissionTemplates, type V2MissionTemplateId } from "@/components/v2/missionTemplates";
import { V2GuidedMissionChecklist } from "@/components/v2/V2GuidedMissionChecklist";

const drawerTitles: Record<V2ArtifactKind, string> = { canvas: "CAD Preview", parameters: "Parameter Intake", result: "Deterministic Result", simulation: "Sweep Simulation", report: "Report Draft", validation: "Validation Matrix", synthesis: "Synthesis Recommendation" };

export function V2MissionCenter({ active, activeArtifact, state, messages, activeTask, onCommand, onNavigate, onOpenArtifact, onCloseArtifact, theme, onThemeChange, activeProvider, providers, onProviderSelect, onMechanismSelect, onStartTemplate, onOpenGuide, onResetMission }: { active: V2NavItem; activeArtifact: V2ArtifactKind | null; state: V2MechanismState; messages: V2AgentMessage[]; activeTask: string; onCommand: (command: string, modelProvider?: V2ProviderId) => void; onNavigate: (item: V2NavItem) => void; onOpenArtifact: (kind: V2ArtifactKind) => void; onCloseArtifact: () => void; theme: V2Theme; onThemeChange: (theme: V2Theme) => void; activeProvider: V2ProviderId; providers: V2ProviderStatus[]; onProviderSelect: (provider: V2ProviderId) => void; onMechanismSelect: (mechanism: import("@/types").MechanismType) => void; onStartTemplate: (id: V2MissionTemplateId) => void; onOpenGuide: () => void; onResetMission: () => void }) {
  if (active === "Reports") return <V2ReportPanel state={state} messages={messages} onCommand={onCommand} providers={providers} />;
  if (active === "Validation") return <V2ValidationPanel />;
  if (active === "Settings") return <V2SettingsPanel theme={theme} onThemeChange={onThemeChange} />;
  if (active === "Results") return <section className="rounded-[1.4rem] border border-v2-border bg-[#0d0c0b] p-4"><V2ArtifactDetail kind="result" state={state} messages={messages} onCommand={onCommand} providers={providers} /></section>;
  const mechanism = state.selectedMechanism === "four_bar" ? "Four-Bar Linkage" : "Slider-Crank";
  const sampleCount = state.selectedMechanism === "four_bar" ? state.sweepResult?.sample_count ?? 0 : state.sliderCrankSweepResult?.sample_count ?? 0;
  return <section className="v2-scrollbar h-[calc(100vh-1rem)] overflow-y-auto rounded-[1.4rem] border border-v2-border bg-[#0d0c0b] p-4 pb-36">
    <header className="rounded-3xl border border-v2-border bg-[#080807] p-5"><p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-500">Active agent mission</p><div className="mt-2 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-semibold tracking-tight">{mechanism} — Analysis Mission</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-v2-muted">Local deterministic agent coordinates parameter intake, solver tool execution, interpretation, reporting, and validation without external model calls.</p></div><div className="flex flex-wrap gap-2"><button onClick={onOpenGuide} className="rounded-full border border-v2-border px-3 py-1.5 text-xs font-semibold text-v2-muted hover:text-amber-500">Help / Start guide</button><button onClick={onResetMission} className="rounded-full border border-v2-border px-3 py-1.5 text-xs font-semibold text-v2-muted hover:text-amber-500">Reset mission</button><span className="rounded-full border border-amber-600/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-500">{activeTask}</span></div></div></header>
    <div className="mt-4 grid gap-3 md:grid-cols-4">{v2MissionTemplates.map((template) => <button key={template.id} onClick={() => onStartTemplate(template.id)} className="rounded-2xl border border-v2-border bg-[#080807] p-3 text-left hover:border-amber-600/50"><p className="text-xs font-semibold text-v2-text">{template.shortTitle}</p><p className="mt-1 text-[11px] leading-4 text-v2-muted">{template.expectedSteps[0]}</p></button>)}</div><div className="mt-4 rounded-2xl border border-v2-border bg-[#080807] p-3"><p className="mb-3 text-[11px] font-bold uppercase tracking-[0.24em] text-stone-500">Guided checklist</p><V2GuidedMissionChecklist state={state} messages={messages} /></div><div className="mt-4"><V2CanvasArtifact state={state} onOpenArtifact={() => onOpenArtifact("canvas")} /></div>
    <div className="mt-4"><V2CommandDock onSubmit={onCommand} activeProvider={activeProvider} providers={providers} selectedMechanism={state.selectedMechanism} hasDeterministicResult={Boolean(state.solverResult)} onProviderSelect={onProviderSelect} onMechanismSelect={onMechanismSelect} onNavigate={onNavigate} onOpenArtifact={onOpenArtifact} /></div>
    <div className="mt-4"><V2AgentQuestionCards state={state} onRun={onCommand} /></div>
    <div className="mt-4 grid gap-3 md:grid-cols-3">
      <V2ArtifactCard title="CAD Preview" status="available" summary="Compact engineering canvas with a focused artifact drawer." action="Open canvas" onAction={() => onOpenArtifact("canvas")} />
      <V2ArtifactCard title="Deterministic Result" status={state.solverResult ? "ready" : "waiting"} summary={state.solverResult ? "Backend solver output is available for interpretation." : "Run analysis to create a result artifact."} action={state.solverResult ? "Open result" : "Run analysis"} onAction={() => state.solverResult ? onOpenArtifact("result") : onCommand("Run analysis")} />
      <V2ArtifactCard title="Sweep Simulation" status={sampleCount ? "ready" : "idle"} summary={sampleCount ? `${sampleCount} deterministic samples stored.` : "Run a sweep to populate motion samples."} action={sampleCount ? "Open simulation" : "Run simulation"} onAction={() => sampleCount ? onOpenArtifact("simulation") : onCommand("Run simulation")} />
      <V2ArtifactCard title="Report Draft" status="available" summary="Build Markdown, print, or save PDF from current mission evidence." action="Open report" onAction={() => onOpenArtifact("report")} />
      <V2ArtifactCard title="Validation Matrix" status="available" summary="Review source-of-truth rules, solver boundaries, and checks." action="Open validation" onAction={() => onOpenArtifact("validation")} />
      <V2ArtifactCard title="Synthesis Recommendation" status={state.latestSynthesisRecommendations ? "ready" : "idle"} summary={state.solverResult ? "Open synthesis recommendations from deterministic result context." : "Run analysis before synthesis recommendations."} action={state.solverResult ? "Open synthesis" : "Run analysis"} onAction={() => state.solverResult ? onOpenArtifact("synthesis") : onCommand("Run analysis")} />
    </div>
    <div className="mt-4 space-y-3"><p className="text-[11px] font-bold uppercase tracking-[0.24em] text-stone-500">Mission execution timeline</p>{messages.map((message) => <V2ToolRunCard key={message.id} message={message} onAction={onCommand} />)}</div>
    <V2ArtifactDrawer open={Boolean(activeArtifact)} title={activeArtifact ? drawerTitles[activeArtifact] : "Artifact"} subtitle="Focused V2 detail view" onClose={onCloseArtifact} kind={activeArtifact}>{activeArtifact ? <V2ArtifactDetail kind={activeArtifact} state={state} messages={messages} onCommand={onCommand} providers={providers} /> : null}</V2ArtifactDrawer>
  </section>;
}
