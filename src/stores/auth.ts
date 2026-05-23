import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { fetchLoginUserId } from '@/api/loginStatus'

const AUTH_COOKIE_KEY = 'mymusic_auth_cookie'
const AUTH_USER_ID_KEY = 'mymusic_auth_user_id'

function readStoredCookie() {
  try {
    return localStorage.getItem(AUTH_COOKIE_KEY) ?? ''
  } catch {
    return ''
  }
}

function readStoredUserId() {
  try {
    const value = localStorage.getItem(AUTH_USER_ID_KEY)
    return value ? Number(value) : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const cookie = ref(readStoredCookie())
  const userId = ref<number | null>(readStoredUserId())

  const isLoggedIn = computed(() => cookie.value.length > 0)

  function setCookie(nextCookie: string) {
    cookie.value = nextCookie

    try {
      localStorage.setItem(AUTH_COOKIE_KEY, nextCookie)
    } catch {
      // ignore storage failures
    }
  }

  function setUserId(nextUserId: number | null) {
    userId.value = nextUserId

    try {
      if (nextUserId == null) {
        localStorage.removeItem(AUTH_USER_ID_KEY)
      } else {
        localStorage.setItem(AUTH_USER_ID_KEY, String(nextUserId))
      }
    } catch {
      // ignore storage failures
    }
  }

  async function refreshUserProfile() {
    if (!cookie.value) {
      setUserId(null)
      return null
    }

    const nextUserId = await fetchLoginUserId(cookie.value)
    setUserId(nextUserId)
    return nextUserId
  }

  function logout() {
    cookie.value = ''
    userId.value = null

    try {
      localStorage.removeItem(AUTH_COOKIE_KEY)
      localStorage.removeItem(AUTH_USER_ID_KEY)
    } catch {
      // ignore storage failures
    }
  }

  return {
    cookie,
    userId,
    isLoggedIn,
    setCookie,
    setUserId,
    refreshUserProfile,
    logout,
  }
})
