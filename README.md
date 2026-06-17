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
- Deterministic four-bar position analysis and simulation sweep backend
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

The frontend runs at <http://localhost:3000> and calls the backend endpoints at `http://localhost:8000/api/mechanisms/fourbar/analyze` and `http://localhost:8000/api/mechanisms/fourbar/sweep`.

## Development Roadmap

1. PR 1: Initial scaffold, dashboard layout, API contract, and documentation
2. PR 2: Four-bar mathematical engine
3. PR 3: FastAPI endpoint wired to the deterministic four-bar solver
4. PR 4: Real frontend SVG CAD-style visualization from backend joint coordinates
5. PR 5: Deterministic four-bar simulation sweep, SVG animation controls, and θ3/θ4 graphing
6. PR 6: Velocity and acceleration analysis
7. PR 7: Slider-crank module
8. PR 8: AI explanation module
9. PR 9: Report generation

## Current Scope

The current scope includes deterministic four-bar position analysis and deterministic four-bar simulation sweeps exposed through FastAPI. The frontend SVG renderer draws the linkage from backend `joint_coordinates`; PR 5 adds animation controls driven by backend sweep samples and lightweight graphs of θ3/θ4 against θ2. Velocity and acceleration analysis remain deferred to a later PR, and the project still does not include real AI API integration, slider-crank analysis, or report generation.
