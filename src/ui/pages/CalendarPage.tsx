import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { de } from 'date-fns/locale'
import { useMemo, useState } from 'react'
import { isoDateLocal } from '../../domain/date'
import { getNrwChristianPublicHolidays } from '../../domain/holidays'
import { useProfiles } from '../../state/ProfileProvider'
import { useWishlistEntriesForDate } from '../../state/wishlist'

export function CalendarPage() {
  const { activeProfile } = useProfiles()
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()))
  const [selected, setSelected] = useState<Date>(() => new Date())

  const year = cursor.getFullYear()
  const monthLabel = format(cursor, 'LLLL yyyy', { locale: de })

  const holidays = useMemo(() => {
    const map = new Map<string, string>()
    for (const h of getNrwChristianPublicHolidays(year)) map.set(h.date, h.name)
    return map
  }, [year])

  const gridDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [cursor])

  const selectedIso = isoDateLocal(selected)
  const { entries, loading, addEntry, updateEntry, removeEntry } = useWishlistEntriesForDate(selectedIso)

  const [newTitle, setNewTitle] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [busy, setBusy] = useState(false)

  async function add() {
    if (!newTitle.trim()) return
    setBusy(true)
    try {
      await addEntry({ date: selectedIso, title: newTitle.trim(), notes: newNotes.trim() || undefined })
      setNewTitle('')
      setNewNotes('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1.1fr 0.9fr' }}>
      <div className="card">
        <div className="row-wrap" style={{ marginBottom: 12 }}>
          <button className="btn" onClick={() => setCursor((c) => addMonths(c, -1))}>
            ←
          </button>
          <strong style={{ fontSize: 18 }}>{monthLabel}</strong>
          <button className="btn" onClick={() => setCursor((c) => addMonths(c, 1))}>
            →
          </button>
          <div className="spacer" />
          <span className="badge">{activeProfile ? activeProfile.name : 'Kein Profil'}</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 8,
            marginBottom: 8,
          }}
        >
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((d) => (
            <div key={d} className="muted" style={{ fontWeight: 700, fontSize: 12 }}>
              {d}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
          {gridDays.map((day) => {
            const iso = isoDateLocal(day)
            const holiday = holidays.get(iso)
            const dim = !isSameMonth(day, cursor)
            const selectedDay = isSameDay(day, selected)

            return (
              <button
                key={iso}
                className="btn"
                onClick={() => setSelected(day)}
                style={{
                  textAlign: 'left',
                  padding: 10,
                  minHeight: 74,
                  borderColor: selectedDay ? 'var(--brand)' : 'var(--border)',
                  background: selectedDay ? 'rgba(47, 111, 237, 0.08)' : 'var(--surface)',
                  opacity: dim ? 0.5 : 1,
                }}
              >
                <div className="row" style={{ alignItems: 'baseline', gap: 8 }}>
                  <div style={{ fontWeight: 800 }}>
                    {format(day, 'd', { locale: de })}
                    {isToday(day) ? ' •' : ''}
                  </div>
                  {holiday && (
                    <span
                      className="badge"
                      style={{
                        borderColor: 'rgba(20, 54, 130, 0.35)',
                        background: 'rgba(20, 54, 130, 0.08)',
                        color: 'var(--brand-2)',
                        maxWidth: 120,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={holiday}
                    >
                      {holiday}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="card">
        <h2 style={{ margin: 0 }}>
          {format(selected, 'EEEE, dd.MM.yyyy', { locale: de })}
        </h2>
        <div className="muted" style={{ marginTop: 4 }}>
          Wunschliste für diesen Tag (pro Profil)
        </div>

        <div style={{ marginTop: 14 }}>
          <label className="muted">Titel</label>
          <input className="input" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
        </div>
        <div style={{ marginTop: 10 }}>
          <label className="muted">Notizen (optional)</label>
          <textarea className="textarea" value={newNotes} onChange={(e) => setNewNotes(e.target.value)} />
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn primary" disabled={busy || !newTitle.trim()} onClick={() => void add()}>
            Eintrag hinzufügen
          </button>
        </div>

        <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '16px 0' }} />

        {loading ? (
          <div className="muted">Lade Einträge…</div>
        ) : entries.length === 0 ? (
          <div className="muted">Noch keine Einträge für diesen Tag.</div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {entries.map((e) => (
              <WishlistEntryCard
                key={e.id}
                id={e.id}
                title={e.title}
                notes={e.notes}
                onSave={(patch) => void updateEntry(e.id, patch)}
                onDelete={() => void removeEntry(e.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function WishlistEntryCard(props: {
  id: string
  title: string
  notes?: string
  onSave: (patch: { title?: string; notes?: string }) => void
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(props.title)
  const [notes, setNotes] = useState(props.notes ?? '')

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 12,
        background: 'white',
      }}
    >
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
          <div style={{ fontWeight: 800 }}>{props.title}</div>
          {props.notes ? (
            <div className="muted" style={{ marginTop: 6, whiteSpace: 'pre-wrap' }}>
              {props.notes}
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

