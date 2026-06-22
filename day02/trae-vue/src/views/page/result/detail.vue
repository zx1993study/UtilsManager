<template>
  <div class="page-result-detail">
    <div class="page-header">
      <div>
        <h2>结果详情</h2>
        <p>{{ detail.pageName || '-' }}</p>
      </div>
      <el-button @click="goBack">返回</el-button>
    </div>

    <el-card shadow="never" class="detail-card">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="页面功能名称">
          {{ detail.pageName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="执行结果">
          <el-tag :type="getStatusType(detail.resultStatus)">
            {{ getStatusText(detail.resultStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="地址" :span="2">
          <span class="break-text">{{ detail.pageUrl || '-' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="测试用例名称">
          {{ detail.testcaseName || detail.instanceName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="执行时间">
          {{ detail.executeTime || detail.createTime || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card shadow="never" class="detail-card">
      <template #header>参数 JSON</template>
      <pre class="code-block">{{ formatJson(detail.operationJson) }}</pre>
    </el-card>

    <el-card shadow="never" class="detail-card">
      <template #header>响应信息</template>
      <pre class="code-block">{{ detail.responseInfo || '-' }}</pre>
    </el-card>

    <el-card shadow="never" class="detail-card">
      <template #header>图片信息</template>
      <el-empty v-if="screenshots.length === 0" description="暂无图片" />
      <div v-else class="screenshot-list">
        <div v-for="item in screenshots" :key="item.name" class="screenshot-item">
          <el-image
            class="screenshot-image"
            :src="item.url"
            :preview-src-list="previewList"
            fit="contain"
            lazy
          >
            <template #error>
              <div class="image-error">图片加载失败</div>
            </template>
          </el-image>
          <span class="screenshot-name">{{ item.name }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getPageTestResultDetail } from '@/api/page/page-result'

const route = useRoute()
const router = useRouter()
const detail = ref({})

const getStatusType = (status) => {
  return status === 1 ? 'success' : 'danger'
}

const getStatusText = (status) => {
  return status === 1 ? '成功' : '失败'
}

const normalizeScreenshotPath = (value) => {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [value]
    } catch (error) {
      return [value]
    }
  }
  return []
}

const buildScreenshotUrl = (path) => {
  if (/^https?:\/\//i.test(path)) return path
  const cleanPath = String(path).replace(/\\/g, '/')
  const fileName = cleanPath.split('/').filter(Boolean).pop()
  const base = import.meta.env.VITE_API_BASE_URL || '/api'
  return fileName ? `${base}/static/screenshots/${encodeURIComponent(fileName)}` : cleanPath
}

const screenshots = computed(() => {
  return normalizeScreenshotPath(detail.value.screenshotPath).map(path => ({
    name: String(path).replace(/\\/g, '/').split('/').filter(Boolean).pop() || path,
    url: buildScreenshotUrl(path)
  }))
})

const previewList = computed(() => screenshots.value.map(item => item.url))

const formatJson = (value) => {
  if (!value) return '-'
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }
  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch (error) {
    return value
  }
}

const loadDetail = async () => {
  const resultId = route.params.resultId
  if (!resultId) return
  const res = await getPageTestResultDetail(resultId)
  if (res?.success) {
    detail.value = res.data || {}
  } else {
    ElMessage.error(res?.msg || '加载结果详情失败')
  }
}

const goBack = () => {
  router.back()
}

onMounted(loadDetail)
</script>

<style scoped>
.page-result-detail {
  padding: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.page-header p {
  margin: 6px 0 0;
  color: #606266;
}

.detail-card {
  margin-bottom: 12px;
}

.break-text {
  word-break: break-all;
}

.code-block {
  min-height: 84px;
  margin: 0;
  padding: 12px;
  overflow: auto;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  border-radius: 6px;
  background: #f5f7fa;
  color: #303133;
  font-family: Consolas, Monaco, 'Courier New', monospace;
}

.screenshot-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.screenshot-item {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
}

.screenshot-image {
  width: 100%;
  height: 180px;
  background: #f5f7fa;
}

.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 180px;
  color: #909399;
}

.screenshot-name {
  display: block;
  padding: 8px;
  color: #606266;
  word-break: break-all;
}
</style>
