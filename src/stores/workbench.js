import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { personalApprovals, personalSchedules, personalTasks } from '../mock/workbench'
import { createBusinessPersistence } from './persistence'

const clone = (value) => JSON.parse(JSON.stringify(value))

export const useWorkbenchStore = defineStore('workbench', () => {
  const tasks = ref(clone(personalTasks))
  const schedules = ref(clone(personalSchedules))
  const approvals = ref(clone(personalApprovals))
  const lastUpdatedAt = ref('14:20')
  const persistence = createBusinessPersistence(
    'workbench',
    () => ({
      tasks: tasks.value,
      schedules: schedules.value,
      approvals: approvals.value,
      lastUpdatedAt: lastUpdatedAt.value,
    }),
    (state) => {
      if (Array.isArray(state.tasks)) tasks.value = state.tasks
      if (Array.isArray(state.schedules)) schedules.value = state.schedules
      if (Array.isArray(state.approvals)) approvals.value = state.approvals
      if (typeof state.lastUpdatedAt === 'string') lastUpdatedAt.value = state.lastUpdatedAt
    },
  )

  watch([tasks, schedules, approvals, lastUpdatedAt], persistence.persist, { deep: true })

  function addTask(payload) {
    tasks.value.unshift({ id: Date.now(), status: 'pending', owner: '我', ...payload })
  }

  function toggleTask(id) {
    const task = tasks.value.find((item) => item.id === id)
    if (task) task.status = task.status === 'completed' ? 'pending' : 'completed'
  }

  function addSchedule(payload) {
    schedules.value.push({ id: Date.now(), ...payload })
    schedules.value.sort((a, b) => a.time.localeCompare(b.time))
  }

  function removeSchedule(id) {
    schedules.value = schedules.value.filter((item) => item.id !== id)
  }

  function handleApproval(id, status) {
    const approval = approvals.value.find((item) => item.id === id)
    if (approval) approval.status = status
  }

  function refresh() {
    lastUpdatedAt.value = new Intl.DateTimeFormat('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date())
  }

  return { tasks, schedules, approvals, lastUpdatedAt, hydrate: persistence.hydrate, addTask, toggleTask, addSchedule, removeSchedule, handleApproval, refresh }
})
