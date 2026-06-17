from typing import Any

from .schemas import SynthesisRecommendation, SynthesisRequest, SynthesisResponse, SynthesisTarget

FOUR_BAR_METRICS = {"theta4_deg", "theta3_deg", "transmission_quality", "valid_sample_count", "invalid_sample_count"}
SLIDER_CRANK_METRICS = {"slider_position", "transmission_angle_deg", "slider_velocity", "slider_acceleration", "valid_sample_count", "invalid_sample_count"}


def _as_number(value: Any) -> float | None:
    return value if isinstance(value, (int, float)) and not isinstance(value, bool) else None


def _read_metric(request: SynthesisRequest, metric: str) -> float | None:
    solver = request.solver_result or {}
    sweep = request.sweep_result or {}
    direct = _as_number(solver.get(metric))
    if direct is not None:
        return direct
    for block_name in ("velocity_analysis", "acceleration_analysis"):
        block = solver.get(block_name)
        if isinstance(block, dict):
            nested = _as_number(block.get(metric))
            if nested is not None:
                return nested
    sweep_value = _as_number(sweep.get(metric))
    if sweep_value is not None:
        return sweep_value
    return None


def _target_label(target: SynthesisTarget) -> str:
    value = "unspecified value" if target.target_value is None else f"target {target.target_value}"
    tolerance = "" if target.tolerance is None else f" within tolerance {target.tolerance}"
    description = "" if not target.description else f" ({target.description})"
    return f"{target.metric}: {target.direction} toward {value}{tolerance}{description}"


def _gap(target: SynthesisTarget, current: float | None) -> str:
    if current is None:
        return f"{target.metric}: cannot be evaluated from the supplied deterministic solver or sweep output."
    if target.target_value is None:
        return f"{target.metric}: current deterministic value is {current}; directional target is {target.direction}."
    delta = target.target_value - current
    abs_delta = abs(delta)
    tolerance = target.tolerance
    if tolerance is not None and abs_delta <= tolerance:
        return f"{target.metric}: current deterministic value {current} is within tolerance {tolerance} of target {target.target_value}."
    return f"{target.metric}: current deterministic value {current}; target {target.target_value}; gap target-current = {delta}."


def _recommend_for_target(mechanism: str, target: SynthesisTarget) -> SynthesisRecommendation:
    metric = target.metric
    direction = "increase" if target.direction in {"increase", "maximize"} else "decrease" if target.direction in {"decrease", "minimize"} else "review"
    if mechanism == "four_bar":
        if metric in {"theta4_deg", "theta3_deg"}:
            return SynthesisRecommendation(parameter="l2/l3/l4 proportions", suggested_direction="review", reason=f"Review link proportions directionally to {target.direction} {metric}, then rerun the deterministic four-bar solver; no final dimensions are inferred here.", confidence="medium")
        if metric == "invalid_sample_count":
            return SynthesisRecommendation(parameter="link lengths and sweep range", suggested_direction="review", reason="Invalid sweep samples indicate assembly feasibility issues; review impossible geometry ranges or link-length relationships before optimization.", confidence="high")
        if metric == "valid_sample_count":
            return SynthesisRecommendation(parameter="link lengths and input sweep", suggested_direction="review", reason="Review link lengths and input-angle sweep limits to improve deterministic valid sample coverage.", confidence="medium")
        return SynthesisRecommendation(parameter="transmission quality", suggested_direction="review", reason="Transmission quality is not directly synthesized; add or inspect deterministic transmission metrics before deciding parameter changes.", confidence="low")
    if metric == "slider_position":
        return SynthesisRecommendation(parameter="crank_radius and connecting_rod_length", suggested_direction="review", reason=f"Review crank radius and connecting rod length directionally to {target.direction} slider position, then rerun the deterministic slider-crank solver.", confidence="medium")
    if metric == "transmission_angle_deg":
        return SynthesisRecommendation(parameter="offset and connecting_rod_length", suggested_direction="review", reason="Review offset and rod-length effects on transmission angle directionally and verify with a deterministic rerun.", confidence="medium")
    if metric == "slider_velocity":
        return SynthesisRecommendation(parameter="input angular speed and geometry", suggested_direction=direction, reason="Review input angular speed and geometry directionally; the supplied velocity output must be verified by rerunning the solver after edits.", confidence="medium")
    if metric == "slider_acceleration":
        return SynthesisRecommendation(parameter="input angular speed/acceleration and geometry", suggested_direction=direction, reason="Review input angular speed, input angular acceleration, and geometry directionally to manage slider acceleration, then rerun the deterministic solver.", confidence="medium")
    return SynthesisRecommendation(parameter="rod length, offset, and crank radius relationship", suggested_direction="review", reason="Review rod length, offset, and crank radius relationship because sweep validity comes from deterministic assembly checks.", confidence="high")


def generate_synthesis_recommendations(request: SynthesisRequest) -> SynthesisResponse:
    interpreted = [_target_label(target) for target in request.targets]
    safety = ["No final dimensions are invented.", "Recommendations are parameter-adjustment directions only.", "All suggested changes require deterministic solver reruns for verification."]
    if request.solver_result is None:
        return SynthesisResponse(mechanism_type=request.mechanism_type, interpreted_targets=interpreted, current_observations=["No deterministic solver_result was supplied."], target_gaps=["Run deterministic analysis before synthesis iteration."], recommendations=[SynthesisRecommendation(parameter="deterministic solver", suggested_direction="hold", reason="Run the deterministic analysis first so recommendations can compare targets against verified outputs.", confidence="high", requires_solver_rerun=False)], next_solver_actions=["Run the deterministic mechanism analysis endpoint, then regenerate recommendations."], safety_notes=safety)

    if request.solver_result.get("valid") is False:
        return SynthesisResponse(mechanism_type=request.mechanism_type, interpreted_targets=interpreted, current_observations=["The supplied deterministic solver_result is invalid."], target_gaps=["Target optimization is blocked until the geometry produces a valid deterministic analysis result."], recommendations=[SynthesisRecommendation(parameter="geometry inputs", suggested_direction="review", reason="Revise mechanism geometry before target optimization; invalid solver outputs cannot support synthesis iteration.", confidence="high")], next_solver_actions=["Correct input geometry and rerun deterministic analysis."], safety_notes=safety)

    supported = FOUR_BAR_METRICS if request.mechanism_type == "four_bar" else SLIDER_CRANK_METRICS
    observations = ["The supplied deterministic solver_result is valid or not explicitly invalid."]
    gaps: list[str] = []
    recommendations: list[SynthesisRecommendation] = []
    for target in request.targets:
        if target.metric not in supported:
            gaps.append(f"{target.metric}: unsupported target metric for {request.mechanism_type}; cannot evaluate deterministically.")
            recommendations.append(SynthesisRecommendation(parameter=target.metric, suggested_direction="review", reason="Use a supported deterministic metric before requesting parameter-direction guidance.", confidence="low"))
            continue
        current = _read_metric(request, target.metric)
        if current is not None:
            observations.append(f"{target.metric} current deterministic value: {current}")
        gaps.append(_gap(target, current))
        recommendations.append(_recommend_for_target(request.mechanism_type, target))

    if request.sweep_result:
        for metric in ("valid_sample_count", "invalid_sample_count"):
            value = _read_metric(request, metric)
            if value is not None:
                observations.append(f"{metric} from supplied sweep_result: {value}")
        invalid = _read_metric(request, "invalid_sample_count")
        if invalid and invalid > 0:
            recommendations.append(_recommend_for_target(request.mechanism_type, SynthesisTarget(metric="invalid_sample_count", direction="minimize")))

    return SynthesisResponse(mechanism_type=request.mechanism_type, interpreted_targets=interpreted or ["No target design goals were supplied."], current_observations=observations, target_gaps=gaps or ["No target gaps computed because no targets were supplied."], recommendations=recommendations or [SynthesisRecommendation(parameter="target goals", suggested_direction="hold", reason="Add a supported target metric before requesting parameter-adjustment directions.", confidence="high", requires_solver_rerun=False)], next_solver_actions=["Apply only directional parameter edits, then rerun deterministic analysis.", "Compare the new deterministic solver_result or sweep_result against the same target goals."], safety_notes=safety)
