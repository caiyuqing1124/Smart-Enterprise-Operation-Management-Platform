import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { initialGoals, initialIndicators, initialReports } from '../mock/operations'
import { createBusinessPersistence } from './persistence'

const clone = (value) => JSON.parse(JSON.stringify(value))

function updateTree(items, id, payload) {
  for (const item of items) {
    if (item.id === id) return Object.assign(item, payload)
    if (item.children && updateTree(item.children, id, payload)) return true
  }
  return false
}

function removeFromTree(items, id) {
  const index = items.findIndex((item) => item.id === id)
  if (index >= 0) return Boolean(items.splice(index, 1))
  return items.some((item) => item.children && removeFromTree(item.children, id))
}

function findInTree(items, id) {
  for (const item of items) {
    if (item.id === id) return item
    if (item.children) {
      const found = findInTree(item.children, id)
      if (found) return found
    }
  }
  return null
}

export const useOperationsStore = defineStore('operations', () => {
  const goals = ref(clone(initialGoals))
  const indicators = ref(clone(initialIndicators))
  const reports = ref(clone(initialReports))
  const goalOptions = computed(() => goals.value.map((item) => ({ label: item.name, value: item.id })))
  const persistence = createBusinessPersistence(
    'operations',
    () => ({ goals: goals.value, indicators: indicators.value, reports: reports.value }),
    (state) => {
      if (Array.isArray(state.goals)) goals.value = state.goals
      if (Array.isArray(state.indicators)) indicators.value = state.indicators
      if (state.reports && typeof state.reports === 'object') reports.value = state.reports
    },
  )

  watch([goals, indicators, reports], persistence.persist, { deep: true })

  function addGoal(payload) {
    const goal = { id: Date.now(), updatedAt: new Date().toISOString().slice(0, 10), ...payload }
    if (payload.parentId) {
      const parent = findInTree(goals.value, payload.parentId)
      if (parent) {
        parent.children ||= []
        parent.children.push(goal)
        return
      }
    }
    goals.value.push(goal)
  }

  function updateGoal(id, payload) { updateTree(goals.value, id, { ...payload, updatedAt: new Date().toISOString().slice(0, 10) }) }
  function removeGoal(id) { removeFromTree(goals.value, id) }

  function addIndicator(payload) { indicators.value.unshift({ id: Date.now(), subscribed: false, trend: [payload.current], ...payload }) }
  function updateIndicator(id, payload) {
    const item = indicators.value.find((indicator) => indicator.id === id)
    if (item) Object.assign(item, payload)
  }
  function removeIndicator(id) { indicators.value = indicators.value.filter((item) => item.id !== id) }
  function toggleIndicator(id, enabled) { updateIndicator(id, { enabled }) }
  function toggleSubscription(id) {
    const item = indicators.value.find((indicator) => indicator.id === id)
    if (item) item.subscribed = !item.subscribed
  }

  function updateConclusion(period, conclusion) { reports.value[period].conclusion = conclusion }
  function addAction(period, payload) { reports.value[period].actions.push({ id: Date.now(), status: '未开始', ...payload }) }
  function updateAction(period, id, payload) {
    const action = reports.value[period].actions.find((item) => item.id === id)
    if (action) Object.assign(action, payload)
  }
  function removeAction(period, id) { reports.value[period].actions = reports.value[period].actions.filter((item) => item.id !== id) }

  return {
    goals, indicators, reports, goalOptions, hydrate: persistence.hydrate,
    addGoal, updateGoal, removeGoal,
    addIndicator, updateIndicator, removeIndicator, toggleIndicator, toggleSubscription,
    updateConclusion, addAction, updateAction, removeAction,
  }
})
