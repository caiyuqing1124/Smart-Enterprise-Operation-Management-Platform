<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { messageCategories } from '../../mock/workbench'
import { useAppStore } from '../../stores/app'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const activeCategory = ref('all')
const readFilter = ref('all')
const priorityFilter = ref('all')
const keyword = ref(String(route.query.keyword || ''))
const selectedIds = ref([])
const currentMessage = ref(null)
const currentPage = ref(1)
const pageSize = 6

const categoryCounts = computed(() => Object.fromEntries(
  messageCategories.map((category) => [
    category.key,
    category.key === 'all'
      ? appStore.notifications.length
      : appStore.notifications.filter((item) => item.type === category.key).length,
  ]),
))

const filteredMessages = computed(() => {
  const normalizedKeyword = keyword.value.trim().toLowerCase()
  return appStore.notifications.filter((item) => {
    const categoryMatched = activeCategory.value === 'all' || item.type === activeCategory.value
    const readMatched = readFilter.value === 'all' || (readFilter.value === 'unread' ? !item.read : item.read)
    const priorityMatched = priorityFilter.value === 'all' || item.priority === priorityFilter.value
    const keywordMatched = !normalizedKeyword || `${item.title}${item.content}${item.source}`.toLowerCase().includes(normalizedKeyword)
    return categoryMatched && readMatched && priorityMatched && keywordMatched
  })
})

const pagedMessages = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredMessages.value.slice(start, start + pageSize)
})

watch([activeCategory, readFilter, priorityFilter, keyword], () => {
  currentPage.value = 1
  selectedIds.value = []
})

watch(
  () => route.query,
  (query) => {
    if (query.keyword !== undefined) keyword.value = String(query.keyword)
    if (query.selected) {
      const message = appStore.notifications.find((item) => item.id === Number(query.selected))
      if (message) selectMessage(message)
    }
  },
  { immediate: true },
)

function selectMessage(message) {
  currentMessage.value = message
  appStore.markRead(message.id)
}

function selectCategory(key) {
  activeCategory.value = key
  currentMessage.value = null
}

function clearFilters() {
  keyword.value = ''
  readFilter.value = 'all'
  priorityFilter.value = 'all'
  activeCategory.value = 'all'
  router.replace('/workbench/messages')
}

function markSelectedRead() {
  selectedIds.value.forEach((id) => appStore.markRead(id))
  ElMessage.success(`已将 ${selectedIds.value.length} 条消息标记为已读`)
  selectedIds.value = []
}

function markAllRead() {
  const unreadCount = appStore.notifications.filter((item) => !item.read).length
  if (!unreadCount) {
    ElMessage.info('当前没有未读消息')
    return
  }
  appStore.markAllRead()
  ElMessage.success(`已处理 ${unreadCount} 条未读消息`)
}

async function deleteSelected() {
  if (!selectedIds.value.length) return
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 条消息吗？删除后无法恢复。`, '删除消息', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const deletingIds = [...selectedIds.value]
    appStore.removeNotifications(deletingIds)
    if (currentMessage.value && deletingIds.includes(currentMessage.value.id)) currentMessage.value = null
    selectedIds.value = []
    ElMessage.success('消息已删除')
  } catch {
    // 用户取消删除时保留原有消息。
  }
}

async function deleteCurrent() {
  if (!currentMessage.value) return
  selectedIds.value = [currentMessage.value.id]
  await deleteSelected()
}

function viewRelated() {
  if (!currentMessage.value?.target) return
  router.push(currentMessage.value.target)
  ElMessage.success(`已打开${currentMessage.value.source}关联内容`)
}

function priorityType(priority) {
  return { 高: 'danger', 中: 'warning', 普通: 'info' }[priority]
}
</script>

<template>
  <div class="workbench-page messages-page">
    <header class="workbench-header message-header">
      <div>
        <span class="section-kicker">MESSAGE CENTER</span>
        <h1>消息中心</h1>
        <p>统一接收审批、任务、经营动态和风险预警。</p>
      </div>
      <div class="workbench-actions">
        <el-button @click="markAllRead"><el-icon><CircleCheck /></el-icon>全部标为已读</el-button>
      </div>
    </header>

    <section class="message-workspace">
      <aside class="message-categories">
        <div class="category-title">消息分类</div>
        <button
          v-for="category in messageCategories"
          :key="category.key"
          type="button"
          class="category-item"
          :class="{ active: activeCategory === category.key }"
          @click="selectCategory(category.key)"
        >
          <el-icon><component :is="category.icon" /></el-icon>
          <span>{{ category.label }}</span>
          <b>{{ categoryCounts[category.key] }}</b>
        </button>
        <div class="unread-summary">
          <span>未读消息</span>
          <strong>{{ appStore.notifications.filter((item) => !item.read).length }}</strong>
          <el-progress :percentage="appStore.notifications.length ? Math.round(appStore.notifications.filter((item) => item.read).length / appStore.notifications.length * 100) : 100" :show-text="false" />
          <small>已读处理进度</small>
        </div>
      </aside>

      <section class="message-list-panel">
        <div class="message-filters">
          <el-input v-model="keyword" clearable placeholder="搜索消息标题、内容或来源">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-select v-model="readFilter" style="width: 116px"><el-option label="全部状态" value="all" /><el-option label="仅未读" value="unread" /><el-option label="已读" value="read" /></el-select>
          <el-select v-model="priorityFilter" style="width: 116px"><el-option label="全部等级" value="all" /><el-option label="高优先级" value="高" /><el-option label="中优先级" value="中" /><el-option label="普通" value="普通" /></el-select>
        </div>

        <div class="message-batchbar">
          <span>共 {{ filteredMessages.length }} 条消息</span>
          <div>
            <el-button text :disabled="!selectedIds.length" @click="markSelectedRead">标为已读</el-button>
            <el-button text type="danger" :disabled="!selectedIds.length" @click="deleteSelected">删除</el-button>
          </div>
        </div>

        <div class="message-list">
          <div
            v-for="message in pagedMessages"
            :key="message.id"
            class="message-row"
            :class="{ unread: !message.read, active: currentMessage?.id === message.id }"
            role="button"
            tabindex="0"
            @click="selectMessage(message)"
            @keyup.enter="selectMessage(message)"
          >
            <el-checkbox v-model="selectedIds" :value="message.id" @click.stop />
            <span class="message-type-icon" :class="`type-${message.type}`"><el-icon><component :is="messageCategories.find((item) => item.key === message.type)?.icon" /></el-icon></span>
            <div class="message-row-copy">
              <div><strong>{{ message.title }}</strong><i v-if="!message.read"></i></div>
              <p>{{ message.content }}</p>
              <span>{{ message.source }} · {{ message.time }}</span>
            </div>
            <el-tag :type="priorityType(message.priority)" effect="light" size="small">{{ message.priority }}</el-tag>
          </div>

          <el-empty v-if="pagedMessages.length === 0" description="没有符合当前条件的消息">
            <el-button type="primary" plain @click="clearFilters">清空筛选条件</el-button>
          </el-empty>
        </div>

        <div v-if="filteredMessages.length > pageSize" class="message-pagination">
          <el-pagination v-model:current-page="currentPage" background layout="prev, pager, next" :page-size="pageSize" :total="filteredMessages.length" />
        </div>
      </section>

      <aside class="message-detail-panel">
        <div v-if="currentMessage" class="message-detail">
          <div class="detail-toolbar">
            <el-tag :type="priorityType(currentMessage.priority)">{{ currentMessage.typeName }}</el-tag>
            <el-button text type="danger" @click="deleteCurrent"><el-icon><Delete /></el-icon>删除</el-button>
          </div>
          <h2>{{ currentMessage.title }}</h2>
          <div class="detail-meta"><span>{{ currentMessage.source }}</span><span>{{ currentMessage.date }}</span></div>
          <div class="detail-content">{{ currentMessage.content }}</div>
          <div class="detail-status"><el-icon><CircleCheckFilled /></el-icon><span>该消息已标记为已读</span></div>
          <el-button type="primary" class="detail-action" @click="viewRelated">查看关联事项<el-icon><ArrowRight /></el-icon></el-button>
        </div>
        <div v-else class="message-detail-empty">
          <span><el-icon><Message /></el-icon></span>
          <h3>选择一条消息</h3>
          <p>消息详情将在这里显示，打开消息后会自动标记为已读。</p>
        </div>
      </aside>
    </section>
  </div>
</template>
