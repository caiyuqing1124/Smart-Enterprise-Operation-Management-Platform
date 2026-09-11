<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { dictionaryDefinitions } from '../../mock/settings'
import { useProjectStore } from '../../stores/projects'
import { useSalesStore } from '../../stores/sales'
import { useSettingsStore } from '../../stores/settings'

const store = useSettingsStore()
const projectStore = useProjectStore()
const salesStore = useSalesStore()
const activeTab = ref('organization')
const departmentFilter = ref('all')
const employeeKeyword = ref('')
const departmentVisible = ref(false)
const employeeVisible = ref(false)
const dictionaryVisible = ref(false)
const departmentMode = ref('create')
const employeeMode = ref('create')
const departmentRef = ref()
const employeeRef = ref()
const departmentForm = reactive({ id: null, name: '', parentId: null, ownerId: null, status: '启用' })
const employeeForm = reactive({ id: null, name: '', departmentId: null, position: '', skillsText: '', status: '在职' })
const dictionaryForm = reactive({ key: '', label: '', value: '' })
const filteredEmployees = computed(() => store.employees.filter((item) => {
  const text = `${item.code}${item.name}${item.position}${store.departmentMap[item.departmentId]?.name || ''}`.toLowerCase()
  return (departmentFilter.value === 'all' || item.departmentId === departmentFilter.value)
    && (!employeeKeyword.value || text.includes(employeeKeyword.value.toLowerCase()))
}))
const departmentRules = { name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }] }
const employeeRules = {
  name: [{ required: true, message: '请输入员工姓名', trigger: 'blur' }],
  departmentId: [{ required: true, message: '请选择所属部门', trigger: 'change' }],
  position: [{ required: true, message: '请输入岗位名称', trigger: 'blur' }],
}

function openDepartment(item = null) {
  Object.assign(departmentForm, item ? { ...item } : { id: null, name: '', parentId: 1, ownerId: null, status: '启用' })
  departmentMode.value = item ? 'edit' : 'create'
  departmentVisible.value = true
}
async function saveDepartment() {
  await departmentRef.value.validate()
  const payload = { ...departmentForm }; delete payload.id
  departmentMode.value === 'create' ? store.addDepartment(payload) : store.updateDepartment(departmentForm.id, payload)
  departmentVisible.value = false
  ElMessage.success(departmentMode.value === 'create' ? '部门已新增' : '部门信息已更新')
}
async function removeDepartment(item) {
  if (store.employees.some((employee) => employee.departmentId === item.id)) { ElMessage.warning('该部门仍有关联员工，请先调整员工所属部门'); return }
  if (store.departments.some((department) => department.parentId === item.id)) { ElMessage.warning('该部门仍有下级部门，暂不能删除'); return }
  try {
    await ElMessageBox.confirm(`确定删除部门“${item.name}”吗？`, '删除部门', { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' })
    store.removeDepartment(item.id); ElMessage.success('部门已删除')
  } catch { /* 用户取消时保留部门。 */ }
}
function openEmployee(item = null) {
  Object.assign(employeeForm, item ? { ...item, skillsText: (item.skills || []).join('、') } : { id: null, name: '', departmentId: null, position: '', skillsText: '', status: '在职' })
  employeeMode.value = item ? 'edit' : 'create'
  employeeVisible.value = true
}
async function saveEmployee() {
  await employeeRef.value.validate()
  const payload = { ...employeeForm, skills: employeeForm.skillsText.split(/[、,，]/).map((item) => item.trim()).filter(Boolean) }
  delete payload.id; delete payload.skillsText
  employeeMode.value === 'create' ? store.addEmployee(payload) : store.updateEmployee(employeeForm.id, payload)
  employeeVisible.value = false
  ElMessage.success(employeeMode.value === 'create' ? '员工已新增' : '员工信息已更新')
}
async function removeEmployee(item) {
  const occupied = projectStore.projects.some((project) => project.managerId === item.id || project.memberIds?.includes(item.id))
    || projectStore.tasks.some((task) => task.assigneeId === item.id || task.collaboratorIds?.includes(item.id))
    || projectStore.milestones.some((milestone) => milestone.ownerId === item.id)
    || projectStore.risks.some((risk) => risk.ownerId === item.id)
    || projectStore.allocations.some((allocation) => allocation.employeeId === item.id)
    || projectStore.files.some((file) => file.uploaderId === item.id)
    || projectStore.activities.some((activity) => activity.operatorId === item.id)
  if (occupied) { ElMessage.warning('该员工已关联项目业务，请将任职状态改为停用，历史数据会继续保留'); return }
  try {
    await ElMessageBox.confirm(`确定删除员工“${item.name}”吗？建议优先将离职人员改为停用状态。`, '删除员工', { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' })
    store.removeEmployee(item.id); ElMessage.success('员工已删除')
  } catch { /* 用户取消时保留员工。 */ }
}
function openDictionary(definition) { Object.assign(dictionaryForm, { key: definition.key, label: definition.label, value: '' }); dictionaryVisible.value = true }
function addDictionaryValue() {
  const value = dictionaryForm.value.trim()
  if (!value) { ElMessage.warning('请输入字典项名称'); return }
  if (store.businessDictionaries[dictionaryForm.key].includes(value)) { ElMessage.warning('该字典项已经存在'); return }
  store.addDictionaryValue(dictionaryForm.key, value); dictionaryForm.value = ''; ElMessage.success('字典项已添加')
}
async function removeDictionaryValue(definition, value) {
  if (store.businessDictionaries[definition.key].length <= 1) { ElMessage.warning('每个业务字典至少保留一项'); return }
  const usageChecks = {
    customerLevels: () => salesStore.customers.some((item) => item.level === value),
    customerIndustries: () => salesStore.customers.some((item) => item.industry === value),
    opportunityStages: () => salesStore.opportunities.some((item) => item.stage === value),
    projectStatuses: () => projectStore.projects.some((item) => item.status === value),
    projectHealthStatuses: () => projectStore.projects.some((item) => item.health === value),
    taskStatuses: () => projectStore.tasks.some((item) => item.status === value),
  }
  if (usageChecks[definition.key]?.()) { ElMessage.warning('该字典项已被业务数据使用，请先调整相关业务记录'); return }
  try {
    await ElMessageBox.confirm(`确定删除字典项“${value}”吗？已有业务数据不会被删除。`, '删除字典项', { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' })
    store.removeDictionaryValue(definition.key, value); ElMessage.success('字典项已删除')
  } catch { /* 用户取消时保留字典项。 */ }
}
</script>

<template>
  <div class="settings-page master-data-page">
    <header class="settings-hero compact"><div><span>MASTER DATA</span><h1>组织与基础资料</h1><p>统一维护业务页面使用的部门、员工和标准字典。</p></div><div class="settings-hero-status"><strong>{{ store.departments.length }}</strong><span>个部门</span><strong>{{ store.activeEmployees.length }}</strong><span>名在职员工</span></div></header>
    <el-tabs v-model="activeTab" class="settings-tabs">
      <el-tab-pane label="组织与员工" name="organization">
        <div class="organization-layout">
          <aside class="department-rail">
            <header><div><h2>部门结构</h2><p>选择部门筛选员工</p></div><el-button circle type="primary" size="small" @click="openDepartment()"><el-icon><Plus /></el-icon></el-button></header>
            <button type="button" :class="{ active: departmentFilter === 'all' }" @click="departmentFilter = 'all'"><span>全部部门</span><b>{{ store.employees.length }}</b></button>
            <div v-for="item in store.departments" :key="item.id" class="department-entry" :class="{ active: departmentFilter === item.id }">
              <button type="button" @click="departmentFilter = item.id"><span>{{ item.name }}</span><b>{{ store.employees.filter((employee) => employee.departmentId === item.id).length }}</b></button>
              <el-dropdown trigger="click"><el-button link><el-icon><MoreFilled /></el-icon></el-button><template #dropdown><el-dropdown-menu><el-dropdown-item @click="openDepartment(item)">编辑部门</el-dropdown-item><el-dropdown-item divided @click="removeDepartment(item)">删除部门</el-dropdown-item></el-dropdown-menu></template></el-dropdown>
            </div>
          </aside>
          <main class="employee-panel">
            <header><div><h2>员工资料</h2><p>停用员工将不再出现在新的业务负责人选择中</p></div><div><el-input v-model="employeeKeyword" clearable placeholder="搜索姓名、编号或岗位"><template #prefix><el-icon><Search /></el-icon></template></el-input><el-button type="primary" @click="openEmployee()"><el-icon><Plus /></el-icon>新增员工</el-button></div></header>
            <el-table :data="filteredEmployees" stripe>
              <el-table-column prop="code" label="员工编号" width="105" /><el-table-column prop="name" label="姓名" width="90" />
              <el-table-column label="所属部门" min-width="145"><template #default="{row}">{{ store.departmentMap[row.departmentId]?.name || '未分配' }}</template></el-table-column>
              <el-table-column prop="position" label="岗位" min-width="130" /><el-table-column label="能力标签" min-width="200"><template #default="{row}"><el-tag v-for="skill in row.skills" :key="skill" size="small" effect="plain">{{ skill }}</el-tag></template></el-table-column>
              <el-table-column label="状态" width="80"><template #default="{row}"><el-tag :type="row.status === '在职' ? 'success' : 'info'">{{ row.status }}</el-tag></template></el-table-column>
              <el-table-column label="操作" width="125" fixed="right"><template #default="{row}"><el-button link type="primary" @click="openEmployee(row)">编辑</el-button><el-button link type="danger" @click="removeEmployee(row)">删除</el-button></template></el-table-column>
            </el-table>
            <el-empty v-if="!filteredEmployees.length" description="没有符合条件的员工" />
          </main>
        </div>
      </el-tab-pane>
      <el-tab-pane label="业务字典" name="dictionary">
        <div class="dictionary-wall">
          <article v-for="definition in dictionaryDefinitions" :key="definition.key">
            <header><div><h2>{{ definition.label }}</h2><p>{{ definition.description }}</p></div><el-button link type="primary" @click="openDictionary(definition)"><el-icon><Plus /></el-icon>添加</el-button></header>
            <div class="dictionary-values"><el-tag v-for="value in store.businessDictionaries[definition.key]" :key="value" closable effect="plain" @close="removeDictionaryValue(definition, value)">{{ value }}</el-tag></div>
          </article>
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="departmentVisible" :title="departmentMode === 'create' ? '新增部门' : '编辑部门'" width="520px"><el-form ref="departmentRef" :model="departmentForm" :rules="departmentRules" label-position="top"><el-form-item label="部门名称" prop="name"><el-input v-model="departmentForm.name" /></el-form-item><el-form-item label="上级部门"><el-select v-model="departmentForm.parentId" clearable style="width:100%"><el-option v-for="item in store.departments.filter((row) => row.id !== departmentForm.id)" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item><el-form-item label="状态"><el-radio-group v-model="departmentForm.status"><el-radio value="启用">启用</el-radio><el-radio value="停用">停用</el-radio></el-radio-group></el-form-item></el-form><template #footer><el-button @click="departmentVisible=false">取消</el-button><el-button type="primary" @click="saveDepartment">保存部门</el-button></template></el-dialog>
    <el-dialog v-model="employeeVisible" :title="employeeMode === 'create' ? '新增员工' : '编辑员工'" width="600px"><el-form ref="employeeRef" :model="employeeForm" :rules="employeeRules" label-position="top"><div class="settings-form-grid"><el-form-item label="员工姓名" prop="name"><el-input v-model="employeeForm.name" /></el-form-item><el-form-item label="所属部门" prop="departmentId"><el-select v-model="employeeForm.departmentId" style="width:100%"><el-option v-for="item in store.departments.filter((row) => row.status !== '停用')" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item><el-form-item label="岗位名称" prop="position"><el-input v-model="employeeForm.position" /></el-form-item><el-form-item label="任职状态"><el-radio-group v-model="employeeForm.status"><el-radio value="在职">在职</el-radio><el-radio value="停用">停用</el-radio></el-radio-group></el-form-item><el-form-item label="能力标签" class="span-two"><el-input v-model="employeeForm.skillsText" placeholder="多个标签使用顿号分隔" /></el-form-item></div></el-form><template #footer><el-button @click="employeeVisible=false">取消</el-button><el-button type="primary" @click="saveEmployee">保存员工</el-button></template></el-dialog>
    <el-dialog v-model="dictionaryVisible" :title="`维护${dictionaryForm.label}`" width="500px"><div class="dictionary-dialog"><el-input v-model="dictionaryForm.value" maxlength="20" placeholder="请输入新的字典项" @keyup.enter="addDictionaryValue"><template #append><el-button @click="addDictionaryValue">添加</el-button></template></el-input><div><el-tag v-for="value in store.businessDictionaries[dictionaryForm.key] || []" :key="value" effect="plain">{{ value }}</el-tag></div></div><template #footer><el-button type="primary" @click="dictionaryVisible=false">完成</el-button></template></el-dialog>
  </div>
</template>
