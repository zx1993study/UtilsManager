<template>
  <div class="api-detail">
    <!-- 页面标题 -->
    <el-card shadow="never" class="header-card">
      <div class="page-header">
        <h2 class="title">
          <el-tag :type="getMethodType(apiData.methodType)" size="large">
            {{ getMethodLabel(apiData.methodType) }}
          </el-tag>
          <span class="url">{{ apiData.methodUrl }}</span>
        </h2>
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回</span>
        </el-button>
      </div>
    </el-card>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <!-- 左侧：参数模板列表 -->
      <el-card shadow="never" class="left-panel">
        <template #header>
          <div class="panel-header">
            <span>参数模板</span>
          </div>
        </template>
        
        <common-table
          ref="templateTableRef"
          :columns="templateColumns"
          :api-method="apiTemplateApi.getTemplateList"
          :api-params="{ apiId: route.params.id }"
          :pagination="templatePagination"
          :search-fields="[]"
          :show-add="false"
          :show-edit="true"
          :show-delete="true"
          :show-operation="true"
          @edit="handleEditTemplate"
          @delete="handleDeleteTemplate"
        >
          <template #operation="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              @click="handleSelectTemplate(row)"
            >
              <el-icon><View /></el-icon>
              <span>查看用例</span>
            </el-button>
          </template>
        </common-table>
      </el-card>

      <!-- 右侧：结果详情和测试用例选项卡 -->
      <el-card shadow="never" class="right-panel">
        <el-tabs v-model="activeTab" class="result-tabs">
          <!-- 结果详情选项卡 -->
          <el-tab-pane label="结果详情" name="result">
            <div class="result-detail-container">
              <!-- 上方筛选区域 -->
              <div class="filter-section">
                <el-form :inline="true" class="filter-form">
                  <el-form-item label="API">
                    <el-select filterable
                      v-model="selectedApiId"
                      placeholder="请选择API"
                      style="width: 200px"
                      @change="handleApiChange"
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
                    <el-select filterable
                      v-model="selectedInstanceId"
                      placeholder="请选择API实例"
                      style="width: 200px"
                      :disabled="!selectedApiId"
                    >
                      <el-option
                        v-for="instance in instanceList"
                        :key="instance.instanceId"
                        :label="instance.instanceName"
                        :value="instance.instanceId"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="handleSearchResult" :disabled="!selectedInstanceId">
                      <el-icon><Search /></el-icon>
                      <span>搜索</span>
                    </el-button>
                  </el-form-item>
                </el-form>
              </div>

              <!-- 下方结果展示区域 -->
              <div v-if="currentResult" class="result-content">
                <el-descriptions :column="1" border>
                  <el-descriptions-item label="URL">
                    {{ currentResult.projectAddress }}{{ currentResult.apiUrl }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Token">
                    {{ currentResult.tokenName || '-' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="请求头">
                    <pre class="json-content">{{ formatJson(currentResult.requestHeader) }}</pre>
                  </el-descriptions-item>
                  <el-descriptions-item label="Code">
                    <el-tag :type="getCodeType(currentResult.code)">{{ currentResult.code }}</el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="返回结果">
                    <pre class="json-content">{{ formatJson(currentResult.responseInfo) }}</pre>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
              <el-empty v-else description="暂无结果数据" />
            </div>
          </el-tab-pane>

          <!-- 测试用例选项卡 -->
          <el-tab-pane label="测试用例" name="testcase">
            <div class="testcase-content">
              <div class="testcase-header">
                <span>测试用例列表</span>
                <el-button
                  v-if="selectedTemplateId"
                  type="primary"
                  size="small"
                  @click="handleAddTestcase"
                >
                  <el-icon><Plus /></el-icon>
                  <span>新增用例</span>
                </el-button>
              </div>

              <div v-if="selectedTemplateId" class="testcase-table-container">
                <div class="testcase-toolbar">
                  <el-button
                    type="success"
                    size="small"
                    @click="handleBatchRunTestcase"
                    :disabled="!selectedTestcaseRows || selectedTestcaseRows.length === 0"
                  >
                    <el-icon><VideoPlay /></el-icon>
                    <span>批量运行 ({{ selectedTestcaseRows?.length || 0 }})</span>
                  </el-button>
                </div>
                <common-table
                  ref="testcaseTableRef"
                  :columns="testcaseColumns"
                  :api-method="apiTestcaseApi.getTestCaseList"
                  :api-params="{ templateId: selectedTemplateId }"
                  :pagination="testcasePagination"
                  :search-fields="[]"
                  :auto-load="false"
                  :show-selection="true"
                  @delete="handleDeleteTestcase"
                  @batch-delete="handleBatchDeleteTestcase"
                  @selection-change="handleTestcaseSelectionChange"
                  :show-add="false"
                  :show-edit="true"
                  :show-operation="true"
                >
                  <template #status="{ row }">
                    <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                      {{ row.status === 1 ? '启用' : '禁用' }}
                    </el-tag>
                  </template>
                  <template #operation="{ row }">
                    <el-button
                      type="success"
                      size="small"
                      link
                      @click="handleRunTestcase(row)"
                    >
                      <el-icon><VideoPlay /></el-icon>
                      <span>运行</span>
                    </el-button>
                  </template>
                </common-table>
              </div>
              
              <el-empty v-else description="请先选择一个参数模板" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Plus, View, Search, VideoPlay } from '@element-plus/icons-vue'
import CommonTable from '@/components/CommonTable.vue'
import * as apiApi from '@/api/api/api'
import * as apiTemplateApi from '@/api/api/api-template'
import * as apiTestcaseApi from '@/api/api/api-testcase'
import * as apiResultApi from '@/api/api/api-result'
import { apiTemplateConfig, apiTestcaseConfig } from '@/config/table-config'
import { handleApiResponse } from '@/utils/responseHandler'

const route = useRoute()
const router = useRouter()
const templateTableRef = ref(null)
const testcaseTableRef = ref(null)

// API数据
const apiData = reactive({
  apiId: null,
  apiName: '',
  methodUrl: '',
  methodType: 1
})

// 选中的模板ID
const selectedTemplateId = ref(null)

// 选项卡激活状态
const activeTab = ref('result')

// API列表
const apiList = ref([])

// 实例列表
const instanceList = ref([])

// 选中的API ID
const selectedApiId = ref(null)

// 选中的实例ID
const selectedInstanceId = ref(null)

// 当前结果
const currentResult = ref(null)

// 选中的测试用例行
const selectedTestcaseRows = ref([])

// 参数模板列配置
const templateColumns = [
  ...apiTemplateConfig.columns,
  { 
    prop: 'operation', 
    label: '操作', 
    width: 80, 
    fixed: 'right',
    slot: 'operation'
  }
]

// 参数模板分页
const templatePagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 测试用例列配置
const testcaseColumns = [
  ...apiTestcaseConfig.columns,
  { 
    prop: 'operation', 
    label: '操作', 
    width: 120, 
    fixed: 'right',
    slot: 'operation'
  }
]

// 测试用例分页
const testcasePagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 参数模板对话框
const templateDialogVisible = ref(false)
const templateDialogTitle = ref('')
const templateFormData = reactive({
  id: null,
  templateName: '',
  templateUrl: '',
  description: '',
  apiId: null
})

const templateFormRules = {
  templateName: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  templateUrl: [{ required: true, message: '请输入模板URL', trigger: 'blur' }]
}

// 获取HTTP方法类型
// 方法类型映射（后端 methodType 为数字：1=GET, 2=POST, 3=PUT, 4=DELETE）
const methodMap = {
  1: { label: 'GET', type: 'success' },
  2: { label: 'POST', type: 'primary' },
  3: { label: 'PUT', type: 'warning' },
  4: { label: 'DELETE', type: 'danger' }
}

const getMethodType = (methodType) => {
  return methodMap[methodType]?.type || 'info'
}

const getMethodLabel = (methodType) => {
  return methodMap[methodType]?.label || 'UNKNOWN'
}

// 加载API详情
const loadApiDetail = async () => {
  try {
    // 如果路由中已经有API数据，直接使用
    if (route.query.apiData) {
      Object.assign(apiData, JSON.parse(route.query.apiData))
    } else {
      // 否则从API获取
      const res = await apiApi.getApiDetail(route.params.id)
      Object.assign(apiData, res.data)
    }
    
    // 设置默认选中的API为当前API
    selectedApiId.value = apiData.apiId
    
    // 加载API列表（用于下拉框）
    await loadApiList()
    
    // 加载当前API的实例列表
    await loadInstanceList(selectedApiId.value)
    
    // 获取当前API的最新结果
    await loadLatestResultByApiId(selectedApiId.value)
  } catch (error) {
    console.error('加载API详情失败:', error)
    ElMessage.error('加载API详情失败')
  }
}

// 加载API列表
const loadApiList = async () => {
  try {
    const res = await apiApi.getApiList({ pageNum: 1, pageSize: 100 })
    apiList.value = res.data.items || []
  } catch (error) {
    console.error('加载API列表失败:', error)
  }
}

// 加载实例列表
const loadInstanceList = async (apiId) => {
  try {
    const res = await apiTestcaseApi.getTestcaseList({ apiId, pageNum: 1, pageSize: 100 })
    instanceList.value = res.data.items || []
    
    // 如果有实例，选择第一个作为默认值
    if (instanceList.value.length > 0) {
      selectedInstanceId.value = instanceList.value[0].instanceId
    }
  } catch (error) {
    console.error('加载实例列表失败:', error)
  }
}

// 根据API ID加载最新结果
const loadLatestResultByApiId = async (apiId) => {
  try {
    const res = await apiResultApi.getLatestResultByApiId(apiId)
    if (res.success && res.data) {
      currentResult.value = res.data
      // 同步更新选中的实例ID
      selectedInstanceId.value = res.data.instanceId
    }
  } catch (error) {
    console.error('加载最新结果失败:', error)
    currentResult.value = null
  }
}

// 根据实例ID加载最新结果
const loadLatestResultByInstanceId = async (instanceId) => {
  try {
    const res = await apiResultApi.getLatestResultByInstanceId(instanceId)
    if (res.success && res.data) {
      currentResult.value = res.data
    }
  } catch (error) {
    console.error('加载实例最新结果失败:', error)
    currentResult.value = null
  }
}

// API改变事件
const handleApiChange = async (apiId) => {
  // 清空当前结果
  currentResult.value = null
  selectedInstanceId.value = null
  
  // 重新加载实例列表
  await loadInstanceList(apiId)
  
  // 如果有实例，自动选择第一个并加载结果
  if (instanceList.value.length > 0) {
    selectedInstanceId.value = instanceList.value[0].instanceId
    await loadLatestResultByInstanceId(selectedInstanceId.value)
  }
}

// 搜索结果
const handleSearchResult = async () => {
  if (!selectedInstanceId.value) {
    ElMessage.warning('请选择API实例')
    return
  }
  
  await loadLatestResultByInstanceId(selectedInstanceId.value)
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

// 选择模板
const handleSelectTemplate = (template) => {
  selectedTemplateId.value = template.id
  // 重置测试用例分页
  testcasePagination.page = 1
  // 刷新测试用例列表
  setTimeout(() => {
    testcaseTableRef.value?.refresh()
  }, 100)
}

// 编辑模板
const handleEditTemplate = (row) => {
  templateDialogTitle.value = '编辑模板'
  Object.assign(templateFormData, row)
  templateDialogVisible.value = true
}

// 删除模板
const handleDeleteTemplate = (row) => {
  ElMessageBox.confirm(`确定要删除模板"${row.templateName}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await apiTemplateApi.deleteTemplate(row.id)
      if (handleApiResponse(res, '删除成功', '删除失败')) {
        templateTableRef.value?.refresh()
        if (selectedTemplateId.value === row.id) {
          selectedTemplateId.value = null
        }
      }
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

// 返回
const goBack = () => {
  router.back()
}

// 新增测试用例
const handleAddTestcase = () => {
  ElMessage.info('新增测试用例功能待实现')
}

// 删除测试用例
const handleDeleteTestcase = (row) => {
  ElMessageBox.confirm(`确定要删除用例"${row.testcaseName}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await apiTestcaseApi.deleteTestCase(row.id)
      if (handleApiResponse(res, '删除成功', '删除失败')) {
        testcaseTableRef.value?.refresh()
      }
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

// 批量删除测试用例
const handleBatchDeleteTestcase = async (rows) => {
  ElMessageBox.confirm(`确定要删除选中的 ${rows.length} 个测试用例吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = rows.map(row => row.id)
      const res = await apiTestcaseApi.batchDeleteTestCase(ids)
      if (handleApiResponse(res, '批量删除成功', '批量删除失败')) {
        testcaseTableRef.value?.refresh()
      }
    } catch (error) {
      console.error('批量删除失败:', error)
    }
  }).catch(() => {})
}

// 运行单个测试用例
const handleRunTestcase = (row) => {
  ElMessageBox.confirm(`确认运行用例"${row.instanceName}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    try {
      const res = await apiTestcaseApi.executeTestcase(row.instanceId)
      if (handleApiResponse(res, '运行成功', '运行失败')) {
        // 刷新测试用例列表
        testcaseTableRef.value?.refresh()

        // 如果当前选中的实例ID与运行的实例ID相同，刷新结果详情
        if (selectedInstanceId.value === row.instanceId) {
          await loadLatestResultByInstanceId(row.instanceId)
        }

        // 如果在结果详情选项卡，且当前API与运行的用例所属API相同，刷新最新结果
        if (activeTab.value === 'result' && selectedApiId.value === row.apiId) {
          await loadLatestResultByApiId(selectedApiId.value)
        }
      }
    } catch (error) {
      console.error('运行失败:', error)
      ElMessage.error('运行失败')
    }
  }).catch(() => {})
}

// 测试用例选择变化
const handleTestcaseSelectionChange = (rows) => {
  selectedTestcaseRows.value = rows
}

// 批量运行测试用例
const handleBatchRunTestcase = () => {
  if (!selectedTestcaseRows.value || selectedTestcaseRows.value.length === 0) {
    ElMessage.warning('请选择要运行的用例')
    return
  }

  ElMessageBox.confirm(`确认运行选中的 ${selectedTestcaseRows.value.length} 条用例吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    try {
      const ids = selectedTestcaseRows.value.map(item => item.instanceId)
      const res = await apiTestcaseApi.batchExecuteTestcase(ids)
      if (handleApiResponse(res, '批量运行成功', '批量运行失败')) {
        // 刷新测试用例列表
        testcaseTableRef.value?.refresh()

        // 清空选择
        selectedTestcaseRows.value = []

        // 刷新当前API的最新结果
        if (selectedApiId.value) {
          await loadLatestResultByApiId(selectedApiId.value)
        }
      }
    } catch (error) {
      console.error('批量运行失败:', error)
      ElMessage.error('批量运行失败')
    }
  }).catch(() => {})
}

// 初始化
onMounted(async () => {
  console.log('详情页初始化, route.params:', route.params)
  console.log('详情页初始化, route.query:', route.query)
  await loadApiDetail()
  console.log('API详情加载完成, apiData:', apiData)
})
</script>

<style scoped>
.api-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header-card {
  margin-bottom: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.content-wrapper {
  flex: 1;
  display: flex;
  gap: 16px;
  overflow: hidden;
}

.left-panel {
  width: 600px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.testcase-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.result-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.result-detail-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.filter-section {
  padding: 16px 0;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 16px;
}

.filter-form {
  display: flex;
  align-items: center;
  gap: 16px;
}

.result-content {
  flex: 1;
  overflow: auto;
}

.json-content {
  margin: 0;
  padding: 8px;
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

.testcase-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 8px 0;
}

.testcase-table-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.testcase-toolbar {
  padding: 8px 0;
  margin-bottom: 8px;
}
</style>
