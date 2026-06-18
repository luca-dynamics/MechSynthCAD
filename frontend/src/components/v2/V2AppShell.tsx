"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { analyzeFourBar, analyzeSliderCrank, sweepFourBar, sweepSliderCrank } from "@/lib/api";
import type { FourBarAnalysisResult, FourBarForm, FourBarSweepResponse, MechanismType, SliderCrankAnalysisResult, SliderCrankForm, SliderCrankSweepForm, SliderCrankSweepResponse, SweepForm, SynthesisResponse } from "@/types";
import { v2ThemeClass, v2Tokens } from "@/components/v2/theme";
import type { V2AgentIntent, V2AgentMessage, V2AgentStep, V2MechanismState, V2NavItem, V2ResolvedTheme, V2Theme } from "@/components/v2/types";
import { V2MissionCenter } from "@/components/v2/V2MissionCenter";
import { V2MissionSidebar } from "@/components/v2/V2MissionSidebar";
import { V2OperationsPanel } from "@/components/v2/V2OperationsPanel";

const initialForm: FourBarForm = { l1: 120, l2: 35, l3: 90, l4: 80, theta2_deg: 30, omega2: 10, alpha2: 0 };
const initialSweep: SweepForm = { theta2_start_deg: 0, theta2_end_deg: 360, theta2_step_deg: 10 };
const initialSliderCrankForm: SliderCrankForm = { crank_radius: 30, connecting_rod_length: 100, theta_deg: 30, omega: 10, alpha: 0, offset: 0 };
const initialSliderCrankSweep: SliderCrankSweepForm = { theta_start_deg: 0, theta_end_deg: 360, theta_step_deg: 10 };

export function V2AppShell() {
  const [active, setActive] = useState<V2NavItem>("Workspace");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<V2Theme>("dark");
  const [selectedMechanism, setSelectedMechanism] = useState<MechanismType>("four_bar");
  const [form, setForm] = useState<FourBarForm>(initialForm);
  const [sweepForm, setSweepForm] = useState<SweepForm>(initialSweep);
  const [result, setResult] = useState<FourBarAnalysisResult | null>(null);
  const [sweepResult, setSweepResult] = useState<FourBarSweepResponse | null>(null);
  const [selectedSampleIndex, setSelectedSampleIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSweeping, setIsSweeping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sliderCrankForm, setSliderCrankForm] = useState<SliderCrankForm>(initialSliderCrankForm);
  const [sliderCrankResult, setSliderCrankResult] = useState<SliderCrankAnalysisResult | null>(null);
  const [sliderCrankSweepForm, setSliderCrankSweepForm] = useState<SliderCrankSweepForm>(initialSliderCrankSweep);
  const [sliderCrankSweepResult, setSliderCrankSweepResult] = useState<SliderCrankSweepResponse | null>(null);
  const [selectedSliderCrankSampleIndex, setSelectedSliderCrankSampleIndex] = useState(0);
  const [isSliderCrankPlaying, setIsSliderCrankPlaying] = useState(false);
  const [isSliderCrankSweeping, setIsSliderCrankSweeping] = useState(false);
  const [isSliderCrankLoading, setIsSliderCrankLoading] = useState(false);
  const [sliderCrankError, setSliderCrankError] = useState<string | null>(null);
  const [latestSynthesisRecommendations, setLatestSynthesisRecommendations] = useState<SynthesisResponse | null>(null);
  const [messages, setMessages] = useState<V2AgentMessage[]>([buildAgentMessage("Deterministic Engineering Agent ready. I can inspect parameters, select existing solver tools, summarize returned values, and prepare report-ready next steps without calculating engineering values myself.")]);

  const resolvedTheme: V2ResolvedTheme = theme === "light" ? "light" : "dark";
  const displayResult = useFourBarDisplayResult(result, sweepResult, selectedSampleIndex);
  const displaySliderCrankResult = useSliderCrankDisplayResult(sliderCrankResult, sliderCrankSweepResult, selectedSliderCrankSampleIndex, sliderCrankForm);
  const solverResult = selectedMechanism === "four_bar" ? displayResult || result : displaySliderCrankResult;
  const currentSweepResult = selectedMechanism === "four_bar" ? sweepResult : sliderCrankSweepResult;
  const inputParameters = selectedMechanism === "four_bar" ? form : sliderCrankForm;
  const activeTask = isLoading || isSliderCrankLoading ? "analysis running" : isSweeping || isSliderCrankSweeping ? "simulation running" : solverResult ? "solver result ready" : "waiting for command";

  useEffect(() => { if (!isPlaying || !sweepResult?.samples.length) return; const interval = window.setInterval(() => setSelectedSampleIndex((index) => (index + 1) % sweepResult.samples.length), 180); return () => window.clearInterval(interval); }, [isPlaying, sweepResult]);
  useEffect(() => { if (!isSliderCrankPlaying || !sliderCrankSweepResult?.samples.length) return; const interval = window.setInterval(() => setSelectedSliderCrankSampleIndex((index) => (index + 1) % sliderCrankSweepResult.samples.length), 180); return () => window.clearInterval(interval); }, [isSliderCrankPlaying, sliderCrankSweepResult]);
  useEffect(() => { setIsPlaying(false); setIsSliderCrankPlaying(false); setLatestSynthesisRecommendations(null); }, [selectedMechanism]);

  const runAnalysis = useCallback(async () => {
    setIsLoading(true); setError(null);
    try { const response = await analyzeFourBar(form); setResult(response); setSweepResult(null); setIsPlaying(false); return response as Record<string, unknown>; }
    catch (analysisError) { setError(analysisError instanceof Error ? analysisError.message : "Unable to run analysis"); setResult(null); return null; }
    finally { setIsLoading(false); }
  }, [form]);

  const runSliderCrankAnalysis = useCallback(async () => {
    setIsSliderCrankLoading(true); setSliderCrankError(null);
    try { const response = await analyzeSliderCrank(sliderCrankForm); setSliderCrankResult(response); setSliderCrankSweepResult(null); setIsSliderCrankPlaying(false); return response as Record<string, unknown>; }
    catch (analysisError) { setSliderCrankError(analysisError instanceof Error ? analysisError.message : "Unable to run slider-crank analysis"); setSliderCrankResult(null); return null; }
    finally { setIsSliderCrankLoading(false); }
  }, [sliderCrankForm]);

  const runSweep = useCallback(async () => {
    setIsSweeping(true); setError(null); setIsPlaying(false);
    try { const response = await sweepFourBar({ ...form, ...sweepForm }); setSweepResult(response); setSelectedSampleIndex(0); return response as Record<string, unknown>; }
    catch (sweepError) { setError(sweepError instanceof Error ? sweepError.message : "Unable to run simulation"); setSweepResult(null); return null; }
    finally { setIsSweeping(false); }
  }, [form, sweepForm]);

  const runSliderCrankSweep = useCallback(async () => {
    setIsSliderCrankSweeping(true); setSliderCrankError(null); setIsSliderCrankPlaying(false);
    try { const response = await sweepSliderCrank({ ...sliderCrankForm, ...sliderCrankSweepForm }); setSliderCrankSweepResult(response); setSelectedSliderCrankSampleIndex(0); return response as Record<string, unknown>; }
    catch (sweepError) { setSliderCrankError(sweepError instanceof Error ? sweepError.message : "Unable to run slider-crank simulation"); setSliderCrankSweepResult(null); return null; }
    finally { setIsSliderCrankSweeping(false); }
  }, [sliderCrankForm, sliderCrankSweepForm]);

  const mechanismState: V2MechanismState = {
    selectedMechanism, setSelectedMechanism, form, setForm, sweepForm, setSweepForm, result, displayResult, sweepResult, selectedSampleIndex, setSelectedSampleIndex, isPlaying, setIsPlaying, isLoading, isSweeping, error, runAnalysis, runSweep,
    sliderCrankForm, setSliderCrankForm, sliderCrankSweepForm, setSliderCrankSweepForm, sliderCrankResult, displaySliderCrankResult, sliderCrankSweepResult, selectedSliderCrankSampleIndex, setSelectedSliderCrankSampleIndex, isSliderCrankPlaying, setIsSliderCrankPlaying, isSliderCrankLoading, isSliderCrankSweeping, sliderCrankError, runSliderCrankAnalysis, runSliderCrankSweep,
    inputParameters, solverResult: solverResult as Record<string, unknown> | null, sweepResultForReport: currentSweepResult as Record<string, unknown> | null, latestSynthesisRecommendations, setLatestSynthesisRecommendations,
  };

  const runAgentCommand = useCallback(async (command: string, modelProvider = "local") => {
    const intent = detectIntent(command);
    setMessages((thread) => [...thread, buildUserMessage(command)]);
    if (modelProvider !== "local") {
      setMessages((thread) => [...thread, buildAgentMessage(`Routing prompt to ${modelProvider} with current workspace context.`, intent, [completeStep("Model selected", modelProvider), completeStep("Provider request", "Calling the server-side model route without exposing Dev Cloud keys to the browser."), { label: "Model response", status: "pending", detail: "Waiting for provider completion." }], defaultActions)]);
      try {
        const response = await fetch("/api/v2/models/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ provider: modelProvider, prompt: command, context: { selectedMechanism, inputParameters, solverResult } }) });
        const json = await response.json() as { ok?: boolean; text?: string; error?: string; model?: string };
        if (!response.ok || !json.ok) throw new Error(json.error ?? "Model request failed");
        setMessages((thread) => [...thread, buildAgentMessage(json.text ?? "Model returned no text.", intent, [completeStep("Model selected", `${modelProvider}${json.model ? ` · ${json.model}` : ""}`), completeStep("Provider request", "Server-side model call completed."), completeStep("Workspace artifact guidance", "Use deterministic solver tools for numerical mechanism truth; use model output for planning, explanation, tables, charts, and presentation drafting.")], defaultActions)]);
      } catch (modelError) {
        setMessages((thread) => [...thread, buildAgentMessage(modelError instanceof Error ? modelError.message : "Model request failed", intent, [completeStep("Model selected", modelProvider), { label: "Provider request", status: "blocked", detail: "Connection failed. Add a Dev Cloud key in .env or verify a BYOK key in Settings." }], defaultActions)]);
      }
      return;
    }
    const missing = findMissingInputs(selectedMechanism, inputParameters);
    const hasResult = Boolean(solverResult);
    const preSteps = buildPreflightSteps(intent, missing, hasResult);
    if (missing.length > 0 && (intent === "analyze" || intent === "simulate")) {
      setMessages((thread) => [...thread, buildAgentMessage("I need complete numeric parameters before selecting a deterministic solver tool.", intent, preSteps, defaultActions)]);
      return;
    }
    if (intent === "analyze") {
      const response = selectedMechanism === "four_bar" ? await runAnalysis() : await runSliderCrankAnalysis();
      setMessages((thread) => [...thread, buildAgentMessage(`Analysis tool completed. ${summarizeDeterministicOutput(response)}`, intent, [...preSteps, completeStep("Tool selected", `${selectedMechanism} analysis endpoint`), completeStep("Solver response received", summarizeDeterministicOutput(response)), completeStep("Suggested next action", "Run simulation, generate a report, or request synthesis direction.")], defaultActions)]);
      return;
    }
    if (intent === "simulate") {
      const response = selectedMechanism === "four_bar" ? await runSweep() : await runSliderCrankSweep();
      setMessages((thread) => [...thread, buildAgentMessage(`Sweep simulation completed. ${summarizeDeterministicOutput(response)}`, intent, [...preSteps, completeStep("Tool selected", `${selectedMechanism} sweep endpoint`), completeStep("Solver response received", summarizeDeterministicOutput(response)), completeStep("Suggested next action", "Inspect samples, open results, or generate a report.")], defaultActions)]);
      return;
    }
    if (intent === "report") setActive("Reports");
    if (intent === "synthesize") setActive("Results");
    if (intent === "validate") setActive("Validation");
    if (intent === "missing_parameters" || intent === "help") setActive("Agent");
    setMessages((thread) => [...thread, buildAgentMessage(buildNonSolverReply(intent, missing, solverResult), intent, preSteps, defaultActions)]);
  }, [inputParameters, runAnalysis, runSliderCrankAnalysis, runSliderCrankSweep, runSweep, selectedMechanism, solverResult]);

  return <main className={`${v2ThemeClass[resolvedTheme]} ${v2Tokens.shell}`}>
    <div className="relative z-10 grid min-h-screen gap-3 p-2 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_390px]">
      <div className="fixed left-3 top-3 z-40 lg:hidden"><button onClick={() => setSidebarOpen((value) => !value)} className="rounded-xl border border-v2-border bg-[#080807] px-3 py-2 text-sm text-v2-text">Missions</button></div>
      <V2MissionSidebar active={active} onSelect={setActive} open={sidebarOpen} />
      <V2MissionCenter active={active} state={mechanismState} messages={messages} activeTask={activeTask} onCommand={runAgentCommand} onNavigate={setActive} theme={theme} onThemeChange={setTheme} />
      <V2OperationsPanel state={mechanismState} activeTask={activeTask} onOpenReports={() => setActive("Reports")} />
    </div>
  </main>;
}

function useFourBarDisplayResult(result: FourBarAnalysisResult | null, sweepResult: FourBarSweepResponse | null, selectedSampleIndex: number) {
  return useMemo<FourBarAnalysisResult | null>(() => {
    const sample = sweepResult?.samples[selectedSampleIndex];
    if (!sample || !sweepResult) return result;
    return { mechanism: "four_bar_linkage", valid: sample.valid, grashof_status: sweepResult.grashof_status, mobility: sweepResult.mobility, classification: sweepResult.classification, theta2_deg: sample.theta2_deg, theta3_deg: sample.theta3_deg, theta4_deg: sample.theta4_deg, joint_coordinates: sample.joint_coordinates, velocity_analysis: sample.velocity_analysis, acceleration_analysis: sample.acceleration_analysis, notes: sample.notes };
  }, [result, selectedSampleIndex, sweepResult]);
}

function useSliderCrankDisplayResult(result: SliderCrankAnalysisResult | null, sweepResult: SliderCrankSweepResponse | null, selectedSampleIndex: number, form: SliderCrankForm) {
  return useMemo<SliderCrankAnalysisResult | null>(() => {
    const sample = sweepResult?.samples[selectedSampleIndex];
    if (!sample) return result;
    return { mechanism: "slider_crank", valid: sample.valid, theta_deg: sample.theta_deg, crank_radius: form.crank_radius, connecting_rod_length: form.connecting_rod_length, offset: form.offset, slider_position: sample.slider_position, transmission_angle_deg: sample.transmission_angle_deg, joint_coordinates: sample.joint_coordinates, velocity_analysis: sample.velocity_analysis, acceleration_analysis: sample.acceleration_analysis, notes: sample.notes };
  }, [form, result, selectedSampleIndex, sweepResult]);
}

const defaultActions = [
  { label: "Run analysis", command: "Run analysis" },
  { label: "Run simulation", command: "Run simulation" },
  { label: "Generate report", command: "Generate report" },
  { label: "Recommend improvement", command: "Recommend improvement" },
  { label: "Open results", command: "Open results" },
];

function buildUserMessage(text: string): V2AgentMessage { return { id: crypto.randomUUID(), role: "user", text }; }
function buildAgentMessage(text: string, intent?: V2AgentIntent, steps?: V2AgentStep[], actions = defaultActions): V2AgentMessage { return { id: crypto.randomUUID(), role: "agent", text, intent, steps, actions }; }
function completeStep(label: string, detail: string): V2AgentStep { return { label, detail, status: "complete" }; }
function detectIntent(command: string): V2AgentIntent { const normalized = command.toLowerCase(); if (normalized.includes("sweep") || normalized.includes("simulate")) return "simulate"; if (normalized.includes("report")) return "report"; if (normalized.includes("recommend") || normalized.includes("improve") || normalized.includes("synthesize")) return "synthesize"; if (normalized.includes("validate")) return "validate"; if (normalized.includes("missing")) return "missing_parameters"; if (normalized.includes("help")) return "help"; return "analyze"; }
function findMissingInputs(_mechanism: MechanismType, inputParameters: Record<string, unknown>) { return Object.entries(inputParameters).filter(([, value]) => typeof value !== "number" || Number.isNaN(value)).map(([key]) => key); }
function buildPreflightSteps(intent: V2AgentIntent, missing: string[], hasResult: boolean): V2AgentStep[] { return [completeStep("Intent detected", intent), { label: "Parameter check", status: missing.length ? "blocked" : "complete", detail: missing.length ? `Missing or invalid: ${missing.join(", ")}` : "All required numeric fields are present." }, { label: "Tool selected", status: intent === "analyze" || intent === "simulate" ? "pending" : "complete", detail: intent === "analyze" || intent === "simulate" ? "Awaiting deterministic solver call." : "No solver call required for this command." }, { label: "Interpretation", status: hasResult ? "complete" : "pending", detail: hasResult ? "Existing deterministic result is available for summary and reporting." : "No solver result is available yet." }]; }
function buildNonSolverReply(intent: V2AgentIntent, missing: string[], solverResult: Record<string, unknown> | null) { if (intent === "missing_parameters") return missing.length ? `Missing or invalid parameters: ${missing.join(", ")}.` : "No required numeric parameters appear to be missing."; if (intent === "report") return solverResult ? "Opening the report builder with the available deterministic result context." : "Opening Reports. Run an analysis first for report-ready numerical content."; if (intent === "synthesize") return solverResult ? "Open Results and use synthesis recommendations to suggest iteration direction from solver output." : "Run analysis or simulation first; synthesis recommendations need deterministic result context."; if (intent === "validate") return "Opening validation context. This documents solver boundaries and source-of-truth rules."; return "I can run analysis, run a sweep simulation, generate a report, recommend improvement direction, or list missing parameters."; }

function summarizeDeterministicOutput(result: Record<string, unknown> | null) {
  if (!result) return "No deterministic result was returned; check the inspector error state.";
  const fields = ["valid", "theta2_deg", "theta3_deg", "theta4_deg", "theta_deg", "slider_position", "transmission_angle_deg", "sample_count", "valid_sample_count", "invalid_sample_count", "classification", "grashof_status"];
  const parts = fields.filter((field) => result[field] !== undefined && result[field] !== null).map((field) => `${field}: ${String(result[field])}`);
  return parts.length ? `Deterministic output summary — ${parts.join("; ")}.` : "Deterministic backend response stored; no compact scalar summary fields were present.";
}
