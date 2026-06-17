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
9. PR 9: AI explanation module
10. PR 10: Report generation

## Current Scope

The current scope includes deterministic four-bar position, velocity, acceleration, and simulation sweep analysis plus deterministic slider-crank position, velocity, and acceleration analysis exposed through FastAPI. The solver now uses input angular velocity `ω2` and input angular acceleration `α2` to compute coupler/rocker angular velocity and acceleration plus joint B/C linear velocity and acceleration. These velocity and acceleration values are computed by backend vector-loop equations, not AI. The frontend SVG renderer draws the linkage from backend `joint_coordinates`; sweep samples now include position, velocity, and acceleration data for each θ2 sample, along with animation controls and lightweight graphs of θ3/θ4 against θ2. PR 8 adds slider-crank as the second supported planar mechanism with backend deterministic calculations, SVG visualization, mechanism selection, and structured result display. Four-bar functionality remains unchanged. The project still does not include real AI API integration or report generation.
