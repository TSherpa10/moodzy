// frontend/src/stores/users.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id: string
  name: string
  mood: string
  isReal: boolean
}

let currentWebSocket: WebSocket | null = null

type WsMsg = { type : string, payload : {id : string, name : string, mood: string, isReal : boolean, timeCreated : number, timeUpdated : number } };

function buildWsUrl(path = "/sim/publish", port = 9006) {
  const isSecure = location.protocol === "https:";
  const scheme = isSecure ? "wss" : "ws";
  const host = location.hostname; // not hardcoded 'localhost'
  return `${scheme}://${host}:${port}${path}`;
}

const BASE = 'http://localhost:3000'
const WEBSOCKET_BASE = buildWsUrl()

export const useUsersStore = defineStore('users', () => {
  // state
  const users = ref<User[]>([])
  const loading = ref(false)
  const error = ref<unknown>(null)
  const fetchedOnce = ref(false)

  // getters
  const count = computed(() => users.value.length)

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

  function connectWebSocket(url = WEBSOCKET_BASE, close = false) {
    if (close) {
      currentWebSocket?.close()
      return
    }
    const ws = new window.WebSocket(url);
    currentWebSocket = ws
    ws.onopen = () => console.log("Client connected to web socket");
    ws.onmessage = (e) => {
      const data = e.data;
      if (typeof(data) == "string") {
        const msg = JSON.parse(data) as WsMsg;
        if (msg.type == "simuser") {
          const pl = msg.payload;
          const user = {id: pl.id, name: pl.name, mood: pl.mood, isReal: pl.isReal}
          console.log(`received user: ${user}`);
          let newUserFlag = 1;
          users.value.forEach(u => {
            if (u.id == pl.id) {
              u.mood = pl.mood // same user, but they're feeling X mood now instead of Y.
              newUserFlag = 0;
            }
          });
          // out of scope, if there was no user initially we just add them to users.
          if (newUserFlag == 1) {
            users.value.unshift(user);
            console.log(`we don't always hit this`);
          }
        }
        else {
          console.log(`Potentially malicious message intercepted: ${msg.payload}`);
        }
      }
    }};

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

  function setUsers(list: User[]) { users.value = [...list] }

  async function clear() {
    await fetch(`${BASE}/users`, { method: 'DELETE' }).then(res => {
      if (!res.ok && res.status !== 204) throw new Error(`DELETE /users → ${res.status}`)
    })
    users.value = []
    return true
  }

  return {
    users, count,
    ensureLoaded, fetchUsers, addUser, updateUser, removeUser,
    setUsers, clear, connectWebSocket,
  }
})
