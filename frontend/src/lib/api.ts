import type { FourBarAnalysisResult, FourBarForm, FourBarSweepRequest, FourBarSweepResponse } from "@/types";

const API_BASE_URL = "http://localhost:8000";

export async function analyzeFourBar(form: FourBarForm): Promise<FourBarAnalysisResult> {
  const response = await fetch(`${API_BASE_URL}/api/mechanisms/fourbar/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });

  if (!response.ok) throw new Error(`Backend returned ${response.status}`);

  return (await response.json()) as FourBarAnalysisResult;
}

export async function sweepFourBar(payload: FourBarSweepRequest): Promise<FourBarSweepResponse> {
  const response = await fetch(`${API_BASE_URL}/api/mechanisms/fourbar/sweep`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error(`Backend returned ${response.status}`);

  return (await response.json()) as FourBarSweepResponse;
}
