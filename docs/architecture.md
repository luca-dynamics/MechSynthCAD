# MechSynthCAD Architecture

MechSynthCAD is designed as a CAD-based engineering software tool for planar mechanism analysis and synthesis. The application separates user interaction, deterministic calculation, visualization, and AI-assisted explanation so that engineering outputs remain traceable and reproducible.

## Frontend: React/Next.js

The frontend is a Next.js TypeScript application styled with Tailwind CSS. It provides the engineering dashboard, four-bar linkage input form, CAD-style visualization area, and panels for deterministic results and future AI-generated explanations.

## Backend: Python FastAPI

The backend is a FastAPI service that exposes typed REST endpoints for mechanism analysis. The first API contract is `POST /api/mechanisms/fourbar/analyze`, which accepts four-bar geometry and input motion parameters. The current response is intentionally a scaffold placeholder for the future solver.

## Deterministic Mathematical Solver

Future PRs will add a deterministic kinematic engine for position, velocity, and acceleration analysis. Planned numerical and symbolic tools include NumPy, SciPy, and SymPy. This solver will own the core engineering calculations and will be tested independently from the user interface and AI layer.

## AI-Assisted Explanation Layer

The AI layer is planned as an assistive support layer only. It may help explain solver outputs, guide design iteration, validate assumptions, and draft report text. It will not replace the deterministic mathematical solver or generate unverified engineering results.

## CAD-Style SVG Visualization Plan

The dashboard will evolve from a placeholder drawing into a CAD-style SVG workspace. The visualization layer will render joints, links, ground pivots, paths, dimensions, and simulation states from deterministic solver output.

## Why AI Does Not Perform Core Calculations

Kinematic analysis requires repeatable, auditable calculations based on established mechanism theory. Keeping the core calculations in a deterministic solver ensures that results can be validated, tested, and documented for an academic Mechanical Engineering project. AI support is reserved for interpretation and communication rather than authoritative numerical computation.
