from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models import FourBarAnalyzeRequest, FourBarAnalyzeResponse
from app.solvers.fourbar import analyze_four_bar as solve_four_bar

app = FastAPI(
    title="MechSynthCAD API",
    description="Backend API for CAD-based deterministic planar mechanism analysis.",
    version="0.2.0",
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
def analyze_four_bar(request: FourBarAnalyzeRequest) -> FourBarAnalyzeResponse:
    return solve_four_bar(request)
