import { NextResponse } from "next/server";
import { isV2ModelProvider, resolveProviderKey, v2ModelProviders } from "@/lib/v2/modelProviders";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const provider = body.provider;
  if (!isV2ModelProvider(provider)) return NextResponse.json({ ok: false, error: "Unsupported provider" }, { status: 400 });
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) return NextResponse.json({ ok: false, error: "Missing prompt" }, { status: 400 });
  const model = typeof body.model === "string" && body.model.trim() ? body.model.trim() : v2ModelProviders[provider].defaultModel;
  const { key, source } = resolveProviderKey(provider, typeof body.apiKey === "string" ? body.apiKey : undefined);
  if (!key) return NextResponse.json({ ok: false, error: `Missing ${v2ModelProviders[provider].envKey} or BYOK key` }, { status: 401 });
  try {
    const text = await runChat(provider, key, model, prompt, body.context);
    return NextResponse.json({ ok: true, provider, source, model, text });
  } catch (error) {
    return NextResponse.json({ ok: false, provider, source, model, error: error instanceof Error ? error.message : "Model request failed" }, { status: 502 });
  }
}

async function runChat(provider: keyof typeof v2ModelProviders, apiKey: string, model: string, prompt: string, context: unknown) {
  const system = "You are MechSynthCAD's engineering workspace agent. Be concise, ask for missing mechanism parameters, and never invent deterministic solver results.";
  const contextText = context ? `\n\nWorkspace context JSON:\n${JSON.stringify(context).slice(0, 6000)}` : "";
  if (provider === "openai") {
    const response = await fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { "content-type": "application/json", Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model, messages: [{ role: "system", content: system }, { role: "user", content: `${prompt}${contextText}` }], temperature: 0.2 }), cache: "no-store" });
    if (!response.ok) throw new Error(`OpenAI request failed (${response.status})`);
    const json = await response.json() as { choices?: { message?: { content?: string } }[] };
    return json.choices?.[0]?.message?.content ?? "OpenAI returned no text.";
  }
  if (provider === "anthropic") {
    const response = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" }, body: JSON.stringify({ model, system, max_tokens: 800, messages: [{ role: "user", content: `${prompt}${contextText}` }] }), cache: "no-store" });
    if (!response.ok) throw new Error(`Anthropic request failed (${response.status})`);
    const json = await response.json() as { content?: { type?: string; text?: string }[] };
    return json.content?.find((part) => part.type === "text")?.text ?? "Anthropic returned no text.";
  }
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: "user", parts: [{ text: `${prompt}${contextText}` }] }], generationConfig: { temperature: 0.2 } }), cache: "no-store" });
  if (!response.ok) throw new Error(`Gemini request failed (${response.status})`);
  const json = await response.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  return json.candidates?.[0]?.content?.parts?.map((part) => part.text).join("") || "Gemini returned no text.";
}
