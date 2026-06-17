from __future__ import annotations

import math

from app.models import (
    SliderCrankAccelerationAnalysis,
    SliderCrankAnalyzeRequest,
    SliderCrankAnalyzeResponse,
    SliderCrankJointCoordinates,
    SliderCrankVelocityAnalysis,
)

TOLERANCE = 1e-9
SINGULAR_TOLERANCE = 1e-8


def _round_coordinate(point: tuple[float, float]) -> tuple[float, float]:
    return (round(point[0], 10), round(point[1], 10))


def _empty_velocity(omega: float) -> SliderCrankVelocityAnalysis:
    return SliderCrankVelocityAnalysis(omega=omega, velocity_A=None, velocity_B=None, slider_velocity=None)


def _empty_acceleration(alpha: float) -> SliderCrankAccelerationAnalysis:
    return SliderCrankAccelerationAnalysis(alpha=alpha, acceleration_A=None, acceleration_B=None, slider_acceleration=None)


def analyze_slider_crank(request: SliderCrankAnalyzeRequest) -> SliderCrankAnalyzeResponse:
    """Analyze a planar slider-crank using deterministic kinematic equations.

    The slider is constrained to y = offset and the positive assembly branch is
    used: Bx = Ax + sqrt(l^2 - (offset - Ay)^2). Velocity and acceleration are
    obtained by differentiating that same closed-form position constraint.
    """
    notes = [
        "Position, velocity, and acceleration are computed by deterministic backend slider-crank kinematic equations.",
        "Positive assembly branch selected for the slider point B.",
    ]
    r = request.crank_radius
    rod_length = request.connecting_rod_length
    theta_rad = math.radians(request.theta_deg)
    origin = (0.0, 0.0)
    crank_pin = (r * math.cos(theta_rad), r * math.sin(theta_rad))
    provisional_slider = (crank_pin[0], request.offset)

    if r <= 0 or rod_length <= 0:
        notes.insert(0, "Invalid geometry: crank_radius and connecting_rod_length must be positive numbers.")
        return SliderCrankAnalyzeResponse(
            mechanism="slider_crank",
            valid=False,
            theta_deg=request.theta_deg,
            crank_radius=r,
            connecting_rod_length=rod_length,
            offset=request.offset,
            slider_position=None,
            transmission_angle_deg=None,
            joint_coordinates=SliderCrankJointCoordinates(O=origin, A=_round_coordinate(crank_pin), B=_round_coordinate(provisional_slider)),
            velocity_analysis=_empty_velocity(request.omega),
            acceleration_analysis=_empty_acceleration(request.alpha),
            notes=notes,
        )

    vertical_gap = request.offset - crank_pin[1]
    radicand = rod_length**2 - vertical_gap**2
    if radicand < 0 and not math.isclose(radicand, 0.0, abs_tol=TOLERANCE):
        notes.insert(0, "Invalid geometry: connecting rod cannot reach the slider line at this crank angle.")
        return SliderCrankAnalyzeResponse(
            mechanism="slider_crank",
            valid=False,
            theta_deg=request.theta_deg,
            crank_radius=r,
            connecting_rod_length=rod_length,
            offset=request.offset,
            slider_position=None,
            transmission_angle_deg=None,
            joint_coordinates=SliderCrankJointCoordinates(O=origin, A=_round_coordinate(crank_pin), B=_round_coordinate(provisional_slider)),
            velocity_analysis=_empty_velocity(request.omega),
            acceleration_analysis=_empty_acceleration(request.alpha),
            notes=notes,
        )

    horizontal_gap = math.sqrt(max(radicand, 0.0))
    slider_position = crank_pin[0] + horizontal_gap
    slider_point = (slider_position, request.offset)
    transmission_angle_deg = abs(math.degrees(math.atan2(vertical_gap, horizontal_gap)))

    velocity_a = (-request.omega * crank_pin[1], request.omega * crank_pin[0])
    acceleration_a = (
        -request.alpha * crank_pin[1] - request.omega**2 * crank_pin[0],
        request.alpha * crank_pin[0] - request.omega**2 * crank_pin[1],
    )
    velocity_analysis = _empty_velocity(request.omega)
    acceleration_analysis = _empty_acceleration(request.alpha)

    if horizontal_gap <= SINGULAR_TOLERANCE * max(rod_length, 1.0):
        notes.append("Velocity analysis unavailable: connecting rod is vertical or near vertical, making the slider derivative singular.")
        notes.append("Acceleration analysis unavailable: connecting rod is vertical or near vertical, making the slider second derivative singular.")
    else:
        # Bx = Ax + s, s = sqrt(l^2 - (offset - Ay)^2).
        # Differentiating gives s_dot = (offset - Ay) * Ay_dot / s.
        slider_velocity = velocity_a[0] + (vertical_gap * velocity_a[1]) / horizontal_gap
        velocity_analysis = SliderCrankVelocityAnalysis(
            omega=request.omega,
            velocity_A=_round_coordinate(velocity_a),
            velocity_B=_round_coordinate((slider_velocity, 0.0)),
            slider_velocity=round(slider_velocity, 10),
        )

        # Differentiating s_dot again gives:
        # s_ddot = ((offset - Ay) * Ay_ddot - Ay_dot^2) / s
        #          - ((offset - Ay) * Ay_dot)^2 / s^3.
        numerator = vertical_gap * acceleration_a[1] - velocity_a[1] ** 2
        slider_extra_acceleration = numerator / horizontal_gap - (vertical_gap * velocity_a[1]) ** 2 / horizontal_gap**3
        slider_acceleration = acceleration_a[0] + slider_extra_acceleration
        acceleration_analysis = SliderCrankAccelerationAnalysis(
            alpha=request.alpha,
            acceleration_A=_round_coordinate(acceleration_a),
            acceleration_B=_round_coordinate((slider_acceleration, 0.0)),
            slider_acceleration=round(slider_acceleration, 10),
        )

    return SliderCrankAnalyzeResponse(
        mechanism="slider_crank",
        valid=True,
        theta_deg=request.theta_deg,
        crank_radius=r,
        connecting_rod_length=rod_length,
        offset=request.offset,
        slider_position=round(slider_position, 10),
        transmission_angle_deg=round(transmission_angle_deg, 10),
        joint_coordinates=SliderCrankJointCoordinates(O=origin, A=_round_coordinate(crank_pin), B=_round_coordinate(slider_point)),
        velocity_analysis=velocity_analysis,
        acceleration_analysis=acceleration_analysis,
        notes=notes,
    )
