<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useOperationsStore } from '../../stores/operations'

const store = useOperationsStore()
const keyword = ref('')
const cycleFilter = ref('all')
const statusFilter = ref('all')
const dialogVisible = ref(false)
const detailVisible = ref(false)
const dialogMode = ref('create')
const formRef = ref()
const selectedGoal = ref(null)
const form = reactive({ id: null, parentId: null, name: '', level: '企业', cycle: '2026 年度', department: '', owner: '', target: 0, actual: 0, unit: '万元', weight: 10, status: '进行中' })
const rules = {
  name: [{ required: true, message: '请输入目标名称', trigger: 'blur' }],
  department: [{ required: true, message: '请输入责任部门', trigger: 'blur' }],
  owner: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
  target: [{ required: true, message: '请输入目标值', trigger: 'blur' }],
}

function matches(goal) {
  const keywordMatched = !keyword.value || `${goal.name}${goal.department}${goal.owner}`.includes(keyword.value)
  const cycleMatched = cycleFilter.value === 'all' || goal.cycle === cycleFilter.value
  const statusMatched = statusFilter.value === 'all' || goal.status === statusFilter.value
  return keywordMatched && cycleMatched && statusMatched
}

function filterTree(items) {
  return items.reduce((result, item) => {
    const children = item.children ? filterTree(item.children) : []
    if (matches(item) || children.length) result.push({ ...item, children: children.length ? children : item.children })
    return result
  }, [])
}

const displayGoals = computed(() => filterTree(store.goals))
const allGoals = computed(() => store.goals.flatMap((item) => [item, ...(item.children || [])]))
const summary = computed(() => ({
  total: allGoals.value.length,
  leading: allGoals.value.filter((item) => item.status === '领先').length,
  attention: allGoals.value.filter((item) => item.status === '关注').length,
  average: Math.round(allGoals.value.reduce((sum, item) => sum + Math.min(item.actual / item.target * 100, 100), 0) / allGoals.value.length),
}))

function resetForm() { Object.assign(form, { id: null, parentId: null, name: '', level: '企业', cycle: '2026 年度', department: '', owner: '', target: 0, actual: 0, unit: '万元', weight: 10, status: '进行中' }) }
function openCreate(parentId = null) { resetForm(); form.parentId = parentId; form.level = parentId ? '部门' : '企业'; dialogMode.value = 'create'; dialogVisible.value = true }
function openEdit(goal) { Object.assign(form, { ...goal, children: undefined }); dialogMode.value = 'edit'; dialogVisible.value = true }

async function saveGoal() {
  await formRef.value.validate()
  const payload = { ...form }
  delete payload.id
  delete payload.children
  if (dialogMode.value === 'create') store.addGoal(payload)
  else store.updateGoal(form.id, payload)
  dialogVisible.value = false
  ElMessage.success(dialogMode.value === 'create' ? '经营目标已创建' : '经营目标已更新')
}

async function deleteGoal(goal) {
  try {
    await ElMessageBox.confirm(goal.children?.length ? '该目标包含下级分解目标，删除后将一并移除。确定继续吗？' : `确定删除“${goal.name}”吗？`, '删除经营目标', { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' })
    store.removeGoal(goal.id)
    if (selectedGoal.value?.id === goal.id) detailVisible.value = false
    ElMessage.success('经营目标已删除')
  } catch { /* 用户取消删除。 */ }
}

function openDetail(goal) { selectedGoal.value = goal; detailVisible.value = true }
function progress(goal) { return Math.min(Math.round(goal.actual / goal.target * 1000) / 10, 100) }
function statusType(status) { return { 领先: 'success', 进行中: 'primary', 关注: 'warning', 已完成: 'success' }[status] || 'info' }
</script>

<template>
  <div class="operations-page goals-page">
    <header class="operations-header"><div><span>GOAL MANAGEMENT</span><h1>经营目标</h1><p>统一管理企业目标并分解到责任部门，持续跟踪执行偏差。</p></div><el-button type="primary" @click="openCreate()"><el-icon><Plus /></el-icon>新增目标</el-button></header>

    <section class="goal-summary-bar">
      <div><span>目标总数</span><strong>{{ summary.total }}</strong></div><div><span>平均完成率</span><strong>{{ summary.average }}%</strong></div><div><span>领先目标</span><strong class="success">{{ summary.leading }}</strong></div><div><span>需要关注</span><strong class="warning">{{ summary.attention }}</strong></div>
      <div class="goal-summary-note"><el-icon><Aim /></el-icon><span>年度重点：收入增长、回款质量、交付效率、客户续约</span></div>
    </section>

    <section class="management-panel">
      <div class="management-toolbar">
        <el-input v-model="keyword" clearable placeholder="搜索目标、部门或负责人" style="width: 260px"><template #prefix><el-icon><Search /></el-icon></template></el-input>
        <el-select v-model="cycleFilter" style="width: 140px"><el-option label="全部周期" value="all" /><el-option label="2026 年度" value="2026 年度" /><el-option label="第三季度" value="第三季度" /></el-select>
        <el-select v-model="statusFilter" style="width: 130px"><el-option label="全部状态" value="all" /><el-option label="领先" value="领先" /><el-option label="进行中" value="进行中" /><el-option label="关注" value="关注" /></el-select>
        <span class="toolbar-count">当前显示 {{ displayGoals.length }} 个顶层目标</span>
      </div>
      <el-table :data="displayGoals" row-key="id" default-expand-all :tree-props="{ children: 'children' }">
        <el-table-column prop="name" label="目标名称" min-width="250" />
        <el-table-column prop="cycle" label="考核周期" width="112" />
        <el-table-column prop="department" label="责任部门" min-width="150" />
        <el-table-column prop="owner" label="负责人" width="88" />
        <el-table-column label="目标进度" min-width="190"><template #default="{ row }"><div class="goal-progress"><span>{{ row.actual.toLocaleString() }} / {{ row.target.toLocaleString() }} {{ row.unit }}</span><el-progress :percentage="progress(row)" :stroke-width="7" /></div></template></el-table-column>
        <el-table-column prop="weight" label="权重" width="74"><template #default="{ row }">{{ row.weight }}%</template></el-table-column>
        <el-table-column label="状态" width="88"><template #default="{ row }"><el-tag :type="statusType(row.status)" size="small">{{ row.status }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="215" fixed="right"><template #default="{ row }"><el-button link type="primary" @click="openDetail(row)">查看</el-button><el-button link @click="openEdit(row)">编辑</el-button><el-button v-if="row.level === '企业'" link @click="openCreate(row.id)">分解</el-button><el-button link type="danger" @click="deleteGoal(row)">删除</el-button></template></el-table-column>
      </el-table>
    </section>

    <el-dialog v-model="dialogVisible" :title="dialogMode === 'create' ? '新增经营目标' : '编辑经营目标'" width="650px">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="目标名称" prop="name"><el-input v-model="form.name" maxlength="40" show-word-limit /></el-form-item>
        <div class="form-columns"><el-form-item label="目标层级"><el-select v-model="form.level" style="width:100%"><el-option label="企业" value="企业" /><el-option label="部门" value="部门" /></el-select></el-form-item><el-form-item label="考核周期"><el-select v-model="form.cycle" style="width:100%"><el-option label="2026 年度" value="2026 年度" /><el-option label="第三季度" value="第三季度" /><el-option label="9 月" value="9 月" /></el-select></el-form-item></div>
        <div class="form-columns"><el-form-item label="责任部门" prop="department"><el-input v-model="form.department" /></el-form-item><el-form-item label="负责人" prop="owner"><el-input v-model="form.owner" /></el-form-item></div>
        <div class="form-columns three"><el-form-item label="目标值" prop="target"><el-input-number v-model="form.target" :min="0" controls-position="right" style="width:100%" /></el-form-item><el-form-item label="当前值"><el-input-number v-model="form.actual" :min="0" controls-position="right" style="width:100%" /></el-form-item><el-form-item label="单位"><el-select v-model="form.unit" style="width:100%"><el-option label="万元" value="万元" /><el-option label="%" value="%" /><el-option label="个" value="个" /></el-select></el-form-item></div>
        <div class="form-columns"><el-form-item label="权重"><el-slider v-model="form.weight" :max="100" show-input /></el-form-item><el-form-item label="状态"><el-select v-model="form.status" style="width:100%"><el-option label="领先" value="领先" /><el-option label="进行中" value="进行中" /><el-option label="关注" value="关注" /><el-option label="已完成" value="已完成" /></el-select></el-form-item></div>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="saveGoal">保存目标</el-button></template>
    </el-dialog>

    <el-drawer v-model="detailVisible" title="目标详情" size="470px"><div v-if="selectedGoal" class="goal-detail"><span class="detail-badge">{{ selectedGoal.level }}级目标</span><h2>{{ selectedGoal.name }}</h2><el-progress type="dashboard" :percentage="progress(selectedGoal)" /><el-descriptions :column="1" border><el-descriptions-item label="责任部门">{{ selectedGoal.department }}</el-descriptions-item><el-descriptions-item label="负责人">{{ selectedGoal.owner }}</el-descriptions-item><el-descriptions-item label="考核周期">{{ selectedGoal.cycle }}</el-descriptions-item><el-descriptions-item label="目标值">{{ selectedGoal.target.toLocaleString() }} {{ selectedGoal.unit }}</el-descriptions-item><el-descriptions-item label="当前值">{{ selectedGoal.actual.toLocaleString() }} {{ selectedGoal.unit }}</el-descriptions-item><el-descriptions-item label="最近更新">{{ selectedGoal.updatedAt }}</el-descriptions-item></el-descriptions><el-button type="primary" @click="openEdit(selectedGoal); detailVisible = false">编辑目标</el-button></div></el-drawer>
  </div>
</template>
