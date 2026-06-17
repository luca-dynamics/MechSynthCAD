from fastapi.testclient import TestClient

from app.main import app
from app.synthesis import SynthesisRequest, generate_synthesis_recommendations

FOUR_BAR_INPUT = {"l1": 120, "l2": 35, "l3": 90, "l4": 80, "theta2_deg": 30, "omega2": 10, "alpha2": 0}
FOUR_BAR_RESULT = {"valid": True, "theta3_deg": 40.0, "theta4_deg": 80.0, "velocity_analysis": {}, "acceleration_analysis": {}}
SLIDER_INPUT = {"crank_radius": 30, "connecting_rod_length": 100, "theta_deg": 30, "omega": 10, "alpha": 0, "offset": 0}
SLIDER_RESULT = {"valid": True, "slider_position": 120.0, "transmission_angle_deg": 75.0, "velocity_analysis": {"slider_velocity": 20.0}, "acceleration_analysis": {"slider_acceleration": 5.0}}


def test_missing_solver_result_returns_run_analysis_first_safety_response():
    response = generate_synthesis_recommendations(SynthesisRequest(mechanism_type="four_bar", input_parameters=FOUR_BAR_INPUT, targets=[]))
    assert any("Run deterministic analysis" in gap for gap in response.target_gaps)
    assert response.recommendations[0].parameter == "deterministic solver"


def test_invalid_solver_result_returns_geometry_correction_recommendation():
    response = generate_synthesis_recommendations(SynthesisRequest(mechanism_type="four_bar", input_parameters=FOUR_BAR_INPUT, solver_result={"valid": False}, targets=[]))
    assert any("geometry" in rec.parameter for rec in response.recommendations)
    assert any("invalid" in observation for observation in response.current_observations)


def test_four_bar_target_theta4_deg_produces_gap_and_recommendation():
    response = generate_synthesis_recommendations(SynthesisRequest(mechanism_type="four_bar", input_parameters=FOUR_BAR_INPUT, solver_result=FOUR_BAR_RESULT, targets=[{"metric": "theta4_deg", "target_value": 90, "direction": "increase"}]))
    assert any("gap target-current = 10" in gap for gap in response.target_gaps)
    assert any("l2/l3/l4" in rec.parameter for rec in response.recommendations)


def test_slider_crank_target_slider_position_produces_gap_and_recommendation():
    response = generate_synthesis_recommendations(SynthesisRequest(mechanism_type="slider_crank", input_parameters=SLIDER_INPUT, solver_result=SLIDER_RESULT, targets=[{"metric": "slider_position", "target_value": 130, "direction": "increase"}]))
    assert any("target-current = 10" in gap for gap in response.target_gaps)
    assert any("crank_radius" in rec.parameter for rec in response.recommendations)


def test_nested_metric_extraction_works_for_slider_velocity():
    response = generate_synthesis_recommendations(SynthesisRequest(mechanism_type="slider_crank", input_parameters=SLIDER_INPUT, solver_result=SLIDER_RESULT, targets=[{"metric": "slider_velocity", "target_value": 25, "direction": "increase"}]))
    assert any("slider_velocity current deterministic value: 20" in observation for observation in response.current_observations)
    assert any("target-current = 5" in gap for gap in response.target_gaps)


def test_sweep_result_valid_invalid_sample_counts_are_recognized():
    response = generate_synthesis_recommendations(SynthesisRequest(mechanism_type="four_bar", input_parameters=FOUR_BAR_INPUT, solver_result=FOUR_BAR_RESULT, sweep_result={"valid_sample_count": 7, "invalid_sample_count": 2}, targets=[{"metric": "invalid_sample_count", "target_value": 0, "direction": "minimize"}]))
    assert any("valid_sample_count from supplied sweep_result: 7" in observation for observation in response.current_observations)
    assert any("invalid_sample_count from supplied sweep_result: 2" in observation for observation in response.current_observations)


def test_endpoint_synthesis_recommendations_works():
    response = TestClient(app).post("/api/synthesis/recommendations", json={"mechanism_type": "slider_crank", "input_parameters": SLIDER_INPUT, "solver_result": SLIDER_RESULT, "targets": [{"metric": "slider_position", "target_value": 130, "direction": "increase"}]})
    assert response.status_code == 200
    assert response.json()["mechanism_type"] == "slider_crank"


def test_recommendations_do_not_contain_exact_invented_final_dimensions():
    response = generate_synthesis_recommendations(SynthesisRequest(mechanism_type="slider_crank", input_parameters=SLIDER_INPUT, solver_result=SLIDER_RESULT, targets=[{"metric": "slider_position", "target_value": 130, "direction": "increase"}]))
    text = " ".join(rec.reason for rec in response.recommendations).lower()
    assert "set " not in text
    assert "final dimensions" not in text or "no final dimensions" in text
