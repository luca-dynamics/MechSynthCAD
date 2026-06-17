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
  onWorkflowCleared: () => void;
  latestSynthesisRecommendations: SynthesisResponse | null;
  onSynthesisRecommendationsGenerated: (response: SynthesisResponse) => void;
  onSynthesisRecommendationsCleared: () => void;
};

export function WorkflowAndReportSection({ selectedMechanism, availableContext, solverResult, inputParameters, sweepResult, latestWorkflow, onWorkflowComplete, onWorkflowCleared, latestSynthesisRecommendations, onSynthesisRecommendationsGenerated, onSynthesisRecommendationsCleared }: WorkflowAndReportSectionProps) {
  return (
    <div className="space-y-6">
      <AgentWorkflowPanel mechanismType={selectedMechanism} availableContext={availableContext} solverResult={solverResult} onWorkflowComplete={onWorkflowComplete} onWorkflowCleared={onWorkflowCleared} />
      <SynthesisRecommendationPanel selectedMechanism={selectedMechanism} inputParameters={inputParameters} solverResult={solverResult} sweepResult={sweepResult} onRecommendationsGenerated={onSynthesisRecommendationsGenerated} onRecommendationsCleared={onSynthesisRecommendationsCleared} />
      <ReportPreviewPanel mechanismType={selectedMechanism} inputParameters={inputParameters} solverResult={solverResult} sweepResult={sweepResult} agentWorkflow={latestWorkflow as Record<string, unknown> | null} synthesisRecommendations={latestSynthesisRecommendations as Record<string, unknown> | null} />
    </div>
  );
}
