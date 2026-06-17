import math

from fastapi.testclient import TestClient

from app.main import app
from app.models import SliderCrankAnalyzeRequest, SliderCrankSweepRequest
from app.solvers.slider_crank import analyze_slider_crank, analyze_slider_crank_sweep


def test_valid_slider_crank_returns_coordinates_and_kinematics():
    result = analyze_slider_crank(
        SliderCrankAnalyzeRequest(crank_radius=30, connecting_rod_length=100, theta_deg=30, omega=12, alpha=3, offset=0)
    )

    assert result.valid is True
    assert result.slider_position is not None
    assert result.joint_coordinates.O == (0.0, 0.0)
    assert result.joint_coordinates.A[0] == pytest_approx(30 * math.cos(math.radians(30)))
    assert result.joint_coordinates.A[1] == pytest_approx(15.0)
    assert result.joint_coordinates.B[1] == pytest_approx(0.0)
    assert result.velocity_analysis.velocity_A is not None
    assert result.velocity_analysis.velocity_B is not None
    assert result.velocity_analysis.slider_velocity is not None
    assert result.acceleration_analysis.acceleration_A is not None
    assert result.acceleration_analysis.acceleration_B is not None
    assert result.acceleration_analysis.slider_acceleration is not None


def test_invalid_slider_crank_geometry_returns_null_position():
    result = analyze_slider_crank(
        SliderCrankAnalyzeRequest(crank_radius=50, connecting_rod_length=10, theta_deg=90, omega=1, alpha=0, offset=0)
    )

    assert result.valid is False
    assert result.slider_position is None
    assert result.velocity_analysis.velocity_A is None
    assert result.acceleration_analysis.acceleration_A is None


def test_slider_crank_api_endpoint_works():
    client = TestClient(app)
    response = client.post(
        "/api/mechanisms/slider-crank/analyze",
        json={"crank_radius": 30, "connecting_rod_length": 100, "theta_deg": 30, "omega": 12, "alpha": 3, "offset": 0},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["mechanism"] == "slider_crank"
    assert payload["valid"] is True
    assert payload["slider_position"] is not None
    assert payload["velocity_analysis"]["velocity_A"] is not None
    assert payload["acceleration_analysis"]["acceleration_B"] is not None


def pytest_approx(value):
    import pytest

    return pytest.approx(value, abs=1e-8)


def test_valid_slider_crank_sweep_returns_deterministic_samples():
    result = analyze_slider_crank_sweep(SliderCrankSweepRequest(crank_radius=30, connecting_rod_length=100, theta_start_deg=0, theta_end_deg=30, theta_step_deg=15, omega=12, alpha=3, offset=0))

    assert result.mechanism == "slider_crank"
    assert [sample.theta_deg for sample in result.samples] == [0, 15, 30]
    assert result.sample_count == 3
    assert result.valid_sample_count == 3
    assert result.invalid_sample_count == 0
    assert all(sample.slider_position is not None for sample in result.samples)
    assert all(sample.velocity_analysis is not None for sample in result.samples)
    assert all(sample.acceleration_analysis is not None for sample in result.samples)


def test_slider_crank_decreasing_sweep_normalizes_step_sign():
    result = analyze_slider_crank_sweep(SliderCrankSweepRequest(crank_radius=30, connecting_rod_length=100, theta_start_deg=30, theta_end_deg=0, theta_step_deg=15, omega=12, alpha=3, offset=0))

    assert [sample.theta_deg for sample in result.samples] == [30, 15, 0]
    assert result.sample_count == 3


def test_slider_crank_zero_step_returns_safe_response():
    result = analyze_slider_crank_sweep(SliderCrankSweepRequest(crank_radius=30, connecting_rod_length=100, theta_start_deg=0, theta_end_deg=30, theta_step_deg=0, omega=12, alpha=3, offset=0))

    assert result.sample_count == 0
    assert result.valid_sample_count == 0
    assert result.invalid_sample_count == 0
    assert "theta_step_deg must be nonzero" in result.notes[0]


def test_slider_crank_sweep_api_endpoint_works():
    client = TestClient(app)
    response = client.post("/api/mechanisms/slider-crank/sweep", json={"crank_radius": 30, "connecting_rod_length": 100, "theta_start_deg": 0, "theta_end_deg": 30, "theta_step_deg": 15, "omega": 12, "alpha": 3, "offset": 0})

    assert response.status_code == 200
    payload = response.json()
    assert payload["mechanism"] == "slider_crank"
    assert payload["sample_count"] == 3
    assert payload["valid_sample_count"] == 3
    assert payload["invalid_sample_count"] == 0
    assert payload["samples"][0]["slider_position"] is not None
    assert payload["samples"][0]["velocity_analysis"]["slider_velocity"] is not None
    assert payload["samples"][0]["acceleration_analysis"]["slider_acceleration"] is not None
