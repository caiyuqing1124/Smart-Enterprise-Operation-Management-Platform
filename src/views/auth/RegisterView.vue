<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AuthShell from './AuthShell.vue'
import { useAuthStore } from '../../stores/auth'
import { industryOptions, organizationScaleOptions } from '../../mock/auth'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref()
const loading = ref(false)
const agreed = ref(false)
const form = reactive({ name: '', account: '', companyName: '', industry: '', scale: '', password: '', confirmPassword: '' })

const validateAccount = (_rule, value, callback) => {
  const valid = /^1\d{10}$/.test(value) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  valid ? callback() : callback(new Error('请输入有效的手机号或邮箱'))
}
const validateConfirmPassword = (_rule, value, callback) => {
  value === form.password ? callback() : callback(new Error('两次输入的密码不一致'))
}
const rules = {
  name: [{ required: true, message: '请输入管理员姓名', trigger: 'blur' }],
  account: [{ required: true, validator: validateAccount, trigger: 'blur' }],
  companyName: [{ required: true, message: '请输入企业名称', trigger: 'blur' }],
  industry: [{ required: true, message: '请选择所属行业', trigger: 'change' }],
  scale: [{ required: true, message: '请选择企业规模', trigger: 'change' }],
  password: [
    { required: true, message: '请设置登录密码', trigger: 'blur' },
    { min: 8, message: '密码至少需要 8 位', trigger: 'blur' },
  ],
  confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }],
}

async function submit() {
  await formRef.value.validate()
  if (!agreed.value) {
    ElMessage.warning('请先阅读并同意服务条款和隐私政策')
    return
  }
  loading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 500))
    authStore.register(form)
    ElMessage.success('企业账号创建成功，请登录')
    router.replace({ path: '/login', query: { account: form.account } })
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthShell title="创建企业账号" subtitle="完成企业信息登记，建立专属工作空间">
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="large" class="register-form">
      <div class="form-grid">
        <el-form-item label="管理员姓名" prop="name"><el-input v-model="form.name" placeholder="请输入姓名" /></el-form-item>
        <el-form-item label="手机号或邮箱" prop="account"><el-input v-model="form.account" placeholder="用于登录系统" /></el-form-item>
        <el-form-item label="企业名称" prop="companyName" class="full-field"><el-input v-model="form.companyName" placeholder="请输入完整企业名称" /></el-form-item>
        <el-form-item label="所属行业" prop="industry">
          <el-select v-model="form.industry" placeholder="请选择行业" style="width: 100%">
            <el-option v-for="item in industryOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="企业规模" prop="scale">
          <el-select v-model="form.scale" placeholder="请选择规模" style="width: 100%">
            <el-option v-for="item in organizationScaleOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="登录密码" prop="password"><el-input v-model="form.password" type="password" show-password placeholder="至少 8 位" /></el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword"><el-input v-model="form.confirmPassword" type="password" show-password placeholder="再次输入密码" /></el-form-item>
      </div>
      <el-checkbox v-model="agreed">我已阅读并同意《服务条款》和《隐私政策》</el-checkbox>
      <el-button class="submit-button" type="primary" :loading="loading" @click="submit">创建企业账号</el-button>
      <div class="auth-switch">已有账号？<router-link to="/login">返回登录</router-link></div>
    </el-form>
  </AuthShell>
</template>
