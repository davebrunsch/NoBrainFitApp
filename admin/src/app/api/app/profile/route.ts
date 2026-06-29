import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authAppUser } from '@/lib/app-auth'

// Allowed enum values — must mirror the app's enum `.name`s.
const SEX = ['male', 'female']
const LEVEL = ['beginner', 'intermediate', 'advanced']
const LIFESTYLE = ['sedentary', 'light', 'active', 'veryActive']
const GOAL = ['loseFat', 'buildMuscle', 'recomposition', 'maintain', 'performance']
const EQUIPMENT = ['bodyweight', 'dumbbells', 'machines', 'fullGym']

type ProfileShape = {
  profileCompleted: boolean
  sex: string | null
  age: number | null
  heightCm: number | null
  weightKg: number | null
  targetWeightKg: number | null
  fitnessLevel: string | null
  lifestyle: string | null
  goal: string | null
  daysPerWeek: number | null
  equipment: string | null
  gymMember: boolean | null
}

function serialize(u: {
  profileCompleted: boolean
  sex: string | null
  age: number | null
  heightCm: number | null
  weightKg: number | null
  targetWeightKg: number | null
  fitnessLevel: string | null
  lifestyle: string | null
  goal: string | null
  daysPerWeek: number | null
  equipment: string | null
  gymMember: boolean | null
}): ProfileShape {
  return {
    profileCompleted: u.profileCompleted,
    sex: u.sex,
    age: u.age,
    heightCm: u.heightCm,
    weightKg: u.weightKg,
    targetWeightKg: u.targetWeightKg,
    fitnessLevel: u.fitnessLevel,
    lifestyle: u.lifestyle,
    goal: u.goal,
    daysPerWeek: u.daysPerWeek,
    equipment: u.equipment,
    gymMember: u.gymMember,
  }
}

/** Returns the authenticated user's fitness profile. */
export async function GET(req: NextRequest) {
  const user = await authAppUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const u = await db.user.findUnique({
    where: { id: user.id },
    select: {
      profileCompleted: true,
      sex: true,
      age: true,
      heightCm: true,
      weightKg: true,
      targetWeightKg: true,
      fitnessLevel: true,
      lifestyle: true,
      goal: true,
      daysPerWeek: true,
      equipment: true,
      gymMember: true,
    },
  })
  if (!u) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  return NextResponse.json({ profile: serialize(u) })
}

// ── Validation helpers ──────────────────────────────────────────────────────
const oneOf = (v: unknown, allowed: string[]): string | null =>
  typeof v === 'string' && allowed.includes(v) ? v : null

const intIn = (v: unknown, min: number, max: number): number | null => {
  const n = typeof v === 'number' ? Math.round(v) : NaN
  return Number.isFinite(n) && n >= min && n <= max ? n : null
}

const numIn = (v: unknown, min: number, max: number): number | null => {
  const n = typeof v === 'number' ? v : NaN
  return Number.isFinite(n) && n >= min && n <= max ? n : null
}

/** Creates or updates the authenticated user's fitness profile. */
export async function PUT(req: NextRequest) {
  const user = await authAppUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const data = {
    profileCompleted: body.profileCompleted === true,
    sex: oneOf(body.sex, SEX),
    age: intIn(body.age, 14, 90),
    heightCm: intIn(body.heightCm, 100, 250),
    weightKg: numIn(body.weightKg, 30, 300),
    targetWeightKg: numIn(body.targetWeightKg, 0, 300),
    fitnessLevel: oneOf(body.fitnessLevel, LEVEL),
    lifestyle: oneOf(body.lifestyle, LIFESTYLE),
    goal: oneOf(body.goal, GOAL),
    daysPerWeek: intIn(body.daysPerWeek, 1, 7),
    equipment: oneOf(body.equipment, EQUIPMENT),
    gymMember: typeof body.gymMember === 'boolean' ? body.gymMember : null,
  }

  const u = await db.user.update({
    where: { id: user.id },
    data,
    select: {
      profileCompleted: true,
      sex: true,
      age: true,
      heightCm: true,
      weightKg: true,
      targetWeightKg: true,
      fitnessLevel: true,
      lifestyle: true,
      goal: true,
      daysPerWeek: true,
      equipment: true,
      gymMember: true,
    },
  })

  return NextResponse.json({ profile: serialize(u) })
}
