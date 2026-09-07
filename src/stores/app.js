import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const notifications = ref([
    { id: 1, title: '欢迎使用智慧企业运营管理平台', time: '刚刚', read: false },
    { id: 2, title: '账号安全设置已启用', time: '刚刚', read: false },
  ])

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function markAllRead() {
    notifications.value = notifications.value.map((item) => ({ ...item, read: true }))
  }

  return { sidebarCollapsed, notifications, toggleSidebar, markAllRead }
})
