from fastapi.testclient import TestClient

from app.agents.orchestrator import run_agent_workflow
from app.agents.schemas import AgentWorkflowRequest
from app.main import app


def four_bar_context():
    return {"l1": 120, "l2": 35, "l3": 90, "l4": 80, "theta2_deg": 30, "omega2": 10, "alpha2": 0}


def test_four_bar_goal_returns_four_bar():
    response = run_agent_workflow(AgentWorkflowRequest(user_goal="Analyze a four-bar rocker", mechanism_type="four_bar", available_context=four_bar_context()))
    assert response.selected_mechanism == "four_bar"


def test_slider_crank_goal_returns_slider_crank():
    response = run_agent_workflow(AgentWorkflowRequest(user_goal="Analyze slider-crank piston motion", mechanism_type="slider_crank", available_context={"crank_radius": 30, "connecting_rod_length": 100, "theta_deg": 30, "omega": 10, "alpha": 0}))
    assert response.selected_mechanism == "slider_crank"


def test_auto_mechanism_selection_works_from_keywords():
    response = run_agent_workflow(AgentWorkflowRequest(user_goal="Plan a slider stroke analysis", mechanism_type="auto"))
    assert response.selected_mechanism == "slider_crank"


def test_missing_required_inputs_are_detected():
    response = run_agent_workflow(AgentWorkflowRequest(user_goal="Analyze four-bar", mechanism_type="four_bar", available_context={"l1": 100}))
    assert set(response.missing_inputs) == {"l2", "l3", "l4", "theta2_deg", "omega2", "alpha2"}


def test_solver_tool_plan_references_deterministic_tools():
    response = run_agent_workflow(AgentWorkflowRequest(user_goal="Sweep a four-bar graph", mechanism_type="four_bar", available_context=four_bar_context()))
    assert any("four_bar_analyze" in item and "deterministic solver" in item for item in response.solver_tool_plan)
    assert any("four_bar_sweep" in item for item in response.solver_tool_plan)


def test_valid_four_bar_solver_result_produces_interpretation_and_summary():
    response = run_agent_workflow(AgentWorkflowRequest(user_goal="Interpret results", mechanism_type="four_bar", available_context=four_bar_context(), solver_result={"mechanism": "four_bar_linkage", "valid": True, "theta2_deg": 30, "theta3_deg": 12, "theta4_deg": 45, "notes": []}))
    assert any("marked valid" in note for note in response.validation_notes)
    assert "valid" in response.report_ready_summary


def test_invalid_solver_result_produces_validation_and_design_notes():
    response = run_agent_workflow(AgentWorkflowRequest(user_goal="Fix geometry", mechanism_type="four_bar", available_context=four_bar_context(), solver_result={"mechanism": "four_bar_linkage", "valid": False, "notes": ["Link circles do not intersect"]}))
    assert any("marked invalid" in note for note in response.validation_notes)
    assert any("Revise geometry" in note for note in response.design_recommendations)


def test_agent_workflow_endpoint_works():
    client = TestClient(app)
    response = client.post("/api/agents/mechanism-workflow", json={"user_goal": "Analyze slider crank", "mechanism_type": "auto", "available_context": {"crank_radius": 30, "connecting_rod_length": 100, "theta_deg": 30, "omega": 10, "alpha": 0}})
    assert response.status_code == 200
    payload = response.json()
    assert payload["selected_mechanism"] == "slider_crank"
    assert payload["workflow_steps"][0]["agent_role"] == "Intent Agent"
