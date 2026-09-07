<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AuthShell from './AuthShell.vue'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const formRef = ref()
const loading = ref(false)
const form = reactive({ account: '', password: '', remember: true })
const rules = {
  account: [{ required: true, message: '请输入手机号或邮箱', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入登录密码', trigger: 'blur' },
    { min: 8, message: '密码至少需要 8 位', trigger: 'blur' },
  ],
}

async function submit() {
  await formRef.value.validate()
  loading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 500))
    authStore.login(form)
    ElMessage.success('登录成功')
    router.replace(route.query.redirect || '/')
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthShell title="欢迎登录" subtitle="请输入账号信息进入企业工作空间">
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="large" @keyup.enter="submit">
      <el-form-item label="手机号或邮箱" prop="account">
        <el-input v-model="form.account" placeholder="请输入注册时使用的账号" clearable>
          <template #prefix><el-icon><User /></el-icon></template>
        </el-input>
      </el-form-item>
      <el-form-item label="登录密码" prop="password">
        <el-input v-model="form.password" type="password" placeholder="请输入登录密码" show-password>
          <template #prefix><el-icon><Lock /></el-icon></template>
        </el-input>
      </el-form-item>
      <div class="form-assist">
        <el-checkbox v-model="form.remember">保持登录状态</el-checkbox>
        <router-link to="/forgot-password">忘记密码</router-link>
      </div>
      <el-button class="submit-button" type="primary" :loading="loading" @click="submit">登录系统</el-button>
      <div class="auth-switch">还没有企业账号？<router-link to="/register">创建企业账号</router-link></div>
    </el-form>
  </AuthShell>
</template>
