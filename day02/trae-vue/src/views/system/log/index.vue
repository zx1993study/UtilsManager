<template>
  <div class="log-management">
    <el-card shadow="never" class="log-toolbar-card">
      <div class="log-toolbar">
        <div class="toolbar-left">
          <el-input-number
            v-model="lineCount"
            :min="20"
            :max="2000"
            :step="50"
            controls-position="right"
            class="line-input"
          />
          <el-switch
            v-model="autoRefresh"
            active-text="自动刷新"
            inactive-text="暂停"
          />
          <el-select v-model="refreshInterval" class="interval-select">
            <el-option label="2 秒" :value="2000" />
            <el-option label="5 秒" :value="5000" />
            <el-option label="10 秒" :value="10000" />
          </el-select>
        </div>

        <div class="toolbar-right">
          <el-button :loading="loading" @click="fetchLogs">
            <el-icon><Refresh /></el-icon>
            <span>刷新</span>
          </el-button>
          <el-button :loading="cleanupLoading" @click="handleCleanup">
            <el-icon><Delete /></el-icon>
            <span>清理旧日志</span>
          </el-button>
          <el-button type="danger" :loading="clearLoading" @click="handleClear">
            <el-icon><DeleteFilled /></el-icon>
            <span>清空当前日志</span>
          </el-button>
        </div>
      </div>

      <div class="log-meta">
        <span>展示最新 {{ logInfo.lineCount || 0 }} / {{ logInfo.requestedLines || lineCount }} 行</span>
        <span>文件大小：{{ formatSize(logInfo.fileSize) }}</span>
        <span>更新时间：{{ logInfo.updatedAt || '-' }}</span>
        <span class="log-file" :title="logInfo.logFile">文件：{{ logInfo.logFile || '-' }}</span>
      </div>
    </el-card>

    <el-card shadow="never" class="log-content-card">
      <pre ref="logPanelRef" v-loading="loading" class="log-panel">{{ logText }}</pre>
    </el-card>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { Delete, DeleteFilled, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { cleanupLogs, clearLogs, getRuntimeLogs } from '@/api/system/log'

const loading = ref(false)
const clearLoading = ref(false)
const cleanupLoading = ref(false)
const autoRefresh = ref(false)
const lineCount = ref(300)
const refreshInterval = ref(5000)
const logLines = ref([])
const logPanelRef = ref(null)
const timer = ref(null)

const logInfo = reactive({
  lineCount: 0,
  requestedLines: 300,
  logFile: '',
  fileSize: 0,
  updatedAt: ''
})

const logText = computed(() => {
  return logLines.value.length ? logLines.value.join('\n') : '暂无后台日志'
})

const formatSize = (size = 0) => {
  if (!size) return '0 B'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

const scrollToBottom = async () => {
  await nextTick()
  const el = logPanelRef.value
  if (el) {
    el.scrollTop = el.scrollHeight
  }
}

const fetchLogs = async () => {
  loading.value = true
  try {
    const res = await getRuntimeLogs({ lines: lineCount.value })
    if (res.success) {
      const data = res.data || {}
      logLines.value = data.lines || []
      Object.assign(logInfo, {
        lineCount: data.lineCount || 0,
        requestedLines: data.requestedLines || lineCount.value,
        logFile: data.logFile || '',
        fileSize: data.fileSize || 0,
        updatedAt: data.updatedAt || ''
      })
      await scrollToBottom()
    }
  } finally {
    loading.value = false
  }
}

const stopTimer = () => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
}

const startTimer = () => {
  stopTimer()
  if (autoRefresh.value) {
    timer.value = setInterval(fetchLogs, refreshInterval.value)
  }
}

const handleClear = () => {
  ElMessageBox.confirm('确定要清空当前后台日志文件吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    clearLoading.value = true
    try {
      const res = await clearLogs()
      if (res.success) {
        ElMessage.success(res.msg || '清空成功')
        await fetchLogs()
      }
    } finally {
      clearLoading.value = false
    }
  }).catch(() => {})
}

const handleCleanup = async () => {
  cleanupLoading.value = true
  try {
    const res = await cleanupLogs()
    if (res.success) {
      ElMessage.success(res.msg || '清理完成')
      await fetchLogs()
    }
  } finally {
    cleanupLoading.value = false
  }
}

watch([autoRefresh, refreshInterval], startTimer)

watch(lineCount, () => {
  fetchLogs()
})

onMounted(async () => {
  await fetchLogs()
  startTimer()
})

onBeforeUnmount(() => {
  stopTimer()
})
</script>

<style scoped>
.log-management {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.log-toolbar-card {
  flex: none;
}

.log-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.line-input {
  width: 140px;
}

.interval-select {
  width: 110px;
}

.log-meta {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  margin-top: 12px;
  color: #667085;
  font-size: 13px;
}

.log-file {
  max-width: 520px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-content-card {
  flex: 1;
  min-height: 0;
}

.log-content-card :deep(.el-card__body) {
  height: 100%;
  padding: 0;
}

.log-panel {
  height: 100%;
  min-height: 520px;
  margin: 0;
  padding: 16px;
  overflow: auto;
  background: #111827;
  color: #d1d5db;
  font-size: 13px;
  line-height: 1.6;
  font-family: Consolas, Monaco, 'Courier New', monospace;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
