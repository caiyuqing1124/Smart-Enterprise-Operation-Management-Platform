import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const USERS_KEY = 'smart-ops-users'
const SESSION_KEY = 'smart-ops-session'

const readUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
  } catch {
    return []
  }
}

const readSession = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(readSession())
  const isAuthenticated = computed(() => Boolean(currentUser.value))

  function login({ account, password, remember }) {
    const user = readUsers().find(
      (item) => item.account.toLowerCase() === account.trim().toLowerCase() && item.password === password,
    )

    if (!user) {
      throw new Error('账号或密码不正确，请核对后重试')
    }

    const session = {
      id: user.id,
      name: user.name,
      account: user.account,
      companyName: user.companyName,
      role: '企业管理员',
    }

    currentUser.value = session
    if (remember) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } else {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
      localStorage.removeItem(SESSION_KEY)
    }
  }

  function register(payload) {
    const users = readUsers()
    const normalizedAccount = payload.account.trim().toLowerCase()
    if (users.some((item) => item.account.toLowerCase() === normalizedAccount)) {
      throw new Error('该账号已注册，请直接登录')
    }

    const user = {
      id: `user-${Date.now()}`,
      account: payload.account.trim(),
      password: payload.password,
      name: payload.name.trim(),
      companyName: payload.companyName.trim(),
      industry: payload.industry,
      scale: payload.scale,
      createdAt: new Date().toISOString(),
    }
    users.push(user)
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
    return user
  }

  function resetPassword({ account, password }) {
    const users = readUsers()
    const target = users.find((item) => item.account.toLowerCase() === account.trim().toLowerCase())
    if (!target) {
      throw new Error('未找到该账号，请核对后重试')
    }
    target.password = password
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }

  function logout() {
    currentUser.value = null
    localStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_KEY)
  }

  function restoreTemporarySession() {
    if (!currentUser.value) {
      try {
        currentUser.value = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null')
      } catch {
        currentUser.value = null
      }
    }
  }

  restoreTemporarySession()

  return { currentUser, isAuthenticated, login, register, resetPassword, logout }
})
