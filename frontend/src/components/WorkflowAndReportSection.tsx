import { AgentWorkflowPanel } from "@/components/AgentWorkflowPanel";
import { ReportPreviewPanel } from "@/components/ReportPreviewPanel";
import type { AgentWorkflowResponse, MechanismType } from "@/types";

type WorkflowAndReportSectionProps = {
  selectedMechanism: MechanismType;
  availableContext: Record<string, unknown>;
  solverResult: Record<string, unknown> | null;
  inputParameters: Record<string, unknown>;
  sweepResult: Record<string, unknown> | null;
  latestWorkflow: AgentWorkflowResponse | null;
  onWorkflowComplete: (workflow: AgentWorkflowResponse) => void;
};

export function WorkflowAndReportSection({ selectedMechanism, availableContext, solverResult, inputParameters, sweepResult, latestWorkflow, onWorkflowComplete }: WorkflowAndReportSectionProps) {
  return (
    <div className="space-y-6">
      <AgentWorkflowPanel mechanismType={selectedMechanism} availableContext={availableContext} solverResult={solverResult} onWorkflowComplete={onWorkflowComplete} />
      <ReportPreviewPanel mechanismType={selectedMechanism} inputParameters={inputParameters} solverResult={solverResult} sweepResult={sweepResult} agentWorkflow={latestWorkflow as Record<string, unknown> | null} />
    </div>
  );
}
