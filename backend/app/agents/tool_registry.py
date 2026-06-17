DETERMINISTIC_TOOL_REGISTRY: dict[str, dict[str, str]] = {
    "four_bar_analyze": {
        "endpoint": "/api/mechanisms/fourbar/analyze",
        "purpose": "single-angle four-bar position, velocity, acceleration analysis",
        "calculation_owner": "deterministic_solver",
    },
    "four_bar_sweep": {
        "endpoint": "/api/mechanisms/fourbar/sweep",
        "purpose": "four-bar simulation sweep and output angle graphing",
        "calculation_owner": "deterministic_solver",
    },
    "slider_crank_analyze": {
        "endpoint": "/api/mechanisms/slider-crank/analyze",
        "purpose": "slider-crank position, velocity, acceleration analysis",
        "calculation_owner": "deterministic_solver",
    },
}


def describe_tool(tool_name: str) -> str:
    tool = DETERMINISTIC_TOOL_REGISTRY[tool_name]
    return f"{tool_name} -> {tool['endpoint']} ({tool['purpose']}; calculations owned by deterministic solver)"
