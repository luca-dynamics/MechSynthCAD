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

## PR 10 Engineering Report Preview

PR 10 adds a dedicated report package at `backend/app/reports/` with typed schemas and a deterministic report generator. The package is separate from both `backend/app/solvers/` and `backend/app/agents/`, preserving a clear boundary between calculation, workflow interpretation, and report rendering.

The report endpoint, `POST /api/reports/mechanism`, accepts the selected mechanism type, input parameters, optional deterministic solver result, optional sweep result, and optional agent workflow summary. It returns structured report sections plus a markdown preview generated from the same section data. Report content can reference only supplied inputs, deterministic solver outputs, and supplied workflow summaries. Missing numerical values are rendered as `N/A`; the generator does not synthesize or infer unprovided engineering numbers.

The frontend adds a reusable `ReportPreviewPanel` visible for both four-bar and slider-crank workflows. It renders report title, validation notes, structured sections, and a clearly separated markdown preview. The panel explicitly communicates that numerical values originate from solver outputs. PR 11 adds browser-side markdown report download from the already-generated `report.markdown` string using a Blob/ObjectURL, so no server-side file generation or second backend call is needed. PR 12 adds browser-side print/save-as-PDF export from the existing rendered report preview through the native browser print dialog. It does not add backend PDF generation, heavy PDF dependencies, server-side rendering, or an additional report-generation call.


## PR 11 Markdown Export and Page Structure Cleanup

PR 11 adds browser-side markdown report download for both four-bar and slider-crank reports. The export uses the existing markdown returned by `POST /api/reports/mechanism`, creates a local `.md` file in the browser, and does not introduce PDF generation or any server-side file-generation endpoint.

The frontend page structure is also cleaned up so `frontend/src/app/page.tsx` remains an orchestration layer for state, derived solver/report context, and API actions. The mechanism selector, slider-crank CAD visualization workspace, and combined workflow/report section now live in dedicated reusable components.


## PR 12 Browser-Side Report Print Export

PR 12 keeps PDF export in the frontend by relying on the browser print dialog and its built-in **Save as PDF** option. The `ReportPreviewPanel` shows the print action only after a report exists, and the print action uses the existing preview content instead of calling the report endpoint again.

Print-specific CSS isolates the report area, hides app chrome and interactive controls, removes dark or decorative styling, hides the markdown preview by default, and adds academic print header/footer notes. Markdown export from PR 11 remains available as a separate browser-side `.md` download. The printed report is therefore traceable to deterministic solver outputs and the structured generated preview, with no backend PDF pipeline or heavy PDF dependency.

## PR 13 slider-crank sweep architecture

Slider-crank sweep simulation is implemented as a deterministic backend workflow. `POST /api/mechanisms/slider-crank/sweep` accepts a crank-angle range and calls the existing single-angle slider-crank solver for each generated sample rather than duplicating formulas or using AI for calculations. Invalid samples are preserved in the response, and sample counts are capped to protect the API from accidental excessive sweeps.

The frontend mirrors four-bar simulation behavior for slider-crank mechanisms with dedicated sweep controls, SVG animation controls, and a lightweight graph of slider position versus crank angle. Report context can include slider-crank sweep summaries, limited to values supplied by deterministic solver responses.
