import type { V2ArtifactKind, V2NavItem, V2ProviderId } from "@/components/v2/types";
import type { MechanismType } from "@/types";

type Suggestion = { label: string; run: () => void };

export function V2PromptSuggestions({ onCommand, activeProvider, onMechanismSelect, onOpenArtifact, onNavigate, onPrefill }: { onCommand: (command: string, provider?: V2ProviderId) => void; activeProvider: V2ProviderId; onMechanismSelect: (mechanism: MechanismType) => void; onOpenArtifact: (kind: V2ArtifactKind) => void; onNavigate: (item: V2NavItem) => void; onPrefill?: (command: string) => void }) {
  const submit = (command: string) => onCommand(command, activeProvider);
  const suggestions: Suggestion[] = [
    { label: "Run analysis", run: () => submit("Run analysis") },
    { label: "Run simulation", run: () => submit("Run simulation") },
    { label: "Explain deterministic result", run: () => submit("Explain the deterministic result") },
    { label: "Recommend design improvements", run: () => submit("Recommend design improvements") },
    { label: "Generate report", run: () => { onNavigate("Reports"); submit("Generate report"); } },
    { label: "Prepare supervisor report", run: () => { onNavigate("Reports"); onOpenArtifact("report"); submit("Prepare supervisor report"); } },
    { label: "Validate workflow", run: () => { onOpenArtifact("validation"); submit("Validate the workflow"); } },
    { label: "Switch to slider-crank", run: () => onMechanismSelect("slider_crank") },
    { label: "Open parameter intake", run: () => onOpenArtifact("parameters") },
  ];
  return <div className="flex flex-wrap gap-2">{suggestions.map((item) => <button key={item.label} type="button" onClick={() => { onPrefill?.(item.label); item.run(); }} className="min-h-9 rounded-full border border-v2-border bg-[#121110] px-3 py-1.5 text-[11px] font-semibold text-v2-muted hover:border-amber-600/50 hover:text-amber-500">{item.label}</button>)}</div>;
}
