from typing import Literal

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


class FourBarAnalyzeRequest(BaseModel):
    l1: float = Field(..., gt=0, description="Ground link length")
    l2: float = Field(..., gt=0, description="Crank link length")
    l3: float = Field(..., gt=0, description="Coupler link length")
    l4: float = Field(..., gt=0, description="Rocker link length")
    theta2_deg: float = Field(..., description="Input crank angle in degrees")
    omega2: float = Field(..., description="Input angular velocity")
    alpha2: float = Field(..., description="Input angular acceleration")


class JointCoordinates(BaseModel):
    A: tuple[float, float]
    B: tuple[float, float]
    C: tuple[float, float]
    D: tuple[float, float]


class FourBarAnalyzeResponse(BaseModel):
    mechanism: Literal["four_bar_linkage"]
    grashof_status: str
    mobility: int
    theta3_deg: float
    theta4_deg: float
    joint_coordinates: JointCoordinates
    notes: list[str]


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
def analyze_four_bar(_: FourBarAnalyzeRequest) -> FourBarAnalyzeResponse:
    return FourBarAnalyzeResponse(
        mechanism="four_bar_linkage",
        grashof_status="placeholder",
        mobility=1,
        theta3_deg=0,
        theta4_deg=0,
        joint_coordinates=JointCoordinates(
            A=(0, 0),
            B=(0, 0),
            C=(0, 0),
            D=(0, 0),
        ),
        notes=[
            "This is a scaffold response. The deterministic kinematic solver will be implemented in a later PR."
        ],
    )
