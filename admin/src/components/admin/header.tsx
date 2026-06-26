import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Bell } from 'lucide-react'

interface HeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export async function Header({ title, description, actions }: HeaderProps) {
  const session = await getServerSession(authOptions)

  return (
    <div className="flex h-14 items-center justify-between border-b border-[rgba(255,255,255,0.06)] bg-void px-6">
      <div>
        <h1 className="text-[15px] font-semibold text-snow">{title}</h1>
        {description && <p className="text-[12px] text-grey2">{description}</p>}
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.07)] bg-card text-grey1 hover:text-snow transition-colors">
          <Bell className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue/10 border border-blue/20 text-xs font-bold text-blue">
            {session?.user?.name?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div className="hidden sm:block">
            <div className="text-[12px] font-medium text-snow leading-none">{session?.user?.name}</div>
            <div className="text-[10px] text-grey2 mt-0.5">Super Admin</div>
          </div>
        </div>
      </div>
    </div>
  )
}
