<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '../../stores/auth'
import { resetBusinessData } from '../../stores/persistence'
import { useSettingsStore } from '../../stores/settings'

const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const profileRef = ref()
const profileForm = reactive({ name: '', shortName: '', industry: '', scale: '', contact: '', phone: '', address: '' })
const preferenceForm = reactive({ systemName: '' })
const profileRules = {
  name: [{ required: true, message: '请输入企业名称', trigger: 'blur' }],
  shortName: [{ required: true, message: '请输入企业简称', trigger: 'blur' }],
  industry: [{ required: true, message: '请输入所属行业', trigger: 'blur' }],
}

onMounted(() => {
  settingsStore.initializeCompanyName(authStore.currentUser?.companyName)
  Object.assign(profileForm, settingsStore.enterpriseProfile)
  if (!profileForm.shortName) profileForm.shortName = profileForm.name.slice(0, 8)
  Object.assign(preferenceForm, settingsStore.systemPreferences)
})

async function saveProfile() {
  await profileRef.value.validate()
  settingsStore.updateEnterpriseProfile({ ...profileForm })
  ElMessage.success('企业信息已保存')
}

function savePreferences() {
  const systemName = preferenceForm.systemName.trim()
  if (!systemName) { ElMessage.warning('系统名称不能为空'); return }
  preferenceForm.systemName = systemName
  settingsStore.updateSystemPreferences({ systemName })
  ElMessage.success('系统偏好已保存')
}

async function restoreData() {
  try {
    await ElMessageBox.confirm('将清除当前企业在本浏览器中的全部业务修改并恢复初始数据，确定继续吗？', '恢复初始业务数据', {
      confirmButtonText: '确认恢复', cancelButtonText: '取消', type: 'warning',
    })
    await resetBusinessData()
    ElMessage.success('业务数据已恢复，即将重新加载')
    window.setTimeout(() => window.location.reload(), 500)
  } catch { /* 用户取消时保留当前数据。 */ }
}
</script>

<template>
  <div class="settings-page">
    <header class="settings-hero">
      <div><span>PLATFORM SETTINGS</span><h1>企业与系统设置</h1><p>维护平台抬头、企业基本资料和统一显示偏好。</p></div>
      <div class="settings-hero-status"><el-icon><CircleCheckFilled /></el-icon><span>配置自动保存在当前企业数据空间</span></div>
    </header>

    <div class="settings-layout">
      <main class="settings-main">
        <section class="settings-panel">
          <div class="settings-panel-head"><div><h2>企业基本信息</h2><p>用于平台企业标识和管理员账号信息展示。</p></div><el-button type="primary" @click="saveProfile">保存企业信息</el-button></div>
          <el-form ref="profileRef" :model="profileForm" :rules="profileRules" label-position="top">
            <div class="settings-form-grid">
              <el-form-item label="企业名称" prop="name" class="span-two"><el-input v-model="profileForm.name" maxlength="40" /></el-form-item>
              <el-form-item label="企业简称" prop="shortName"><el-input v-model="profileForm.shortName" maxlength="12" /></el-form-item>
              <el-form-item label="所属行业" prop="industry"><el-input v-model="profileForm.industry" /></el-form-item>
              <el-form-item label="企业规模"><el-select v-model="profileForm.scale" style="width:100%"><el-option v-for="item in ['50 人以下','50—199 人','200—499 人','500—999 人','1000 人以上']" :key="item" :label="item" :value="item" /></el-select></el-form-item>
              <el-form-item label="联系人"><el-input v-model="profileForm.contact" /></el-form-item>
              <el-form-item label="联系电话"><el-input v-model="profileForm.phone" maxlength="20" /></el-form-item>
              <el-form-item label="企业地址" class="span-two"><el-input v-model="profileForm.address" /></el-form-item>
            </div>
          </el-form>
        </section>

        <section class="settings-panel preference-panel">
          <div class="settings-panel-head"><div><h2>系统显示设置</h2><p>统一平台在侧边栏和浏览器页签中显示的名称。</p></div><el-button type="primary" plain @click="savePreferences">保存系统名称</el-button></div>
          <div class="preference-list">
            <label><span><strong>系统名称</strong><small>显示在浏览器标题及交付资料中</small></span><el-input v-model="preferenceForm.systemName" /></label>
          </div>
        </section>
      </main>

      <aside class="settings-side">
        <section><el-icon><OfficeBuilding /></el-icon><h3>{{ settingsStore.enterpriseProfile.shortName || settingsStore.enterpriseProfile.name || '当前企业' }}</h3><p>{{ settingsStore.enterpriseProfile.industry }} · {{ settingsStore.enterpriseProfile.scale }}</p></section>
        <section class="settings-scope-note"><h3>数据范围说明</h3><p>当前配置和业务数据按登录账号的企业名称隔离，不会影响其他企业账号。</p></section>
        <section class="danger-settings"><h3>数据恢复</h3><p>遇到数据异常或需要重新验收时，可恢复系统内置初始业务数据。</p><el-button type="danger" plain @click="restoreData">恢复初始业务数据</el-button></section>
      </aside>
    </div>
  </div>
</template>
