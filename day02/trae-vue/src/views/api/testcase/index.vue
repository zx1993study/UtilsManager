<template>
  <div class="api-testcase">
    <common-table
      ref="tableRef"
      :columns="columns"
      :api-method="apiTestcaseApi.getTestcaseList"
      :pagination="pagination"
      :search-fields="searchFields"
      :show-selection="true"
      row-key="instanceId"
      @add="handleAdd"
      @edit="handleEdit"
      @delete="handleDelete"
      @batch-delete="handleBatchDelete"
      @selection-change="handleSelectionChange"
    >
      <template #status="{ row }">
        <el-tag :type="getStatusType(row.status)">
          {{ getStatusText(row.status) }}
        </el-tag>
      </template>
    </common-table>

    <!-- 新增/编辑弹窗 -->
    <common-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :form-data="formData"
      :rules="formRules"
      :loading="submitLoading"
      width="700px"
      @confirm="handleSubmit"
    >
      <el-form-item label="项目" prop="projectId">
        <el-select filterable
          v-model="formData.projectId"
          placeholder="请选择项目"
          style="width: 100%"
          @change="handleProjectChange"
        >
          <el-option
            v-for="item in projectOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="API" prop="apiId">
        <el-select filterable
          v-model="formData.apiId"
          placeholder="请选择API"
          style="width: 100%"
          :disabled="!formData.projectId"
          @change="handleApiChange"
        >
          <el-option
            v-for="item in apiOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>


      <el-form-item label="Token" prop="tokenId">
        <el-select v-model="formData.tokenId" placeholder="请选择Token" style="width: 100%" clearable>
          <el-option
            v-for="item in tokenOptions"
            :key="item.tokenId"
            :label="item.name"
            :value="item.tokenId"
          />
        </el-select>
      </el-form-item>
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

      <el-form-item label="标记字段" prop="markFields">
        <el-select
          v-model="formData.markFields"
          multiple
          clearable
          filterable
          placeholder="请选择需要追加执行次数的字段"
          style="width: 100%"
          @change="handleMarkChange"
        >
          <el-option
            v-for="item in templateFieldOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="执行次数" prop="batchCount">
        <el-select
          v-model="formData.batchCount"
          placeholder="请选择执行次数"
          style="width: 100%"
          @change="handleBatchCountChange"
        >
          <el-option
            v-for="item in batchCountOptions"
            :key="item"
            :label="`${item}次`"
            :value="item"
          />
        </el-select>
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import CommonTable from '@/components/CommonTable.vue'
import CommonDialog from '@/components/CommonDialog.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as apiTestcaseApi from '@/api/api/api-testcase'
import * as projectApi from '@/api/project/project'
import * as apiListApi from '@/api/api/api'
import * as apiTemplateApi from '@/api/api/api-template'
import { handleApiResponse } from '@/utils/responseHandler'

const tableRef = ref(null)
const submitLoading = ref(false)

// 下拉框选项
const projectOptions = ref([])
const apiOptions = ref([])
const tokenOptions = ref([])
const templateList = ref([])

const templateFieldOptions = computed(() => {
  return (templateList.value || [])
    .filter(item => item.fieldName)
    .map(item => ({
      label: item.fieldName,
      value: item.fieldName
    }))
})

const batchCountOptions = [1, 2, 3, 5, 10, 20, 50]

// 列配置
const columns = [
  { prop: 'instanceName', label: '用例名称', minWidth: 150 },
  { prop: 'expectResult', label: '期望结果', minWidth: 150 },
  { prop: 'apiName', label: 'API名称', minWidth: 150 },
  { prop: 'methodUrl', label: 'API路径', minWidth: 200, showOverflowTooltip: true },
  { prop:'projectName', label:'项目名称', minWidth: 150},
  { prop: 'description', label: '描述', minWidth: 200, showOverflowTooltip: true },
  { prop: 'remark', label: '备注', minWidth: 200, showOverflowTooltip: true },
  {
    prop: 'status',
    label: '执行状态',
    minWidth: 100,
    slot: 'status'
  }
]

// 搜索字段配置
const searchFields = [
  { type: 'input', prop: 'instanceName', label: '用例名称', placeholder: '请输入用例名称' },
  { type: 'input', prop: 'description', label: '描述', placeholder: '请输入描述' }
]

// 分页配置
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 选中行
const selectedRows = ref([])

// 处理选择变化
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 弹窗控制
const dialogVisible = ref(false)
const dialogTitle = ref('新增用例')
const isEdit = ref(false)

// 表单数据
const formData = reactive({
  instanceId: null,
  projectId: '',
  apiId: '',
  tokenId: null,
  instanceName: '',
  description: '',
  expectResult: '',
  remark: '',
  markFields: [],
  batchCount: 1,
  instanceJson: ''
})

// 表单验证规则
const formRules = {
  projectId: [{ required: true, message: '请选择项目', trigger: 'change' }],
  apiId: [{ required: true, message: '请选择API', trigger: 'change' }],
  instanceName: [{ required: true, message: '请输入用例名称', trigger: 'blur' }]
}

watch(() => formData.instanceJson, () => {
  if (dialogVisible.value) {
    syncControlsFromJson(formData)
  }
})

const getListItems = (response) => {
  const data = response?.data
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.list)) return data.list
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.data?.items)) return data.data.items
  if (Array.isArray(data?.data?.list)) return data.data.list
  return []
}

const getResponseData = (response) => response?.data?.data || response?.data || response || {}

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

// 加载项目列表
const loadProjectList = async () => {
  try {
    const response = await projectApi.getProjectSelectOptions()
    projectOptions.value = getListItems(response)
      .map(item => ({
        label: item.projectName || item.project_name || item.name,
        value: item.projectId ?? item.project_id ?? item.id
      }))
      .filter(item => item.label && item.value !== undefined && item.value !== null)
  } catch (error) {
    console.error('加载项目列表失败:', error)
  }
}

// 加载API列表
const loadApiList = async (projectId) => {
  try {
    const response = await apiListApi.getApiOptions({ projectId })
    apiOptions.value = getListItems(response)
      .map(item => ({
        label: item.apiName || item.api_name || item.name,
        value: item.apiId ?? item.api_id ?? item.id
      }))
      .filter(item => item.label && item.value !== undefined && item.value !== null)
  } catch (error) {
    console.error('加载API列表失败:', error)
  }
}

const loadTemplateList = async (apiId) => {
  templateList.value = []
  if (!apiId) return
  try {
    const response = await apiTemplateApi.getTemplateList({
      apiId,
      pageNum: 1,
      pageSize: 100
    })
    templateList.value = getListItems(response)
  } catch (error) {
    console.error('加载参数模板失败:', error)
  }
}

const buildTokenOptionsFromApi = (apiDetail = {}) => {
  const ids = Array.isArray(apiDetail.tokenIds) ? apiDetail.tokenIds : (apiDetail.tokenId ? [apiDetail.tokenId] : [])
  const names = Array.isArray(apiDetail.tokenNames) ? apiDetail.tokenNames : []
  tokenOptions.value = ids.map((tokenId, index) => ({
    tokenId,
    name: names[index] || (index === 0 ? apiDetail.tokenName : `Token ${tokenId}`)
  }))
}

const getDefaultTokenId = () => tokenOptions.value[0]?.tokenId || null

const loadTokenOptionsByApi = async (apiId, currentTokenId = null) => {
  tokenOptions.value = []
  formData.tokenId = null
  if (!apiId) return
  try {
    const response = await apiListApi.getApiDetail(apiId)
    buildTokenOptionsFromApi(getResponseData(response))
    formData.tokenId = currentTokenId || getDefaultTokenId()
  } catch (error) {
    console.error('加载Token列表失败:', error)
  }
}

const handleApiChange = async (apiId) => {
  await Promise.all([
    loadTokenOptionsByApi(apiId),
    loadTemplateList(apiId)
  ])
  fillDefaultJsonWhenEmpty()
}

const parseInstanceJson = (value) => {
  if (!value) return {}
  if (typeof value === 'object') return { ...value }
  try {
    const parsed = JSON.parse(value)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch (error) {
    return {}
  }
}

const formatInstanceJson = (value) => {
  if (!value) return JSON.stringify({ valueMarks: {}, batchCount: 1 }, null, 2)
  if (typeof value === 'string') return value
  return JSON.stringify(value, null, 2)
}

const extractCaseJsonControls = (value) => {
  const jsonObj = parseInstanceJson(value)
  const valueMarks = jsonObj.valueMarks && typeof jsonObj.valueMarks === 'object' ? jsonObj.valueMarks : {}
  const markFields = Object.keys(valueMarks).filter(key => valueMarks[key] === 'execCountSuffix')
  const batchCount = Number(jsonObj.batchCount || 1)
  return {
    markFields,
    batchCount: batchCountOptions.includes(batchCount) ? batchCount : 1
  }
}

const applyCaseJsonControls = (target, markFields, batchCount) => {
  const jsonObj = parseInstanceJson(target.instanceJson)
  jsonObj.valueMarks = {}
  ;(markFields || []).forEach(field => {
    jsonObj.valueMarks[field] = 'execCountSuffix'
  })
  jsonObj.batchCount = batchCount || 1
  target.instanceJson = JSON.stringify(jsonObj, null, 2)
}

const syncControlsFromJson = (target) => {
  const controls = extractCaseJsonControls(target.instanceJson)
  target.markFields = controls.markFields
  target.batchCount = controls.batchCount
}

const handleMarkChange = (fields) => {
  applyCaseJsonControls(formData, fields, formData.batchCount)
}

const handleBatchCountChange = (count) => {
  applyCaseJsonControls(formData, formData.markFields, count)
}

const getFieldTypeDefaultValue = (fieldType) => {
  const typeMap = {
    1: '',
    2: 0,
    3: false,
    4: [],
    5: {}
  }
  return typeMap[fieldType] !== undefined ? typeMap[fieldType] : ''
}

const getTemplateDefaultValue = (template) => {
  if (template.defaultValue !== undefined && template.defaultValue !== null && template.defaultValue !== '') {
    try {
      return JSON.parse(template.defaultValue)
    } catch (error) {
      return template.defaultValue
    }
  }
  return getFieldTypeDefaultValue(template.fieldType)
}

const generateDefaultJsonFromTemplate = () => {
  const jsonObj = {
    valueMarks: {},
    batchCount: 1
  }
  templateList.value.forEach(template => {
    if (template.fieldName) {
      jsonObj[template.fieldName] = getTemplateDefaultValue(template)
    }
  })
  return JSON.stringify(jsonObj, null, 2)
}

const fillDefaultJsonWhenEmpty = () => {
  const jsonObj = parseInstanceJson(formData.instanceJson)
  const contentKeys = Object.keys(jsonObj).filter(key => !['valueMarks', 'batchCount'].includes(key))
  if (templateList.value.length && contentKeys.length === 0) {
    formData.instanceJson = generateDefaultJsonFromTemplate()
  } else {
    applyCaseJsonControls(formData, formData.markFields, formData.batchCount)
  }
}

// 处理项目变化
const handleProjectChange = (projectId) => {
  formData.apiId = ''
  formData.tokenId = null
  formData.markFields = []
  tokenOptions.value = []
  templateList.value = []
  applyCaseJsonControls(formData, [], formData.batchCount)
  if (projectId) {
    loadApiList(projectId)
  } else {
    apiOptions.value = []
  }
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增用例'
  const defaultInstanceJson = JSON.stringify({ valueMarks: {}, batchCount: 1 }, null, 2)
  Object.assign(formData, {
    instanceId: null,
    projectId: '',
    apiId: '',
    tokenId: null,
    instanceName: '',
    description: '',
    expectResult: '',
    remark: '',
    markFields: [],
    batchCount: 1,
    instanceJson: defaultInstanceJson
  })
  apiOptions.value = []
  tokenOptions.value = []
  templateList.value = []
  if (!projectOptions.value.length) {
    loadProjectList()
  }
  dialogVisible.value = true
}

// 编辑
const handleEdit = async (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑用例'
  Object.assign(formData, {
    ...row,
    markFields: [],
    batchCount: 1,
    instanceJson: formatInstanceJson(row.instanceJson)
  })
  // 如果有项目ID，加载对应的API列表
  if (row.projectId) {
    await loadApiList(row.projectId)
  }
  if (row.apiId) {
    await Promise.all([
      loadTokenOptionsByApi(row.apiId, row.tokenId),
      loadTemplateList(row.apiId)
    ])
  }
  syncControlsFromJson(formData)
  dialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该用例吗?', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      const res = await apiTestcaseApi.deleteTestcase(row.instanceId)
      if (handleApiResponse(res, '删除成功', '删除失败')) {
        tableRef.value.refresh()
      }
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // 用户取消删除
  })
}

// 批量删除
const handleBatchDelete = (rows) => {
  if (rows.length === 0) {
    ElMessage.warning('请选择要删除的数据')
    return
  }

  ElMessageBox.confirm(`确认删除选中的 ${rows.length} 条用例吗?`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      const ids = rows.map(item => item.instanceId)
      const res = await apiTestcaseApi.batchDeleteTestcase(ids)
      if (handleApiResponse(res, '删除成功', '删除失败')) {
        tableRef.value.refresh()
      }
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // 用户取消删除
  })
}

// 提交表单
const handleSubmit = async () => {
  try {
    submitLoading.value = true
    let res
    const { markFields, batchCount, ...submitData } = formData
    if (isEdit.value) {
      res = await apiTestcaseApi.updateTestcase(submitData)
    } else {
      res = await apiTestcaseApi.addTestcase(submitData)
    }
    if (handleApiResponse(res, isEdit.value ? '更新成功' : '添加成功', '提交失败')) {
      dialogVisible.value = false
      tableRef.value.refresh()
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败')
  } finally {
    submitLoading.value = false
  }
}

// 页面加载时初始化
onMounted(() => {
  loadProjectList()
  tableRef.value.refresh()
})
</script>


