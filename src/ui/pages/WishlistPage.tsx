import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import { useMemo, useState } from 'react'
import { useProfiles } from '../../state/ProfileProvider'
import { useAllWishlistEntries, type WishlistEntry } from '../../state/wishlist'

export function WishlistPage() {
  const { activeProfile } = useProfiles()
  const { entries, loading, updateEntry, removeEntry } = useAllWishlistEntries()
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return entries
    return entries.filter((e) => {
      const hay = `${e.title} ${e.notes ?? ''} ${e.date}`.toLowerCase()
      return hay.includes(needle)
    })
  }, [entries, q])

  const grouped = useMemo(() => {
    const map = new Map<string, WishlistEntry[]>()
    for (const e of filtered) {
      const arr = map.get(e.date) ?? []
      arr.push(e)
      map.set(e.date, arr)
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]))
  }, [filtered])

  return (
    <div className="card">
      <div className="row-wrap" style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Wunschliste</h2>
        <div className="spacer" />
        <span className="badge">{activeProfile ? activeProfile.name : 'Kein Profil'}</span>
      </div>

      <div style={{ marginBottom: 12 }}>
        <input
          className="input"
          placeholder="Suchen (Titel, Notizen, Datum)…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="muted">Lade…</div>
      ) : grouped.length === 0 ? (
        <div className="muted">Keine Einträge gefunden.</div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {grouped.map(([date, items]) => (
            <div key={date} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}>
              <div style={{ fontWeight: 900, marginBottom: 8 }}>
                {format(parseISO(date), 'EEEE, dd.MM.yyyy', { locale: de })}
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                {items.map((e) => (
                  <EntryRow
                    key={e.id}
                    entry={e}
                    onSave={(patch) => void updateEntry(e.id, patch)}
                    onDelete={() => void removeEntry(e.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function EntryRow(props: {
  entry: WishlistEntry
  onSave: (patch: Partial<Pick<WishlistEntry, 'title' | 'notes'>>) => void
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(props.entry.title)
  const [notes, setNotes] = useState(props.entry.notes ?? '')

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'white' }}>
      {editing ? (
        <>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div style={{ marginTop: 8 }}>
            <textarea className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="row" style={{ marginTop: 10 }}>
            <button
              className="btn primary"
              disabled={!title.trim()}
              onClick={() => {
                props.onSave({ title: title.trim(), notes: notes.trim() || undefined })
                setEditing(false)
              }}
            >
              Speichern
            </button>
            <button className="btn" onClick={() => setEditing(false)}>
              Abbrechen
            </button>
            <div className="spacer" />
            <button className="btn danger" onClick={props.onDelete}>
              Löschen
            </button>
          </div>
        </>
      ) : (
        <>
          <div style={{ fontWeight: 800 }}>{props.entry.title}</div>
          {props.entry.notes ? (
            <div className="muted" style={{ marginTop: 6, whiteSpace: 'pre-wrap' }}>
              {props.entry.notes}
            </div>
          ) : null}
          <div className="row" style={{ marginTop: 10 }}>
            <button className="btn" onClick={() => setEditing(true)}>
              Bearbeiten
            </button>
            <div className="spacer" />
            <button className="btn danger" onClick={props.onDelete}>
              Löschen
            </button>
          </div>
        </>
      )}
    </div>
  )
}

