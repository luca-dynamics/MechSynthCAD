export type Vector2 = [number, number];
export type Point = Vector2;

export type JointCoordinates = {
  A: Point;
  B: Point;
  C: Point | null;
  D: Point;
};

export type VelocityAnalysis = {
  omega2: number;
  omega3: number | null;
  omega4: number | null;
  velocity_B: Vector2 | null;
  velocity_C: Vector2 | null;
};

export type AccelerationAnalysis = {
  alpha2: number;
  alpha3: number | null;
  alpha4: number | null;
  acceleration_B: Vector2 | null;
  acceleration_C: Vector2 | null;
};

export type FourBarAnalysisResult = {
  mechanism: "four_bar_linkage";
  valid: boolean;
  grashof_status: string;
  mobility: number;
  classification: string;
  theta2_deg: number;
  theta3_deg: number | null;
  theta4_deg: number | null;
  joint_coordinates: JointCoordinates;
  velocity_analysis: VelocityAnalysis;
  acceleration_analysis: AccelerationAnalysis;
  notes: string[];
};

export type FourBarSweepRequest = {
  l1: number;
  l2: number;
  l3: number;
  l4: number;
  theta2_start_deg: number;
  theta2_end_deg: number;
  theta2_step_deg: number;
  omega2: number;
  alpha2: number;
};

export type FourBarSweepSample = {
  theta2_deg: number;
  valid: boolean;
  theta3_deg: number | null;
  theta4_deg: number | null;
  joint_coordinates: JointCoordinates;
  velocity_analysis: VelocityAnalysis;
  acceleration_analysis: AccelerationAnalysis;
  notes: string[];
};

export type FourBarSweepResponse = {
  mechanism: "four_bar_linkage";
  sample_count: number;
  valid_sample_count: number;
  invalid_sample_count: number;
  grashof_status: string;
  classification: string;
  mobility: number;
  samples: FourBarSweepSample[];
  notes: string[];
};

export type FourBarForm = {
  l1: number;
  l2: number;
  l3: number;
  l4: number;
  theta2_deg: number;
  omega2: number;
  alpha2: number;
};

export type SweepForm = {
  theta2_start_deg: number;
  theta2_end_deg: number;
  theta2_step_deg: number;
};

export type SliderCrankForm = {
  crank_radius: number;
  connecting_rod_length: number;
  theta_deg: number;
  omega: number;
  alpha: number;
  offset: number;
};

export type SliderCrankJointCoordinates = {
  O: Point;
  A: Point;
  B: Point;
};

export type SliderCrankVelocityAnalysis = {
  omega: number;
  velocity_A: Vector2 | null;
  velocity_B: Vector2 | null;
  slider_velocity: number | null;
};

export type SliderCrankAccelerationAnalysis = {
  alpha: number;
  acceleration_A: Vector2 | null;
  acceleration_B: Vector2 | null;
  slider_acceleration: number | null;
};

export type SliderCrankAnalysisResult = {
  mechanism: "slider_crank";
  valid: boolean;
  theta_deg: number;
  crank_radius: number;
  connecting_rod_length: number;
  offset: number;
  slider_position: number | null;
  transmission_angle_deg: number | null;
  joint_coordinates: SliderCrankJointCoordinates;
  velocity_analysis: SliderCrankVelocityAnalysis;
  acceleration_analysis: SliderCrankAccelerationAnalysis;
  notes: string[];
};

export type MechanismType = "four_bar" | "slider_crank";
export type AgentMechanismRequestType = MechanismType | "auto";
export type AgentSelectedMechanismType = "four_bar" | "slider_crank" | "unknown";

export type AgentWorkflowRequest = {
  user_goal: string;
  mechanism_type: AgentMechanismRequestType;
  available_context?: Record<string, unknown> | null;
  solver_result?: Record<string, unknown> | null;
};

export type AgentWorkflowStep = {
  step_id: string;
  agent_role: string;
  action: string;
  status: "pending" | "completed" | "blocked";
  summary: string;
};

export type AgentWorkflowResponse = {
  workflow_id: string;
  interpreted_goal: string;
  selected_mechanism: AgentSelectedMechanismType;
  required_inputs: string[];
  missing_inputs: string[];
  validation_notes: string[];
  solver_tool_plan: string[];
  workflow_steps: AgentWorkflowStep[];
  design_recommendations: string[];
  report_ready_summary: string;
  safety_notes: string[];
};


export type ReportMechanismType = MechanismType;

export type ReportRequest = {
  title?: string | null;
  mechanism_type: ReportMechanismType;
  input_parameters: Record<string, unknown>;
  solver_result?: Record<string, unknown> | null;
  sweep_result?: Record<string, unknown> | null;
  agent_workflow?: Record<string, unknown> | null;
};

export type ReportSection = {
  heading: string;
  content: string;
  bullets: string[];
};

export type ReportResponse = {
  title: string;
  mechanism_type: ReportMechanismType;
  sections: ReportSection[];
  markdown: string;
  validation_notes: string[];
};
