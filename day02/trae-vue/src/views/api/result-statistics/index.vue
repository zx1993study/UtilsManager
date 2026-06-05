<template>
  <div class="api-result-statistics">
    <!-- 头部区域 -->
    <el-card shadow="never" class="header-card">
      <div class="page-header">
        <h2 class="title">
          <el-tag :type="getMethodType(apiData.method)" size="large">
            {{ apiData.method }}
          </el-tag>
          <span class="url">{{ apiData.apiPath }}</span>
        </h2>
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回</span>
        </el-button>
      </div>

      <!-- 统计卡片 -->
      <div class="statistics-cards">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon total">
              <el-icon :size="32"><Files /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">测试用例总数</div>
              <div class="stat-value">{{ statistics.totalCount }}</div>
            </div>
          </div>
        </el-card>

        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon pass">
              <el-icon :size="32"><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">通过用例</div>
              <div class="stat-value success">{{ statistics.passCount }}</div>
              <div class="stat-rate">
                通过率: {{ statistics.passRate }}%
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </el-card>

    <!-- 测试结果列表 -->
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span>测试结果列表</span>
          <div class="header-actions">
            <el-button type="danger" size="small" @click="handleClearAll">
              <el-icon><Delete /></el-icon>
              <span>清空结果</span>
            </el-button>
          </div>
        </div>
      </template>

      <common-table
        ref="tableRef"
        :columns="columns"
        :api-method="apiResultApi.getTestResultList"
        :api-params="{ apiId: route.params.id }"
        :pagination="pagination"
        :search-fields="searchFields"
        @delete="handleDelete"
        @batch-delete="handleBatchDelete"
        :show-add="false"
        :show-edit="false"
      >
        <template #status="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </common-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Files, CircleCheck, Delete } from '@element-plus/icons-vue'
import CommonTable from '@/components/CommonTable.vue'
import * as apiApi from '@/api/api/api'
import * as apiResultApi from '@/api/api/api-result'

const route = useRoute()
const router = useRouter()
const tableRef = ref(null)

// API数据
const apiData = reactive({
  id: null,
  apiName: '',
  apiPath: '',
  method: 'GET'
})

// 统计数据
const statistics = reactive({
  totalCount: 0,
  passCount: 0,
  failCount: 0,
  passRate: 0
})

// 列配置
const columns = [
  { prop: 'testcaseName', label: '用例名称', minWidth: 200 },
  { prop: 'apiName', label: '接口名称', minWidth: 200 },
  { prop: 'status', label: '测试结果', width: 100, slot: 'status' },
  { prop: 'responseTime', label: '响应时间(ms)', width: 120 },
  { prop: 'executeTime', label: '执行时间', width: 180 }
]

// 搜索字段配置
const searchFields = [
  { type: 'input', prop: 'testcaseName', label: '用例名称', placeholder: '请输入用例名称' },
  { type: 'select', prop: 'status', label: '测试结果', placeholder: '请选择状态',
    options: [
      { label: '通过', value: 1 },
      { label: '失败', value: 0 }
    ]
  }
]

// 分页配置
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 获取HTTP方法类型
const getMethodType = (method) => {
  const types = {
    GET: 'success',
    POST: 'primary',
    PUT: 'warning',
    DELETE: 'danger'
  }
  return types[method] || 'info'
}

// 获取状态类型
const getStatusType = (status) => {
  return status === 1 ? 'success' : 'danger'
}

// 获取状态文本
const getStatusText = (status) => {
  return status === 1 ? '通过' : '失败'
}

// 获取响应时间样式类
const getResponseTimeClass = (time) => {
  if (!time) return ''
  if (time < 200) return 'time-fast'
  if (time < 500) return 'time-normal'
  return 'time-slow'
}

// 加载API详情
const loadApiDetail = async () => {
  try {
    const res = await apiApi.getApiDetail(route.params.id)
    Object.assign(apiData, res.data)
  } catch (error) {
    console.error('加载API详情失败:', error)
    ElMessage.error('加载API详情失败')
  }
}

// 加载统计数据
const loadStatistics = async () => {
  try {
    const res = await apiResultApi.getTestResultList({
      apiId: route.params.id,
      pageNum: 1,
      pageSize: 1
    })
    
    // 从返回数据中提取统计信息
    const data = res.data
    statistics.totalCount = data?.total || 0
    
    // 计算通过数和通过率
    const allResults = await apiResultApi.getTestResultList({
      apiId: route.params.id,
      pageNum: 1,
      pageSize: statistics.totalCount
    })
    
    const results = allResults.data?.list || allResults.data || []
    statistics.passCount = results.filter(r => r.status === 1).length
    statistics.failCount = results.filter(r => r.status === 0).length
    statistics.passRate = statistics.totalCount > 0 
      ? ((statistics.passCount / statistics.totalCount) * 100).toFixed(2)
      : 0
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 返回
const goBack = () => {
  router.back()
}

// 删除测试结果
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该测试结果吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await apiResultApi.deleteApiResult(row.id)
      ElMessage.success('删除成功')
      tableRef.value?.refresh()
      await loadStatistics()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

// 批量删除测试结果
const handleBatchDelete = async (rows) => {
  ElMessageBox.confirm(`确定要删除选中的 ${rows.length} 个测试结果吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = rows.map(row => row.id)
      await apiResultApi.batchDeleteApiResult(ids)
      ElMessage.success('批量删除成功')
      tableRef.value?.refresh()
      await loadStatistics()
    } catch (error) {
      console.error('批量删除失败:', error)
    }
  }).catch(() => {})
}

// 清空所有结果
const handleClearAll = () => {
  ElMessageBox.confirm('确定要清空所有测试结果吗？此操作不可恢复！', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await apiResultApi.clearTestResults()
      ElMessage.success('清空成功')
      tableRef.value?.refresh()
      await loadStatistics()
    } catch (error) {
      console.error('清空失败:', error)
    }
  }).catch(() => {})
}

// 初始化
onMounted(async () => {
  await loadApiDetail()
  await loadStatistics()
})
</script>

<style scoped>
.api-result-statistics {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.header-card {
  flex-shrink: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 18px;
}

.url {
  font-family: 'Courier New', monospace;
  color: #606266;
}

.statistics-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-card {
  border: 1px solid #e4e7ed;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.pass {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
}

.stat-value.success {
  color: #67c23a;
}

.stat-rate {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.table-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.time-fast {
  color: #67c23a;
  font-weight: 500;
}

.time-normal {
  color: #e6a23c;
  font-weight: 500;
}

.time-slow {
  color: #f56c6c;
  font-weight: 500;
}
</style>
