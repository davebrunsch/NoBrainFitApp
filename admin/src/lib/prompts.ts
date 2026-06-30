import { db } from './db'

/**
 * Loads an AiPrompt template by slug and interpolates `{variable}` tokens.
 * Returns null when the prompt is missing or disabled, so callers can fail
 * gracefully instead of sending an empty prompt to the model.
 *
 * Editing a template in the admin "Prompts" panel now changes generation
 * output directly — no redeploy, no hardcoded strings.
 */
export async function renderPrompt(
  slug: string,
  vars: Record<string, string>,
): Promise<string | null> {
  const prompt = await db.aiPrompt.findUnique({ where: { slug } })
  if (!prompt || !prompt.isActive) return null

  let out = prompt.template
  for (const [key, value] of Object.entries(vars)) {
    out = out.split(`{${key}}`).join(value)
  }
  return out
}
