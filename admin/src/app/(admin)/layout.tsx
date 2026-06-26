import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Sidebar } from '@/components/admin/sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="flex h-screen bg-void">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden pl-56">
        <main className="flex-1 overflow-y-auto bg-surface">
          {children}
        </main>
      </div>
    </div>
  )
}
