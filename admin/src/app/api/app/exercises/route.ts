import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authAppUser } from '@/lib/app-auth'
import { getFitnessApiConfig } from '@/lib/config'

// Equipment category (sent by the app) → underlying DB `equipment` values.
const EQUIPMENT_MAP: Record<string, string[]> = {
  bodyweight: ['body_only'],
  dumbbells: ['dumbbell'],
  machines: ['machine', 'cable'],
  fullGym: ['barbell', 'dumbbell', 'cable', 'machine', 'body_only'],
}

// French labels used by the Flutter UI → category key.
const LABEL_MAP: Record<string, string> = {
  'Poids de corps': 'bodyweight',
  'Haltères': 'dumbbells',
  'Machines guidées': 'machines',
  'Salle complète': 'fullGym',
}

/**
 * Returns the exercise pool for an equipment category, sourced from the
 * admin-managed Exercise library. The app feeds this list into the RAG
 * workout request, so coaches can curate exercises from the back-office.
 */
export async function GET(req: NextRequest) {
  const user = await authAppUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const raw = req.nextUrl.searchParams.get('equipment') ?? 'bodyweight'
  const category = EQUIPMENT_MAP[raw] ? raw : LABEL_MAP[raw] ?? 'bodyweight'
  const equipmentValues = EQUIPMENT_MAP[category]

  const { exercisesCount } = await getFitnessApiConfig()

  const exercises = await db.exercise.findMany({
    where: { isActive: true, equipment: { in: equipmentValues } },
    select: { name: true, type: true, muscle: true, equipment: true, difficulty: true },
    take: exercisesCount,
  })

  return NextResponse.json({ category, exercises })
}
