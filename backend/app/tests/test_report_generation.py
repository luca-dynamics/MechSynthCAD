from fastapi.testclient import TestClient

from app.main import app
from app.reports import ReportRequest, generate_mechanism_report

FOUR_BAR_INPUT = {"l1": 120, "l2": 35, "l3": 90, "l4": 80, "theta2_deg": 30, "omega2": 10, "alpha2": 0}
FOUR_BAR_RESULT = {"valid": True, "grashof_status": "Grashof", "classification": "crank-rocker", "theta2_deg": 30, "theta3_deg": 40, "theta4_deg": 80, "velocity_analysis": {"omega2": 10, "omega3": 2, "omega4": 3}, "acceleration_analysis": {"alpha2": 0, "alpha3": 1, "alpha4": 2}, "joint_coordinates": {"A": [0, 0], "B": [1, 1], "C": [2, 1], "D": [3, 0]}}
SLIDER_INPUT = {"crank_radius": 30, "connecting_rod_length": 100, "theta_deg": 30, "omega": 10, "alpha": 0, "offset": 0}
SLIDER_RESULT = {"valid": True, "theta_deg": 30, "crank_radius": 30, "connecting_rod_length": 100, "offset": 0, "slider_position": 120, "transmission_angle_deg": 75, "velocity_analysis": {"omega": 10, "slider_velocity": 20}, "acceleration_analysis": {"alpha": 0, "slider_acceleration": 5}, "joint_coordinates": {"O": [0, 0], "A": [1, 1], "B": [2, 0]}}


def headings(report):
    return [section.heading for section in report.sections]


def test_four_bar_report_with_valid_solver_result_creates_sections():
    report = generate_mechanism_report(ReportRequest(mechanism_type="four_bar", input_parameters=FOUR_BAR_INPUT, solver_result=FOUR_BAR_RESULT))
    assert "Position Analysis" in headings(report)
    assert "Velocity Analysis" in headings(report)
    assert "Acceleration Analysis" in headings(report)
    assert report.mechanism_type == "four_bar"


def test_slider_crank_report_with_valid_solver_result_creates_sections():
    report = generate_mechanism_report(ReportRequest(mechanism_type="slider_crank", input_parameters=SLIDER_INPUT, solver_result=SLIDER_RESULT))
    assert "Deterministic Solver Result" in headings(report)
    assert any("slider_position: 120" in bullet for section in report.sections for bullet in section.bullets)


def test_missing_solver_result_produces_validation_note():
    report = generate_mechanism_report(ReportRequest(mechanism_type="four_bar", input_parameters=FOUR_BAR_INPUT))
    assert "Deterministic solver output has not yet been provided." in report.validation_notes


def test_invalid_solver_result_changes_conclusion_appropriately():
    report = generate_mechanism_report(ReportRequest(mechanism_type="four_bar", input_parameters=FOUR_BAR_INPUT, solver_result={**FOUR_BAR_RESULT, "valid": False}))
    conclusion = next(section for section in report.sections if section.heading == "Conclusion")
    assert "requires design iteration before acceptance" in conclusion.content


def test_supplied_sweep_result_adds_sweep_simulation_section():
    report = generate_mechanism_report(ReportRequest(mechanism_type="four_bar", input_parameters=FOUR_BAR_INPUT, solver_result=FOUR_BAR_RESULT, sweep_result={"sample_count": 3, "valid_sample_count": 3, "invalid_sample_count": 0}))
    assert "Sweep / Simulation Summary" in headings(report)


def test_supplied_agent_workflow_adds_agentic_workflow_section():
    report = generate_mechanism_report(ReportRequest(mechanism_type="slider_crank", input_parameters=SLIDER_INPUT, solver_result=SLIDER_RESULT, agent_workflow={"report_ready_summary": "Ready", "design_recommendations": ["Verify bearing loads"]}))
    assert "Agentic Engineering Workflow Summary" in headings(report)


def test_markdown_contains_expected_headings():
    report = generate_mechanism_report(ReportRequest(mechanism_type="four_bar", input_parameters=FOUR_BAR_INPUT, solver_result=FOUR_BAR_RESULT))
    assert "# Four-Bar Linkage Engineering Report Preview" in report.markdown
    assert "## Validation and Safety Notes" in report.markdown


def test_report_endpoint_works():
    response = TestClient(app).post("/api/reports/mechanism", json={"mechanism_type": "four_bar", "input_parameters": FOUR_BAR_INPUT, "solver_result": FOUR_BAR_RESULT})
    assert response.status_code == 200
    assert response.json()["mechanism_type"] == "four_bar"
