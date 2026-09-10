export const financeMonthlyTrend = [
  { month: '4 月', income: 526, expense: 318 },
  { month: '5 月', income: 598, expense: 352 },
  { month: '6 月', income: 716, expense: 421 },
  { month: '7 月', income: 682, expense: 398 },
  { month: '8 月', income: 864, expense: 516 },
  { month: '9 月', income: 1012, expense: 568 },
]

export const initialPaidAmount = 1216

export const financeCategories = {
  收入: ['服务收入', '实施收入', '运维收入', '其他收入'],
  支出: ['项目采购', '技术服务', '差旅费用', '办公费用', '其他支出'],
}

export const initialFinanceTransactions = [
  { id: 5001, code: 'SZ-2026-0091', date: '2026-09-09', direction: '支出', category: '技术服务', amount: 46, counterparty: '启衡技术服务有限公司', customerId: null, contractId: null, projectId: 2, department: '项目交付中心', owner: '林嘉航', status: '已确认', remark: '供应链接口专项技术服务费' },
  { id: 5002, code: 'SZ-2026-0088', date: '2026-09-07', direction: '支出', category: '项目采购', amount: 72, counterparty: '云川智能设备有限公司', customerId: null, contractId: null, projectId: 1, department: '项目交付中心', owner: '赵思齐', status: '已确认', remark: '现场采集设备及安装辅材' },
  { id: 5003, code: 'SZ-2026-0083', date: '2026-09-04', direction: '收入', category: '运维收入', amount: 36, counterparty: '联城商业运营有限公司', customerId: 6, contractId: null, projectId: null, department: '销售管理中心', owner: '沈知夏', status: '已确认', remark: '年度运营支持服务费' },
  { id: 5004, code: 'SZ-2026-0079', date: '2026-08-29', direction: '支出', category: '差旅费用', amount: 8.6, counterparty: '项目现场差旅汇总', customerId: null, contractId: null, projectId: 3, department: '项目交付中心', owner: '林嘉航', status: '已确认', remark: '八月项目现场差旅费用' },
  { id: 5005, code: 'SZ-2026-0072', date: '2026-08-24', direction: '收入', category: '服务收入', amount: 58, counterparty: '海岳新能源科技有限公司', customerId: 2, contractId: null, projectId: null, department: '销售管理中心', owner: '李梓涵', status: '已确认', remark: '供应链咨询服务收入' },
]

export const initialPayables = [
  { id: 8001, code: 'YF-2026-021', counterparty: '云川智能设备有限公司', projectId: 1, amount: 96, settledAmount: 72, dueDate: '2026-09-18', category: '项目采购', owner: '赵思齐', status: '部分付款', remark: '设备到货后支付剩余款项' },
  { id: 8002, code: 'YF-2026-024', counterparty: '启衡技术服务有限公司', projectId: 2, amount: 86, settledAmount: 46, dueDate: '2026-09-15', category: '技术服务', owner: '林嘉航', status: '部分付款', remark: '接口联调验收后结算' },
  { id: 8003, code: 'YF-2026-027', counterparty: '汇达项目服务中心', projectId: 3, amount: 18.6, settledAmount: 8.6, dueDate: '2026-09-25', category: '差旅费用', owner: '林嘉航', status: '部分付款', remark: '项目现场费用月度结算' },
  { id: 8004, code: 'YF-2026-030', counterparty: '智仓实施协作组', projectId: 4, amount: 42, settledAmount: 0, dueDate: '2026-10-08', category: '技术服务', owner: '周明远', status: '未到期', remark: '客户验收通过后结算' },
]
