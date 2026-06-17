from .schemas import SelectedMechanismType

REQUIRED_INPUTS: dict[SelectedMechanismType, list[str]] = {
    "four_bar": ["l1", "l2", "l3", "l4", "theta2_deg", "omega2", "alpha2"],
    "slider_crank": ["crank_radius", "connecting_rod_length", "theta_deg", "omega", "alpha"],
    "unknown": [],
}

OPTIONAL_INPUTS: dict[SelectedMechanismType, list[str]] = {
    "four_bar": ["theta2_start_deg", "theta2_end_deg", "theta2_step_deg"],
    "slider_crank": ["offset"],
    "unknown": [],
}


def missing_required_inputs(mechanism: SelectedMechanismType, context: dict | None) -> list[str]:
    provided = context or {}
    return [field for field in REQUIRED_INPUTS[mechanism] if field not in provided or provided[field] is None]
