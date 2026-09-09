import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { deliveryDepartmentId, deliveryEmployees, departments, employees } from '../mock/masterData'
import {
  initialMilestones,
  initialProjectActivities,
  initialProjectFiles,
  initialProjectRisks,
  initialProjects,
  initialProjectTasks,
  initialResourceAllocations,
} from '../mock/projects'
import { createBusinessPersistence } from './persistence'
import { useAppStore } from './app'
import { useSalesStore } from './sales'

const clone = (value) => JSON.parse(JSON.stringify(value))
const today = () => new Date().toISOString().slice(0, 10)
const now = () => new Date().toISOString().slice(0, 16).replace('T', ' ')

function nextCode(list) {
  const max = list.reduce((value, item) => Math.max(value, Number(item.code?.split('-').at(-1)) || 0), 0)
  return `XM-${new Date().getFullYear()}-${String(max + 1).padStart(3, '0')}`
}

export const useProjectStore = defineStore('projects', () => {
  const projects = ref(clone(initialProjects))
  const tasks = ref(clone(initialProjectTasks))
  const milestones = ref(clone(initialMilestones))
  const risks = ref(clone(initialProjectRisks))
  const allocations = ref(clone(initialResourceAllocations))
  const files = ref(clone(initialProjectFiles))
  const activities = ref(clone(initialProjectActivities))
  const employeeMap = computed(() => Object.fromEntries(employees.map((item) => [item.id, item])))
  const departmentMap = computed(() => Object.fromEntries(departments.map((item) => [item.id, item])))
  const projectMap = computed(() => Object.fromEntries(projects.value.map((item) => [item.id, item])))
  const activeProjects = computed(() => projects.value.filter((item) => !item.archived))
  const persistence = createBusinessPersistence(
    'projects',
    () => ({ projects: projects.value, tasks: tasks.value, milestones: milestones.value, risks: risks.value, allocations: allocations.value, files: files.value, activities: activities.value }),
    (state) => {
      if (Array.isArray(state.projects)) projects.value = state.projects
      if (Array.isArray(state.tasks)) tasks.value = state.tasks
      if (Array.isArray(state.milestones)) milestones.value = state.milestones
      if (Array.isArray(state.risks)) risks.value = state.risks
      if (Array.isArray(state.allocations)) allocations.value = state.allocations
      if (Array.isArray(state.files)) files.value = state.files
      if (Array.isArray(state.activities)) activities.value = state.activities
    },
  )

  watch([projects, tasks, milestones, risks, allocations, files, activities], persistence.persist, { deep: true })

  function addActivity(projectId, action, operatorId) {
    activities.value.unshift({ id: Date.now(), projectId, operatorId: operatorId || projectMap.value[projectId]?.managerId || 3001, action, time: now() })
  }

  function recalculateProject(projectId) {
    const project = projectMap.value[projectId]
    if (!project) return
    const projectTasks = tasks.value.filter((item) => item.projectId === projectId)
    if (!projectTasks.length) return
    project.progress = Math.round(projectTasks.reduce((sum, item) => sum + Number(item.progress || 0), 0) / projectTasks.length)
    if (projectTasks.every((item) => item.status === '已完成')) {
      project.status = '已完成'
      project.progress = 100
    } else if (project.status === '已完成') {
      project.status = '执行中'
    }
  }

  function addProject(payload) {
    const salesStore = useSalesStore()
    const contract = salesStore.contracts.find((item) => item.id === payload.contractId)
    if (!contract || contract.customerId !== payload.customerId) throw new Error('合同与客户关系不一致')
    if (!deliveryEmployees.some((item) => item.id === payload.managerId) || payload.memberIds.some((id) => !deliveryEmployees.some((item) => item.id === id))) throw new Error('项目经理和成员只能选择项目交付中心在职员工')
    const item = { id: Date.now(), code: nextCode(projects.value), progress: 0, actualCost: 0, actualStart: '', acceptanceStatus: '待验收', archived: false, ...payload }
    projects.value.unshift(item)
    addActivity(item.id, `创建项目并关联合同 ${contract.code}`, item.managerId)
    return item
  }

  function updateProject(id, payload) {
    const item = projectMap.value[id]
    if (!item) return
    if (payload.managerId && !deliveryEmployees.some((employee) => employee.id === payload.managerId)) throw new Error('项目经理只能选择项目交付中心在职员工')
    if (payload.memberIds?.some((id) => !deliveryEmployees.some((employee) => employee.id === id))) throw new Error('项目成员只能选择项目交付中心在职员工')
    Object.assign(item, payload)
    addActivity(id, '更新项目基础信息')
  }

  function archiveProject(id) {
    const item = projectMap.value[id]
    if (!item) return
    item.archived = true
    item.status = '已归档'
    addActivity(id, '归档项目')
  }

  function addTask(payload) {
    const item = { id: Date.now(), progress: 0, status: '未开始', collaboratorIds: [], predecessorTaskIds: [], ...payload }
    tasks.value.push(item)
    addActivity(item.projectId, `新增任务：${item.name}`, item.assigneeId)
    recalculateProject(item.projectId)
  }

  function updateTask(id, payload) {
    const item = tasks.value.find((row) => row.id === id)
    if (!item) return
    Object.assign(item, payload)
    if (item.progress >= 100) { item.progress = 100; item.status = '已完成' }
    else if (item.progress > 0 && item.status === '未开始') item.status = '进行中'
    addActivity(item.projectId, `更新任务：${item.name}`, item.assigneeId)
    recalculateProject(item.projectId)
  }

  function toggleTaskComplete(id) {
    const item = tasks.value.find((row) => row.id === id)
    if (!item) return
    const completed = item.status !== '已完成'
    item.status = completed ? '已完成' : '进行中'
    item.progress = completed ? 100 : Math.min(item.progress || 50, 99)
    addActivity(item.projectId, `${completed ? '完成' : '重新打开'}任务：${item.name}`, item.assigneeId)
    recalculateProject(item.projectId)
  }

  function removeTask(id) {
    const item = tasks.value.find((row) => row.id === id)
    if (!item) return
    tasks.value = tasks.value.filter((row) => row.id !== id)
    addActivity(item.projectId, `删除任务：${item.name}`)
    recalculateProject(item.projectId)
  }

  function addMilestone(payload) {
    const item = { id: Date.now(), actualDate: '', deliverables: [], acceptanceStatus: '待提交', isCustomerAcceptance: false, ...payload }
    milestones.value.push(item)
    addActivity(item.projectId, `新增里程碑：${item.name}`, item.ownerId)
  }

  function updateMilestone(id, payload) {
    const item = milestones.value.find((row) => row.id === id)
    if (item) { Object.assign(item, payload); addActivity(item.projectId, `更新里程碑：${item.name}`, item.ownerId) }
  }

  function removeMilestone(id) {
    const item = milestones.value.find((row) => row.id === id)
    if (!item) return
    milestones.value = milestones.value.filter((row) => row.id !== id)
    addActivity(item.projectId, `删除里程碑：${item.name}`)
  }

  function submitMilestone(id) {
    const item = milestones.value.find((row) => row.id === id)
    if (item) { item.acceptanceStatus = '待验收'; addActivity(item.projectId, `提交里程碑验收：${item.name}`, item.ownerId) }
  }

  function approveMilestone(id) {
    const item = milestones.value.find((row) => row.id === id)
    const project = item && projectMap.value[item.projectId]
    if (!item || !project) return
    item.acceptanceStatus = '已通过'
    item.actualDate = today()
    addActivity(item.projectId, `验收通过：${item.name}`, item.ownerId)
    if (item.isCustomerAcceptance) {
      project.acceptanceStatus = '已通过'
      useSalesStore().markAcceptanceDue(project.contractId, item.actualDate, project.id)
      useAppStore().addNotification({
        type: 'project', typeName: '项目动态', title: `${project.name}客户验收已通过`,
        content: `客户验收已通过，关联合同验收款已到期，合同进入待结算状态。`, source: '项目交付',
        priority: '高', target: `/projects/${project.id}`,
      })
    }
  }

  function returnMilestone(id, reason) {
    const item = milestones.value.find((row) => row.id === id)
    if (!item) return
    item.acceptanceStatus = '整改中'
    const project = projectMap.value[item.projectId]
    if (item.isCustomerAcceptance && project) project.acceptanceStatus = '整改中'
    addActivity(item.projectId, `验收退回：${item.name}；${reason}`, item.ownerId)
  }

  function addRisk(payload) {
    const item = { id: Date.now(), status: '监控中', ...payload }
    risks.value.unshift(item)
    addActivity(item.projectId, `新增项目风险：${item.title}`, item.ownerId)
  }

  function updateRisk(id, payload) {
    const item = risks.value.find((row) => row.id === id)
    if (item) { Object.assign(item, payload); addActivity(item.projectId, `更新风险：${item.title}`, item.ownerId) }
  }

  function removeRisk(id) {
    const item = risks.value.find((row) => row.id === id)
    if (!item) return
    risks.value = risks.value.filter((row) => row.id !== id)
    addActivity(item.projectId, `删除风险：${item.title}`)
  }

  function saveAllocation(payload) {
    const existing = allocations.value.find((item) => item.employeeId === payload.employeeId && item.projectId === payload.projectId && item.period === payload.period)
    if (existing) Object.assign(existing, payload)
    else allocations.value.push({ id: Date.now(), actualHours: 0, ...payload })
    addActivity(payload.projectId, `调整${employeeMap.value[payload.employeeId]?.name || '成员'}资源计划`, payload.employeeId)
  }

  function addFile(projectId, file, uploaderId) {
    files.value.unshift({ id: Date.now(), projectId, name: file.name, size: file.size, uploaderId, uploadedAt: now() })
    addActivity(projectId, `上传文件：${file.name}`, uploaderId)
  }

  function removeFile(id) {
    const item = files.value.find((row) => row.id === id)
    if (!item) return
    files.value = files.value.filter((row) => row.id !== id)
    addActivity(item.projectId, `删除文件：${item.name}`)
  }

  return {
    projects, tasks, milestones, risks, allocations, files, activities,
    employees, departments, deliveryEmployees, deliveryDepartmentId,
    employeeMap, departmentMap, projectMap, activeProjects,
    hydrate: persistence.hydrate,
    addProject, updateProject, archiveProject,
    addTask, updateTask, toggleTaskComplete, removeTask,
    addMilestone, updateMilestone, removeMilestone, submitMilestone, approveMilestone, returnMilestone,
    addRisk, updateRisk, removeRisk, saveAllocation, addFile, removeFile, recalculateProject,
  }
})
