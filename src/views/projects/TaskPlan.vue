<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useProjectStore } from '../../stores/projects'
import { useSettingsStore } from '../../stores/settings'

const route = useRoute()
const store = useProjectStore()
const settingsStore = useSettingsStore()
const taskStatuses = computed(() => settingsStore.businessDictionaries.taskStatuses)
const projectId = ref('all')
const status = ref('all')
const assigneeId = ref('all')
const keyword = ref('')
const viewMode = ref('timeline')
const formVisible = ref(false)
const formRef = ref()
const mode = ref('create')
const form = reactive({ id: null, projectId: null, name: '', parentTaskId: null, assigneeId: null, collaboratorIds: [], priority: '中', startDate: '', dueDate: '', progress: 0, status: '未开始', predecessorTaskIds: [] })
const rules = { projectId: [{ required: true, message: '请选择所属项目', trigger: 'change' }], name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }], assigneeId: [{ required: true, message: '请选择负责人', trigger: 'change' }], startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }], dueDate: [{ required: true, message: '请选择截止日期', trigger: 'change' }] }

const filtered = computed(() => store.tasks.filter((item) => {
  const project = store.projectMap[item.projectId]
  const assignee = store.employeeMap[item.assigneeId]
  const matchKeyword = !keyword.value || `${item.name}${project?.name || ''}${assignee?.name || ''}`.toLowerCase().includes(keyword.value.toLowerCase())
  return project && !project.archived && matchKeyword && (projectId.value === 'all' || item.projectId === projectId.value) && (status.value === 'all' || item.status === status.value) && (assigneeId.value === 'all' || item.assigneeId === assigneeId.value)
}))
const summary = computed(() => ({ total: filtered.value.length, doing: filtered.value.filter((item) => item.status === '进行中').length, overdue: filtered.value.filter((item) => item.status === '已延期').length, done: filtered.value.filter((item) => item.status === '已完成').length }))
const boardStatuses = ['未开始', '进行中', '已延期', '已完成']
const timelineStart = new Date('2026-09-01').getTime()
const timelineDays = 122

function timelineStyle(item) {
  const start = Math.max(0, Math.round((new Date(item.startDate).getTime() - timelineStart) / 86400000))
  const length = Math.max(2, Math.round((new Date(item.dueDate).getTime() - new Date(item.startDate).getTime()) / 86400000) + 1)
  return { left: `${Math.min(96, start / timelineDays * 100)}%`, width: `${Math.min(100 - start / timelineDays * 100, length / timelineDays * 100)}%` }
}

function reset() { Object.assign(form, { id: null, projectId: projectId.value === 'all' ? null : projectId.value, name: '', parentTaskId: null, assigneeId: null, collaboratorIds: [], priority: '中', startDate: '', dueDate: '', progress: 0, status: '未开始', predecessorTaskIds: [] }) }
function openCreate() { reset(); mode.value = 'create'; formVisible.value = true }
function openEdit(item) { Object.assign(form, { ...item, collaboratorIds: [...item.collaboratorIds], predecessorTaskIds: [...item.predecessorTaskIds] }); mode.value = 'edit'; formVisible.value = true }
async function save() {
  await formRef.value.validate()
  if (form.dueDate < form.startDate) { ElMessage.warning('截止日期不能早于开始日期'); return }
  const payload = { ...form }
  delete payload.id
  mode.value === 'create' ? store.addTask(payload) : store.updateTask(form.id, payload)
  formVisible.value = false
  ElMessage.success(mode.value === 'create' ? '任务已创建，项目进度已重新计算' : '任务已更新，项目进度已同步')
}
async function remove(item) {
  try { await ElMessageBox.confirm(`确定删除任务“${item.name}”吗？`, '删除任务', { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' }); store.removeTask(item.id); ElMessage.success('任务已删除') } catch { /* 保留任务。 */ }
}
function complete(item) { const wasCompleted = item.status === '已完成'; store.toggleTaskComplete(item.id); ElMessage.success(wasCompleted ? '任务已重新打开' : '任务已完成，项目状态已同步') }
function changeBoardStatus(item, nextStatus) { const progress = nextStatus === '已完成' ? 100 : nextStatus === '未开始' ? 0 : Math.min(item.progress || 30, 99); store.updateTask(item.id, { status: nextStatus, progress }); ElMessage.success(`任务已转为“${nextStatus}”`) }

onMounted(() => { if (route.query.projectId) projectId.value = Number(route.query.projectId) })
</script>

<template>
  <div class="project-page task-plan-page">
    <header class="project-header"><div><span>PROJECT TASK PLAN</span><h1>任务计划</h1><p>跨项目安排任务、依赖关系和交付进度。</p></div><div><el-radio-group v-model="viewMode"><el-radio-button value="timeline">时间计划</el-radio-button><el-radio-button value="board">状态看板</el-radio-button><el-radio-button value="list">任务列表</el-radio-button></el-radio-group><el-button type="primary" @click="openCreate"><el-icon><Plus /></el-icon>新建任务</el-button></div></header>
    <section class="task-summary-line"><div><span>当前任务</span><strong>{{ summary.total }}</strong></div><div><span>进行中</span><strong>{{ summary.doing }}</strong></div><div class="warning"><span>已延期</span><strong>{{ summary.overdue }}</strong></div><div><span>已完成</span><strong>{{ summary.done }}</strong></div><div class="task-filter-group"><el-input v-model="keyword" clearable placeholder="搜索任务、项目或负责人"><template #prefix><el-icon><Search /></el-icon></template></el-input><el-select v-model="projectId"><el-option label="全部项目" value="all" /><el-option v-for="item in store.activeProjects" :key="item.id" :label="item.name" :value="item.id" /></el-select><el-select v-model="assigneeId"><el-option label="全部负责人" value="all" /><el-option v-for="item in store.deliveryEmployees" :key="item.id" :label="item.name" :value="item.id" /></el-select><el-select v-model="status"><el-option label="全部状态" value="all" /><el-option v-for="item in taskStatuses" :key="item" :label="item" :value="item" /></el-select></div></section>

    <section v-if="viewMode === 'timeline'" class="task-timeline-panel">
      <header><div class="task-name-column">任务与负责人</div><div class="timeline-months"><span>9 月</span><span>10 月</span><span>11 月</span><span>12 月</span></div></header>
      <article v-for="item in filtered" :key="item.id"><div class="task-name-column"><button @click="openEdit(item)"><strong>{{ item.name }}</strong><span>{{ store.projectMap[item.projectId]?.name }} · {{ store.employeeMap[item.assigneeId]?.name }}</span></button></div><div class="timeline-track"><i v-for="n in 3" :key="n"></i><button :class="item.status" :style="timelineStyle(item)" @click="openEdit(item)"><span>{{ item.progress }}%</span></button></div></article>
      <el-empty v-if="!filtered.length" description="没有符合条件的任务" />
    </section>

    <div v-else-if="viewMode === 'board'" class="task-board">
      <section v-for="boardStatus in boardStatuses" :key="boardStatus"><header><strong>{{ boardStatus }}</strong><span>{{ filtered.filter((item) => item.status === boardStatus).length }}</span></header><article v-for="item in filtered.filter((task) => task.status === boardStatus)" :key="item.id"><small>{{ store.projectMap[item.projectId]?.code }} · {{ item.priority }}优先级</small><h3>{{ item.name }}</h3><p>{{ store.employeeMap[item.assigneeId]?.name }} · 截止 {{ item.dueDate }}</p><el-progress :percentage="item.progress" :stroke-width="6" /><footer><el-dropdown trigger="click" @command="(command) => changeBoardStatus(item, command)"><el-button size="small">变更状态</el-button><template #dropdown><el-dropdown-menu><el-dropdown-item v-for="target in boardStatuses.filter((value) => value !== item.status)" :key="target" :command="target">{{ target }}</el-dropdown-item></el-dropdown-menu></template></el-dropdown><el-button link @click="openEdit(item)">编辑</el-button></footer></article></section>
    </div>

    <section v-else class="project-table-panel"><el-table :data="filtered"><el-table-column prop="name" label="任务名称" min-width="210" /><el-table-column label="所属项目" min-width="180"><template #default="{ row }">{{ store.projectMap[row.projectId]?.name }}</template></el-table-column><el-table-column label="负责人" width="90"><template #default="{ row }">{{ store.employeeMap[row.assigneeId]?.name }}</template></el-table-column><el-table-column prop="priority" label="优先级" width="75" /><el-table-column prop="dueDate" label="截止日期" width="110" /><el-table-column label="进度" min-width="140"><template #default="{ row }"><el-progress :percentage="row.progress" /></template></el-table-column><el-table-column prop="status" label="状态" width="85" /><el-table-column label="操作" width="185"><template #default="{ row }"><el-button link type="primary" @click="complete(row)">{{ row.status === '已完成' ? '重新打开' : '完成' }}</el-button><el-button link @click="openEdit(row)">编辑</el-button><el-button link type="danger" @click="remove(row)">删除</el-button></template></el-table-column></el-table></section>

    <el-dialog v-model="formVisible" :title="mode === 'create' ? '新建项目任务' : '编辑项目任务'" width="740px"><el-form ref="formRef" :model="form" :rules="rules" label-position="top"><div class="project-form-grid"><el-form-item label="所属项目" prop="projectId"><el-select v-model="form.projectId" filterable style="width:100%"><el-option v-for="item in store.activeProjects" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item><el-form-item label="父任务"><el-select v-model="form.parentTaskId" clearable style="width:100%"><el-option v-for="item in store.tasks.filter((task) => task.projectId === form.projectId && task.id !== form.id)" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item><el-form-item label="任务名称" prop="name" class="span-two"><el-input v-model="form.name" /></el-form-item><el-form-item label="负责人" prop="assigneeId"><el-select v-model="form.assigneeId" style="width:100%"><el-option v-for="item in store.deliveryEmployees" :key="item.id" :label="`${item.name} · ${item.position}`" :value="item.id" /></el-select></el-form-item><el-form-item label="协作人"><el-select v-model="form.collaboratorIds" multiple collapse-tags style="width:100%"><el-option v-for="item in store.deliveryEmployees" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item><el-form-item label="开始日期" prop="startDate"><el-date-picker v-model="form.startDate" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item><el-form-item label="截止日期" prop="dueDate"><el-date-picker v-model="form.dueDate" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item><el-form-item label="优先级"><el-select v-model="form.priority" style="width:100%"><el-option v-for="item in ['低','中','高']" :key="item" :label="item" :value="item" /></el-select></el-form-item><el-form-item label="任务状态"><el-select v-model="form.status" style="width:100%"><el-option v-for="item in taskStatuses" :key="item" :label="item" :value="item" /></el-select></el-form-item><el-form-item label="完成进度" class="span-two"><el-slider v-model="form.progress" show-input /></el-form-item><el-form-item label="前置任务" class="span-two"><el-select v-model="form.predecessorTaskIds" multiple style="width:100%"><el-option v-for="item in store.tasks.filter((task) => task.projectId === form.projectId && task.id !== form.id)" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item></div></el-form><template #footer><el-button @click="formVisible = false">取消</el-button><el-button type="primary" @click="save">保存任务</el-button></template></el-dialog>
  </div>
</template>
