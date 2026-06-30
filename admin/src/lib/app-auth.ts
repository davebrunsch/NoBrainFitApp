import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { db } from './db'

export interface AppUser {
  id: string
  email: string
  role: string
  status: string
}

/**
 * Authenticates a mobile-app request from its `Authorization: Bearer <jwt>`
 * header (token issued by /api/app/auth). Returns the active user or null.
 */
export async function authAppUser(req: NextRequest): Promise<AppUser | null> {
  const header = req.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return null

  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) return null

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret))
    if (!payload.sub) return null

    const user = await db.user.findUnique({ where: { id: payload.sub } })
    if (!user || user.status !== 'ACTIVE') return null

    return { id: user.id, email: user.email, role: user.role, status: user.status }
  } catch {
    return null
  }
}
