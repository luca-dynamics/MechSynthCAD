from typing import Any, Literal
from uuid import uuid4

from pydantic import BaseModel, Field

MechanismRequestType = Literal["four_bar", "slider_crank", "auto"]
SelectedMechanismType = Literal["four_bar", "slider_crank", "unknown"]
StepStatus = Literal["pending", "completed", "blocked"]


class AgentWorkflowRequest(BaseModel):
    user_goal: str
    mechanism_type: MechanismRequestType = "auto"
    available_context: dict[str, Any] | None = None
    solver_result: dict[str, Any] | None = None


class AgentWorkflowStep(BaseModel):
    step_id: str
    agent_role: str
    action: str
    status: StepStatus
    summary: str


class AgentWorkflowResponse(BaseModel):
    workflow_id: str = Field(default_factory=lambda: f"workflow-{uuid4().hex[:12]}")
    interpreted_goal: str
    selected_mechanism: SelectedMechanismType
    required_inputs: list[str]
    missing_inputs: list[str]
    validation_notes: list[str]
    solver_tool_plan: list[str]
    workflow_steps: list[AgentWorkflowStep]
    design_recommendations: list[str]
    report_ready_summary: str
    safety_notes: list[str]
