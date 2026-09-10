import { computed } from 'vue'
import { useFinanceStore } from './finance'
import { useProjectStore } from './projects'
import { useSalesStore } from './sales'

const round = (value, digits = 1) => Number(Number(value || 0).toFixed(digits))

export function useBusinessMetrics() {
  const salesStore = useSalesStore()
  const projectStore = useProjectStore()
  const financeStore = useFinanceStore()
  const today = new Date().toISOString().slice(0, 10)

  const totals = computed(() => {
    const contractAmount = salesStore.contracts.reduce((sum, item) => sum + Number(item.amount || 0), 0)
    const paidAmount = salesStore.contracts.reduce((sum, item) => sum + Number(item.paid || 0), 0)
    const actualCost = projectStore.activeProjects.reduce((sum, item) => sum + Number(item.actualCost || 0), 0)
    const executingProjects = projectStore.activeProjects.filter((item) => item.status === '执行中').length
    const overduePlans = salesStore.paymentPlans.filter((item) => item.paidAmount < item.amount && item.dueDate < today)
    const openProjectRisks = projectStore.risks.filter((item) => !['已关闭', '已解决'].includes(item.status))

    return {
      contractAmount,
      paidAmount,
      actualCost,
      executingProjects,
      overduePlans,
      openProjectRisks,
      collectionRate: contractAmount ? round(paidAmount / contractAmount * 100) : 0,
      grossMarginRate: contractAmount ? round((contractAmount - actualCost) / contractAmount * 100) : 0,
      riskCount: overduePlans.length + openProjectRisks.length,
    }
  })

  const currentMetrics = computed(() => [
    { key: 'revenue', label: '累计合同金额', value: totals.value.contractAmount, unit: '万元', icon: 'Money', live: true },
    { key: 'profit', label: '预计项目毛利率', value: totals.value.grossMarginRate, unit: '%', icon: 'TrendCharts', live: true },
    { key: 'collection', label: '合同回款率', value: totals.value.collectionRate, unit: '%', icon: 'CreditCard', live: true },
    { key: 'projects', label: '执行中项目', value: totals.value.executingProjects, unit: '个', icon: 'Briefcase', live: true },
    { key: 'risk', label: '待处理风险', value: totals.value.riskCount, unit: '项', icon: 'WarningFilled', live: true },
  ])

  const salesFunnel = computed(() => {
    const stages = ['需求确认', '方案沟通', '商务谈判', '合同审批']
    const rows = stages.map((stage) => {
      const items = salesStore.opportunities.filter((item) => item.stage === stage)
      return { stage, count: items.length, amount: items.reduce((sum, item) => sum + Number(item.amount || 0), 0) }
    })
    const maximum = Math.max(...rows.map((item) => item.amount), 1)
    return rows.map((item) => ({ ...item, rate: Math.round(item.amount / maximum * 100) }))
  })

  const operationRisks = computed(() => {
    const receivableRisks = totals.value.overduePlans.map((item) => {
      const contract = salesStore.contracts.find((row) => row.id === item.contractId)
      const customer = salesStore.customerMap[contract?.customerId]
      const remaining = Math.max(0, Number(item.amount || 0) - Number(item.paidAmount || 0))
      return {
        id: `receivable-${item.id}`,
        level: '高',
        title: `${customer?.shortName || customer?.name || '客户'}${item.phase || '合同款'}逾期`,
        source: '合同回款',
        owner: contract?.owner || '销售负责人',
        deadline: item.dueDate.slice(5),
        detail: `${contract?.code || '关联合同'}尚有 ${remaining} 万元未回款。`,
        target: { path: '/sales/contracts', query: { selected: contract?.id } },
      }
    })
    const projectRisks = totals.value.openProjectRisks.map((item) => ({
      id: `project-${item.id}`,
      level: item.level || '中',
      title: item.title,
      source: '项目交付',
      owner: projectStore.employeeMap[item.ownerId]?.name || '项目负责人',
      deadline: item.deadline?.slice(5) || '待确认',
      detail: item.response || '请进入项目详情查看风险处置情况。',
      target: `/projects/${item.projectId}`,
    }))
    return [...receivableRisks, ...projectRisks].sort((a, b) => a.deadline.localeCompare(b.deadline))
  })

  const industryContribution = computed(() => {
    const amounts = {}
    salesStore.contracts.forEach((contract) => {
      const industry = salesStore.customerMap[contract.customerId]?.industry || '其他行业'
      amounts[industry] = (amounts[industry] || 0) + Number(contract.amount || 0)
    })
    const total = Object.values(amounts).reduce((sum, value) => sum + value, 0)
    return Object.entries(amounts)
      .map(([name, value]) => ({ name, value, percent: total ? round(value / total * 100) : 0 }))
      .sort((a, b) => b.value - a.value)
  })

  const regionPerformance = computed(() => {
    const rows = {}
    salesStore.contracts.forEach((contract) => {
      const customer = salesStore.customerMap[contract.customerId]
      const region = customer?.region || '其他'
      rows[region] ||= { name: region.endsWith('区域') ? region : `${region}区域`, revenue: 0, paid: 0 }
      rows[region].revenue += Number(contract.amount || 0)
      rows[region].paid += Number(contract.paid || 0)
    })
    const total = Object.values(rows).reduce((sum, item) => sum + item.revenue, 0)
    return Object.values(rows)
      .map((item) => ({
        ...item,
        growth: 0,
        share: total ? round(item.revenue / total * 100) : 0,
        targetRate: item.revenue ? round(item.paid / item.revenue * 100) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
  })

  const efficiencyMetrics = computed(() => {
    const activeProjects = projectStore.activeProjects
    const healthyRate = activeProjects.length
      ? round(activeProjects.filter((item) => item.health === '正常').length / activeProjects.length * 100)
      : 0
    const closedOpportunities = salesStore.opportunities.filter((item) => ['赢单', '输单'].includes(item.stage))
    const winRate = closedOpportunities.length
      ? round(closedOpportunities.filter((item) => item.stage === '赢单').length / closedOpportunities.length * 100)
      : 0
    const expense = financeStore.transactions
      .filter((item) => item.direction === '支出')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)

    return [
      { label: '预计项目毛利率', value: totals.value.grossMarginRate, unit: '%', change: '实时联动' },
      { label: '合同回款率', value: totals.value.collectionRate, unit: '%', change: '实时联动' },
      { label: '项目健康率', value: healthyRate, unit: '%', change: '实时联动' },
      { label: '商机赢单率', value: winRate, unit: '%', change: expense ? `累计支出 ${round(expense)} 万` : '暂无支出' },
    ]
  })

  return { totals, currentMetrics, salesFunnel, operationRisks, industryContribution, regionPerformance, efficiencyMetrics }
}
