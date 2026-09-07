import { ref } from 'vue'
import { defineStore } from 'pinia'
import { initialNotifications } from '../mock/workbench'

const clone = (value) => JSON.parse(JSON.stringify(value))

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const notifications = ref(clone(initialNotifications))

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

  return { sidebarCollapsed, notifications, toggleSidebar, markAllRead, markRead, removeNotifications }
})
