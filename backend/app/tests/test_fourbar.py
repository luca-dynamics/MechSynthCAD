import math

from fastapi.testclient import TestClient

from app.main import app
from app.models import FourBarAnalyzeRequest
from app.solvers.fourbar import analyze_four_bar, classify_grashof, four_bar_mobility


def valid_payload() -> dict[str, float]:
    return {
        "l1": 120,
        "l2": 35,
        "l3": 90,
        "l4": 80,
        "theta2_deg": 30,
        "omega2": 10,
        "alpha2": 0,
    }


def test_grashof_check():
    assert classify_grashof([120, 35, 90, 80]) == "grashof"
    assert classify_grashof([100, 40, 70, 70]) == "change_point"
    assert classify_grashof([100, 90, 80, 70]) == "non_grashof"


def test_mobility_equals_one():
    assert four_bar_mobility() == 1


def test_valid_four_bar_geometry_returns_c_coordinate():
    response = analyze_four_bar(FourBarAnalyzeRequest(**valid_payload()))

    assert response.valid is True
    assert response.mobility == 1
    assert response.joint_coordinates.C is not None
    assert response.theta3_deg is not None
    assert response.theta4_deg is not None


def test_valid_analysis_returns_velocity_terms():
    response = analyze_four_bar(FourBarAnalyzeRequest(**valid_payload()))

    assert response.velocity_analysis.omega3 is not None
    assert response.velocity_analysis.omega4 is not None
    assert response.velocity_analysis.velocity_B is not None
    assert response.velocity_analysis.velocity_C is not None
    assert math.isclose(response.velocity_analysis.velocity_B[0], -175.0, abs_tol=1e-7)
    assert math.isclose(response.velocity_analysis.velocity_B[1], 303.1088913246, abs_tol=1e-7)


def test_valid_analysis_returns_acceleration_terms():
    response = analyze_four_bar(FourBarAnalyzeRequest(**valid_payload()))

    assert response.acceleration_analysis.alpha3 is not None
    assert response.acceleration_analysis.alpha4 is not None
    assert response.acceleration_analysis.acceleration_B is not None
    assert response.acceleration_analysis.acceleration_C is not None
    assert math.isclose(response.acceleration_analysis.acceleration_B[0], -3031.0889132455, abs_tol=1e-7)
    assert math.isclose(response.acceleration_analysis.acceleration_B[1], -1750.0, abs_tol=1e-7)


def test_invalid_geometry_returns_null_velocity_and_acceleration_outputs():
    payload = valid_payload()
    payload.update({"l1": 300, "l2": 10, "l3": 20, "l4": 30})

    response = analyze_four_bar(FourBarAnalyzeRequest(**payload))

    assert response.velocity_analysis.omega3 is None
    assert response.velocity_analysis.omega4 is None
    assert response.velocity_analysis.velocity_B is None
    assert response.velocity_analysis.velocity_C is None
    assert response.acceleration_analysis.alpha3 is None
    assert response.acceleration_analysis.alpha4 is None
    assert response.acceleration_analysis.acceleration_B is None
    assert response.acceleration_analysis.acceleration_C is None


def test_invalid_impossible_geometry_returns_failed_analysis_with_notes():
    payload = valid_payload()
    payload.update({"l1": 300, "l2": 10, "l3": 20, "l4": 30})

    response = analyze_four_bar(FourBarAnalyzeRequest(**payload))

    assert response.valid is False
    assert response.joint_coordinates.C is None
    assert any("do not intersect" in note for note in response.notes)


def test_health_endpoint():
    client = TestClient(app)

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_analyze_endpoint():
    client = TestClient(app)

    response = client.post("/api/mechanisms/fourbar/analyze", json=valid_payload())

    assert response.status_code == 200
    data = response.json()
    assert data["mechanism"] == "four_bar_linkage"
    assert data["valid"] is True
    assert data["joint_coordinates"]["C"] is not None
    assert data["velocity_analysis"]["omega3"] is not None
    assert data["acceleration_analysis"]["alpha3"] is not None


def sweep_payload() -> dict[str, float]:
    payload = valid_payload()
    payload.pop("theta2_deg")
    payload.update({
        "theta2_start_deg": 0,
        "theta2_end_deg": 90,
        "theta2_step_deg": 30,
    })
    return payload


def test_sweep_returns_multiple_samples_and_counts_match():
    from app.models import FourBarSweepRequest
    from app.solvers.fourbar import analyze_four_bar_sweep

    response = analyze_four_bar_sweep(FourBarSweepRequest(**sweep_payload()))

    assert response.sample_count == 4
    assert len(response.samples) == 4
    assert response.valid_sample_count + response.invalid_sample_count == response.sample_count
    assert all(sample.velocity_analysis is not None for sample in response.samples)
    assert all(sample.acceleration_analysis is not None for sample in response.samples)


def test_decreasing_sweep_range_works():
    from app.models import FourBarSweepRequest
    from app.solvers.fourbar import analyze_four_bar_sweep

    payload = sweep_payload()
    payload.update({"theta2_start_deg": 90, "theta2_end_deg": 0, "theta2_step_deg": 30})

    response = analyze_four_bar_sweep(FourBarSweepRequest(**payload))

    assert [sample.theta2_deg for sample in response.samples] == [90, 60, 30, 0]


def test_zero_sweep_step_returns_safe_invalid_response():
    from app.models import FourBarSweepRequest
    from app.solvers.fourbar import analyze_four_bar_sweep

    payload = sweep_payload()
    payload["theta2_step_deg"] = 0

    response = analyze_four_bar_sweep(FourBarSweepRequest(**payload))

    assert response.sample_count == 0
    assert response.samples == []
    assert any("nonzero" in note for note in response.notes)


def test_sweep_sample_limit_is_enforced():
    from app.models import FourBarSweepRequest
    from app.solvers.fourbar import analyze_four_bar_sweep

    payload = sweep_payload()
    payload.update({"theta2_start_deg": 0, "theta2_end_deg": 1000, "theta2_step_deg": 1})

    response = analyze_four_bar_sweep(FourBarSweepRequest(**payload))

    assert response.sample_count == 0
    assert any("maximum supported sample count" in note for note in response.notes)


def test_sweep_endpoint():
    client = TestClient(app)

    response = client.post("/api/mechanisms/fourbar/sweep", json=sweep_payload())

    assert response.status_code == 200
    data = response.json()
    assert data["mechanism"] == "four_bar_linkage"
    assert data["sample_count"] == 4
    assert data["valid_sample_count"] + data["invalid_sample_count"] == data["sample_count"]
    assert "velocity_analysis" in data["samples"][0]
    assert "acceleration_analysis" in data["samples"][0]
