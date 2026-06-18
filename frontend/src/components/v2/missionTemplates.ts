import type { FourBarForm, MechanismType, SliderCrankForm, SliderCrankSweepForm, SweepForm } from "@/types";
import type { V2ArtifactKind } from "@/components/v2/types";

export type V2MissionTemplateId = "four_bar_demo" | "slider_crank_demo" | "report_generation" | "validation_review";

export type V2MissionTemplate = {
  id: V2MissionTemplateId;
  title: string;
  shortTitle: string;
  description: string;
  mechanism?: MechanismType;
  parameters?: FourBarForm | SliderCrankForm;
  sweep?: SweepForm | SliderCrankSweepForm;
  suggestedCommand: string;
  targetArtifact?: V2ArtifactKind;
  missionSection: "parameters" | "report" | "validation";
  expectedSteps: string[];
};

export const fourBarDemoParameters: FourBarForm = { l1: 120, l2: 35, l3: 90, l4: 80, theta2_deg: 30, omega2: 10, alpha2: 0 };
export const fourBarDemoSweep: SweepForm = { theta2_start_deg: 0, theta2_end_deg: 360, theta2_step_deg: 10 };
export const sliderCrankDemoParameters: SliderCrankForm = { crank_radius: 30, connecting_rod_length: 100, theta_deg: 30, omega: 10, alpha: 0, offset: 0 };
export const sliderCrankDemoSweep: SliderCrankSweepForm = { theta_start_deg: 0, theta_end_deg: 360, theta_step_deg: 10 };

export const v2MissionTemplates: V2MissionTemplate[] = [
  {
    id: "four_bar_demo",
    title: "Four-Bar Analysis Mission",
    shortTitle: "Four-Bar Analysis",
    description: "Load a valid starter linkage, review numeric inputs, then run deterministic analysis and sweep tools.",
    mechanism: "four_bar",
    parameters: fourBarDemoParameters,
    sweep: fourBarDemoSweep,
    suggestedCommand: "Analyze this four-bar mechanism and explain whether the linkage is valid.",
    targetArtifact: "parameters",
    missionSection: "parameters",
    expectedSteps: ["Review linkage lengths", "Run deterministic analysis", "Run 0–360° sweep", "Inspect result and report artifacts"],
  },
  {
    id: "slider_crank_demo",
    title: "Slider-Crank Analysis Mission",
    shortTitle: "Slider-Crank Analysis",
    description: "Load sample slider-crank inputs for displacement, velocity, acceleration, and sweep review.",
    mechanism: "slider_crank",
    parameters: sliderCrankDemoParameters,
    sweep: sliderCrankDemoSweep,
    suggestedCommand: "Analyze this slider-crank mechanism and explain displacement, velocity, and acceleration.",
    targetArtifact: "parameters",
    missionSection: "parameters",
    expectedSteps: ["Review crank and rod dimensions", "Run deterministic analysis", "Run 0–360° sweep", "Generate report-ready interpretation"],
  },
  {
    id: "report_generation",
    title: "Report Generation Mission",
    shortTitle: "Engineering Report",
    description: "Use the current mechanism evidence to open a report-ready deterministic summary workflow.",
    suggestedCommand: "Generate a report-ready summary from the current deterministic results.",
    targetArtifact: "report",
    missionSection: "report",
    expectedSteps: ["Confirm result evidence", "Open report artifact", "Draft summary", "Validate source-of-truth notes"],
  },
  {
    id: "validation_review",
    title: "Validation Mission",
    shortTitle: "Validation Review",
    description: "Check whether the workflow has the evidence needed for engineering review.",
    suggestedCommand: "Validate this mechanism workflow and identify what evidence is missing.",
    targetArtifact: "validation",
    missionSection: "validation",
    expectedSteps: ["Check parameters", "Check solver result", "Check sweep evidence", "Document missing artifacts"],
  },
];

export function getV2MissionTemplate(id: V2MissionTemplateId) {
  return v2MissionTemplates.find((template) => template.id === id);
}
