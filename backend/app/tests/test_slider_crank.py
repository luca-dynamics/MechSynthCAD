import math

from fastapi.testclient import TestClient

from app.main import app
from app.models import SliderCrankAnalyzeRequest
from app.solvers.slider_crank import analyze_slider_crank


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
