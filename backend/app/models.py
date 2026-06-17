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


class VelocityAnalysis(BaseModel):
    omega2: float
    omega3: float | None
    omega4: float | None
    velocity_B: Coordinate | None
    velocity_C: Coordinate | None


class AccelerationAnalysis(BaseModel):
    alpha2: float
    alpha3: float | None
    alpha4: float | None
    acceleration_B: Coordinate | None
    acceleration_C: Coordinate | None


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
    velocity_analysis: VelocityAnalysis
    acceleration_analysis: AccelerationAnalysis
    notes: list[str]


class FourBarSweepRequest(BaseModel):
    l1: float = Field(..., description="Ground link length")
    l2: float = Field(..., description="Crank link length")
    l3: float = Field(..., description="Coupler link length")
    l4: float = Field(..., description="Rocker link length")
    theta2_start_deg: float = Field(..., description="Starting input crank angle in degrees")
    theta2_end_deg: float = Field(..., description="Ending input crank angle in degrees")
    theta2_step_deg: float = Field(..., description="Input crank angle step in degrees")
    omega2: float = Field(..., description="Input angular velocity")
    alpha2: float = Field(..., description="Input angular acceleration")


class FourBarSweepSample(BaseModel):
    theta2_deg: float
    valid: bool
    theta3_deg: float | None
    theta4_deg: float | None
    joint_coordinates: JointCoordinates
    velocity_analysis: VelocityAnalysis
    acceleration_analysis: AccelerationAnalysis
    notes: list[str]


class FourBarSweepResponse(BaseModel):
    mechanism: Literal["four_bar_linkage"]
    sample_count: int
    valid_sample_count: int
    invalid_sample_count: int
    grashof_status: str
    classification: str
    mobility: int
    samples: list[FourBarSweepSample]
    notes: list[str]
