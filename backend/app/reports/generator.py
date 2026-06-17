from typing import Any

from app.reports.schemas import ReportRequest, ReportResponse, ReportSection

FOUR_BAR_FIELDS = ["l1", "l2", "l3", "l4", "theta2_deg", "omega2", "alpha2"]
FOUR_BAR_RESULT_FIELDS = ["valid", "grashof_status", "classification", "theta3_deg", "theta4_deg"]
SLIDER_CRANK_FIELDS = ["crank_radius", "connecting_rod_length", "theta_deg", "omega", "alpha", "offset"]
SLIDER_CRANK_RESULT_FIELDS = ["valid", "slider_position", "transmission_angle_deg"]


def _value(source: dict[str, Any] | None, key: str) -> Any:
    if not source or key not in source or source[key] is None:
        return "N/A"
    return source[key]


def _bullet(label: str, value: Any) -> str:
    return f"{label}: {value if value is not None else 'N/A'}"


def _section(heading: str, content: str, bullets: list[str] | None = None) -> ReportSection:
    return ReportSection(heading=heading, content=content, bullets=bullets or [])


def _analysis_bullets(result: dict[str, Any] | None, key: str) -> list[str]:
    analysis = result.get(key) if result else None
    if not isinstance(analysis, dict):
        return ["No deterministic solver values supplied for this analysis block."]
    return [_bullet(name, value) for name, value in analysis.items()]


def _joint_bullets(result: dict[str, Any] | None) -> list[str]:
    joints = result.get("joint_coordinates") if result else None
    if not isinstance(joints, dict):
        return ["Joint coordinates: N/A"]
    return [_bullet(f"Joint {name}", value) for name, value in joints.items()]


def _workflow_bullets(workflow: dict[str, Any]) -> list[str]:
    bullets: list[str] = []
    for key in ["interpreted_goal", "report_ready_summary"]:
        if workflow.get(key) is not None:
            bullets.append(_bullet(key.replace("_", " ").title(), workflow[key]))
    for key in ["validation_notes", "design_recommendations", "safety_notes"]:
        values = workflow.get(key)
        if isinstance(values, list):
            bullets.extend(_bullet(key.replace("_", " ").title(), value) for value in values)
    return bullets or ["Agent workflow was supplied but did not contain report-ready summary fields."]


def _markdown(title: str, sections: list[ReportSection]) -> str:
    lines = [f"# {title}", ""]
    for section in sections:
        lines.extend([f"## {section.heading}", "", section.content, ""])
        for bullet in section.bullets:
            lines.append(f"- {bullet}")
        lines.append("")
    return "\n".join(lines).strip() + "\n"


def generate_mechanism_report(request: ReportRequest) -> ReportResponse:
    mechanism_label = "Four-Bar Linkage" if request.mechanism_type == "four_bar" else "Slider-Crank Mechanism"
    title = request.title or f"{mechanism_label} Engineering Report Preview"
    result = request.solver_result
    validation_notes = ["Deterministic solver outputs are the numerical source of truth for this report preview."]
    if result is None:
        validation_notes.append("Deterministic solver output has not yet been provided.")

    input_fields = FOUR_BAR_FIELDS if request.mechanism_type == "four_bar" else SLIDER_CRANK_FIELDS
    result_fields = FOUR_BAR_RESULT_FIELDS if request.mechanism_type == "four_bar" else SLIDER_CRANK_RESULT_FIELDS

    sections = [
        _section("Title", title),
        _section("Aim", f"Prepare an academic engineering preview report for the {mechanism_label.lower()} using supplied inputs, deterministic solver outputs, and optional workflow summaries."),
        _section("Input Parameters", "Input parameters supplied to the report generator.", [_bullet(field, _value(request.input_parameters, field)) for field in input_fields]),
        _section("Methodology", "The report compiles deterministic kinematic analysis outputs and optional agent workflow summaries. It does not perform new numerical synthesis or invent missing engineering values.", ["Use supplied input parameters for context.", "Use deterministic solver_result values when available.", "Mark missing or null values as N/A."]),
    ]

    if result is None:
        sections.append(_section("Deterministic Solver Result", "Deterministic solver output has not yet been provided.", ["valid: N/A"]))
    else:
        sections.append(_section("Deterministic Solver Result", "Reported values are copied from the deterministic solver output.", [_bullet(field, _value(result, field)) for field in result_fields]))

    position_fields = ["theta2_deg", "theta3_deg", "theta4_deg"] if request.mechanism_type == "four_bar" else ["theta_deg", "slider_position", "transmission_angle_deg"]
    sections.extend([
        _section("Position Analysis", "Position-level outputs available from the deterministic solver.", [_bullet(field, _value(result, field)) for field in position_fields] + _joint_bullets(result)),
        _section("Velocity Analysis", "Velocity-level outputs available from the deterministic solver.", _analysis_bullets(result, "velocity_analysis")),
        _section("Acceleration Analysis", "Acceleration-level outputs available from the deterministic solver.", _analysis_bullets(result, "acceleration_analysis")),
    ])

    if request.sweep_result is not None:
        sweep = request.sweep_result
        sections.append(_section("Sweep / Simulation Summary", "Sweep or simulation data was supplied for report context.", [_bullet(field, _value(sweep, field)) for field in ["sample_count", "valid_sample_count", "invalid_sample_count", "grashof_status", "classification"]]))
    if request.agent_workflow is not None:
        sections.append(_section("Agentic Engineering Workflow Summary", "Agent workflow summary supplied for engineering interpretation; numerical values still originate from deterministic solvers.", _workflow_bullets(request.agent_workflow)))

    recommendations = []
    if request.agent_workflow and isinstance(request.agent_workflow.get("design_recommendations"), list):
        recommendations = [str(item) for item in request.agent_workflow["design_recommendations"]]
    if not recommendations:
        recommendations = ["Review N/A values and run deterministic analysis before design acceptance."] if result is None or result.get("valid") is not True else ["Proceed with preliminary engineering review while retaining independent verification."]
    sections.append(_section("Design Recommendations", "Design recommendations are based on supplied solver validity and optional agent workflow summaries.", recommendations))

    valid = result.get("valid") if result else None
    conclusion = "The deterministic solver output has not yet been provided, so the mechanism cannot be accepted from this report preview alone."
    if valid is False:
        conclusion = "The mechanism configuration requires design iteration before acceptance."
    elif valid is True:
        conclusion = "The mechanism configuration is suitable for preliminary analysis, subject to engineering verification."
    sections.append(_section("Conclusion", conclusion))
    sections.append(_section("Validation and Safety Notes", "This preview is not a substitute for independent engineering verification or safety review.", validation_notes + ["No PDF, markdown download, or file export is generated in this preview."]))

    return ReportResponse(title=title, mechanism_type=request.mechanism_type, sections=sections, markdown=_markdown(title, sections), validation_notes=validation_notes)
