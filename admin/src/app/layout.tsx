import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'NoBrainFit Admin',
  description: 'Panneau d\'administration NoBrainFit',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
