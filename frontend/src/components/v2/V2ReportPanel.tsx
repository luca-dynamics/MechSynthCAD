import { ReportPreviewPanel } from "@/components/ReportPreviewPanel";
import type { V2AgentMessage, V2MechanismState } from "@/components/v2/types";

export function V2ReportPanel({ state, messages }: { state: V2MechanismState; messages: V2AgentMessage[] }) {
  return <section className="space-y-4">
    <div className="v2-surface border-v2-border rounded-3xl border p-5"><p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-500">Reports</p><h2 className="mt-2 text-2xl font-semibold">Report-ready engineering package</h2><p className="mt-2 text-sm text-v2-muted">Reports are generated from deterministic solver output, agent workflow notes, and synthesis recommendations. Markdown download and browser print/save-as-PDF are preserved.</p></div>
    <ReportPreviewPanel mechanismType={state.selectedMechanism} inputParameters={state.inputParameters} solverResult={state.solverResult} sweepResult={state.sweepResultForReport} agentWorkflow={{ messages }} synthesisRecommendations={state.latestSynthesisRecommendations as Record<string, unknown> | null} />
  </section>;
}
