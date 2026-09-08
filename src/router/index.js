import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/auth/LoginView.vue'),
    meta: { public: true, title: '登录' },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/auth/RegisterView.vue'),
    meta: { public: true, title: '企业注册' },
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('../views/auth/ForgotPasswordView.vue'),
    meta: { public: true, title: '找回密码' },
  },
  {
    path: '/',
    component: () => import('../layouts/AppLayout.vue'),
    children: [
      {
        path: '',
        redirect: '/workbench/operations',
      },
      {
        path: 'workbench/operations',
        name: 'operations-workbench',
        component: () => import('../views/workbench/OperationsWorkbench.vue'),
        meta: { title: '经营工作台', group: '统一工作台' },
      },
      {
        path: 'workbench/personal',
        name: 'personal-workbench',
        component: () => import('../views/workbench/PersonalWorkbench.vue'),
        meta: { title: '我的工作台', group: '统一工作台' },
      },
      {
        path: 'workbench/messages',
        name: 'message-center',
        component: () => import('../views/workbench/MessageCenter.vue'),
        meta: { title: '消息中心', group: '统一工作台' },
      },
      {
        path: 'operations/cockpit',
        name: 'operations-cockpit',
        component: () => import('../views/operations/OperationsCockpit.vue'),
        meta: { title: '经营驾驶舱', group: '经营管理' },
      },
      {
        path: 'operations/goals',
        name: 'operations-goals',
        component: () => import('../views/operations/BusinessGoals.vue'),
        meta: { title: '经营目标', group: '经营管理' },
      },
      {
        path: 'operations/indicators',
        name: 'operations-indicators',
        component: () => import('../views/operations/IndicatorCenter.vue'),
        meta: { title: '指标中心', group: '经营管理' },
      },
      {
        path: 'operations/reports',
        name: 'operations-reports',
        component: () => import('../views/operations/BusinessReport.vue'),
        meta: { title: '经营分析报告', group: '经营管理' },
      },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  document.title = `${to.meta.title || '工作台'} - 智慧企业运营管理平台`
  const session = localStorage.getItem('smart-ops-session') || sessionStorage.getItem('smart-ops-session')

  if (!to.meta.public && !session) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.public && session && ['login', 'register', 'forgot-password'].includes(to.name)) {
    return { name: 'operations-workbench' }
  }
  return true
})

export default router
