<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useProjectStore } from '../../stores/projects'

const store = useProjectStore()
const period = ref('2026-09')
const formVisible = ref(false)
const formRef = ref()
const form = reactive({ employeeId: null, projectId: null, period: '2026-09', plannedHours: 0, actualHours: 0 })
const rules = { employeeId: [{ required: true, message: '请选择员工', trigger: 'change' }], projectId: [{ required: true, message: '请选择项目', trigger: 'change' }] }
const visibleProjects = computed(() => store.activeProjects.filter((project) => store.allocations.some((item) => item.period === period.value && item.projectId === project.id)))
const periodAllocations = computed(() => store.allocations.filter((item) => item.period === period.value))
const employeeRows = computed(() => store.deliveryEmployees.map((employee) => {
  const allocations = periodAllocations.value.filter((item) => item.employeeId === employee.id)
  const planned = allocations.reduce((sum, item) => sum + item.plannedHours, 0)
  const actual = allocations.reduce((sum, item) => sum + item.actualHours, 0)
  return { ...employee, allocations, planned, actual, load: Math.round(planned / 160 * 100) }
}))
const summary = computed(() => ({
  average: Math.round(employeeRows.value.reduce((sum, item) => sum + item.load, 0) / employeeRows.value.length),
  overloaded: employeeRows.value.filter((item) => item.load > 100).length,
  available: employeeRows.value.filter((item) => item.load < 70).length,
  hours: periodAllocations.value.reduce((sum, item) => sum + item.plannedHours, 0),
}))

function allocation(employeeId, projectId) { return periodAllocations.value.find((item) => item.employeeId === employeeId && item.projectId === projectId) }
function cellClass(hours) { if (!hours) return 'empty'; if (hours >= 96) return 'high'; if (hours >= 64) return 'medium'; return 'low' }
function loadType(load) { return load > 100 ? 'danger' : load >= 85 ? 'warning' : load < 70 ? 'success' : 'primary' }
function openAllocation(employeeId = null, projectId = null) {
  const existing = employeeId && projectId ? allocation(employeeId, projectId) : null
  Object.assign(form, existing ? { ...existing } : { employeeId, projectId, period: period.value, plannedHours: 0, actualHours: 0 })
  formVisible.value = true
}
async function save() { await formRef.value.validate(); store.saveAllocation({ ...form }); formVisible.value = false; ElMessage.success('资源计划已更新，人员负载已重新计算') }
function exportResources() {
  const rows = [['员工', '岗位', '期间', '计划工时', '实际工时', '负载率'], ...employeeRows.value.map((item) => [item.name, item.position, period.value, item.planned, item.actual, `${item.load}%`])]
  const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([`\ufeff${rows.map((row) => row.join(',')).join('\n')}`], { type: 'text/csv;charset=utf-8' })); link.download = `项目资源负载-${period.value}.csv`; link.click(); URL.revokeObjectURL(link.href); ElMessage.success('资源负载数据已导出')
}
</script>

<template>
  <div class="project-page resource-page">
    <header class="project-header"><div><span>RESOURCE CAPACITY</span><h1>项目资源</h1><p>查看项目交付中心人员投入、负载率和跨项目冲突。</p></div><div><el-select v-model="period"><el-option label="2026 年 9 月" value="2026-09" /><el-option label="2026 年 10 月" value="2026-10" /></el-select><el-button @click="exportResources"><el-icon><Download /></el-icon>导出负载</el-button><el-button type="primary" @click="openAllocation()"><el-icon><Plus /></el-icon>调整资源</el-button></div></header>
    <section class="resource-overview"><div class="resource-main-stat"><span>团队平均负载率</span><strong>{{ summary.average }}%</strong><el-progress :percentage="Math.min(summary.average, 100)" :show-text="false" /></div><div><span>计划投入</span><strong>{{ summary.hours }}<small>小时</small></strong></div><div class="danger"><span>超负载人员</span><strong>{{ summary.overloaded }}<small>人</small></strong></div><div><span>可调配人员</span><strong>{{ summary.available }}<small>人</small></strong></div><aside><i class="low"></i>低投入<i class="medium"></i>中投入<i class="high"></i>高投入</aside></section>
    <section class="resource-heatmap"><header><div><h2>人员项目投入热力图</h2><p>单元格为当月计划工时，点击可直接调整</p></div><span>标准月度可用工时 160 小时</span></header><div class="resource-grid" :style="{ gridTemplateColumns: `190px repeat(${visibleProjects.length}, minmax(125px, 1fr)) 130px` }"><div class="resource-grid-head">员工与岗位</div><div v-for="project in visibleProjects" :key="project.id" class="resource-grid-head project-name">{{ project.name }}</div><div class="resource-grid-head">总负载</div><template v-for="employee in employeeRows" :key="employee.id"><div class="resource-person"><el-avatar :size="34">{{ employee.name.slice(0, 1) }}</el-avatar><div><strong>{{ employee.name }}</strong><span>{{ employee.position }}</span></div></div><button v-for="project in visibleProjects" :key="project.id" :class="['resource-cell', cellClass(allocation(employee.id, project.id)?.plannedHours)]" @click="openAllocation(employee.id, project.id)"><strong>{{ allocation(employee.id, project.id)?.plannedHours || 0 }}</strong><span>小时</span></button><div class="resource-load"><el-tag :type="loadType(employee.load)">{{ employee.load }}%</el-tag><small>{{ employee.planned }} / 160 小时</small></div></template></div></section>
    <section class="resource-ledger"><header><h2>人员负载明细</h2><p>计划与实际投入对比</p></header><el-table :data="employeeRows"><el-table-column prop="code" label="工号" width="105" /><el-table-column prop="name" label="员工" /><el-table-column prop="position" label="岗位" min-width="130" /><el-table-column label="参与项目" min-width="230"><template #default="{ row }">{{ row.allocations.map((item) => store.projectMap[item.projectId]?.name).join('、') || '待分配' }}</template></el-table-column><el-table-column prop="planned" label="计划工时" /><el-table-column prop="actual" label="实际工时" /><el-table-column label="负载率" min-width="150"><template #default="{ row }"><el-progress :percentage="Math.min(row.load, 100)" :status="row.load > 100 ? 'exception' : undefined" /></template></el-table-column><el-table-column label="操作" width="90"><template #default="{ row }"><el-button link type="primary" @click="openAllocation(row.id, null)">调整</el-button></template></el-table-column></el-table></section>
    <el-dialog v-model="formVisible" title="调整项目资源" width="560px"><el-form ref="formRef" :model="form" :rules="rules" label-position="top"><el-form-item label="交付员工" prop="employeeId"><el-select v-model="form.employeeId" filterable style="width:100%"><el-option v-for="item in store.deliveryEmployees" :key="item.id" :label="`${item.name} · ${item.position}`" :value="item.id" /></el-select></el-form-item><el-form-item label="参与项目" prop="projectId"><el-select v-model="form.projectId" filterable style="width:100%"><el-option v-for="item in store.activeProjects" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item><el-form-item label="计划月份"><el-date-picker v-model="form.period" type="month" value-format="YYYY-MM" style="width:100%" /></el-form-item><div class="project-form-grid"><el-form-item label="计划工时"><el-input-number v-model="form.plannedHours" :min="0" :max="200" style="width:100%" /></el-form-item><el-form-item label="实际工时"><el-input-number v-model="form.actualHours" :min="0" :max="200" style="width:100%" /></el-form-item></div><el-alert v-if="form.plannedHours > 160" title="该项目单项投入已超过标准月度可用工时，请确认排期。" type="warning" :closable="false" /></el-form><template #footer><el-button @click="formVisible = false">取消</el-button><el-button type="primary" @click="save">保存资源计划</el-button></template></el-dialog>
  </div>
</template>
