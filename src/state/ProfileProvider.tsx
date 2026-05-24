import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
} from 'firebase/firestore'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { db } from '../firebase'
import { useAuth } from './AuthProvider'

export type Profile = {
  id: string
  name: string
}

type ProfileState = {
  profiles: Profile[]
  activeProfileId: string | null
  activeProfile: Profile | null
  loading: boolean
  setActiveProfileId: (profileId: string) => Promise<void>
  createProfile: (name: string) => Promise<void>
  renameProfile: (profileId: string, name: string) => Promise<void>
}

const ProfileContext = createContext<ProfileState | undefined>(undefined)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [activeProfileId, setActiveProfileIdState] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setProfiles([])
    setActiveProfileIdState(null)
    setLoading(true)

    if (!user) {
      setLoading(false)
      return
    }

    const userRef = doc(db, 'users', user.uid)
    const profilesRef = collection(db, 'users', user.uid, 'profiles')

    let unsubProfiles: (() => void) | undefined
    let unsubUser: (() => void) | undefined
    let cancelled = false

    async function ensureUserDoc() {
      const userSnap = await getDoc(userRef)
      if (!userSnap.exists()) {
        await setDoc(userRef, { createdAt: serverTimestamp(), activeProfileId: null })
      }
    }

    async function ensureDefaultProfilesIfEmpty() {
      const snap = await getDocs(profilesRef)
      if (!snap.empty) return

      // 3 Startprofile
      const created = []
      for (const name of ['Profil 1', 'Profil 2', 'Profil 3']) {
        const res = await addDoc(profilesRef, { name, createdAt: serverTimestamp() })
        created.push(res.id)
      }
      // erstes Profil aktiv setzen (nur wenn noch keines gesetzt ist)
      await updateDoc(userRef, { activeProfileId: created[0] })
    }

    ;(async () => {
      try {
        await ensureUserDoc()
        await ensureDefaultProfilesIfEmpty()

        if (cancelled) return

        unsubProfiles = onSnapshot(profilesRef, (snap) => {
          const list: Profile[] = snap.docs
            .map((d) => ({ id: d.id, name: (d.data() as DocumentData)?.name as unknown }))
            .filter((p): p is Profile => typeof p.name === 'string' && !!p.id)
            .sort((a, b) => a.name.localeCompare(b.name, 'de'))
          setProfiles(list)
        })

        unsubUser = onSnapshot(userRef, (snap) => {
          const data = snap.data()
          const id = (data?.activeProfileId as string | null) ?? null
          setActiveProfileIdState(id)
          setLoading(false)
        })
      } catch (e) {
        console.error(e)
        setLoading(false)
      }
    })()

    return () => {
      cancelled = true
      unsubProfiles?.()
      unsubUser?.()
    }
  }, [user])

  const activeProfile = useMemo(() => {
    if (!activeProfileId) return null
    return profiles.find((p) => p.id === activeProfileId) ?? null
  }, [profiles, activeProfileId])

  const api = useMemo<ProfileState>(() => {
    async function setActiveProfileId(profileId: string) {
      if (!user) return
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, { activeProfileId: profileId })
    }

    async function createProfile(name: string) {
      if (!user) return
      const profilesRef = collection(db, 'users', user.uid, 'profiles')
      await addDoc(profilesRef, { name, createdAt: serverTimestamp() })
    }

    async function renameProfile(profileId: string, name: string) {
      if (!user) return
      const ref = doc(db, 'users', user.uid, 'profiles', profileId)
      await updateDoc(ref, { name, updatedAt: serverTimestamp() })
    }

    return {
      profiles,
      activeProfileId,
      activeProfile,
      loading,
      setActiveProfileId,
      createProfile,
      renameProfile,
    }
  }, [activeProfile, activeProfileId, loading, profiles, user])

  return <ProfileContext.Provider value={api}>{children}</ProfileContext.Provider>
}

export function useProfiles() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfiles muss innerhalb von <ProfileProvider> genutzt werden.')
  return ctx
}
