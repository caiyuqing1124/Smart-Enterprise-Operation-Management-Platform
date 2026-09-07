<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { workspaceSummary } from '../../mock/auth'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const activeScope = ref('企业全局')
const today = new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }).format(new Date())
const firstName = computed(() => authStore.currentUser?.name || '管理员')

function refreshWorkspace() {
  ElMessage.success('工作台状态已更新')
}

function showRoadmap(name) {
  ElMessage.info(`${name}将在后续阶段接入，本阶段已完成承载框架`)
}
</script>

<template>
  <div class="home-page">
    <header class="page-heading">
      <div>
        <div class="eyebrow">{{ today }}</div>
        <h1>{{ firstName }}，欢迎回来</h1>
        <p>{{ authStore.currentUser?.companyName }}的数字化运营工作空间</p>
      </div>
      <div class="heading-actions">
        <el-select v-model="activeScope" style="width: 140px">
          <el-option label="企业全局" value="企业全局" />
          <el-option label="管理视角" value="管理视角" />
          <el-option label="个人视角" value="个人视角" />
        </el-select>
        <el-button type="primary" @click="refreshWorkspace"><el-icon><Refresh /></el-icon>刷新状态</el-button>
      </div>
    </header>

    <section class="welcome-banner">
      <div class="banner-copy">
        <span class="banner-tag">基础能力中心</span>
        <h2>{{ workspaceSummary.welcomeTitle }}</h2>
        <p>{{ workspaceSummary.welcomeDescription }}</p>
        <div class="banner-meta"><span><el-icon><CircleCheckFilled /></el-icon>前端工程可运行</span><span><el-icon><CircleCheckFilled /></el-icon>账号数据本地保存</span></div>
      </div>
      <div class="banner-graphic">
        <div class="orbit orbit-one"></div><div class="orbit orbit-two"></div>
        <div class="graphic-core"><el-icon><DataAnalysis /></el-icon></div>
      </div>
    </section>

    <div class="home-grid">
      <section class="content-panel readiness-panel">
        <div class="panel-heading"><div><h3>系统就绪状态</h3><p>{{ workspaceSummary.period }} · 第一阶段</p></div><el-tag type="success" effect="light">运行正常</el-tag></div>
        <div class="readiness-list">
          <div v-for="item in workspaceSummary.readiness" :key="item.label" class="readiness-item">
            <div class="readiness-info"><span>{{ item.label }}</span><strong>{{ item.value }}%</strong></div>
            <el-progress :percentage="item.value" :status="item.status === 'success' ? 'success' : undefined" :show-text="false" />
          </div>
        </div>
      </section>

      <section class="content-panel access-panel">
        <div class="panel-heading"><div><h3>快捷入口</h3><p>查看后续业务能力规划</p></div></div>
        <div class="capability-grid">
          <button v-for="item in workspaceSummary.capabilities" :key="item.title" type="button" class="capability-item" @click="showRoadmap(item.title)">
            <span class="capability-icon" :style="{ backgroundColor: `${item.color}16`, color: item.color }"><el-icon><component :is="item.icon" /></el-icon></span>
            <span><strong>{{ item.title }}</strong><small>{{ item.description }}</small></span>
            <el-icon class="capability-arrow"><ArrowRight /></el-icon>
          </button>
        </div>
      </section>
    </div>

    <section class="content-panel architecture-panel">
      <div class="panel-heading"><div><h3>平台基础架构</h3><p>当前已具备的前端运行能力</p></div></div>
      <div class="architecture-flow">
        <div class="flow-node"><span>01</span><strong>访问入口</strong><small>登录 · 注册 · 找回密码</small></div>
        <el-icon><Right /></el-icon>
        <div class="flow-node"><span>02</span><strong>身份与状态</strong><small>Pinia · 路由守卫 · 本地存储</small></div>
        <el-icon><Right /></el-icon>
        <div class="flow-node"><span>03</span><strong>系统框架</strong><small>侧边导航 · 顶部工具栏 · 内容区</small></div>
        <el-icon><Right /></el-icon>
        <div class="flow-node highlighted"><span>04</span><strong>业务扩展</strong><small>按阶段接入运营管理能力</small></div>
      </div>
    </section>
  </div>
</template>
