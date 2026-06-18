import type { AgentWorkflowRequest, AgentWorkflowResponse, FourBarAnalysisResult, FourBarForm, FourBarSweepRequest, FourBarSweepResponse, ReportRequest, ReportResponse, SliderCrankAnalysisResult, SliderCrankForm, SliderCrankSweepRequest, SliderCrankSweepResponse, SynthesisRequest, SynthesisResponse } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

async function raiseApiError(response: Response, context: string): Promise<never> {
  let detail = "";
  try {
    const body = await response.json();
    detail = typeof body?.detail === "string" ? body.detail : typeof body?.error === "string" ? body.error : "";
  } catch {
    detail = "";
  }
  const category = response.status === 400 || response.status === 422
    ? "Bad parameters or solver validation error"
    : response.status >= 500
      ? "API/deployment unavailable"
      : "Solver API request failed";
  throw new Error(`${category}: ${context} returned ${response.status}${detail ? ` — ${detail}` : ""}`);
}

export async function analyzeFourBar(form: FourBarForm): Promise<FourBarAnalysisResult> {
  const response = await fetch(`${API_BASE_URL}/api/mechanisms/fourbar/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });

  if (!response.ok) await raiseApiError(response, "Four-bar analysis");

  return (await response.json()) as FourBarAnalysisResult;
}

export async function sweepFourBar(payload: FourBarSweepRequest): Promise<FourBarSweepResponse> {
  const response = await fetch(`${API_BASE_URL}/api/mechanisms/fourbar/sweep`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) await raiseApiError(response, "Four-bar sweep");

  return (await response.json()) as FourBarSweepResponse;
}

export async function analyzeSliderCrank(form: SliderCrankForm): Promise<SliderCrankAnalysisResult> {
  const response = await fetch(`${API_BASE_URL}/api/mechanisms/slider-crank/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });

  if (!response.ok) await raiseApiError(response, "Slider-crank analysis");

  return (await response.json()) as SliderCrankAnalysisResult;
}


export async function sweepSliderCrank(payload: SliderCrankSweepRequest): Promise<SliderCrankSweepResponse> {
  const response = await fetch(`${API_BASE_URL}/api/mechanisms/slider-crank/sweep`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) await raiseApiError(response, "Slider-crank sweep");

  return (await response.json()) as SliderCrankSweepResponse;
}


export async function runMechanismAgentWorkflow(payload: AgentWorkflowRequest): Promise<AgentWorkflowResponse> {
  const response = await fetch(`${API_BASE_URL}/api/agents/mechanism-workflow`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) await raiseApiError(response, "Agent workflow");

  return (await response.json()) as AgentWorkflowResponse;
}


export async function generateMechanismReport(payload: ReportRequest): Promise<ReportResponse> {
  const response = await fetch(`${API_BASE_URL}/api/reports/mechanism`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) await raiseApiError(response, "Report generation");

  return (await response.json()) as ReportResponse;
}


export async function generateSynthesisRecommendations(payload: SynthesisRequest): Promise<SynthesisResponse> {
  const response = await fetch(`${API_BASE_URL}/api/synthesis/recommendations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) await raiseApiError(response, "Synthesis recommendations");

  return (await response.json()) as SynthesisResponse;
}
