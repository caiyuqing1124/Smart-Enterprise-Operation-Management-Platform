export const projectStatuses = ['未启动', '执行中', '已暂停', '已完成', '已归档']
export const projectHealthStatuses = ['正常', '关注', '延期风险', '成本风险', '已暂停']
export const taskStatuses = ['未开始', '进行中', '已完成', '已延期']

export const initialProjects = [
  { id: 1, code: 'XM-2026-001', name: '华辰装备数字工厂一期', customerId: 1, contractId: 1, managerId: 3001, memberIds: [3001, 3005, 3007, 3008], plannedStart: '2026-03-01', plannedEnd: '2026-11-18', actualStart: '2026-03-03', progress: 75, contractAmount: 586, budgetCost: 398, actualCost: 271, health: '正常', status: '执行中', acceptanceStatus: '待验收', archived: false, description: '建设覆盖设备接入、生产监控和经营分析的一体化数字工厂平台。' },
  { id: 2, code: 'XM-2026-002', name: '新能源供应链协同平台', customerId: 2, contractId: 2, managerId: 3002, memberIds: [3002, 3005, 3006, 3008], plannedStart: '2026-05-06', plannedEnd: '2026-12-26', actualStart: '2026-05-08', progress: 55, contractAmount: 468, budgetCost: 326, actualCost: 232, health: '成本风险', status: '执行中', acceptanceStatus: '待验收', archived: false, description: '打通供应计划、采购协同和交付跟踪，提升上下游协同效率。' },
  { id: 3, code: 'XM-2026-003', name: '区域运营数据中台', customerId: 3, contractId: 3, managerId: 3003, memberIds: [3003, 3006, 3007, 3008], plannedStart: '2026-04-01', plannedEnd: '2026-10-15', actualStart: '2026-04-01', progress: 80, contractAmount: 356, budgetCost: 238, actualCost: 188, health: '延期风险', status: '执行中', acceptanceStatus: '整改中', archived: false, description: '统一区域经营数据口径，形成指标治理、数据服务和管理驾驶舱。' },
  { id: 4, code: 'XM-2026-004', name: '智能仓储升级项目', customerId: 4, contractId: 4, managerId: 3004, memberIds: [3004, 3005, 3007, 3008], plannedStart: '2026-05-25', plannedEnd: '2026-09-28', actualStart: '2026-05-25', progress: 92, contractAmount: 298, budgetCost: 205, actualCost: 181, health: '正常', status: '执行中', acceptanceStatus: '待验收', archived: false, description: '升级仓储作业、库存可视化和移动盘点能力，支撑多仓协同。' },
  { id: 5, code: 'XM-2026-005', name: '融海运营协同升级一期', customerId: 8, contractId: 5, managerId: 3003, memberIds: [3003, 3006, 3007], plannedStart: '2026-09-01', plannedEnd: '2027-01-15', actualStart: '2026-09-02', progress: 28, contractAmount: 145, budgetCost: 92, actualCost: 18, health: '正常', status: '执行中', acceptanceStatus: '待验收', archived: false, description: '完成运营协同平台第一批流程与经营看板建设。' },
  { id: 6, code: 'XM-2026-006', name: '融海数据治理专项', customerId: 8, contractId: 5, managerId: 3002, memberIds: [3002, 3006, 3008], plannedStart: '2026-10-01', plannedEnd: '2027-02-20', actualStart: '', progress: 0, contractAmount: 70, budgetCost: 48, actualCost: 0, health: '正常', status: '未启动', acceptanceStatus: '待验收', archived: false, description: '针对主数据和经营指标开展专项治理，与协同升级项目并行交付。' },
]

export const initialProjectTasks = [
  { id: 101, projectId: 1, parentTaskId: null, name: '完成设备数据接入', assigneeId: 3007, collaboratorIds: [3005], priority: '高', startDate: '2026-08-18', dueDate: '2026-09-12', progress: 100, status: '已完成', predecessorTaskIds: [] },
  { id: 102, projectId: 1, parentTaskId: null, name: '生产看板联调', assigneeId: 3005, collaboratorIds: [3007], priority: '高', startDate: '2026-09-08', dueDate: '2026-09-25', progress: 75, status: '进行中', predecessorTaskIds: [101] },
  { id: 103, projectId: 1, parentTaskId: null, name: '组织用户验收测试', assigneeId: 3008, collaboratorIds: [3001], priority: '中', startDate: '2026-10-10', dueDate: '2026-11-12', progress: 50, status: '进行中', predecessorTaskIds: [102] },
  { id: 201, projectId: 2, parentTaskId: null, name: '供应计划流程配置', assigneeId: 3005, collaboratorIds: [3006], priority: '高', startDate: '2026-08-20', dueDate: '2026-09-18', progress: 80, status: '进行中', predecessorTaskIds: [] },
  { id: 202, projectId: 2, parentTaskId: null, name: '供应商门户联调', assigneeId: 3006, collaboratorIds: [3005], priority: '高', startDate: '2026-09-15', dueDate: '2026-10-20', progress: 45, status: '进行中', predecessorTaskIds: [201] },
  { id: 203, projectId: 2, parentTaskId: null, name: '成本规则确认', assigneeId: 3002, collaboratorIds: [], priority: '中', startDate: '2026-09-05', dueDate: '2026-09-16', progress: 40, status: '进行中', predecessorTaskIds: [] },
  { id: 301, projectId: 3, parentTaskId: null, name: '关闭数据治理整改项', assigneeId: 3006, collaboratorIds: [3007], priority: '高', startDate: '2026-09-01', dueDate: '2026-09-12', progress: 65, status: '已延期', predecessorTaskIds: [] },
  { id: 302, projectId: 3, parentTaskId: null, name: '经营指标复核', assigneeId: 3003, collaboratorIds: [3006], priority: '高', startDate: '2026-09-08', dueDate: '2026-09-20', progress: 80, status: '进行中', predecessorTaskIds: [301] },
  { id: 303, projectId: 3, parentTaskId: null, name: '阶段验收材料归档', assigneeId: 3008, collaboratorIds: [], priority: '中', startDate: '2026-09-21', dueDate: '2026-10-10', progress: 95, status: '进行中', predecessorTaskIds: [302] },
  { id: 401, projectId: 4, parentTaskId: null, name: '完成多仓库存核对', assigneeId: 3005, collaboratorIds: [3007], priority: '高', startDate: '2026-08-25', dueDate: '2026-09-10', progress: 100, status: '已完成', predecessorTaskIds: [] },
  { id: 402, projectId: 4, parentTaskId: null, name: '内部预验收', assigneeId: 3008, collaboratorIds: [3004], priority: '高', startDate: '2026-09-11', dueDate: '2026-09-18', progress: 100, status: '已完成', predecessorTaskIds: [401] },
  { id: 403, projectId: 4, parentTaskId: null, name: '客户验收问题关闭', assigneeId: 3004, collaboratorIds: [3005], priority: '高', startDate: '2026-09-19', dueDate: '2026-09-28', progress: 75, status: '进行中', predecessorTaskIds: [402] },
  { id: 501, projectId: 5, parentTaskId: null, name: '业务流程调研', assigneeId: 3006, collaboratorIds: [3003], priority: '高', startDate: '2026-09-02', dueDate: '2026-09-16', progress: 45, status: '进行中', predecessorTaskIds: [] },
  { id: 502, projectId: 5, parentTaskId: null, name: '一期范围确认', assigneeId: 3003, collaboratorIds: [], priority: '中', startDate: '2026-09-12', dueDate: '2026-09-22', progress: 10, status: '进行中', predecessorTaskIds: [501] },
]

export const initialMilestones = [
  { id: 1, projectId: 1, name: '核心设备接入完成', plannedDate: '2026-09-12', actualDate: '2026-09-11', ownerId: 3007, deliverables: ['设备接入清单'], acceptanceStatus: '已通过', isCustomerAcceptance: false },
  { id: 2, projectId: 1, name: '项目最终验收', plannedDate: '2026-11-18', actualDate: '', ownerId: 3001, deliverables: ['验收报告', '用户手册'], acceptanceStatus: '待提交', isCustomerAcceptance: true },
  { id: 3, projectId: 2, name: '供应计划上线', plannedDate: '2026-10-20', actualDate: '', ownerId: 3002, deliverables: ['上线确认单'], acceptanceStatus: '进行中', isCustomerAcceptance: false },
  { id: 4, projectId: 2, name: '客户验收', plannedDate: '2026-12-26', actualDate: '', ownerId: 3002, deliverables: ['验收报告'], acceptanceStatus: '待提交', isCustomerAcceptance: true },
  { id: 5, projectId: 3, name: '数据治理阶段验收', plannedDate: '2026-09-12', actualDate: '', ownerId: 3003, deliverables: ['数据标准', '整改清单'], acceptanceStatus: '整改中', isCustomerAcceptance: false },
  { id: 6, projectId: 3, name: '项目最终验收', plannedDate: '2026-10-15', actualDate: '', ownerId: 3003, deliverables: ['终验报告'], acceptanceStatus: '待提交', isCustomerAcceptance: true },
  { id: 7, projectId: 4, name: '内部预验收', plannedDate: '2026-09-18', actualDate: '2026-09-18', ownerId: 3008, deliverables: ['预验收记录'], acceptanceStatus: '已通过', isCustomerAcceptance: false },
  { id: 8, projectId: 4, name: '客户最终验收', plannedDate: '2026-09-28', actualDate: '', ownerId: 3004, deliverables: ['客户验收单'], acceptanceStatus: '待提交', isCustomerAcceptance: true },
  { id: 9, projectId: 5, name: '一期范围确认', plannedDate: '2026-09-22', actualDate: '', ownerId: 3003, deliverables: ['范围确认书'], acceptanceStatus: '进行中', isCustomerAcceptance: false },
]

export const initialProjectRisks = [
  { id: 1, projectId: 2, title: '外部供应商接口交付延迟', probability: '中', impact: '高', level: '高', response: '每日跟踪接口联调，准备批量导入备用方案。', ownerId: 3002, deadline: '2026-09-20', status: '处理中' },
  { id: 2, projectId: 3, title: '数据治理整改项可能影响验收', probability: '高', impact: '高', level: '高', response: '拆分责任清单并安排每日关闭评审。', ownerId: 3003, deadline: '2026-09-12', status: '处理中' },
  { id: 3, projectId: 4, title: '客户验收人员排期冲突', probability: '中', impact: '中', level: '中', response: '提前锁定线上验收时段并准备录屏材料。', ownerId: 3004, deadline: '2026-09-22', status: '监控中' },
]

export const initialResourceAllocations = [
  { id: 1, employeeId: 3001, projectId: 1, period: '2026-09', plannedHours: 96, actualHours: 82 },
  { id: 2, employeeId: 3002, projectId: 2, period: '2026-09', plannedHours: 112, actualHours: 98 },
  { id: 3, employeeId: 3002, projectId: 6, period: '2026-09', plannedHours: 48, actualHours: 12 },
  { id: 4, employeeId: 3003, projectId: 3, period: '2026-09', plannedHours: 104, actualHours: 91 },
  { id: 5, employeeId: 3003, projectId: 5, period: '2026-09', plannedHours: 64, actualHours: 26 },
  { id: 6, employeeId: 3004, projectId: 4, period: '2026-09', plannedHours: 128, actualHours: 113 },
  { id: 7, employeeId: 3005, projectId: 1, period: '2026-09', plannedHours: 72, actualHours: 68 },
  { id: 8, employeeId: 3005, projectId: 2, period: '2026-09', plannedHours: 64, actualHours: 57 },
  { id: 9, employeeId: 3005, projectId: 4, period: '2026-09', plannedHours: 56, actualHours: 49 },
  { id: 10, employeeId: 3006, projectId: 2, period: '2026-09', plannedHours: 72, actualHours: 63 },
  { id: 11, employeeId: 3006, projectId: 3, period: '2026-09', plannedHours: 72, actualHours: 65 },
  { id: 12, employeeId: 3006, projectId: 5, period: '2026-09', plannedHours: 48, actualHours: 31 },
  { id: 13, employeeId: 3007, projectId: 1, period: '2026-09', plannedHours: 80, actualHours: 73 },
  { id: 14, employeeId: 3007, projectId: 3, period: '2026-09', plannedHours: 64, actualHours: 58 },
  { id: 15, employeeId: 3008, projectId: 4, period: '2026-09', plannedHours: 88, actualHours: 76 },
  { id: 16, employeeId: 3001, projectId: 1, period: '2026-10', plannedHours: 88, actualHours: 0 },
  { id: 17, employeeId: 3002, projectId: 2, period: '2026-10', plannedHours: 104, actualHours: 0 },
  { id: 18, employeeId: 3002, projectId: 6, period: '2026-10', plannedHours: 56, actualHours: 0 },
  { id: 19, employeeId: 3003, projectId: 3, period: '2026-10', plannedHours: 72, actualHours: 0 },
  { id: 20, employeeId: 3003, projectId: 5, period: '2026-10', plannedHours: 80, actualHours: 0 },
  { id: 21, employeeId: 3004, projectId: 4, period: '2026-10', plannedHours: 40, actualHours: 0 },
  { id: 22, employeeId: 3005, projectId: 1, period: '2026-10', plannedHours: 64, actualHours: 0 },
  { id: 23, employeeId: 3005, projectId: 2, period: '2026-10', plannedHours: 72, actualHours: 0 },
  { id: 24, employeeId: 3006, projectId: 3, period: '2026-10', plannedHours: 56, actualHours: 0 },
  { id: 25, employeeId: 3006, projectId: 5, period: '2026-10', plannedHours: 72, actualHours: 0 },
  { id: 26, employeeId: 3007, projectId: 1, period: '2026-10', plannedHours: 80, actualHours: 0 },
  { id: 27, employeeId: 3008, projectId: 4, period: '2026-10', plannedHours: 48, actualHours: 0 },
]

export const initialProjectFiles = [
  { id: 1, projectId: 1, name: '数字工厂一期实施计划.pdf', size: '2.4 MB', uploaderId: 3001, uploadedAt: '2026-08-28 10:20' },
  { id: 2, projectId: 3, name: '数据治理整改清单.xlsx', size: '860 KB', uploaderId: 3003, uploadedAt: '2026-09-08 16:45' },
]

export const initialProjectActivities = [
  { id: 1, projectId: 1, operatorId: 3001, action: '更新项目进度为 75%', time: '2026-09-09 09:30' },
  { id: 2, projectId: 3, operatorId: 3003, action: '新增项目风险：数据治理整改项可能影响验收', time: '2026-09-08 17:12' },
  { id: 3, projectId: 4, operatorId: 3008, action: '内部预验收已通过', time: '2026-09-08 14:10' },
]
