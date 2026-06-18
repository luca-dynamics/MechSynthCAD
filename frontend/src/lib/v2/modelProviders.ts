export type V2ModelProvider = "openai" | "anthropic" | "gemini";

export const v2ModelProviders: Record<V2ModelProvider, { label: string; defaultModel: string; envKey: string; authUrlEnv?: string }> = {
  openai: { label: "ChatGPT / OpenAI", defaultModel: "gpt-4o-mini", envKey: "OPENAI_API_KEY", authUrlEnv: "OPENAI_AUTH_URL" },
  anthropic: { label: "Claude / Anthropic", defaultModel: "claude-3-5-haiku-20241022", envKey: "ANTHROPIC_API_KEY", authUrlEnv: "ANTHROPIC_AUTH_URL" },
  gemini: { label: "Gemini / Google AI", defaultModel: "gemini-1.5-flash", envKey: "GEMINI_API_KEY", authUrlEnv: "GEMINI_AUTH_URL" },
};

export function isV2ModelProvider(value: unknown): value is V2ModelProvider {
  return typeof value === "string" && value in v2ModelProviders;
}

export function resolveProviderKey(provider: V2ModelProvider, byokKey?: string) {
  const trimmed = byokKey?.trim();
  if (trimmed) return { key: trimmed, source: "byok" as const };
  const envKey = process.env[v2ModelProviders[provider].envKey]?.trim();
  if (envKey) return { key: envKey, source: "dev-cloud" as const };
  return { key: "", source: "missing" as const };
}
