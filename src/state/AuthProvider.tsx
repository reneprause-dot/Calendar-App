import { onAuthStateChanged, type User } from 'firebase/auth'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { auth } from '../firebase'

type AuthState = {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const value = useMemo<AuthState>(() => ({ user, loading }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth muss innerhalb von <AuthProvider> genutzt werden.')
  return ctx
}

