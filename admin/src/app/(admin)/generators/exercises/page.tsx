import { db } from '@/lib/db'
import { Header } from '@/components/admin/header'
import { Badge } from '@/components/ui/badge'
import { ExerciseActions } from './exercise-actions'
import { AddExerciseDialog } from './add-exercise-dialog'

const EQUIPMENT_MAP: Record<string, string> = {
  body_only: 'Poids de corps',
  dumbbell:  'Haltères',
  barbell:   'Barre',
  cable:     'Câble',
  machine:   'Machine',
}

const MUSCLE_COLORS: Record<string, string> = {
  chest:       'bg-[#3D8EFF]/10 text-[#3D8EFF] border-[#3D8EFF]/20',
  lats:        'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20',
  quads:       'bg-lime/10 text-lime border-lime/20',
  hamstrings:  'bg-orange/10 text-orange border-orange/20',
  shoulders:   'bg-[#EC4899]/10 text-[#EC4899] border-[#EC4899]/20',
  biceps:      'bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/20',
  triceps:     'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
  abdominals:  'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20',
  glutes:      'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/20',
  traps:       'bg-[#64748B]/10 text-[#64748B] border-[#64748B]/20',
}

interface SearchParams { q?: string; equipment?: string; muscle?: string }

async function getExercises(params: SearchParams) {
  return db.exercise.findMany({
    where: {
      ...(params.equipment ? { equipment: params.equipment } : {}),
      ...(params.muscle    ? { muscle:    params.muscle    } : {}),
      ...(params.q ? { name: { contains: params.q, mode: 'insensitive' } } : {}),
    },
    orderBy: [{ equipment: 'asc' }, { name: 'asc' }],
  })
}

export default async function ExercisesPage({ searchParams }: { searchParams: SearchParams }) {
  const exercises = await getExercises(searchParams)

  const muscles    = [...new Set(exercises.map(e => e.muscle))].sort()
  const equipments = [...new Set(exercises.map(e => e.equipment))].sort()

  const activeCount = exercises.filter(e => e.isActive).length

  return (
    <div>
      <Header
        title="Bibliothèque d'exercices"
        description={`${activeCount} exercices actifs · ${exercises.length} au total`}
        actions={<AddExerciseDialog />}
      />

      <div className="p-6 space-y-4">
        {/* Filters */}
        <form method="GET" className="flex items-center gap-2 flex-wrap">
          <input
            name="q"
            defaultValue={searchParams.q}
            placeholder="Rechercher un exercice…"
            className="h-9 flex-1 min-w-[180px] max-w-xs rounded-lg border border-[rgba(255,255,255,0.08)] bg-card px-3 text-sm text-snow placeholder:text-grey2 focus:outline-none focus:ring-2 focus:ring-blue focus:ring-offset-2 focus:ring-offset-surface"
          />
          <select name="equipment" defaultValue={searchParams.equipment ?? ''}
            className="h-9 rounded-lg border border-[rgba(255,255,255,0.08)] bg-card px-2 text-sm text-snow focus:outline-none focus:ring-2 focus:ring-blue">
            <option value="">Tous les équipements</option>
            {equipments.map(e => <option key={e} value={e}>{EQUIPMENT_MAP[e] ?? e}</option>)}
          </select>
          <select name="muscle" defaultValue={searchParams.muscle ?? ''}
            className="h-9 rounded-lg border border-[rgba(255,255,255,0.08)] bg-card px-2 text-sm text-snow focus:outline-none focus:ring-2 focus:ring-blue">
            <option value="">Tous les muscles</option>
            {muscles.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <button type="submit" className="h-9 rounded-lg bg-blue/10 border border-blue/20 px-4 text-sm font-medium text-blue hover:bg-blue/20 transition-colors">
            Filtrer
          </button>
        </form>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.07)] bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)]">
                {['Exercice', 'Muscle', 'Équipement', 'Difficulté', 'Type', 'Statut', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-grey2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
              {exercises.map((ex) => (
                <tr key={ex.id} className={`hover:bg-card-hi transition-colors ${!ex.isActive ? 'opacity-40' : ''}`}>
                  <td className="px-4 py-3">
                    <span className="text-[13px] font-medium text-snow">{ex.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium border ${MUSCLE_COLORS[ex.muscle] ?? 'bg-card-hi text-grey1 border-[rgba(255,255,255,0.08)]'}`}>
                      {ex.muscle}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-grey1">
                    {EQUIPMENT_MAP[ex.equipment] ?? ex.equipment}
                  </td>
                  <td className="px-4 py-3">
                    <DifficultyBadge diff={ex.difficulty} />
                  </td>
                  <td className="px-4 py-3 text-[12px] text-grey1">{ex.type}</td>
                  <td className="px-4 py-3">
                    {ex.isActive
                      ? <Badge variant="success">Actif</Badge>
                      : <Badge variant="secondary">Inactif</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    <ExerciseActions exerciseId={ex.id} isActive={ex.isActive} name={ex.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function DifficultyBadge({ diff }: { diff: string }) {
  if (diff === 'beginner')     return <Badge variant="success">Débutant</Badge>
  if (diff === 'intermediate') return <Badge variant="warning">Intermédiaire</Badge>
  return <Badge variant="destructive">Avancé</Badge>
}
