from typing import Literal

from pydantic import BaseModel, Field


Coordinate = tuple[float, float]


class FourBarAnalyzeRequest(BaseModel):
    l1: float = Field(..., description="Ground link length")
    l2: float = Field(..., description="Crank link length")
    l3: float = Field(..., description="Coupler link length")
    l4: float = Field(..., description="Rocker link length")
    theta2_deg: float = Field(..., description="Input crank angle in degrees")
    omega2: float = Field(..., description="Input angular velocity")
    alpha2: float = Field(..., description="Input angular acceleration")


class JointCoordinates(BaseModel):
    A: Coordinate
    B: Coordinate
    C: Coordinate | None
    D: Coordinate


class FourBarAnalyzeResponse(BaseModel):
    mechanism: Literal["four_bar_linkage"]
    valid: bool
    grashof_status: str
    mobility: int
    classification: str
    theta2_deg: float
    theta3_deg: float | None
    theta4_deg: float | None
    joint_coordinates: JointCoordinates
    notes: list[str]
