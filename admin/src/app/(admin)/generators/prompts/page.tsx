import { db } from '@/lib/db'
import { Header } from '@/components/admin/header'
import { PromptEditor } from './prompt-editor'

export default async function PromptsPage() {
  const prompts = await db.aiPrompt.findMany({ orderBy: { name: 'asc' } })

  return (
    <div>
      <Header title="Prompts IA" description="Éditeur de prompts — modifie directement le comportement de l'IA" />
      <div className="p-6 space-y-4">
        {prompts.map(p => (
          <PromptEditor key={p.id} prompt={p} />
        ))}
      </div>
    </div>
  )
}
