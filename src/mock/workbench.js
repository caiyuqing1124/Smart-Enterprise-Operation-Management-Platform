export const operationSnapshots = {
  '2026-09': {
    label: '2026 年 9 月',
    metrics: [
      { key: 'revenue', label: '本月营业收入', value: 1286, unit: '万元', change: 12.6, trend: 'up', icon: 'Money' },
      { key: 'profit', label: '综合毛利率', value: 24.8, unit: '%', change: 1.9, trend: 'up', icon: 'TrendCharts' },
      { key: 'collection', label: '合同回款率', value: 89.6, unit: '%', change: 2.4, trend: 'up', icon: 'CreditCard' },
      { key: 'projects', label: '执行中项目', value: 18, unit: '个', change: 2, trend: 'up', icon: 'Briefcase' },
      { key: 'risk', label: '待处理风险', value: 7, unit: '项', change: 3, trend: 'down', icon: 'WarningFilled' },
    ],
    trend: {
      labels: ['4 月', '5 月', '6 月', '7 月', '8 月', '9 月'],
      revenue: [865, 932, 1058, 1106, 1164, 1286],
      cost: [662, 701, 803, 842, 886, 967],
    },
    target: { annual: 18000, completed: 13248, expected: 75 },
  },
  '2026-08': {
    label: '2026 年 8 月',
    metrics: [
      { key: 'revenue', label: '本月营业收入', value: 1164, unit: '万元', change: 5.2, trend: 'up', icon: 'Money' },
      { key: 'profit', label: '综合毛利率', value: 23.9, unit: '%', change: 0.7, trend: 'up', icon: 'TrendCharts' },
      { key: 'collection', label: '合同回款率', value: 87.2, unit: '%', change: 1.1, trend: 'up', icon: 'CreditCard' },
      { key: 'projects', label: '执行中项目', value: 16, unit: '个', change: 1, trend: 'up', icon: 'Briefcase' },
      { key: 'risk', label: '待处理风险', value: 10, unit: '项', change: 2, trend: 'up', icon: 'WarningFilled' },
    ],
    trend: {
      labels: ['3 月', '4 月', '5 月', '6 月', '7 月', '8 月'],
      revenue: [798, 865, 932, 1058, 1106, 1164],
      cost: [614, 662, 701, 803, 842, 886],
    },
    target: { annual: 18000, completed: 11962, expected: 66.7 },
  },
  '2026-Q3': {
    label: '2026 年第三季度',
    metrics: [
      { key: 'revenue', label: '季度营业收入', value: 3556, unit: '万元', change: 14.3, trend: 'up', icon: 'Money' },
      { key: 'profit', label: '季度毛利率', value: 24.2, unit: '%', change: 1.4, trend: 'up', icon: 'TrendCharts' },
      { key: 'collection', label: '季度回款率', value: 88.7, unit: '%', change: 3.1, trend: 'up', icon: 'CreditCard' },
      { key: 'projects', label: '累计交付项目', value: 11, unit: '个', change: 3, trend: 'up', icon: 'Briefcase' },
      { key: 'risk', label: '季度新增风险', value: 15, unit: '项', change: 4, trend: 'down', icon: 'WarningFilled' },
    ],
    trend: {
      labels: ['2025 Q2', '2025 Q3', '2025 Q4', '2026 Q1', '2026 Q2', '2026 Q3'],
      revenue: [2580, 2865, 3150, 2986, 3110, 3556],
      cost: [2030, 2224, 2448, 2291, 2389, 2696],
    },
    target: { annual: 18000, completed: 13248, expected: 75 },
  },
}

export const departmentPerformance = [
  { id: 1, name: '华东事业部', owner: '周明远', target: 4200, actual: 3568, completion: 85, status: '领先' },
  { id: 2, name: '智能制造事业部', owner: '赵思齐', target: 3800, actual: 2964, completion: 78, status: '正常' },
  { id: 3, name: '数字服务事业部', owner: '陈雨桐', target: 3200, actual: 2275, completion: 71, status: '关注' },
  { id: 4, name: '供应链事业部', owner: '韩志鹏', target: 2600, actual: 1955, completion: 75, status: '正常' },
]

export const projectHealth = [
  { id: 1, name: '华辰装备数字工厂一期', customer: '华辰重工集团', manager: '林嘉航', progress: 76, budgetRate: 68, health: '正常', deadline: '2026-11-18' },
  { id: 2, name: '新能源供应链协同平台', customer: '远景新能源科技', manager: '顾清扬', progress: 58, budgetRate: 71, health: '成本关注', deadline: '2026-12-26' },
  { id: 3, name: '区域运营数据中台', customer: '东海产业发展集团', manager: '宋知行', progress: 83, budgetRate: 79, health: '进度关注', deadline: '2026-10-15' },
  { id: 4, name: '智能仓储升级项目', customer: '恒通物流股份', manager: '许文博', progress: 92, budgetRate: 88, health: '正常', deadline: '2026-09-28' },
]

export const salesFunnel = [
  { stage: '需求确认', count: 38, amount: 2860, rate: 100 },
  { stage: '方案沟通', count: 26, amount: 2180, rate: 76 },
  { stage: '商务谈判', count: 17, amount: 1560, rate: 55 },
  { stage: '合同审批', count: 9, amount: 920, rate: 32 },
]

export const operationRisks = [
  { id: 1, level: '高', title: '区域运营数据中台交付节点临近', source: '项目交付', owner: '宋知行', deadline: '09-12', detail: '数据治理验收项仍有 6 项待关闭，可能影响阶段验收。' },
  { id: 2, level: '高', title: '远景新能源二期回款逾期', source: '合同回款', owner: '唐若川', deadline: '09-10', detail: '第二期回款 86 万元已逾期 12 天，销售与财务正在联合跟进。' },
  { id: 3, level: '中', title: '智能制造事业部资源负载偏高', source: '组织效能', owner: '赵思齐', deadline: '09-16', detail: '解决方案团队未来两周平均负载达到 92%，需调整跨项目排期。' },
  { id: 4, level: '中', title: '核心设备采购交期存在波动', source: '采购供应', owner: '韩志鹏', deadline: '09-20', detail: '两类核心设备供应商交付周期延长，已制定替代采购方案。' },
]

export const personalTasks = [
  { id: 1, title: '确认第三季度经营复盘材料', source: '经营管理', priority: '高', deadline: '今天 17:00', status: 'pending', owner: '我' },
  { id: 2, title: '审核华辰装备项目变更申请', source: '项目交付', priority: '高', deadline: '今天 18:30', status: 'pending', owner: '我' },
  { id: 3, title: '更新重点客户回款跟进记录', source: '客户销售', priority: '中', deadline: '明天 12:00', status: 'pending', owner: '我' },
  { id: 4, title: '提交九月部门费用预测', source: '财务运营', priority: '中', deadline: '09-10 16:00', status: 'pending', owner: '我' },
  { id: 5, title: '完成管理例会纪要确认', source: '组织协同', priority: '低', deadline: '09-11 10:00', status: 'completed', owner: '我' },
]

export const personalSchedules = [
  { id: 1, time: '09:00', title: '周度经营例会', location: '第一会议室', type: '会议' },
  { id: 2, time: '11:00', title: '重点项目进度沟通', location: '线上会议', type: '项目' },
  { id: 3, time: '14:30', title: '客户回款专项会', location: '第三会议室', type: '经营' },
  { id: 4, time: '16:30', title: '部门一对一沟通', location: '运营办公室', type: '沟通' },
]

export const personalApprovals = [
  { id: 1, title: '设备采购申请', applicant: '王宁', department: '项目交付中心', amount: 128600, submittedAt: '09-07 09:18', status: 'pending' },
  { id: 2, title: '客户接待费用报销', applicant: '李梓涵', department: '华东事业部', amount: 4860, submittedAt: '09-07 08:42', status: 'pending' },
  { id: 3, title: '项目工期变更申请', applicant: '宋知行', department: '数字服务事业部', amount: 0, submittedAt: '09-06 17:36', status: 'pending' },
]

export const initialNotifications = [
  { id: 101, type: 'risk', typeName: '风险预警', title: '远景新能源二期回款已逾期 12 天', content: '合同 HT-2026-031 第二期回款 86 万元尚未到账，请关注客户沟通进展和预计回款日期。', source: '合同回款', time: '10 分钟前', date: '2026-09-07 14:12', priority: '高', read: false, target: '/workbench/operations' },
  { id: 102, type: 'approval', typeName: '审批通知', title: '设备采购申请等待处理', content: '王宁提交了设备采购申请，申请金额 128,600 元，当前节点为运营负责人审批。', source: '审批中心', time: '35 分钟前', date: '2026-09-07 13:47', priority: '高', read: false, target: '/workbench/personal' },
  { id: 103, type: 'task', typeName: '任务提醒', title: '经营复盘材料将在今天到期', content: '任务“确认第三季度经营复盘材料”将在今天 17:00 到期，请及时完成。', source: '我的任务', time: '1 小时前', date: '2026-09-07 13:02', priority: '中', read: false, target: '/workbench/personal' },
  { id: 104, type: 'operation', typeName: '经营动态', title: '九月营业收入完成率达到 71%', content: '截至当前，九月营业收入完成 1,286 万元，月度目标完成率达到 71%，较上月同期提升 6.2 个百分点。', source: '经营工作台', time: '2 小时前', date: '2026-09-07 12:18', priority: '普通', read: false, target: '/workbench/operations' },
  { id: 105, type: 'project', typeName: '项目动态', title: '智能仓储升级项目进入验收准备', content: '项目整体进度达到 92%，交付团队已提交验收资料清单，计划于 9 月 18 日组织内部预验收。', source: '项目交付', time: '今天 10:26', date: '2026-09-07 10:26', priority: '普通', read: true, target: '/workbench/operations' },
  { id: 106, type: 'approval', typeName: '审批通知', title: '差旅费用申请已审批通过', content: '您于 9 月 5 日提交的华东区域客户拜访差旅申请已完成全部审批。', source: '审批中心', time: '今天 09:35', date: '2026-09-07 09:35', priority: '普通', read: true, target: '/workbench/personal' },
  { id: 107, type: 'risk', typeName: '风险预警', title: '解决方案团队两周负载达到 92%', content: '智能制造事业部解决方案团队存在资源冲突，建议协调项目排期或补充交付资源。', source: '组织效能', time: '昨天 17:45', date: '2026-09-06 17:45', priority: '中', read: false, target: '/workbench/operations' },
  { id: 108, type: 'system', typeName: '系统通知', title: '账号安全设置已启用', content: '当前账号已启用登录状态保护。请妥善保管登录密码，定期检查账号信息。', source: '系统管理', time: '昨天 15:20', date: '2026-09-06 15:20', priority: '普通', read: true, target: '/workbench/personal' },
  { id: 109, type: 'task', typeName: '任务提醒', title: '重点客户回款记录需要更新', content: '本周仍有 3 家重点客户尚未更新跟进结果，请在明天中午前完成。', source: '我的任务', time: '昨天 11:08', date: '2026-09-06 11:08', priority: '中', read: false, target: '/workbench/personal' },
  { id: 110, type: 'operation', typeName: '经营动态', title: '华东事业部年度目标完成率领先', content: '华东事业部年度收入目标完成率达到 85%，当前位列各业务单元第一。', source: '经营工作台', time: '09-05 16:40', date: '2026-09-05 16:40', priority: '普通', read: true, target: '/workbench/operations' },
]

export const messageCategories = [
  { key: 'all', label: '全部消息', icon: 'ChatDotRound' },
  { key: 'approval', label: '审批通知', icon: 'Checked' },
  { key: 'task', label: '任务提醒', icon: 'List' },
  { key: 'risk', label: '风险预警', icon: 'Warning' },
  { key: 'operation', label: '经营动态', icon: 'TrendCharts' },
  { key: 'project', label: '项目动态', icon: 'Briefcase' },
  { key: 'system', label: '系统通知', icon: 'Setting' },
]
