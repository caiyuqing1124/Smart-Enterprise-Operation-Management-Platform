export const customerLevels = ['战略客户', '重点客户', '普通客户', '潜在客户']
export const customerIndustries = ['装备制造', '新能源', '电子信息', '现代服务', '物流运输']
export const salesOwners = ['唐若川', '李梓涵', '沈知夏', '顾承宇', '叶青禾']

export const initialCustomers = [
  { id: 1, code: 'KH-2026-001', name: '华辰重工集团', shortName: '华辰重工', industry: '装备制造', region: '华东', level: '战略客户', owner: '唐若川', status: '合作中', contractAmount: 586, paidAmount: 398, lastFollowUp: '2026-09-07', address: '上海市浦东新区张江路 268 号', scale: '1000 人以上', source: '行业峰会', tags: ['数字工厂', '重点维护'], credit: '良好', createdAt: '2025-03-18' },
  { id: 2, code: 'KH-2026-002', name: '远景新能源科技有限公司', shortName: '远景新能源', industry: '新能源', region: '华南', level: '战略客户', owner: '李梓涵', status: '合作中', contractAmount: 468, paidAmount: 286, lastFollowUp: '2026-09-06', address: '深圳市南山区科技园南区 16 号', scale: '500—999 人', source: '客户转介绍', tags: ['供应链', '回款关注'], credit: '关注', createdAt: '2025-06-09' },
  { id: 3, code: 'KH-2026-003', name: '东海产业发展集团', shortName: '东海产发', industry: '现代服务', region: '华东', level: '重点客户', owner: '沈知夏', status: '合作中', contractAmount: 356, paidAmount: 252, lastFollowUp: '2026-09-05', address: '杭州市滨江区江南大道 588 号', scale: '1000 人以上', source: '市场活动', tags: ['数据治理'], credit: '良好', createdAt: '2025-09-22' },
  { id: 4, code: 'KH-2026-004', name: '恒通物流股份有限公司', shortName: '恒通物流', industry: '物流运输', region: '华北', level: '重点客户', owner: '顾承宇', status: '合作中', contractAmount: 298, paidAmount: 238, lastFollowUp: '2026-09-07', address: '天津市滨海新区港城大道 118 号', scale: '500—999 人', source: '主动开发', tags: ['智能仓储'], credit: '良好', createdAt: '2025-11-16' },
  { id: 5, code: 'KH-2026-005', name: '启明电子信息技术有限公司', shortName: '启明电子', industry: '电子信息', region: '华南', level: '普通客户', owner: '叶青禾', status: '意向', contractAmount: 0, paidAmount: 0, lastFollowUp: '2026-09-04', address: '广州市黄埔区科学大道 80 号', scale: '200—499 人', source: '官网咨询', tags: ['潜力客户'], credit: '待评估', createdAt: '2026-07-03' },
  { id: 6, code: 'KH-2026-006', name: '北辰精密装备有限公司', shortName: '北辰精密', industry: '装备制造', region: '华北', level: '潜在客户', owner: '唐若川', status: '意向', contractAmount: 0, paidAmount: 0, lastFollowUp: '2026-09-02', address: '北京市大兴区科创十二街 32 号', scale: '200—499 人', source: '合作伙伴', tags: ['设备互联'], credit: '待评估', createdAt: '2026-08-12' },
  { id: 7, code: 'KH-2026-007', name: '西岭智造科技有限公司', shortName: '西岭智造', industry: '装备制造', region: '西部', level: '普通客户', owner: '沈知夏', status: '沉默', contractAmount: 126, paidAmount: 126, lastFollowUp: '2026-06-18', address: '成都市高新区天府五街 168 号', scale: '50—199 人', source: '行业协会', tags: ['重新激活'], credit: '良好', createdAt: '2024-12-05' },
  { id: 8, code: 'KH-2026-008', name: '融海现代服务集团', shortName: '融海服务', industry: '现代服务', region: '华东', level: '重点客户', owner: '顾承宇', status: '合作中', contractAmount: 215, paidAmount: 142, lastFollowUp: '2026-09-01', address: '苏州市工业园区星湖街 328 号', scale: '500—999 人', source: '客户转介绍', tags: ['运营协同'], credit: '良好', createdAt: '2026-01-20' },
]

export const initialContacts = [
  { id: 1, customerId: 1, name: '周启航', position: '信息化总监', mobile: '138****6208', email: 'zhouqh@huachen.cn', role: '决策人', primary: true },
  { id: 2, customerId: 1, name: '许文静', position: '项目办公室主任', mobile: '136****4195', email: 'xuwj@huachen.cn', role: '使用人', primary: false },
  { id: 3, customerId: 2, name: '林思远', position: '供应链副总裁', mobile: '139****8821', email: 'linsy@vision-energy.cn', role: '决策人', primary: true },
  { id: 4, customerId: 3, name: '方致远', position: '数字化平台主管', mobile: '137****3566', email: 'fangzy@donghai.cn', role: '影响人', primary: true },
  { id: 5, customerId: 4, name: '吴晨曦', position: '仓储运营总监', mobile: '135****2190', email: 'wucx@hengtong.cn', role: '决策人', primary: true },
]

export const initialFollowUps = [
  { id: 1, customerId: 1, type: '会议', content: '确认一期验收计划及二期扩展需求，客户希望增加设备能耗分析能力。', owner: '唐若川', date: '2026-09-07 15:30', nextDate: '2026-09-12' },
  { id: 2, customerId: 1, type: '电话', content: '沟通项目阶段付款安排，客户财务流程已进入复核。', owner: '唐若川', date: '2026-09-03 10:20', nextDate: '2026-09-09' },
  { id: 3, customerId: 2, type: '拜访', content: '就供应链协同平台二期范围进行现场交流，确认三个新增业务场景。', owner: '李梓涵', date: '2026-09-06 16:00', nextDate: '2026-09-10' },
  { id: 4, customerId: 3, type: '邮件', content: '发送数据中台阶段验收材料和整改事项清单。', owner: '沈知夏', date: '2026-09-05 11:45', nextDate: '2026-09-11' },
  { id: 5, customerId: 4, type: '会议', content: '完成智能仓储项目内部预验收安排确认。', owner: '顾承宇', date: '2026-09-07 09:30', nextDate: '2026-09-18' },
]

export const opportunityStages = ['初步接洽', '需求确认', '方案沟通', '商务谈判', '合同审批', '赢单', '输单']
export const initialOpportunities = [
  { id: 1, code: 'SJ-2026-042', name: '华辰重工二期设备能耗平台', customerId: 1, amount: 268, stage: '方案沟通', probability: 55, owner: '唐若川', expectedDate: '2026-10-28', nextAction: '提交技术方案和实施范围', updatedAt: '2026-09-07' },
  { id: 2, code: 'SJ-2026-043', name: '远景新能源供应链二期', customerId: 2, amount: 326, stage: '商务谈判', probability: 75, owner: '李梓涵', expectedDate: '2026-09-30', nextAction: '确认商务条款及付款节点', updatedAt: '2026-09-06' },
  { id: 3, code: 'SJ-2026-044', name: '启明电子生产运营平台', customerId: 5, amount: 186, stage: '需求确认', probability: 35, owner: '叶青禾', expectedDate: '2026-11-15', nextAction: '组织业务需求调研', updatedAt: '2026-09-04' },
  { id: 4, code: 'SJ-2026-045', name: '北辰精密设备互联项目', customerId: 6, amount: 158, stage: '初步接洽', probability: 20, owner: '唐若川', expectedDate: '2026-12-08', nextAction: '安排工厂现场交流', updatedAt: '2026-09-02' },
  { id: 5, code: 'SJ-2026-039', name: '恒通物流仓储扩展项目', customerId: 4, amount: 142, stage: '合同审批', probability: 90, owner: '顾承宇', expectedDate: '2026-09-18', nextAction: '完成合同法务审核', updatedAt: '2026-09-07' },
  { id: 6, code: 'SJ-2026-031', name: '融海集团运营协同升级', customerId: 8, amount: 215, stage: '赢单', probability: 100, owner: '顾承宇', expectedDate: '2026-08-25', nextAction: '启动项目交接', updatedAt: '2026-08-25' },
  { id: 7, code: 'SJ-2026-028', name: '西岭智造数据采集改造', customerId: 7, amount: 98, stage: '输单', probability: 0, owner: '沈知夏', expectedDate: '2026-08-10', nextAction: '六个月后重新联系', updatedAt: '2026-08-12' },
]

export const initialContracts = [
  { id: 1, code: 'HT-2026-018', name: '华辰装备数字工厂一期合同', customerId: 1, opportunityId: null, amount: 586, signedAt: '2026-02-18', startAt: '2026-03-01', endAt: '2026-11-30', invoiced: 468, paid: 398, status: '执行中', owner: '唐若川' },
  { id: 2, code: 'HT-2026-031', name: '新能源供应链协同平台合同', customerId: 2, opportunityId: null, amount: 468, signedAt: '2026-04-26', startAt: '2026-05-06', endAt: '2026-12-26', invoiced: 352, paid: 286, status: '回款逾期', owner: '李梓涵' },
  { id: 3, code: 'HT-2026-025', name: '区域运营数据中台建设合同', customerId: 3, opportunityId: null, amount: 356, signedAt: '2026-03-20', startAt: '2026-04-01', endAt: '2026-10-31', invoiced: 285, paid: 252, status: '执行中', owner: '沈知夏' },
  { id: 4, code: 'HT-2026-036', name: '智能仓储升级项目合同', customerId: 4, opportunityId: null, amount: 298, signedAt: '2026-05-16', startAt: '2026-05-25', endAt: '2026-09-30', invoiced: 268, paid: 238, status: '即将到期', owner: '顾承宇' },
  { id: 5, code: 'HT-2026-041', name: '运营协同升级服务合同', customerId: 8, opportunityId: 6, amount: 215, signedAt: '2026-08-25', startAt: '2026-09-01', endAt: '2027-02-28', invoiced: 86, paid: 42, status: '执行中', owner: '顾承宇' },
]

export const initialPaymentPlans = [
  { id: 1, contractId: 1, phase: '首付款', dueDate: '2026-03-10', amount: 176, paidAmount: 176, paidDate: '2026-03-08', status: '已回款' },
  { id: 2, contractId: 1, phase: '阶段款', dueDate: '2026-07-30', amount: 222, paidAmount: 222, paidDate: '2026-07-28', status: '已回款' },
  { id: 3, contractId: 1, projectId: 1, isAcceptancePayment: true, phase: '验收款', dueDate: '2026-11-25', amount: 188, paidAmount: 0, paidDate: '', status: '未到期' },
  { id: 4, contractId: 2, phase: '首付款', dueDate: '2026-05-15', amount: 140, paidAmount: 140, paidDate: '2026-05-14', status: '已回款' },
  { id: 5, contractId: 2, phase: '阶段款', dueDate: '2026-08-26', amount: 146, paidAmount: 86, paidDate: '2026-08-25', status: '逾期' },
  { id: 6, contractId: 2, projectId: 2, isAcceptancePayment: true, phase: '验收款', dueDate: '2026-12-20', amount: 182, paidAmount: 60, paidDate: '2026-09-02', status: '未到期' },
  { id: 7, contractId: 3, projectId: 3, isAcceptancePayment: true, phase: '项目验收款', dueDate: '2026-09-30', amount: 356, paidAmount: 252, paidDate: '2026-08-30', status: '部分回款' },
  { id: 8, contractId: 4, projectId: 4, isAcceptancePayment: true, phase: '项目验收款', dueDate: '2026-09-25', amount: 298, paidAmount: 238, paidDate: '2026-08-28', status: '部分回款' },
  { id: 9, contractId: 5, phase: '首付款', dueDate: '2026-09-08', amount: 86, paidAmount: 42, paidDate: '2026-09-05', status: '部分回款' },
  { id: 10, contractId: 5, projectId: 5, isAcceptancePayment: true, phase: '协同项目验收款', dueDate: '2027-01-15', amount: 75, paidAmount: 0, paidDate: '', status: '未到期' },
  { id: 11, contractId: 5, projectId: 6, isAcceptancePayment: true, phase: '治理项目验收款', dueDate: '2027-02-20', amount: 54, paidAmount: 0, paidDate: '', status: '未到期' },
]

export const salesTrend = { months: ['4 月', '5 月', '6 月', '7 月', '8 月', '9 月'], signed: [680, 760, 925, 846, 1085, 1248], paid: [526, 598, 716, 682, 864, 1012], customers: [4, 5, 7, 6, 8, 9] }
export const salesTeamPerformance = [
  { name: '唐若川', signed: 1286, target: 1500, customers: 18, winRate: 42 },
  { name: '顾承宇', signed: 1125, target: 1400, customers: 15, winRate: 39 },
  { name: '李梓涵', signed: 986, target: 1300, customers: 16, winRate: 37 },
  { name: '沈知夏', signed: 845, target: 1200, customers: 13, winRate: 35 },
  { name: '叶青禾', signed: 618, target: 1000, customers: 12, winRate: 31 },
]
