import type React from "react";
import type { V2PermissionDecision } from "@/components/v2/v2Guardrails";
import { V2_ADVISORY_ONLY_LABEL, V2_DETERMINISTIC_REQUIRED_LABEL, V2_NO_MODEL_NUMBERS_LABEL, V2_SOURCE_OF_TRUTH_LABEL, V2_TOOL_PERMISSION_LABEL } from "@/components/v2/v2Guardrails";

function Badge({ children, tone = "amber" }: { children: React.ReactNode; tone?: "amber" | "stone" | "blue" }) {
  const color = tone === "blue" ? "border-sky-500/30 bg-sky-500/10 text-sky-300" : tone === "stone" ? "border-v2-border bg-[#151311] text-v2-muted" : "border-amber-600/30 bg-amber-500/10 text-amber-500";
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${color}`}>{children}</span>;
}

export function V2GuardrailBadge({ children, label }: { children?: React.ReactNode; label?: string }) { return <Badge tone="stone">{children ?? label ?? V2_NO_MODEL_NUMBERS_LABEL}</Badge>; }
export function V2SourceOfTruthBadge() { return <Badge>{V2_SOURCE_OF_TRUTH_LABEL}</Badge>; }
export function V2ToolPermissionBadge({ decision }: { decision?: V2PermissionDecision }) { return <Badge tone={decision?.allowed === false ? "stone" : "blue"}>{decision?.requiresDeterministicTool ? V2_TOOL_PERMISSION_LABEL : decision?.allowed === false ? V2_DETERMINISTIC_REQUIRED_LABEL : V2_ADVISORY_ONLY_LABEL}</Badge>; }
