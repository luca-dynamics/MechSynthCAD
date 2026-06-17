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
