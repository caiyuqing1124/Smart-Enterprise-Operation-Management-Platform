<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '../../stores/auth'
import { useWorkbenchStore } from '../../stores/workbench'

const router = useRouter()
const authStore = useAuthStore()
const workbenchStore = useWorkbenchStore()
const taskFilter = ref('pending')
const taskDialogVisible = ref(false)
const scheduleDialogVisible = ref(false)
const approvalDialogVisible = ref(false)
const taskFormRef = ref()
const scheduleFormRef = ref()
const selectedApproval = ref(null)
const taskForm = reactive({ title: '', source: '个人任务', priority: '中', deadline: '' })
const scheduleForm = reactive({ title: '', time: '', location: '', type: '会议' })

const filteredTasks = computed(() => workbenchStore.tasks.filter((item) => item.status === taskFilter.value))
const pendingTaskCount = computed(() => workbenchStore.tasks.filter((item) => item.status === 'pending').length)
const completedTaskCount = computed(() => workbenchStore.tasks.filter((item) => item.status === 'completed').length)
const pendingApprovals = computed(() => workbenchStore.approvals.filter((item) => item.status === 'pending'))
const today = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date())

const taskRules = {
  title: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  deadline: [{ required: true, message: '请选择截止时间', trigger: 'change' }],
}
const scheduleRules = {
  title: [{ required: true, message: '请输入日程名称', trigger: 'blur' }],
  time: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  location: [{ required: true, message: '请输入会议地点或线上方式', trigger: 'blur' }],
}

function openTaskDialog() {
  Object.assign(taskForm, { title: '', source: '个人任务', priority: '中', deadline: '' })
  taskDialogVisible.value = true
}

async function addTask() {
  await taskFormRef.value.validate()
  workbenchStore.addTask({ ...taskForm, deadline: taskForm.deadline.replace('T', ' ') })
  taskDialogVisible.value = false
  taskFilter.value = 'pending'
  ElMessage.success('任务已加入我的待办')
}

function toggleTask(task) {
  const wasCompleted = task.status === 'completed'
  workbenchStore.toggleTask(task.id)
  ElMessage.success(wasCompleted ? '任务已重新打开' : '任务已完成')
}

function openScheduleDialog() {
  Object.assign(scheduleForm, { title: '', time: '', location: '', type: '会议' })
  scheduleDialogVisible.value = true
}

async function addSchedule() {
  await scheduleFormRef.value.validate()
  workbenchStore.addSchedule({ ...scheduleForm })
  scheduleDialogVisible.value = false
  ElMessage.success('日程已添加')
}

function viewSchedule(item) {
  ElMessageBox.alert(`${item.time} · ${item.location}`, item.title, {
    confirmButtonText: '知道了',
    type: 'info',
  })
}

function openApproval(approval) {
  selectedApproval.value = approval
  approvalDialogVisible.value = true
}

function decideApproval(status) {
  workbenchStore.handleApproval(selectedApproval.value.id, status)
  approvalDialogVisible.value = false
  ElMessage.success(status === 'approved' ? '审批已通过' : '审批已退回申请人')
}

function priorityType(priority) {
  return { 高: 'danger', 中: 'warning', 低: 'info' }[priority]
}

function formatMoney(value) {
  return value ? `¥${value.toLocaleString()}` : '不涉及金额'
}
</script>

<template>
  <div class="workbench-page personal-page">
    <section class="personal-command">
      <div class="personal-greeting">
        <span>{{ today }}</span>
        <h1>{{ authStore.currentUser?.name }}，今天有 {{ pendingTaskCount }} 项任务待处理</h1>
        <p>优先完成临近截止事项，保持项目和经营流程顺畅推进。</p>
      </div>
      <div class="personal-brief">
        <div><strong>{{ pendingTaskCount }}</strong><span>待办任务</span></div>
        <div><strong>{{ pendingApprovals.length }}</strong><span>待我审批</span></div>
        <div><strong>{{ workbenchStore.schedules.length }}</strong><span>今日日程</span></div>
      </div>
      <div class="command-actions">
        <el-button type="primary" @click="openTaskDialog"><el-icon><Plus /></el-icon>新建任务</el-button>
        <el-button @click="openScheduleDialog"><el-icon><Calendar /></el-icon>添加日程</el-button>
        <el-button @click="router.push('/workbench/messages')"><el-icon><Bell /></el-icon>查看消息</el-button>
      </div>
    </section>

    <div class="personal-work-grid">
      <section class="wb-panel task-board">
        <div class="wb-panel-head task-board-head">
          <div><h2>我的任务</h2><p>按优先级和截止时间推进个人事项</p></div>
          <el-radio-group v-model="taskFilter" size="small">
            <el-radio-button value="pending">待处理 {{ pendingTaskCount }}</el-radio-button>
            <el-radio-button value="completed">已完成 {{ completedTaskCount }}</el-radio-button>
          </el-radio-group>
        </div>
        <div class="task-list">
          <div v-for="task in filteredTasks" :key="task.id" class="task-row" :class="{ completed: task.status === 'completed' }">
            <button class="task-check" type="button" :aria-label="task.status === 'completed' ? '重新打开任务' : '完成任务'" @click="toggleTask(task)">
              <el-icon><CircleCheckFilled v-if="task.status === 'completed'" /><CircleCheck v-else /></el-icon>
            </button>
            <div class="task-main">
              <strong>{{ task.title }}</strong>
              <span>{{ task.source }} · 负责人：{{ task.owner }}</span>
            </div>
            <el-tag :type="priorityType(task.priority)" effect="light" size="small">{{ task.priority }}优先级</el-tag>
            <div class="task-deadline"><el-icon><Clock /></el-icon>{{ task.deadline }}</div>
          </div>
          <el-empty v-if="filteredTasks.length === 0" description="当前分类下没有任务" :image-size="72" />
        </div>
      </section>

      <section class="day-plan">
        <div class="day-plan-head">
          <div><span>今日安排</span><strong>{{ workbenchStore.schedules.length }} 项</strong></div>
          <el-button circle size="small" @click="openScheduleDialog"><el-icon><Plus /></el-icon></el-button>
        </div>
        <div class="schedule-timeline">
          <button v-for="(item, index) in workbenchStore.schedules" :key="item.id" type="button" class="schedule-item" @click="viewSchedule(item)">
            <span class="schedule-time">{{ item.time }}</span>
            <i :class="`tone-${index % 4}`"></i>
            <span class="schedule-copy"><strong>{{ item.title }}</strong><small>{{ item.location }} · {{ item.type }}</small></span>
            <el-icon><ArrowRight /></el-icon>
          </button>
        </div>
      </section>
    </div>

    <section class="approval-section">
      <div class="approval-intro">
        <span class="approval-icon"><el-icon><Stamp /></el-icon></span>
        <div><h2>待我审批</h2><p>需要您决策的业务申请</p></div>
        <strong>{{ pendingApprovals.length }}</strong>
      </div>
      <div class="approval-cards">
        <article v-for="approval in pendingApprovals" :key="approval.id" class="approval-card">
          <div class="approval-card-top"><el-tag size="small" effect="plain">{{ approval.department }}</el-tag><span>{{ approval.submittedAt }}</span></div>
          <h3>{{ approval.title }}</h3>
          <p>{{ approval.applicant }}提交 · {{ formatMoney(approval.amount) }}</p>
          <el-button type="primary" link @click="openApproval(approval)">立即处理<el-icon><ArrowRight /></el-icon></el-button>
        </article>
        <div v-if="pendingApprovals.length === 0" class="approval-cleared"><el-icon><CircleCheckFilled /></el-icon><span>当前审批已全部处理</span></div>
      </div>
    </section>

    <el-dialog v-model="taskDialogVisible" title="新建个人任务" width="520px">
      <el-form ref="taskFormRef" :model="taskForm" :rules="taskRules" label-position="top">
        <el-form-item label="任务名称" prop="title"><el-input v-model="taskForm.title" maxlength="40" show-word-limit placeholder="请输入需要完成的事项" /></el-form-item>
        <div class="dialog-form-grid">
          <el-form-item label="任务来源"><el-select v-model="taskForm.source" style="width: 100%"><el-option label="个人任务" value="个人任务" /><el-option label="经营管理" value="经营管理" /><el-option label="项目交付" value="项目交付" /></el-select></el-form-item>
          <el-form-item label="优先级"><el-select v-model="taskForm.priority" style="width: 100%"><el-option label="高" value="高" /><el-option label="中" value="中" /><el-option label="低" value="低" /></el-select></el-form-item>
        </div>
        <el-form-item label="截止时间" prop="deadline"><el-date-picker v-model="taskForm.deadline" type="datetime" value-format="YYYY-MM-DDTHH:mm" placeholder="选择截止时间" style="width: 100%" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="taskDialogVisible = false">取消</el-button><el-button type="primary" @click="addTask">保存任务</el-button></template>
    </el-dialog>

    <el-dialog v-model="scheduleDialogVisible" title="添加日程" width="520px">
      <el-form ref="scheduleFormRef" :model="scheduleForm" :rules="scheduleRules" label-position="top">
        <el-form-item label="日程名称" prop="title"><el-input v-model="scheduleForm.title" placeholder="请输入日程名称" /></el-form-item>
        <div class="dialog-form-grid">
          <el-form-item label="开始时间" prop="time"><el-time-select v-model="scheduleForm.time" start="08:00" step="00:30" end="20:00" placeholder="选择时间" style="width: 100%" /></el-form-item>
          <el-form-item label="日程类型"><el-select v-model="scheduleForm.type" style="width: 100%"><el-option label="会议" value="会议" /><el-option label="项目" value="项目" /><el-option label="经营" value="经营" /><el-option label="沟通" value="沟通" /></el-select></el-form-item>
        </div>
        <el-form-item label="地点或方式" prop="location"><el-input v-model="scheduleForm.location" placeholder="请输入会议室或线上会议方式" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="scheduleDialogVisible = false">取消</el-button><el-button type="primary" @click="addSchedule">保存日程</el-button></template>
    </el-dialog>

    <el-dialog v-model="approvalDialogVisible" title="审批处理" width="540px">
      <div v-if="selectedApproval" class="approval-detail">
        <h3>{{ selectedApproval.title }}</h3>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="申请人">{{ selectedApproval.applicant }}</el-descriptions-item>
          <el-descriptions-item label="申请部门">{{ selectedApproval.department }}</el-descriptions-item>
          <el-descriptions-item label="申请金额">{{ formatMoney(selectedApproval.amount) }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">2026-{{ selectedApproval.submittedAt }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer><el-button type="danger" plain @click="decideApproval('rejected')">退回申请</el-button><el-button type="primary" @click="decideApproval('approved')">审批通过</el-button></template>
    </el-dialog>
  </div>
</template>
