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
