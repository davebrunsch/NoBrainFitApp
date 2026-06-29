/**
 * Canonical catalogue of plan features.
 *
 * This is the single source of truth for the machine-readable feature keys
 * stored on each `Plan.features` (a JSON array of keys). The admin UI renders a
 * toggle per entry here, and the back-end gates endpoints on these keys via
 * `featureGuard` (see `lib/subscription.ts`).
 */
export interface FeatureDef {
  key: string
  label: string
  description: string
}

export const FEATURES: FeatureDef[] = [
  {
    key: 'classic_workout',
    label: 'Séances classiques',
    description: 'Génération de séances libres (durée + lieu).',
  },
  {
    key: 'rag_workout',
    label: 'Programme RAG',
    description: 'Séances construites depuis la bibliothèque d\'exercices.',
  },
  {
    key: 'nutrition_ai',
    label: 'Nutrition IA',
    description: 'Conseils et estimations nutritionnelles par IA.',
  },
  {
    key: 'cook_module',
    label: 'Module Cuisine',
    description: 'Recettes et liste de courses générées.',
  },
  {
    key: 'barcode_scan',
    label: 'Scan code-barres',
    description: 'Log d\'aliments par scan de code-barres.',
  },
  {
    key: 'history_full',
    label: 'Historique complet',
    description: 'Accès à tout l\'historique des séances.',
  },
  {
    key: 'priority_support',
    label: 'Support prioritaire',
    description: 'Assistance et file de génération prioritaires.',
  },
]

export const FEATURE_KEYS = FEATURES.map((f) => f.key)

/** Features granted to users without an active paid subscription. */
export const DEFAULT_FREE_FEATURES = ['classic_workout', 'nutrition_ai']

/** Keeps only valid, known feature keys (dedup + order-preserving). */
export function sanitizeFeatures(input: unknown): string[] {
  if (!Array.isArray(input)) return []
  return FEATURE_KEYS.filter((k) => input.includes(k))
}

export function featureLabel(key: string): string {
  return FEATURES.find((f) => f.key === key)?.label ?? key
}
