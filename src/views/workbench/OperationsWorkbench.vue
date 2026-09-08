<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import BaseChart from '../../components/charts/BaseChart.vue'
import {
  departmentPerformance,
  operationRisks,
  operationSnapshots,
  projectHealth,
  salesFunnel,
} from '../../mock/workbench'
import { useWorkbenchStore } from '../../stores/workbench'

const workbenchStore = useWorkbenchStore()
const router = useRouter()
const selectedPeriod = ref('2026-09')
const selectedScope = ref('all')
const riskLevel = ref('all')
const riskDrawerVisible = ref(false)
const selectedRisk = ref(null)

const scopeData = {
  all: { label: '企业全局', factor: 1, metrics: null },
  east: { label: '华东事业部', factor: 0.27, metrics: [348, 27.1, 92.4, 6, 2] },
  manufacturing: { label: '智能制造事业部', factor: 0.23, metrics: [296, 25.6, 87.8, 5, 3] },
  digital: { label: '数字服务事业部', factor: 0.19, metrics: [244, 22.3, 84.9, 4, 2] },
}

const snapshot = computed(() => operationSnapshots[selectedPeriod.value])
const displayMetrics = computed(() => {
  const override = scopeData[selectedScope.value].metrics
  if (!override) return snapshot.value.metrics
  return snapshot.value.metrics.map((item, index) => ({ ...item, value: override[index] }))
})
const filteredDepartments = computed(() => {
  if (selectedScope.value === 'all') return departmentPerformance
  const mapping = {
    east: '华东事业部',
    manufacturing: '智能制造事业部',
    digital: '数字服务事业部',
  }
  return departmentPerformance.filter((item) => item.name === mapping[selectedScope.value])
})
const filteredRisks = computed(() => {
  if (riskLevel.value === 'all') return operationRisks
  return operationRisks.filter((item) => item.level === riskLevel.value)
})

const trendOption = computed(() => {
  const factor = scopeData[selectedScope.value].factor
  return {
    color: ['#246bfd', '#54c7ad'],
    tooltip: { trigger: 'axis', valueFormatter: (value) => `${value} 万元` },
    legend: { right: 4, top: 0, itemWidth: 10, itemHeight: 10, textStyle: { color: '#66758c' } },
    grid: { left: 48, right: 18, top: 42, bottom: 34 },
    xAxis: { type: 'category', data: snapshot.value.trend.labels, axisLine: { lineStyle: { color: '#dce4ee' } }, axisTick: { show: false }, axisLabel: { color: '#7f8da1' } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#edf1f6', type: 'dashed' } }, axisLabel: { color: '#8d99aa' } },
    series: [
      {
        name: '营业收入',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        data: snapshot.value.trend.revenue.map((value) => Math.round(value * factor)),
        lineStyle: { width: 3 },
        areaStyle: { color: 'rgba(36, 107, 253, .08)' },
      },
      {
        name: '经营成本',
        type: 'bar',
        barWidth: 18,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
        data: snapshot.value.trend.cost.map((value) => Math.round(value * factor)),
      },
    ],
  }
})

const targetCompletion = computed(() => Math.round((snapshot.value.target.completed / snapshot.value.target.annual) * 1000) / 10)
const targetOption = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
  series: [
    {
      type: 'pie',
      radius: ['72%', '88%'],
      silent: true,
      label: { show: false },
      data: [
        { value: targetCompletion.value, name: '已完成', itemStyle: { color: '#246bfd' } },
        { value: 100 - targetCompletion.value, name: '待完成', itemStyle: { color: '#edf2f8' } },
      ],
    },
  ],
}))

function formatMetric(metric) {
  if (metric.unit === '万元') return new Intl.NumberFormat('zh-CN').format(metric.value)
  return metric.value
}

function refreshData() {
  workbenchStore.refresh()
  ElMessage.success(`经营数据已更新至 ${workbenchStore.lastUpdatedAt}`)
}

function exportBrief() {
  const rows = [
    ['经营范围', scopeData[selectedScope.value].label],
    ['统计期间', snapshot.value.label],
    ...displayMetrics.value.map((item) => [item.label, `${item.value}${item.unit}`]),
  ]
  const csv = `\ufeff${rows.map((row) => row.join(',')).join('\n')}`
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  link.download = `经营简报-${snapshot.value.label}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
  ElMessage.success('经营简报已生成')
}

function openRisk(risk) {
  selectedRisk.value = risk
  riskDrawerVisible.value = true
}

function statusType(status) {
  return { 领先: 'success', 正常: 'primary', 关注: 'warning' }[status] || 'info'
}

function healthType(health) {
  return health === '正常' ? 'success' : 'warning'
}

function openMetric(metric) {
  const names = { revenue: '营业收入', profit: '综合毛利率', collection: '合同回款率', projects: '项目按期交付率' }
  if (metric.key === 'risk') router.push('/operations/cockpit')
  else router.push({ path: '/operations/indicators', query: { keyword: names[metric.key] || '' } })
}
</script>

<template>
  <div class="workbench-page operations-page">
    <header class="workbench-header">
      <div>
        <span class="section-kicker">OPERATIONS OVERVIEW</span>
        <h1>经营工作台</h1>
        <p>聚合企业经营成果、目标进度、项目交付和关键风险。</p>
      </div>
      <div class="workbench-actions">
        <el-select v-model="selectedScope" style="width: 160px">
          <el-option v-for="(item, key) in scopeData" :key="key" :label="item.label" :value="key" />
        </el-select>
        <el-select v-model="selectedPeriod" style="width: 180px">
          <el-option v-for="(item, key) in operationSnapshots" :key="key" :label="item.label" :value="key" />
        </el-select>
        <el-button @click="refreshData"><el-icon><Refresh /></el-icon>刷新数据</el-button>
        <el-button type="primary" @click="exportBrief"><el-icon><Download /></el-icon>导出经营简报</el-button>
      </div>
    </header>

    <section class="metric-strip">
      <article v-for="metric in displayMetrics" :key="metric.key" class="metric-block clickable" role="button" tabindex="0" @click="openMetric(metric)" @keyup.enter="openMetric(metric)">
        <div class="metric-top">
          <span class="metric-icon"><el-icon><component :is="metric.icon" /></el-icon></span>
          <span class="metric-change" :class="metric.trend">
            <el-icon><Top v-if="metric.trend === 'up'" /><Bottom v-else /></el-icon>
            {{ metric.change }}{{ metric.unit === '%' ? ' 个百分点' : '' }}
          </span>
        </div>
        <span class="metric-label">{{ metric.label }}</span>
        <strong>{{ formatMetric(metric) }}<small>{{ metric.unit }}</small></strong>
        <span class="metric-note">较上期{{ metric.trend === 'up' ? '提升' : '下降' }}</span>
      </article>
    </section>

    <div class="operations-main-grid">
      <section class="wb-panel trend-panel">
        <div class="wb-panel-head">
          <div><h2>收入与成本趋势</h2><p>{{ scopeData[selectedScope].label }} · 最近六个统计周期</p></div>
          <span class="update-time">更新于 {{ workbenchStore.lastUpdatedAt }}</span>
        </div>
        <BaseChart :option="trendOption" height="320px" />
      </section>

      <section class="wb-panel target-panel">
        <div class="wb-panel-head"><div><h2>年度经营目标</h2><p>收入目标执行进度</p></div><el-button link type="primary" @click="router.push('/operations/goals')">查看目标</el-button></div>
        <div class="target-chart-wrap">
          <BaseChart :option="targetOption" height="205px" />
          <div class="target-center"><strong>{{ targetCompletion }}%</strong><span>目标完成率</span></div>
        </div>
        <div class="target-numbers">
          <div><span>年度目标</span><strong>{{ snapshot.target.annual.toLocaleString() }} 万</strong></div>
          <div><span>累计完成</span><strong>{{ snapshot.target.completed.toLocaleString() }} 万</strong></div>
        </div>
        <div class="target-status"><span>计划进度 {{ snapshot.target.expected }}%</span><el-tag :type="targetCompletion >= snapshot.target.expected ? 'success' : 'warning'">{{ targetCompletion >= snapshot.target.expected ? '符合预期' : '需要关注' }}</el-tag></div>
      </section>
    </div>

    <div class="operations-secondary-grid">
      <section class="wb-panel department-panel">
        <div class="wb-panel-head"><div><h2>业务单元目标达成</h2><p>年度收入目标执行情况</p></div></div>
        <el-table :data="filteredDepartments" stripe>
          <el-table-column prop="name" label="业务单元" min-width="160" />
          <el-table-column prop="owner" label="负责人" width="90" />
          <el-table-column label="目标 / 完成" min-width="150">
            <template #default="{ row }">{{ row.actual.toLocaleString() }} / {{ row.target.toLocaleString() }} 万</template>
          </el-table-column>
          <el-table-column label="完成率" min-width="170">
            <template #default="{ row }"><el-progress :percentage="row.completion" :stroke-width="7" /></template>
          </el-table-column>
          <el-table-column label="状态" width="86">
            <template #default="{ row }"><el-tag :type="statusType(row.status)" effect="light">{{ row.status }}</el-tag></template>
          </el-table-column>
        </el-table>
      </section>

      <section class="wb-panel funnel-panel">
        <div class="wb-panel-head"><div><h2>重点商机漏斗</h2><p>当前有效商机金额</p></div></div>
        <div class="funnel-list">
          <div v-for="stage in salesFunnel" :key="stage.stage" class="funnel-row">
            <div class="funnel-copy"><strong>{{ stage.stage }}</strong><span>{{ stage.count }} 项 · {{ stage.amount.toLocaleString() }} 万</span></div>
            <div class="funnel-track"><span :style="{ width: `${stage.rate}%` }"></span></div>
            <b>{{ stage.rate }}%</b>
          </div>
        </div>
      </section>
    </div>

    <div class="operations-bottom-grid">
      <section class="wb-panel projects-panel">
        <div class="wb-panel-head"><div><h2>重点项目健康度</h2><p>进度、预算与交付节点综合评估</p></div><el-tag effect="plain">{{ projectHealth.length }} 个重点项目</el-tag></div>
        <el-table :data="projectHealth">
          <el-table-column prop="name" label="项目名称" min-width="210" />
          <el-table-column prop="manager" label="项目经理" width="92" />
          <el-table-column label="项目进度" min-width="150">
            <template #default="{ row }"><el-progress :percentage="row.progress" :stroke-width="7" /></template>
          </el-table-column>
          <el-table-column label="预算执行" width="100"><template #default="{ row }">{{ row.budgetRate }}%</template></el-table-column>
          <el-table-column prop="deadline" label="计划完成" width="112" />
          <el-table-column label="健康状态" width="106"><template #default="{ row }"><el-tag :type="healthType(row.health)">{{ row.health }}</el-tag></template></el-table-column>
        </el-table>
      </section>

      <section class="wb-panel risk-panel">
        <div class="wb-panel-head">
          <div><h2>经营风险提醒</h2><p>按处置期限排序</p></div>
          <el-select v-model="riskLevel" size="small" style="width: 92px"><el-option label="全部" value="all" /><el-option label="高风险" value="高" /><el-option label="中风险" value="中" /></el-select>
        </div>
        <div class="risk-list">
          <button v-for="risk in filteredRisks" :key="risk.id" type="button" class="risk-item" @click="openRisk(risk)">
            <span class="risk-level" :class="risk.level === '高' ? 'high' : 'medium'">{{ risk.level }}</span>
            <span class="risk-copy"><strong>{{ risk.title }}</strong><small>{{ risk.source }} · {{ risk.owner }}</small></span>
            <span class="risk-deadline">{{ risk.deadline }}</span>
          </button>
        </div>
      </section>
    </div>

    <el-drawer v-model="riskDrawerVisible" title="风险事项详情" size="460px">
      <div v-if="selectedRisk" class="risk-detail">
        <div class="risk-detail-title"><span class="risk-level" :class="selectedRisk.level === '高' ? 'high' : 'medium'">{{ selectedRisk.level }}</span><h3>{{ selectedRisk.title }}</h3></div>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="风险来源">{{ selectedRisk.source }}</el-descriptions-item>
          <el-descriptions-item label="责任人">{{ selectedRisk.owner }}</el-descriptions-item>
          <el-descriptions-item label="处置期限">2026-{{ selectedRisk.deadline }}</el-descriptions-item>
        </el-descriptions>
        <div class="risk-description"><h4>风险说明</h4><p>{{ selectedRisk.detail }}</p></div>
      </div>
    </el-drawer>
  </div>
</template>
