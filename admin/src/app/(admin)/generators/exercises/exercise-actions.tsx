'use client'
import { useState } from 'react'
import { MoreHorizontal, PowerOff, Power, Trash2 } from 'lucide-react'

export function ExerciseActions({ exerciseId, isActive, name }: { exerciseId: string; isActive: boolean; name: string }) {
  const [open, setOpen] = useState(false)

  async function call(action: string) {
    setOpen(false)
    await fetch(`/api/admin/exercises/${exerciseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    window.location.reload()
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] bg-card-hi text-grey1 hover:text-snow transition-colors">
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-50 w-40 overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)] bg-card-hi shadow-xl">
            <button onClick={() => call(isActive ? 'deactivate' : 'activate')}
              className={`flex w-full items-center gap-2 px-3 py-2 text-[13px] hover:bg-[rgba(255,255,255,0.06)] transition-colors ${isActive ? 'text-[#F59E0B]' : 'text-[#22C55E]'}`}>
              {isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
              {isActive ? 'Désactiver' : 'Activer'}
            </button>
            <button onClick={() => { if (confirm(`Supprimer "${name}" ?`)) call('delete') }}
              className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-orange hover:bg-[rgba(255,255,255,0.06)] transition-colors">
              <Trash2 className="h-4 w-4" /> Supprimer
            </button>
          </div>
        </>
      )}
    </div>
  )
}
