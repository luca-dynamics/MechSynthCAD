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


## Deploying Full Stack on Vercel

The repository includes a root `vercel.json` that deploys the `frontend/` Next.js app and the existing FastAPI backend together under one Vercel project. The Python serverless entrypoint is `api/index.py`, which imports the existing backend app instead of duplicating routes or solver logic.

1. Import this GitHub repository into Vercel.
2. Use the root repository as the Vercel project root so the root `vercel.json` is applied.
3. Ensure the frontend builds from `frontend/` through the configured Next.js service.
4. Ensure the Python API entrypoint remains `api/index.py`.
5. Leave `NEXT_PUBLIC_API_BASE_URL` unset when using the same-domain Vercel backend; frontend calls will use relative `/api/...` paths on the same public Vercel link.
6. Set `NEXT_PUBLIC_API_BASE_URL` only when using an external hosted backend.

With this setup, `/` loads the MechSynthCAD frontend and `/api/...` requests are routed to the FastAPI backend. If Vercel detects multiple services during import, keep Root Directory as `./` and ensure the root `vercel.json` is present. The frontend service should use `/`; the backend service should expose `/api`.

### Local Development API URL

For local development, run the FastAPI backend at `http://localhost:8000`, create `frontend/.env.local`, and set:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Then run the frontend from `frontend/` with `npm run dev`. If `NEXT_PUBLIC_API_BASE_URL` is omitted locally, the frontend will call relative `/api/...` paths on the Next.js dev server, which is intended for same-domain Vercel deployment rather than the separate local FastAPI process.

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
12. PR 12: Browser-side print/save-as-PDF workflow for generated engineering reports

## Current Scope

The current scope includes deterministic four-bar position, velocity, acceleration, and simulation sweep analysis plus deterministic slider-crank position, velocity, and acceleration analysis exposed through FastAPI. The solver now uses input angular velocity `ω2` and input angular acceleration `α2` to compute coupler/rocker angular velocity and acceleration plus joint B/C linear velocity and acceleration. These velocity and acceleration values are computed by backend vector-loop equations, not AI. The frontend SVG renderer draws the linkage from backend `joint_coordinates`; sweep samples now include position, velocity, and acceleration data for each θ2 sample, along with animation controls and lightweight graphs of θ3/θ4 against θ2. PR 8 adds slider-crank as the second supported planar mechanism with backend deterministic calculations, SVG visualization, mechanism selection, and structured result display. Four-bar functionality remains unchanged. The project still does not include real AI API integration or report generation.

## PR 9 Agentic AI Engineering Workflow Layer

PR 9 adds an agentic engineering workflow scaffold around the deterministic solver/CAD system. This is not a simple copilot explainer or generic chatbot attached to a result panel. The backend now contains a separate `backend/app/agents/` package with typed workflow schemas, a deterministic orchestrator, validation helpers, prompts/boundary text, and a tool registry for deterministic solver endpoints.

The workflow represents six engineering roles: Intent Agent, Parameter Validation Agent, Solver Tool Agent, Result Interpretation Agent, Design Recommendation Agent, and Report Drafting Agent. These roles are currently implemented with deterministic, rule-based logic. They can interpret a user goal, identify required and missing inputs, plan which solver endpoint should be used, interpret a provided solver result, suggest design iteration direction, and draft a short report-ready summary.

The agent layer does **not** calculate kinematic values. Four-bar and slider-crank calculations remain owned by deterministic backend solvers. Real LLM integration can be added later behind this architecture, but PR 9 intentionally avoids external AI API calls, API keys, or unverified numerical generation.

## PR 10 Engineering Report Preview

PR 10 adds a structured engineering report preview workflow. The backend now exposes `POST /api/reports/mechanism`, which converts supplied mechanism inputs, deterministic solver outputs, optional four-bar sweep data, and optional agent workflow summaries into typed report sections and markdown preview text.

The report generator is intentionally separate from solvers and agents. It does not run new kinematic calculations and does not invent engineering numbers: missing or null values are shown as `N/A`, and deterministic solver outputs remain the numerical source of truth. The frontend adds an Engineering Report Preview panel for both four-bar and slider-crank workflows. PR 11 adds browser-side markdown download from the existing preview without server-side file generation or additional report API calls. PR 12 adds browser-side print/save-as-PDF export from the already-generated report preview using the native browser print dialog, so users can choose “Save as PDF” without backend PDF generation, heavy PDF dependencies, or a second report API call. The printable report remains based on deterministic solver outputs and the existing preview content. PR 11 also keeps the frontend page orchestration lean by extracting the mechanism selector, slider-crank visualization workspace, and workflow/report section into reusable components.


## PR 12 Browser Print / Save-as-PDF Export

PR 12 adds a frontend-only print workflow for generated engineering reports. After a report preview exists, the frontend exposes a **Print / Save as PDF** action that calls the browser native print dialog; users can select **Save as PDF** from that dialog. The app does not add backend PDF generation, server-side file generation, or heavy PDF libraries.

The print output is based on the existing generated report preview and deterministic solver outputs. It does not regenerate reports, recalculate mechanisms, or invent engineering values. Browser-side Markdown export from PR 11 remains available and still downloads the existing `report.markdown` content as a `.md` file.

### PR 13: Slider-crank sweep, animation, and graphing

PR 13 adds deterministic slider-crank sweep simulation. The backend sweep endpoint reuses the existing single-angle slider-crank solver for every sample, so position, velocity, and acceleration values remain deterministic and no AI calculations are introduced. The frontend now provides slider-crank sweep controls, SVG animation playback, and a lightweight slider-position graph. Slider-crank report previews can include supplied sweep summaries with sample, valid-sample, and invalid-sample counts.

### PR 14: Deterministic design iteration / synthesis recommendations

PR 14 adds a deterministic Design Iteration / Synthesis Assistant. The new backend synthesis package and `POST /api/synthesis/recommendations` endpoint compare supplied solver outputs and optional sweep summaries against user-defined target goals for supported four-bar and slider-crank metrics.

The recommender provides parameter-adjustment directions only, such as reviewing link proportions or slider-crank geometry relationships. It does **not** generate final dimensions, does **not** calculate unverified mechanism outputs, and introduces no external AI numerical calculation. Any suggested change must be verified by rerunning the deterministic solver or sweep endpoint.

Frontend users can define a target design goal near the workflow/report area, inspect target gaps copied from deterministic output fields, and include generated synthesis recommendations in the engineering report preview when available.

### PR 15: Validation matrix and demo-readiness QA polish

PR 15 adds a frontend validation/capability matrix and deterministic truth banner so demo users can see which features are ready, what their numerical source of truth is, and what verification remains required. Deterministic solver endpoints continue to own all numerical kinematic values. Agent workflow, synthesis recommendation, interpretation, and report layers assist with planning and communication only; they do not generate final engineering values.

The UI now makes report/export readiness visible for engineering report preview, Markdown export, and browser print / Save-as-PDF. Workflow, synthesis, and generated report preview state is also cleared when core inputs or selected mechanisms change, reducing stale context during live demonstrations.
