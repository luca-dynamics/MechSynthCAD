import type { V2AgentMessage, V2MechanismState } from "@/components/v2/types";

export function V2GuidedMissionChecklist({ state, messages = [] }: { state: V2MechanismState; messages?: V2AgentMessage[] }) {
  const parametersReady = Object.values(state.inputParameters).every((value) => typeof value === "number" && !Number.isNaN(value));
  const sweepReady = state.selectedMechanism === "four_bar" ? Boolean(state.sweepResult) : Boolean(state.sliderCrankSweepResult);
  const hasReport = messages.some((message) => message.intent === "report" || message.text.toLowerCase().includes("report"));
  const hasValidation = messages.some((message) => message.intent === "validate" || message.text.toLowerCase().includes("validation"));
  const hasSynthesis = Boolean(state.latestSynthesisRecommendations) || messages.some((message) => message.intent === "synthesize" || message.text.toLowerCase().includes("synthesis") || message.text.toLowerCase().includes("recommend"));
  const items = [
    ["Choose mechanism", true],
    ["Confirm parameters", parametersReady],
    ["Run deterministic analysis", Boolean(state.solverResult)],
    ["Run sweep simulation", sweepReady],
    ["Review CAD artifact", true],
    ["Generate synthesis recommendation", hasSynthesis],
    ["Generate report", hasReport],
    ["Validate workflow", hasValidation],
  ] as const;
  return <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">{items.map(([label, done], index) => <div key={label} className="flex items-center gap-2 rounded-xl border border-v2-border bg-[#121110] px-3 py-2 text-xs"><span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${done ? "bg-amber-500 text-black" : "bg-stone-800 text-v2-muted"}`}>{done ? "✓" : index + 1}</span><span className={done ? "text-v2-text" : "text-v2-muted"}>{label}</span></div>)}</div>;
}
