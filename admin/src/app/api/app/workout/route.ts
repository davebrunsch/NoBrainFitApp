import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { db } from '@/lib/db'
import { getConfig, getOllamaConfig, getClaudeConfig } from '@/lib/config'

async function authUser(req: NextRequest): Promise<string | null> {
  const header = req.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return null
  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET ?? '')
    const { payload } = await jwtVerify(token, secret)
    return payload.sub ?? null
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const userId = await authUser(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user || user.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Account inactive' }, { status: 403 })
  }

  const { goal, duration, equipment, exercises } = await req.json()

  const backend = await getConfig('AI_BACKEND')
  let workoutJson: string

  if (backend === 'claude') {
    const { apiKey, model } = await getClaudeConfig()
    if (!apiKey) return NextResponse.json({ error: 'Claude not configured' }, { status: 503 })

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        messages: [{ role: 'user', content: buildRagPrompt(goal, duration, equipment, exercises) }],
      }),
    })
    if (!res.ok) return NextResponse.json({ error: 'AI generation failed' }, { status: 502 })
    const data = await res.json() as { content: { text: string }[] }
    workoutJson = data.content[0]?.text ?? '{}'
  } else {
    const { baseUrl, model } = await getOllamaConfig()
    const res = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: buildRagPrompt(goal, duration, equipment, exercises),
        format: 'json',
        stream: false,
        options: { temperature: 0.5 },
      }),
    })
    if (!res.ok) return NextResponse.json({ error: 'AI generation failed' }, { status: 502 })
    const data = await res.json() as { response: string }
    workoutJson = data.response
  }

  let workout: unknown
  try {
    workout = JSON.parse(workoutJson)
  } catch {
    return NextResponse.json({ error: 'Invalid AI response', raw: workoutJson }, { status: 502 })
  }

  await db.workoutSession.create({
    data: {
      userId: user.id,
      type: 'ai_rag',
      goal,
      duration: String(duration),
      equipment,
      exercisesJson: exercises,
      completedAt: new Date(),
    },
  })

  return NextResponse.json({ workout })
}

function buildRagPrompt(goal: string, duration: string, equipment: string, exercises: unknown[]): string {
  return `Tu es un coach sportif expert. Génère un programme d'entraînement UNIQUEMENT avec les exercices fournis ci-dessous.

RÈGLE ABSOLUE : N'utilise QUE les exercices de cette liste. N'invente aucun exercice.

Exercices disponibles :
${JSON.stringify(exercises, null, 2)}

Paramètres :
- Objectif : ${goal}
- Durée : ${duration} minutes
- Équipement : ${equipment}

Réponds UNIQUEMENT en JSON valide avec cette structure :
{
  "title": "Nom du programme",
  "goal": "${goal}",
  "duration": ${duration},
  "exercises": [
    {
      "name": "nom exact de l'exercice",
      "sets": 3,
      "reps": "10-12",
      "rest": 60,
      "muscle": "groupe musculaire",
      "notes": "conseil optionnel"
    }
  ],
  "warmup": "description courte",
  "cooldown": "description courte"
}`
}
