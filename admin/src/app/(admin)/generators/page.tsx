import { db } from '@/lib/db'
import { Header } from '@/components/admin/header'
import { Dumbbell, BookOpen, Zap } from 'lucide-react'
import Link from 'next/link'

export default async function GeneratorsPage() {
  const [exerciseCount, promptCount] = await Promise.all([
    db.exercise.count({ where: { isActive: true } }),
    db.aiPrompt.count({ where: { isActive: true } }),
  ])

  return (
    <div>
      <Header title="Générateurs" description="Gestion du contenu IA — exercices et prompts" />
      <div className="p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SectionCard
          href="/generators/exercises"
          icon={<Dumbbell className="h-6 w-6 text-orange" />}
          accentClass="bg-orange/10 border-orange/20"
          title="Bibliothèque d'exercices"
          description="Gère les exercices utilisés par le générateur RAG. Ajoute, modifie, active ou désactive les exercices."
          stat={`${exerciseCount} exercices actifs`}
        />
        <SectionCard
          href="/generators/prompts"
          icon={<BookOpen className="h-6 w-6 text-blue" />}
          accentClass="bg-blue/10 border-blue/20"
          title="Prompts IA"
          description="Modifie les templates de prompts envoyés à Ollama ou Claude. Les changements sont effectifs immédiatement."
          stat={`${promptCount} prompts actifs`}
        />
        <SectionCard
          href="/apis"
          icon={<Zap className="h-6 w-6 text-lime" />}
          accentClass="bg-lime/10 border-lime/20"
          title="Configuration IA"
          description="Sélectionne le backend IA, configure les paramètres Ollama/Claude et le provider d'exercices."
          stat="Voir la config →"
        />
      </div>
    </div>
  )
}

function SectionCard({ href, icon, accentClass, title, description, stat }: {
  href: string; icon: React.ReactNode; accentClass: string; title: string; description: string; stat: string
}) {
  return (
    <Link href={href} className="group rounded-xl border border-[rgba(255,255,255,0.07)] bg-card p-5 hover:border-[rgba(255,255,255,0.12)] hover:bg-card-hi transition-all">
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl border ${accentClass}`}>
        {icon}
      </div>
      <h3 className="mb-1.5 text-[14px] font-semibold text-snow group-hover:text-white">{title}</h3>
      <p className="mb-4 text-[12px] text-grey2 leading-relaxed">{description}</p>
      <div className="text-[12px] font-medium text-grey1">{stat}</div>
    </Link>
  )
}
