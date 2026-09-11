import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'

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
      { path: 'sales/customers', name: 'sales-customers', component: () => import('../views/sales/CustomerList.vue'), meta: { title: '客户管理', group: '客户与销售' } },
      { path: 'sales/customers/:id', name: 'sales-customer-detail', component: () => import('../views/sales/CustomerDetail.vue'), meta: { title: '客户详情', group: '客户与销售' } },
      { path: 'sales/opportunities', name: 'sales-opportunities', component: () => import('../views/sales/OpportunityBoard.vue'), meta: { title: '商机管理', group: '客户与销售' } },
      { path: 'sales/contracts', name: 'sales-contracts', component: () => import('../views/sales/ContractManagement.vue'), meta: { title: '合同与回款', group: '客户与销售' } },
      { path: 'sales/analytics', name: 'sales-analytics', component: () => import('../views/sales/SalesAnalytics.vue'), meta: { title: '销售分析', group: '客户与销售' } },
      { path: 'projects', name: 'project-overview', component: () => import('../views/projects/ProjectOverview.vue'), meta: { title: '项目总览', group: '项目交付' } },
      { path: 'projects/tasks', name: 'project-tasks', component: () => import('../views/projects/TaskPlan.vue'), meta: { title: '任务计划', group: '项目交付' } },
      { path: 'projects/milestones', name: 'project-milestones', component: () => import('../views/projects/MilestoneManagement.vue'), meta: { title: '里程碑管理', group: '项目交付' } },
      { path: 'projects/resources', name: 'project-resources', component: () => import('../views/projects/ProjectResources.vue'), meta: { title: '项目资源', group: '项目交付' } },
      { path: 'projects/:id', name: 'project-detail', component: () => import('../views/projects/ProjectDetail.vue'), meta: { title: '项目详情', group: '项目交付' } },
      { path: 'finance/overview', name: 'finance-overview', component: () => import('../views/finance/FinanceOverview.vue'), meta: { title: '财务概览', group: '财务运营' } },
      { path: 'finance/ledger', name: 'finance-ledger', component: () => import('../views/finance/FinanceLedger.vue'), meta: { title: '财务台账', group: '财务运营' } },
      { path: 'settings/company', name: 'settings-company', component: () => import('../views/settings/CompanySettings.vue'), meta: { title: '企业与系统设置', group: '平台设置' } },
      { path: 'settings/master-data', name: 'settings-master-data', component: () => import('../views/settings/MasterDataSettings.vue'), meta: { title: '组织与基础资料', group: '平台设置' } },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: import.meta.env.VITE_ROUTER_MODE === 'hash'
    ? createWebHashHistory(import.meta.env.BASE_URL)
    : createWebHistory(import.meta.env.BASE_URL),
  routes,
})

async function hydrateRouteStores(path) {
  const appModule = await import('../stores/app')
  const settingsModule = await import('../stores/settings')
  const pending = [appModule.useAppStore().hydrate(), settingsModule.useSettingsStore().hydrate()]

  if (path.startsWith('/workbench/')) {
    const [workbenchModule, projectModule, salesModule, financeModule] = await Promise.all([
      import('../stores/workbench'), import('../stores/projects'), import('../stores/sales'), import('../stores/finance'),
    ])
    pending.push(
      workbenchModule.useWorkbenchStore().hydrate(),
      projectModule.useProjectStore().hydrate(),
      salesModule.useSalesStore().hydrate(),
      financeModule.useFinanceStore().hydrate(),
    )
  } else if (path.startsWith('/operations/')) {
    const [operationsModule, projectModule, salesModule, financeModule] = await Promise.all([
      import('../stores/operations'), import('../stores/projects'), import('../stores/sales'), import('../stores/finance'),
    ])
    pending.push(
      operationsModule.useOperationsStore().hydrate(),
      projectModule.useProjectStore().hydrate(),
      salesModule.useSalesStore().hydrate(),
      financeModule.useFinanceStore().hydrate(),
    )
  } else if (path.startsWith('/sales/')) {
    const module = await import('../stores/sales')
    pending.push(module.useSalesStore().hydrate())
    const projectModule = await import('../stores/projects')
    pending.push(projectModule.useProjectStore().hydrate())
  } else if (path.startsWith('/projects')) {
    const [projectModule, salesModule] = await Promise.all([import('../stores/projects'), import('../stores/sales')])
    pending.push(projectModule.useProjectStore().hydrate(), salesModule.useSalesStore().hydrate())
  } else if (path.startsWith('/finance/')) {
    const [financeModule, projectModule, salesModule] = await Promise.all([import('../stores/finance'), import('../stores/projects'), import('../stores/sales')])
    pending.push(financeModule.useFinanceStore().hydrate(), projectModule.useProjectStore().hydrate(), salesModule.useSalesStore().hydrate())
  } else if (path.startsWith('/settings/')) {
    if (path === '/settings/master-data') {
      const [projectModule, salesModule] = await Promise.all([import('../stores/projects'), import('../stores/sales')])
      pending.push(projectModule.useProjectStore().hydrate(), salesModule.useSalesStore().hydrate())
    }
  }

  await Promise.all(pending)
}

router.beforeEach(async (to) => {
  document.title = `${to.meta.title || '工作台'} - 智慧企业运营管理平台`
  const session = localStorage.getItem('smart-ops-session') || sessionStorage.getItem('smart-ops-session')

  if (!to.meta.public && !session) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.public && session && ['login', 'register', 'forgot-password'].includes(to.name)) {
    return { name: 'operations-workbench' }
  }
  if (!to.meta.public) {
    await hydrateRouteStores(to.path)
    const settingsModule = await import('../stores/settings')
    document.title = `${to.meta.title || '工作台'} - ${settingsModule.useSettingsStore().systemPreferences.systemName}`
  }
  return true
})

export default router
