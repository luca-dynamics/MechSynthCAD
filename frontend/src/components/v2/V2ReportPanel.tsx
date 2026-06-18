import { ReportPreviewPanel } from "@/components/ReportPreviewPanel";
import { V2SupervisorSubmissionPanel } from "@/components/v2/V2SupervisorSubmissionPanel";
import type { V2AgentMessage, V2MechanismState, V2ProviderStatus, V2ProviderId } from "@/components/v2/types";

export function V2ReportPanel({ state, messages, onCommand, providers = [] }: { state: V2MechanismState; messages: V2AgentMessage[]; onCommand: (command: string, modelProvider?: V2ProviderId) => void; providers?: V2ProviderStatus[] }) {
  return <section className="space-y-4">
    <div className="v2-surface border-v2-border rounded-[1.5rem] border p-5"><p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-500">Reports</p><h2 className="mt-2 text-2xl font-semibold">Product report workspace</h2><p className="mt-2 text-sm leading-6 text-v2-muted">Build a report-ready engineering package from deterministic solver output, agent workflow notes, and synthesis recommendations. Markdown download and browser print/save-as-PDF are preserved.</p>{!state.solverResult ? <div className="mt-4 rounded-2xl border border-dashed border-v2-border bg-v2-control p-4 text-sm text-v2-muted">Run analysis to populate deterministic report content.</div> : null}</div>
    <V2SupervisorSubmissionPanel state={state} messages={messages} providers={providers} onCommand={(command) => onCommand(command)} />
    <div className="overflow-hidden rounded-[1.25rem] border border-v2-border bg-v2-control p-3"><details><summary className="mb-3 cursor-pointer text-sm font-semibold text-v2-muted">Existing engineering report generator</summary><ReportPreviewPanel mechanismType={state.selectedMechanism} inputParameters={state.inputParameters} solverResult={state.solverResult} sweepResult={state.sweepResultForReport} agentWorkflow={{ messages }} synthesisRecommendations={state.latestSynthesisRecommendations as Record<string, unknown> | null} /></details></div>
  </section>;
}
