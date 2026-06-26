'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, CreditCard, Dumbbell, Settings,
  Zap, LogOut, ChevronRight, BookOpen, Sliders, ShieldCheck,
} from 'lucide-react'

const NAV = [
  {
    section: 'Vue d\'ensemble',
    items: [
      { href: '/',          label: 'Dashboard',       icon: LayoutDashboard },
    ],
  },
  {
    section: 'Gestion',
    items: [
      { href: '/users',         label: 'Utilisateurs',  icon: Users      },
      { href: '/subscriptions', label: 'Abonnements',   icon: CreditCard },
    ],
  },
  {
    section: 'Contenu',
    items: [
      { href: '/generators',           label: 'Générateurs',  icon: Zap      },
      { href: '/generators/exercises', label: 'Exercices',    icon: Dumbbell, indent: true },
      { href: '/generators/prompts',   label: 'Prompts IA',   icon: BookOpen, indent: true },
    ],
  },
  {
    section: 'Système',
    items: [
      { href: '/apis',         label: 'APIs & Clés',    icon: Sliders     },
      { href: '/certificates', label: 'Certificats SSL', icon: ShieldCheck },
      { href: '/settings',     label: 'Paramètres',     icon: Settings    },
    ],
  },
]

export function Sidebar() {
  const path = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return path === '/'
    return path === href || path.startsWith(href + '/')
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-56 flex-col border-r border-[rgba(255,255,255,0.06)] bg-void">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-[rgba(255,255,255,0.06)] px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue/10 border border-blue/20">
          <Zap className="h-4 w-4 text-blue" />
        </div>
        <div>
          <div className="text-[13px] font-semibold leading-none text-snow tracking-tight">NoBrainFit</div>
          <div className="text-[10px] text-grey2 font-medium tracking-widest mt-0.5">ADMIN</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV.map((group) => (
          <div key={group.section} className="mb-4">
            <div className="px-2 py-1.5 text-[10px] font-semibold tracking-widest text-grey2 uppercase">
              {group.section}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] font-medium transition-colors mb-0.5',
                    (item as { indent?: boolean }).indent && 'ml-3',
                    active
                      ? 'bg-blue/10 text-snow'
                      : 'text-grey1 hover:bg-[rgba(255,255,255,0.04)] hover:text-snow'
                  )}
                >
                  <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-blue' : 'text-grey2 group-hover:text-grey1')} />
                  <span className="flex-1">{item.label}</span>
                  {active && <ChevronRight className="h-3 w-3 text-blue" />}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-[rgba(255,255,255,0.06)] p-3">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] font-medium text-grey1 hover:bg-[rgba(255,255,255,0.04)] hover:text-orange transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
