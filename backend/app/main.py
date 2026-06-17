from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models import FourBarAnalyzeRequest, FourBarAnalyzeResponse
from app.solvers.fourbar import analyze_four_bar


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
