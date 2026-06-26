import { promises as fs } from 'fs'
import path from 'path'
import { X509Certificate, createPrivateKey } from 'crypto'
import { execFile } from 'child_process'
import { promisify } from 'util'

const pexec = promisify(execFile)

// Shared bind-mount directories (see docker-compose.prod.yml).
//   /certs   — live fullchain.pem + privkey.pem served by nginx
//   /control — signal/job files exchanged with nginx + certbot
export const CERT_DIR    = process.env.SSL_CERT_DIR    ?? '/certs'
export const CONTROL_DIR = process.env.SSL_CONTROL_DIR ?? '/control'

const FULLCHAIN = path.join(CERT_DIR, 'fullchain.pem')
const PRIVKEY   = path.join(CERT_DIR, 'privkey.pem')
const RELOAD_SIGNAL = path.join(CONTROL_DIR, 'reload')
const LE_REQUEST    = path.join(CONTROL_DIR, 'letsencrypt.request.json')
const LE_STATUS     = path.join(CONTROL_DIR, 'letsencrypt.status.json')

export interface CertificateInfo {
  subject: string
  issuer: string
  commonName: string | null
  altNames: string[]
  validFrom: string
  validTo: string
  daysRemaining: number
  expired: boolean
  selfSigned: boolean
  letsEncrypt: boolean
  serialNumber: string
  fingerprint256: string
}

export interface LetsEncryptStatus {
  state: 'idle' | 'running' | 'success' | 'error'
  message: string
  ts: string | null
}

/** True when the SSL volumes are mounted (i.e. a production deployment). */
export async function sslAvailable(): Promise<boolean> {
  try {
    await fs.access(CERT_DIR)
    return true
  } catch {
    return false
  }
}

function parseAltNames(san: string | undefined): string[] {
  if (!san) return []
  return san
    .split(',')
    .map(s => s.trim())
    .map(s => s.replace(/^DNS:/i, '').replace(/^IP Address:/i, ''))
    .filter(Boolean)
}

/** Read and parse the live certificate, or null if none is installed. */
export async function readCertificate(): Promise<CertificateInfo | null> {
  let pem: string
  try {
    pem = await fs.readFile(FULLCHAIN, 'utf8')
  } catch {
    return null
  }
  try {
    const cert = new X509Certificate(pem)
    const validTo = new Date(cert.validTo)
    const now = new Date()
    const daysRemaining = Math.floor((validTo.getTime() - now.getTime()) / 86_400_000)
    const issuer = cert.issuer.replace(/\n/g, ', ')
    const subject = cert.subject.replace(/\n/g, ', ')
    const cnMatch = cert.subject.match(/CN=([^\n,]+)/)

    return {
      subject,
      issuer,
      commonName: cnMatch ? cnMatch[1] : null,
      altNames: parseAltNames(cert.subjectAltName),
      validFrom: new Date(cert.validFrom).toISOString(),
      validTo: validTo.toISOString(),
      daysRemaining,
      expired: daysRemaining < 0,
      selfSigned: cert.issuer === cert.subject,
      letsEncrypt: /let'?s encrypt/i.test(cert.issuer),
      serialNumber: cert.serialNumber,
      fingerprint256: cert.fingerprint256,
    }
  } catch {
    return null
  }
}

/** Validate a cert+key pair, install it, and signal nginx to reload. */
export async function installCustomCertificate(certPem: string, keyPem: string): Promise<void> {
  certPem = certPem.trim() + '\n'
  keyPem = keyPem.trim() + '\n'

  // Validate the certificate parses.
  let cert: X509Certificate
  try {
    cert = new X509Certificate(certPem)
  } catch {
    throw new Error('Le certificat fourni est invalide (format PEM attendu).')
  }

  // Validate the private key parses and matches the certificate.
  let key
  try {
    key = createPrivateKey(keyPem)
  } catch {
    throw new Error('La clé privée fournie est invalide (format PEM attendu).')
  }
  if (!cert.checkPrivateKey(key)) {
    throw new Error('La clé privée ne correspond pas au certificat.')
  }

  await fs.mkdir(CERT_DIR, { recursive: true })
  await fs.writeFile(FULLCHAIN, certPem, { mode: 0o644 })
  await fs.writeFile(PRIVKEY, keyPem, { mode: 0o600 })
  await signalReload()
}

/** Generate a self-signed certificate via openssl, install it, reload nginx. */
export async function generateSelfSigned(domain: string, days = 365): Promise<void> {
  if (!/^[a-zA-Z0-9.-]+$/.test(domain)) {
    throw new Error('Domaine invalide.')
  }
  await fs.mkdir(CERT_DIR, { recursive: true })
  await pexec('openssl', [
    'req', '-x509', '-nodes', '-newkey', 'rsa:2048',
    '-days', String(days),
    '-keyout', PRIVKEY,
    '-out', FULLCHAIN,
    '-subj', `/CN=${domain}`,
    '-addext', `subjectAltName=DNS:${domain}`,
  ])
  await fs.chmod(PRIVKEY, 0o600).catch(() => {})
  await signalReload()
}

/** Queue a Let's Encrypt issuance/renewal job for the certbot container. */
export async function requestLetsEncrypt(domain: string, email: string, staging: boolean): Promise<void> {
  if (!/^[a-zA-Z0-9.-]+$/.test(domain)) throw new Error('Domaine invalide.')
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Email invalide.')

  await fs.mkdir(CONTROL_DIR, { recursive: true })
  await writeStatus({ state: 'running', message: `Demande pour ${domain} en file d'attente…`, ts: new Date().toISOString() })
  await fs.writeFile(LE_REQUEST, JSON.stringify({ domain, email, staging }), { mode: 0o644 })
}

export async function readLetsEncryptStatus(): Promise<LetsEncryptStatus> {
  try {
    const raw = await fs.readFile(LE_STATUS, 'utf8')
    const parsed = JSON.parse(raw) as Partial<LetsEncryptStatus>
    return {
      state: (parsed.state as LetsEncryptStatus['state']) ?? 'idle',
      message: parsed.message ?? '',
      ts: parsed.ts ?? null,
    }
  } catch {
    return { state: 'idle', message: '', ts: null }
  }
}

async function writeStatus(s: LetsEncryptStatus): Promise<void> {
  await fs.mkdir(CONTROL_DIR, { recursive: true }).catch(() => {})
  await fs.writeFile(LE_STATUS, JSON.stringify(s), { mode: 0o644 }).catch(() => {})
}

/** Touch the reload signal that the nginx watcher polls. */
export async function signalReload(): Promise<void> {
  try {
    await fs.mkdir(CONTROL_DIR, { recursive: true })
    const now = new Date()
    await fs.writeFile(RELOAD_SIGNAL, String(now.getTime()))
    await fs.utimes(RELOAD_SIGNAL, now, now)
  } catch {
    // control dir not mounted (dev) — ignore
  }
}
