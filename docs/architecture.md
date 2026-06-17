# MechSynthCAD Architecture

MechSynthCAD is designed as a CAD-based engineering software tool for planar mechanism analysis and synthesis. The application separates user interaction, deterministic calculation, visualization, and AI-assisted explanation so that engineering outputs remain traceable and reproducible.

## Frontend: React/Next.js

The frontend is a Next.js TypeScript application styled with Tailwind CSS. It provides the engineering dashboard, mechanism selection, four-bar linkage and slider-crank input forms, CAD-style visualization areas, and panels for deterministic results and future AI-generated explanations.

## Backend: Python FastAPI

The backend is a FastAPI service that exposes typed REST endpoints for mechanism analysis. The first API contract is `POST /api/mechanisms/fourbar/analyze`, which accepts four-bar geometry and input motion parameters and returns deterministic four-bar position data, including joint coordinates for A, B, C, and D when the configuration is valid. PR 6 extends this response with deterministic velocity and acceleration analysis that uses `ω2` and `α2` to compute `ω3`, `ω4`, `α3`, `α4`, and joint B/C linear velocity and acceleration. PR 5 adds `POST /api/mechanisms/fourbar/sweep`, and PR 6 extends each sweep sample so position, velocity, and acceleration data are preserved across the θ2 range. PR 8 adds `POST /api/mechanisms/slider-crank/analyze` for the second supported planar mechanism; it returns slider-crank position, velocity, acceleration, transmission angle, joint coordinates, and notes from deterministic backend equations.

## Deterministic Mathematical Solver

The deterministic kinematic engine owns the core engineering calculations. The current solver performs four-bar position analysis and returns reproducible angular and joint-coordinate outputs. PR 6 adds vector-loop velocity and acceleration equations in the backend solver: `ω2` produces joint B velocity and the solved `ω3`/`ω4` values, while `α2` and centripetal terms produce joint B/C acceleration and `α3`/`α4`. Singular or near-singular velocity/acceleration systems keep the position result valid but return null motion unknowns with explanatory notes. PR 5 adds deterministic sweep orchestration over input crank angles without duplicating position equations; every simulation sample now comes from the backend solver with position, velocity, and acceleration fields. PR 8 adds a deterministic slider-crank solver using the crank-pin position, connecting-rod constraint, and differentiated slider-position equations; invalid or near-singular configurations preserve safe null values with explanatory notes instead of relying on AI or frontend calculations.

## AI-Assisted Explanation Layer

The AI layer is planned as an assistive support layer only. It may help explain solver outputs, guide design iteration, validate assumptions, and draft report text. It will not replace the deterministic mathematical solver or generate unverified engineering results.

## CAD-Style SVG Visualization Plan

PR 4 replaces the placeholder drawing with a real CAD-style SVG workspace driven by deterministic backend joint coordinates. The frontend normalizes A/B/C/D engineering coordinates into SVG screen coordinates, inverts the Y-axis so positive engineering Y appears upward, and renders ground, crank, coupler, rocker, joint markers, and labels. This is a standalone 2D computer-aided mechanism visualization layer for planar linkage analysis, not a full industrial CAD kernel.


## PR 5 Simulation and Graphing

PR 5 introduces a lightweight simulation workflow for four-bar mechanisms. The frontend sends link lengths, motion inputs, and θ2 sweep bounds to the backend sweep endpoint. The backend returns ordered samples, and the frontend uses those samples to animate the SVG mechanism with play/pause, previous/next, and scrub controls. Invalid samples are retained in the response and handled visually rather than being recomputed or hidden by the frontend.

The graphing layer is a simple SVG line chart that plots θ3 and θ4 against θ2. Invalid samples are represented as gaps so the chart remains tied to deterministic backend results. Velocity and acceleration graphing remains a follow-up opportunity; PR 6 keeps the UI focused by displaying structured angular and linear velocity/acceleration values while preserving the raw JSON response.

## Why AI Does Not Perform Core Calculations

Kinematic analysis requires repeatable, auditable calculations based on established mechanism theory. Keeping the core calculations in a deterministic solver ensures that results can be validated, tested, and documented for an academic Mechanical Engineering project. AI support is reserved for interpretation and communication rather than authoritative numerical computation.


## PR 8 Slider-Crank Module

PR 8 adds slider-crank support as the second planar mechanism while keeping all four-bar functionality unchanged. The backend performs deterministic position, velocity, and acceleration calculations for the crank center O, crank pin A, and slider point B, including optional slider-line offset. The frontend adds mechanism selection, a slider-crank input panel, CAD-style SVG visualization with a horizontal guide line and slider block, and a structured results panel with raw JSON for validation. AI integration and report generation remain out of scope for this PR.

## PR 9 Agentic Engineering Workflow Layer

PR 9 introduces a dedicated backend agent package at `backend/app/agents/` and a frontend `AgentWorkflowPanel` that sits around, not in place of, the solver UI. The panel is visible for both four-bar and slider-crank workflows and receives the selected mechanism context plus any deterministic solver result that already exists.

The workflow is intentionally agentic rather than a simple copilot explainer. It models a coordinated engineering process with the following roles:

- Intent Agent: interprets the design or analysis goal.
- Parameter Validation Agent: checks whether required solver dimensions and motion inputs are present.
- Solver Tool Agent: selects deterministic solver endpoints from the tool registry.
- Result Interpretation Agent: interprets provided solver output metadata and notes.
- Design Recommendation Agent: suggests design iteration direction based on solver validity and notes.
- Report Drafting Agent: prepares concise report-ready engineering text.

The deterministic tool registry names the available calculation tools: `four_bar_analyze`, `four_bar_sweep`, and `slider_crank_analyze`. Each registry entry points to its API endpoint and states that calculations are owned by deterministic solvers. The orchestrator can validate and plan even before a solver result exists; once a solver result is supplied, it interprets only the fields returned by the solver and does not invent missing numerical values.

This architecture preserves the project boundary that AI may assist with validation, planning, interpretation, recommendation, and report drafting, while deterministic solvers remain the source of numerical truth. A real LLM can be integrated later behind the same workflow contracts, but PR 9 uses deterministic rule-based behavior and makes no external AI API calls.
