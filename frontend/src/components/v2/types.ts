import type { FourBarAnalysisResult, FourBarForm, FourBarSweepResponse, MechanismType, SliderCrankAnalysisResult, SliderCrankForm, SliderCrankSweepForm, SliderCrankSweepResponse, SweepForm, SynthesisResponse } from "@/types";

export type V2Theme = "dark" | "light" | "system";
export type V2ResolvedTheme = "dark" | "light";
export type V2NavItem = "Overview" | "Workspace" | "Results" | "Agent" | "Reports" | "Validation" | "Settings";
export type V2InspectorTab = "Parameters" | "Results" | "Simulation" | "Synthesis" | "Report";
export type V2AgentIntent = "analyze" | "simulate" | "report" | "synthesize" | "validate" | "missing_parameters" | "help";
export type V2AgentStepStatus = "complete" | "blocked" | "pending";

export type V2AgentStep = {
  label: string;
  status: V2AgentStepStatus;
  detail: string;
};

export type V2AgentAction = {
  label: string;
  command: string;
};

export type V2AgentMessage = {
  id: string;
  role: "user" | "agent";
  text: string;
  intent?: V2AgentIntent;
  steps?: V2AgentStep[];
  actions?: V2AgentAction[];
};

export type V2MechanismState = {
  selectedMechanism: MechanismType;
  setSelectedMechanism: (mechanism: MechanismType) => void;
  form: FourBarForm;
  setForm: (form: FourBarForm) => void;
  sweepForm: SweepForm;
  setSweepForm: (form: SweepForm) => void;
  result: FourBarAnalysisResult | null;
  displayResult: FourBarAnalysisResult | null;
  sweepResult: FourBarSweepResponse | null;
  selectedSampleIndex: number;
  setSelectedSampleIndex: (index: number | ((index: number) => number)) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  isLoading: boolean;
  isSweeping: boolean;
  error: string | null;
  runAnalysis: () => Promise<Record<string, unknown> | null>;
  runSweep: () => Promise<Record<string, unknown> | null>;
  sliderCrankForm: SliderCrankForm;
  setSliderCrankForm: (form: SliderCrankForm) => void;
  sliderCrankSweepForm: SliderCrankSweepForm;
  setSliderCrankSweepForm: (form: SliderCrankSweepForm) => void;
  sliderCrankResult: SliderCrankAnalysisResult | null;
  displaySliderCrankResult: SliderCrankAnalysisResult | null;
  sliderCrankSweepResult: SliderCrankSweepResponse | null;
  selectedSliderCrankSampleIndex: number;
  setSelectedSliderCrankSampleIndex: (index: number | ((index: number) => number)) => void;
  isSliderCrankPlaying: boolean;
  setIsSliderCrankPlaying: (isPlaying: boolean) => void;
  isSliderCrankLoading: boolean;
  isSliderCrankSweeping: boolean;
  sliderCrankError: string | null;
  runSliderCrankAnalysis: () => Promise<Record<string, unknown> | null>;
  runSliderCrankSweep: () => Promise<Record<string, unknown> | null>;
  inputParameters: Record<string, unknown>;
  solverResult: Record<string, unknown> | null;
  sweepResultForReport: Record<string, unknown> | null;
  latestSynthesisRecommendations: SynthesisResponse | null;
  setLatestSynthesisRecommendations: (response: SynthesisResponse | null) => void;
};
