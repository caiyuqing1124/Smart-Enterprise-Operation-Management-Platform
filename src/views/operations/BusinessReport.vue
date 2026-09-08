<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { operationSnapshots, reportPeriods } from '../../mock/operations'
import { useOperationsStore } from '../../stores/operations'

const store = useOperationsStore()
const period = ref('2026-09')
const conclusionVisible = ref(false)
const actionVisible = ref(false)
const actionMode = ref('create')
const actionFormRef = ref()
const conclusionText = ref('')
const actionForm = reactive({ id: null, action: '', owner: '', department: '', deadline: '', status: '未开始' })
const report = computed(() => store.reports[period.value])
const snapshot = computed(() => operationSnapshots[period.value])
const actionRules = { action: [{ required: true, message: '请输入行动事项', trigger: 'blur' }], owner: [{ required: true, message: '请输入负责人', trigger: 'blur' }], department: [{ required: true, message: '请输入责任部门', trigger: 'blur' }], deadline: [{ required: true, message: '请选择完成期限', trigger: 'change' }] }

function openConclusion() { conclusionText.value = report.value.conclusion; conclusionVisible.value = true }
function saveConclusion() { if (!conclusionText.value.trim()) { ElMessage.warning('经营结论不能为空'); return }; store.updateConclusion(period.value, conclusionText.value.trim()); conclusionVisible.value = false; ElMessage.success('经营结论已更新') }
function resetAction() { Object.assign(actionForm, { id: null, action: '', owner: '', department: '', deadline: '', status: '未开始' }) }
function openAction() { resetAction(); actionMode.value = 'create'; actionVisible.value = true }
function editAction(item) { Object.assign(actionForm, item); actionMode.value = 'edit'; actionVisible.value = true }
async function saveAction() { await actionFormRef.value.validate(); const payload = { ...actionForm }; delete payload.id; actionMode.value === 'create' ? store.addAction(period.value, payload) : store.updateAction(period.value, actionForm.id, payload); actionVisible.value = false; ElMessage.success(actionMode.value === 'create' ? '行动事项已添加' : '行动事项已更新') }
async function removeAction(item) { try { await ElMessageBox.confirm(`确定删除行动事项“${item.action}”吗？`, '删除行动事项', { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' }); store.removeAction(period.value, item.id); ElMessage.success('行动事项已删除') } catch { /* 用户取消删除。 */ } }
function updateStatus(item, status) { store.updateAction(period.value, item.id, { status }); ElMessage.success('行动状态已更新') }
function statusType(status) { return { 已完成: 'success', 进行中: 'primary', 未开始: 'info', 已延期: 'danger' }[status] }

function exportReport() {
  const actionRows = report.value.actions.map((item) => `<tr><td>${item.action}</td><td>${item.owner}</td><td>${item.department}</td><td>${item.deadline}</td><td>${item.status}</td></tr>`).join('')
  const html = `<!doctype html><html lang="zh-CN"><meta charset="UTF-8"><title>${report.value.title}</title><style>body{font-family:Arial,"Microsoft YaHei";max-width:900px;margin:50px auto;color:#25324a;line-height:1.8}h1{text-align:center}small{display:block;text-align:center;color:#778}section{margin:34px 0}table{width:100%;border-collapse:collapse}td,th{padding:8px;border:1px solid #ccd5e2;text-align:left}</style><h1>${report.value.title}</h1><small>${report.value.code} · ${report.value.preparedBy} · ${report.value.preparedAt}</small><section><h2>一、经营结论</h2><p>${report.value.conclusion}</p></section><section><h2>二、经营亮点</h2><ul>${report.value.highlights.map((item) => `<li>${item}</li>`).join('')}</ul></section><section><h2>三、行动计划</h2><table><tr><th>行动事项</th><th>负责人</th><th>责任部门</th><th>期限</th><th>状态</th></tr>${actionRows}</table></section></html>`
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }))
  link.download = `${report.value.title}.html`
  link.click()
  URL.revokeObjectURL(link.href)
  ElMessage.success('经营报告已导出')
}

function printReport() { window.print() }
</script>

<template>
  <div class="operations-page report-page">
    <header class="operations-header report-toolbar"><div><span>OPERATION ANALYSIS REPORT</span><h1>经营分析报告</h1><p>沉淀周期经营结论、重点问题与改进行动。</p></div><div><el-select v-model="period" style="width:220px"><el-option v-for="item in reportPeriods" :key="item.value" :label="item.label" :value="item.value" /></el-select><el-button @click="printReport"><el-icon><Printer /></el-icon>打印</el-button><el-button type="primary" @click="exportReport"><el-icon><Download /></el-icon>导出报告</el-button></div></header>

    <article class="report-document">
      <header class="report-cover"><div class="report-brand">SMART OPERATIONS</div><h1>{{ report.title }}</h1><p>{{ report.code }}</p><div><span>编制部门：{{ report.preparedBy }}</span><span>编制日期：{{ report.preparedAt }}</span></div></header>

      <section class="report-section"><div class="report-section-title"><span>01</span><div><h2>本期经营概览</h2><p>核心经营结果与目标达成情况</p></div></div><div class="report-metric-row"><div v-for="metric in snapshot.metrics.slice(0, 4)" :key="metric.key"><span>{{ metric.label }}</span><strong>{{ metric.value.toLocaleString() }}<small>{{ metric.unit }}</small></strong><em :class="metric.trend">{{ metric.trend === 'up' ? '提升' : '下降' }} {{ metric.change }}</em></div></div></section>

      <section class="report-section conclusion-section"><div class="report-section-title"><span>02</span><div><h2>经营结论</h2><p>对本期经营情况的综合判断</p></div><el-button link type="primary" @click="openConclusion"><el-icon><Edit /></el-icon>编辑结论</el-button></div><blockquote>{{ report.conclusion }}</blockquote><div class="report-highlights"><div v-for="(item, index) in report.highlights" :key="item"><b>{{ String(index + 1).padStart(2, '0') }}</b><span>{{ item }}</span></div></div></section>

      <section class="report-section"><div class="report-section-title"><span>03</span><div><h2>重点问题与风险</h2><p>影响经营目标达成的关键事项</p></div></div><div class="report-issues"><article v-for="issue in report.issues" :key="issue.title"><div><el-tag :type="issue.level === '高' ? 'danger' : 'warning'">{{ issue.level }}风险</el-tag><span>责任人：{{ issue.owner }}</span></div><h3>{{ issue.title }}</h3><p>{{ issue.description }}</p></article></div></section>

      <section class="report-section action-plan-section"><div class="report-section-title"><span>04</span><div><h2>经营改进行动</h2><p>明确责任人、完成期限和执行状态</p></div><el-button type="primary" plain @click="openAction"><el-icon><Plus /></el-icon>新增行动项</el-button></div><el-table :data="report.actions" border><el-table-column type="index" label="序号" width="60" /><el-table-column prop="action" label="行动事项" min-width="260" /><el-table-column prop="department" label="责任部门" min-width="150" /><el-table-column prop="owner" label="负责人" width="90" /><el-table-column prop="deadline" label="完成期限" width="115" /><el-table-column label="状态" width="120"><template #default="{ row }"><el-select :model-value="row.status" size="small" @change="(value) => updateStatus(row, value)"><el-option label="未开始" value="未开始" /><el-option label="进行中" value="进行中" /><el-option label="已完成" value="已完成" /><el-option label="已延期" value="已延期" /></el-select></template></el-table-column><el-table-column label="操作" width="120"><template #default="{ row }"><el-button link @click="editAction(row)">编辑</el-button><el-button link type="danger" @click="removeAction(row)">删除</el-button></template></el-table-column></el-table></section>

      <footer class="report-footer"><span>内部经营管理资料</span><span>{{ report.code }}</span></footer>
    </article>

    <el-dialog v-model="conclusionVisible" title="编辑经营结论" width="680px"><el-input v-model="conclusionText" type="textarea" :rows="7" maxlength="500" show-word-limit /><template #footer><el-button @click="conclusionVisible = false">取消</el-button><el-button type="primary" @click="saveConclusion">保存结论</el-button></template></el-dialog>
    <el-dialog v-model="actionVisible" :title="actionMode === 'create' ? '新增行动事项' : '编辑行动事项'" width="620px"><el-form ref="actionFormRef" :model="actionForm" :rules="actionRules" label-position="top"><el-form-item label="行动事项" prop="action"><el-input v-model="actionForm.action" type="textarea" :rows="2" /></el-form-item><div class="form-columns"><el-form-item label="责任部门" prop="department"><el-input v-model="actionForm.department" /></el-form-item><el-form-item label="负责人" prop="owner"><el-input v-model="actionForm.owner" /></el-form-item></div><div class="form-columns"><el-form-item label="完成期限" prop="deadline"><el-date-picker v-model="actionForm.deadline" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item><el-form-item label="执行状态"><el-select v-model="actionForm.status" style="width:100%"><el-option label="未开始" value="未开始" /><el-option label="进行中" value="进行中" /><el-option label="已完成" value="已完成" /><el-option label="已延期" value="已延期" /></el-select></el-form-item></div></el-form><template #footer><el-button @click="actionVisible = false">取消</el-button><el-button type="primary" @click="saveAction">保存行动项</el-button></template></el-dialog>
  </div>
</template>
