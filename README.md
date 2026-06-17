# MechSynthCAD

**Academic project title:** Development of an AI-Assisted CAD-Based System for Kinematic Analysis and Synthesis of Planar Mechanisms.

**Product name:** MechSynthCAD

MechSynthCAD is a Mechanical Engineering final-year project framed as a CAD-based engineering software tool for planar mechanism analysis and synthesis. The system combines a web-based engineering dashboard, a Python API, a deterministic kinematic solver, CAD-style visualization, and an assistive AI layer for explanations and reporting.

The AI layer is intentionally supportive only. Core engineering calculations will be performed by deterministic mathematical methods so outputs remain reproducible, testable, and suitable for engineering validation.

## Technology Stack

- Next.js frontend
- TypeScript
- Tailwind CSS
- FastAPI backend
- Deterministic four-bar and slider-crank position, velocity, and acceleration backend solvers
- AI assistant layer planned for explanation, validation support, and report generation

## Repository Structure

```text
frontend/   Next.js TypeScript and Tailwind CSS dashboard
backend/    FastAPI service and mechanism API contracts
docs/       Architecture and engineering design notes
```

## Local Development Setup

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend runs at <http://localhost:8000>.

Health check:

```bash
curl http://localhost:8000/health
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at <http://localhost:3000> and calls the backend endpoints at `http://localhost:8000/api/mechanisms/fourbar/analyze`, `http://localhost:8000/api/mechanisms/fourbar/sweep`, and `http://localhost:8000/api/mechanisms/slider-crank/analyze`.

## Development Roadmap

1. PR 1: Initial scaffold, dashboard layout, API contract, and documentation
2. PR 2: Four-bar mathematical engine
3. PR 3: FastAPI endpoint wired to the deterministic four-bar solver
4. PR 4: Real frontend SVG CAD-style visualization from backend joint coordinates
5. PR 5: Deterministic four-bar simulation sweep, SVG animation controls, and θ3/θ4 graphing
6. PR 6: Deterministic four-bar velocity and acceleration analysis
7. PR 7: Frontend component refactor
8. PR 8: Slider-crank module as the second supported planar mechanism
9. PR 9: Agentic AI engineering workflow layer
10. PR 10: Report generation
11. PR 11: Browser-side markdown report download and frontend page structure cleanup

## Current Scope

The current scope includes deterministic four-bar position, velocity, acceleration, and simulation sweep analysis plus deterministic slider-crank position, velocity, and acceleration analysis exposed through FastAPI. The solver now uses input angular velocity `ω2` and input angular acceleration `α2` to compute coupler/rocker angular velocity and acceleration plus joint B/C linear velocity and acceleration. These velocity and acceleration values are computed by backend vector-loop equations, not AI. The frontend SVG renderer draws the linkage from backend `joint_coordinates`; sweep samples now include position, velocity, and acceleration data for each θ2 sample, along with animation controls and lightweight graphs of θ3/θ4 against θ2. PR 8 adds slider-crank as the second supported planar mechanism with backend deterministic calculations, SVG visualization, mechanism selection, and structured result display. Four-bar functionality remains unchanged. The project still does not include real AI API integration or report generation.

## PR 9 Agentic AI Engineering Workflow Layer

PR 9 adds an agentic engineering workflow scaffold around the deterministic solver/CAD system. This is not a simple copilot explainer or generic chatbot attached to a result panel. The backend now contains a separate `backend/app/agents/` package with typed workflow schemas, a deterministic orchestrator, validation helpers, prompts/boundary text, and a tool registry for deterministic solver endpoints.

The workflow represents six engineering roles: Intent Agent, Parameter Validation Agent, Solver Tool Agent, Result Interpretation Agent, Design Recommendation Agent, and Report Drafting Agent. These roles are currently implemented with deterministic, rule-based logic. They can interpret a user goal, identify required and missing inputs, plan which solver endpoint should be used, interpret a provided solver result, suggest design iteration direction, and draft a short report-ready summary.

The agent layer does **not** calculate kinematic values. Four-bar and slider-crank calculations remain owned by deterministic backend solvers. Real LLM integration can be added later behind this architecture, but PR 9 intentionally avoids external AI API calls, API keys, or unverified numerical generation.

## PR 10 Engineering Report Preview

PR 10 adds a structured engineering report preview workflow. The backend now exposes `POST /api/reports/mechanism`, which converts supplied mechanism inputs, deterministic solver outputs, optional four-bar sweep data, and optional agent workflow summaries into typed report sections and markdown preview text.

The report generator is intentionally separate from solvers and agents. It does not run new kinematic calculations and does not invent engineering numbers: missing or null values are shown as `N/A`, and deterministic solver outputs remain the numerical source of truth. The frontend adds an Engineering Report Preview panel for both four-bar and slider-crank workflows. PR 11 adds browser-side markdown download from the existing preview without server-side file generation or additional report API calls. PDF export remains deferred. PR 11 also keeps the frontend page orchestration lean by extracting the mechanism selector, slider-crank visualization workspace, and workflow/report section into reusable components.
