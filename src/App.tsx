import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './state/AuthProvider'
import { Layout } from './ui/Layout'
import { CalendarPage } from './ui/pages/CalendarPage'
import { LoginPage } from './ui/pages/LoginPage'
import { ProfilesPage } from './ui/pages/ProfilesPage'
import { WishlistPage } from './ui/pages/WishlistPage'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="container">
        <div className="card">Lade…</div>
      </div>
    )
  }

  if (!user) return <LoginPage />

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<CalendarPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/profiles" element={<ProfilesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
