"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { CadWorkspace } from "@/components/CadWorkspace";
import { MechanismInputPanel } from "@/components/MechanismInputPanel";
import { MechanismSelector } from "@/components/MechanismSelector";
import { ReportPreviewPanel } from "@/components/ReportPreviewPanel";
import { ResultsPanel } from "@/components/ResultsPanel";
import { SimulationControls } from "@/components/SimulationControls";
import { SliderCrankInputPanel } from "@/components/SliderCrankInputPanel";
import { SliderCrankResultsPanel } from "@/components/SliderCrankResultsPanel";
import { SliderCrankSimulationControls } from "@/components/SliderCrankSimulationControls";
import { SliderCrankWorkspace } from "@/components/SliderCrankWorkspace";
import { SynthesisRecommendationPanel } from "@/components/SynthesisRecommendationPanel";
import { ValidationMatrix } from "@/components/ValidationMatrix";
import { analyzeFourBar, analyzeSliderCrank, sweepFourBar, sweepSliderCrank } from "@/lib/api";
import type { FourBarAnalysisResult, FourBarForm, FourBarSweepResponse, MechanismType, SliderCrankAnalysisResult, SliderCrankForm, SliderCrankSweepForm, SliderCrankSweepResponse, SweepForm, SynthesisResponse } from "@/types";

const initialForm: FourBarForm = { l1: 120, l2: 35, l3: 90, l4: 80, theta2_deg: 30, omega2: 10, alpha2: 0 };
const initialSweep: SweepForm = { theta2_start_deg: 0, theta2_end_deg: 360, theta2_step_deg: 10 };
const initialSliderCrankForm: SliderCrankForm = { crank_radius: 30, connecting_rod_length: 100, theta_deg: 30, omega: 10, alpha: 0, offset: 0 };
const initialSliderCrankSweep: SliderCrankSweepForm = { theta_start_deg: 0, theta_end_deg: 360, theta_step_deg: 10 };
const nav = ["Overview", "Workspace", "Results", "Agent", "Reports", "Validation", "Settings"] as const;
type NavItem = (typeof nav)[number];
type AgentMessage = { role: "user" | "agent"; text: string; details?: string[] };

export function V2AppShell() {
  const [active, setActive] = useState<NavItem>("Workspace");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
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
  const [messages, setMessages] = useState<AgentMessage[]>([{ role: "agent", text: "Deterministic Engineering Agent ready. I can select solver actions, validate missing parameters, and summarize backend results without inventing numerical values." }]);
  const [command, setCommand] = useState("");
  const [latestSynthesisRecommendations, setLatestSynthesisRecommendations] = useState<SynthesisResponse | null>(null);

  const selectedSample = sweepResult?.samples[selectedSampleIndex] ?? null;
  const displayResult = useMemo<FourBarAnalysisResult | null>(() => selectedSample && sweepResult ? { mechanism: "four_bar_linkage", valid: selectedSample.valid, grashof_status: sweepResult.grashof_status, mobility: sweepResult.mobility, classification: sweepResult.classification, theta2_deg: selectedSample.theta2_deg, theta3_deg: selectedSample.theta3_deg, theta4_deg: selectedSample.theta4_deg, joint_coordinates: selectedSample.joint_coordinates, velocity_analysis: selectedSample.velocity_analysis, acceleration_analysis: selectedSample.acceleration_analysis, notes: selectedSample.notes } : result, [result, selectedSample, sweepResult]);
  const selectedSliderCrankSample = sliderCrankSweepResult?.samples[selectedSliderCrankSampleIndex] ?? null;
  const displaySliderCrankResult = useMemo<SliderCrankAnalysisResult | null>(() => selectedSliderCrankSample ? { mechanism: "slider_crank", valid: selectedSliderCrankSample.valid, theta_deg: selectedSliderCrankSample.theta_deg, crank_radius: sliderCrankForm.crank_radius, connecting_rod_length: sliderCrankForm.connecting_rod_length, offset: sliderCrankForm.offset, slider_position: selectedSliderCrankSample.slider_position, transmission_angle_deg: selectedSliderCrankSample.transmission_angle_deg, joint_coordinates: selectedSliderCrankSample.joint_coordinates, velocity_analysis: selectedSliderCrankSample.velocity_analysis, acceleration_analysis: selectedSliderCrankSample.acceleration_analysis, notes: selectedSliderCrankSample.notes } : sliderCrankResult, [selectedSliderCrankSample, sliderCrankForm, sliderCrankResult]);
  const solverResult = selectedMechanism === "four_bar" ? displayResult || result : displaySliderCrankResult;
  const sweep = selectedMechanism === "four_bar" ? sweepResult : sliderCrankSweepResult;
  const inputParameters = selectedMechanism === "four_bar" ? form : sliderCrankForm;

  useEffect(() => { if (!isPlaying || !sweepResult?.samples.length) return; const i = window.setInterval(() => setSelectedSampleIndex((x) => (x + 1) % sweepResult.samples.length), 180); return () => window.clearInterval(i); }, [isPlaying, sweepResult]);
  useEffect(() => { if (!isSliderCrankPlaying || !sliderCrankSweepResult?.samples.length) return; const i = window.setInterval(() => setSelectedSliderCrankSampleIndex((x) => (x + 1) % sliderCrankSweepResult.samples.length), 180); return () => window.clearInterval(i); }, [isSliderCrankPlaying, sliderCrankSweepResult]);
  useEffect(() => { setIsPlaying(false); setIsSliderCrankPlaying(false); setLatestSynthesisRecommendations(null); }, [selectedMechanism]);

  async function runAnalysis(event?: FormEvent<HTMLFormElement>) { event?.preventDefault(); setIsLoading(true); setError(null); try { setResult(await analyzeFourBar(form)); setSweepResult(null); setIsPlaying(false); } catch (e) { setError(e instanceof Error ? e.message : "Unable to run analysis"); setResult(null); } finally { setIsLoading(false); } }
  async function runSliderCrankAnalysis(event?: FormEvent<HTMLFormElement>) { event?.preventDefault(); setIsSliderCrankLoading(true); setSliderCrankError(null); try { setSliderCrankResult(await analyzeSliderCrank(sliderCrankForm)); setSliderCrankSweepResult(null); setIsSliderCrankPlaying(false); } catch (e) { setSliderCrankError(e instanceof Error ? e.message : "Unable to run slider-crank analysis"); setSliderCrankResult(null); } finally { setIsSliderCrankLoading(false); } }
  async function runSweep() { setIsSweeping(true); setError(null); setIsPlaying(false); try { setSweepResult(await sweepFourBar({ ...form, ...sweepForm })); setSelectedSampleIndex(0); } catch (e) { setError(e instanceof Error ? e.message : "Unable to run simulation"); setSweepResult(null); } finally { setIsSweeping(false); } }
  async function runSliderCrankSweep() { setIsSliderCrankSweeping(true); setSliderCrankError(null); setIsSliderCrankPlaying(false); try { setSliderCrankSweepResult(await sweepSliderCrank({ ...sliderCrankForm, ...sliderCrankSweepForm })); setSelectedSliderCrankSampleIndex(0); } catch (e) { setSliderCrankError(e instanceof Error ? e.message : "Unable to run slider-crank simulation"); setSliderCrankSweepResult(null); } finally { setIsSliderCrankSweeping(false); } }

  const runAgentCommand = useCallback(async (text: string) => {
    const normalized = text.toLowerCase();
    const intent = normalized.includes("sweep") || normalized.includes("simulate") ? "simulate" : normalized.includes("report") ? "report" : normalized.includes("recommend") || normalized.includes("improve") || normalized.includes("synthesize") ? "synthesize" : normalized.includes("validate") ? "validate" : normalized.includes("missing") || normalized.includes("help") ? "missing_parameters" : "analyze";
    setMessages((m) => [...m, { role: "user", text }, { role: "agent", text: `Detected intent: ${intent}`, details: ["Source of truth: deterministic backend solver endpoints.", "External model providers are not connected in this PR."] }]);
    if (intent === "analyze") { selectedMechanism === "four_bar" ? await runAnalysis() : await runSliderCrankAnalysis(); setMessages((m) => [...m, { role: "agent", text: "Solver action selected: run selected mechanism analysis.", details: ["Result summary will be visible in Results after the deterministic endpoint returns.", "Suggested next action: run a sweep simulation or generate a report."] }]); }
    else if (intent === "simulate") { selectedMechanism === "four_bar" ? await runSweep() : await runSliderCrankSweep(); setMessages((m) => [...m, { role: "agent", text: "Solver action selected: run sweep simulation.", details: ["Timeline samples are rendered from backend output only.", "Suggested next action: inspect invalid samples or request synthesis recommendations."] }]); }
    else if (intent === "report") setActive("Reports");
    else if (intent === "synthesize") setActive("Results");
    else setActive(intent === "validate" ? "Validation" : "Agent");
  }, [selectedMechanism, form, sliderCrankForm, sweepForm, sliderCrankSweepForm]);

  const dark = theme !== "light";
  return <main className={`${dark ? "bg-[#11100f] text-stone-100" : "bg-stone-100 text-stone-950"} min-h-screen pb-32`}>
    <header className={`sticky top-0 z-30 border-b ${dark ? "border-stone-800 bg-[#171514]/95" : "border-stone-300 bg-white/95"} px-4 py-3 backdrop-blur`}><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><button className="rounded-lg border border-amber-700/50 px-3 py-2 text-amber-500 lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>Menu</button><button className="hidden rounded-lg border border-amber-700/50 px-3 py-2 text-amber-500 lg:block" onClick={() => setSidebarOpen(!sidebarOpen)}>{sidebarOpen ? "Collapse" : "Expand"}</button><div><p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">MechSynthCAD V2</p><h1 className="font-bold">AI engineering workspace</h1></div></div><Link href="/" className="rounded-lg border border-amber-700/60 px-3 py-2 text-sm font-semibold text-amber-500">Classic Supervisor View</Link></div></header>
    <div className="grid gap-4 p-4 lg:grid-cols-[var(--side)_minmax(0,1fr)_360px]" style={{ ["--side" as string]: sidebarOpen ? "230px" : "0px" }}>
      {sidebarOpen && <aside className={`${dark ? "border-stone-800 bg-[#191715]" : "border-stone-300 bg-white"} rounded-2xl border p-3`}><nav className="space-y-2">{nav.map((item) => <button key={item} onClick={() => setActive(item)} className={`w-full rounded-xl px-3 py-2 text-left text-sm ${active === item ? "bg-amber-600 text-white" : "hover:bg-amber-950/20"}`}>{item}</button>)}</nav><div className="mt-5 rounded-xl border border-amber-700/30 p-3 text-xs text-stone-400">Agent mode: deterministic. Numerical values must come from solvers.</div></aside>}
      <section className="min-w-0 space-y-4"><Overview active={active} dark={dark} selectedMechanism={selectedMechanism} solverResult={solverResult} sweep={sweep} />{(active === "Workspace" || active === "Overview" || active === "Agent") && (selectedMechanism === "four_bar" ? <CadWorkspace displayResult={displayResult} sweepResult={sweepResult} selectedSampleIndex={selectedSampleIndex} setSelectedSampleIndex={setSelectedSampleIndex} isPlaying={isPlaying} setIsPlaying={setIsPlaying} /> : <SliderCrankWorkspace result={displaySliderCrankResult} sweepResult={sliderCrankSweepResult} selectedSampleIndex={selectedSliderCrankSampleIndex} setSelectedSampleIndex={setSelectedSliderCrankSampleIndex} isPlaying={isSliderCrankPlaying} setIsPlaying={setIsSliderCrankPlaying} />)}{active === "Results" && <SynthesisRecommendationPanel selectedMechanism={selectedMechanism} inputParameters={inputParameters} solverResult={solverResult as Record<string, unknown> | null} sweepResult={sweep as Record<string, unknown> | null} onRecommendationsGenerated={setLatestSynthesisRecommendations} onRecommendationsCleared={() => setLatestSynthesisRecommendations(null)} />}{active === "Reports" && <ReportPreviewPanel mechanismType={selectedMechanism} inputParameters={inputParameters} solverResult={solverResult as Record<string, unknown> | null} sweepResult={sweep as Record<string, unknown> | null} agentWorkflow={{ messages }} synthesisRecommendations={latestSynthesisRecommendations as Record<string, unknown> | null} />}{active === "Validation" && <ValidationMatrix />}{active === "Settings" && <Settings theme={theme} setTheme={setTheme} />}{active === "Agent" && <Conversation messages={messages} />}</section>
      <aside className={`${dark ? "border-stone-800 bg-[#191715]" : "border-stone-300 bg-white"} h-fit rounded-2xl border p-4`}><h2 className="font-semibold text-amber-500">Context Inspector</h2><MechanismSelector selectedMechanism={selectedMechanism} onChange={setSelectedMechanism} /><div className="mt-4 space-y-4">{selectedMechanism === "four_bar" ? <><MechanismInputPanel form={form} setForm={setForm} onRunAnalysis={runAnalysis} isLoading={isLoading} /><SimulationControls sweepForm={sweepForm} setSweepForm={setSweepForm} onRunSweep={runSweep} isSweeping={isSweeping} /><ResultsPanel error={error} displayResult={displayResult} result={result} sweepResult={sweepResult} /></> : <><SliderCrankInputPanel form={sliderCrankForm} setForm={setSliderCrankForm} onRunAnalysis={runSliderCrankAnalysis} isLoading={isSliderCrankLoading} /><SliderCrankSimulationControls sweepForm={sliderCrankSweepForm} setSweepForm={setSliderCrankSweepForm} onRunSweep={runSliderCrankSweep} isSweeping={isSliderCrankSweeping} /><SliderCrankResultsPanel error={sliderCrankError} result={displaySliderCrankResult} sweepResult={sliderCrankSweepResult} selectedSampleIndex={selectedSliderCrankSampleIndex} /></>}</div></aside>
    </div><Composer command={command} setCommand={setCommand} onSubmit={runAgentCommand} />
  </main>;
}
function Overview({ active, dark, selectedMechanism, solverResult, sweep }: { active: string; dark: boolean; selectedMechanism: MechanismType; solverResult: unknown; sweep: { sample_count?: number } | null }) { return <section className={`${dark ? "border-stone-800 bg-[#191715]" : "border-stone-300 bg-white"} rounded-2xl border p-4`}><p className="text-xs uppercase tracking-[0.25em] text-amber-500">{active}</p><div className="mt-3 grid gap-3 md:grid-cols-4"><Metric label="Mechanism" value={selectedMechanism.replace("_", "-")} /><Metric label="Analysis" value={solverResult ? "ready" : "not run"} /><Metric label="Sweep samples" value={String(sweep?.sample_count ?? 0)} /><Metric label="Agent" value="deterministic" /></div></section>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-amber-700/20 bg-black/10 p-3"><p className="text-xs text-stone-500">{label}</p><p className="font-semibold">{value}</p></div>; }
function Conversation({ messages }: { messages: AgentMessage[] }) { return <section className="rounded-2xl border border-stone-800 bg-[#191715] p-4"><h2 className="font-semibold text-amber-500">Agent Conversation</h2><div className="mt-3 space-y-3">{messages.map((m, i) => <article key={i} className={`rounded-xl p-3 ${m.role === "user" ? "bg-amber-700/20" : "bg-stone-900/70"}`}><p className="text-sm font-semibold">{m.role}</p><p className="text-sm">{m.text}</p>{m.details && <ul className="mt-2 list-disc pl-5 text-xs text-stone-400">{m.details.map((d) => <li key={d}>{d}</li>)}</ul>}</article>)}</div></section>; }
function Settings({ theme, setTheme }: { theme: "dark" | "light" | "system"; setTheme: (t: "dark" | "light" | "system") => void }) { const providers = ["OpenAI", "Anthropic", "Gemini", "BYOK", "Local model"]; return <section className="space-y-4 rounded-2xl border border-stone-800 bg-[#191715] p-4"><h2 className="text-xl font-semibold text-amber-500">Settings</h2>{["General: workspace behavior and app status", "Agents: Deterministic Engineering Agent with placeholder tool permissions", "Solver: numerical source is the deterministic backend solver; supports Four-Bar and Slider-Crank", "Reports: Markdown export and browser print/save as PDF", "About: MechSynthCAD analyzes and synthesizes planar mechanisms"].map((x) => <p key={x} className="rounded-xl border border-stone-800 p-3 text-sm">{x}</p>)}<div className="rounded-xl border border-stone-800 p-3"><h3 className="font-semibold">Models</h3><p className="text-sm text-stone-400">Current mode: Local deterministic agent. External models are not connected yet.</p><div className="mt-2 flex flex-wrap gap-2">{providers.map((p) => <span key={p} className="rounded-full border border-stone-700 px-3 py-1 text-xs">{p} · coming soon</span>)}</div></div><label className="block text-sm">Theme<select className="mt-1 rounded-lg border border-stone-700 bg-stone-950 px-3 py-2" value={theme} onChange={(e) => setTheme(e.target.value as "dark" | "light" | "system")}><option>dark</option><option>light</option><option>system</option></select></label></section>; }
function Composer({ command, setCommand, onSubmit }: { command: string; setCommand: (v: string) => void; onSubmit: (v: string) => void }) { const chips = ["Analyze this four-bar linkage.", "Run a sweep simulation.", "Generate a report from the current result.", "Suggest how to improve the output angle.", "What parameters are missing?"]; return <form className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-amber-700/40 bg-[#171514]/95 p-3 shadow-2xl backdrop-blur" onSubmit={(e) => { e.preventDefault(); if (command.trim()) { onSubmit(command.trim()); setCommand(""); } }}><div className="mb-2 flex gap-2 overflow-x-auto">{chips.map((c) => <button type="button" key={c} onClick={() => setCommand(c)} className="shrink-0 rounded-full border border-stone-700 px-3 py-1 text-xs text-stone-300">{c}</button>)}</div><div className="flex gap-2"><input className="min-w-0 flex-1 rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none focus:border-amber-600" value={command} onChange={(e) => setCommand(e.target.value)} placeholder="Ask the deterministic engineering agent..." /><button className="rounded-xl bg-amber-600 px-5 py-3 font-semibold text-white">Run</button></div></form>; }
