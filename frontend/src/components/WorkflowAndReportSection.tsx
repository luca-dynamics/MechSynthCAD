import { AgentWorkflowPanel } from "@/components/AgentWorkflowPanel";
import { ReportPreviewPanel } from "@/components/ReportPreviewPanel";
import { SynthesisRecommendationPanel } from "@/components/SynthesisRecommendationPanel";
import type { AgentWorkflowResponse, MechanismType, SynthesisResponse } from "@/types";

type WorkflowAndReportSectionProps = {
  selectedMechanism: MechanismType;
  availableContext: Record<string, unknown>;
  solverResult: Record<string, unknown> | null;
  inputParameters: Record<string, unknown>;
  sweepResult: Record<string, unknown> | null;
  latestWorkflow: AgentWorkflowResponse | null;
  onWorkflowComplete: (workflow: AgentWorkflowResponse) => void;
  latestSynthesisRecommendations: SynthesisResponse | null;
  onSynthesisRecommendationsGenerated: (response: SynthesisResponse) => void;
};

export function WorkflowAndReportSection({ selectedMechanism, availableContext, solverResult, inputParameters, sweepResult, latestWorkflow, onWorkflowComplete, latestSynthesisRecommendations, onSynthesisRecommendationsGenerated }: WorkflowAndReportSectionProps) {
  return (
    <div className="space-y-6">
      <AgentWorkflowPanel mechanismType={selectedMechanism} availableContext={availableContext} solverResult={solverResult} onWorkflowComplete={onWorkflowComplete} />
      <SynthesisRecommendationPanel selectedMechanism={selectedMechanism} inputParameters={inputParameters} solverResult={solverResult} sweepResult={sweepResult} onRecommendationsGenerated={onSynthesisRecommendationsGenerated} />
      <ReportPreviewPanel mechanismType={selectedMechanism} inputParameters={inputParameters} solverResult={solverResult} sweepResult={sweepResult} agentWorkflow={latestWorkflow as Record<string, unknown> | null} synthesisRecommendations={latestSynthesisRecommendations as Record<string, unknown> | null} />
    </div>
  );
}
