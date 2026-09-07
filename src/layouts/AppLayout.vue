<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAppStore } from '../stores/app'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const profileVisible = ref(false)
const searchKeyword = ref('')

const unreadCount = computed(() => appStore.notifications.filter((item) => !item.read).length)

function handleSearch() {
  const keyword = searchKeyword.value.trim()
  if (!keyword) {
    ElMessage.info('请输入要查找的内容')
    return
  }
  ElMessage.info(`“${keyword}”将在业务模块接入后提供全局检索`)
}

function markNotificationsRead() {
  appStore.markAllRead()
  ElMessage.success('消息已全部标记为已读')
}

async function logout() {
  try {
    await ElMessageBox.confirm('退出后需要重新登录，确定继续吗？', '退出登录', {
      confirmButtonText: '确定退出',
      cancelButtonText: '取消',
      type: 'warning',
    })
    authStore.logout()
    router.replace('/login')
  } catch {
    // 用户取消退出时保持当前页面。
  }
}
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar" :class="{ collapsed: appStore.sidebarCollapsed }">
      <div class="brand">
        <div class="brand-mark"><span></span><span></span><span></span></div>
        <div v-if="!appStore.sidebarCollapsed" class="brand-copy">
          <strong>智慧企业</strong>
          <small>运营管理平台</small>
        </div>
      </div>

      <div v-if="!appStore.sidebarCollapsed" class="nav-label">工作空间</div>
      <el-menu :default-active="route.path" router :collapse="appStore.sidebarCollapsed" class="main-menu">
        <el-menu-item index="/">
          <el-icon><DataBoard /></el-icon>
          <template #title>工作台</template>
        </el-menu-item>
      </el-menu>

      <div v-if="!appStore.sidebarCollapsed" class="module-plan">
        <div class="module-plan-title"><el-icon><Grid /></el-icon>业务能力</div>
        <div class="module-plan-items">
          <span>经营</span><span>销售</span><span>项目</span><span>财务</span>
        </div>
        <p>业务模块将在后续阶段逐步接入</p>
      </div>

      <button class="collapse-button" type="button" @click="appStore.toggleSidebar">
        <el-icon><Fold v-if="!appStore.sidebarCollapsed" /><Expand v-else /></el-icon>
        <span v-if="!appStore.sidebarCollapsed">收起导航</span>
      </button>
    </aside>

    <section class="app-main">
      <header class="topbar">
        <div class="topbar-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>智慧运营</el-breadcrumb-item>
            <el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="topbar-actions">
          <el-input
            v-model="searchKeyword"
            class="global-search"
            placeholder="搜索客户、项目或任务"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>

          <el-popover placement="bottom-end" :width="340" trigger="click">
            <template #reference>
              <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="action-badge">
                <el-button circle><el-icon><Bell /></el-icon></el-button>
              </el-badge>
            </template>
            <div class="notification-head">
              <strong>消息通知</strong>
              <el-button link type="primary" @click="markNotificationsRead">全部已读</el-button>
            </div>
            <div class="notification-list">
              <div v-for="item in appStore.notifications" :key="item.id" class="notification-item">
                <i :class="{ read: item.read }"></i>
                <div><p>{{ item.title }}</p><small>{{ item.time }}</small></div>
              </div>
            </div>
          </el-popover>

          <el-dropdown trigger="click">
            <button class="user-trigger" type="button">
              <el-avatar :size="34">{{ authStore.currentUser?.name?.slice(0, 1) }}</el-avatar>
              <span class="user-copy">
                <strong>{{ authStore.currentUser?.name }}</strong>
                <small>{{ authStore.currentUser?.role }}</small>
              </span>
              <el-icon><ArrowDown /></el-icon>
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="profileVisible = true"><el-icon><User /></el-icon>账号信息</el-dropdown-item>
                <el-dropdown-item divided @click="logout"><el-icon><SwitchButton /></el-icon>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <main class="page-container"><router-view /></main>
    </section>

    <el-drawer v-model="profileVisible" title="账号信息" size="420px">
      <div class="profile-panel">
        <el-avatar :size="64">{{ authStore.currentUser?.name?.slice(0, 1) }}</el-avatar>
        <h3>{{ authStore.currentUser?.name }}</h3>
        <p>{{ authStore.currentUser?.role }}</p>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="所属企业">{{ authStore.currentUser?.companyName }}</el-descriptions-item>
          <el-descriptions-item label="登录账号">{{ authStore.currentUser?.account }}</el-descriptions-item>
          <el-descriptions-item label="账号状态"><el-tag type="success">正常</el-tag></el-descriptions-item>
        </el-descriptions>
      </div>
    </el-drawer>
  </div>
</template>
