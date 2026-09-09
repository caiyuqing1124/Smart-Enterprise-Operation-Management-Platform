import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { initialNotifications } from '../mock/workbench'
import { createBusinessPersistence } from './persistence'

const clone = (value) => JSON.parse(JSON.stringify(value))
const SIDEBAR_KEY = 'smart-ops-sidebar-collapsed'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(localStorage.getItem(SIDEBAR_KEY) === 'true')
  const notifications = ref(clone(initialNotifications))
  const persistence = createBusinessPersistence(
    'app',
    () => ({ notifications: notifications.value }),
    (state) => {
      if (Array.isArray(state.notifications)) notifications.value = state.notifications
    },
  )

  watch(sidebarCollapsed, (value) => localStorage.setItem(SIDEBAR_KEY, String(value)))
  watch(notifications, persistence.persist, { deep: true })

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function markAllRead() {
    notifications.value = notifications.value.map((item) => ({ ...item, read: true }))
  }

  function markRead(id) {
    const notification = notifications.value.find((item) => item.id === id)
    if (notification) notification.read = true
  }

  function removeNotifications(ids) {
    notifications.value = notifications.value.filter((item) => !ids.includes(item.id))
  }

  function addNotification(payload) {
    notifications.value.unshift({ id: Date.now(), read: false, time: '刚刚', date: new Date().toISOString().slice(0, 16).replace('T', ' '), ...payload })
  }

  return { sidebarCollapsed, notifications, hydrate: persistence.hydrate, toggleSidebar, markAllRead, markRead, removeNotifications, addNotification }
})
