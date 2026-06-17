export type Point = [number, number];

export type FourBarAnalysisResult = {
  mechanism: "four_bar_linkage";
  valid: boolean;
  grashof_status: string;
  mobility: number;
  classification: string;
  theta2_deg: number;
  theta3_deg: number | null;
  theta4_deg: number | null;
  joint_coordinates: {
    A: Point;
    B: Point;
    C: Point | null;
    D: Point;
  };
  notes: string[];
};
