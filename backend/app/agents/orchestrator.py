from app.agents.prompts import SYSTEM_BOUNDARY
from app.agents.schemas import AgentWorkflowRequest, AgentWorkflowResponse, AgentWorkflowStep, SelectedMechanismType
from app.agents.tool_registry import describe_tool
from app.agents.validators import REQUIRED_INPUTS, missing_required_inputs


def _select_mechanism(request: AgentWorkflowRequest) -> SelectedMechanismType:
    if request.mechanism_type != "auto":
        return request.mechanism_type
    goal = request.user_goal.lower()
    if any(term in goal for term in ["slider", "crank", "piston", "stroke", "reciprocating"]):
        return "slider_crank"
    if any(term in goal for term in ["four", "4-bar", "fourbar", "linkage", "rocker", "coupler", "grashof"]):
        return "four_bar"
    result_mechanism = (request.solver_result or {}).get("mechanism")
    if result_mechanism == "four_bar_linkage":
        return "four_bar"
    if result_mechanism == "slider_crank":
        return "slider_crank"
    return "unknown"


def _tool_plan(mechanism: SelectedMechanismType, goal: str) -> list[str]:
    goal_lower = goal.lower()
    if mechanism == "four_bar":
        tools = [describe_tool("four_bar_analyze")]
        if any(term in goal_lower for term in ["sweep", "simulate", "range", "graph", "animation"]):
            tools.append(describe_tool("four_bar_sweep"))
        return tools
    if mechanism == "slider_crank":
        return [describe_tool("slider_crank_analyze")]
    return ["Select a supported mechanism before invoking deterministic solver tools."]


def _interpret_solver_result(solver_result: dict | None) -> tuple[list[str], list[str], str]:
    if not solver_result:
        return (["No solver result supplied yet; workflow is limited to planning and input validation."], [], "No deterministic solver output has been supplied yet, so the report can only describe the intended workflow.")

    notes: list[str] = []
    recommendations: list[str] = []
    valid = solver_result.get("valid")
    mechanism = solver_result.get("mechanism", "unknown mechanism")
    if valid is True:
        notes.append(f"Provided deterministic {mechanism} solver result is marked valid.")
        important_keys = [key for key in ["theta2_deg", "theta3_deg", "theta4_deg", "theta_deg", "slider_position", "transmission_angle_deg", "classification", "grashof_status"] if key in solver_result and solver_result.get(key) is not None]
        if important_keys:
            notes.append("Important solver output fields available for interpretation: " + ", ".join(important_keys) + ".")
        recommendations.append("Use the deterministic solver output as the numerical baseline before changing dimensions or motion inputs.")
        summary = f"Deterministic solver output for {mechanism} is valid and ready to support engineering interpretation, CAD visualization, and report drafting."
    elif valid is False:
        notes.append(f"Provided deterministic {mechanism} solver result is marked invalid.")
        for note in solver_result.get("notes", []):
            notes.append(f"Solver note: {note}")
        recommendations.append("Revise geometry or motion inputs, then rerun the deterministic solver before accepting any design conclusion.")
        summary = f"Deterministic solver output for {mechanism} is invalid; the design requires iteration before report conclusions are finalized."
    else:
        notes.append("Solver result was supplied but does not include a boolean valid field.")
        recommendations.append("Confirm the payload came from a deterministic MechSynthCAD solver endpoint.")
        summary = "Solver output could not be fully classified because validity metadata is missing."
    return notes, recommendations, summary


def run_agent_workflow(request: AgentWorkflowRequest) -> AgentWorkflowResponse:
    mechanism = _select_mechanism(request)
    required_inputs = REQUIRED_INPUTS[mechanism]
    missing_inputs = missing_required_inputs(mechanism, request.available_context)
    validation_notes, design_recommendations, result_summary = _interpret_solver_result(request.solver_result)

    if mechanism == "unknown":
        validation_notes.append("Mechanism could not be inferred; choose four-bar or slider-crank to enable deterministic solver planning.")
    elif missing_inputs:
        validation_notes.append("Required deterministic solver inputs are missing: " + ", ".join(missing_inputs) + ".")
    else:
        validation_notes.append("Required deterministic solver inputs appear present in available_context.")

    if not design_recommendations:
        design_recommendations.append("Run the planned deterministic solver tool, then use its valid/invalid status and notes to guide design iteration.")

    solver_tool_plan = _tool_plan(mechanism, request.user_goal)
    steps = [
        AgentWorkflowStep(step_id="intent", agent_role="Intent Agent", action="Interpret mechanism design or analysis goal", status="completed", summary=f"Goal interpreted as: {request.user_goal.strip() or 'unspecified mechanism workflow'}."),
        AgentWorkflowStep(step_id="validation", agent_role="Parameter Validation Agent", action="Check required deterministic solver inputs", status="blocked" if missing_inputs or mechanism == "unknown" else "completed", summary="Missing inputs: " + ", ".join(missing_inputs) if missing_inputs else "Required inputs are available for the selected mechanism."),
        AgentWorkflowStep(step_id="solver-plan", agent_role="Solver Tool Agent", action="Plan deterministic solver endpoint usage", status="blocked" if mechanism == "unknown" else "completed", summary="; ".join(solver_tool_plan)),
        AgentWorkflowStep(step_id="result-interpretation", agent_role="Result Interpretation Agent", action="Interpret deterministic solver output if provided", status="completed" if request.solver_result else "pending", summary=result_summary),
        AgentWorkflowStep(step_id="design-recommendation", agent_role="Design Recommendation Agent", action="Suggest design iteration direction without calculating kinematics", status="completed", summary=" ".join(design_recommendations)),
        AgentWorkflowStep(step_id="report-drafting", agent_role="Report Drafting Agent", action="Draft report-ready summary from deterministic solver state", status="completed", summary=result_summary),
    ]

    return AgentWorkflowResponse(
        interpreted_goal=request.user_goal.strip() or "Plan a deterministic planar mechanism workflow.",
        selected_mechanism=mechanism,
        required_inputs=required_inputs,
        missing_inputs=missing_inputs,
        validation_notes=validation_notes,
        solver_tool_plan=solver_tool_plan,
        workflow_steps=steps,
        design_recommendations=design_recommendations,
        report_ready_summary=result_summary,
        safety_notes=[SYSTEM_BOUNDARY, "Numerical kinematic values must come from deterministic solver outputs, not from the agent workflow layer."],
    )
