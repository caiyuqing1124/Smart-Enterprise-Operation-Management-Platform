<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { financeCategories } from '../../mock/finance'
import { useFinanceStore } from '../../stores/finance'
import { useProjectStore } from '../../stores/projects'
import { useSalesStore } from '../../stores/sales'

const route = useRoute()
const router = useRouter()
const financeStore = useFinanceStore()
const salesStore = useSalesStore()
const projectStore = useProjectStore()
const today = new Date().toISOString().slice(0, 10)

const activeTab = ref('transactions')
const keyword = ref('')
const directionFilter = ref('all')
const categoryFilter = ref('all')
const dateRange = ref([])
const settlementType = ref('all')
const settlementStatus = ref('all')
const detailVisible = ref(false)
const selectedRow = ref(null)

const transactionVisible = ref(false)
const transactionMode = ref('create')
const transactionRef = ref()
const transactionForm = reactive({
  id: null,
  date: today,
  direction: '支出',
  category: '项目采购',
  amount: 0,
  counterparty: '',
  customerId: null,
  contractId: null,
  projectId: null,
  department: '项目交付中心',
  owner: '',
  status: '已确认',
  remark: '',
})
const transactionRules = {
  date: [{ required: true, message: '请选择发生日期', trigger: 'change' }],
  direction: [{ required: true, message: '请选择收支方向', trigger: 'change' }],
  category: [{ required: true, message: '请选择业务类别', trigger: 'change' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'change' }],
  counterparty: [{ required: true, message: '请输入往来单位', trigger: 'blur' }],
  department: [{ required: true, message: '请输入归属部门', trigger: 'blur' }],
  owner: [{ required: true, message: '请输入经办人', trigger: 'blur' }],
}

const payableVisible = ref(false)
const payableMode = ref('create')
const payableRef = ref()
const payableForm = reactive({ id: null, counterparty: '', projectId: null, amount: 0, settledAmount: 0, dueDate: '', category: '技术服务', owner: '', status: '未到期', remark: '' })
const payableRules = {
  counterparty: [{ required: true, message: '请输入收款单位', trigger: 'blur' }],
  projectId: [{ required: true, message: '请选择关联项目', trigger: 'change' }],
  amount: [{ required: true, message: '请输入应付金额', trigger: 'change' }],
  dueDate: [{ required: true, message: '请选择到期日期', trigger: 'change' }],
  owner: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
}

const paymentVisible = ref(false)
const paymentRef = ref()
const selectedSettlement = ref(null)
const paymentForm = reactive({ amount: 0, paidDate: today })
const paymentRules = {
  amount: [{ required: true, message: '请输入本次结算金额', trigger: 'change' }],
  paidDate: [{ required: true, message: '请选择到账或付款日期', trigger: 'change' }],
}

const transactionRows = computed(() => {
  const receipts = salesStore.paymentPlans
    .filter((item) => item.paidAmount > 0 && item.paidDate)
    .map((item) => {
      const contract = salesStore.contracts.find((contractItem) => contractItem.id === item.contractId)
      const customer = salesStore.customerMap[contract?.customerId]
      return {
        id: `receipt-${item.id}`,
        sourceId: item.id,
        source: '合同回款',
        code: `HK-${contract?.code?.split('-').slice(1).join('-')}-${item.id}`,
        date: item.paidDate,
        direction: '收入',
        category: '合同回款',
        amount: item.paidAmount,
        counterparty: customer?.name || '合同客户',
        customerId: customer?.id,
        contractId: item.contractId,
        projectId: item.projectId || null,
        department: '销售管理中心',
        owner: contract?.owner || '',
        status: '已确认',
        remark: `${contract?.name || ''} · ${item.phase}`,
      }
    })
  const manual = financeStore.transactions.map((item) => ({ ...item, source: item.sourceType === 'payable-payment' ? '应付付款' : '手工台账' }))
  return [...receipts, ...manual].sort((a, b) => b.date.localeCompare(a.date))
})

const filteredTransactions = computed(() => transactionRows.value.filter((item) => {
  const text = `${item.code}${item.counterparty}${item.category}${item.remark}`.toLowerCase()
  const inDate = !dateRange.value?.length || (item.date >= dateRange.value[0] && item.date <= dateRange.value[1])
  return (!keyword.value || text.includes(keyword.value.toLowerCase()))
    && (directionFilter.value === 'all' || item.direction === directionFilter.value)
    && (categoryFilter.value === 'all' || item.category === categoryFilter.value)
    && inDate
}))

const settlementRows = computed(() => {
  const receivables = salesStore.paymentPlans.map((item) => {
    const contract = salesStore.contracts.find((contractItem) => contractItem.id === item.contractId)
    const customer = salesStore.customerMap[contract?.customerId]
    const remaining = Math.max(0, item.amount - item.paidAmount)
    return {
      id: `receivable-${item.id}`,
      sourceId: item.id,
      type: '应收',
      code: contract?.code || '',
      phase: item.phase,
      counterparty: customer?.name || '',
      customerId: customer?.id,
      contractId: item.contractId,
      projectId: item.projectId || null,
      amount: item.amount,
      settledAmount: item.paidAmount,
      remaining,
      dueDate: item.dueDate,
      owner: contract?.owner || '',
      status: remaining === 0 ? '已结清' : item.dueDate < today ? '已逾期' : item.paidAmount > 0 ? '部分结算' : '未到期',
      remark: contract?.name || '',
      source: '合同计划',
    }
  })
  const payables = financeStore.payables.map((item) => ({
    ...item,
    id: `payable-${item.id}`,
    sourceId: item.id,
    type: '应付',
    phase: item.category,
    remaining: Math.max(0, item.amount - item.settledAmount),
    status: item.settledAmount >= item.amount ? '已结清' : item.dueDate < today ? '已逾期' : item.settledAmount > 0 ? '部分结算' : '未到期',
    source: '应付台账',
  }))
  return [...receivables, ...payables].sort((a, b) => a.dueDate.localeCompare(b.dueDate))
})

const filteredSettlements = computed(() => settlementRows.value.filter((item) => {
  const text = `${item.code}${item.counterparty}${item.phase}${item.remark}`.toLowerCase()
  return (!keyword.value || text.includes(keyword.value.toLowerCase()))
    && (settlementType.value === 'all' || item.type === settlementType.value)
    && (settlementStatus.value === 'all' || item.status === settlementStatus.value)
}))

const ledgerSummary = computed(() => ({
  income: transactionRows.value.filter((item) => item.direction === '收入').reduce((sum, item) => sum + Number(item.amount || 0), 0),
  expense: transactionRows.value.filter((item) => item.direction === '支出').reduce((sum, item) => sum + Number(item.amount || 0), 0),
  receivable: settlementRows.value.filter((item) => item.type === '应收').reduce((sum, item) => sum + item.remaining, 0),
  payable: settlementRows.value.filter((item) => item.type === '应付').reduce((sum, item) => sum + item.remaining, 0),
  overdue: settlementRows.value.filter((item) => item.status === '已逾期').reduce((sum, item) => sum + item.remaining, 0),
}))

const categoryOptions = computed(() => ['all', '合同回款', ...new Set(Object.values(financeCategories).flat())])
const formCategoryOptions = computed(() => financeCategories[transactionForm.direction])

function resetTransaction() {
  Object.assign(transactionForm, { id: null, date: today, direction: '支出', category: '项目采购', amount: 0, counterparty: '', customerId: null, contractId: null, projectId: null, department: '项目交付中心', owner: '', status: '已确认', remark: '' })
}

function openCreateTransaction() {
  resetTransaction()
  transactionMode.value = 'create'
  transactionVisible.value = true
}

function openEditTransaction(row) {
  if (row.source !== '手工台账') {
    ElMessage.info('合同回款请通过应收台账登记，系统会自动同步金额')
    return
  }
  Object.assign(transactionForm, JSON.parse(JSON.stringify(row)))
  transactionMode.value = 'edit'
  transactionVisible.value = true
}

function syncTransactionDirection() {
  transactionForm.category = financeCategories[transactionForm.direction][0]
}

async function saveTransaction() {
  await transactionRef.value.validate()
  const payload = { ...transactionForm }
  delete payload.id
  transactionMode.value === 'create'
    ? financeStore.addTransaction(payload)
    : financeStore.updateTransaction(transactionForm.id, payload)
  transactionVisible.value = false
  ElMessage.success(transactionMode.value === 'create' ? '收支记录已新增' : '收支记录已更新')
}

async function removeTransaction(row) {
  if (row.source !== '手工台账') {
    ElMessage.warning('合同回款来自回款计划，不能在财务流水中直接删除')
    return
  }
  try {
    await ElMessageBox.confirm(`确定删除收支记录“${row.code}”吗？`, '删除收支记录', { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' })
    financeStore.removeTransaction(row.id)
    detailVisible.value = false
    ElMessage.success('收支记录已删除')
  } catch { /* 用户取消时保留记录。 */ }
}

function resetPayable() {
  Object.assign(payableForm, { id: null, counterparty: '', projectId: null, amount: 0, settledAmount: 0, dueDate: '', category: '技术服务', owner: '', status: '未到期', remark: '' })
}

function openCreatePayable() {
  resetPayable()
  payableMode.value = 'create'
  payableVisible.value = true
}

function openEditPayable(row) {
  if (row.type !== '应付') return
  const source = financeStore.payables.find((item) => item.id === row.sourceId)
  Object.assign(payableForm, JSON.parse(JSON.stringify(source)))
  payableMode.value = 'edit'
  payableVisible.value = true
}

async function savePayable() {
  await payableRef.value.validate()
  if (payableForm.amount < payableForm.settledAmount) {
    ElMessage.warning('应付金额不能低于已付款金额')
    return
  }
  const payload = { ...payableForm }
  delete payload.id
  payableMode.value === 'create' ? financeStore.addPayable(payload) : financeStore.updatePayable(payableForm.id, payload)
  payableVisible.value = false
  ElMessage.success(payableMode.value === 'create' ? '应付记录已新增' : '应付记录已更新')
}

async function removePayable(row) {
  try {
    await ElMessageBox.confirm(`确定删除应付记录“${row.code}”吗？`, '删除应付记录', { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' })
    financeStore.removePayable(row.sourceId)
    detailVisible.value = false
    ElMessage.success('应付记录已删除')
  } catch { /* 用户取消时保留记录。 */ }
}

function openPayment(row) {
  selectedSettlement.value = row
  Object.assign(paymentForm, { amount: row.remaining, paidDate: today })
  paymentVisible.value = true
}

async function savePayment() {
  await paymentRef.value.validate()
  if (paymentForm.amount > selectedSettlement.value.remaining) {
    ElMessage.warning('本次金额不能超过待结算金额')
    return
  }
  if (selectedSettlement.value.type === '应收') {
    salesStore.registerPayment(selectedSettlement.value.sourceId, paymentForm.amount, paymentForm.paidDate)
    ElMessage.success('回款已登记，合同和客户金额已同步')
  } else {
    financeStore.registerPayable(selectedSettlement.value.sourceId, paymentForm.amount, paymentForm.paidDate)
    ElMessage.success('付款已登记，并生成支出流水')
  }
  paymentVisible.value = false
  detailVisible.value = false
}

function openDetail(row) {
  selectedRow.value = row
  detailVisible.value = true
}

function resetFilters() {
  keyword.value = ''
  directionFilter.value = 'all'
  categoryFilter.value = 'all'
  dateRange.value = []
  settlementType.value = 'all'
  settlementStatus.value = 'all'
}

function goRelated(row) {
  if (row.contractId) router.push({ path: '/sales/contracts', query: { selected: row.contractId } })
  else if (row.projectId) router.push(`/projects/${row.projectId}`)
  else if (row.customerId) router.push(`/sales/customers/${row.customerId}`)
}

function exportLedger() {
  const rows = activeTab.value === 'transactions'
    ? [['流水号', '日期', '方向', '类别', '往来单位', '金额', '归属部门', '经办人', '来源'], ...filteredTransactions.value.map((item) => [item.code, item.date, item.direction, item.category, item.counterparty, item.amount, item.department, item.owner, item.source])]
    : [['类型', '业务编号', '期次或类别', '往来单位', '应结算', '已结算', '待结算', '到期日', '状态'], ...filteredSettlements.value.map((item) => [item.type, item.code, item.phase, item.counterparty, item.amount, item.settledAmount, item.remaining, item.dueDate, item.status])]
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([`﻿${rows.map((row) => row.join(',')).join('\n')}`], { type: 'text/csv;charset=utf-8' }))
  link.download = activeTab.value === 'transactions' ? '财务收支台账.csv' : '应收应付台账.csv'
  link.click()
  URL.revokeObjectURL(link.href)
  ElMessage.success('当前台账已导出')
}

function statusType(status) {
  return { 已确认: 'success', 已结清: 'success', 已逾期: 'danger', 部分结算: 'warning', 未到期: 'info' }[status] || 'info'
}

onMounted(() => {
  if (route.query.status === 'overdue') {
    activeTab.value = 'settlements'
    settlementStatus.value = '已逾期'
  }
})
</script>

<template>
  <div class="finance-page finance-ledger-page">
    <header class="finance-header ledger-header">
      <div><span>FINANCIAL LEDGER</span><h1>财务台账</h1><p>集中管理收支流水、合同应收与项目应付，所有记录均可追溯至关联业务。</p></div>
      <div><el-button @click="exportLedger"><el-icon><Download /></el-icon>导出当前台账</el-button><el-button v-if="activeTab === 'transactions'" type="primary" @click="openCreateTransaction"><el-icon><Plus /></el-icon>新增收支</el-button><el-button v-else type="primary" @click="openCreatePayable"><el-icon><Plus /></el-icon>新增应付</el-button></div>
    </header>

    <section class="ledger-balance-strip">
      <div><span>累计资金流入</span><strong>{{ ledgerSummary.income.toLocaleString() }} 万</strong></div>
      <div><span>累计资金流出</span><strong>{{ ledgerSummary.expense.toLocaleString() }} 万</strong></div>
      <div><span>待收金额</span><strong>{{ ledgerSummary.receivable.toLocaleString() }} 万</strong></div>
      <div><span>待付金额</span><strong>{{ ledgerSummary.payable.toLocaleString() }} 万</strong></div>
      <div class="danger"><span>逾期未结</span><strong>{{ ledgerSummary.overdue.toLocaleString() }} 万</strong></div>
      <el-button link type="primary" @click="router.push('/finance/overview')"><el-icon><DataAnalysis /></el-icon>返回财务概览</el-button>
    </section>

    <section class="ledger-workspace">
      <el-tabs v-model="activeTab" class="ledger-tabs" @tab-change="resetFilters">
        <el-tab-pane label="收支及回款" name="transactions">
          <div class="ledger-filter-row">
            <el-input v-model="keyword" clearable placeholder="搜索流水号、往来单位或备注"><template #prefix><el-icon><Search /></el-icon></template></el-input>
            <el-select v-model="directionFilter"><el-option label="全部方向" value="all" /><el-option label="收入" value="收入" /><el-option label="支出" value="支出" /></el-select>
            <el-select v-model="categoryFilter"><el-option v-for="item in categoryOptions" :key="item" :label="item === 'all' ? '全部类别' : item" :value="item" /></el-select>
            <el-date-picker v-model="dateRange" type="daterange" value-format="YYYY-MM-DD" start-placeholder="开始日期" end-placeholder="结束日期" />
            <el-button @click="resetFilters">重置</el-button>
            <span>共 {{ filteredTransactions.length }} 条</span>
          </div>
          <el-table :data="filteredTransactions" class="finance-table" stripe>
            <el-table-column prop="date" label="发生日期" width="110" />
            <el-table-column prop="code" label="流水号" min-width="130" />
            <el-table-column prop="direction" label="方向" width="76"><template #default="{ row }"><el-tag :type="row.direction === '收入' ? 'success' : 'warning'" size="small">{{ row.direction }}</el-tag></template></el-table-column>
            <el-table-column prop="category" label="业务类别" width="105" />
            <el-table-column prop="counterparty" label="往来单位" min-width="160" show-overflow-tooltip />
            <el-table-column label="金额" width="110" align="right"><template #default="{ row }"><strong :class="row.direction === '收入' ? 'income-amount' : 'expense-amount'">{{ row.direction === '收入' ? '+' : '-' }}{{ row.amount.toLocaleString() }} 万</strong></template></el-table-column>
            <el-table-column prop="department" label="归属部门" width="110" />
            <el-table-column prop="owner" label="经办人" width="78" />
            <el-table-column prop="source" label="数据来源" width="88" />
            <el-table-column label="操作" width="150" fixed="right"><template #default="{ row }"><div class="finance-table-actions"><el-button link type="primary" @click="openDetail(row)">查看</el-button><template v-if="row.source === '手工台账'"><el-button link @click="openEditTransaction(row)">编辑</el-button><el-button link type="danger" @click="removeTransaction(row)">删除</el-button></template></div></template></el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="应收应付" name="settlements">
          <div class="ledger-filter-row settlement-filters">
            <el-input v-model="keyword" clearable placeholder="搜索业务编号、往来单位或期次"><template #prefix><el-icon><Search /></el-icon></template></el-input>
            <el-select v-model="settlementType"><el-option label="全部类型" value="all" /><el-option label="应收" value="应收" /><el-option label="应付" value="应付" /></el-select>
            <el-select v-model="settlementStatus"><el-option label="全部状态" value="all" /><el-option v-for="item in ['未到期','部分结算','已逾期','已结清']" :key="item" :label="item" :value="item" /></el-select>
            <el-button @click="resetFilters">重置</el-button>
            <span>共 {{ filteredSettlements.length }} 条</span>
          </div>
          <el-table :data="filteredSettlements" class="finance-table" stripe>
            <el-table-column prop="type" label="类型" width="75"><template #default="{ row }"><el-tag :type="row.type === '应收' ? 'primary' : 'warning'" size="small">{{ row.type }}</el-tag></template></el-table-column>
            <el-table-column prop="code" label="业务编号" min-width="135" />
            <el-table-column prop="phase" label="期次或类别" min-width="120" />
            <el-table-column prop="counterparty" label="往来单位" min-width="190" show-overflow-tooltip />
            <el-table-column label="应结算" width="105" align="right"><template #default="{ row }">{{ row.amount.toLocaleString() }} 万</template></el-table-column>
            <el-table-column label="已结算" width="105" align="right"><template #default="{ row }">{{ row.settledAmount.toLocaleString() }} 万</template></el-table-column>
            <el-table-column label="待结算" width="105" align="right"><template #default="{ row }"><strong>{{ row.remaining.toLocaleString() }} 万</strong></template></el-table-column>
            <el-table-column prop="dueDate" label="到期日期" width="110" />
            <el-table-column prop="owner" label="负责人" width="90" />
            <el-table-column label="状态" width="95"><template #default="{ row }"><el-tag :type="statusType(row.status)" size="small">{{ row.status }}</el-tag></template></el-table-column>
            <el-table-column label="操作" width="190" fixed="right"><template #default="{ row }"><div class="finance-table-actions"><el-button link type="primary" @click="openDetail(row)">查看</el-button><el-button link type="success" :disabled="row.remaining <= 0" @click="openPayment(row)">{{ row.type === '应收' ? '登记回款' : '登记付款' }}</el-button><el-dropdown v-if="row.type === '应付'" trigger="click"><el-button link><el-icon><MoreFilled /></el-icon></el-button><template #dropdown><el-dropdown-menu><el-dropdown-item @click="openEditPayable(row)">编辑应付</el-dropdown-item><el-dropdown-item divided @click="removePayable(row)">删除应付</el-dropdown-item></el-dropdown-menu></template></el-dropdown></div></template></el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </section>

    <el-dialog v-model="transactionVisible" :title="transactionMode === 'create' ? '新增收支记录' : '编辑收支记录'" width="720px">
      <el-form ref="transactionRef" :model="transactionForm" :rules="transactionRules" label-position="top">
        <div class="finance-form-grid">
          <el-form-item label="发生日期" prop="date"><el-date-picker v-model="transactionForm.date" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
          <el-form-item label="收支方向" prop="direction"><el-radio-group v-model="transactionForm.direction" @change="syncTransactionDirection"><el-radio-button label="收入" value="收入" /><el-radio-button label="支出" value="支出" /></el-radio-group></el-form-item>
          <el-form-item label="业务类别" prop="category"><el-select v-model="transactionForm.category" style="width:100%"><el-option v-for="item in formCategoryOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item>
          <el-form-item label="金额（万元）" prop="amount"><el-input-number v-model="transactionForm.amount" :min="0.01" :precision="2" style="width:100%" /></el-form-item>
          <el-form-item label="往来单位" prop="counterparty" class="span-two"><el-input v-model="transactionForm.counterparty" /></el-form-item>
          <el-form-item label="关联客户"><el-select v-model="transactionForm.customerId" clearable filterable style="width:100%"><el-option v-for="item in salesStore.customers" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item>
          <el-form-item label="关联合同"><el-select v-model="transactionForm.contractId" clearable filterable style="width:100%"><el-option v-for="item in salesStore.contracts.filter((contract) => !transactionForm.customerId || contract.customerId === transactionForm.customerId)" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item>
          <el-form-item label="关联项目"><el-select v-model="transactionForm.projectId" clearable filterable style="width:100%"><el-option v-for="item in projectStore.activeProjects" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item>
          <el-form-item label="状态"><el-select v-model="transactionForm.status" style="width:100%"><el-option label="已确认" value="已确认" /><el-option label="待确认" value="待确认" /></el-select></el-form-item>
          <el-form-item label="归属部门" prop="department"><el-input v-model="transactionForm.department" /></el-form-item>
          <el-form-item label="经办人" prop="owner"><el-input v-model="transactionForm.owner" /></el-form-item>
          <el-form-item label="业务说明" class="span-two"><el-input v-model="transactionForm.remark" type="textarea" :rows="3" /></el-form-item>
        </div>
      </el-form>
      <template #footer><el-button @click="transactionVisible = false">取消</el-button><el-button type="primary" @click="saveTransaction">保存收支记录</el-button></template>
    </el-dialog>

    <el-dialog v-model="payableVisible" :title="payableMode === 'create' ? '新增应付记录' : '编辑应付记录'" width="650px">
      <el-form ref="payableRef" :model="payableForm" :rules="payableRules" label-position="top">
        <div class="finance-form-grid">
          <el-form-item label="收款单位" prop="counterparty" class="span-two"><el-input v-model="payableForm.counterparty" /></el-form-item>
          <el-form-item label="关联项目" prop="projectId"><el-select v-model="payableForm.projectId" filterable style="width:100%"><el-option v-for="item in projectStore.activeProjects" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item>
          <el-form-item label="费用类别"><el-select v-model="payableForm.category" style="width:100%"><el-option v-for="item in financeCategories.支出" :key="item" :label="item" :value="item" /></el-select></el-form-item>
          <el-form-item label="应付金额（万元）" prop="amount"><el-input-number v-model="payableForm.amount" :min="0.01" :precision="2" style="width:100%" /></el-form-item>
          <el-form-item label="到期日期" prop="dueDate"><el-date-picker v-model="payableForm.dueDate" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
          <el-form-item label="负责人" prop="owner"><el-input v-model="payableForm.owner" /></el-form-item>
          <el-form-item label="结算说明"><el-input v-model="payableForm.remark" /></el-form-item>
        </div>
      </el-form>
      <template #footer><el-button @click="payableVisible = false">取消</el-button><el-button type="primary" @click="savePayable">保存应付记录</el-button></template>
    </el-dialog>

    <el-dialog v-model="paymentVisible" :title="selectedSettlement?.type === '应收' ? '登记实际回款' : '登记实际付款'" width="480px">
      <el-form ref="paymentRef" :model="paymentForm" :rules="paymentRules" label-position="top">
        <el-alert :title="`${selectedSettlement?.counterparty || ''} · 尚待结算 ${selectedSettlement?.remaining || 0} 万元`" type="info" :closable="false" />
        <el-form-item label="本次结算金额（万元）" prop="amount"><el-input-number v-model="paymentForm.amount" :min="0.01" :max="selectedSettlement?.remaining || 0" :precision="2" style="width:100%" /></el-form-item>
        <el-form-item label="到账或付款日期" prop="paidDate"><el-date-picker v-model="paymentForm.paidDate" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="paymentVisible = false">取消</el-button><el-button type="primary" @click="savePayment">确认登记</el-button></template>
    </el-dialog>

    <el-drawer v-model="detailVisible" title="财务记录详情" size="500px">
      <div v-if="selectedRow" class="finance-detail-drawer">
        <div class="finance-detail-head"><div><span>{{ selectedRow.code }}</span><h2>{{ selectedRow.counterparty }}</h2></div><el-tag :type="statusType(selectedRow.status)">{{ selectedRow.status }}</el-tag></div>
        <div class="finance-detail-amount"><span>{{ selectedRow.type || selectedRow.direction }}</span><strong>{{ (selectedRow.remaining ?? selectedRow.amount).toLocaleString() }} 万元</strong><small>{{ selectedRow.type ? '当前待结算' : selectedRow.category }}</small></div>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="业务类别">{{ selectedRow.phase || selectedRow.category }}</el-descriptions-item>
          <el-descriptions-item label="发生或到期日期">{{ selectedRow.dueDate || selectedRow.date }}</el-descriptions-item>
          <el-descriptions-item label="负责人">{{ selectedRow.owner }}</el-descriptions-item>
          <el-descriptions-item label="数据来源">{{ selectedRow.source }}</el-descriptions-item>
          <el-descriptions-item label="业务说明">{{ selectedRow.remark || '无补充说明' }}</el-descriptions-item>
        </el-descriptions>
        <div class="finance-detail-actions"><el-button v-if="selectedRow.contractId || selectedRow.projectId || selectedRow.customerId" @click="goRelated(selectedRow)">查看关联业务</el-button><el-button v-if="selectedRow.type && selectedRow.remaining > 0" type="primary" @click="openPayment(selectedRow)">{{ selectedRow.type === '应收' ? '登记回款' : '登记付款' }}</el-button><el-button v-else-if="selectedRow.source === '手工台账'" type="primary" @click="openEditTransaction(selectedRow); detailVisible = false">编辑记录</el-button></div>
      </div>
    </el-drawer>
  </div>
</template>
