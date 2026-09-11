import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import {
  initialBusinessDictionaries,
  initialDepartments,
  initialEmployees,
  initialEnterpriseProfile,
  initialSystemPreferences,
} from '../mock/settings'
import { createBusinessPersistence } from './persistence'

const clone = (value) => JSON.parse(JSON.stringify(value))

export const useSettingsStore = defineStore('settings', () => {
  const enterpriseProfile = ref(clone(initialEnterpriseProfile))
  const systemPreferences = ref(clone(initialSystemPreferences))
  const departments = ref(clone(initialDepartments))
  const employees = ref(clone(initialEmployees))
  const businessDictionaries = ref(clone(initialBusinessDictionaries))
  const departmentMap = computed(() => Object.fromEntries(departments.value.map((item) => [item.id, item])))
  const activeEmployees = computed(() => employees.value.filter((item) => item.status === '在职'))
  const deliveryEmployees = computed(() => activeEmployees.value.filter((item) => item.departmentId === 3))
  const salesOwners = computed(() => activeEmployees.value.filter((item) => item.departmentId === 2).map((item) => item.name))
  const persistence = createBusinessPersistence(
    'settings',
    () => ({
      enterpriseProfile: enterpriseProfile.value,
      systemPreferences: systemPreferences.value,
      departments: departments.value,
      employees: employees.value,
      businessDictionaries: businessDictionaries.value,
    }),
    (state) => {
      if (state.enterpriseProfile) enterpriseProfile.value = { ...initialEnterpriseProfile, ...state.enterpriseProfile }
      if (state.systemPreferences) systemPreferences.value = { ...initialSystemPreferences, ...state.systemPreferences }
      if (Array.isArray(state.departments)) departments.value = state.departments
      if (Array.isArray(state.employees)) employees.value = state.employees
      if (state.businessDictionaries) {
        businessDictionaries.value = Object.fromEntries(
          Object.entries(initialBusinessDictionaries).map(([key, values]) => [key, Array.isArray(state.businessDictionaries[key]) ? state.businessDictionaries[key] : clone(values)]),
        )
      }
    },
  )

  watch([enterpriseProfile, systemPreferences, departments, employees, businessDictionaries], persistence.persist, { deep: true })

  function initializeCompanyName(name) {
    if (!enterpriseProfile.value.name && name) enterpriseProfile.value.name = name
  }
  function updateEnterpriseProfile(payload) { enterpriseProfile.value = { ...enterpriseProfile.value, ...payload } }
  function updateSystemPreferences(payload) { systemPreferences.value = { ...systemPreferences.value, ...payload } }
  function addDepartment(payload) { const item = { id: Date.now(), status: '启用', ...payload }; departments.value.push(item); return item }
  function updateDepartment(id, payload) { const item = departments.value.find((row) => row.id === id); if (item) Object.assign(item, payload) }
  function removeDepartment(id) { departments.value = departments.value.filter((item) => item.id !== id) }
  function addEmployee(payload) {
    const nextNumber = employees.value.reduce((max, item) => Math.max(max, Number(item.code?.split('-').at(-1)) || 0), 0) + 1
    const item = { id: Date.now(), code: `YG-${String(nextNumber).padStart(4, '0')}`, skills: [], status: '在职', ...payload }
    employees.value.push(item)
    return item
  }
  function updateEmployee(id, payload) { const item = employees.value.find((row) => row.id === id); if (item) Object.assign(item, payload) }
  function removeEmployee(id) { employees.value = employees.value.filter((item) => item.id !== id) }
  function addDictionaryValue(key, value) { if (value && !businessDictionaries.value[key].includes(value)) businessDictionaries.value[key].push(value) }
  function removeDictionaryValue(key, value) { businessDictionaries.value[key] = businessDictionaries.value[key].filter((item) => item !== value) }

  return {
    enterpriseProfile, systemPreferences, departments, employees, businessDictionaries,
    departmentMap, activeEmployees, deliveryEmployees, salesOwners,
    hydrate: persistence.hydrate, initializeCompanyName, updateEnterpriseProfile, updateSystemPreferences,
    addDepartment, updateDepartment, removeDepartment, addEmployee, updateEmployee, removeEmployee,
    addDictionaryValue, removeDictionaryValue,
  }
})
