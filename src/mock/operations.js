export {
  operationSnapshots,
  departmentPerformance,
  projectHealth,
  salesFunnel,
  operationRisks,
} from './workbench'

export const regionPerformance = [
  { name: '华东区域', revenue: 4860, growth: 18.6, share: 36.7, targetRate: 86 },
  { name: '华南区域', revenue: 3215, growth: 12.4, share: 24.3, targetRate: 79 },
  { name: '华北区域', revenue: 2786, growth: 8.9, share: 21, targetRate: 74 },
  { name: '西部区域', revenue: 1587, growth: 15.2, share: 12, targetRate: 71 },
  { name: '海外业务', revenue: 800, growth: 23.8, share: 6, targetRate: 68 },
]

export const industryContribution = [
  { name: '装备制造', value: 3860, percent: 29.1 },
  { name: '新能源', value: 3145, percent: 23.7 },
  { name: '电子信息', value: 2478, percent: 18.7 },
  { name: '现代服务', value: 2135, percent: 16.1 },
  { name: '其他行业', value: 1630, percent: 12.4 },
]

export const efficiencyMetrics = [
  { label: '人均产值', value: '42.6', unit: '万元', change: '+8.7%' },
  { label: '费用收入比', value: '13.8', unit: '%', change: '-1.2%' },
  { label: '项目按期率', value: '91.4', unit: '%', change: '+3.6%' },
  { label: '客户续约率', value: '84.2', unit: '%', change: '+2.1%' },
]

export const initialGoals = [
  {
    id: 100,
    name: '2026 年度营业收入目标',
    level: '企业',
    cycle: '2026 年度',
    department: '集团总部',
    owner: '周明远',
    target: 18000,
    actual: 13248,
    unit: '万元',
    weight: 35,
    status: '进行中',
    updatedAt: '2026-09-07',
    children: [
      { id: 101, parentId: 100, name: '华东区域收入目标', level: '部门', cycle: '2026 年度', department: '华东事业部', owner: '周明远', target: 4200, actual: 3568, unit: '万元', weight: 30, status: '领先', updatedAt: '2026-09-07' },
      { id: 102, parentId: 100, name: '智能制造业务收入目标', level: '部门', cycle: '2026 年度', department: '智能制造事业部', owner: '赵思齐', target: 3800, actual: 2964, unit: '万元', weight: 25, status: '进行中', updatedAt: '2026-09-06' },
      { id: 103, parentId: 100, name: '数字服务业务收入目标', level: '部门', cycle: '2026 年度', department: '数字服务事业部', owner: '陈雨桐', target: 3200, actual: 2275, unit: '万元', weight: 25, status: '关注', updatedAt: '2026-09-06' },
      { id: 104, parentId: 100, name: '供应链业务收入目标', level: '部门', cycle: '2026 年度', department: '供应链事业部', owner: '韩志鹏', target: 2600, actual: 1955, unit: '万元', weight: 20, status: '进行中', updatedAt: '2026-09-05' },
    ],
  },
  {
    id: 200,
    name: '年度合同回款率',
    level: '企业',
    cycle: '2026 年度',
    department: '集团总部',
    owner: '唐若川',
    target: 92,
    actual: 89.6,
    unit: '%',
    weight: 25,
    status: '关注',
    updatedAt: '2026-09-07',
    children: [
      { id: 201, parentId: 200, name: '重点客户到期回款率', level: '部门', cycle: '2026 年度', department: '销售管理中心', owner: '唐若川', target: 95, actual: 91.2, unit: '%', weight: 60, status: '关注', updatedAt: '2026-09-07' },
      { id: 202, parentId: 200, name: '项目验收款回款率', level: '部门', cycle: '2026 年度', department: '项目交付中心', owner: '林嘉航', target: 90, actual: 88.5, unit: '%', weight: 40, status: '进行中', updatedAt: '2026-09-06' },
    ],
  },
  { id: 300, name: '项目按期交付率', level: '企业', cycle: '2026 年度', department: '项目交付中心', owner: '林嘉航', target: 95, actual: 91.4, unit: '%', weight: 20, status: '关注', updatedAt: '2026-09-07' },
  { id: 400, name: '重点客户续约率', level: '企业', cycle: '2026 年度', department: '销售管理中心', owner: '唐若川', target: 85, actual: 84.2, unit: '%', weight: 20, status: '进行中', updatedAt: '2026-09-05' },
]

export const indicatorCategories = [
  { id: 'all', name: '全部指标', icon: 'DataLine' },
  { id: 'finance', name: '财务经营', icon: 'Wallet' },
  { id: 'sales', name: '客户销售', icon: 'UserFilled' },
  { id: 'delivery', name: '项目交付', icon: 'Briefcase' },
  { id: 'efficiency', name: '组织效能', icon: 'Histogram' },
]

export const initialIndicators = [
  { id: 1, code: 'FIN-REV-001', name: '营业收入', category: 'finance', categoryName: '财务经营', definition: '统计周期内企业已确认的主营业务收入总额。', unit: '万元', current: 13248, target: 18000, warning: 70, frequency: '每日', owner: '财务管理中心', enabled: true, subscribed: true, trend: [7980, 8845, 9777, 10835, 11962, 13248] },
  { id: 2, code: 'FIN-GPM-002', name: '综合毛利率', category: 'finance', categoryName: '财务经营', definition: '营业收入减营业成本后占营业收入的比例。', unit: '%', current: 24.8, target: 25, warning: 22, frequency: '每周', owner: '财务管理中心', enabled: true, subscribed: true, trend: [22.6, 23.1, 23.5, 23.2, 23.9, 24.8] },
  { id: 3, code: 'SAL-COL-001', name: '合同回款率', category: 'sales', categoryName: '客户销售', definition: '统计期内实际回款金额占计划回款金额的比例。', unit: '%', current: 89.6, target: 92, warning: 85, frequency: '每日', owner: '销售管理中心', enabled: true, subscribed: true, trend: [84.1, 85.6, 86.2, 85.9, 87.2, 89.6] },
  { id: 4, code: 'SAL-WIN-002', name: '商机赢单率', category: 'sales', categoryName: '客户销售', definition: '已赢单商机数量占已关闭商机总数的比例。', unit: '%', current: 36.8, target: 40, warning: 32, frequency: '每周', owner: '销售管理中心', enabled: true, subscribed: false, trend: [31.5, 32.8, 34.2, 35.1, 35.9, 36.8] },
  { id: 5, code: 'PRJ-OTD-001', name: '项目按期交付率', category: 'delivery', categoryName: '项目交付', definition: '在计划日期内完成验收的项目占已交付项目总数的比例。', unit: '%', current: 91.4, target: 95, warning: 88, frequency: '每周', owner: '项目交付中心', enabled: true, subscribed: true, trend: [87.2, 88.1, 89.6, 90.2, 90.8, 91.4] },
  { id: 6, code: 'PRJ-CST-002', name: '项目成本偏差率', category: 'delivery', categoryName: '项目交付', definition: '项目实际成本与计划成本的差异比例。', unit: '%', current: 3.6, target: 3, warning: 5, frequency: '每周', owner: '项目交付中心', enabled: true, subscribed: false, trend: [4.8, 4.5, 4.2, 4.0, 3.8, 3.6] },
  { id: 7, code: 'EFF-REV-001', name: '人均产值', category: 'efficiency', categoryName: '组织效能', definition: '营业收入与统计周期平均在岗人数的比值。', unit: '万元', current: 42.6, target: 45, warning: 38, frequency: '每月', owner: '人力资源中心', enabled: true, subscribed: false, trend: [36.8, 37.9, 39.5, 40.2, 41.3, 42.6] },
  { id: 8, code: 'EFF-LOAD-002', name: '人员平均负载率', category: 'efficiency', categoryName: '组织效能', definition: '已分配项目工时占可用工时的比例。', unit: '%', current: 82.5, target: 80, warning: 90, frequency: '每日', owner: '人力资源中心', enabled: false, subscribed: false, trend: [76.2, 78.1, 79.6, 81.3, 83.2, 82.5] },
]

export const reportPeriods = [
  { value: '2026-09', label: '2026 年 9 月经营分析' },
  { value: '2026-08', label: '2026 年 8 月经营分析' },
  { value: '2026-Q3', label: '2026 年第三季度经营分析' },
]

export const initialReports = {
  '2026-09': {
    title: '2026 年 9 月经营分析报告',
    code: 'OPS-2026-09',
    preparedBy: '企业运营管理中心',
    preparedAt: '2026-09-08',
    conclusion: '本月企业经营保持稳健增长，营业收入和综合毛利率均较上月提升。华东事业部继续保持领先，新能源行业客户贡献增长明显。合同回款率仍低于年度目标，需重点推进逾期款项处置。',
    highlights: ['营业收入 1,286 万元，环比增长 10.5%', '综合毛利率提升至 24.8%', '智能仓储升级项目进入验收准备', '新增重点商机金额 920 万元'],
    issues: [
      { level: '高', title: '逾期应收仍需压降', description: '逾期应收合计 72 万元，其中远景新能源二期款项占比较高。', owner: '唐若川' },
      { level: '中', title: '交付团队资源负载偏高', description: '解决方案团队未来两周平均负载达到 92%，存在排期冲突。', owner: '赵思齐' },
    ],
    actions: [
      { id: 1, action: '完成远景新能源逾期款专项沟通', owner: '唐若川', department: '销售管理中心', deadline: '2026-09-12', status: '进行中' },
      { id: 2, action: '调整解决方案团队跨项目资源排期', owner: '赵思齐', department: '智能制造事业部', deadline: '2026-09-15', status: '进行中' },
      { id: 3, action: '完成智能仓储项目内部预验收', owner: '林嘉航', department: '项目交付中心', deadline: '2026-09-18', status: '未开始' },
    ],
  },
  '2026-08': {
    title: '2026 年 8 月经营分析报告', code: 'OPS-2026-08', preparedBy: '企业运营管理中心', preparedAt: '2026-09-02',
    conclusion: '八月营业收入保持增长，项目交付节奏总体平稳。销售转化效率有所改善，但部分重点客户回款周期拉长，需要加强合同节点管理。',
    highlights: ['营业收入 1,164 万元', '新增签约合同 8 项', '完成项目验收 3 项'],
    issues: [{ level: '中', title: '重点客户回款周期延长', description: '平均回款周期较上月增加 4.2 天。', owner: '唐若川' }],
    actions: [{ id: 11, action: '梳理九月重点回款计划', owner: '唐若川', department: '销售管理中心', deadline: '2026-09-05', status: '已完成' }],
  },
  '2026-Q3': {
    title: '2026 年第三季度经营分析报告', code: 'OPS-2026-Q3', preparedBy: '企业运营管理中心', preparedAt: '2026-09-08',
    conclusion: '第三季度经营质量持续改善，收入规模、毛利水平和项目交付效率同步提升。区域发展仍不均衡，西部及海外业务需要加强重点客户拓展。',
    highlights: ['季度营业收入 3,556 万元', '季度综合毛利率 24.2%', '累计交付项目 11 个'],
    issues: [{ level: '中', title: '区域贡献差异较大', description: '华东区域贡献超过三分之一，西部及海外业务占比仍然较低。', owner: '周明远' }],
    actions: [{ id: 21, action: '制定第四季度区域增长专项方案', owner: '周明远', department: '企业运营管理中心', deadline: '2026-09-25', status: '未开始' }],
  },
}
