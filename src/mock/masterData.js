export const departments = [
  { id: 1, name: '集团总部', parentId: null, ownerId: 1001 },
  { id: 2, name: '销售管理中心', parentId: 1, ownerId: 2001 },
  { id: 3, name: '项目交付中心', parentId: 1, ownerId: 3001 },
  { id: 4, name: '财务管理中心', parentId: 1, ownerId: 4001 },
]

export const employees = [
  { id: 3001, code: 'YG-0301', name: '林嘉航', departmentId: 3, position: '交付总监', skills: ['项目治理', '客户验收'], status: '在职' },
  { id: 3002, code: 'YG-0302', name: '顾清扬', departmentId: 3, position: '高级项目经理', skills: ['供应链', '成本控制'], status: '在职' },
  { id: 3003, code: 'YG-0303', name: '宋知行', departmentId: 3, position: '项目经理', skills: ['数据治理', '需求管理'], status: '在职' },
  { id: 3004, code: 'YG-0304', name: '许文博', departmentId: 3, position: '项目经理', skills: ['智能仓储', '实施交付'], status: '在职' },
  { id: 3005, code: 'YG-0305', name: '王宁', departmentId: 3, position: '实施顾问', skills: ['系统配置', '用户培训'], status: '在职' },
  { id: 3006, code: 'YG-0306', name: '苏映雪', departmentId: 3, position: '解决方案顾问', skills: ['业务分析', '数据建模'], status: '在职' },
  { id: 3007, code: 'YG-0307', name: '韩子墨', departmentId: 3, position: '前端工程师', skills: ['可视化', '交互设计'], status: '在职' },
  { id: 3008, code: 'YG-0308', name: '陆星河', departmentId: 3, position: '测试工程师', skills: ['质量管理', '验收测试'], status: '在职' },
  { id: 2001, code: 'YG-0201', name: '唐若川', departmentId: 2, position: '销售负责人', skills: ['客户经营'], status: '在职' },
  { id: 4001, code: 'YG-0401', name: '程安然', departmentId: 4, position: '财务负责人', skills: ['预算管理'], status: '在职' },
]

export const deliveryDepartmentId = 3
export const deliveryEmployees = employees.filter((item) => item.departmentId === deliveryDepartmentId && item.status === '在职')

