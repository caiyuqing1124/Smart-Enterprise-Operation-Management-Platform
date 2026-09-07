<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AuthShell from './AuthShell.vue'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref()
const loading = ref(false)
const countdown = ref(0)
const issuedCode = ref('')
const form = reactive({ account: '', code: '', password: '', confirmPassword: '' })

const validateAccount = (_rule, value, callback) => {
  const valid = /^1\d{10}$/.test(value) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  valid ? callback() : callback(new Error('请输入有效的手机号或邮箱'))
}
const validateCode = (_rule, value, callback) => {
  if (!issuedCode.value) return callback(new Error('请先获取验证码'))
  value === issuedCode.value ? callback() : callback(new Error('验证码不正确'))
}
const validateConfirmPassword = (_rule, value, callback) => {
  value === form.password ? callback() : callback(new Error('两次输入的密码不一致'))
}
const rules = {
  account: [{ required: true, validator: validateAccount, trigger: 'blur' }],
  code: [{ required: true, validator: validateCode, trigger: 'blur' }],
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, message: '密码至少需要 8 位', trigger: 'blur' },
  ],
  confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }],
}

async function sendCode() {
  try {
    await formRef.value.validateField('account')
    issuedCode.value = String(Math.floor(100000 + Math.random() * 900000))
    countdown.value = 60
    ElMessage.success(`验证码已生成：${issuedCode.value}`)
    const timer = window.setInterval(() => {
      countdown.value -= 1
      if (countdown.value <= 0) window.clearInterval(timer)
    }, 1000)
  } catch {
    // 表单会显示账号格式提示。
  }
}

async function submit() {
  await formRef.value.validate()
  loading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 500))
    authStore.resetPassword(form)
    ElMessage.success('密码已更新，请重新登录')
    router.replace('/login')
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthShell title="找回密码" subtitle="验证账号信息后重新设置登录密码">
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="large">
      <el-form-item label="手机号或邮箱" prop="account"><el-input v-model="form.account" placeholder="请输入注册账号" /></el-form-item>
      <el-form-item label="验证码" prop="code">
        <div class="verification-row">
          <el-input v-model="form.code" maxlength="6" placeholder="请输入 6 位验证码" />
          <el-button :disabled="countdown > 0" @click="sendCode">{{ countdown > 0 ? `${countdown} 秒后重试` : '获取验证码' }}</el-button>
        </div>
      </el-form-item>
      <el-form-item label="新密码" prop="password"><el-input v-model="form.password" type="password" show-password placeholder="至少 8 位" /></el-form-item>
      <el-form-item label="确认新密码" prop="confirmPassword"><el-input v-model="form.confirmPassword" type="password" show-password placeholder="再次输入新密码" /></el-form-item>
      <el-button class="submit-button" type="primary" :loading="loading" @click="submit">确认修改</el-button>
      <div class="auth-switch"><router-link to="/login">返回登录</router-link></div>
    </el-form>
  </AuthShell>
</template>
