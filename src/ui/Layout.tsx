import { signOut } from 'firebase/auth'
import { NavLink, Outlet } from 'react-router-dom'
import { auth } from '../firebase'
import { useProfiles } from '../state/ProfileProvider'

export function Layout() {
  const { profiles, activeProfileId, setActiveProfileId, loading } = useProfiles()

  return (
    <div>
      <header
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div className="container">
          <div className="row-wrap">
            <strong style={{ color: 'var(--brand-2)' }}>NRW Kalender</strong>

            <NavLink to="/" className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>
              Kalender
            </NavLink>
            <NavLink
              to="/wishlist"
              className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}
            >
              Wunschliste
            </NavLink>
            <NavLink
              to="/profiles"
              className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}
            >
              Profile
            </NavLink>

            <div className="spacer" />

            <div style={{ minWidth: 220 }}>
              <select
                className="select"
                disabled={loading || profiles.length === 0}
                value={activeProfileId ?? ''}
                onChange={(e) => void setActiveProfileId(e.target.value)}
              >
                {profiles.length === 0 ? (
                  <option value="">Keine Profile</option>
                ) : (
                  profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <button className="btn" onClick={() => void signOut(auth)}>
              Abmelden
            </button>
          </div>
        </div>
      </header>

      <main className="container" style={{ paddingTop: 16, paddingBottom: 24 }}>
        <Outlet />
      </main>
    </div>
  )
}

