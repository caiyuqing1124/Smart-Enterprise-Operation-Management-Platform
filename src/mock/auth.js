export const industryOptions = [
  '装备制造',
  '电子信息',
  '新能源',
  '现代服务',
  '建筑工程',
  '商贸流通',
]

export const organizationScaleOptions = [
  '50 人以下',
  '50—199 人',
  '200—499 人',
  '500—999 人',
  '1000 人以上',
]

export const workspaceSummary = {
  period: '2026 年 9 月',
  welcomeTitle: '企业运营工作台已就绪',
  welcomeDescription: '基础架构、账号体系和全局导航已完成，可继续接入经营、销售、项目、财务等业务模块。',
  readiness: [
    { label: '账号体系', value: 100, status: 'success' },
    { label: '路由与权限', value: 100, status: 'success' },
    { label: '整体布局', value: 100, status: 'success' },
    { label: '业务模块', value: 0, status: 'primary' },
  ],
  capabilities: [
    { title: '经营管理', description: '目标、指标和经营分析', icon: 'TrendCharts', color: '#246bfd' },
    { title: '客户与销售', description: '客户、商机、合同和回款', icon: 'UserFilled', color: '#7c5cff' },
    { title: '项目交付', description: '项目、任务和里程碑协同', icon: 'Briefcase', color: '#00a58e' },
    { title: '财务运营', description: '预算、收支和应收应付', icon: 'WalletFilled', color: '#f59e0b' },
  ],
}
