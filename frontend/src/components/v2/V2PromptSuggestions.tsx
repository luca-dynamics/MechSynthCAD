import type { V2ArtifactKind, V2NavItem, V2ProviderId } from "@/components/v2/types";
import type { MechanismType } from "@/types";

type Suggestion = { label: string; run: () => void; mode: "action" | "draft"; prompt?: string };

export function V2PromptSuggestions({ onCommand, activeProvider, onMechanismSelect, onOpenArtifact, onNavigate, onPrefill }: { onCommand: (command: string, provider?: V2ProviderId) => void; activeProvider: V2ProviderId; onMechanismSelect: (mechanism: MechanismType) => void; onOpenArtifact: (kind: V2ArtifactKind) => void; onNavigate: (item: V2NavItem) => void; onPrefill?: (command: string) => void }) {
  const submit = (command: string) => onCommand(command, activeProvider);
  const suggestions: Suggestion[] = [
    { label: "Run analysis now", mode: "action", run: () => submit("Run analysis") },
    { label: "Run simulation now", mode: "action", run: () => submit("Run simulation") },
    { label: "Open report builder", mode: "action", run: () => { onNavigate("Reports"); onOpenArtifact("report"); } },
    { label: "Validate workflow now", mode: "action", run: () => { onOpenArtifact("validation"); submit("Validate the workflow"); } },
    { label: "Switch to slider-crank", mode: "action", run: () => onMechanismSelect("slider_crank") },
    { label: "Open parameter intake", mode: "action", run: () => onOpenArtifact("parameters") },
    { label: "Draft: explain result", mode: "draft", prompt: "Explain the deterministic result using only solver-returned values.", run: () => onPrefill?.("Explain the deterministic result using only solver-returned values.") },
    { label: "Draft: recommend improvements", mode: "draft", prompt: "Recommend design improvements after checking deterministic evidence.", run: () => onPrefill?.("Recommend design improvements after checking deterministic evidence.") },
    { label: "Draft: supervisor report", mode: "draft", prompt: "Prepare a supervisor report from available deterministic evidence.", run: () => { onNavigate("Reports"); onOpenArtifact("report"); onPrefill?.("Prepare a supervisor report from available deterministic evidence."); } },
  ];
  return <div className="flex flex-wrap gap-2">{suggestions.map((item) => <button key={item.label} type="button" aria-label={`${item.mode === "draft" ? "Draft prompt only" : "Run action"}: ${item.label}`} title={item.mode === "draft" ? "Drafts text in the command box without submitting." : "Runs immediately."} onClick={item.run} className="min-h-9 rounded-full border border-v2-border bg-[#121110] px-3 py-1.5 text-[11px] font-semibold text-v2-muted hover:border-amber-600/50 hover:text-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500/60">{item.label}</button>)}</div>;
}
