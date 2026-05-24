import { useState } from 'react'
import { useProfiles } from '../../state/ProfileProvider'

export function ProfilesPage() {
  const { profiles, activeProfileId, setActiveProfileId, createProfile, renameProfile, loading } =
    useProfiles()
  const [newName, setNewName] = useState('')
  const [busy, setBusy] = useState(false)

  async function add() {
    if (!newName.trim()) return
    setBusy(true)
    try {
      await createProfile(newName.trim())
      setNewName('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card">
      <div className="row-wrap" style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Profile</h2>
        <div className="spacer" />
        <span className="badge">Cloud‑Sync aktiv</span>
      </div>

      <p className="muted" style={{ marginTop: 0 }}>
        Standardmäßig werden beim ersten Login 3 Profile angelegt. Du kannst beliebig viele Profile hinzufügen.
      </p>

      <div style={{ marginTop: 14 }}>
        <label className="muted">Neues Profil</label>
        <div className="row" style={{ marginTop: 6 }}>
          <input
            className="input"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="z. B. Familie, Arbeit, Privat…"
          />
          <button className="btn primary" disabled={busy || !newName.trim()} onClick={() => void add()}>
            Anlegen
          </button>
        </div>
      </div>

      <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '16px 0' }} />

      {loading ? (
        <div className="muted">Lade…</div>
      ) : profiles.length === 0 ? (
        <div className="muted">Keine Profile vorhanden.</div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {profiles.map((p) => (
            <ProfileRow
              key={p.id}
              id={p.id}
              name={p.name}
              active={p.id === activeProfileId}
              onActivate={() => void setActiveProfileId(p.id)}
              onRename={(name) => void renameProfile(p.id, name)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ProfileRow(props: {
  id: string
  name: string
  active: boolean
  onActivate: () => void
  onRename: (name: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(props.name)

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'white' }}>
      {editing ? (
        <>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="row" style={{ marginTop: 10 }}>
            <button
              className="btn primary"
              disabled={!name.trim()}
              onClick={() => {
                props.onRename(name.trim())
                setEditing(false)
              }}
            >
              Speichern
            </button>
            <button className="btn" onClick={() => setEditing(false)}>
              Abbrechen
            </button>
          </div>
        </>
      ) : (
        <div className="row-wrap">
          <div style={{ fontWeight: 900 }}>{props.name}</div>
          {props.active ? <span className="badge">aktiv</span> : null}
          <div className="spacer" />
          {!props.active ? (
            <button className="btn" onClick={props.onActivate}>
              Aktiv setzen
            </button>
          ) : null}
          <button className="btn" onClick={() => setEditing(true)}>
            Umbenennen
          </button>
        </div>
      )}
    </div>
  )
}

