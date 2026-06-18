import { NextResponse } from "next/server";
import { isV2ModelProvider, resolveProviderKey, v2ModelProviders } from "@/lib/v2/modelProviders";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const provider = body.provider;
  if (!isV2ModelProvider(provider)) return NextResponse.json({ ok: false, error: "Unsupported provider" }, { status: 400 });
  const { key, source } = resolveProviderKey(provider, typeof body.apiKey === "string" ? body.apiKey : undefined);
  if (!key) return NextResponse.json({ ok: false, provider, source, error: `Missing ${v2ModelProviders[provider].envKey} or BYOK key` }, { status: 401 });

  try {
    const result = await verifyProvider(provider, key);
    return NextResponse.json({ ok: true, provider, source, model: result.model ?? v2ModelProviders[provider].defaultModel, account: result.account ?? v2ModelProviders[provider].label });
  } catch (error) {
    return NextResponse.json({ ok: false, provider, source, error: error instanceof Error ? error.message : "Provider verification failed" }, { status: 502 });
  }
}

export async function GET() {
  const providers = Object.entries(v2ModelProviders).map(([id, provider]) => ({
    id,
    label: provider.label,
    defaultModel: provider.defaultModel,
    devCloudConfigured: Boolean(process.env[provider.envKey]),
    authUrl: provider.authUrlEnv ? process.env[provider.authUrlEnv] ?? null : null,
  }));
  return NextResponse.json({ providers });
}

async function verifyProvider(provider: keyof typeof v2ModelProviders, apiKey: string) {
  if (provider === "openai") {
    const response = await fetch("https://api.openai.com/v1/models", { headers: { Authorization: `Bearer ${apiKey}` }, cache: "no-store" });
    if (!response.ok) throw new Error(`OpenAI verification failed (${response.status})`);
    const json = await response.json() as { data?: { id?: string }[] };
    return { model: json.data?.[0]?.id, account: "OpenAI API key verified" };
  }
  if (provider === "anthropic") {
    const response = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" }, body: JSON.stringify({ model: v2ModelProviders.anthropic.defaultModel, max_tokens: 8, messages: [{ role: "user", content: "Reply ok" }] }), cache: "no-store" });
    if (!response.ok) throw new Error(`Anthropic verification failed (${response.status})`);
    return { model: v2ModelProviders.anthropic.defaultModel, account: "Anthropic API key verified" };
  }
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Gemini verification failed (${response.status})`);
  const json = await response.json() as { models?: { name?: string }[] };
  return { model: json.models?.[0]?.name?.replace("models/", ""), account: "Gemini API key verified" };
}
