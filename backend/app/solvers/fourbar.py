from __future__ import annotations

import math

from app.models import FourBarAnalyzeRequest, FourBarAnalyzeResponse, JointCoordinates

TOLERANCE = 1e-9
ANGLE_TOLERANCE = 1e-7


def classify_grashof(lengths: list[float], tolerance: float = TOLERANCE) -> str:
    """Classify a four-bar linkage using the Grashof relation S + L versus P + Q."""
    ordered = sorted(lengths)
    shortest, first_intermediate, second_intermediate, longest = ordered
    left = shortest + longest
    right = first_intermediate + second_intermediate

    if math.isclose(left, right, abs_tol=tolerance):
        return "change_point"
    if left < right:
        return "grashof"
    return "non_grashof"


def four_bar_mobility() -> int:
    """Return the planar Gruebler-Kutzbach mobility for a four-bar linkage."""
    n = 4
    j1 = 4
    j2 = 0
    return 3 * (n - 1) - 2 * j1 - j2


def _round_coordinate(point: tuple[float, float]) -> tuple[float, float]:
    return (round(point[0], 10), round(point[1], 10))


def analyze_four_bar(request: FourBarAnalyzeRequest) -> FourBarAnalyzeResponse:
    """Perform deterministic position analysis for a planar four-bar linkage."""
    lengths = [request.l1, request.l2, request.l3, request.l4]
    mobility = four_bar_mobility()
    notes = [
        "Velocity and acceleration inputs are accepted for the API contract, but velocity and acceleration analysis will be implemented in PR 5."
    ]

    theta2_rad = math.radians(request.theta2_deg)
    a = (0.0, 0.0)
    d = (request.l1, 0.0)
    b = (
        request.l2 * math.cos(theta2_rad),
        request.l2 * math.sin(theta2_rad),
    )

    if any(length <= 0 for length in lengths):
        notes.insert(0, "Invalid geometry: all link lengths must be positive numbers.")
        return FourBarAnalyzeResponse(
            mechanism="four_bar_linkage",
            valid=False,
            grashof_status="invalid",
            mobility=mobility,
            classification="invalid",
            theta2_deg=request.theta2_deg,
            theta3_deg=None,
            theta4_deg=None,
            joint_coordinates=JointCoordinates(A=a, B=_round_coordinate(b), C=None, D=d),
            notes=notes,
        )

    grashof_status = classify_grashof(lengths)
    dx = d[0] - b[0]
    dy = d[1] - b[1]
    center_distance = math.hypot(dx, dy)

    if center_distance > request.l3 + request.l4 + TOLERANCE:
        notes.insert(0, "Invalid geometry: coupler and rocker circles do not intersect because the moving pivots are too far apart.")
        return FourBarAnalyzeResponse(
            mechanism="four_bar_linkage",
            valid=False,
            grashof_status=grashof_status,
            mobility=mobility,
            classification=grashof_status,
            theta2_deg=request.theta2_deg,
            theta3_deg=None,
            theta4_deg=None,
            joint_coordinates=JointCoordinates(A=a, B=_round_coordinate(b), C=None, D=d),
            notes=notes,
        )

    if center_distance < abs(request.l3 - request.l4) - TOLERANCE:
        notes.insert(0, "Invalid geometry: one circle lies inside the other, so the coupler and rocker cannot assemble at this crank angle.")
        return FourBarAnalyzeResponse(
            mechanism="four_bar_linkage",
            valid=False,
            grashof_status=grashof_status,
            mobility=mobility,
            classification=grashof_status,
            theta2_deg=request.theta2_deg,
            theta3_deg=None,
            theta4_deg=None,
            joint_coordinates=JointCoordinates(A=a, B=_round_coordinate(b), C=None, D=d),
            notes=notes,
        )

    if center_distance <= TOLERANCE:
        notes.insert(0, "Invalid geometry: circle centers B and D coincide, so a unique open-configuration point C cannot be determined.")
        return FourBarAnalyzeResponse(
            mechanism="four_bar_linkage",
            valid=False,
            grashof_status=grashof_status,
            mobility=mobility,
            classification=grashof_status,
            theta2_deg=request.theta2_deg,
            theta3_deg=None,
            theta4_deg=None,
            joint_coordinates=JointCoordinates(A=a, B=_round_coordinate(b), C=None, D=d),
            notes=notes,
        )

    distance_along_line = (request.l3**2 - request.l4**2 + center_distance**2) / (2 * center_distance)
    height_squared = request.l3**2 - distance_along_line**2
    if height_squared < 0 and math.isclose(height_squared, 0.0, abs_tol=ANGLE_TOLERANCE):
        height_squared = 0.0
    height = math.sqrt(max(height_squared, 0.0))

    unit_x = dx / center_distance
    unit_y = dy / center_distance
    base_x = b[0] + distance_along_line * unit_x
    base_y = b[1] + distance_along_line * unit_y

    # Open configuration: choose the intersection on the positive normal side of vector B -> D.
    c = (base_x - height * unit_y, base_y + height * unit_x)
    theta3_deg = math.degrees(math.atan2(c[1] - b[1], c[0] - b[0]))
    theta4_deg = math.degrees(math.atan2(c[1] - d[1], c[0] - d[0]))

    return FourBarAnalyzeResponse(
        mechanism="four_bar_linkage",
        valid=True,
        grashof_status=grashof_status,
        mobility=mobility,
        classification=grashof_status,
        theta2_deg=request.theta2_deg,
        theta3_deg=round(theta3_deg, 10),
        theta4_deg=round(theta4_deg, 10),
        joint_coordinates=JointCoordinates(
            A=a,
            B=_round_coordinate(b),
            C=_round_coordinate(c),
            D=d,
        ),
        notes=notes,
    )
