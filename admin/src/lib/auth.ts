import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from './db'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 24 * 60 * 60 },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',         type: 'email'    },
        password: { label: 'Mot de passe',  type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || user.status !== 'ACTIVE') return null
        if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') return null

        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) return null

        return {
          id:    user.id,
          email: user.email,
          name:  user.name ?? user.email,
          role:  user.role,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id   = user.id
        token.role = (user as unknown as { role: string }).role
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { id: string; role: string }).id   = token.id as string
        ;(session.user as { id: string; role: string }).role = token.role as string
      }
      return session
    },
  },
}
