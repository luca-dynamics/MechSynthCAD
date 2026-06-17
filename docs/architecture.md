# MechSynthCAD Architecture

MechSynthCAD is designed as a CAD-based engineering software tool for planar mechanism analysis and synthesis. The application separates user interaction, deterministic calculation, visualization, and AI-assisted explanation so that engineering outputs remain traceable and reproducible.

## Frontend: React/Next.js

The frontend is a Next.js TypeScript application styled with Tailwind CSS. It provides the engineering dashboard, four-bar linkage input form, CAD-style visualization area, and panels for deterministic results and future AI-generated explanations.

## Backend: Python FastAPI

The backend is a FastAPI service that exposes typed REST endpoints for mechanism analysis. The first API contract is `POST /api/mechanisms/fourbar/analyze`, which accepts four-bar geometry and input motion parameters and returns deterministic four-bar position data, including joint coordinates for A, B, C, and D when the configuration is valid. PR 6 extends this response with deterministic velocity and acceleration analysis that uses `ω2` and `α2` to compute `ω3`, `ω4`, `α3`, `α4`, and joint B/C linear velocity and acceleration. PR 5 adds `POST /api/mechanisms/fourbar/sweep`, and PR 6 extends each sweep sample so position, velocity, and acceleration data are preserved across the θ2 range.

## Deterministic Mathematical Solver

The deterministic kinematic engine owns the core engineering calculations. The current solver performs four-bar position analysis and returns reproducible angular and joint-coordinate outputs. PR 6 adds vector-loop velocity and acceleration equations in the backend solver: `ω2` produces joint B velocity and the solved `ω3`/`ω4` values, while `α2` and centripetal terms produce joint B/C acceleration and `α3`/`α4`. Singular or near-singular velocity/acceleration systems keep the position result valid but return null motion unknowns with explanatory notes. PR 5 adds deterministic sweep orchestration over input crank angles without duplicating position equations; every simulation sample now comes from the backend solver with position, velocity, and acceleration fields.

## AI-Assisted Explanation Layer

The AI layer is planned as an assistive support layer only. It may help explain solver outputs, guide design iteration, validate assumptions, and draft report text. It will not replace the deterministic mathematical solver or generate unverified engineering results.

## CAD-Style SVG Visualization Plan

PR 4 replaces the placeholder drawing with a real CAD-style SVG workspace driven by deterministic backend joint coordinates. The frontend normalizes A/B/C/D engineering coordinates into SVG screen coordinates, inverts the Y-axis so positive engineering Y appears upward, and renders ground, crank, coupler, rocker, joint markers, and labels. This is a standalone 2D computer-aided mechanism visualization layer for planar linkage analysis, not a full industrial CAD kernel.


## PR 5 Simulation and Graphing

PR 5 introduces a lightweight simulation workflow for four-bar mechanisms. The frontend sends link lengths, motion inputs, and θ2 sweep bounds to the backend sweep endpoint. The backend returns ordered samples, and the frontend uses those samples to animate the SVG mechanism with play/pause, previous/next, and scrub controls. Invalid samples are retained in the response and handled visually rather than being recomputed or hidden by the frontend.

The graphing layer is a simple SVG line chart that plots θ3 and θ4 against θ2. Invalid samples are represented as gaps so the chart remains tied to deterministic backend results. Velocity and acceleration graphing remains a follow-up opportunity; PR 6 keeps the UI focused by displaying structured angular and linear velocity/acceleration values while preserving the raw JSON response.

## Why AI Does Not Perform Core Calculations

Kinematic analysis requires repeatable, auditable calculations based on established mechanism theory. Keeping the core calculations in a deterministic solver ensures that results can be validated, tested, and documented for an academic Mechanical Engineering project. AI support is reserved for interpretation and communication rather than authoritative numerical computation.
