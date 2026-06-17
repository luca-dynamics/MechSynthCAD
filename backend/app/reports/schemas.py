from typing import Any, Literal

from pydantic import BaseModel, Field

ReportMechanismType = Literal["four_bar", "slider_crank"]


class ReportRequest(BaseModel):
    title: str | None = None
    mechanism_type: ReportMechanismType
    input_parameters: dict[str, Any]
    solver_result: dict[str, Any] | None = None
    sweep_result: dict[str, Any] | None = None
    agent_workflow: dict[str, Any] | None = None


class ReportSection(BaseModel):
    heading: str
    content: str
    bullets: list[str] = Field(default_factory=list)


class ReportResponse(BaseModel):
    title: str
    mechanism_type: ReportMechanismType
    sections: list[ReportSection]
    markdown: str
    validation_notes: list[str]
