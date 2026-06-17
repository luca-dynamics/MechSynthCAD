export type Point = [number, number];

export type JointCoordinates = {
  A: Point;
  B: Point;
  C: Point | null;
  D: Point;
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
