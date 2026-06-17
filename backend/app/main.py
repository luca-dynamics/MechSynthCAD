from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.agents import AgentWorkflowRequest, AgentWorkflowResponse, run_agent_workflow
from app.models import (
    FourBarAnalyzeRequest,
    FourBarAnalyzeResponse,
    FourBarSweepRequest,
    FourBarSweepResponse,
    SliderCrankAnalyzeRequest,
    SliderCrankAnalyzeResponse,
)
from app.solvers.fourbar import analyze_four_bar, analyze_four_bar_sweep
from app.solvers.slider_crank import analyze_slider_crank

app = FastAPI(
    title="MechSynthCAD API",
    description="Backend API scaffold for CAD-based planar mechanism analysis.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

@app.post("/api/mechanisms/fourbar/analyze", response_model=FourBarAnalyzeResponse)
def analyze_four_bar_endpoint(request: FourBarAnalyzeRequest) -> FourBarAnalyzeResponse:
    return analyze_four_bar(request)

@app.post("/api/mechanisms/fourbar/sweep", response_model=FourBarSweepResponse)
def analyze_four_bar_sweep_endpoint(request: FourBarSweepRequest) -> FourBarSweepResponse:
    return analyze_four_bar_sweep(request)

@app.post("/api/mechanisms/slider-crank/analyze", response_model=SliderCrankAnalyzeResponse)
def analyze_slider_crank_endpoint(request: SliderCrankAnalyzeRequest) -> SliderCrankAnalyzeResponse:
    return analyze_slider_crank(request)


@app.post("/api/agents/mechanism-workflow", response_model=AgentWorkflowResponse)
def run_mechanism_agent_workflow_endpoint(request: AgentWorkflowRequest) -> AgentWorkflowResponse:
    return run_agent_workflow(request)
