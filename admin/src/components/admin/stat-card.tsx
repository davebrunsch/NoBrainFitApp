import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  sub?: string
  icon: LucideIcon
  accent?: 'blue' | 'lime' | 'orange' | 'green' | 'grey'
  trend?: { value: number; label: string }
}

const ACCENT = {
  blue:   { bg: 'bg-blue/10',    border: 'border-blue/20',    text: 'text-blue',              icon: 'text-blue'    },
  lime:   { bg: 'bg-lime/10',    border: 'border-lime/20',    text: 'text-lime',              icon: 'text-lime'    },
  orange: { bg: 'bg-orange/10',  border: 'border-orange/20',  text: 'text-orange',            icon: 'text-orange'  },
  green:  { bg: 'bg-[#22C55E]/10', border: 'border-[#22C55E]/20', text: 'text-[#22C55E]',   icon: 'text-[#22C55E]'},
  grey:   { bg: 'bg-card-hi',    border: 'border-[rgba(255,255,255,0.08)]', text: 'text-grey1', icon: 'text-grey2' },
}

export function StatCard({ title, value, sub, icon: Icon, accent = 'grey', trend }: StatCardProps) {
  const a = ACCENT[accent]
  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-grey2">{title}</p>
          <p className={cn('mt-2 text-3xl font-bold tracking-tight', a.text)}>{value}</p>
          {sub && <p className="mt-1 text-[12px] text-grey1">{sub}</p>}
        </div>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl border', a.bg, a.border)}>
          <Icon className={cn('h-5 w-5', a.icon)} />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1 text-[11px]">
          <span className={trend.value >= 0 ? 'text-[#22C55E]' : 'text-orange'}>
            {trend.value >= 0 ? '+' : ''}{trend.value}%
          </span>
          <span className="text-grey2">{trend.label}</span>
        </div>
      )}
    </div>
  )
}
