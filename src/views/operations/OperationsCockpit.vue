<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import BaseChart from '../../components/charts/BaseChart.vue'
import { efficiencyMetrics, industryContribution, operationRisks, operationSnapshots, regionPerformance } from '../../mock/operations'
import { useProjectStore } from '../../stores/projects'

const projectStore = useProjectStore()
const projectHealth = computed(() => projectStore.activeProjects.slice(0, 4))
const period = ref('2026-09')
const dimension = ref('all')
const detailVisible = ref(false)
const selectedRegion = ref(null)
const cockpitRef = ref()
const snapshot = computed(() => operationSnapshots[period.value])
const dimensionFactor = computed(() => ({ all: 1, revenue: 1.04, delivery: .97 }[dimension.value]))

const trendOption = computed(() => ({
  color: ['#4c8dff', '#38d2b4'],
  tooltip: { trigger: 'axis' },
  legend: { right: 8, textStyle: { color: '#91a8c9' } },
  grid: { left: 48, right: 18, top: 45, bottom: 30 },
  xAxis: { type: 'category', data: snapshot.value.trend.labels, axisLine: { lineStyle: { color: '#29476f' } }, axisLabel: { color: '#7890b2' } },
  yAxis: { type: 'value', splitLine: { lineStyle: { color: '#203c63', type: 'dashed' } }, axisLabel: { color: '#7890b2' } },
  series: [
    { name: '营业收入', type: 'line', smooth: true, symbolSize: 7, data: snapshot.value.trend.revenue.map((v) => Math.round(v * dimensionFactor.value)), lineStyle: { width: 3 }, areaStyle: { color: 'rgba(76,141,255,.12)' } },
    { name: '经营成本', type: 'bar', barWidth: 15, data: snapshot.value.trend.cost, itemStyle: { borderRadius: [4, 4, 0, 0] } },
  ],
}))

const industryOption = computed(() => ({
  color: ['#4c8dff', '#37c9ad', '#7a6cf0', '#f0a33b', '#5b759a'],
  tooltip: { trigger: 'item', formatter: '{b}<br/>{c} 万元 · {d}%' },
  legend: { orient: 'vertical', right: 0, top: 'center', textStyle: { color: '#9aafcb' }, itemWidth: 9, itemHeight: 9 },
  series: [{ type: 'pie', radius: ['47%', '70%'], center: ['36%', '52%'], label: { show: false }, data: industryContribution }],
}))

const regionOption = computed(() => ({
  color: ['#4c8dff'], tooltip: { trigger: 'axis' },
  grid: { left: 70, right: 24, top: 15, bottom: 20 },
  xAxis: { type: 'value', splitLine: { lineStyle: { color: '#203c63', type: 'dashed' } }, axisLabel: { color: '#7890b2' } },
  yAxis: { type: 'category', data: [...regionPerformance].reverse().map((item) => item.name), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#93a8c5' } },
  series: [{ type: 'bar', barWidth: 13, data: [...regionPerformance].reverse().map((item) => item.revenue), itemStyle: { borderRadius: [0, 7, 7, 0] } }],
}))

async function toggleFullscreen() {
  if (!document.fullscreenElement) {
    await cockpitRef.value.requestFullscreen()
    ElMessage.success('已进入全屏经营视图')
  } else {
    await document.exitFullscreen()
  }
}

function exportData() {
  const rows = [['区域', '收入（万元）', '增长率', '目标完成率'], ...regionPerformance.map((item) => [item.name, item.revenue, `${item.growth}%`, `${item.targetRate}%`])]
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([`\ufeff${rows.map((row) => row.join(',')).join('\n')}`], { type: 'text/csv;charset=utf-8' }))
  link.download = `经营驾驶舱-${snapshot.value.label}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
  ElMessage.success('驾驶舱数据已导出')
}

function openRegion(item) { selectedRegion.value = item; detailVisible.value = true }
</script>

<template>
  <div ref="cockpitRef" class="cockpit-page">
    <header class="cockpit-header">
      <div><span>ENTERPRISE OPERATION COCKPIT</span><h1>经营驾驶舱</h1><p>经营数据更新时间：2026-09-08 09:30</p></div>
      <div class="cockpit-tools">
        <el-select v-model="dimension" style="width: 138px"><el-option label="综合经营" value="all" /><el-option label="收入视角" value="revenue" /><el-option label="交付视角" value="delivery" /></el-select>
        <el-select v-model="period" style="width: 170px"><el-option v-for="(item, key) in operationSnapshots" :key="key" :label="item.label" :value="key" /></el-select>
        <el-button @click="exportData"><el-icon><Download /></el-icon>导出数据</el-button>
        <el-button type="primary" @click="toggleFullscreen"><el-icon><FullScreen /></el-icon>全屏查看</el-button>
     
      </div>
    </header>

    <section class="cockpit-metrics">
      <article v-for="item in snapshot.metrics" :key="item.key">
        <span>{{ item.label }}</span><strong>{{ item.value.toLocaleString() }}<small>{{ item.unit }}</small></strong>
        <em :class="item.trend">{{ item.trend === 'up' ? '↑' : '↓' }} {{ item.change }} 较上期</em>
      </article>
    </section>

    <div class="cockpit-grid top-grid">
      <section class="cockpit-panel span-two"><div class="cockpit-panel-head"><h2>收入与成本走势</h2><span>单位：万元</span></div><BaseChart :option="trendOption" height="310px" /></section>
      <section class="cockpit-panel"><div class="cockpit-panel-head"><h2>行业收入结构</h2><span>累计收入贡献</span></div><BaseChart :option="industryOption" height="310px" /></section>
    </div>

    <div class="cockpit-grid bottom-grid">
      <section class="cockpit-panel"><div class="cockpit-panel-head"><h2>区域经营贡献</h2><span>点击列表查看详情</span></div><BaseChart :option="regionOption" height="250px" /></section>
      <section class="cockpit-panel region-ranking"><div class="cockpit-panel-head"><h2>区域目标排名</h2><span>收入完成率</span></div><button v-for="(item, index) in regionPerformance" :key="item.name" type="button" @click="openRegion(item)"><b>{{ index + 1 }}</b><span><strong>{{ item.name }}</strong><small>{{ item.revenue.toLocaleString() }} 万元</small></span><em>{{ item.targetRate }}%</em></button></section>
      <section class="cockpit-panel health-panel"><div class="cockpit-panel-head"><h2>运营质量</h2><span>核心效率指标</span></div><div class="efficiency-list"><div v-for="item in efficiencyMetrics" :key="item.label"><span>{{ item.label }}</span><strong>{{ item.value }}<small>{{ item.unit }}</small></strong><em>{{ item.change }}</em></div></div><div class="cockpit-alert"><el-icon><Warning /></el-icon><span>{{ operationRisks.filter((item) => item.level === '高').length }} 项高风险事项需要优先处置</span></div></section>
    </div>

    <section class="cockpit-project-line"><div><span>重点项目健康状态</span><strong>{{ projectHealth.filter((item) => item.health === '正常').length }}/{{ projectHealth.length }} 正常</strong></div><div v-for="project in projectHealth" :key="project.id"><span>{{ project.name }}</span><el-progress :percentage="project.progress" :stroke-width="6" :show-text="false" /><el-tag :type="project.health === '正常' ? 'success' : 'warning'" size="small">{{ project.health }}</el-tag></div></section>

    <el-drawer v-model="detailVisible" title="区域经营详情" size="430px">
      <div v-if="selectedRegion" class="region-detail"><h2>{{ selectedRegion.name }}</h2><el-descriptions :column="1" border><el-descriptions-item label="累计收入">{{ selectedRegion.revenue.toLocaleString() }} 万元</el-descriptions-item><el-descriptions-item label="收入增长">{{ selectedRegion.growth }}%</el-descriptions-item><el-descriptions-item label="收入贡献">{{ selectedRegion.share }}%</el-descriptions-item><el-descriptions-item label="目标完成率">{{ selectedRegion.targetRate }}%</el-descriptions-item></el-descriptions><el-progress type="dashboard" :percentage="selectedRegion.targetRate" /><p>区域经营整体保持增长，下一阶段重点提升高价值商机转化与合同回款效率。</p></div>
    </el-drawer>
  </div>
</template>
