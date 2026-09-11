import { departments, employees } from './masterData'
import { projectHealthStatuses, projectStatuses, taskStatuses } from './projects'
import { customerIndustries, customerLevels, opportunityStages } from './sales'

export const initialEnterpriseProfile = {
  name: '',
  shortName: '',
  industry: '企业服务',
  scale: '200—499 人',
  contact: '',
  phone: '',
  address: '',
}

export const initialSystemPreferences = {
  systemName: '智慧企业运营管理平台',
}

export const initialDepartments = departments
export const initialEmployees = employees

export const initialBusinessDictionaries = {
  customerLevels,
  customerIndustries,
  opportunityStages,
  projectStatuses,
  projectHealthStatuses,
  taskStatuses,
}

export const dictionaryDefinitions = [
  { key: 'customerLevels', label: '客户等级', description: '客户分层与资源投入依据' },
  { key: 'customerIndustries', label: '客户行业', description: '客户档案与经营分析行业口径' },
  { key: 'opportunityStages', label: '商机阶段', description: '销售漏斗推进阶段' },
  { key: 'projectStatuses', label: '项目状态', description: '项目执行生命周期状态' },
  { key: 'projectHealthStatuses', label: '项目健康度', description: '项目风险健康标识' },
  { key: 'taskStatuses', label: '任务状态', description: '项目任务执行状态' },
]
