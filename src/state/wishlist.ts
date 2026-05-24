import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  orderBy,
  type Unsubscribe,
} from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
import { db } from '../firebase'
import { useAuth } from './AuthProvider'
import { useProfiles } from './ProfileProvider'

export type WishlistEntry = {
  id: string
  date: string // YYYY-MM-DD
  title: string
  notes?: string
  createdAt?: any
  updatedAt?: any
}

function collectionRef(uid: string, profileId: string) {
  return collection(db, 'users', uid, 'profiles', profileId, 'wishlistEntries')
}

export function useWishlistEntriesForDate(date: string | null) {
  const { user } = useAuth()
  const { activeProfileId } = useProfiles()
  const [entries, setEntries] = useState<WishlistEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setEntries([])
    setLoading(true)
    let unsub: Unsubscribe | undefined

    if (!user || !activeProfileId || !date) {
      setLoading(false)
      return
    }

    const q = query(collectionRef(user.uid, activeProfileId), where('date', '==', date))
    unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as WishlistEntry[]
      list.sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0))
      setEntries(list)
      setLoading(false)
    })

    return () => unsub?.()
  }, [activeProfileId, date, user])

  const api = useMemo(() => {
    async function addEntry(payload: { date: string; title: string; notes?: string }) {
      if (!user || !activeProfileId) return
      await addDoc(collectionRef(user.uid, activeProfileId), {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }

    async function updateEntry(id: string, patch: Partial<Pick<WishlistEntry, 'title' | 'notes'>>) {
      if (!user || !activeProfileId) return
      const ref = doc(db, 'users', user.uid, 'profiles', activeProfileId, 'wishlistEntries', id)
      await updateDoc(ref, { ...patch, updatedAt: serverTimestamp() })
    }

    async function removeEntry(id: string) {
      if (!user || !activeProfileId) return
      const ref = doc(db, 'users', user.uid, 'profiles', activeProfileId, 'wishlistEntries', id)
      await deleteDoc(ref)
    }

    return { addEntry, updateEntry, removeEntry }
  }, [activeProfileId, user])

  return { entries, loading, ...api }
}

export function useAllWishlistEntries() {
  const { user } = useAuth()
  const { activeProfileId } = useProfiles()
  const [entries, setEntries] = useState<WishlistEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setEntries([])
    setLoading(true)
    let unsub: Unsubscribe | undefined

    if (!user || !activeProfileId) {
      setLoading(false)
      return
    }

    const q = query(collectionRef(user.uid, activeProfileId), orderBy('date', 'desc'))
    unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as WishlistEntry[]
      setEntries(list)
      setLoading(false)
    })

    return () => unsub?.()
  }, [activeProfileId, user])

  const api = useMemo(() => {
    async function updateEntry(id: string, patch: Partial<Pick<WishlistEntry, 'title' | 'notes' | 'date'>>) {
      if (!user || !activeProfileId) return
      const ref = doc(db, 'users', user.uid, 'profiles', activeProfileId, 'wishlistEntries', id)
      await updateDoc(ref, { ...patch, updatedAt: serverTimestamp() })
    }

    async function removeEntry(id: string) {
      if (!user || !activeProfileId) return
      const ref = doc(db, 'users', user.uid, 'profiles', activeProfileId, 'wishlistEntries', id)
      await deleteDoc(ref)
    }

    return { updateEntry, removeEntry }
  }, [activeProfileId, user])

  return { entries, loading, ...api }
}

