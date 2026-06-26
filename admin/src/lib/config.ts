import { db } from './db'

/** Read a config value from the database. */
export async function getConfig(key: string): Promise<string> {
  const row = await db.appConfig.findUnique({ where: { key } })
  return row?.value ?? ''
}

/** Read multiple config values at once. */
export async function getConfigs(keys: string[]): Promise<Record<string, string>> {
  const rows = await db.appConfig.findMany({ where: { key: { in: keys } } })
  return Object.fromEntries(rows.map(r => [r.key, r.value]))
}

/** Write a config value. */
export async function setConfig(key: string, value: string): Promise<void> {
  await db.appConfig.upsert({
    where: { key },
    update: { value, updatedAt: new Date() },
    create: { key, value, updatedAt: new Date() },
  })
}

/** Build Ollama config from the database. */
export async function getOllamaConfig() {
  const cfg = await getConfigs(['ollama.base_url', 'ollama.model', 'ollama.timeout_seconds'])
  return {
    baseUrl:        cfg['ollama.base_url']        || 'http://localhost:11434',
    model:          cfg['ollama.model']           || 'llama3.2',
    timeoutSeconds: parseInt(cfg['ollama.timeout_seconds'] || '120', 10),
  }
}

/** Build Claude config from the database. */
export async function getClaudeConfig() {
  const cfg = await getConfigs(['claude.api_key', 'claude.model', 'claude.max_tokens'])
  return {
    apiKey:    cfg['claude.api_key']   || '',
    model:     cfg['claude.model']     || 'claude-haiku-4-5-20251001',
    maxTokens: parseInt(cfg['claude.max_tokens'] || '1024', 10),
  }
}

/** Build Fitness API config from the database. */
export async function getFitnessApiConfig() {
  const cfg = await getConfigs(['fitness_api.provider', 'fitness_api.key', 'app.rag_exercises_count'])
  return {
    provider:       cfg['fitness_api.provider']     || 'mock',
    apiKey:         cfg['fitness_api.key']           || '',
    exercisesCount: parseInt(cfg['app.rag_exercises_count'] || '20', 10),
  }
}
