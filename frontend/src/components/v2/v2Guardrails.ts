import type { MechanismType } from "@/types";
import type { V2AgentStep, V2ProviderId, V2ProviderStatus } from "@/components/v2/types";

export type V2CommandCategory =
  | "analysis"
  | "simulation"
  | "report"
  | "synthesis"
  | "validation"
  | "navigation"
  | "settings"
  | "help"
  | "unknown";

export type V2PermissionDecision = {
  category: V2CommandCategory;
  allowed: boolean;
  requiresDeterministicTool: boolean;
  toolName?: "four_bar_analysis" | "four_bar_sweep" | "slider_crank_analysis" | "slider_crank_sweep";
  advisoryOnly: boolean;
  reason: string;
  nextAction: string;
  warning?: string;
};

export const V2_SOURCE_OF_TRUTH_LABEL = "Solver source-of-truth";
export const V2_ADVISORY_ONLY_LABEL = "Model advisory only";
export const V2_NO_MODEL_NUMBERS_LABEL = "No model-generated numbers";
export const V2_TOOL_PERMISSION_LABEL = "Tool permission required";
export const V2_DETERMINISTIC_REQUIRED_LABEL = "Deterministic result required";

export const v2ModelCapabilityBoundaries = [
  "Models may plan, explain, draft reports, and suggest synthesis directions.",
  "Models must not fabricate or directly calculate engineering mechanism values.",
  "Numerical positions, velocities, accelerations, sweeps, and classifications come from deterministic backend tools.",
];

export const v2DeterministicToolRequirements = [
  "Analysis/calculation commands require the analysis endpoint.",
  "Simulation, sweep, and animation commands require the sweep endpoint.",
  "Explanation, report, and synthesis commands need existing deterministic evidence before using numerical content.",
];

export function classifyV2Command(command: string): V2CommandCategory {
  const c = command.toLowerCase();
  if (!c.trim()) return "help";
  if (/\b(open|show|switch|go to|view)\b.*\b(settings|mechanism|report|reports|validation|results|canvas|parameters|workspace)\b/.test(c)) return c.includes("settings") ? "settings" : "navigation";
  if (/\b(help|guide|what can|missing parameters|audit parameters)\b/.test(c)) return "help";
  if (/\b(validate|validation|check workflow|workflow)\b/.test(c)) return "validation";
  if (/\b(report|supervisor|academic|project|markdown|pdf|export)\b/.test(c)) return "report";
  if (/\b(recommend|improve|improvement|synthesi[sz]e|optimi[sz]e|design direction)\b/.test(c)) return "synthesis";
  if (/\b(simulat|sweep|animate|motion samples?)\b/.test(c)) return "simulation";
  if (/\b(explain|interpret|summari[sz]e)\b.*\b(result|motion|output|analysis)\b/.test(c)) return "analysis";
  if (/\b(run analysis|analy[sz]e|calculate|solve|find theta|theta|velocity|acceleration|position|kinematic|transmission angle)\b/.test(c)) return "analysis";
  return "unknown";
}

export function v2ToolFor(mechanism: MechanismType, category: V2CommandCategory) {
  if (category === "analysis") return mechanism === "four_bar" ? "four_bar_analysis" : "slider_crank_analysis";
  if (category === "simulation") return mechanism === "four_bar" ? "four_bar_sweep" : "slider_crank_sweep";
  return undefined;
}

export function decideV2Permission(command: string, options: { mechanism: MechanismType; hasDeterministicResult: boolean; provider?: V2ProviderId; providerStatus?: V2ProviderStatus }): V2PermissionDecision {
  const category = classifyV2Command(command);
  const toolName = v2ToolFor(options.mechanism, category);
  if (category === "analysis" && /\b(explain|interpret|summari[sz]e)\b/.test(command.toLowerCase())) return { category, allowed: options.hasDeterministicResult, requiresDeterministicTool: false, advisoryOnly: true, reason: options.hasDeterministicResult ? "Explanation may reference existing deterministic solver output." : "No deterministic result exists yet for explanation.", nextAction: options.hasDeterministicResult ? "Explain solver result" : "Run analysis first", warning: options.hasDeterministicResult ? "Explanation is advisory; solver values remain source of truth." : "Run deterministic analysis first." };
  if (category === "analysis" || category === "simulation") return { category, allowed: true, requiresDeterministicTool: true, toolName, advisoryOnly: false, reason: category === "analysis" ? "Numerical mechanism analysis must be produced by deterministic solver tools." : "Sweep, simulation, and animation samples must be produced by deterministic sweep tools.", nextAction: category === "analysis" ? "Run deterministic analysis" : "Run deterministic sweep", warning: "Model will not calculate values directly." };
  if (category === "synthesis") return { category, allowed: options.hasDeterministicResult, requiresDeterministicTool: false, advisoryOnly: true, reason: options.hasDeterministicResult ? "Synthesis can reference existing solver output as advisory design direction." : "Synthesis requires deterministic result context before recommendations are shown.", nextAction: options.hasDeterministicResult ? "Open advisory synthesis" : "Run analysis first", warning: options.hasDeterministicResult ? "Recommendations are advisory and not validated optimization." : "Run deterministic analysis first." };
  if (category === "report") return { category, allowed: true, requiresDeterministicTool: false, advisoryOnly: true, reason: options.hasDeterministicResult ? "Report mode may use available deterministic evidence." : "Report mode may open, but numerical sections remain missing-evidence until a solver result exists.", nextAction: options.hasDeterministicResult ? "Open report" : "Open report with missing evidence", warning: "Never fill numerical sections from model text alone." };
  if (category === "validation") return { category, allowed: true, requiresDeterministicTool: false, advisoryOnly: true, reason: "Validation is an advisory workflow check for solver boundaries and artifact readiness.", nextAction: "Open validation workflow" };
  if (category === "navigation" || category === "settings" || category === "help") return { category, allowed: true, requiresDeterministicTool: false, advisoryOnly: false, reason: "Navigation/help commands do not need model or tool permission.", nextAction: category === "settings" ? "Open settings" : "Continue" };
  return { category: "unknown", allowed: false, requiresDeterministicTool: false, advisoryOnly: true, reason: "Command is ambiguous; V2 will not pretend to solve or calculate without a deterministic tool route.", nextAction: "Ask for help or run analysis", warning: "Unknown command blocked by preflight guardrail." };
}

export function buildV2GuardrailSteps(decision: V2PermissionDecision): V2AgentStep[] {
  return [
    { label: "Guardrail category", status: "complete", detail: decision.category },
    { label: "Tool permission", status: decision.allowed ? (decision.requiresDeterministicTool ? "pending" : "complete") : "blocked", detail: decision.requiresDeterministicTool ? `${decision.toolName} required` : decision.reason },
    { label: "Model boundary", status: decision.advisoryOnly ? "complete" : "pending", detail: decision.advisoryOnly ? "Model output is advisory only; no model-generated numbers." : "Deterministic tool handles numerical output." },
    { label: "Next action", status: decision.allowed ? "complete" : "blocked", detail: decision.nextAction },
  ];
}
