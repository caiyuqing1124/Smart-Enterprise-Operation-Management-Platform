<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import BaseChart from '../../components/charts/BaseChart.vue'
import { financeMonthlyTrend, initialFinanceTransactions, initialPaidAmount } from '../../mock/finance'
import { useFinanceStore } from '../../stores/finance'
import { useProjectStore } from '../../stores/projects'
import { useSalesStore } from '../../stores/sales'

const router = useRouter()
const salesStore = useSalesStore()
const projectStore = useProjectStore()
const financeStore = useFinanceStore()
const today = new Date().toISOString().slice(0, 10)

const totals = computed(() => {
  const contractAmount = salesStore.contracts.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const paidAmount = salesStore.contracts.reduce((sum, item) => sum + Number(item.paid || 0), 0)
  const overdueAmount = salesStore.paymentPlans
    .filter((item) => item.paidAmount < item.amount && item.dueDate < today)
    .reduce((sum, item) => sum + item.amount - item.paidAmount, 0)
  const budgetCost = projectStore.activeProjects.reduce((sum, item) => sum + Number(item.budgetCost || 0), 0)
  const actualCost = projectStore.activeProjects.reduce((sum, item) => sum + Number(item.actualCost || 0), 0)
  return {
    contractAmount,
    paidAmount,
    outstanding: contractAmount - paidAmount,
    overdueAmount,
    budgetCost,
    actualCost,
    expectedMargin: contractAmount - actualCost,
  }
})

const summaryItems = computed(() => [
  { key: 'contract', label: '累计合同金额', value: totals.value.contractAmount, unit: '万元', tone: 'blue' },
  { key: 'paid', label: '累计已回款', value: totals.value.paidAmount, unit: '万元', tone: 'green' },
  { key: 'outstanding', label: '待回款金额', value: totals.value.outstanding, unit: '万元', tone: 'orange' },
  { key: 'overdue', label: '逾期回款', value: totals.value.overdueAmount, unit: '万元', tone: 'red' },
  { key: 'cost', label: '项目实际成本', value: totals.value.actualCost, unit: '万元', tone: 'purple' },
  { key: 'margin', label: '预计项目毛利', value: totals.value.expectedMargin, unit: '万元', tone: 'cyan' },
])

const cashTrend = computed(() => {
  const paidChange = totals.value.paidAmount - initialPaidAmount
  const currentIncome = financeStore.transactions
    .filter((item) => item.date.startsWith(today.slice(0, 7)))
    .reduce((sum, item) => sum + (item.direction === '收入' ? item.amount : 0), 0)
  const initialIncome = initialFinanceTransactions
    .filter((item) => item.date.startsWith(today.slice(0, 7)))
    .reduce((sum, item) => sum + (item.direction === '收入' ? item.amount : 0), 0)
  const currentExpense = financeStore.transactions
    .filter((item) => item.date.startsWith(today.slice(0, 7)))
    .reduce((sum, item) => sum + (item.direction === '支出' ? item.amount : 0), 0)
  const initialExpense = initialFinanceTransactions
    .filter((item) => item.date.startsWith(today.slice(0, 7)))
    .reduce((sum, item) => sum + (item.direction === '支出' ? item.amount : 0), 0)
  return financeMonthlyTrend.map((item, index) => index === financeMonthlyTrend.length - 1
    ? { ...item, income: Math.max(0, item.income + paidChange + currentIncome - initialIncome), expense: Math.max(0, item.expense + currentExpense - initialExpense) }
    : item)
})

const cashFlowOption = computed(() => ({
  color: ['#246bfd', '#f29c3b'],
  tooltip: { trigger: 'axis' },
  legend: { right: 12, top: 3, itemWidth: 10, itemHeight: 8 },
  grid: { left: 50, right: 20, top: 42, bottom: 28 },
  xAxis: { type: 'category', data: cashTrend.value.map((item) => item.month), axisTick: { show: false }, axisLine: { lineStyle: { color: '#dfe6ef' } } },
  yAxis: { type: 'value', splitLine: { lineStyle: { color: '#edf1f6', type: 'dashed' } } },
  series: [
    { name: '资金流入', type: 'bar', barWidth: 17, data: cashTrend.value.map((item) => item.income), itemStyle: { borderRadius: [5, 5, 0, 0] } },
    { name: '资金流出', type: 'line', smooth: true, symbolSize: 7, data: cashTrend.value.map((item) => item.expense), lineStyle: { width: 3 } },
  ],
}))

const costOption = computed(() => ({
  color: ['#246bfd', '#28b69a', '#7a68e8', '#f29c3b', '#e26060', '#5f7fa7'],
  tooltip: { trigger: 'item', formatter: '{b}<br/>{c} 万元 · {d}%' },
  legend: { bottom: 0, itemWidth: 9, itemHeight: 9 },
  series: [{
    type: 'pie',
    radius: ['46%', '69%'],
    center: ['50%', '43%'],
    label: { show: false },
    data: projectStore.activeProjects.map((item) => ({ name: item.name, value: item.actualCost })).filter((item) => item.value > 0),
  }],
}))

const receivableRows = computed(() => salesStore.paymentPlans
  .filter((item) => item.paidAmount < item.amount)
  .map((item) => {
    const contract = salesStore.contracts.find((contractItem) => contractItem.id === item.contractId)
    const remaining = item.amount - item.paidAmount
    const overdueDays = item.dueDate < today ? Math.ceil((new Date(today) - new Date(item.dueDate)) / 86400000) : 0
    return {
      ...item,
      contract,
      customer: salesStore.customerMap[contract?.customerId],
      remaining,
      overdueDays,
      urgency: overdueDays > 0 ? '逾期' : item.dueDate <= '2026-09-30' ? '本月到期' : '计划中',
    }
  })
  .sort((a, b) => a.dueDate.localeCompare(b.dueDate)))

const agingOption = computed(() => {
  const buckets = [
    { name: '未到期', value: 0 },
    { name: '1—30 天', value: 0 },
    { name: '31—60 天', value: 0 },
    { name: '60 天以上', value: 0 },
  ]
  receivableRows.value.forEach((item) => {
    const target = item.overdueDays === 0 ? buckets[0] : item.overdueDays <= 30 ? buckets[1] : item.overdueDays <= 60 ? buckets[2] : buckets[3]
    target.value += item.remaining
  })
  return {
    color: ['#4c8dff', '#f2aa45', '#ea7c58', '#dc5656'],
    tooltip: { trigger: 'item', formatter: '{b}<br/>{c} 万元 · {d}%' },
    legend: { bottom: 0, itemWidth: 9, itemHeight: 9 },
    series: [{ type: 'pie', radius: ['47%', '70%'], center: ['50%', '43%'], label: { show: false }, data: buckets }],
  }
})

const riskRows = computed(() => {
  const receivableRisks = receivableRows.value
    .filter((item) => item.overdueDays > 0 || item.remaining >= 150)
    .map((item) => ({
      id: `receivable-${item.id}`,
      type: '应收',
      title: `${item.customer?.name || '客户'} · ${item.phase}`,
      amount: item.remaining,
      level: item.overdueDays > 0 ? '高' : '中',
      description: item.overdueDays > 0 ? `已逾期 ${item.overdueDays} 天` : `计划 ${item.dueDate} 到期`,
      target: { path: '/sales/contracts', query: { selected: item.contractId } },
    }))
  const projectRisks = projectStore.activeProjects
    .filter((item) => item.health === '成本风险')
    .map((item) => ({
      id: `project-${item.id}`,
      type: '项目',
      title: item.name,
      amount: item.actualCost,
      level: '高',
      description: `成本执行率 ${Math.round(item.actualCost / item.budgetCost * 100)}%`,
      target: `/projects/${item.id}`,
    }))
  return [...receivableRisks, ...projectRisks].slice(0, 5)
})

function openLedger(filter = 'all') {
  router.push({ path: '/finance/ledger', query: filter === 'all' ? {} : { status: filter } })
}

function exportOverview() {
  const rows = [
    ['财务指标', '金额（万元）'],
    ...summaryItems.value.map((item) => [item.label, item.value]),
    [],
    ['高风险事项', '风险类型', '风险金额（万元）', '说明'],
    ...riskRows.value.map((item) => [item.title, item.type, item.amount, item.description]),
  ]
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([`﻿${rows.map((row) => row.join(',')).join('\n')}`], { type: 'text/csv;charset=utf-8' }))
  link.download = `财务运营概览-${today}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
  ElMessage.success('财务运营概览已导出')
}
</script>

<template>
  <div class="finance-page finance-overview-page">
    <header class="finance-header">
      <div><span>FINANCIAL OPERATION</span><h1>财务概览</h1><p>统一查看合同回款、项目成本与资金风险，数据联动至客户销售和项目交付。</p></div>
      <div><span class="finance-date"><el-icon><Calendar /></el-icon>数据截至 {{ today }}</span><el-button @click="exportOverview"><el-icon><Download /></el-icon>导出概览</el-button><el-button type="primary" @click="openLedger()"><el-icon><Tickets /></el-icon>进入财务台账</el-button></div>
    </header>

    <section class="finance-summary-ribbon">
      <button v-for="item in summaryItems" :key="item.key" type="button" :class="item.tone" @click="openLedger(item.key === 'overdue' ? 'overdue' : 'all')">
        <span>{{ item.label }}</span><strong>{{ item.value.toLocaleString() }}<small>{{ item.unit }}</small></strong>
        <em>查看明细<el-icon><Right /></el-icon></em>
      </button>
    </section>

    <div class="finance-overview-grid">
      <section class="finance-panel cashflow-panel">
        <div class="finance-panel-head"><div><h2>资金流入与流出趋势</h2><p>最近六个月资金变化，当前月随回款登记同步更新</p></div><span>单位：万元</span></div>
        <BaseChart :option="cashFlowOption" height="300px" />
      </section>
      <section class="finance-panel cost-panel">
        <div class="finance-panel-head"><div><h2>项目成本结构</h2><p>按在执行项目的实际成本归集</p></div></div>
        <BaseChart :option="costOption" height="300px" />
      </section>
      <section class="finance-panel aging-panel">
        <div class="finance-panel-head"><div><h2>应收账龄分布</h2><p>未回款计划按到期时间划分</p></div></div>
        <BaseChart :option="agingOption" height="265px" />
      </section>
      <section class="finance-panel collection-panel">
        <div class="finance-panel-head"><div><h2>近期应收计划</h2><p>优先跟踪逾期和本月到期款项</p></div><el-button link type="primary" @click="openLedger('overdue')">查看全部</el-button></div>
        <div class="collection-list">
          <button v-for="item in receivableRows.slice(0, 5)" :key="item.id" type="button" @click="router.push({ path: '/sales/contracts', query: { selected: item.contractId } })">
            <div><strong>{{ item.customer?.shortName || item.customer?.name }}</strong><span>{{ item.contract?.code }} · {{ item.phase }}</span></div>
            <div><strong>{{ item.remaining }} 万</strong><el-tag :type="item.urgency === '逾期' ? 'danger' : item.urgency === '本月到期' ? 'warning' : 'info'" size="small">{{ item.urgency }}</el-tag></div>
          </button>
        </div>
      </section>
    </div>

    <section class="finance-risk-strip">
      <div class="risk-strip-title"><el-icon><WarningFilled /></el-icon><div><h2>财务风险事项</h2><p>由逾期回款、大额应收和项目成本状态自动形成</p></div><span>{{ riskRows.length }} 项需关注</span></div>
      <div class="risk-strip-items">
        <button v-for="item in riskRows" :key="item.id" type="button" @click="router.push(item.target)">
          <el-tag :type="item.level === '高' ? 'danger' : 'warning'" size="small">{{ item.level }}风险</el-tag>
          <div><strong>{{ item.title }}</strong><span>{{ item.description }}</span></div>
          <b>{{ item.amount }} 万</b><el-icon><ArrowRight /></el-icon>
        </button>
      </div>
    </section>
  </div>
</template>
