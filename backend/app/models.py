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

class SliderCrankAnalyzeRequest(BaseModel):
    crank_radius: float = Field(..., description="Crank radius")
    connecting_rod_length: float = Field(..., description="Connecting rod length")
    theta_deg: float = Field(..., description="Input crank angle in degrees")
    omega: float = Field(..., description="Input angular velocity")
    alpha: float = Field(..., description="Input angular acceleration")
    offset: float = Field(0.0, description="Vertical slider-line offset")

class SliderCrankJointCoordinates(BaseModel):
    O: Coordinate
    A: Coordinate
    B: Coordinate

class SliderCrankVelocityAnalysis(BaseModel):
    omega: float
    velocity_A: Coordinate | None
    velocity_B: Coordinate | None
    slider_velocity: float | None

class SliderCrankAccelerationAnalysis(BaseModel):
    alpha: float
    acceleration_A: Coordinate | None
    acceleration_B: Coordinate | None
    slider_acceleration: float | None

class SliderCrankAnalyzeResponse(BaseModel):
    mechanism: Literal["slider_crank"]
    valid: bool
    theta_deg: float
    crank_radius: float
    connecting_rod_length: float
    offset: float
    slider_position: float | None
    transmission_angle_deg: float | None
    joint_coordinates: SliderCrankJointCoordinates
    velocity_analysis: SliderCrankVelocityAnalysis
    acceleration_analysis: SliderCrankAccelerationAnalysis
    notes: list[str]


class SliderCrankSweepRequest(BaseModel):
    crank_radius: float = Field(..., description="Crank radius")
    connecting_rod_length: float = Field(..., description="Connecting rod length")
    theta_start_deg: float = Field(..., description="Starting input crank angle in degrees")
    theta_end_deg: float = Field(..., description="Ending input crank angle in degrees")
    theta_step_deg: float = Field(..., description="Input crank angle step in degrees")
    omega: float = Field(..., description="Input angular velocity")
    alpha: float = Field(..., description="Input angular acceleration")
    offset: float = Field(0.0, description="Vertical slider-line offset")

class SliderCrankSweepSample(BaseModel):
    theta_deg: float
    valid: bool
    slider_position: float | None
    transmission_angle_deg: float | None
    joint_coordinates: SliderCrankJointCoordinates
    velocity_analysis: SliderCrankVelocityAnalysis
    acceleration_analysis: SliderCrankAccelerationAnalysis
    notes: list[str]

class SliderCrankSweepResponse(BaseModel):
    mechanism: Literal["slider_crank"]
    sample_count: int
    valid_sample_count: int
    invalid_sample_count: int
    samples: list[SliderCrankSweepSample]
    notes: list[str]
