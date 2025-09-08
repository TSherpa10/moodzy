// frontend/src/stores/users.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id: string
  name: string
  mood: string
  isReal: boolean
}

const BASE = 'http://localhost:3000'

export const useUsersStore = defineStore('users', () => {
  // state
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<unknown>(null)
  const fetchedOnce = ref(false)

  // getters
  const count = computed(() => users.value.length)
  const realUsers = computed(() => users.value.filter(u => u.isReal))
  const fakeUsers = computed(() => users.value.filter(u => !u.isReal))
  const byId = (id: string) => users.value.find(u => u.id === id) ?? null

  // helpers
  async function json<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      ...init,
    })
    if (!res.ok) throw new Error(`${init?.method ?? 'GET'} ${url} → ${res.status}`)
    return (await res.json()) as T
  }

  // actions
  async function fetchUsers() {
    loading.value = true; error.value = null
    try {
      users.value = await json<User[]>(`${BASE}/users`)
      fetchedOnce.value = true
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  async function ensureLoaded() {
    if (!fetchedOnce.value) await fetchUsers()
  }

  async function addUser(payload: { name: string; mood: string; isReal?: boolean }) {
    error.value = null
    const created = await json<User>(`${BASE}/users`, {
      method: 'POST',
      body: JSON.stringify({
        name: payload.name.trim(),
        mood: payload.mood.trim(),
        isReal: payload.isReal ?? true,
      }),
    })
    users.value.unshift(created)
    return created
  }

  async function addSimulatedUser(payload: { name: string; mood: string }) {
    return addUser({ ...payload, isReal: false })
  }

  async function updateUser(id: string, patch: Partial<Omit<User, 'id'>>) {
    error.value = null
    const saved = await json<User>(`${BASE}/users/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
    const i = users.value.findIndex(u => u.id === id)
    if (i !== -1) users.value[i] = saved
    return saved
  }

  async function removeUser(id: string) {
    error.value = null
    await fetch(`${BASE}/users/${id}`, { method: 'DELETE' }).then(res => {
      if (!res.ok && res.status !== 204) throw new Error(`DELETE /users/${id} → ${res.status}`)
    })
    users.value = users.value.filter(u => u.id !== id)
    return true
  }

  // NEW: light polling to keep in sync with backend REST
  function startPolling(intervalMs = 2000) {
    let timer: number | null = null

    const tick = async () => {
      try { await fetchUsers() } catch {}
    }

    tick() // immediate sync
    timer = window.setInterval(tick, intervalMs)

    // return disposer to stop polling on unmount/navigation
    return () => { if (timer != null) { clearInterval(timer); timer = null } }
  }

  function setUsers(list: User[]) { users.value = [...list] }
  
  async function clear() { 
    await fetch(`${BASE}/users`, { method: 'DELETE' }).then(res => {
      if (!res.ok && res.status !== 204) throw new Error(`DELETE /users → ${res.status}`)
    })
    users.value = []
    fetchedOnce.value = false
    return true
  }

  return {
    users, loading, error, fetchedOnce,
    count, realUsers, fakeUsers, byId,
    ensureLoaded, fetchUsers, addUser, addSimulatedUser, updateUser, removeUser,
    setUsers, clear,
    startPolling,              // ← expose this
  }
})
