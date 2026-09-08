<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import BaseChart from '../../components/charts/BaseChart.vue'
import { indicatorCategories } from '../../mock/operations'
import { useOperationsStore } from '../../stores/operations'

const store = useOperationsStore()
const route = useRoute()
const activeCategory = ref('all')
const keyword = ref(String(route.query.keyword || ''))
const frequency = ref('all')
const enabledFilter = ref('all')
const selectedId = ref(store.indicators[0]?.id)
const dialogVisible = ref(false)
const dialogMode = ref('create')
const formRef = ref()
const form = reactive({ id: null, code: '', name: '', category: 'finance', categoryName: '财务经营', definition: '', unit: '%', current: 0, target: 0, warning: 0, frequency: '每日', owner: '', enabled: true })

const selectedIndicator = computed(() => store.indicators.find((item) => item.id === selectedId.value) || null)
const filteredIndicators = computed(() => store.indicators.filter((item) => {
  const categoryMatched = activeCategory.value === 'all' || item.category === activeCategory.value
  const keywordMatched = !keyword.value || `${item.name}${item.code}${item.owner}`.toLowerCase().includes(keyword.value.toLowerCase())
  const frequencyMatched = frequency.value === 'all' || item.frequency === frequency.value
  const enabledMatched = enabledFilter.value === 'all' || item.enabled === (enabledFilter.value === 'enabled')
  return categoryMatched && keywordMatched && frequencyMatched && enabledMatched
}))
const categoryCounts = computed(() => Object.fromEntries(indicatorCategories.map((category) => [category.id, category.id === 'all' ? store.indicators.length : store.indicators.filter((item) => item.category === category.id).length])))
const trendOption = computed(() => ({
  color: ['#246bfd'], tooltip: { trigger: 'axis' }, grid: { left: 36, right: 10, top: 20, bottom: 26 },
  xAxis: { type: 'category', data: ['4 月', '5 月', '6 月', '7 月', '8 月', '9 月'], axisLine: { lineStyle: { color: '#dce4ee' } }, axisLabel: { color: '#8996a8' } },
  yAxis: { type: 'value', splitLine: { lineStyle: { color: '#edf1f6', type: 'dashed' } }, axisLabel: { color: '#8996a8' } },
  series: [{ type: 'line', smooth: true, symbolSize: 6, data: selectedIndicator.value?.trend || [], areaStyle: { color: 'rgba(36,107,253,.08)' }, lineStyle: { width: 3 } }],
}))
const rules = { code: [{ required: true, message: '请输入指标编码', trigger: 'blur' }], name: [{ required: true, message: '请输入指标名称', trigger: 'blur' }], definition: [{ required: true, message: '请输入指标口径', trigger: 'blur' }], owner: [{ required: true, message: '请输入责任部门', trigger: 'blur' }] }

function resetForm() { Object.assign(form, { id: null, code: '', name: '', category: activeCategory.value === 'all' ? 'finance' : activeCategory.value, categoryName: '', definition: '', unit: '%', current: 0, target: 0, warning: 0, frequency: '每日', owner: '', enabled: true }) }
function syncCategoryName() { form.categoryName = indicatorCategories.find((item) => item.id === form.category)?.name || '' }
function openCreate() { resetForm(); syncCategoryName(); dialogMode.value = 'create'; dialogVisible.value = true }
function openEdit(item) { Object.assign(form, item); dialogMode.value = 'edit'; dialogVisible.value = true }

async function saveIndicator() {
  await formRef.value.validate()
  syncCategoryName()
  if (dialogMode.value === 'create' && store.indicators.some((item) => item.code === form.code)) { ElMessage.error('指标编码已存在'); return }
  const payload = { ...form }
  delete payload.id
  if (dialogMode.value === 'create') store.addIndicator(payload)
  else store.updateIndicator(form.id, payload)
  dialogVisible.value = false
  ElMessage.success(dialogMode.value === 'create' ? '指标已创建' : '指标已更新')
}

async function removeIndicator(item) {
  try {
    await ElMessageBox.confirm(`确定删除指标“${item.name}”吗？`, '删除指标', { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' })
    store.removeIndicator(item.id)
    if (selectedId.value === item.id) selectedId.value = store.indicators[0]?.id
    ElMessage.success('指标已删除')
  } catch { /* 用户取消删除。 */ }
}

function changeEnabled(item, value) { store.toggleIndicator(item.id, value); ElMessage.success(`指标已${value ? '启用' : '停用'}`) }
function toggleSubscribe(item) { const wasSubscribed = item.subscribed; store.toggleSubscription(item.id); ElMessage.success(wasSubscribed ? '已取消指标订阅' : '已订阅指标预警') }
function completion(item) { return item.target ? Math.round(item.current / item.target * 1000) / 10 : 0 }
</script>

<template>
  <div class="operations-page indicators-page">
    <header class="operations-header"><div><span>INDICATOR CENTER</span><h1>指标中心</h1><p>统一定义经营指标口径、目标值、预警阈值和更新责任。</p></div><el-button type="primary" @click="openCreate"><el-icon><Plus /></el-icon>新增指标</el-button></header>
    <section class="indicator-workspace">
      <aside class="indicator-categories"><h3>指标分类</h3><button v-for="category in indicatorCategories" :key="category.id" type="button" :class="{ active: activeCategory === category.id }" @click="activeCategory = category.id"><el-icon><component :is="category.icon" /></el-icon><span>{{ category.name }}</span><b>{{ categoryCounts[category.id] }}</b></button><div class="indicator-health"><span>指标运行状态</span><strong>{{ store.indicators.filter((item) => item.enabled).length }}/{{ store.indicators.length }}</strong><small>当前启用</small></div></aside>
      <main class="indicator-list-area">
        <div class="indicator-toolbar"><el-input v-model="keyword" clearable placeholder="搜索指标名称、编码或责任部门"><template #prefix><el-icon><Search /></el-icon></template></el-input><el-select v-model="frequency" style="width:118px"><el-option label="全部频率" value="all" /><el-option label="每日" value="每日" /><el-option label="每周" value="每周" /><el-option label="每月" value="每月" /></el-select><el-select v-model="enabledFilter" style="width:110px"><el-option label="全部状态" value="all" /><el-option label="已启用" value="enabled" /><el-option label="已停用" value="disabled" /></el-select></div>
        <el-table :data="filteredIndicators" highlight-current-row @current-change="(row) => row && (selectedId = row.id)">
          <el-table-column prop="code" label="指标编码" width="120" /><el-table-column prop="name" label="指标名称" min-width="130" /><el-table-column prop="categoryName" label="分类" width="90" />
          <el-table-column label="当前 / 目标" min-width="135"><template #default="{ row }"><strong>{{ row.current.toLocaleString() }}</strong> / {{ row.target.toLocaleString() }} {{ row.unit }}</template></el-table-column>
          <el-table-column label="达成率" min-width="120"><template #default="{ row }"><el-progress :percentage="Math.min(completion(row), 100)" :stroke-width="6" /></template></el-table-column>
          <el-table-column prop="frequency" label="更新" width="70" /><el-table-column label="启用" width="65"><template #default="{ row }"><el-switch :model-value="row.enabled" @change="(value) => changeEnabled(row, value)" /></template></el-table-column>
          <el-table-column label="操作" width="130"><template #default="{ row }"><el-button link @click.stop="openEdit(row)">编辑</el-button><el-button link type="danger" @click.stop="removeIndicator(row)">删除</el-button></template></el-table-column>
        </el-table>
        <el-empty v-if="filteredIndicators.length === 0" description="没有符合条件的经营指标" />
      </main>
      <aside class="indicator-detail">
        <template v-if="selectedIndicator"><div class="indicator-detail-head"><div><span>{{ selectedIndicator.code }}</span><h2>{{ selectedIndicator.name }}</h2></div><el-tag :type="selectedIndicator.enabled ? 'success' : 'info'">{{ selectedIndicator.enabled ? '运行中' : '已停用' }}</el-tag></div><p class="indicator-definition">{{ selectedIndicator.definition }}</p><div class="indicator-values"><div><span>当前值</span><strong>{{ selectedIndicator.current.toLocaleString() }}<small>{{ selectedIndicator.unit }}</small></strong></div><div><span>目标值</span><strong>{{ selectedIndicator.target.toLocaleString() }}<small>{{ selectedIndicator.unit }}</small></strong></div><div><span>预警值</span><strong>{{ selectedIndicator.warning.toLocaleString() }}<small>{{ selectedIndicator.unit }}</small></strong></div></div><h3>近六期走势</h3><BaseChart :option="trendOption" height="205px" /><el-descriptions :column="1" border><el-descriptions-item label="责任部门">{{ selectedIndicator.owner }}</el-descriptions-item><el-descriptions-item label="更新频率">{{ selectedIndicator.frequency }}</el-descriptions-item></el-descriptions><el-button class="subscribe-button" :type="selectedIndicator.subscribed ? 'default' : 'primary'" @click="toggleSubscribe(selectedIndicator)">{{ selectedIndicator.subscribed ? '取消预警订阅' : '订阅指标预警' }}</el-button></template>
      </aside>
    </section>

    <el-dialog v-model="dialogVisible" :title="dialogMode === 'create' ? '新增经营指标' : '编辑经营指标'" width="660px"><el-form ref="formRef" :model="form" :rules="rules" label-position="top"><div class="form-columns"><el-form-item label="指标编码" prop="code"><el-input v-model="form.code" /></el-form-item><el-form-item label="指标名称" prop="name"><el-input v-model="form.name" /></el-form-item></div><div class="form-columns"><el-form-item label="指标分类"><el-select v-model="form.category" style="width:100%" @change="syncCategoryName"><el-option v-for="item in indicatorCategories.filter((item) => item.id !== 'all')" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item><el-form-item label="责任部门" prop="owner"><el-input v-model="form.owner" /></el-form-item></div><el-form-item label="指标口径" prop="definition"><el-input v-model="form.definition" type="textarea" :rows="3" /></el-form-item><div class="form-columns three"><el-form-item label="当前值"><el-input-number v-model="form.current" :min="0" style="width:100%" /></el-form-item><el-form-item label="目标值"><el-input-number v-model="form.target" :min="0" style="width:100%" /></el-form-item><el-form-item label="预警值"><el-input-number v-model="form.warning" :min="0" style="width:100%" /></el-form-item></div><div class="form-columns"><el-form-item label="单位"><el-select v-model="form.unit" style="width:100%"><el-option label="万元" value="万元" /><el-option label="%" value="%" /><el-option label="个" value="个" /></el-select></el-form-item><el-form-item label="更新频率"><el-select v-model="form.frequency" style="width:100%"><el-option label="每日" value="每日" /><el-option label="每周" value="每周" /><el-option label="每月" value="每月" /></el-select></el-form-item></div></el-form><template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="saveIndicator">保存指标</el-button></template></el-dialog>
  </div>
</template>
