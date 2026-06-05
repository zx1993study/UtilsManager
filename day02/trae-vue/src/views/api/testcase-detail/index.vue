<template>
  <div class="api-testcase-detail">
    <!-- 顶部标题区域 -->
    <el-card shadow="never" class="header-card">
      <div class="header-content">
        <h2 class="api-title">{{ apiInfo.apiName }}</h2>
        <div class="api-method-url">
          <el-tag :type="getMethodTypeColor(apiInfo.methodType)" size="large">
            {{ getMethodTypeText(apiInfo.methodType) }}
          </el-tag>
          <span class="url-text">{{ apiInfo.methodUrl }}</span>
        </div>
      </div>
    </el-card>

    <!-- 中间信息区域 -->
    <el-card shadow="never" class="info-card">
      <el-descriptions :column="3" border>
        <el-descriptions-item label="参数模板名称">
          {{ apiInfo.templateName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="参数类型">
          {{ getParamTypeText(apiInfo.paramType) }}
        </el-descriptions-item>
        <el-descriptions-item label="请求头">
          {{ apiInfo.headers || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="项目名称">
          {{ apiInfo.projectName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="项目地址">
          {{ apiInfo.projectAddress || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="Token名称">
          {{ apiInfo.tokenName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="成功实例总数">
          <el-tag type="success">{{ statistics.successCount || 0 }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="失败实例总数">
          <el-tag type="danger">{{ statistics.failCount || 0 }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备注">
          {{ apiInfo.remark || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 下方左右布局区域 -->
    <div class="content-layout">
      <!-- 左侧：参数模板列表 -->
      <el-card shadow="never" class="template-card">
        <div class="card-header">
          <h3>参数模板</h3>
          <el-button type="primary" size="small" @click="handleAddTemplate">
            <el-icon><Plus /></el-icon>
            <span>新增</span>
          </el-button>
        </div>
        
        <el-table
          :data="templateList"
          border
          stripe
          style="width: 100%"
          max-height="500"
        >
          <el-table-column prop="fieldName" label="字段名称" min-width="120" show-overflow-tooltip />
          <el-table-column prop="fieldType" label="字段类型" width="100">
            <template #default="{ row }">
              {{ getFieldTypeText(row.fieldType) }}
            </template>
          </el-table-column>
          <el-table-column prop="fieldSize" label="字段大小" width="100" />
          <el-table-column prop="isRequired" label="是否必填" width="100">
            <template #default="{ row }">
              {{ row.isRequired === 'Y' ? '是' : '否' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                link
                @click="handleEditTemplate(row)"
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                link
                @click="handleDeleteTemplate(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 右侧：测试用例列表 -->
      <el-card shadow="never" class="testcase-card">
        <div class="card-header">
          <h3>测试用例列表</h3>
          <div class="header-buttons">
            <el-button 
              type="success" 
              :disabled="!selectedRows || selectedRows.length === 0"
              @click="handleBatchRun"
            >
              <el-icon><VideoPlay /></el-icon>
              <span>批量运行 ({{ selectedRows?.length || 0 }})</span>
            </el-button>
            <el-button 
              type="danger" 
              :disabled="!selectedRows || selectedRows.length === 0"
              @click="handleBatchDeleteTestcase"
            >
              <el-icon><Delete /></el-icon>
              <span>批量删除 ({{ selectedRows?.length || 0 }})</span>
            </el-button>
            <el-button type="primary" @click="handleAddTestcase">
              <el-icon><Plus /></el-icon>
              <span>新增用例</span>
            </el-button>
          </div>
        </div>

        <common-table
          ref="tableRef"
          :columns="columns"
          :api-method="getTestcaseListWithApiId"
          :pagination="pagination"
          :search-fields="[]"
          :show-add="false"
          :show-delete="false"
          :show-selection="true"
          :show-toolbar="false"
          :auto-load="false"
          row-key="instanceId"
          @edit="handleEditTestcase"
          @delete="handleDeleteTestcase"
          @selection-change="handleSelectionChange"
        >
          <template #status="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
          
          <!-- 自定义操作列 -->
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
            <el-button
              type="danger"
              size="small"
              link
              @click="handleDeleteTestcase(row)"
            >
              <el-icon><Delete /></el-icon>
              <span>删除</span>
            </el-button>
          </template>
        </common-table>
      </el-card>
    </div>

    <!-- 编辑用例弹窗 -->
    <common-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :form-data="formData"
      :rules="formRules"
      :loading="submitLoading"
      width="700px"
      @confirm="handleSubmit"
    >
      <el-form-item label="用例名称" prop="instanceName">
        <el-input v-model="formData.instanceName" placeholder="请输入用例名称" />
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input v-model="formData.description" type="textarea" placeholder="请输入描述" />
      </el-form-item>

      <el-form-item label="期望结果" prop="expectResult">
        <el-input v-model="formData.expectResult" placeholder="请输入期望结果" />
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" />
      </el-form-item>

      <el-form-item label="用例输入" prop="instanceJson">
        <el-input 
          v-model="formData.instanceJson" 
          type="textarea" 
          :rows="5"
          placeholder="请输入用例参数(JSON格式)" 
        />
      </el-form-item>
    </common-dialog>

    <!-- 参数模板编辑弹窗 -->
    <common-dialog
      v-model="templateDialogVisible"
      :title="templateDialogTitle"
      :form-data="templateFormData"
      :rules="templateFormRules"
      :loading="templateSubmitLoading"
      width="600px"
      @confirm="handleTemplateSubmit"
    >
      <el-form-item label="字段名称" prop="fieldName">
        <el-input v-model="templateFormData.fieldName" placeholder="请输入字段名称" />
      </el-form-item>

      <el-form-item label="字段类型" prop="fieldType">
        <el-select v-model="templateFormData.fieldType" placeholder="请选择字段类型" style="width: 100%">
          <el-option label="String" :value="1" />
          <el-option label="Integer" :value="2" />
          <el-option label="Boolean" :value="3" />
          <el-option label="Array" :value="4" />
          <el-option label="Object" :value="5" />
        </el-select>
      </el-form-item>

      <el-form-item label="字段大小" prop="fieldSize">
        <el-input v-model="templateFormData.fieldSize" placeholder="请输入字段大小" type="number" />
      </el-form-item>

      <el-form-item label="是否必填" prop="isRequired">
        <el-radio-group v-model="templateFormData.isRequired">
          <el-radio label="Y">是</el-radio>
          <el-radio label="N">否</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="templateFormData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注"
        />
      </el-form-item>
    </common-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CommonTable from '@/components/CommonTable.vue'
import CommonDialog from '@/components/CommonDialog.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { VideoPlay, Plus, Delete } from '@element-plus/icons-vue'
import * as apiTestcaseApi from '@/api/api/api-testcase'
import * as apiApi from '@/api/api/api'
import * as apiTemplateApi from '@/api/api/api-template'

const route = useRoute()
const router = useRouter()
const tableRef = ref(null)
const submitLoading = ref(false)
const selectedRows = ref([])

// 参数模板列表
const templateList = ref([])
const templateDialogVisible = ref(false)
const templateDialogTitle = ref('')
const templateSubmitLoading = ref(false)
const templateFormData = reactive({
  templateId: null,
  fieldName: '',
  fieldType: null,
  fieldSize: null,
  isRequired: 'N',
  remark: '',
  projectId: null,
  apiId: null
})

const templateFormRules = {
  fieldName: [{ required: true, message: '请输入字段名称', trigger: 'blur' }],
  fieldType: [{ required: true, message: '请选择字段类型', trigger: 'change' }]
}

// API信息
const apiInfo = reactive({
  apiId: null,
  apiName: '',
  methodType: 1,
  methodUrl: '',
  templateName: '',
  paramType: '',
  headers: '',
  projectName: '',
  projectAddress: '',
  tokenName: '',
  remark: ''
})

// 统计信息
const statistics = reactive({
  successCount: 0,
  failCount: 0
})

// 列配置
const columns = [
  { prop: 'instanceName', label: '用例名称', minWidth: 150 },
  { prop: 'description', label: '描述', minWidth: 200, showOverflowTooltip: true },
  { prop: 'expectResult', label: '期望结果', minWidth: 150 },
  { prop: 'remark', label: '备注', minWidth: 200, showOverflowTooltip: true },
  {
    prop: 'status',
    label: '执行状态',
    minWidth: 100,
    slot: 'status'
  }
]

// 搜索字段配置（为空，不显示搜索区域）
const searchFields = []

// 分页配置
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 弹窗控制
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)

// 表单数据
const formData = reactive({
  instanceId: null,
  projectId: '',
  apiId: '',
  instanceName: '',
  description: '',
  expectResult: '',
  remark: '',
  instanceJson: ''
})

// 表单验证规则
const formRules = {
  instanceName: [{ required: true, message: '请输入用例名称', trigger: 'blur' }],
  instanceJson: [{ required: true, message: '请输入用例参数', trigger: 'blur' }]
}

// 获取方法类型文本
const getMethodTypeText = (type) => {
  const types = {
    1: 'GET',
    2: 'POST',
    3: 'PUT',
    4: 'DELETE',
    5: 'PATCH'
  }
  return types[type] || 'UNKNOWN'
}

// 获取方法类型颜色
const getMethodTypeColor = (type) => {
  const colors = {
    1: 'success',
    2: 'primary',
    3: 'warning',
    4: 'danger',
    5: 'info'
  }
  return colors[type] || 'info'
}

// 获取参数类型文本
const getParamTypeText = (type) => {
  const types = {
    0: 'JSON',
    1: 'Form',
    2: 'XML',
    3: 'Raw'
  }
  return types[type] || '-'
}

// 获取状态类型
const getStatusType = (status) => {
  const map = {
    0: 'info',
    1: 'success',
    2: 'danger'
  }
  return map[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const map = {
    0: '未执行',
    1: '成功',
    2: '失败'
  }
  return map[status] || '未知'
}

// 获取字段类型文本
const getFieldTypeText = (type) => {
  const typeMap = {
    1: 'String',
    2: 'Integer',
    3: 'Boolean',
    4: 'Array',
    5: 'Object'
  }
  return typeMap[type] || type
}

// 获取带API ID的测试用例列表
const getTestcaseListWithApiId = async (params) => {
  // 确保 apiId 参数正确传递
  const requestParams = {
    ...params,
    apiId: apiInfo.apiId
  }
  console.log('请求参数:', requestParams) // 调试用，可以后续删除
  return await apiTestcaseApi.getTestcaseList(requestParams)
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
  console.log('选中行数据:', selection)
  console.log('选中的IDs:', selection.map(item => item.instanceId))
}

// 加载API详情
const loadApiDetail = async () => {
  try {
    const res = await apiApi.getApiDetail(apiInfo.apiId)
    Object.assign(apiInfo, res.data)
    
    // 加载统计信息（这里可以根据实际API调整）
    loadStatistics()
  } catch (error) {
    console.error('加载API详情失败:', error)
    ElMessage.error('加载API详情失败')
  }
}

// 加载统计信息
const loadStatistics = async () => {
  try {
    // 获取该API下所有测试用例的结果统计
    const res = await apiTestcaseApi.getTestcaseList({ 
      apiId: apiInfo.apiId,
      page: 1,
      pageSize: 1000 // 获取所有用例以计算统计
    })
    
    const testcases = res.data?.items || res.data?.list || res.data || []
    
    // 统计成功和失败的数量
    let successCount = 0
    let failCount = 0
    
    testcases.forEach(testcase => {
      if (testcase.status === 1) {
        successCount++
      } else if (testcase.status === 2) {
        failCount++
      }
    })
    
    statistics.successCount = successCount
    statistics.failCount = failCount
  } catch (error) {
    console.error('加载统计信息失败:', error)
  }
}

// 编辑用例
const handleEditTestcase = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑用例'
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 新增用例
const handleAddTestcase = () => {
  isEdit.value = false
  dialogTitle.value = '新增用例'
  
  // 根据参数模板生成默认JSON数据
  const defaultJson = generateDefaultJsonFromTemplate()
  
  Object.assign(formData, {
    instanceId: null,
    projectId: apiInfo.projectId,
    apiId: apiInfo.apiId,
    instanceName: '',
    description: '',
    expectResult: '',
    remark: '',
    instanceJson: defaultJson
  })
  dialogVisible.value = true
}

// 根据参数模板生成默认JSON数据
const generateDefaultJsonFromTemplate = () => {
  if (!templateList.value || templateList.value.length === 0) {
    return ''
  }
  
  const jsonObj = {}
  templateList.value.forEach(template => {
    // 必填字段：值为字段类型；非必填字段：值为null
    jsonObj[template.fieldName] = getFieldTypeDefaultValue(template.fieldType)
    
  })
  
  return JSON.stringify(jsonObj, null, 2)
}

// 根据字段类型获取默认值
const getFieldTypeDefaultValue = (fieldType) => {
  const typeMap = {
    1: '',           // String
    2: 0,            // Integer
    3: false,        // Boolean
    4: [],           // Array
    5: {}            // Object
  }
  return typeMap[fieldType] !== undefined ? typeMap[fieldType] : ''
}

// 运行单个测试用例
const handleRunTestcase = (row) => {
  ElMessageBox.confirm(`确认运行用例"${row.instanceName}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    try {
      await apiTestcaseApi.executeTestcase(row.instanceId)
      ElMessage.success('运行成功')
      tableRef.value.refresh()
      loadStatistics()
    } catch (error) {
      console.error('运行失败:', error)
      ElMessage.error('运行失败')
    }
  }).catch(() => {})
}

// 批量运行测试用例
const handleBatchRun = () => {
  if (!selectedRows.value || selectedRows.value.length === 0) {
    ElMessage.warning('请选择要运行的用例')
    return
  }

  console.log('批量运行 - 选中行数:', selectedRows.value.length)
  console.log('批量运行 - IDs:', selectedRows.value.map(item => item.instanceId))

  ElMessageBox.confirm(`确认运行选中的 ${selectedRows.value.length} 条用例吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    try {
      const ids = selectedRows.value.map(item => item.instanceId)
      console.log('发送批量运行请求，IDs:', ids)
      await apiTestcaseApi.batchExecuteTestcase(ids)
      ElMessage.success('批量运行成功')
      tableRef.value.refresh()
      loadStatistics()
      // 清空选择
      tableRef.value.clearSelection()
    } catch (error) {
      console.error('批量运行失败:', error)
      ElMessage.error('批量运行失败')
    }
  }).catch(() => {})
}

// 提交表单（编辑）
const handleSubmit = async () => {
  try {
    submitLoading.value = true
    if (isEdit.value) {
      await apiTestcaseApi.updateTestcase(formData)
      ElMessage.success('更新成功')
    } else {
      await apiTestcaseApi.addTestcase(formData)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    tableRef.value.refresh()
    loadStatistics()
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败')
  } finally {
    submitLoading.value = false
  }
}

// 删除测试用例
const handleDeleteTestcase = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除测试用例 "${row.instanceName}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await apiTestcaseApi.deleteTestcase(row.instanceId)
    ElMessage.success('删除成功')
    tableRef.value.refresh()
    loadStatistics()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除测试用例
const handleBatchDeleteTestcase = async () => {
  if (!selectedRows.value || selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的测试用例')
    return
  }
  
  console.log('批量删除 - 选中行数:', selectedRows.value.length)
  console.log('批量删除 - IDs:', selectedRows.value.map(item => item.instanceId))
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个测试用例吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const ids = selectedRows.value.map(item => item.instanceId)
    console.log('发送批量删除请求，IDs:', ids)
    await apiTestcaseApi.batchDeleteTestcase(ids)
    ElMessage.success('批量删除成功')
    tableRef.value.refresh()
    loadStatistics()
    // 清空选择
    tableRef.value.clearSelection()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

// ==================== 参数模板相关方法 ====================

// 加载参数模板列表
const loadTemplateList = async () => {
  try {
    const res = await apiTemplateApi.getTemplateList({ 
      apiId: apiInfo.apiId,
      pageSize: 1000
    })
    templateList.value = res.data?.items || res.data?.list || res.data || []
  } catch (error) {
    console.error('加载参数模板失败:', error)
  }
}

// 新增参数模板
const handleAddTemplate = () => {
  templateDialogTitle.value = '新增参数模板'
  Object.assign(templateFormData, {
    templateId: null,
    fieldName: '',
    fieldType: null,
    fieldSize: null,
    isRequired: 'N',
    remark: '',
    projectId: apiInfo.projectId,
    apiId: apiInfo.apiId
  })
  templateDialogVisible.value = true
}

// 编辑参数模板
const handleEditTemplate = (row) => {
  templateDialogTitle.value = '编辑参数模板'
  Object.assign(templateFormData, row)
  templateDialogVisible.value = true
}

// 删除参数模板
const handleDeleteTemplate = (row) => {
  ElMessageBox.confirm(`确定要删除字段"${row.fieldName}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await apiTemplateApi.deleteTemplate(row.templateId)
      ElMessage.success('删除成功')
      loadTemplateList()
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

// 提交参数模板
const handleTemplateSubmit = async () => {
  try {
    templateSubmitLoading.value = true
    if (templateFormData.templateId) {
      await apiTemplateApi.updateTemplate(templateFormData)
      ElMessage.success('更新成功')
    } else {
      await apiTemplateApi.addTemplate(templateFormData)
      ElMessage.success('新增成功')
    }
    templateDialogVisible.value = false
    loadTemplateList()
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败')
  } finally {
    templateSubmitLoading.value = false
  }
}

// 页面加载时初始化
onMounted(() => {
  // 从路由参数获取API ID
  apiInfo.apiId = route.params.apiId
  
  // 从query参数获取基本信息
  if (route.query.apiName) {
    apiInfo.apiName = route.query.apiName
  }
  if (route.query.methodType !== undefined) {
    apiInfo.methodType = parseInt(route.query.methodType)
  }
  if (route.query.methodUrl) {
    apiInfo.methodUrl = route.query.methodUrl
  }
  
  // 加载API详情和测试用例列表
  if (apiInfo.apiId) {
    loadApiDetail()
    loadTemplateList() // 加载参数模板列表
    // 手动刷新测试用例列表，确保apiId已经设置
    setTimeout(() => {
      if (tableRef.value) {
        tableRef.value.refresh()
      }
    }, 100)
  } else {
    ElMessage.error('缺少API ID参数')
  }
})
</script>

<style scoped>
.api-testcase-detail {
  height: 100%;
}

.header-card {
  margin-bottom: 10px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.api-title {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.api-method-url {
  display: flex;
  align-items: center;
  gap: 10px;
}

.url-text {
  font-size: 16px;
  color: #606266;
  font-family: monospace;
}

.info-card {
  margin-bottom: 10px;
}

.content-layout {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  height: calc(100% - 250px);
}

.template-card {
  flex: 0 0 400px;
  overflow-y: auto;
}

.testcase-card {
  flex: 1;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
  font-weight: bold;
}

.header-buttons {
  display: flex;
  gap: 10px;
}
</style>
