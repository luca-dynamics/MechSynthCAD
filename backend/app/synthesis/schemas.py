from typing import Any, Literal

from pydantic import BaseModel, Field

SynthesisMechanismType = Literal["four_bar", "slider_crank"]
SynthesisDirection = Literal["increase", "decrease", "match", "minimize", "maximize"]
SynthesisSuggestedDirection = Literal["increase", "decrease", "hold", "review"]
SynthesisConfidence = Literal["low", "medium", "high"]


class SynthesisTarget(BaseModel):
    metric: str
    target_value: float | None = None
    direction: SynthesisDirection
    tolerance: float | None = None
    description: str | None = None


class SynthesisRequest(BaseModel):
    mechanism_type: SynthesisMechanismType
    input_parameters: dict[str, Any] = Field(default_factory=dict)
    solver_result: dict[str, Any] | None = None
    sweep_result: dict[str, Any] | None = None
    targets: list[SynthesisTarget] = Field(default_factory=list)


class SynthesisRecommendation(BaseModel):
    parameter: str
    suggested_direction: SynthesisSuggestedDirection
    reason: str
    confidence: SynthesisConfidence
    requires_solver_rerun: bool = True


class SynthesisResponse(BaseModel):
    mechanism_type: SynthesisMechanismType
    interpreted_targets: list[str]
    current_observations: list[str]
    target_gaps: list[str]
    recommendations: list[SynthesisRecommendation]
    next_solver_actions: list[str]
    safety_notes: list[str]
