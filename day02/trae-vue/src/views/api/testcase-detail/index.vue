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

    <!-- 下方左右布局区域 -->
    <div class="content-layout">
      <!-- 左侧：选项卡（参数模板 + 结果详情） -->
      <el-card shadow="never" class="left-panel">
        <el-tabs v-model="activeTab" class="left-tabs">
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
                      style="width: 100%"
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
                      style="width: 100%"
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
                    <el-button type="primary" @click="handleSearchResult" :disabled="!selectedInstanceId" style="width: 100%">
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

          <!-- 参数模板选项卡 -->
          <el-tab-pane label="参数模板" name="template">
            <div class="template-container">
              <div class="template-header">
                <h3>参数模板列表</h3>
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
            </div>
          </el-tab-pane>
        </el-tabs>
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
              type="primary"
              size="small"
              link
              @click="handleCopyTestcase(row)"
            >
              <el-icon><DocumentCopy /></el-icon>
              <span>复制</span>
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

    <!-- 复制用例弹窗 -->
    <common-dialog
      v-model="copyDialogVisible"
      title="复制测试用例"
      :form-data="copyFormData"
      :rules="formRules"
      :loading="copySubmitLoading"
      width="700px"
      @confirm="handleCopySubmit"
    >
      <el-form-item label="用例名称" prop="instanceName">
        <el-input v-model="copyFormData.instanceName" placeholder="请输入用例名称" />
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input v-model="copyFormData.description" type="textarea" placeholder="请输入描述" />
      </el-form-item>

      <el-form-item label="期望结果" prop="expectResult">
        <el-input v-model="copyFormData.expectResult" placeholder="请输入期望结果" />
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input v-model="copyFormData.remark" type="textarea" placeholder="请输入备注" />
      </el-form-item>

      <el-form-item label="用例输入" prop="instanceJson">
        <el-input 
          v-model="copyFormData.instanceJson" 
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
        <el-select filterable v-model="templateFormData.fieldType" placeholder="请选择字段类型" style="width: 100%">
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
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CommonTable from '@/components/CommonTable.vue'
import CommonDialog from '@/components/CommonDialog.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { VideoPlay, Plus, Delete, Search, DocumentCopy } from '@element-plus/icons-vue'
import * as apiTestcaseApi from '@/api/api/api-testcase'
import * as apiApi from '@/api/api/api'
import * as apiTemplateApi from '@/api/api/api-template'
import * as apiResultApi from '@/api/api/api-result'
import { handleApiResponse } from '@/utils/responseHandler'

const route = useRoute()
const router = useRouter()
const tableRef = ref(null)
const submitLoading = ref(false)
const selectedRows = ref([])

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

// 复制弹窗控制
const copyDialogVisible = ref(false)
const copySubmitLoading = ref(false)

// 复制表单数据
const copyFormData = reactive({
  instanceId: null,
  projectId: '',
  apiId: '',
  instanceName: '',
  description: '',
  expectResult: '',
  remark: '',
  instanceJson: ''
})

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
    
    // 设置默认选中的API为当前API
    selectedApiId.value = apiInfo.apiId
    
    // 加载API列表（用于下拉框）
    await loadApiList()
    
    // 加载当前API的实例列表
    await loadInstanceList(selectedApiId.value)
    
    // 获取当前API的最新结果
    await loadLatestResultByApiId(selectedApiId.value)
    
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
      const res = await apiTestcaseApi.executeTestcase(row.instanceId)
      if (handleApiResponse(res, '运行成功', '运行失败')) {
        tableRef.value.refresh()
        loadStatistics()

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
      const res = await apiTestcaseApi.batchExecuteTestcase(ids)
      if (handleApiResponse(res, '批量运行成功', '批量运行失败')) {
        tableRef.value.refresh()
        loadStatistics()
        // 清空选择
        tableRef.value.clearSelection()

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

// 复制测试用例
const handleCopyTestcase = (row) => {
  // 填充复制表单数据
  Object.assign(copyFormData, {
    instanceId: null, // 清空ID，因为是新增
    projectId: row.projectId || apiInfo.projectId,
    apiId: row.apiId || apiInfo.apiId,
    instanceName: row.instanceName + ' - 副本', // 默认名称加副本后缀
    description: row.description || '',
    expectResult: row.expectResult || '',
    remark: row.remark || '',
    instanceJson: row.instanceJson || ''
  })
  copyDialogVisible.value = true
}

// 提交复制表单
const handleCopySubmit = async () => {
  try {
    copySubmitLoading.value = true
    const res = await apiTestcaseApi.addTestcase(copyFormData)
    if (handleApiResponse(res, '复制成功', '复制失败')) {
      copyDialogVisible.value = false
      tableRef.value.refresh()
      loadStatistics()

      // 延迟刷新左侧API实例列表，避免与表格刷新冲突
      await nextTick()
      setTimeout(async () => {
        if (selectedApiId.value) {
          await loadInstanceList(selectedApiId.value, true)
        }
      }, 300)
    }
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败')
  } finally {
    copySubmitLoading.value = false
  }
}

// 提交表单（编辑）
const handleSubmit = async () => {
  try {
    submitLoading.value = true
    let res
    if (isEdit.value) {
      res = await apiTestcaseApi.updateTestcase(formData)
    } else {
      res = await apiTestcaseApi.addTestcase(formData)
    }
    if (handleApiResponse(res, isEdit.value ? '更新成功' : '添加成功', '提交失败')) {
      dialogVisible.value = false
      tableRef.value.refresh()
      loadStatistics()

      // 延迟刷新左侧API实例列表，避免与表格刷新冲突
      await nextTick()
      setTimeout(async () => {
        if (selectedApiId.value) {
          await loadInstanceList(selectedApiId.value, true)
        }
      }, 300)
    }
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
    
    const res = await apiTestcaseApi.deleteTestcase(row.instanceId)
    if (handleApiResponse(res, '删除成功', '删除失败')) {
      tableRef.value.refresh()
      loadStatistics()

      // 延迟刷新左侧API实例列表，避免与表格刷新冲突
      await nextTick()
      setTimeout(async () => {
        if (selectedApiId.value) {
          await loadInstanceList(selectedApiId.value, true)
        }
      }, 300)
    }
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
    const res = await apiTestcaseApi.batchDeleteTestcase(ids)
    if (handleApiResponse(res, '批量删除成功', '批量删除失败')) {
      tableRef.value.refresh()
      loadStatistics()
      // 清空选择
      tableRef.value.clearSelection()

      // 延迟刷新左侧API实例列表，避免与表格刷新冲突
      await nextTick()
      setTimeout(async () => {
        if (selectedApiId.value) {
          await loadInstanceList(selectedApiId.value, true)
        }
      }, 300)
    }
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
      const res = await apiTemplateApi.deleteTemplate(row.templateId)
      if (handleApiResponse(res, '删除成功', '删除失败')) {
        loadTemplateList()
      }
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
    let res
    if (templateFormData.templateId) {
      res = await apiTemplateApi.updateTemplate(templateFormData)
    } else {
      res = await apiTemplateApi.addTemplate(templateFormData)
    }
    if (handleApiResponse(res, templateFormData.templateId ? '更新成功' : '新增成功', '提交失败')) {
      templateDialogVisible.value = false
      loadTemplateList()
    }
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
  
  // 从 query参数获取基本信息
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

// ==================== 结果详情相关方法 ====================

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
const loadInstanceList = async (apiId, keepSelectedId = false) => {
  try {
    const res = await apiTestcaseApi.getTestcaseList({ apiId, pageNum: 1, pageSize: 100 })
    instanceList.value = res.data.items || []
    
    // 如果不是保持选中ID，且有实例，选择第一个作为默认值
    if (!keepSelectedId && instanceList.value.length > 0) {
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
    console.log('获取API最新结果响应:', res)
    if (res.success && res.data) {
      currentResult.value = res.data
      console.log('设置currentResult:', currentResult.value)
      // 同步更新选中的实例ID
      selectedInstanceId.value = res.data.instanceId
    } else {
      console.warn('未获取到结果数据, success:', res.success, 'data:', res.data)
      currentResult.value = null
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
    console.log('获取实例最新结果响应:', res)
    if (res.success && res.data) {
      currentResult.value = res.data
      console.log('设置currentResult:', currentResult.value)
    } else {
      console.warn('未获取到结果数据, success:', res.success, 'data:', res.data)
      currentResult.value = null
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
  height: calc(100% - 150px);
}

.left-panel {
  flex: 0 0 500px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.left-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.left-tabs :deep(.el-tabs__header) {
  margin: 0;
  flex-shrink: 0;
}

.left-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
  padding: 0;
}

.left-tabs :deep(.el-tab-pane) {
  height: 100%;
  overflow: auto;
}

.result-detail-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px;
  overflow-y: auto;
  overflow-x: hidden;
}

.filter-section {
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.filter-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.result-content {
  flex: 1;
  min-height: 0;
}

.result-content :deep(.el-descriptions) {
  margin-bottom: 0;
}

.json-content {
  margin: 0;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
  max-height: 400px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.template-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px;
  overflow-y: auto;
  overflow-x: hidden;
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-shrink: 0;
}

.template-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
  font-weight: bold;
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
