# MechSynthCAD Architecture

MechSynthCAD is designed as a CAD-based engineering software tool for planar mechanism analysis and synthesis. The application separates user interaction, deterministic calculation, visualization, and AI-assisted explanation so that engineering outputs remain traceable and reproducible.

## Frontend: React/Next.js

The frontend is a Next.js TypeScript application styled with Tailwind CSS. It provides the engineering dashboard, four-bar linkage input form, CAD-style visualization area, and panels for deterministic results and future AI-generated explanations. PR 2 keeps the visualization as a placeholder while adding a minimal structured display for validity, Grashof status, classification, angles, and joint coordinates returned by the backend.

## Backend: Python FastAPI

The backend is a FastAPI service that exposes typed REST endpoints for mechanism analysis. The `POST /api/mechanisms/fourbar/analyze` endpoint accepts four-bar geometry and input motion parameters, validates the assembly geometry, and returns deterministic position-analysis output through Pydantic request and response models.

## Deterministic Mathematical Solver

PR 2 introduces the first deterministic solver module for four-bar position analysis. The solver computes Grashof status, four-bar mobility with the planar Gruebler-Kutzbach equation, crank-point coordinates, circle-intersection assembly geometry, and output link angles. Invalid assemblies are reported as failed analyses with explanatory notes instead of uncaught API errors.

Velocity and acceleration inputs are accepted in the API contract for continuity with the roadmap, but they are not solved in PR 2. Full velocity and acceleration analysis remains scheduled for PR 5.

## AI-Assisted Explanation Layer

The AI layer is planned as an assistive support layer only. It may help explain solver outputs, guide design iteration, validate assumptions, and draft report text. It will not replace the deterministic mathematical solver or generate unverified engineering results.

## CAD-Style SVG Visualization Plan

The dashboard will evolve from a placeholder drawing into a CAD-style SVG workspace. The visualization layer will render joints, links, ground pivots, paths, dimensions, and simulation states from deterministic solver output. PR 3 is planned to connect the deterministic coordinate output to the CAD-style SVG view.

## Why AI Does Not Perform Core Calculations

Kinematic analysis requires repeatable, auditable calculations based on established mechanism theory. Keeping the core calculations in a deterministic solver ensures that results can be validated, tested, and documented for an academic Mechanical Engineering project. AI support is reserved for interpretation and communication rather than authoritative numerical computation.
