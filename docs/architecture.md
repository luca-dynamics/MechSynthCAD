# MechSynthCAD Architecture

MechSynthCAD is designed as a CAD-based engineering software tool for planar mechanism analysis and synthesis. The application separates user interaction, deterministic calculation, visualization, and AI-assisted explanation so that engineering outputs remain traceable and reproducible.

## Frontend: React/Next.js

The frontend is a Next.js TypeScript application styled with Tailwind CSS. It provides the engineering dashboard, four-bar linkage input form, CAD-style visualization area, and panels for deterministic results and future AI-generated explanations.

## Backend: Python FastAPI

The backend is a FastAPI service that exposes typed REST endpoints for mechanism analysis. The first API contract is `POST /api/mechanisms/fourbar/analyze`, which accepts four-bar geometry and input motion parameters and returns deterministic four-bar position data, including joint coordinates for A, B, C, and D when the configuration is valid. PR 5 adds `POST /api/mechanisms/fourbar/sweep`, which samples a θ2 range by repeatedly calling the deterministic single-angle solver and preserving valid and invalid configurations.

## Deterministic Mathematical Solver

The deterministic kinematic engine owns the core engineering calculations. The current solver performs four-bar position analysis and returns reproducible angular and joint-coordinate outputs. PR 5 adds deterministic sweep orchestration over input crank angles without duplicating position equations; every simulation sample comes from the backend solver. Future PRs may extend this layer with velocity and acceleration analysis, but those calculations remain deferred and separate from visualization and AI assistance.

## AI-Assisted Explanation Layer

The AI layer is planned as an assistive support layer only. It may help explain solver outputs, guide design iteration, validate assumptions, and draft report text. It will not replace the deterministic mathematical solver or generate unverified engineering results.

## CAD-Style SVG Visualization Plan

PR 4 replaces the placeholder drawing with a real CAD-style SVG workspace driven by deterministic backend joint coordinates. The frontend normalizes A/B/C/D engineering coordinates into SVG screen coordinates, inverts the Y-axis so positive engineering Y appears upward, and renders ground, crank, coupler, rocker, joint markers, and labels. This is a standalone 2D computer-aided mechanism visualization layer for planar linkage analysis, not a full industrial CAD kernel.


## PR 5 Simulation and Graphing

PR 5 introduces a lightweight simulation workflow for four-bar mechanisms. The frontend sends link lengths, motion inputs, and θ2 sweep bounds to the backend sweep endpoint. The backend returns ordered samples, and the frontend uses those samples to animate the SVG mechanism with play/pause, previous/next, and scrub controls. Invalid samples are retained in the response and handled visually rather than being recomputed or hidden by the frontend.

The graphing layer is a simple SVG line chart that plots θ3 and θ4 against θ2. Invalid samples are represented as gaps so the chart remains tied to deterministic backend results. Velocity and acceleration graphs are intentionally not included yet because velocity and acceleration analysis are deferred to a later PR.

## Why AI Does Not Perform Core Calculations

Kinematic analysis requires repeatable, auditable calculations based on established mechanism theory. Keeping the core calculations in a deterministic solver ensures that results can be validated, tested, and documented for an academic Mechanical Engineering project. AI support is reserved for interpretation and communication rather than authoritative numerical computation.
