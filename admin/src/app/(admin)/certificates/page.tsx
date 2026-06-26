import { Header } from '@/components/admin/header'
import { sslAvailable, readCertificate, readLetsEncryptStatus } from '@/lib/ssl'
import { getConfigs } from '@/lib/config'
import { CertificateManager } from './certificate-manager'
import { ShieldAlert } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CertificatesPage() {
  const available = await sslAvailable()
  const [certificate, leStatus, cfg] = await Promise.all([
    available ? readCertificate() : Promise.resolve(null),
    available ? readLetsEncryptStatus() : Promise.resolve(null),
    getConfigs(['ssl.mode', 'ssl.domain', 'ssl.email']),
  ])

  return (
    <div>
      <Header
        title="Certificats SSL"
        description="Gère le certificat HTTPS du serveur — auto-signé, certificat personnalisé ou Let's Encrypt"
      />

      <div className="p-6 max-w-3xl">
        {!available ? (
          <div className="rounded-xl border border-[#F59E0B]/20 bg-[#F59E0B]/5 p-5">
            <div className="mb-2 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-[#F59E0B]" />
              <h2 className="text-[14px] font-semibold text-snow">SSL non disponible</h2>
            </div>
            <p className="text-[13px] text-grey1 leading-relaxed">
              La gestion des certificats est active uniquement en déploiement <strong>production</strong>
              {' '}(avec Nginx + les volumes SSL montés). En local, le panel est servi en HTTP direct.
              <br /><br />
              Pour activer HTTPS, relance <code className="rounded bg-card-hi px-1.5 py-0.5 text-[12px] text-blue">bash scripts/setup.sh</code>
              {' '}et choisis le mode <strong>Production</strong>.
            </p>
          </div>
        ) : (
          <CertificateManager
            certificate={certificate}
            initialLeStatus={leStatus}
            config={{
              mode:   cfg['ssl.mode']   ?? '',
              domain: cfg['ssl.domain'] ?? '',
              email:  cfg['ssl.email']  ?? '',
            }}
          />
        )}
      </div>
    </div>
  )
}
