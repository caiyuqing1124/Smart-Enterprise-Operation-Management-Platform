<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useProjectStore } from '../../stores/projects'
import { useSalesStore } from '../../stores/sales'

const route = useRoute()
const router = useRouter()
const store = useProjectStore()
const salesStore = useSalesStore()
const projectId = computed(() => Number(route.params.id))
const project = computed(() => store.projectMap[projectId.value])
const customer = computed(() => project.value && salesStore.customerMap[project.value.customerId])
const contract = computed(() => project.value && salesStore.contracts.find((item) => item.id === project.value.contractId))
const tasks = computed(() => store.tasks.filter((item) => item.projectId === projectId.value))
const milestones = computed(() => store.milestones.filter((item) => item.projectId === projectId.value).sort((a, b) => a.plannedDate.localeCompare(b.plannedDate)))
const risks = computed(() => store.risks.filter((item) => item.projectId === projectId.value))
const files = computed(() => store.files.filter((item) => item.projectId === projectId.value))
const activities = computed(() => store.activities.filter((item) => item.projectId === projectId.value).slice(0, 12))
const activeTab = ref('overview')
const memberVisible = ref(false)
const memberIds = ref([])
const riskVisible = ref(false)
const riskRef = ref()
const riskMode = ref('create')
const riskForm = reactive({ id: null, title: '', probability: '中', impact: '中', level: '中', response: '', ownerId: null, deadline: '', status: '监控中' })
const riskRules = { title: [{ required: true, message: '请输入风险标题', trigger: 'blur' }], response: [{ required: true, message: '请输入应对措施', trigger: 'blur' }], ownerId: [{ required: true, message: '请选择责任人', trigger: 'change' }], deadline: [{ required: true, message: '请选择处理期限', trigger: 'change' }] }

const completedTasks = computed(() => tasks.value.filter((item) => item.status === '已完成').length)
const costRate = computed(() => project.value?.budgetCost ? Math.round(project.value.actualCost / project.value.budgetCost * 100) : 0)

function openMembers() {
  memberIds.value = [...project.value.memberIds]
  memberVisible.value = true
}

function saveMembers() {
  if (!memberIds.value.includes(project.value.managerId)) memberIds.value.unshift(project.value.managerId)
  store.updateProject(projectId.value, { memberIds: [...memberIds.value] })
  memberVisible.value = false
  ElMessage.success('项目成员已更新')
}

function openRisk(item = null) {
  Object.assign(riskForm, item ? { ...item } : { id: null, title: '', probability: '中', impact: '中', level: '中', response: '', ownerId: project.value.managerId, deadline: '', status: '监控中' })
  riskMode.value = item ? 'edit' : 'create'
  riskVisible.value = true
}

async function saveRisk() {
  await riskRef.value.validate()
  const payload = { ...riskForm, projectId: projectId.value }
  delete payload.id
  riskMode.value === 'create' ? store.addRisk(payload) : store.updateRisk(riskForm.id, payload)
  riskVisible.value = false
  ElMessage.success(riskMode.value === 'create' ? '项目风险已登记' : '风险信息已更新')
}

async function closeRisk(item) {
  try {
    await ElMessageBox.confirm(`确认风险“${item.title}”已经完成处置吗？`, '关闭风险', { confirmButtonText: '确认关闭', cancelButtonText: '取消', type: 'warning' })
    store.updateRisk(item.id, { status: '已关闭' })
    ElMessage.success('风险已关闭')
  } catch { /* 保持风险状态。 */ }
}

async function removeRisk(item) {
  try {
    await ElMessageBox.confirm(`确定删除风险“${item.title}”吗？`, '删除风险', { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' })
    store.removeRisk(item.id)
    ElMessage.success('风险已删除')
  } catch { /* 保留风险。 */ }
}

async function approveMilestone(item) {
  try {
    const message = item.isCustomerAcceptance ? '通过后将自动触发合同验收款到期，并将合同变更为待结算。确定继续吗？' : `确认“${item.name}”验收通过吗？`
    await ElMessageBox.confirm(message, '验收确认', { confirmButtonText: '确认通过', cancelButtonText: '取消', type: 'warning' })
    store.approveMilestone(item.id)
    ElMessage.success(item.isCustomerAcceptance ? '客户验收已通过，合同与验收款状态已同步' : '里程碑验收已通过')
  } catch { /* 保持当前验收状态。 */ }
}

async function returnMilestone(item) {
  try {
    const { value } = await ElMessageBox.prompt('请填写需要整改的具体内容', '退回整改', { confirmButtonText: '确认退回', cancelButtonText: '取消', inputValidator: (input) => Boolean(input?.trim()) || '请填写整改要求' })
    store.returnMilestone(item.id, value)
    ElMessage.success('已退回整改')
  } catch { /* 保持当前验收状态。 */ }
}

function uploadChanged(file) {
  const bytes = file.size || file.raw?.size || 0
  const size = bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
  store.addFile(projectId.value, { name: file.name, size }, project.value.managerId)
  ElMessage.success('文件已加入项目档案')
}

async function removeFile(item) {
  try {
    await ElMessageBox.confirm(`确定删除文件“${item.name}”吗？`, '删除项目文件', { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' })
    store.removeFile(item.id)
    ElMessage.success('文件已删除')
  } catch { /* 保留文件。 */ }
}

function previewFile(item) {
  ElMessage.info(`已打开“${item.name}”的前端文件记录`)
}

function healthType(value) {
  return { 正常: 'success', 关注: 'warning', 延期风险: 'danger', 成本风险: 'danger', 已暂停: 'info' }[value] || 'info'
}
</script>

<template>
  <div v-if="project" class="project-page project-detail-page">
    <div class="project-detail-back"><el-button link @click="router.push('/projects')"><el-icon><ArrowLeft /></el-icon>返回项目总览</el-button></div>
    <section class="project-detail-hero">
      <div class="project-detail-code"><span>{{ project.code }}</span><el-tag :type="healthType(project.health)">{{ project.health }}</el-tag></div>
      <div class="project-detail-title"><div><h1>{{ project.name }}</h1><p>{{ customer?.name }} · {{ contract?.code }}</p></div><div class="project-detail-actions"><el-button @click="openMembers"><el-icon><UserFilled /></el-icon>调整成员</el-button><el-button @click="activeTab = 'risks'; openRisk()"><el-icon><Warning /></el-icon>登记风险</el-button><el-button type="primary" @click="router.push({ path: '/projects/tasks', query: { projectId } })"><el-icon><Plus /></el-icon>管理任务</el-button></div></div>
      <div class="project-detail-metrics"><div><span>任务完成</span><strong>{{ completedTasks }} / {{ tasks.length }}</strong></div><div><span>项目进度</span><strong>{{ project.progress }}%</strong></div><div><span>成本执行</span><strong>{{ costRate }}%</strong></div><div><span>客户验收</span><strong>{{ project.acceptanceStatus }}</strong></div><div><span>计划完成</span><strong>{{ project.plannedEnd }}</strong></div></div>
    </section>

    <div class="project-detail-body">
      <main class="project-detail-main">
        <el-tabs v-model="activeTab" class="project-detail-tabs">
          <el-tab-pane label="项目概况" name="overview">
            <section class="project-overview-sections"><div><h3>交付说明</h3><p>{{ project.description }}</p><el-descriptions :column="2" border><el-descriptions-item label="项目经理">{{ store.employeeMap[project.managerId]?.name }}</el-descriptions-item><el-descriptions-item label="责任部门">{{ store.departmentMap[store.deliveryDepartmentId]?.name }}</el-descriptions-item><el-descriptions-item label="计划周期">{{ project.plannedStart }} 至 {{ project.plannedEnd }}</el-descriptions-item><el-descriptions-item label="实际开始">{{ project.actualStart || '尚未启动' }}</el-descriptions-item><el-descriptions-item label="合同金额">{{ project.contractAmount }} 万元</el-descriptions-item><el-descriptions-item label="预算成本">{{ project.budgetCost }} 万元</el-descriptions-item></el-descriptions></div><div class="project-relation-chain"><h3>业务来源与下游</h3><button @click="router.push(`/sales/customers/${customer.id}`)"><span>客户</span><strong>{{ customer.name }}</strong><small>{{ customer.code }}</small></button><i>→</i><button @click="router.push({ path: '/sales/contracts', query: { selected: contract.id } })"><span>合同</span><strong>{{ contract.name }}</strong><small>{{ contract.code }}</small></button><i>→</i><div class="current-project-node"><span>项目</span><strong>{{ project.name }}</strong><small>{{ project.code }}</small></div></div></section>
          </el-tab-pane>
          <el-tab-pane :label="`任务 ${tasks.length}`" name="tasks"><div class="tab-head"><div><h3>项目任务</h3><p>全部任务完成后项目自动完成</p></div><el-button type="primary" @click="router.push({ path: '/projects/tasks', query: { projectId } })">进入任务计划</el-button></div><el-table :data="tasks"><el-table-column prop="name" label="任务名称" min-width="220" /><el-table-column label="负责人"><template #default="{ row }">{{ store.employeeMap[row.assigneeId]?.name }}</template></el-table-column><el-table-column prop="dueDate" label="截止日期" /><el-table-column label="进度" min-width="150"><template #default="{ row }"><el-progress :percentage="row.progress" /></template></el-table-column><el-table-column prop="status" label="状态" /><el-table-column label="操作" width="90"><template #default="{ row }"><el-button link type="primary" @click="store.toggleTaskComplete(row.id)">{{ row.status === '已完成' ? '重新打开' : '完成' }}</el-button></template></el-table-column></el-table></el-tab-pane>
          <el-tab-pane :label="`里程碑 ${milestones.length}`" name="milestones"><div class="tab-head"><div><h3>交付里程碑</h3><p>客户验收通过后自动联动合同结算</p></div><el-button type="primary" @click="router.push({ path: '/projects/milestones', query: { projectId } })">里程碑管理</el-button></div><div class="detail-milestone-list"><article v-for="item in milestones" :key="item.id"><i :class="{ done: item.acceptanceStatus === '已通过' }"></i><div><strong>{{ item.name }}<el-tag v-if="item.isCustomerAcceptance" size="small">客户验收</el-tag></strong><span>计划 {{ item.plannedDate }} · {{ store.employeeMap[item.ownerId]?.name }}</span><small>{{ item.deliverables.join('、') }}</small></div><el-tag>{{ item.acceptanceStatus }}</el-tag><div><el-button v-if="item.acceptanceStatus === '待提交'" size="small" @click="store.submitMilestone(item.id)">提交验收</el-button><template v-if="item.acceptanceStatus === '待验收'"><el-button size="small" type="success" @click="approveMilestone(item)">通过</el-button><el-button size="small" type="danger" plain @click="returnMilestone(item)">退回</el-button></template></div></article></div></el-tab-pane>
          <el-tab-pane :label="`成员 ${project.memberIds.length}`" name="members"><div class="tab-head"><div><h3>交付团队</h3><p>仅使用项目交付中心在职员工</p></div><el-button type="primary" @click="openMembers">调整成员</el-button></div><div class="project-member-grid"><article v-for="id in project.memberIds" :key="id"><el-avatar>{{ store.employeeMap[id]?.name.slice(0, 1) }}</el-avatar><div><strong>{{ store.employeeMap[id]?.name }}</strong><span>{{ store.employeeMap[id]?.position }}</span><small>{{ store.employeeMap[id]?.skills.join(' · ') }}</small></div><el-tag v-if="id === project.managerId" type="primary">项目经理</el-tag></article></div></el-tab-pane>
          <el-tab-pane label="成本" name="cost"><section class="project-cost-board"><div class="cost-gauge"><el-progress type="dashboard" :percentage="costRate" :color="costRate > 90 ? '#ef4444' : '#246bfd'" /><strong>预算执行率</strong></div><dl><div><dt>合同金额</dt><dd>{{ project.contractAmount }} 万元</dd></div><div><dt>预算成本</dt><dd>{{ project.budgetCost }} 万元</dd></div><div><dt>实际成本</dt><dd>{{ project.actualCost }} 万元</dd></div><div><dt>预计毛利</dt><dd>{{ project.contractAmount - project.actualCost }} 万元</dd></div></dl><p>当前成本由项目交付成本台账汇总，后续财务模块接入后由采购、报销和财务流水自动汇总。</p></section></el-tab-pane>
          <el-tab-pane :label="`风险 ${risks.filter((item) => item.status !== '已关闭').length}`" name="risks"><div class="tab-head"><div><h3>项目风险台账</h3><p>跟踪风险责任、措施和处理期限</p></div><el-button type="primary" @click="openRisk()"><el-icon><Plus /></el-icon>登记风险</el-button></div><el-table :data="risks"><el-table-column prop="title" label="风险事项" min-width="220" /><el-table-column prop="level" label="等级" width="70" /><el-table-column label="责任人" width="90"><template #default="{ row }">{{ store.employeeMap[row.ownerId]?.name }}</template></el-table-column><el-table-column prop="deadline" label="处理期限" width="110" /><el-table-column prop="status" label="状态" width="90" /><el-table-column label="操作" width="190"><template #default="{ row }"><el-button link @click="openRisk(row)">编辑</el-button><el-button link type="success" :disabled="row.status === '已关闭'" @click="closeRisk(row)">关闭</el-button><el-button link type="danger" @click="removeRisk(row)">删除</el-button></template></el-table-column></el-table></el-tab-pane>
          <el-tab-pane :label="`文件 ${files.length}`" name="files"><div class="tab-head"><div><h3>项目文件</h3><p>保存计划、交付物和验收材料记录</p></div><el-upload :auto-upload="false" :show-file-list="false" @change="uploadChanged"><el-button type="primary"><el-icon><Plus /></el-icon>上传文件</el-button></el-upload></div><div class="project-file-list"><article v-for="item in files" :key="item.id"><el-icon><Document /></el-icon><div><strong>{{ item.name }}</strong><span>{{ item.size }} · {{ store.employeeMap[item.uploaderId]?.name }} · {{ item.uploadedAt }}</span></div><el-button link type="primary" @click="previewFile(item)">预览</el-button><el-button link type="danger" @click="removeFile(item)">删除</el-button></article><el-empty v-if="!files.length" description="暂无项目文件" /></div></el-tab-pane>
        </el-tabs>
      </main>
      <aside class="project-activity-side"><header><h3>项目动态</h3><span>{{ activities.length }} 条</span></header><div><article v-for="item in activities" :key="item.id"><i></i><strong>{{ item.action }}</strong><span>{{ store.employeeMap[item.operatorId]?.name }} · {{ item.time }}</span></article></div></aside>
    </div>

    <el-dialog v-model="memberVisible" title="调整项目成员" width="560px"><p class="dialog-note">可选人员均来自项目交付中心，项目经理会自动保留在成员中。</p><el-select v-model="memberIds" multiple filterable style="width:100%"><el-option v-for="item in store.deliveryEmployees" :key="item.id" :label="`${item.name} · ${item.position}`" :value="item.id" /></el-select><template #footer><el-button @click="memberVisible = false">取消</el-button><el-button type="primary" @click="saveMembers">保存成员</el-button></template></el-dialog>
    <el-dialog v-model="riskVisible" :title="riskMode === 'create' ? '登记项目风险' : '编辑项目风险'" width="660px"><el-form ref="riskRef" :model="riskForm" :rules="riskRules" label-position="top"><div class="project-form-grid"><el-form-item label="风险标题" prop="title" class="span-two"><el-input v-model="riskForm.title" /></el-form-item><el-form-item label="发生概率"><el-select v-model="riskForm.probability" style="width:100%"><el-option v-for="item in ['低','中','高']" :key="item" :label="item" :value="item" /></el-select></el-form-item><el-form-item label="影响程度"><el-select v-model="riskForm.impact" style="width:100%"><el-option v-for="item in ['低','中','高']" :key="item" :label="item" :value="item" /></el-select></el-form-item><el-form-item label="风险等级"><el-select v-model="riskForm.level" style="width:100%"><el-option v-for="item in ['低','中','高']" :key="item" :label="item" :value="item" /></el-select></el-form-item><el-form-item label="责任人" prop="ownerId"><el-select v-model="riskForm.ownerId" style="width:100%"><el-option v-for="item in store.deliveryEmployees" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item><el-form-item label="处理期限" prop="deadline"><el-date-picker v-model="riskForm.deadline" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item><el-form-item label="状态"><el-select v-model="riskForm.status" style="width:100%"><el-option v-for="item in ['监控中','处理中','已关闭']" :key="item" :label="item" :value="item" /></el-select></el-form-item><el-form-item label="应对措施" prop="response" class="span-two"><el-input v-model="riskForm.response" type="textarea" :rows="3" /></el-form-item></div></el-form><template #footer><el-button @click="riskVisible = false">取消</el-button><el-button type="primary" @click="saveRisk">保存风险</el-button></template></el-dialog>
  </div>
  <el-result v-else icon="warning" title="未找到项目" sub-title="该项目可能已归档或删除"><template #extra><el-button type="primary" @click="router.push('/projects')">返回项目总览</el-button></template></el-result>
</template>
