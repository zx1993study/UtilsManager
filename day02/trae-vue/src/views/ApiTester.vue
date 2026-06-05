<template>
  <div class="api-tester">
    <el-card shadow="never" class="tester-card">
      <template #header>
        <div class="card-header">
          <span>🔧 API 连接测试工具</span>
          <el-button type="primary" size="small" @click="runAllTests" :loading="testing">
            <el-icon><VideoPlay /></el-icon>
            <span>批量测试</span>
          </el-button>
        </div>
      </template>

      <!-- 配置区域 -->
      <el-form :model="config" label-width="120px" class="config-form">
        <el-form-item label="后端地址">
          <el-input v-model="config.baseUrl" placeholder="http://localhost:8080">
            <template #append>
              <el-button @click="saveConfig">保存</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="超时时间(ms)">
          <el-input-number v-model="config.timeout" :min="1000" :max="30000" :step="1000" />
        </el-form-item>
      </el-form>

      <el-divider />

      <!-- 测试结果 -->
      <div class="test-results">
        <div v-for="(result, index) in testResults" :key="index" class="test-item">
          <el-card shadow="hover" :class="['result-card', result.status]">
            <div class="result-header">
              <el-tag :type="getStatusType(result.status)" size="large">
                {{ getStatusText(result.status) }}
              </el-tag>
              <span class="method">{{ result.method }}</span>
              <span class="url">{{ result.url }}</span>
              <span class="time">{{ result.responseTime }}ms</span>
            </div>
            
            <div v-if="result.error" class="error-info">
              <el-alert
                :title="result.error"
                type="error"
                :closable="false"
                show-icon
              />
            </div>

            <div v-if="result.data" class="response-data">
              <el-collapse>
                <el-collapse-item title="响应数据" name="1">
                  <pre>{{ JSON.stringify(result.data, null, 2) }}</pre>
                </el-collapse-item>
              </el-collapse>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 统计信息 -->
      <el-divider />
      <div class="statistics">
        <el-statistic title="总测试数" :value="testResults.length" />
        <el-statistic title="成功" :value="successCount" value-style="color: #67c23a" />
        <el-statistic title="失败" :value="failCount" value-style="color: #f56c6c" />
        <el-statistic title="平均耗时" :value="avgResponseTime" suffix="ms" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { VideoPlay } from '@element-plus/icons-vue'

const testing = ref(false)

// 配置
const config = reactive({
  baseUrl: localStorage.getItem('api_test_base_url') || 'http://localhost:8080',
  timeout: 10000
})

// 测试用例列表
const testCases = [
  { name: '健康检查', method: 'GET', url: '/health' },
  { name: 'API列表', method: 'GET', url: '/api/list' },
  { name: '参数模板列表', method: 'GET', url: '/api/template/list?apiId=1&pageNum=1&pageSize=10' },
  { name: '测试用例列表', method: 'GET', url: '/api/testcase/list?templateId=1&pageNum=1&pageSize=10' },
  { name: '项目列表', method: 'GET', url: '/project/list?pageNum=1&pageSize=10' }
]

// 测试结果
const testResults = ref([])

// 统计数据
const successCount = computed(() => testResults.value.filter(r => r.status === 'success').length)
const failCount = computed(() => testResults.value.filter(r => r.status === 'fail').length)
const avgResponseTime = computed(() => {
  if (testResults.value.length === 0) return 0
  const total = testResults.value.reduce((sum, r) => sum + (r.responseTime || 0), 0)
  return Math.round(total / testResults.value.length)
})

// 保存配置
const saveConfig = () => {
  localStorage.setItem('api_test_base_url', config.baseUrl)
  ElMessage.success('配置已保存')
}

// 执行单个测试
const runTest = async (testCase) => {
  const startTime = Date.now()
  const result = {
    name: testCase.name,
    method: testCase.method,
    url: `${config.baseUrl}${testCase.url}`,
    status: 'pending',
    responseTime: 0,
    data: null,
    error: null
  }

  try {
    const response = await axios({
      method: testCase.method.toLowerCase(),
      url: result.url,
      timeout: config.timeout
    })

    result.status = 'success'
    result.data = response.data
    result.responseTime = Date.now() - startTime
  } catch (error) {
    result.status = 'fail'
    result.responseTime = Date.now() - startTime
    
    if (error.code === 'ECONNREFUSED') {
      result.error = `连接被拒绝：后端服务未启动或地址错误 (${config.baseUrl})`
    } else if (error.code === 'ECONNABORTED') {
      result.error = `请求超时（${config.timeout}ms）`
    } else if (error.response) {
      result.error = `HTTP ${error.response.status}: ${error.response.statusText}`
    } else {
      result.error = error.message || '未知错误'
    }
  }

  return result
}

// 运行所有测试
const runAllTests = async () => {
  testing.value = true
  testResults.value = []

  for (const testCase of testCases) {
    const result = await runTest(testCase)
    testResults.value.push(result)
    
    // 添加延迟，避免请求过快
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  testing.value = false
  
  if (failCount.value === 0) {
    ElMessage.success('所有测试通过！✅')
  } else {
    ElMessage.warning(`测试完成：${successCount.value} 成功，${failCount.value} 失败`)
  }
}

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    success: 'success',
    fail: 'danger',
    pending: 'info'
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    success: '✓ 成功',
    fail: '✗ 失败',
    pending: '⏳ 测试中'
  }
  return texts[status] || status
}
</script>

<style scoped>
.api-tester {
  padding: 20px;
}

.tester-card {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.config-form {
  margin-top: 20px;
}

.test-results {
  margin-top: 20px;
}

.test-item {
  margin-bottom: 16px;
}

.result-card {
  transition: all 0.3s;
}

.result-card.success {
  border-left: 4px solid #67c23a;
}

.result-card.fail {
  border-left: 4px solid #f56c6c;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.method {
  font-weight: bold;
  color: #409eff;
}

.url {
  flex: 1;
  font-family: 'Courier New', monospace;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.time {
  color: #909399;
  font-size: 12px;
}

.error-info {
  margin-top: 12px;
}

.response-data {
  margin-top: 12px;
}

.response-data pre {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.6;
  max-height: 300px;
}

.statistics {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
}
</style>
