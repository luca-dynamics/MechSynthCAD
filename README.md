# MechSynthCAD

**Academic project title:** Development of an AI-Assisted CAD-Based System for Kinematic Analysis and Synthesis of Planar Mechanisms.

**Product name:** MechSynthCAD

MechSynthCAD is a Mechanical Engineering final-year project framed as a CAD-based engineering software tool for planar mechanism analysis and synthesis. The system combines a web-based engineering dashboard, a Python API, a deterministic kinematic solver, CAD-style visualization, and an assistive AI layer for explanations and reporting.

The AI layer is intentionally supportive only. Core engineering calculations are performed by deterministic mathematical methods so outputs remain reproducible, testable, and suitable for engineering validation.

## Technology Stack

- Next.js frontend
- TypeScript
- Tailwind CSS
- FastAPI backend
- Deterministic Python mathematical engine for four-bar position analysis
- NumPy, SciPy, and SymPy planned for expanded mathematical analysis
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

The frontend runs at <http://localhost:3000> and calls the backend endpoint at `http://localhost:8000/api/mechanisms/fourbar/analyze`.

## Development Roadmap

1. PR 1: Initial scaffold, dashboard layout, API contract, and documentation
2. PR 2: Four-bar mathematical engine for deterministic position analysis
3. PR 3: SVG CAD visualization
4. PR 4: Simulation and graphing
5. PR 5: Velocity and acceleration analysis
6. PR 6: Slider-crank module
7. PR 7: AI explanation module
8. PR 8: Report generation

## Current Scope

PR 2 introduces deterministic backend four-bar position analysis. The solver computes Grashof status, mobility, open-configuration joint coordinates, and theta3/theta4 values from deterministic geometry. Velocity and acceleration values are still accepted in the request for API continuity, but velocity and acceleration analysis will not be solved until PR 5.

The project still does not include real AI API integration, report generation, slider-crank analysis, or the full CAD-style SVG visualization. AI remains assistive only and does not perform core engineering calculations.
