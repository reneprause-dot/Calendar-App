import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { useMemo, useState } from 'react'
import { auth } from '../../firebase'

export function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const envOk = useMemo(() => {
    return Boolean(import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID)
  }, [])

  async function submit() {
    setError(null)
    setBusy(true)
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email.trim(), password)
      } else {
        await createUserWithEmailAndPassword(auth, email.trim(), password)
      }
    } catch (e: any) {
      setError(e?.message ?? 'Unbekannter Fehler')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 40 }}>
      <div className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 8px' }}>NRW Kalender</h1>
        <p className="muted" style={{ marginTop: 0 }}>
          PWA Kalender mit christlichen Feiertagen (NRW), Profilen und Wunschlisten.
        </p>

        {!envOk && (
          <div
            className="card"
            style={{
              marginTop: 16,
              borderColor: 'rgba(217, 45, 32, 0.35)',
              background: 'rgba(217, 45, 32, 0.06)',
              boxShadow: 'none',
            }}
          >
            <strong>Firebase ist noch nicht konfiguriert.</strong>
            <div className="muted" style={{ marginTop: 6 }}>
              Lege eine <code>.env</code> an (siehe <code>.env.example</code>) und starte die App neu.
            </div>
          </div>
        )}

        <div className="row" style={{ marginTop: 20 }}>
          <button
            className={`btn ${mode === 'login' ? 'primary' : ''}`}
            onClick={() => setMode('login')}
            type="button"
          >
            Login
          </button>
          <button
            className={`btn ${mode === 'register' ? 'primary' : ''}`}
            onClick={() => setMode('register')}
            type="button"
          >
            Registrieren
          </button>
        </div>

        <div style={{ marginTop: 16 }}>
          <label className="muted">E-Mail</label>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@domain.de"
            autoComplete="email"
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <label className="muted">Passwort</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mindestens 6 Zeichen"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </div>

        {error && (
          <div style={{ marginTop: 12, color: 'var(--danger)', fontWeight: 600 }}>{error}</div>
        )}

        <div className="row" style={{ marginTop: 16 }}>
          <button className="btn primary" disabled={busy || !email || !password} onClick={() => void submit()}>
            {busy ? 'Bitte warten…' : mode === 'login' ? 'Einloggen' : 'Konto anlegen'}
          </button>
        </div>

        <p className="muted" style={{ marginTop: 14 }}>
          Hinweis: Die Daten werden pro Benutzerkonto in Firestore gespeichert (Cloud‑Sync).
        </p>
      </div>
    </div>
  )
}

