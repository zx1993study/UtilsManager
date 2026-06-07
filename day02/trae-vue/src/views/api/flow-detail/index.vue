<template>
  <div class="flow-detail">
    <!-- 顶部流程信息 -->
    <el-card shadow="never" class="flow-header">
      <div class="header-content">
        <div class="flow-info">
          <h2>{{ flowInfo.flowName || '加载中...' }}</h2>
          <el-descriptions :column="3" border size="small">
            <el-descriptions-item label="项目名称">{{ flowInfo.projectName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="项目地址">{{ flowInfo.projectAddress || '-' }}</el-descriptions-item>
            <el-descriptions-item label="备注">{{ flowInfo.remark || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="handleRunFlow" :loading="runFlowLoading">
            <el-icon><VideoPlay /></el-icon>
            <span>运行流程</span>
          </el-button>
          <el-button @click="handleBack">
            <el-icon><ArrowLeft /></el-icon>
            <span>返回</span>
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 步骤列表 -->
    <div class="steps-container">
      <div class="steps-header">
        <h3>流程步骤 ({{ steps.length }})</h3>
        <el-button type="success" @click="handleAddStep">
          <el-icon><Plus /></el-icon>
          <span>添加步骤</span>
        </el-button>
      </div>

      <!-- 步骤卡片列表 -->
      <div v-if="steps.length > 0" class="steps-list">
        <el-card 
          v-for="(step, index) in steps" 
          :key="step.stepId || index"
          class="step-card"
          shadow="hover"
        >
          <template #header>
            <div class="step-header">
              <span class="step-title">步骤 {{ index + 1 }}</span>
              <el-button 
                type="danger" 
                size="small" 
                link
                @click="handleDeleteStep(index)"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </template>

          <div class="step-content">
            <!-- API和实例选择 -->
            <div class="step-form">
              <el-form-item label="API">
                <el-select 
                  v-model="step.apiId" 
                  placeholder="请选择API" 
                  style="width: 250px"
                  @change="handleApiChange(index)"
                  :disabled="!canEditStep(step)"
                >
                  <el-option
                    v-for="api in apiList"
                    :key="api.apiId"
                    :label="api.apiName"
                    :value="api.apiId"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="API实例">
                <el-select 
                  v-model="step.instanceId" 
                  placeholder="请选择实例" 
                  style="width: 250px"
                  :disabled="!step.apiId || !canEditStep(step)"
                >
                  <el-option
                    v-for="instance in getInstanceOptions(index)"
                    :key="instance.instanceId"
                    :label="instance.instanceName"
                    :value="instance.instanceId"
                  />
                </el-select>
              </el-form-item>

              <el-form-item>
                <el-button 
                  type="primary" 
                  size="small"
                  @click="handleRunStep(index)"
                  :loading="step.running"
                  :disabled="!step.instanceId"
                >
                  <el-icon><VideoPlay /></el-icon>
                  <span>运行</span>
                </el-button>
              </el-form-item>
            </div>

            <!-- instanceJson编辑框 -->
            <el-form-item label="实例参数" class="json-editor">
              <el-input 
                v-model="step.params" 
                type="textarea" 
                :rows="4"
                placeholder="请输入实例参数(JSON格式)"
                :disabled="!canEditStep(step)"
              />
            </el-form-item>

            <!-- 结果展示区域 -->
            <div v-if="step.result" class="result-section">
              <el-divider content-position="left">运行结果</el-divider>
              <el-descriptions :column="2" border size="small">
                <el-descriptions-item label="Code">
                  <el-tag :type="getCodeType(step.result.code)">
                    {{ step.result.code }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="耗时">
                  {{ step.result.remark || '-' }}
                </el-descriptions-item>
              </el-descriptions>
              
              <div class="response-info">
                <div class="response-label">Response:</div>
                <pre class="json-content">{{ formatJson(step.result.responseInfo) }}</pre>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 空状态 -->
      <el-empty v-else description="暂无步骤，请点击上方按钮添加步骤" />
    </div>

    <!-- 添加步骤弹窗 -->
    <common-dialog
      v-model="addStepDialogVisible"
      title="添加步骤"
      :form-data="addStepFormData"
      :rules="addStepRules"
      :loading="addStepLoading"
      width="700px"
      @confirm="handleAddStepSubmit"
    >
      <el-form-item label="API" prop="apiId">
        <el-select 
          v-model="addStepFormData.apiId" 
          placeholder="请选择API" 
          style="width: 100%"
          @change="handleAddStepApiChange"
        >
          <el-option
            v-for="api in apiList"
            :key="api.apiId"
            :label="api.apiName"
            :value="api.apiId"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="API实例" prop="instanceId">
        <el-select 
          v-model="addStepFormData.instanceId" 
          placeholder="请选择实例" 
          style="width: 100%"
          :disabled="!addStepFormData.apiId"
        >
          <el-option
            v-for="instance in addStepInstanceOptions"
            :key="instance.instanceId"
            :label="instance.instanceName"
            :value="instance.instanceId"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="实例参数" prop="params">
        <el-input 
          v-model="addStepFormData.params" 
          type="textarea" 
          :rows="4"
          placeholder="请输入实例参数(JSON格式)"
        />
      </el-form-item>
    </common-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { VideoPlay, ArrowLeft, Plus, Delete } from '@element-plus/icons-vue'
import CommonDialog from '@/components/CommonDialog.vue'
import * as flowApi from '@/api/api/api-flow'
import * as flowStepApi from '@/api/api/api-flow-step'
import * as apiApi from '@/api/api/api'
import * as testcaseApi from '@/api/api/api-testcase'
import * as apiResultApi from '@/api/api/api-result'

const route = useRoute()
const router = useRouter()

const flowId = computed(() => route.params.flowId)

// 流程信息
const flowInfo = ref({})

// 步骤列表
const steps = ref([])

// API列表
const apiList = ref([])

// 每个步骤的实例选项缓存
const instanceOptionsCache = ref({})

// 运行流程加载状态
const runFlowLoading = ref(false)

// 添加步骤弹窗
const addStepDialogVisible = ref(false)
const addStepLoading = ref(false)
const addStepFormData = reactive({
  apiId: null,
  instanceId: null,
  params: ''
})
const addStepInstanceOptions = ref([])

// 表单验证规则
const addStepRules = {
  apiId: [{ required: true, message: '请选择API', trigger: 'change' }],
  instanceId: [{ required: true, message: '请选择实例', trigger: 'change' }]
}

// 加载流程信息
const loadFlowInfo = async () => {
  try {
    const res = await flowApi.getFlowDetail(flowId.value)
    if (res.success && res.data) {
      flowInfo.value = res.data
    }
  } catch (error) {
    console.error('加载流程信息失败:', error)
    ElMessage.error('加载流程信息失败')
  }
}

// 加载步骤列表
const loadSteps = async () => {
  try {
    const res = await flowStepApi.getFlowStepsByFlowId(flowId.value)
    if (res.success && res.data) {
      steps.value = res.data.map(step => ({
        ...step,
        running: false,
        result: null
      }))
    }
  } catch (error) {
    console.error('加载步骤列表失败:', error)
    ElMessage.error('加载步骤列表失败')
  }
}

// 加载API列表
const loadApiList = async () => {
  try {
    const res = await apiApi.getApiList({ pageNum: 1, pageSize: 1000 })
    apiList.value = res.data?.items || res.data?.list || []
  } catch (error) {
    console.error('加载API列表失败:', error)
  }
}

// 获取指定步骤的实例选项
const getInstanceOptions = (index) => {
  const step = steps.value[index]
  if (!step || !step.apiId) return []
  
  // 如果缓存中有，直接返回
  if (instanceOptionsCache.value[step.apiId]) {
    return instanceOptionsCache.value[step.apiId]
  }
  
  return []
}

// 加载指定API的实例列表
const loadInstancesForApi = async (apiId) => {
  if (instanceOptionsCache.value[apiId]) {
    return instanceOptionsCache.value[apiId]
  }
  
  try {
    const res = await testcaseApi.getTestcaseList({ apiId, pageNum: 1, pageSize: 1000 })
    const instances = res.data?.items || res.data?.list || []
    instanceOptionsCache.value[apiId] = instances
    return instances
  } catch (error) {
    console.error('加载实例列表失败:', error)
    return []
  }
}

// API改变事件
const handleApiChange = async (index) => {
  const step = steps.value[index]
  step.instanceId = null
  step.params = ''
  
  if (step.apiId) {
    await loadInstancesForApi(step.apiId)
  }
}

// 判断步骤是否可编辑
const canEditStep = (step) => {
  // 如果步骤正在运行或已有结果，则不可编辑
  return !step.running && !step.result
}

// 格式化JSON
const formatJson = (jsonStr) => {
  if (!jsonStr) return '-'
  try {
    const obj = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr
    return JSON.stringify(obj, null, 2)
  } catch (e) {
    return jsonStr
  }
}

// 获取Code类型
const getCodeType = (code) => {
  if (!code) return 'info'
  const codeNum = parseInt(code)
  if (codeNum >= 200 && codeNum < 300) return 'success'
  if (codeNum >= 400 && codeNum < 500) return 'warning'
  if (codeNum >= 500) return 'danger'
  return 'info'
}

// 运行单个步骤
const handleRunStep = async (index) => {
  const step = steps.value[index]
  
  if (!step.instanceId) {
    ElMessage.warning('请先选择API实例')
    return
  }
  
  // 如果有params，先更新实例的instanceJson
  if (step.params) {
    try {
      await testcaseApi.updateTestcase({
        instanceId: step.instanceId,
        instanceJson: step.params
      })
    } catch (error) {
      console.error('更新实例参数失败:', error)
      ElMessage.error('更新实例参数失败')
      return
    }
  }
  
  step.running = true
  
  try {
    // 执行API
    await apiResultApi.executeApi(step.instanceId)
    
    // 获取最新结果
    const res = await apiResultApi.getLatestResultByInstanceId(step.instanceId)
    if (res.success && res.data) {
      step.result = res.data
      ElMessage.success('运行成功')
    } else {
      ElMessage.warning('未获取到运行结果')
    }
  } catch (error) {
    console.error('运行失败:', error)
    ElMessage.error('运行失败')
  } finally {
    step.running = false
  }
}

// 运行整个流程
const handleRunFlow = async () => {
  if (steps.value.length === 0) {
    ElMessage.warning('流程中没有步骤')
    return
  }
  
  runFlowLoading.value = true
  
  try {
    // 收集所有实例ID
    const instanceIds = steps.value
      .filter(step => step.instanceId)
      .map(step => step.instanceId)
    
    if (instanceIds.length === 0) {
      ElMessage.warning('没有可运行的步骤')
      return
    }
    
    // TODO: 调用批量执行接口
    ElMessage.info('批量执行功能开发中...')
    
    // 临时方案：依次执行每个步骤
    for (let i = 0; i < steps.value.length; i++) {
      if (steps.value[i].instanceId) {
        await handleRunStep(i)
        // 等待一下再执行下一个
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    
    ElMessage.success('流程执行完成')
  } catch (error) {
    console.error('流程执行失败:', error)
    ElMessage.error('流程执行失败')
  } finally {
    runFlowLoading.value = false
  }
}

// 添加步骤
const handleAddStep = () => {
  Object.assign(addStepFormData, {
    apiId: null,
    instanceId: null,
    params: ''
  })
  addStepInstanceOptions.value = []
  addStepDialogVisible.value = true
}

// 添加步骤弹窗中API改变
const handleAddStepApiChange = async (apiId) => {
  addStepFormData.instanceId = null
  
  if (apiId) {
    const instances = await loadInstancesForApi(apiId)
    addStepInstanceOptions.value = instances
  } else {
    addStepInstanceOptions.value = []
  }
}

// 提交添加步骤
const handleAddStepSubmit = async () => {
  try {
    addStepLoading.value = true
    
    const stepData = {
      flowId: flowId.value,
      apiId: addStepFormData.apiId,
      instanceId: addStepFormData.instanceId,
      params: addStepFormData.params,
      flowType: 1
    }
    
    await flowStepApi.addFlowStep(stepData)
    ElMessage.success('添加成功')
    addStepDialogVisible.value = false
    
    // 重新加载步骤列表
    await loadSteps()
  } catch (error) {
    console.error('添加失败:', error)
    ElMessage.error('添加失败')
  } finally {
    addStepLoading.value = false
  }
}

// 删除步骤
const handleDeleteStep = (index) => {
  const step = steps.value[index]
  
  ElMessageBox.confirm(`确定要删除步骤 ${index + 1} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      if (step.stepId) {
        await flowStepApi.deleteFlowStep(step.stepId)
      }
      
      steps.value.splice(index, 1)
      ElMessage.success('删除成功')
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

// 返回
const handleBack = () => {
  router.back()
}

onMounted(async () => {
  await Promise.all([
    loadFlowInfo(),
    loadSteps(),
    loadApiList()
  ])
})
</script>

<style scoped>
.flow-detail {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.flow-header {
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.flow-info {
  flex: 1;
}

.flow-info h2 {
  margin: 0 0 15px 0;
  font-size: 20px;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.steps-container {
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
}

.steps-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.steps-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.steps-list {
  display: flex;
  flex-direction: row;
  gap: 15px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.step-card {
  border: 1px solid #dcdfe6;
  min-width: 500px;
  max-width: 600px;
  flex-shrink: 0;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-title {
  font-weight: bold;
  font-size: 14px;
  color: #303133;
}

.step-content {
  padding: 10px 0;
}

.step-form {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.step-form :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 0;
}

.json-editor {
  margin-bottom: 15px;
}

.json-editor :deep(.el-form-item__label) {
  width: 80px;
}

.result-section {
  margin-top: 15px;
}

.response-info {
  margin-top: 10px;
}

.response-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.json-content {
  margin: 0;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
  max-height: 300px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
