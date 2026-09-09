<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { projectHealthStatuses, projectStatuses } from '../../mock/projects'
import { useProjectStore } from '../../stores/projects'
import { useSalesStore } from '../../stores/sales'

const route = useRoute()
const router = useRouter()
const store = useProjectStore()
const salesStore = useSalesStore()
const viewMode = ref('card')
const keyword = ref('')
const status = ref('all')
const health = ref('all')
const managerId = ref('all')
const formVisible = ref(false)
const formRef = ref()
const mode = ref('create')
const form = reactive({ id: null, name: '', customerId: null, contractId: null, managerId: null, memberIds: [], plannedStart: '', plannedEnd: '', contractAmount: 0, budgetCost: 0, health: '正常', status: '未启动', description: '' })
const rules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  contractId: [{ required: true, message: '请选择关联合同', trigger: 'change' }],
  managerId: [{ required: true, message: '请选择项目经理', trigger: 'change' }],
  plannedStart: [{ required: true, message: '请选择计划开始日期', trigger: 'change' }],
  plannedEnd: [{ required: true, message: '请选择计划结束日期', trigger: 'change' }],
}

const filtered = computed(() => store.activeProjects.filter((item) => {
  const customer = salesStore.customerMap[item.customerId]
  const manager = store.employeeMap[item.managerId]
  const matchesKeyword = !keyword.value || `${item.code}${item.name}${customer?.name || ''}${manager?.name || ''}`.toLowerCase().includes(keyword.value.toLowerCase())
  return matchesKeyword && (status.value === 'all' || item.status === status.value) && (health.value === 'all' || item.health === health.value) && (managerId.value === 'all' || item.managerId === managerId.value)
}))

const summary = computed(() => ({
  total: store.activeProjects.length,
  executing: store.activeProjects.filter((item) => item.status === '执行中').length,
  risk: store.activeProjects.filter((item) => ['延期风险', '成本风险'].includes(item.health)).length,
  contractAmount: store.activeProjects.reduce((sum, item) => sum + Number(item.contractAmount), 0),
  averageProgress: store.activeProjects.length ? Math.round(store.activeProjects.reduce((sum, item) => sum + Number(item.progress), 0) / store.activeProjects.length) : 0,
}))

function resetForm() {
  Object.assign(form, { id: null, name: '', customerId: null, contractId: null, managerId: null, memberIds: [], plannedStart: '', plannedEnd: '', contractAmount: 0, budgetCost: 0, health: '正常', status: '未启动', description: '' })
}

function applyContract(contractId) {
  const contract = salesStore.contracts.find((item) => item.id === contractId)
  if (!contract) return
  form.customerId = contract.customerId
  form.contractAmount = contract.amount
  form.plannedStart = contract.startAt
  form.plannedEnd = contract.endAt
  if (!form.name) form.name = contract.name.replace('合同', '')
}

function openCreate(contractId = null) {
  resetForm()
  mode.value = 'create'
  if (contractId) { form.contractId = contractId; applyContract(contractId) }
  formVisible.value = true
}

function openEdit(item) {
  Object.assign(form, cloneProject(item))
  mode.value = 'edit'
  formVisible.value = true
}

function cloneProject(item) {
  return { ...item, memberIds: [...item.memberIds] }
}

async function save() {
  await formRef.value.validate()
  if (form.plannedEnd < form.plannedStart) { ElMessage.warning('计划结束日期不能早于开始日期'); return }
  const memberIds = Array.from(new Set([form.managerId, ...form.memberIds]))
  const payload = { ...form, memberIds }
  delete payload.id
  try {
    if (mode.value === 'create') store.addProject(payload)
    else store.updateProject(form.id, payload)
    formVisible.value = false
    ElMessage.success(mode.value === 'create' ? '项目已创建并关联客户与合同' : '项目信息已更新')
  } catch (error) {
    ElMessage.error(error.message)
  }
}

async function archive(item) {
  try {
    await ElMessageBox.confirm(`归档“${item.name}”后将不再出现在执行项目中，但历史数据会保留。确定继续吗？`, '归档项目', { confirmButtonText: '确认归档', cancelButtonText: '取消', type: 'warning' })
    store.archiveProject(item.id)
    ElMessage.success('项目已归档')
  } catch { /* 保留项目。 */ }
}

function exportProjects() {
  const rows = [['项目编码', '项目名称', '客户', '合同', '项目经理', '进度', '健康度', '状态'], ...filtered.value.map((item) => [item.code, item.name, salesStore.customerMap[item.customerId]?.name, salesStore.contracts.find((contract) => contract.id === item.contractId)?.code, store.employeeMap[item.managerId]?.name, `${item.progress}%`, item.health, item.status])]
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([`\ufeff${rows.map((row) => row.join(',')).join('\n')}`], { type: 'text/csv;charset=utf-8' }))
  link.download = '项目交付台账.csv'
  link.click()
  URL.revokeObjectURL(link.href)
  ElMessage.success('项目台账已导出')
}

function healthType(value) {
  return { 正常: 'success', 关注: 'warning', 延期风险: 'danger', 成本风险: 'danger', 已暂停: 'info' }[value] || 'info'
}

onMounted(() => {
  if (route.query.contractId) openCreate(Number(route.query.contractId))
})
</script>

<template>
  <div class="project-page project-overview-page">
    <header class="project-header">
      <div><span>PROJECT DELIVERY</span><h1>项目总览</h1><p>统一掌握合同交付、任务进度、成本和项目健康状态。</p></div>
      <div><el-button @click="exportProjects"><el-icon><Download /></el-icon>导出项目</el-button><el-button type="primary" @click="openCreate()"><el-icon><Plus /></el-icon>新建项目</el-button></div>
    </header>

    <section class="project-command-strip">
      <div class="command-primary"><span>在管项目合同额</span><strong>{{ summary.contractAmount.toLocaleString() }}<small>万元</small></strong><p>{{ summary.total }} 个项目 · 平均进度 {{ summary.averageProgress }}%</p></div>
      <div><span>执行中</span><strong>{{ summary.executing }}</strong><small>个项目持续交付</small></div>
      <div :class="{ danger: summary.risk }"><span>风险项目</span><strong>{{ summary.risk }}</strong><small>延期或成本风险</small></div>
      <div class="command-progress"><span>整体交付进度</span><el-progress type="dashboard" :percentage="summary.averageProgress" :width="84" /></div>
    </section>

    <div class="project-overview-layout">
      <aside class="project-filter-rail">
        <h3>项目筛选</h3>
        <label>项目状态</label><el-select v-model="status"><el-option label="全部状态" value="all" /><el-option v-for="item in projectStatuses.filter((item) => item !== '已归档')" :key="item" :label="item" :value="item" /></el-select>
        <label>健康状态</label><el-select v-model="health"><el-option label="全部健康度" value="all" /><el-option v-for="item in projectHealthStatuses" :key="item" :label="item" :value="item" /></el-select>
        <label>项目经理</label><el-select v-model="managerId"><el-option label="全部经理" value="all" /><el-option v-for="item in store.deliveryEmployees" :key="item.id" :label="item.name" :value="item.id" /></el-select>
        <div class="filter-rail-summary"><span>当前结果</span><strong>{{ filtered.length }}</strong><small>个符合条件的项目</small></div>
      </aside>

      <main class="project-overview-main">
        <div class="project-toolbar"><el-input v-model="keyword" clearable placeholder="搜索项目、客户、合同或项目经理"><template #prefix><el-icon><Search /></el-icon></template></el-input><el-radio-group v-model="viewMode"><el-radio-button value="card">卡片</el-radio-button><el-radio-button value="table">表格</el-radio-button></el-radio-group></div>

        <div v-if="viewMode === 'card'" class="project-card-wall">
          <article v-for="item in filtered" :key="item.id" class="project-card" @click="router.push(`/projects/${item.id}`)">
            <header><div><span>{{ item.code }}</span><h3>{{ item.name }}</h3></div><el-tag :type="healthType(item.health)" size="small">{{ item.health }}</el-tag></header>
            <p class="project-customer"><el-icon><OfficeBuilding /></el-icon>{{ salesStore.customerMap[item.customerId]?.name }}</p>
            <div class="project-card-progress"><div><span>任务进度</span><strong>{{ item.progress }}%</strong></div><el-progress :percentage="item.progress" :show-text="false" :stroke-width="8" /></div>
            <dl><div><dt>项目经理</dt><dd>{{ store.employeeMap[item.managerId]?.name }}</dd></div><div><dt>计划周期</dt><dd>{{ item.plannedStart.slice(5) }} — {{ item.plannedEnd.slice(5) }}</dd></div><div><dt>合同金额</dt><dd>{{ item.contractAmount }} 万</dd></div><div><dt>预算执行</dt><dd>{{ item.budgetCost ? Math.round(item.actualCost / item.budgetCost * 100) : 0 }}%</dd></div></dl>
            <footer><span>{{ item.status }}</span><div><el-button link @click.stop="openEdit(item)">编辑</el-button><el-button link type="danger" @click.stop="archive(item)">归档</el-button></div></footer>
          </article>
          <el-empty v-if="!filtered.length" description="没有符合条件的项目" />
        </div>

        <section v-else class="project-table-panel"><el-table :data="filtered"><el-table-column prop="code" label="项目编码" width="120" /><el-table-column prop="name" label="项目名称" min-width="210" /><el-table-column label="客户" min-width="150"><template #default="{ row }">{{ salesStore.customerMap[row.customerId]?.shortName }}</template></el-table-column><el-table-column label="项目经理" width="90"><template #default="{ row }">{{ store.employeeMap[row.managerId]?.name }}</template></el-table-column><el-table-column label="进度" min-width="145"><template #default="{ row }"><el-progress :percentage="row.progress" :stroke-width="7" /></template></el-table-column><el-table-column label="健康度" width="100"><template #default="{ row }"><el-tag :type="healthType(row.health)">{{ row.health }}</el-tag></template></el-table-column><el-table-column prop="plannedEnd" label="计划结束" width="110" /><el-table-column label="操作" width="160" fixed="right"><template #default="{ row }"><el-button link type="primary" @click="router.push(`/projects/${row.id}`)">查看</el-button><el-button link @click="openEdit(row)">编辑</el-button><el-button link type="danger" @click="archive(row)">归档</el-button></template></el-table-column></el-table></section>
      </main>
    </div>

    <el-dialog v-model="formVisible" :title="mode === 'create' ? '新建交付项目' : '编辑项目信息'" width="760px">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <div class="project-form-grid">
          <el-form-item label="项目名称" prop="name" class="span-two"><el-input v-model="form.name" /></el-form-item>
          <el-form-item label="关联合同" prop="contractId"><el-select v-model="form.contractId" filterable style="width:100%" @change="applyContract"><el-option v-for="item in salesStore.contracts" :key="item.id" :label="`${item.code} · ${item.name}`" :value="item.id" /></el-select></el-form-item>
          <el-form-item label="关联客户"><el-input :model-value="salesStore.customerMap[form.customerId]?.name || '选择合同后自动确定'" disabled /></el-form-item>
          <el-form-item label="项目经理" prop="managerId"><el-select v-model="form.managerId" style="width:100%"><el-option v-for="item in store.deliveryEmployees" :key="item.id" :label="`${item.name} · ${item.position}`" :value="item.id" /></el-select></el-form-item>
          <el-form-item label="项目成员"><el-select v-model="form.memberIds" multiple collapse-tags style="width:100%"><el-option v-for="item in store.deliveryEmployees" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item>
          <el-form-item label="计划开始" prop="plannedStart"><el-date-picker v-model="form.plannedStart" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
          <el-form-item label="计划结束" prop="plannedEnd"><el-date-picker v-model="form.plannedEnd" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
          <el-form-item label="合同金额（万元）"><el-input-number v-model="form.contractAmount" :min="0" disabled style="width:100%" /></el-form-item>
          <el-form-item label="预算成本（万元）"><el-input-number v-model="form.budgetCost" :min="0" style="width:100%" /></el-form-item>
          <el-form-item label="项目状态"><el-select v-model="form.status" style="width:100%"><el-option v-for="item in projectStatuses.filter((item) => !['已完成','已归档'].includes(item))" :key="item" :label="item" :value="item" /></el-select></el-form-item>
          <el-form-item label="健康状态"><el-select v-model="form.health" style="width:100%"><el-option v-for="item in projectHealthStatuses" :key="item" :label="item" :value="item" /></el-select></el-form-item>
          <el-form-item label="项目说明" class="span-two"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item>
        </div>
      </el-form>
      <template #footer><el-button @click="formVisible = false">取消</el-button><el-button type="primary" @click="save">保存项目</el-button></template>
    </el-dialog>
  </div>
</template>
