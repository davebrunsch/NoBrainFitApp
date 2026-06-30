import { db } from './db'
import { getConfig, getOllamaConfig, getClaudeConfig } from './config'

/** Carries an HTTP status so routes can surface the right error code. */
export class AiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'AiError'
  }
}

interface GenerateOptions {
  /** Ask the backend for strict JSON output (Ollama `format: json`). */
  json?: boolean
  /** User the call is attributed to in ApiCallLog. */
  userId?: string | null
  /** Override the configured max tokens (Claude only). */
  maxTokens?: number
}

/**
 * Runs a completion against the configured backend (Claude or Ollama) and
 * records the call in ApiCallLog — so the admin dashboard reflects real usage
 * and per-user quotas can be enforced.
 */
export async function generateText(prompt: string, opts: GenerateOptions = {}): Promise<string> {
  const backend = (await getConfig('app.ai_backend')) || 'ollama'

  const startedAt = Date.now()
  let statusCode = 200
  let errorMsg: string | null = null
  let endpoint = backend

  try {
    if (backend === 'claude') {
      const { apiKey, model, maxTokens } = await getClaudeConfig()
      endpoint = 'claude/messages'
      if (!apiKey) throw new AiError(503, 'Claude not configured')

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model,
          max_tokens: opts.maxTokens ?? maxTokens,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      if (!res.ok) throw new AiError(502, `Claude HTTP ${res.status}`)

      const data = (await res.json()) as { content?: { text?: string }[] }
      return data.content?.[0]?.text ?? ''
    }

    // Default: Ollama
    const { baseUrl, model } = await getOllamaConfig()
    endpoint = 'ollama/generate'
    const res = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        ...(opts.json ? { format: 'json' } : {}),
        options: { temperature: opts.json ? 0.5 : 0.7 },
      }),
    })
    if (!res.ok) throw new AiError(502, `Ollama HTTP ${res.status}`)

    const data = (await res.json()) as { response?: string }
    return data.response ?? ''
  } catch (e) {
    statusCode = e instanceof AiError ? e.status : 502
    errorMsg = e instanceof Error ? e.message : 'AI error'
    throw e instanceof AiError ? e : new AiError(502, errorMsg)
  } finally {
    // Best-effort logging — never let a logging failure break generation.
    await db.apiCallLog
      .create({
        data: {
          userId: opts.userId ?? null,
          provider: backend,
          endpoint,
          statusCode,
          durationMs: Date.now() - startedAt,
          errorMsg,
        },
      })
      .catch(() => {})
  }
}

/**
 * Extracts a JSON object from a raw model completion: handles ```json fences
 * and any prose the model wraps around the object despite instructions.
 */
export function extractJson(raw: string): string {
  let s = raw.trim()
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fence) s = fence[1].trim()
  if (!s.startsWith('{')) {
    const start = s.indexOf('{')
    const end = s.lastIndexOf('}')
    if (start !== -1 && end > start) s = s.slice(start, end + 1)
  }
  return s
}
