<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAppStore } from '../stores/app'
import { useAuthStore } from '../stores/auth'
import { resetBusinessData } from '../stores/persistence'
import { useSettingsStore } from '../stores/settings'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const profileVisible = ref(false)
const notificationVisible = ref(false)
const searchKeyword = ref('')

const unreadCount = computed(() => appStore.notifications.filter((item) => !item.read).length)
const recentNotifications = computed(() => appStore.notifications.slice(0, 4))

function handleSearch() {
  const keyword = searchKeyword.value.trim()
  if (!keyword) {
    ElMessage.info('请输入要查找的内容')
    return
  }
  router.push({ path: '/workbench/messages', query: { keyword } })
  searchKeyword.value = ''
}

function markNotificationsRead() {
  appStore.markAllRead()
  ElMessage.success('消息已全部标记为已读')
}

function openNotification(item) {
  appStore.markRead(item.id)
  notificationVisible.value = false
  router.push({ path: '/workbench/messages', query: { selected: item.id } })
}

function openMessageCenter() {
  notificationVisible.value = false
  router.push('/workbench/messages')
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

async function restoreInitialData() {
  try {
    await ElMessageBox.confirm(
      '此操作将清除当前浏览器中保存的业务修改，并恢复系统内置初始数据。账号和登录信息不会被删除，确定继续吗？',
      '恢复初始业务数据',
      {
        confirmButtonText: '确认恢复',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
    await resetBusinessData()
    ElMessage.success('业务数据已恢复，即将重新加载页面')
    window.setTimeout(() => window.location.reload(), 500)
  } catch {
    // 用户取消恢复时保留当前业务数据。
  }
}
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar" :class="{ collapsed: appStore.sidebarCollapsed }">
      <div class="brand">
        <div class="brand-mark"><span></span><span></span><span></span></div>
        <div v-if="!appStore.sidebarCollapsed" class="brand-copy">
          <strong>{{ settingsStore.enterpriseProfile.shortName || '源多艺' }}</strong>
          <small>{{ settingsStore.systemPreferences.systemName }}</small>
        </div>
      </div>

      <div v-if="!appStore.sidebarCollapsed" class="nav-label">业务导航</div>
      <el-menu :default-active="route.path" router :collapse="appStore.sidebarCollapsed" class="main-menu">
        <el-sub-menu index="workbench">
          <template #title>
            <el-icon><DataBoard /></el-icon>
            <span>统一工作台</span>
          </template>
          <el-menu-item index="/workbench/operations"><el-icon><TrendCharts /></el-icon>经营工作台</el-menu-item>
          <el-menu-item index="/workbench/personal"><el-icon><User /></el-icon>我的工作台</el-menu-item>
          <el-menu-item index="/workbench/messages"><el-icon><Bell /></el-icon>消息中心</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="operations">
          <template #title>
            <el-icon><Management /></el-icon>
            <span>经营管理</span>
          </template>
          <el-menu-item index="/operations/cockpit"><el-icon><Odometer /></el-icon>经营驾驶舱</el-menu-item>
          <el-menu-item index="/operations/goals"><el-icon><Aim /></el-icon>经营目标</el-menu-item>
          <el-menu-item index="/operations/indicators"><el-icon><DataLine /></el-icon>指标中心</el-menu-item>
          <el-menu-item index="/operations/reports"><el-icon><Document /></el-icon>经营分析报告</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="sales">
          <template #title><el-icon><Avatar /></el-icon><span>客户与销售</span></template>
          <el-menu-item index="/sales/customers"><el-icon><OfficeBuilding /></el-icon>客户管理</el-menu-item>
          <el-menu-item index="/sales/opportunities"><el-icon><Opportunity /></el-icon>商机管理</el-menu-item>
          <el-menu-item index="/sales/contracts"><el-icon><Tickets /></el-icon>合同与回款</el-menu-item>
          <el-menu-item index="/sales/analytics"><el-icon><DataAnalysis /></el-icon>销售分析</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="projects">
          <template #title><el-icon><Briefcase /></el-icon><span>项目交付</span></template>
          <el-menu-item index="/projects"><el-icon><DataBoard /></el-icon>项目总览</el-menu-item>
          <el-menu-item index="/projects/tasks"><el-icon><List /></el-icon>任务计划</el-menu-item>
          <el-menu-item index="/projects/milestones"><el-icon><Stamp /></el-icon>里程碑管理</el-menu-item>
          <el-menu-item index="/projects/resources"><el-icon><Histogram /></el-icon>项目资源</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="finance">
          <template #title><el-icon><Wallet /></el-icon><span>财务运营</span></template>
          <el-menu-item index="/finance/overview"><el-icon><DataAnalysis /></el-icon>财务概览</el-menu-item>
          <el-menu-item index="/finance/ledger"><el-icon><CreditCard /></el-icon>财务台账</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="settings">
          <template #title><el-icon><Setting /></el-icon><span>平台设置</span></template>
          <el-menu-item index="/settings/company"><el-icon><OfficeBuilding /></el-icon>企业与系统设置</el-menu-item>
          <el-menu-item index="/settings/master-data"><el-icon><Management /></el-icon>组织与基础资料</el-menu-item>
        </el-sub-menu>
      </el-menu>

      <div v-if="!appStore.sidebarCollapsed" class="module-plan">
        <div class="module-plan-title"><el-icon><CircleCheck /></el-icon>工作台服务</div>
        <div class="module-plan-items">
          <span>经营洞察</span><span>个人待办</span><span>日程协同</span><span>消息提醒</span>
        </div>
        <p>当前服务运行正常，数据更新至今日</p>
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
            <el-breadcrumb-item>{{ route.meta.group || '智慧运营' }}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="topbar-actions">
          <el-input
            v-model="searchKeyword"
            class="global-search"
            placeholder="搜索工作台消息"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>

          <el-popover v-model:visible="notificationVisible" placement="bottom-end" :width="360" trigger="click">
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
              <button v-for="item in recentNotifications" :key="item.id" type="button" class="notification-item" @click="openNotification(item)">
                <i :class="{ read: item.read }"></i>
                <div><p>{{ item.title }}</p><small>{{ item.time }}</small></div>
              </button>
            </div>
            <el-button class="notification-more" text bg @click="openMessageCenter">查看全部消息</el-button>
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
          <el-descriptions-item label="所属企业">{{ settingsStore.enterpriseProfile.name || authStore.currentUser?.companyName }}</el-descriptions-item>
          <el-descriptions-item label="登录账号">{{ authStore.currentUser?.account }}</el-descriptions-item>
          <el-descriptions-item label="账号状态"><el-tag type="success">正常</el-tag></el-descriptions-item>
        </el-descriptions>
        <div class="profile-data-actions">
          <strong>本地数据管理</strong>
          <p>清除当前浏览器中的业务修改，重新载入系统内置数据。</p>
          <el-button type="danger" plain @click="restoreInitialData">恢复初始业务数据</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>
