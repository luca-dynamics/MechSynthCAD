from __future__ import annotations

import math

from ..models import (
    FourBarAnalyzeRequest,
    AccelerationAnalysis,
    FourBarAnalyzeResponse,
    FourBarSweepRequest,
    FourBarSweepResponse,
    FourBarSweepSample,
    JointCoordinates,
    VelocityAnalysis,
)

TOLERANCE = 1e-9
ANGLE_TOLERANCE = 1e-7
SYSTEM_DETERMINANT_TOLERANCE = 1e-8


def _empty_velocity_analysis(omega2: float) -> VelocityAnalysis:
    return VelocityAnalysis(omega2=omega2, omega3=None, omega4=None, velocity_B=None, velocity_C=None)


def _empty_acceleration_analysis(alpha2: float) -> AccelerationAnalysis:
    return AccelerationAnalysis(alpha2=alpha2, alpha3=None, alpha4=None, acceleration_B=None, acceleration_C=None)


def _cross_scalar_vector(angular_value: float, vector: tuple[float, float]) -> tuple[float, float]:
    return (-angular_value * vector[1], angular_value * vector[0])


def _solve_2x2(
    a11: float, a12: float, a21: float, a22: float, b1: float, b2: float
) -> tuple[float, float] | None:
    determinant = a11 * a22 - a12 * a21
    scale = max(abs(a11), abs(a12), abs(a21), abs(a22), 1.0)
    if abs(determinant) <= SYSTEM_DETERMINANT_TOLERANCE * scale * scale:
        return None
    return ((b1 * a22 - a12 * b2) / determinant, (a11 * b2 - b1 * a21) / determinant)


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
        "Position, velocity, and acceleration are computed by deterministic backend kinematic equations."
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
            velocity_analysis=_empty_velocity_analysis(request.omega2),
            acceleration_analysis=_empty_acceleration_analysis(request.alpha2),
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
            velocity_analysis=_empty_velocity_analysis(request.omega2),
            acceleration_analysis=_empty_acceleration_analysis(request.alpha2),
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
            velocity_analysis=_empty_velocity_analysis(request.omega2),
            acceleration_analysis=_empty_acceleration_analysis(request.alpha2),
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
            velocity_analysis=_empty_velocity_analysis(request.omega2),
            acceleration_analysis=_empty_acceleration_analysis(request.alpha2),
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

    r_ab = (b[0] - a[0], b[1] - a[1])
    r_bc = (c[0] - b[0], c[1] - b[1])
    r_dc = (c[0] - d[0], c[1] - d[1])
    velocity_b = _cross_scalar_vector(request.omega2, r_ab)

    a11, a21 = -r_bc[1], r_bc[0]
    a12, a22 = r_dc[1], -r_dc[0]
    velocity_solution = _solve_2x2(a11, a12, a21, a22, -velocity_b[0], -velocity_b[1])
    velocity_analysis = _empty_velocity_analysis(request.omega2)
    acceleration_analysis = _empty_acceleration_analysis(request.alpha2)

    if velocity_solution is None:
        notes.append("Velocity/acceleration analysis unavailable: the angular velocity linear system is singular or near singular at this configuration.")
    else:
        omega3, omega4 = velocity_solution
        velocity_c = (velocity_b[0] - omega3 * r_bc[1], velocity_b[1] + omega3 * r_bc[0])
        velocity_analysis = VelocityAnalysis(
            omega2=request.omega2,
            omega3=round(omega3, 10),
            omega4=round(omega4, 10),
            velocity_B=_round_coordinate(velocity_b),
            velocity_C=_round_coordinate(velocity_c),
        )

        acceleration_b = (
            -request.alpha2 * r_ab[1] - request.omega2**2 * r_ab[0],
            request.alpha2 * r_ab[0] - request.omega2**2 * r_ab[1],
        )
        rhs = (
            -acceleration_b[0] + omega3**2 * r_bc[0] - omega4**2 * r_dc[0],
            -acceleration_b[1] + omega3**2 * r_bc[1] - omega4**2 * r_dc[1],
        )
        acceleration_solution = _solve_2x2(a11, a12, a21, a22, rhs[0], rhs[1])
        if acceleration_solution is None:
            notes.append("Acceleration analysis unavailable: the angular acceleration linear system is singular or near singular at this configuration.")
        else:
            alpha3, alpha4 = acceleration_solution
            acceleration_c = (
                acceleration_b[0] - alpha3 * r_bc[1] - omega3**2 * r_bc[0],
                acceleration_b[1] + alpha3 * r_bc[0] - omega3**2 * r_bc[1],
            )
            acceleration_analysis = AccelerationAnalysis(
                alpha2=request.alpha2,
                alpha3=round(alpha3, 10),
                alpha4=round(alpha4, 10),
                acceleration_B=_round_coordinate(acceleration_b),
                acceleration_C=_round_coordinate(acceleration_c),
            )

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
        velocity_analysis=velocity_analysis,
        acceleration_analysis=acceleration_analysis,
        notes=notes,
    )


MAX_SWEEP_SAMPLES = 721


def _build_sweep_angles(start: float, end: float, step: float) -> list[float]:
    if math.isclose(step, 0.0, abs_tol=TOLERANCE):
        raise ValueError("theta2_step_deg must be nonzero.")

    direction = 1 if end >= start else -1
    signed_step = abs(step) * direction
    angles: list[float] = []
    current = start

    while (current <= end + ANGLE_TOLERANCE) if direction > 0 else (current >= end - ANGLE_TOLERANCE):
        if len(angles) >= MAX_SWEEP_SAMPLES:
            raise ValueError(f"Sweep exceeds maximum supported sample count of {MAX_SWEEP_SAMPLES}.")
        angles.append(round(current, 10))
        current += signed_step

    if not math.isclose(angles[-1], end, abs_tol=ANGLE_TOLERANCE):
        if len(angles) >= MAX_SWEEP_SAMPLES:
            raise ValueError(f"Sweep exceeds maximum supported sample count of {MAX_SWEEP_SAMPLES}.")
        angles.append(round(end, 10))

    return angles


def analyze_four_bar_sweep(request: FourBarSweepRequest) -> FourBarSweepResponse:
    """Run deterministic position analysis across a range of input crank angles."""
    notes = [
        "Sweep samples are generated exclusively by the deterministic four-bar position, velocity, and acceleration solver.",
        "Each sample uses the same input angular velocity ω2 and angular acceleration α2.",
    ]
    mobility = four_bar_mobility()
    lengths = [request.l1, request.l2, request.l3, request.l4]
    grashof_status = "invalid" if any(length <= 0 for length in lengths) else classify_grashof(lengths)

    try:
        angles = _build_sweep_angles(request.theta2_start_deg, request.theta2_end_deg, request.theta2_step_deg)
    except ValueError as exc:
        notes.insert(0, str(exc))
        return FourBarSweepResponse(
            mechanism="four_bar_linkage",
            sample_count=0,
            valid_sample_count=0,
            invalid_sample_count=0,
            grashof_status=grashof_status,
            classification="invalid",
            mobility=mobility,
            samples=[],
            notes=notes,
        )

    samples: list[FourBarSweepSample] = []
    for theta2_deg in angles:
        analysis = analyze_four_bar(
            FourBarAnalyzeRequest(
                l1=request.l1,
                l2=request.l2,
                l3=request.l3,
                l4=request.l4,
                theta2_deg=theta2_deg,
                omega2=request.omega2,
                alpha2=request.alpha2,
            )
        )
        samples.append(
            FourBarSweepSample(
                theta2_deg=analysis.theta2_deg,
                valid=analysis.valid,
                theta3_deg=analysis.theta3_deg,
                theta4_deg=analysis.theta4_deg,
                joint_coordinates=analysis.joint_coordinates,
                velocity_analysis=analysis.velocity_analysis,
                acceleration_analysis=analysis.acceleration_analysis,
                notes=analysis.notes,
            )
        )

    valid_sample_count = sum(1 for sample in samples if sample.valid)
    invalid_sample_count = len(samples) - valid_sample_count
    return FourBarSweepResponse(
        mechanism="four_bar_linkage",
        sample_count=len(samples),
        valid_sample_count=valid_sample_count,
        invalid_sample_count=invalid_sample_count,
        grashof_status=grashof_status,
        classification=grashof_status,
        mobility=mobility,
        samples=samples,
        notes=notes,
    )
